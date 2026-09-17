/**
 * @fileoverview config_properties.gs
 * @description Gerenciador centralizado de propriedades e variáveis de ambiente do SanoAgent.
 * Implementa cache em memória para reduzir chamadas repetidas ao PropertiesService,
 * validação de configurações críticas e operações em lote.
 * @author SanoAgent Team
 * @version 1.1.0
 */

// ---------------------------------------------------------------------------
// Cache em memória (válido durante a execução da requisição GAS)
// ---------------------------------------------------------------------------

/** @type {Object.<string, string>|null} */
let _propertiesCache = null;

/**
 * Retorna o cache de propriedades, preenchendo-o na primeira chamada.
 * @returns {Object.<string, string>}
 */
function _getCache() {
  try {
    if (!_propertiesCache) {
      _propertiesCache = PropertiesService.getScriptProperties().getProperties();
    }
    return _propertiesCache;
  } catch (error) {
    Logger.log("Erro em _getCache: " + error.message);
    throw error;
  }
}

/**
 * Invalida o cache forçando releitura no próximo acesso.
 * Deve ser chamado após qualquer operação de escrita.
 */
function _invalidateCache() {
  _propertiesCache = null;
}

// ---------------------------------------------------------------------------
// Leitores individuais
// ---------------------------------------------------------------------------

/**
 * Obtém a chave da API do Gemini armazenada de forma segura.
 * @returns {string|null} Chave da API ou null se não configurada.
 */
function getGeminiApiKey() {
  return _getCache()['GEMINI_API_KEY'] || null;
}

/**
 * Obtém o ID da planilha central do projeto.
 * @returns {string|null} ID da planilha Google Sheets ou null.
 */
function getSpreadsheetId() {
  return _getCache()['SPREADSHEETS_ID'] || null;
}

/**
 * Obtém o ID da pasta do Google Drive para armazenamento de arquivos.
 * @returns {string|null} ID da pasta no Google Drive ou null.
 */
function getDriveFolderId() {
  const cache = _getCache();
  return cache['OUTPUT_FOLDER_ID'] || cache['DRIVE_OUTPUT_FOLDER_ID'] || cache['DRIVE_FOLDER_ID'] || null;
}

function getBackupFolderId() {
  const cache = _getCache();
  return cache['BACKUP_FOLDER_ID'] || cache['DRIVE_BACKUP_FOLDER_ID'] || cache['DRIVE_FOLDER_ID'] || null;
}

/**
 * Obtém a versão do sistema configurada.
 * @returns {string} Versão ou '1.0.0' como fallback.
 */
function getSystemVersion() {
  return _getCache()['SYSTEM_VERSION'] || '1.0.0';
}

/**
 * Obtém o idioma do sistema.
 * @returns {string} Código de idioma (padrão: 'pt-BR').
 */
function getSystemLanguage() {
  return _getCache()['SYSTEM_LANGUAGE'] || 'pt-BR';
}

// ---------------------------------------------------------------------------
// Escritores individuais
// ---------------------------------------------------------------------------

/**
 * Define a chave da API do Gemini.
 * @param {string} apiKey - Chave da API (não pode ser vazia).
 * @throws {Error} Se apiKey for inválida.
 */
function setGeminiApiKey(apiKey) {
  try {
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 8) {
      throw new Error('GEMINI_API_KEY inválida: valor muito curto ou ausente.');
    }
    PropertiesService.getScriptProperties().setProperty('GEMINI_API_KEY', apiKey.trim());
    _invalidateCache();
  } catch (error) {
    Logger.log("Erro em setGeminiApiKey: " + error.message);
    throw error; // Re-lança para tratamento superior
  }
}

/**
 * Define o ID da planilha central.
 * @param {string} spreadsheetId - ID da planilha (44 chars).
 * @throws {Error} Se o ID não tiver o formato esperado.
 */
function setSpreadsheetId(spreadsheetId) {
  try {
    try {
      if (!spreadsheetId || spreadsheetId.trim().length < 20) {
        throw new Error('SPREADSHEETS_ID inválido: ID de planilha deve ter pelo menos 20 caracteres.');
      }
      PropertiesService.getScriptProperties().setProperty('SPREADSHEETS_ID', spreadsheetId.trim());
      _invalidateCache();
    } catch (error) {
      Logger.log("Erro em setSpreadsheetId: " + error.message);
      throw error; // Re-lança para tratamento superior
    }
  } catch (error) {
    Logger.log("Erro em setSpreadsheetId: " + error.message);
    throw error;
  }
}

/**
 * Define o ID da pasta do Google Drive.
 * @param {string} folderId - ID da pasta.
 * @throws {Error} Se o ID for inválido.
 */
