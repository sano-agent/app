/**
 * Fachada autenticada entre o painel principal e o domínio do Sano Agent.
 * O navegador envia apenas o token e dados da ação; o userId sempre vem da
 * sessão validada no servidor.
 */
function sanoClientApi(action, token, payload) {
  try {
    var principal = getSessionUser(String(token || ''));
    if (!principal) {
      return { success: false, code: 'AUTH_REQUIRED', error: 'Sessão inválida ou expirada.' };
    }

    payload = payload || {};
    var userId = String(principal.userId || principal.id || principal.username || '').trim();
    if (!userId) {
      return { success: false, code: 'AUTH_REQUIRED', error: 'A sessão não identifica o usuário.' };
    }

    var spreadsheetId = getSpreadsheetId();
    var diary = new DiaryService(spreadsheetId);
    var compositions = new CompositionService(spreadsheetId, getGeminiApiKey());
    var normalizedAction = String(action || '').trim();

    switch (normalizedAction) {
      case 'bootstrap':
        return sanoSuccess_({
          user: sanoPublicPrincipal_(principal, userId),
          stats: sanoStats_(diary, compositions, userId)
        });
      case 'stats.get':
        return sanoSuccess_(sanoStats_(diary, compositions, userId));
      case 'diary.list':
        return sanoSuccess_({
          entries: sanoDiaryRows_(diary.getUserDiaryEntries(userId)),
          statistics: diary.getDiaryStatistics(userId)
        });
      case 'diary.create':
        return sanoCreateDiaryEntry_(diary, userId, payload);
      case 'compositions.list':
        return sanoSuccess_({
          compositions: sanoCompositionRows_(compositions.getUserCompositions(userId)),
          statistics: compositions.getCompositionStatistics(userId)
        });
      case 'compositions.generate':
        return sanoGenerateComposition_(diary, compositions, userId, payload);
      case 'compositions.approve':
        return sanoApproveComposition_(diary, compositions, userId, payload);
      case 'goodThings.get':
        payload.userId = userId;
        return handleGoodThingsMirror(payload);
      default:
        return { success: false, code: 'UNKNOWN_ACTION', error: 'Ação não reconhecida.' };
    }
  } catch (error) {
    Logger.log('Erro em sanoClientApi: ' + (error && error.message));
    return { success: false, code: 'INTERNAL_ERROR', error: 'Não foi possível concluir a ação.' };
  }
}

function sanoSuccess_(data) {
  return { success: true, data: data };
}

function sanoPublicPrincipal_(principal, userId) {
  return {
    id: userId,
    username: String(principal.username || principal.nome || 'Usuário'),
    name: String(principal.nome || principal.name || principal.username || 'Usuário'),
    role: String(principal.role || 'student')
  };
}

function sanoStats_(diary, compositions, userId) {
  var diaryStats = diary.getDiaryStatistics(userId) || {};
  var compositionStats = compositions.getCompositionStatistics(userId) || {};
  return {
    diaryCount: Number(diaryStats.totalEntries || 0),
    compositionCount: Number(compositionStats.totalCompositions || 0),
    dominantMood: sanoLargestKey_(diaryStats.moods) || '-',
    favoriteGenre: sanoLargestKey_(compositionStats.byGenre) || '-'
  };
}

function sanoLargestKey_(counts) {
  counts = counts || {};
  var keys = Object.keys(counts);
  if (!keys.length) return '';
  keys.sort(function (a, b) { return Number(counts[b] || 0) - Number(counts[a] || 0); });
  return keys[0];
}

function sanoDiaryRows_(rows) {
  return (rows || []).map(function (row) {
    return {
      id: String(row[0] || ''),
      content: String(row[2] || ''),
      mood: String(row[3] || ''),
      category: String(row[4] || ''),
      createdAt: sanoDateString_(row[5]),
      status: String(row[6] || 'Pendente')
    };
  }).sort(function (a, b) { return b.createdAt.localeCompare(a.createdAt); });
}

