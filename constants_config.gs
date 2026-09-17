/**
 * @fileoverview constants_config.gs
 * @description Constantes e configurações globais do SanoAgent.
 * Define valores padrão, enums, limites, patterns de validação e helpers de acesso.
 * Todas as constantes são somente-leitura (Object.freeze) para evitar mutação acidental.
 * @author SanoAgent Team
 * @version 1.1.0
 */

// ---------------------------------------------------------------------------
// Informações do sistema
// ---------------------------------------------------------------------------

/** @const {Object} Metadados imutáveis do sistema */
const SYSTEM_INFO = Object.freeze({
  NAME:        'SanoAgent',
  VERSION:     '1.1.0',
  AUTHOR:      'SanoAgent Team',
  DESCRIPTION: 'Sistema de Composição Musical Mediada por IA',
  LANGUAGE:    'pt-BR',
  RELEASE_DATE:'2024-04-15',
});

// ---------------------------------------------------------------------------
// Enums de domínio
// ---------------------------------------------------------------------------

/** @const Gêneros musicais suportados */
const MUSIC_GENRES = Object.freeze({
  ROCK:      'Rock',
  TROPICALIA:'Tropicália',
  AUTO:      'Auto',
});

/** @const Moods/emoções disponíveis */
const MOODS = Object.freeze({
  HAPPY:      'Feliz',
  SAD:        'Triste',
  EXCITED:    'Animado',
  CALM:       'Calmo',
  THOUGHTFUL: 'Reflexivo',
  GRATEFUL:   'Grato',
  PENSIVE:    'Pensativo',
});

/** @const Categorias de entrada de diário */
const DIARY_CATEGORIES = Object.freeze({
  GENERAL:      'Geral',
  ACHIEVEMENT:  'Conquista',
  RELATIONSHIP: 'Relacionamento',
  FAMILY:       'Família',
  SCHOOL:       'Escola',
  GRATITUDE:    'Gratidão',
});

/** @const Status de processamento de composições */
const PROCESSING_STATUS = Object.freeze({
  PENDING:    'Pendente',
  PROCESSING: 'Processando',
  COMPLETED:  'Concluído',
  ERROR:      'Erro',
});

/** @const Papéis de usuário */
const USER_ROLES = Object.freeze({
  STUDENT:'student',
  TEACHER:'teacher',
  ADMIN:  'admin',
  PARENT: 'parent',
});

/** @const Níveis de severidade de alertas */
const SEVERITY_LEVELS = Object.freeze({
  LOW:     'low',
  MEDIUM:  'medium',
  HIGH:    'high',
  CRITICAL:'critical',
});

// ---------------------------------------------------------------------------
// Limites e timeouts
// ---------------------------------------------------------------------------

/** @const Limites de negócio e segurança */
const LIMITS = Object.freeze({
  MIN_DIARY_LENGTH:         10,
  MAX_DIARY_LENGTH:         5000,
  MIN_USERNAME_LENGTH:      3,
  MAX_USERNAME_LENGTH:      50,
  MIN_PASSWORD_LENGTH:      4,
  MAX_PASSWORD_LENGTH:      100,
  MAX_FAILED_LOGIN_ATTEMPTS:5,
  SESSION_TIMEOUT_MINUTES:  60,
  REQUESTS_PER_MINUTE:      60,
  REQUESTS_PER_HOUR:        1000,
  MAX_COMPOSITIONS_PER_USER:500,
  MAX_DIARY_ENTRIES_PER_DAY:10,
});

/** @const Timeouts de chamadas externas em milissegundos */
const TIMEOUTS_MS = Object.freeze({
  API_CALL:       30000,
  GEMINI_CALL:    60000,
  DATABASE_QUERY: 10000,
  DRIVE_OPERATION:20000,
});

// ---------------------------------------------------------------------------
// Configurações de funcionalidades
// ---------------------------------------------------------------------------

/** @const Configurações de email */
const EMAIL_CONFIG = Object.freeze({
  SENDER:               'noreply@sanoagent.com',
  SUBJECT_PREFIX:       '[SanoAgent]',
  ENABLE_NOTIFICATIONS: true,
});

/** @const Configurações de backup automático */
const BACKUP_CONFIG = Object.freeze({
  ENABLED:        true,
  FREQUENCY_DAYS: 7,
  RETENTION_DAYS: 30,
  COMPRESSION:    true,
});

/** @const Configurações de logging */
const LOGGING_CONFIG = Object.freeze({
  LEVEL:           'INFO',   // 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'
  ENABLE_CONSOLE:  true,
  ENABLE_FILE:     true,
  MAX_LOG_SIZE_MB: 10,
});

/** @const Configurações de segurança */
const SECURITY_CONFIG = Object.freeze({
  ENABLE_AUDIT:       true,
  ENABLE_ENCRYPTION:  false,
  ENABLE_2FA:         false,
  PASSWORD_HASH:      false,  // v2: habilitar com bcrypt equivalent
  SESSION_SECURE:     true,
  CORS_ALLOW_ORIGIN:  '*',    // restringir em produção
});

