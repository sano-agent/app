/**
 * @fileoverview web_service.gs
 * @description Serviço web para comunicação entre frontend HTML e backend GAS.
 * Implementa endpoints para autenticação, diário e composições.
 * @author SanoAgent Team
 * @version 1.0.0
 */

/**
 * Manipulador POST para requisições do web app
 * @param {Object} e - Evento de requisição
 * @returns {HtmlOutput} Resposta JSON
 */
function doPost(e) {
  try {
    try {
      try {
        const params = (e && e.parameter) || {};
        const rawBody = e && e.postData && e.postData.contents;
        const data = rawBody ? JSON.parse(rawBody) : Object.assign({}, params);
        // Integrações antigas enviam a ação na query string; clientes REST
        // costumam colocá-la no próprio JSON. Aceitamos os dois formatos.
        const action = String((data && data.action) || params.action || '').trim();

        // Login e cadastro sao publicos; qualquer operacao sobre dados exige
        // um token emitido por loginWithToken e usa o usuario da sessao.
        if (['login', 'register'].indexOf(action) === -1) {
          const token = resolveAuthTokenFromPayload_(data) ||
            resolveAuthTokenFromPayload_({
              _authToken: params._authToken,
              tok: params.tok,
              sessionToken: params.sessionToken,
              token: params.token
            });
          const principal = token ? getSessionUser(token) : null;
          if (!principal) {
            return ContentService
              .createTextOutput(JSON.stringify({ success: false, code: 'AUTH_REQUIRED', error: 'Sessao invalida ou expirada.' }))
              .setMimeType(ContentService.MimeType.JSON);
          }
          data.userId = String(principal.userId || principal.id || principal.username || '').trim();
          if (!data.userId) {
            return ContentService
              .createTextOutput(JSON.stringify({ success: false, code: 'AUTH_REQUIRED', error: 'A sessao nao identifica o usuario.' }))
              .setMimeType(ContentService.MimeType.JSON);
          }
        }

        let response = {};

        switch (action) {
          case 'login':
            response = handleLogin(data);
            break;
          case 'register':
            response = handleRegister(data);
            break;
          case 'createDiaryEntry':
            response = handleCreateDiaryEntry(data);
            break;
          case 'getDiaryEntries':
            response = handleGetDiaryEntries(data);
            break;
          case 'generateComposition':
            response = handleGenerateComposition(data);
            break;
          case 'getCompositions':
            response = handleGetCompositions(data);
            break;
          case 'getStatistics':
            response = handleGetStatistics(data);
            break;
          case 'goodThingsMirror':
            response = handleGoodThingsMirror(data);
            break;
          default:
            response = { success: false, error: 'Ação não reconhecida' };
        }

        return ContentService
          .createTextOutput(JSON.stringify(response))
          .setMimeType(ContentService.MimeType.JSON);
      } catch (error) {
        return ContentService
          .createTextOutput(JSON.stringify({ success: false, error: error.message }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    } catch (error) {
      Logger.log("Erro em doPost: " + error.message);
      throw error;
    }
  } catch (error) {
    Logger.log("Erro em doPost: " + error.message);
    throw error;
  }
}

/**
 * Manipulador GET para requisições simples
 * @param {Object} e - Evento de requisição
 * @returns {HtmlOutput} Resposta
 */
function doGet(e) {
  // FLEET_FRAGMENT_BOOTSTRAP: o token fica no fragmento (#tok=), que não é
  // enviado ao servidor. O shell valida o token antes de chamar qualquer API.
  var fleetRequestedPage = e && e.parameter ? String(e.parameter.page || '') : '';
  var fleetBootstrapPage = fleetRequestedPage === 'app' || fleetRequestedPage === 'calendar';
  var fleetBootstrapToken = e && e.parameter && e.parameter.tok;
  if (fleetBootstrapPage && !fleetBootstrapToken) {
    var fleetTemplates = fleetRequestedPage === 'calendar' ? ['calendar'] : ['Index', 'index', 'Dashboard'];
    for (var fleetI = 0; fleetI < fleetTemplates.length; fleetI++) {
      try {
        var fleetTemplate = HtmlService.createTemplateFromFile(fleetTemplates[fleetI]);
        fleetTemplate.authToken = '';
        fleetTemplate.tok = '';
        fleetTemplate.sessionUser = {};
        fleetTemplate.data = { scriptUrl: ScriptApp.getService().getUrl() };
        return fleetTemplate.evaluate()
          .setTitle('Sano Agent - Quem canta seus males espanta')
          .addMetaTag('viewport', 'width=device-width, initial-scale=1');
      } catch (fleetTemplateError) {}
    }
    return HtmlService.createHtmlOutput('Aplicação indisponível.');
  }
  try {
    var params = e && e.parameter ? e.parameter : {};
    var tok = params.tok || '';

    if (params.page === 'login' || !isAuthenticatedByToken(tok)) {
      return HtmlService.createTemplateFromFile('Login').evaluate()
        .setTitle('SanoAgent | Login')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }

    var templateName = params.page === 'calendar' ? 'calendar' : 'Index';
    var template = HtmlService.createTemplateFromFile(templateName);
    template.authToken = tok;
    template.sessionUser = getSessionUser(tok) || {};
    template.data = { scriptUrl: ScriptApp.getService().getUrl() };
    return template.evaluate()
      .setTitle(params.page === 'calendar' ? 'SanoAgent | Calendário' : 'SanoAgent')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (error) {
    Logger.log("Erro em doGet: " + error.message);
    throw error;
  }
}


function include(filename) {
  try {
    return HtmlService.createTemplateFromFile(filename).evaluate().getContent();
  } catch (error) {
    Logger.log("Erro em include: " + error.message);
    throw error;
  }
}

/**
 * Manipula login de usuário
 * @param {Object} data - Dados de login
 * @returns {Object} Resultado
 */
function handleLogin(data) {
  try {
    const result = loginWithToken(data && data.username, data && data.password);
    if (!result || result.success === false) return result || { success: false, error: 'Credenciais invalidas.' };
    const user = result.user || {};
    return {
      success: true,
      userId: String(user.id || user.userId || user.username || ''),
      userName: String(user.username || user.nome || user.name || ''),
      sessionToken: result.token,
      token: result.token,
      message: result.message || 'Login realizado com sucesso'
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Manipula registro de novo usuário
 * @param {Object} data - Dados de registro
 * @returns {Object} Resultado
 */
function handleRegister(data) {
  try {
    const spreadsheetId = getSpreadsheetId();
    const authService = new AuthService(spreadsheetId);

    return authService.registerUser(data.username, data.password, 'student');
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Manipula criação de entrada de diário
 * @param {Object} data - Dados da entrada (userId DEVE vir de doPost validado)
 * @returns {Object} Resultado
 * @private - NÃO expor via google.script.run (vulnerável a escalação)
 */
function handleCreateDiaryEntry(data) {
  // BLOQUEIO: rejeita chamadas diretas sem userId validado pelo doPost
  if (!data || !data.userId || typeof data.userId !== 'string') {
    return { success: false, code: 'AUTH_REQUIRED', error: 'userId deve ser derivado da sessao autenticada.' };
  }
  try {
    const spreadsheetId = getSpreadsheetId();
    const diaryService = new DiaryService(spreadsheetId);

    const result = diaryService.createDiaryEntry(
      data.userId,
      data.content,
      data.mood || 'Feliz',
      data.category || 'Geral'
    );

    if (result.success) {
      const authService = new AuthService(spreadsheetId);
      authService.logAccess(data.userId, 'CREATE_ENTRY', `Entrada criada: ${result.entryId}`);
    }

    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Manipula obtenção de entradas de diário
 * @param {Object} data - Dados da requisição (userId DEVE vir de doPost validado)
 * @returns {Object} Resultado
 * @private - NÃO expor via google.script.run (vulnerável a escalação)
 */
function handleGetDiaryEntries(data) {
  // BLOQUEIO: rejeita chamadas diretas sem userId validado pelo doPost
  if (!data || !data.userId || typeof data.userId !== 'string') {
    return { success: false, code: 'AUTH_REQUIRED', error: 'userId deve ser derivado da sessao autenticada.' };
  }
  try {
    const spreadsheetId = getSpreadsheetId();
    const diaryService = new DiaryService(spreadsheetId);

    const entries = diaryService.getUserDiaryEntries(data.userId);
    const statistics = diaryService.getDiaryStatistics(data.userId);

    return {
      success: true,
      entries: entries,
      statistics: statistics
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Manipula geração de composição
 * @param {Object} data - Dados da requisição (userId DEVE vir de doPost validado)
 * @returns {Object} Resultado
 * @private - NÃO expor via google.script.run (vulnerável a escalação)
 */
function handleGenerateComposition(data) {
  // BLOQUEIO: rejeita chamadas diretas sem userId validado pelo doPost
  if (!data || !data.userId || typeof data.userId !== 'string') {
    return { success: false, code: 'AUTH_REQUIRED', error: 'userId deve ser derivado da sessao autenticada.' };
  }
  try {
    const spreadsheetId = getSpreadsheetId();
    const geminiKey = getGeminiApiKey();
    const compositionService = new CompositionService(spreadsheetId, geminiKey);

    const result = compositionService.processComposition(
      data.entryId,
      data.genre || 'Auto'
    );

    if (result.success) {
      const authService = new AuthService(spreadsheetId);
      authService.logAccess(data.userId, 'GENERATE_COMPOSITION', `Composição: ${result.compositionId}`);
    }

    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Manipula obtenção de composições
 * @param {Object} data - Dados da requisição (userId DEVE vir de doPost validado)
 * @returns {Object} Resultado
 * @private - NÃO expor via google.script.run (vulnerável a escalação)
 */
function handleGetCompositions(data) {
  // BLOQUEIO: rejeita chamadas diretas sem userId validado pelo doPost
  if (!data || !data.userId || typeof data.userId !== 'string') {
    return { success: false, code: 'AUTH_REQUIRED', error: 'userId deve ser derivado da sessao autenticada.' };
  }
  try {
    const spreadsheetId = getSpreadsheetId();
    const geminiKey = getGeminiApiKey();
    const compositionService = new CompositionService(spreadsheetId, geminiKey);

    const compositions = compositionService.getUserCompositions(data.userId);
    const statistics = compositionService.getCompositionStatistics(data.userId);

    return {
      success: true,
      compositions: compositions,
      statistics: statistics
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Espelho dos Três Bons Momentos — prática "three good things" (Seligman),
 * pilar da psicologia positiva que fundamenta o SanoAgent: revisitar e
 * saborear momentos bons fortalece o bem-estar. A função relê as entradas
 * recentes do diário da criança, destaca 3 bons momentos e devolve uma
 * reflexão acolhedora + 1 pergunta de gratidão.
 *
 * Com GEMINI_API_KEY a síntese é da IA (mesma GeminiIntegration das letras —
 * o diário já alimenta a IA no fluxo de composição, nada novo sai do app);
 * sem a chave, degrada para um espelho local com as entradas mais recentes.
 *
 * @param {Object} data - { userId } (DEVE vir de doPost/sanoClientApi validado)
 * @returns {Object} { success, moments, reflexao, pergunta, fonte }
 * @private - NÃO expor via google.script.run (vulnerável a escalação)
 */
function handleGoodThingsMirror(data) {
  // BLOQUEIO: rejeita chamadas diretas sem userId validado
  if (!data || !data.userId || typeof data.userId !== 'string') {
    return { success: false, code: 'AUTH_REQUIRED', error: 'userId deve ser derivado da sessao autenticada.' };
  }
  try {
    try {
      const spreadsheetId = getSpreadsheetId();
      const diaryService = new DiaryService(spreadsheetId);

      // Entradas cruas: [entryId, userId, content, mood, category, timestamp, ...]
      const entries = (diaryService.getUserDiaryEntries(data.userId) || [])
        .map(function (row) {
          return {
            content: String(row[2] || '').trim(),
            mood: String(row[3] || '').trim(),
            category: String(row[4] || '').trim(),
            timestamp: String(row[5] || '')
          };
        })
        .filter(function (e) { return e.content; })
        .sort(function (a, b) { return b.timestamp.localeCompare(a.timestamp); })
        .slice(0, 10);

      if (entries.length === 0) {
        return {
          success: true,
          moments: [],
          reflexao: 'Seu diário ainda está vazio. Registre um pensamento bom hoje e volte aqui para rever seus melhores momentos!',
          pergunta: 'Qual foi a melhor coisa que aconteceu com você hoje?',
          fonte: 'local'
        };
      }

      const geminiKey = getGeminiApiKey();
      if (geminiKey) {
        const gemini = new GeminiIntegration(geminiKey);
        const prompt = [
          'Você é uma educadora afetuosa praticando o exercício "três coisas boas"',
          '(psicologia positiva) com uma criança de 9-10 anos, a partir do diário',
          'de pensamentos bons dela.',
          '',
          'Entradas recentes do diário (conteúdo | humor | categoria):',
          entries.map(function (e, i) {
            return (i + 1) + '. ' + e.content + ' | ' + (e.mood || '-') + ' | ' + (e.category || '-');
          }).join('\n'),
          '',
          'Responda em português do Brasil, EXATAMENTE neste formato de linhas:',
          '- [primeiro bom momento, reescrito em 1 frase calorosa na 2ª pessoa]',
          '- [segundo bom momento, idem]',
          '- [terceiro bom momento, idem]',
          'REFLEXAO: [2 a 3 frases acolhedoras convidando a criança a saborear',
          'esses momentos e perceber o que eles têm em comum]',
          'PERGUNTA: [1 pergunta de gratidão curta para a criança responder no',
          'próximo registro do diário]',
          'Use somente o que está nas entradas; não invente fatos; sem markdown',
          'além dos prefixos pedidos.'
        ].join('\n');

        const ai = gemini.callGeminiApi(prompt);
        if (ai && ai.success && ai.lyrics) {
          const moments = [];
          let reflexao = '';
          let pergunta = '';
          String(ai.lyrics).split('\n').forEach(function (linha) {
            const l = linha.trim();
            if (l.indexOf('- ') === 0 && moments.length < 3) {
              moments.push(l.replace(/^-\s*/, '').trim());
            } else if (/^REFLEXAO\s*:/i.test(l)) {
              reflexao = l.replace(/^REFLEXAO\s*:\s*/i, '').trim();
            } else if (/^PERGUNTA\s*:/i.test(l)) {
              pergunta = l.replace(/^PERGUNTA\s*:\s*/i, '').trim();
            }
          });
          if (moments.length > 0 && reflexao) {
            return {
              success: true,
              moments: moments,
              reflexao: reflexao,
              pergunta: pergunta || 'Qual desses momentos você gostaria de viver de novo? Por quê?',
              fonte: 'gemini'
            };
          }
        }
      }

      // Espelho local determinístico: as 3 entradas mais recentes, sem IA.
      return {
        success: true,
        moments: entries.slice(0, 3).map(function (e) {
          return e.content.slice(0, 160) + (e.mood ? ' (você se sentiu: ' + e.mood + ')' : '');
        }),
        reflexao: 'Releia esses momentos com calma e deixe a sensação boa durar um pouquinho. Perceba: você ajudou a criar cada um deles.',
        pergunta: 'Qual desses momentos você gostaria de viver de novo? Por quê?',
        fonte: 'local'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  } catch (error) {
    Logger.log("Erro em handleGoodThingsMirror: " + error.message);
    throw error;
  }
}

/**
 * Manipula obtenção de estatísticas
 * @param {Object} data - Dados da requisição (userId DEVE vir de doPost validado)
 * @returns {Object} Resultado
 * @private - NÃO expor via google.script.run (vulnerável a escalação)
 */
function handleGetStatistics(data) {
  // BLOQUEIO: rejeita chamadas diretas sem userId validado pelo doPost
  if (!data || !data.userId || typeof data.userId !== 'string') {
    return { success: false, code: 'AUTH_REQUIRED', error: 'userId deve ser derivado da sessao autenticada.' };
  }
  try {
    const spreadsheetId = getSpreadsheetId();
    const diaryService = new DiaryService(spreadsheetId);
    const geminiKey = getGeminiApiKey();
    const compositionService = new CompositionService(spreadsheetId, geminiKey);

    const diaryStats = diaryService.getDiaryStatistics(data.userId);
    const compositionStats = compositionService.getCompositionStatistics(data.userId);

    return {
      success: true,
      diary: diaryStats,
      compositions: compositionStats
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Retorna o aplicativo principal HTML
 * @returns {string} HTML do aplicativo
 */
function getMainApp() {
  try {
    return HtmlService.createHtmlOutput(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>SanoAgent - Sistema de Composição Musical</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
        <h1>SanoAgent</h1>
        <p>Sistema de Composição Musical Mediada por IA</p>
        <p>Carregando aplicação...</p>
        <script>
          // Carrega o aplicativo principal
          window.location.href = '?action=getApp';
        </script>
      </body>
      </html>
    `).getContent();
  } catch (error) {
    Logger.log("Erro em getMainApp: " + error.message);
    throw error;
  }
}

/**
 * Compacta dados estáticos para uso em data URLs (como logos base64)
 * Remove todos os espaços em branco para otimizar o tamanho
 */
function includeInlineData(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent().replace(/\s+/g, '');
}

/**
 * Compacta dados estáticos para uso em data URLs (como logos base64)
 * Remove todos os espaços em branco para otimizar o tamanho
 */
function includeInlineData(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent().replace(/\s+/g, '');
}