function sanoCompositionRows_(rows) {
  return (rows || []).map(function (row) {
    return {
      id: String(row[0] || ''),
      entryId: String(row[2] || ''),
      genre: String(row[3] || ''),
      lyrics: String(row[4] || ''),
      createdAt: sanoDateString_(row[5]),
      status: String(row[6] || 'Ativa')
    };
  }).sort(function (a, b) { return b.createdAt.localeCompare(a.createdAt); });
}

function sanoDateString_(value) {
  return value instanceof Date ? value.toISOString() : String(value || '');
}

function sanoCreateDiaryEntry_(diary, userId, payload) {
  var content = String(payload.content || '').trim();
  if (content.length < 3) {
    return { success: false, code: 'INVALID_CONTENT', error: 'Escreva um pensamento com pelo menos 3 caracteres.' };
  }
  if (content.length > 1200) {
    return { success: false, code: 'INVALID_CONTENT', error: 'O pensamento deve ter no máximo 1200 caracteres.' };
  }
  var result = diary.createDiaryEntry(
    userId,
    content,
    String(payload.mood || 'Feliz').slice(0, 40),
    String(payload.category || 'Geral').slice(0, 60)
  );
  if (!result || result.success === false) return result;
  return sanoSuccess_({ entryId: result.entryId, message: result.message });
}

function sanoGenerateComposition_(diary, compositions, userId, payload) {
  var entryId = String(payload.entryId || '').trim();
  var entry = diary.getDiaryEntry(entryId);
  if (!entry || String(entry[1] || '') !== userId) {
    return { success: false, code: 'NOT_FOUND', error: 'Entrada de diário não encontrada.' };
  }
  var genre = String(payload.genre || 'Auto');
  if (['Auto', 'Rock', 'Tropicália'].indexOf(genre) === -1) {
    return { success: false, code: 'INVALID_GENRE', error: 'Gênero musical inválido.' };
  }
  try {
    ConsentService.check(userId, 'generative');
  } catch (consentError) {
    if (consentError && consentError.isConsentError) {
      return { success: false, code: 'CONSENT_REQUIRED', error: 'É necessário consentimento válido para usar este diário na geração por IA.' };
    }
    throw consentError;
  }
  var result = compositions.generateDraft(entryId, genre);
  if (!result || result.success === false) return result;
  var decorated = HumanReviewService.decorateResult(
    sanoCompositionUseCase_(userId, entryId, result.genre),
    {
    genre: result.genre,
    message: result.message
    },
    result.lyrics
  );
  return sanoSuccess_(decorated);
}

function sanoApproveComposition_(diary, compositions, userId, payload) {
  var entryId = String(payload.entryId || '').trim();
  var genre = String(payload.genre || '').trim();
  var draftId = String(payload.draftId || '').trim();
  var version = String(payload.version || '').trim();
  var lyrics = String(payload.lyrics || '').trim();
  var entry = diary.getDiaryEntry(entryId);
  if (!entry || String(entry[1] || '') !== userId) {
    return { success: false, code: 'NOT_FOUND', error: 'Entrada de diário não encontrada.' };
  }
  if (['Rock', 'Tropicália'].indexOf(genre) === -1 || !draftId || !version || !lyrics || lyrics.length > 6000) {
    return { success: false, code: 'INVALID_REVIEW', error: 'Rascunho incompleto para aprovação.' };
  }

  var draft = HumanReviewService.get(draftId);
  if (draft.useCase !== sanoCompositionUseCase_(userId, entryId, genre)) {
    return { success: false, code: 'REVIEW_FORBIDDEN', error: 'Este rascunho não pertence a esta composição.' };
  }
  if (draft.version !== version) {
    return { success: false, code: 'STALE_REVIEW', error: 'O rascunho mudou; gere ou revise novamente.' };
  }
  if (String(draft.content || '') !== lyrics) {
    draft = HumanReviewService.editDraft(draftId, lyrics, userId);
  }
  draft = HumanReviewService.approve(draftId, draft.version, userId);
  HumanReviewService.assertApproved(draftId, draft.version);
  var saved = compositions.saveApprovedComposition(entryId, userId, genre, draft.content);
  if (!saved || saved.success === false) return saved;
  return sanoSuccess_(saved);
}

function sanoCompositionUseCase_(userId, entryId, genre) {
  return ['sano.composition', userId, entryId, genre].join(':').slice(0, 100);
}
