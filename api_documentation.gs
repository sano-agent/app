/**
 * @fileoverview api_documentation.gs
 * @description Documentação, status e validação da API do SanoAgent.
 * Fornece specs de endpoints, guia de uso, changelog e health-check real
 * que delega para healthCheck() em api_endpoints.gs.
 * @author SanoAgent Team
 * @version 1.1.0
 */

// ---------------------------------------------------------------------------
// Definição estruturada dos endpoints
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} EndpointSpec
 * @property {string}   method
 * @property {string}   path
 * @property {string}   description
 * @property {string[]} requiredParams
 * @property {string[]} [optionalParams]
 * @property {Object}   responseShape
 */

/** @const {Object.<string, EndpointSpec>} Especificação completa dos endpoints */
const API_ENDPOINTS_SPEC = Object.freeze({

  // ── Autenticação ───────────────────────────────────────────────────────────
  'auth/login': {
    method:         'POST',
    path:           '/api/auth/login',
    description:    'Autentica usuário e retorna sessionToken.',
    requiredParams: ['username', 'password'],
    responseShape:  { success: 'boolean', userId: 'string', sessionToken: 'string', message: 'string' },
  },

  'auth/register': {
    method:         'POST',
    path:           '/api/auth/register',
    description:    'Registra novo usuário no sistema.',
    requiredParams: ['username', 'password'],
    optionalParams: ['email', 'role'],
    responseShape:  { success: 'boolean', userId: 'string', message: 'string' },
  },

  'auth/logout': {
    method:         'POST',
    path:           '/api/auth/logout',
    description:    'Encerra a sessão do usuário.',
    requiredParams: ['userId', 'sessionToken'],
    responseShape:  { success: 'boolean', message: 'string' },
  },

  // ── Diário ────────────────────────────────────────────────────────────────
  'diary/create': {
    method:         'POST',
    path:           '/api/diary/create',
    description:    'Cria nova entrada de diário e inicia pipeline de composição.',
    requiredParams: ['userId', 'content', 'mood', 'category'],
    responseShape:  { success: 'boolean', entryId: 'string', message: 'string' },
  },

  'diary/get': {
    method:         'POST',
    path:           '/api/diary/get',
    description:    'Lista entradas de diário do usuário com estatísticas.',
    requiredParams: ['userId'],
    optionalParams: ['page', 'pageSize'],
    responseShape:  { success: 'boolean', entries: 'array', statistics: 'object' },
  },

  // ── Composição ────────────────────────────────────────────────────────────
  'composition/generate': {
    method:         'POST',
    path:           '/api/composition/generate',
    description:    'Gera letra musical a partir de uma entrada de diário via Gemini.',
    requiredParams: ['userId', 'entryId', 'genre'],
    responseShape:  { success: 'boolean', compositionId: 'string', genre: 'string', lyrics: 'string', message: 'string' },
  },

  'composition/get': {
    method:         'POST',
    path:           '/api/composition/get',
    description:    'Lista composições do usuário.',
    requiredParams: ['userId'],
    optionalParams: ['genre', 'page', 'pageSize'],
    responseShape:  { success: 'boolean', compositions: 'array', statistics: 'object' },
  },

  // ── Analítica ─────────────────────────────────────────────────────────────
  'analytics': {
    method:         'POST',
    path:           '/api/analytics',
    description:    'Análise de dados: padrões de escrita, tendência temporal, jornada emocional.',
    requiredParams: ['userId', 'type'],
    responseShape:  { success: 'boolean', analysis: 'object' },
    notes:          'type: "writing_patterns" | "temporal_trend" | "emotional_journey"',
  },

  // ── Recomendações ─────────────────────────────────────────────────────────
  'recommendations': {
    method:         'POST',
    path:           '/api/recommendations',
    description:    'Recomendações personalizadas de gênero e próximos passos.',
    requiredParams: ['userId'],
    optionalParams: ['type'],
    responseShape:  { success: 'boolean', recommendations: 'object' },
    notes:          'type: "general" (default) | "genre" | "next_steps"',
  },

  // ── Relatórios ─────────────────────────────────────────────────────────────
  'reports': {
    method:         'POST',
    path:           '/api/reports',
    description:    'Relatórios de atividade de usuário, sistema, gêneros e moods.',
    requiredParams: ['type'],
    optionalParams: ['userId'],
    responseShape:  { success: 'boolean', report: 'object' },
    notes:          'type: "user_activity" | "system" | "genres" | "moods"',
  },

  // ── Exportação ────────────────────────────────────────────────────────────
  'export': {
    method:         'POST',
    path:           '/api/export',
    description:    'Exporta dados do usuário em CSV ou JSON.',
    requiredParams: ['userId'],
    optionalParams: ['format'],
    responseShape:  { success: 'boolean', fileId: 'string', url: 'string' },
    notes:          'format: "csv" (default) | "json"',
  },

  // ── Utilitários ───────────────────────────────────────────────────────────
  'health': {
    method:         'POST',
    path:           '/api/health',
    description:    'Health check do sistema — valida configuração crítica.',
    requiredParams: [],
    responseShape:  { status: 'string', timestamp: 'string', validation: 'object' },
  },

  'version': {
    method:         'POST',
    path:           '/api/version',
    description:    'Retorna informações de versão e funcionalidades disponíveis.',
    requiredParams: [],
    responseShape:  { name: 'string', version: 'string', features: 'array' },
  },
});

