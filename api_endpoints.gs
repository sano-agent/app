/**
 * @fileoverview api_endpoints.gs
 * @description Endpoints adicionais da API do SanoAgent.
 * Implementa rotas para operações avançadas, com validação de payload,
 * controle de rate-limiting por sessão e respostas padronizadas.
 * @author SanoAgent Team
 * @version 1.1.0
 */

// ---------------------------------------------------------------------------
// Helpers de resposta padronizada
// ---------------------------------------------------------------------------

/**
 * Constrói uma resposta JSON para o ContentService.
 * @param {Object}  body       - Objeto a serializar.
 * @param {number}  [code=200] - Código HTTP semântico (apenas para logging; GAS não usa).
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function _jsonResponse(body, code = 200) {
  try {
    if (code >= 400) {
      LoggerService.info(`[API] ${code} — ${JSON.stringify(body)}`);
    }
    return ContentService
      .createTextOutput(JSON.stringify(body))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log("Erro em _jsonResponse: " + error.message);
    throw error;
  }
}

/**
 * Cria um objeto de erro padronizado.
 * @param {string} message  - Mensagem legível.
 * @param {string} [code]   - Código de erro interno (ex.: 'MISSING_PARAM').
 * @returns {Object}
 */
function _errorBody(message, code = 'INTERNAL_ERROR') {
  return { success: false, error: message, errorCode: code };
}

// ---------------------------------------------------------------------------
// Validação de payload
// ---------------------------------------------------------------------------

/**
 * Verifica se todos os campos obrigatórios existem e não estão vazios.
 * @param {Object}   data     - Payload da requisição.
 * @param {string[]} required - Nomes dos campos obrigatórios.
 * @returns {{ valid: boolean, missing: string[] }}
 */
