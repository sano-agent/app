/**
 * @fileoverview utils_helpers.gs
 * @description Funções utilitárias e helpers para o sistema SanoAgent.
 * Fornece funções auxiliares para logging, formatação e manipulação de dados.
 * @author SanoAgent Team
 * @version 1.0.0
 */

/**
 * Logger customizado para o sistema
 */
class SystemLogger {
  /**
   * Registra mensagem de informação
   * @param {string} message - Mensagem
   * @param {string} source - Origem da mensagem
   */
  static info(message, source = 'System') {
    const timestamp = new Date().toISOString();
    LoggerService.info(`[${timestamp}] [INFO] [${source}] ${message}`);
  }

  /**
   * Registra mensagem de erro
   * @param {string} message - Mensagem de erro
   * @param {string} source - Origem do erro
   */
  static error(message, source = 'System') {
    const timestamp = new Date().toISOString();
    LoggerService.error(`[${timestamp}] [ERROR] [${source}] ${message}`);
  }

  /**
   * Registra mensagem de aviso
   * @param {string} message - Mensagem de aviso
   * @param {string} source - Origem do aviso
   */
  static warn(message, source = 'System') {
    const timestamp = new Date().toISOString();
    LoggerService.error(`[${timestamp}] [WARN] [${source}] ${message}`);
  }
}

/**
 * Formatador de datas
 */
class DateFormatter {
  /**
   * Formata data em formato brasileiro
   * @param {Date|string} date - Data a formatar
   * @returns {string} Data formatada (DD/MM/YYYY)
   */
  static formatBR(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Formata data com hora
   * @param {Date|string} date - Data a formatar
   * @returns {string} Data e hora formatadas
   */
  static formatWithTime(date) {
    const d = new Date(date);
    const dateStr = this.formatBR(d);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${dateStr} ${hours}:${minutes}`;
  }

  /**
   * Retorna data relativa (ex: "há 2 dias")
   * @param {Date|string} date - Data
   * @returns {string} Data relativa
   */
  static formatRelative(date) {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`;
    return `${Math.floor(diffDays / 30)} meses atrás`;
  }
}

/**
 * Validador de dados
 */
class DataValidator {
  /**
   * Valida email
   * @param {string} email - Email a validar
   * @returns {boolean} Verdadeiro se válido
   */
  static isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /**
   * Valida comprimento de string
   * @param {string} str - String a validar
   * @param {number} minLength - Comprimento mínimo
   * @param {number} maxLength - Comprimento máximo
   * @returns {boolean} Verdadeiro se válido
   */
  static isValidLength(str, minLength = 1, maxLength = 1000) {
    return str && str.length >= minLength && str.length <= maxLength;
  }

  /**
   * Valida se string não está vazia
   * @param {string} str - String a validar
   * @returns {boolean} Verdadeiro se não vazia
   */
  static isNotEmpty(str) {
    return str && str.trim().length > 0;
  }

  /**
   * Sanitiza string removendo caracteres perigosos
   * @param {string} str - String a sanitizar
   * @returns {string} String sanitizada
   */
  static sanitize(str) {
    return str
      .replace(/[<>"']/g, '')
      .trim();
  }
}

/**
 * Conversor de dados
 */
class DataConverter {
  /**
   * Converte array para objeto
   * @param {Array} headers - Cabeçalhos
   * @param {Array} row - Linha de dados
   * @returns {Object} Objeto
   */
  static arrayToObject(headers, row) {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  }

  /**
   * Converte objeto para array
   * @param {Object} obj - Objeto
   * @param {Array} keys - Chaves na ordem desejada
   * @returns {Array} Array
   */
  static objectToArray(obj, keys) {
    return keys.map(key => obj[key] || '');
  }

  /**
   * Converte JSON string para objeto
   * @param {string} jsonStr - String JSON
   * @param {*} defaultValue - Valor padrão se inválido
   * @returns {*} Objeto ou valor padrão
   */
  static parseJson(jsonStr, defaultValue = null) {
    try {
      return JSON.parse(jsonStr);
    } catch (error) {
      return defaultValue;
    }
  }

  /**
   * Converte objeto para JSON string
   * @param {*} obj - Objeto
   * @returns {string} String JSON
   */
  static toJson(obj) {
    try {
      return JSON.stringify(obj);
    } catch (error) {
      return '{}';
    }
  }
}

/**
 * Gerador de IDs únicos
 */
class IdGenerator {
  /**
   * Gera ID único baseado em timestamp
   * @param {string} prefix - Prefixo do ID
   * @returns {string} ID único
   */
  static generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Gera UUID v4
   * @returns {string} UUID
   */
  static generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Gera código aleatório
   * @param {number} length - Comprimento do código
   * @returns {string} Código
   */
  static generateCode(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}

/**
 * Calculadora de estatísticas
 */
class StatisticsCalculator {
  /**
   * Calcula média
   * @param {Array<number>} numbers - Array de números
   * @returns {number} Média
   */
  static average(numbers) {
    if (numbers.length === 0) return 0;
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }

  /**
   * Calcula mediana
   * @param {Array<number>} numbers - Array de números
   * @returns {number} Mediana
   */
  static median(numbers) {
    const sorted = numbers.sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  /**
   * Calcula frequência de itens
   * @param {Array} items - Array de itens
   * @returns {Object} Frequência de cada item
   */
  static frequency(items) {
    const freq = {};
    items.forEach(item => {
      freq[item] = (freq[item] || 0) + 1;
    });
    return freq;
  }

  /**
   * Calcula percentual
   * @param {number} value - Valor
   * @param {number} total - Total
   * @returns {number} Percentual
   */
  static percentage(value, total) {
    return total === 0 ? 0 : (value / total * 100).toFixed(2);
  }
}