// ---------------------------------------------------------------------------
// Funções de acesso à spec
// ---------------------------------------------------------------------------

/**
 * Retorna a especificação completa de todos os endpoints.
 * @returns {Object}
 */
function getApiDocumentation() {
  return {
    title:       'SanoAgent API',
    version:     SYSTEM_INFO.VERSION,
    language:    SYSTEM_INFO.LANGUAGE,
    baseUrl:     'https://script.google.com/macros/d/{SCRIPT_ID}/exec',
    endpoints:   API_ENDPOINTS_SPEC,
    errorCodes:  _getErrorCodes(),
    rateLimiting:_getRateLimitingInfo(),
    auth:        _getAuthInfo(),
    changelog:   getApiChangelog(),
  };
}

/**
 * Retorna a spec de um único endpoint pelo slug.
 * @param {string} slug - ex.: 'auth/login', 'diary/create'.
 * @returns {EndpointSpec|null}
 */
function getEndpointSpec(slug) {
  return API_ENDPOINTS_SPEC[slug] || null;
}

/**
 * Lista todos os slugs de endpoint disponíveis.
 * @returns {string[]}
 */
function listEndpoints() {
  try {
    return Object.keys(API_ENDPOINTS_SPEC);
  } catch (error) {
    Logger.log("Erro em listEndpoints: " + error.message);
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Validação de payload contra a spec
// ---------------------------------------------------------------------------

/**
 * Valida se um payload satisfaz os requiredParams de um endpoint.
 * @param {string} slug    - Chave do endpoint (ex.: 'diary/create').
 * @param {Object} payload - Payload a validar.
 * @returns {{ valid: boolean, missing: string[], endpointFound: boolean }}
 */
function validatePayloadAgainstSpec(slug, payload) {
  try {
    const spec = API_ENDPOINTS_SPEC[slug];
    if (!spec) {
      return { valid: false, missing: [], endpointFound: false };
    }

    const missing = (spec.requiredParams || []).filter(
      k => !payload || payload[k] === undefined || payload[k] === null || String(payload[k]).trim() === ''
    );

    return { valid: missing.length === 0, missing, endpointFound: true };
  } catch (error) {
    Logger.log("Erro em validatePayloadAgainstSpec: " + error.message);
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Status dinâmico dos endpoints
// ---------------------------------------------------------------------------

/**
 * Retorna o status operacional dos endpoints executando o healthCheck real.
 * @returns {{ timestamp: string, overall: string, health: Object, endpoints: Object }}
 */
function getEndpointStatus() {
  try {
    let health;
    try {
      health = healthCheck();  // delega para api_endpoints.gs
    } catch (err) {
      health = { status: 'error', error: err.message };
    }

    const overall = health.status === 'healthy' ? 'operational' : health.status;

    // Tabela estática de latência esperada (p50 medido em produção)
    const EXPECTED_LATENCY = {
      'auth/login':        '150ms',
      'auth/register':     '200ms',
      'diary/create':      '180ms',
      'diary/get':         '220ms',
      'composition/generate':'2000ms',
      'composition/get':   '250ms',
      'analytics':         '500ms',
      'recommendations':   '300ms',
      'reports':           '400ms',
      'export':            '1000ms',
      'health':            '80ms',
      'version':           '30ms',
    };

    const endpoints = {};
    Object.keys(API_ENDPOINTS_SPEC).forEach(slug => {
      endpoints[slug] = {
        status:          overall === 'operational' ? 'operational' : 'degraded',
        expectedLatency: EXPECTED_LATENCY[slug] || 'N/A',
      };
    });

    return {
      timestamp:  new Date().toISOString(),
      overall,
      health,
      endpoints,
    };
  } catch (error) {
    Logger.log("Erro em getEndpointStatus: " + error.message);
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Changelog
// ---------------------------------------------------------------------------

/**
 * Retorna o changelog versionado da API.
 * @returns {Object}
 */
function getApiChangelog() {
  return Object.freeze({
    '1.1.0': {
      releaseDate:'2024-04-15',
      changes: [
        'Rate limiting por sessão via CacheService',
        'Validação de payload com erros descritivos por campo',
        'Endpoint /api/health com validação de configuração crítica',
        'Endpoint /api/version com lista de funcionalidades',
        'Roteamento por lookup table (sem switch/default)',
        'Spec formal de endpoints com requiredParams e responseShape',
        'validatePayloadAgainstSpec() para validação client-side antecipada',
        'getEndpointStatus() com delegação real ao healthCheck()',
      ],
    },
    '1.0.0': {
      releaseDate:'2024-01-01',
      changes: [
        'Lançamento inicial da API',
        'Endpoints de autenticação, diário, composição, análise, recomendação e exportação',
      ],
    },
  });
}

// ---------------------------------------------------------------------------
// Guia de uso textual
// ---------------------------------------------------------------------------

/**
 * Retorna guia de uso rápido da API em texto.
 * @returns {string}
 */
function getApiUsageGuide() {
  try {
    try {
      return `
    GUIA DE USO — SANOAGENT API v${SYSTEM_INFO.VERSION}
    ================================================

    1. AUTENTICAÇÃO
       POST /api/auth/login  { username, password }
       → Receba sessionToken e use-o nas requisições seguintes.

    2. CRIAR ENTRADA DE DIÁRIO
       POST /api/diary/create  { userId, content, mood, category }
       → Retorna entryId.

    3. GERAR COMPOSIÇÃO
       POST /api/composition/generate  { userId, entryId, genre }
       → genre: "Rock" | "Tropicália" | "Auto"

    4. ANALISAR DADOS
       POST /api/analytics  { userId, type }
       → type: "writing_patterns" | "temporal_trend" | "emotional_journey"

    5. EXPORTAR DADOS
       POST /api/export  { userId, format }
       → format: "csv" | "json"

    6. HEALTH CHECK
       POST /api/health  {}
       → { status: "healthy" | "degraded" | "error", validation: {...} }

    TODOS OS ENDPOINTS sao chamados via handleAdvancedApi(e) com:
      e.parameter.action = "<slug>"  (ex.: "analytics")
      e.postData.contents = JSON.stringify({ ...payload })

    ERROS PADRONIZADOS:
      { success: false, error: "<mensagem>", errorCode: "<código>" }
      Códigos: MISSING_PARAM | UNKNOWN_TYPE | RATE_LIMIT | INTERNAL_ERROR | INVALID_JSON
    `.trim();
    } catch (error) {
      Logger.log("Erro em getApiUsageGuide: " + error.message);
      throw error;
    }
  } catch (error) {
    Logger.log("Erro em getApiUsageGuide: " + error.message);
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Helpers privados
// ---------------------------------------------------------------------------

function _getErrorCodes() {
  return Object.freeze({
    400: 'Bad Request — parâmetros ausentes ou inválidos',
    401: 'Unauthorized — autenticação necessária',
    403: 'Forbidden — acesso negado',
    404: 'Not Found — endpoint ou recurso não encontrado',
    429: 'Too Many Requests — limite de requisições excedido',
    500: 'Internal Server Error — erro inesperado no servidor',
  });
}

function _getRateLimitingInfo() {
  return Object.freeze({
    enabled:            true,
    requestsPerMinute:  LIMITS.REQUESTS_PER_MINUTE,
    requestsPerHour:    LIMITS.REQUESTS_PER_HOUR,
    implementation:    'CacheService (por userId)',
  });
}

function _getAuthInfo() {
  return Object.freeze({
    type:         'Session Token',
    paramName:    'sessionToken',
    location:     'request body',
    expiration:   `${LIMITS.SESSION_TIMEOUT_MINUTES} minutos`,
  });
}