function _validatePayload(data, required) {
  try {
    const missing = required.filter(k => !data[k] || String(data[k]).trim() === '');
    return { valid: missing.length === 0, missing };
  } catch (error) {
    Logger.log("Erro em _validatePayload: " + error.message);
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Rate limiting simples por CacheService
// ---------------------------------------------------------------------------

const RATE_LIMIT_MAX     = 60;   // requisições por janela
const RATE_LIMIT_WINDOW  = 60;   // segundos

/**
 * Verifica e aplica rate limiting para um userId.
 * @param {string} userId
 * @returns {boolean} true se a requisição está dentro do limite.
 */
function _checkRateLimit(userId) {
  if (!userId) return true; // sem userId, não aplica

  try {
    const cache  = CacheService.getScriptCache();
    const key    = `rl_${userId}`;
    const stored = cache.get(key);
    const count  = stored ? parseInt(stored, 10) : 0;

    if (count >= RATE_LIMIT_MAX) {
      LoggerService.info(`[RateLimit] userId="${userId}" excedeu ${RATE_LIMIT_MAX} req/${RATE_LIMIT_WINDOW}s`);
      return false;
    }

    cache.put(key, String(count + 1), RATE_LIMIT_WINDOW);
    return true;
  } catch (_) {
    return true; // falha segura: permite a requisição
  }
}

// ---------------------------------------------------------------------------
// Router principal
// ---------------------------------------------------------------------------

/**
 * Manipulador de requisições API avançadas.
 * Roteamento por `action` no query param; payload via POST body.
 * @param {GoogleAppsScript.Events.DoPost} e - Evento de requisição.
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function handleAdvancedApi(e) {
  try {
    const action = (e.parameter && e.parameter.action) || '';

    if (!action) {
      return _jsonResponse(_errorBody('Parâmetro "action" ausente.', 'MISSING_ACTION'), 400);
    }

    let data = {};
    try {
      data = e.postData && e.postData.contents
        ? JSON.parse(e.postData.contents)
        : {};
    } catch (_) {
      return _jsonResponse(_errorBody('Payload JSON inválido.', 'INVALID_JSON'), 400);
    }

    // Rate limiting por userId quando disponível
    if (!_checkRateLimit(data.userId)) {
      return _jsonResponse(
        _errorBody('Limite de requisições excedido. Tente novamente em instantes.', 'RATE_LIMIT'),
        429
      );
    }

    const ROUTES = {
      analytics:       () => handleAnalyticsRequest(data),
      recommendations: () => handleRecommendationsRequest(data),
      export:          () => handleExportRequest(data),
      reports:         () => handleReportsRequest(data),
      admin:           () => handleAdminRequest(data),
      health:          () => healthCheck(),
      version:         () => getSystemVersionInfo(),
    };

    const handler = ROUTES[action];
    if (!handler) {
      return _jsonResponse(_errorBody(`Ação não reconhecida: "${action}"`, 'UNKNOWN_ACTION'), 404);
    }

    return _jsonResponse(handler());

  } catch (err) {
    LoggerService.error(`[API] Erro não tratado: ${err.message}
${err.stack || ''}`);
    return _jsonResponse(_errorBody('Erro interno do servidor.', 'INTERNAL_ERROR'), 500);
  }
}

// ---------------------------------------------------------------------------
// Handlers individuais
// ---------------------------------------------------------------------------

/**
 * Analisa padrões de escrita, tendência temporal ou jornada emocional.
 * @param {Object} data
 * @param {string} data.userId
 * @param {string} data.type - 'writing_patterns' | 'temporal_trend' | 'emotional_journey'
 * @returns {Object}
 */
function handleAnalyticsRequest(data) {
  try {
    const check = _validatePayload(data, ['userId', 'type']);
    if (!check.valid) {
      return _errorBody(`Campos obrigatórios ausentes: ${check.missing.join(', ')}`, 'MISSING_PARAM');
    }

    const { userId, type } = data;
    const service = new AnalyticsService(getSpreadsheetId());

    const ANALYSIS_MAP = {
      writing_patterns: () => service.analyzeWritingPatterns(userId),
      temporal_trend:   () => service.analyzeTemporalTrend(userId),
      emotional_journey:() => service.analyzeEmotionalJourney(userId),
    };

    if (!ANALYSIS_MAP[type]) {
      return _errorBody(`Tipo de análise desconhecido: "${type}"`, 'UNKNOWN_TYPE');
    }

    return { success: true, analysis: ANALYSIS_MAP[type]() };

  } catch (err) {
    LoggerService.error(`[Analytics] ${err.message}`);
    return _errorBody(err.message);
  }
}

/**
 * Gera recomendações gerais, de gênero ou próximos passos.
 * @param {Object} data
 * @param {string} data.userId
 * @param {string} [data.type='general']
 * @returns {Object}
 */
function handleRecommendationsRequest(data) {
  try {
    const check = _validatePayload(data, ['userId']);
    if (!check.valid) {
      return _errorBody('userId é obrigatório.', 'MISSING_PARAM');
    }

    const { userId, type = 'general' } = data;
    const engine = new RecommendationEngine(getSpreadsheetId());

    const RECO_MAP = {
      general:    () => engine.generateRecommendations(userId),
      genre:      () => engine.recommendGenre(userId),
      next_steps: () => ({ nextSteps: engine.suggestNextSteps(userId) }),
    };

    if (!RECO_MAP[type]) {
      return _errorBody(`Tipo de recomendação desconhecido: "${type}"`, 'UNKNOWN_TYPE');
    }

    return { success: true, recommendations: RECO_MAP[type]() };

  } catch (err) {
    LoggerService.error(`[Recommendations] ${err.message}`);
    return _errorBody(err.message);
  }
}

/**
 * Exporta dados do usuário em CSV ou JSON.
 * @param {Object} data
 * @param {string} data.userId
 * @param {string} [data.format='csv'] - 'csv' | 'json'
 * @returns {Object}
 */
function handleExportRequest(data) {
  try {
    const check = _validatePayload(data, ['userId']);
    if (!check.valid) {
      return _errorBody('userId é obrigatório.', 'MISSING_PARAM');
    }

    const { userId, format = 'csv' } = data;
    const spreadsheetId = getSpreadsheetId();

    if (format === 'csv') {
      const exportService = new ExportService(spreadsheetId);
      return exportService.exportCompositionsAsDocument(userId);
    }

    if (format === 'json') {
      const diaryService = new DiaryService(spreadsheetId);
      return { success: true, data: diaryService.exportDiaryAsJson(userId) };
    }

    return _errorBody(`Formato de exportação desconhecido: "${format}"`, 'UNKNOWN_FORMAT');

  } catch (err) {
    LoggerService.error(`[Export] ${err.message}`);
    return _errorBody(err.message);
  }
}

/**
 * Gera relatórios de atividade, sistema, gêneros ou moods.
 * @param {Object} data
 * @param {string} data.type - 'user_activity' | 'system' | 'genres' | 'moods'
 * @param {string} [data.userId]
 * @returns {Object}
 */
function handleReportsRequest(data) {
  try {
    const check = _validatePayload(data, ['type']);
    if (!check.valid) {
      return _errorBody('Parâmetro "type" é obrigatório.', 'MISSING_PARAM');
    }

    const { type, userId } = data;
    const generator = new ReportGenerator(getSpreadsheetId());

    const REPORT_MAP = {
      user_activity: () => {
        if (!userId) throw new Error('userId é obrigatório para relatório user_activity.');
        return generator.generateUserActivityReport(userId);
      },
      system: () => generator.generateSystemReport(),
      genres: () => generator.generateGenreReport(),
      moods:  () => generator.generateMoodReport(),
    };

    if (!REPORT_MAP[type]) {
      return _errorBody(`Tipo de relatório desconhecido: "${type}"`, 'UNKNOWN_TYPE');
    }

    return { success: true, report: REPORT_MAP[type]() };

  } catch (err) {
    LoggerService.error(`[Reports] ${err.message}`);
    return _errorBody(err.message);
  }
}

/**
 * Manipula ações administrativas do sistema.
 * @param {Object} data
 * @param {string} data.action - 'system_status' | 'validate_config' | 'get_triggers' | 'security_report'
 * @returns {Object}
 */
function handleAdminRequest(data) {
  try {
    const check = _validatePayload(data, ['action']);
    if (!check.valid) {
      return _errorBody('action administrativa é obrigatória.', 'MISSING_PARAM');
    }

    const { action } = data;

    const ADMIN_MAP = {
      system_status:   () => showSystemStatus(),
      validate_config: () => validateSystemConfiguration(),
      get_triggers:    () => ({ triggers: getTriggerInfo() }),
      security_report: () => {
        const audit = new SecurityAudit(getSpreadsheetId());
        return audit.generateSecurityReport();
      },
    };

    if (!ADMIN_MAP[action]) {
      return _errorBody(`Ação administrativa desconhecida: "${action}"`, 'UNKNOWN_ADMIN_ACTION');
    }

    return { success: true, data: ADMIN_MAP[action]() };

  } catch (err) {
    LoggerService.error(`[Admin] ${err.message}`);
    return _errorBody(err.message);
  }
}

// ---------------------------------------------------------------------------
// Endpoints utilitários
// ---------------------------------------------------------------------------

/**
 * Health check do sistema.
 * Valida configuração crítica e retorna status operacional.
 * @returns {{ status: string, timestamp: string, validation: Object }}
 */
function healthCheck() {
  try {
    try {
      const validation = validateCriticalProperties();
      return {
        status: validation.valid ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        validation,
      };
    } catch (err) {
      return { status: 'error', error: err.message, timestamp: new Date().toISOString() };
    }
  } catch (error) {
    Logger.log("Erro em healthCheck: " + error.message);
    throw error;
  }
}

/**
 * Retorna informações imutáveis de versão do sistema.
 * @returns {Object}
 */
function getSystemVersionInfo() {
  return {
    name:        'SanoAgent',
    version:     '1.1.0',
    description: 'Sistema de Composição Musical Mediada por IA',
    author:      'SanoAgent Team',
    releaseDate: '2024-04-15',
    features: [
      'Gerenciamento de Diário',
      'Integração com Gemini API',
      'Composição Musical Automática',
      'Análise de Dados',
      'Recomendações Personalizadas',
      'Exportação de Dados (CSV/JSON)',
      'Relatórios Detalhados',
      'Rate Limiting por Sessão',
    ],
  };
}