function setDriveFolderId(folderId) {
  try {
    try {
      try {
        if (!folderId || folderId.trim().length < 10) {
          throw new Error('DRIVE_FOLDER_ID inválido.');
        }
        PropertiesService.getScriptProperties().setProperty('OUTPUT_FOLDER_ID', folderId.trim());
        _invalidateCache();
      } catch (error) {
        Logger.log("Erro em setDriveFolderId: " + error.message);
        throw error; // Re-lança para tratamento superior
      }
    } catch (error) {
      Logger.log("Erro em setDriveFolderId: " + error.message);
      throw error;
    }
  } catch (error) {
    Logger.log("Erro em setDriveFolderId: " + error.message);
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Operações em lote
// ---------------------------------------------------------------------------

/**
 * Configura todas as propriedades críticas de uma vez (setup inicial).
 * @param {Object} config - Mapa de propriedades a definir.
 * @param {string} config.GEMINI_API_KEY
 * @param {string} config.SPREADSHEETS_ID
 * @param {string} [config.DRIVE_FOLDER_ID]
 */
function setAllCriticalProperties(config) {
  try {
    if (!config || typeof config !== 'object') {
      throw new Error('Configuração inválida: objeto esperado.');
    }

    const required = ['GEMINI_API_KEY', 'SPREADSHEETS_ID'];
    const missing = required.filter(k => !config[k]);
    if (missing.length > 0) {
      throw new Error(`Propriedades obrigatórias ausentes: ${missing.join(', ')}`);
    }

    PropertiesService.getScriptProperties().setProperties(config, false);
    _invalidateCache();
    LoggerService.info('[Config] Propriedades críticas definidas com sucesso.');
  } catch (error) {
    Logger.log("Erro em setAllCriticalProperties: " + error.message);
    throw error;
  }
}

/**
 * Retorna todas as propriedades configuradas, filtrando chaves sensíveis.
 * @returns {Object.<string, string>} Propriedades seguras para exibição.
 */
function getAllSafeProperties() {
  try {
    const SENSITIVE_KEYS = new Set(['GEMINI_API_KEY', 'SECRET', 'PASSWORD', 'TOKEN']);
    const all = _getCache();
    const safe = {};

    Object.keys(all).forEach(key => {
      const isSensitive = [...SENSITIVE_KEYS].some(s => key.toUpperCase().includes(s));
      safe[key] = isSensitive ? '***' : all[key];
    });

    return safe;
  } catch (error) {
    Logger.log("Erro em getAllSafeProperties: " + error.message);
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Validação e inicialização
// ---------------------------------------------------------------------------

/**
 * Valida se as propriedades críticas estão configuradas e não estão vazias.
 * @returns {{ valid: boolean, missing: string[], message: string }}
 */
function validateCriticalProperties() {
  try {
    const CRITICAL = ['GEMINI_API_KEY', 'SPREADSHEETS_ID'];
    const cache = _getCache();
    const missing = CRITICAL.filter(k => !cache[k] || cache[k].trim() === '');

    return {
      valid: missing.length === 0,
      missing,
      message: missing.length === 0
        ? 'Todas as propriedades críticas estão configuradas.'
        : `Propriedades ausentes: ${missing.join(', ')}`,
    };
  } catch (error) {
    Logger.log("Erro em validateCriticalProperties: " + error.message);
    throw error;
  }
}

/**
 * Inicializa as propriedades padrão do sistema sem sobrescrever valores existentes.
 * Deve ser chamado durante o setup inicial via `initializeSystem()`.
 */
function initializeDefaultProperties() {
  try {
    const props = PropertiesService.getScriptProperties();

    const defaults = {
      SYSTEM_VERSION:  '1.1.0',
      SYSTEM_LANGUAGE: 'pt-BR',
      MUSIC_GENRES:    'Rock,Tropicália',
    };

    Object.entries(defaults).forEach(([key, value]) => {
      if (!props.getProperty(key)) {
        props.setProperty(key, value);
      }
    });

    _invalidateCache();
    LoggerService.info('[Config] Propriedades padrão inicializadas.');
  } catch (error) {
    Logger.log("Erro em initializeDefaultProperties: " + error.message);
    throw error;
  }
}

/**
 * Remove uma propriedade específica do armazenamento (uso administrativo).
 * @param {string} key - Chave a remover.
 */
function deleteProperty(key) {
  try {
    try {
      PropertiesService.getScriptProperties().deleteProperty(key);
      _invalidateCache();
      LoggerService.info(`[Config] Propriedade removida: ${key}`);
    } catch (error) {
      Logger.log("Erro em deleteProperty: " + error.message);
      throw error; // Re-lança para tratamento superior
    }
  } catch (error) {
    Logger.log("Erro em deleteProperty: " + error.message);
    throw error;
  }
}