// ---------------------------------------------------------------------------
// Configurações padrão de usuário
// ---------------------------------------------------------------------------

/** @const Preferências padrão aplicadas a novos usuários */
const USER_DEFAULT_CONFIG = Object.freeze({
  language:           'pt-BR',
  timezone:           'America/Sao_Paulo',
  dateFormat:         'DD/MM/YYYY',
  timeFormat:         'HH:mm:ss',
  theme:              'light',
  itemsPerPage:       20,
  enableNotifications:true,
  enableAnalytics:    true,
});

// ---------------------------------------------------------------------------
// Mensagens de sistema
// ---------------------------------------------------------------------------

/** @const Mensagens padronizadas de resposta */
const MESSAGES = Object.freeze({
  SUCCESS:       'Operação realizada com sucesso.',
  ERROR:         'Ocorreu um erro ao processar a solicitação.',
  INVALID_INPUT: 'Entrada inválida.',
  UNAUTHORIZED:  'Acesso não autorizado.',
  NOT_FOUND:     'Recurso não encontrado.',
  DUPLICATE:     'Recurso já existente.',
  TIMEOUT:       'A operação excedeu o tempo limite.',
  RATE_LIMIT:    'Limite de requisições excedido. Tente novamente em instantes.',
  MAINTENANCE:   'Sistema em manutenção. Tente mais tarde.',
  WELCOME:       'Bem-vindo ao SanoAgent!',
  GOODBYE:       'Até logo!',
  SESSION_EXPIRED:'Sessão expirada. Faça login novamente.',
});

// ---------------------------------------------------------------------------
// Padrões de validação (regex)
// ---------------------------------------------------------------------------

/**
 * @const Expressões regulares para validação de entrada.
 * Nota: em GAS, regex literals são objetos — não usar Object.freeze sobre eles
 * diretamente, mas o container é congelado.
 */
const REGEX_PATTERNS = Object.freeze({
  EMAIL:    /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  USERNAME: /^[a-zA-Z0-9_-]{3,50}$/,
  PASSWORD: /^.{4,100}$/,
  UUID:     /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  URL:      /^https?:\/\/.+/,
  PHONE:    /^\+?[1-9]\d{1,14}$/,
  DATE_BR:  /^\d{2}\/\d{2}\/\d{4}$/,
});

// ---------------------------------------------------------------------------
// Tokens visuais (UI)
// ---------------------------------------------------------------------------

/** @const Paleta de cores semântica para interfaces */
const UI_COLORS = Object.freeze({
  PRIMARY:   '#1f77b4',
  SECONDARY: '#ff7f0e',
  SUCCESS:   '#2ca02c',
  WARNING:   '#ff9800',
  ERROR:     '#d62728',
  INFO:      '#17a2b8',
  LIGHT:     '#f8f9fa',
  DARK:      '#343a40',
  MUTED:     '#6c757d',
});

/** @const Ícones textuais / emoji para feedback de UI */
const UI_ICONS = Object.freeze({
  SUCCESS:     '✓',
  ERROR:       '✗',
  WARNING:     '⚠',
  INFO:        'ℹ',
  LOADING:     '⟳',
  MUSIC:       '♫',
  HEART:       '♥',
  STAR:        '★',
  ARROW_RIGHT: '→',
  ARROW_LEFT:  '←',
  LOCK:        '🔒',
  USER:        '👤',
});

// ---------------------------------------------------------------------------
// Funções de acesso (API pública do módulo)
// ---------------------------------------------------------------------------

/**
 * Valida um valor contra um padrão regex registrado.
 * @param {string} patternName - Chave em REGEX_PATTERNS (ex.: 'EMAIL').
 * @param {string} value       - Valor a testar.
 * @returns {boolean} true se válido.
 */
function validatePattern(patternName, value) {
  const regex = REGEX_PATTERNS[patternName];
  if (!regex) {
    LoggerService.info(`[Constants] Padrão desconhecido: "${patternName}"`);
    return false;
  }
  return typeof value === 'string' && regex.test(value);
}

/**
 * Retorna uma mensagem de sistema pelo código.
 * @param {string} key - Chave em MESSAGES (ex.: 'SUCCESS').
 * @returns {string} Mensagem correspondente ou MESSAGES.ERROR como fallback.
 */
function getMessage(key) {
  return MESSAGES[key] || MESSAGES.ERROR;
}

/**
 * Verifica se um valor é uma chave de enum válida.
 * @param {Object} enumObj - Um dos objetos de enum congelados.
 * @param {string} value   - Valor a verificar.
 * @returns {boolean}
 */
function isValidEnumValue(enumObj, value) {
  try {
    return Object.values(enumObj).includes(value);
  } catch (error) {
    Logger.log("Erro em isValidEnumValue: " + error.message);
    throw error;
  }
}

/**
 * Retorna a lista de valores de um enum como array ordenado.
 * @param {Object} enumObj - Objeto de enum congelado.
 * @returns {string[]}
 */
function getEnumValues(enumObj) {
  try {
    return Object.values(enumObj).sort();
  } catch (error) {
    Logger.log("Erro em getEnumValues: " + error.message);
    throw error;
  }
}
