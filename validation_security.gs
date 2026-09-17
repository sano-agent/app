/**
 * @fileoverview validation_security.gs
 * @description Módulo de validação e segurança do sistema SanoAgent.
 * Implementa validação de entrada, sanitização e proteção contra ataques.
 * @author SanoAgent Team
 * @version 1.0.0
 */

/**
 * Classe para validação de dados
 */
class InputValidator {
  /**
   * Valida entrada de diário
   * @param {string} content - Conteúdo
   * @returns {Object} Resultado da validação
   */
  static validateDiaryEntry(content) {
    const errors = [];
    content = String(content == null ? '' : content);

    if (!content || content.trim().length === 0) {
      errors.push('Conteúdo não pode estar vazio');
    }

    if (content.length < 10) {
      errors.push('Conteúdo muito curto (mínimo 10 caracteres)');
    }

    if (content.length > 5000) {
      errors.push('Conteúdo muito longo (máximo 5000 caracteres)');
    }

    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Valida credenciais de login
   * @param {string} username - Nome de usuário
   * @param {string} password - Senha
   * @returns {Object} Resultado da validação
   */
  static validateCredentials(username, password) {
    const errors = [];
    username = String(username == null ? '' : username);
    password = String(password == null ? '' : password);

    if (!username || username.trim().length === 0) {
      errors.push('Nome de usuário é obrigatório');
    }

    if (username.length < 3) {
      errors.push('Nome de usuário deve ter pelo menos 3 caracteres');
    }

    if (username.length > 50) {
      errors.push('Nome de usuário muito longo');
    }

    if (!password || password.length === 0) {
      errors.push('Senha é obrigatória');
    }

    if (password.length < 4) {
      errors.push('Senha deve ter pelo menos 4 caracteres');
    }

    if (password.length > 100) {
      errors.push('Senha muito longa');
    }

    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Valida email
   * @param {string} email - Email
   * @returns {boolean} Verdadeiro se válido
   */
  static validateEmail(email) {
    if (typeof email !== 'string') return false;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /**
   * Valida ID de composição
   * @param {string} compositionId - ID
   * @returns {boolean} Verdadeiro se válido
   */
  static validateCompositionId(compositionId) {
    return typeof compositionId === 'string' && compositionId.startsWith('comp_') && compositionId.length > 10;
  }

  /**
   * Valida gênero musical
   * @param {string} genre - Gênero
   * @returns {boolean} Verdadeiro se válido
   */
  static validateGenre(genre) {
    const validGenres = ['Rock', 'Tropicália', 'Auto'];
    return validGenres.includes(genre);
  }

  /**
   * Valida mood/emoção
   * @param {string} mood - Mood
   * @returns {boolean} Verdadeiro se válido
   */
  static validateMood(mood) {
    const validMoods = ['Feliz', 'Triste', 'Animado', 'Calmo', 'Reflexivo', 'Grato', 'Pensativo'];
    return validMoods.includes(mood);
  }
}

/**
 * Classe para sanitização de dados
 */
class DataSanitizer {
  /**
   * Sanitiza string removendo caracteres perigosos
   * @param {string} str - String
   * @returns {string} String sanitizada
   */
  static sanitizeString(str) {
    if (str === null || str === undefined) return '';
    str = String(str);
    
    return str
      .replace(/[<>"'`]/g, '')
      .trim();
  }

  /**
   * Sanitiza entrada de diário
   * @param {string} content - Conteúdo
   * @returns {string} Conteúdo sanitizado
   */
  static sanitizeDiaryEntry(content) {
    if (content === null || content === undefined) return '';
    content = String(content);

    // Remove scripts e tags HTML
    let sanitized = content.replace(/<script[^>]*>.*?<\/script>/gi, '');
    sanitized = sanitized.replace(/<[^>]+>/g, '');
    
    // Remove caracteres de controle
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');

    return sanitized.trim();
  }

  /**
   * Sanitiza nome de usuário
   * @param {string} username - Nome de usuário
   * @returns {string} Nome sanitizado
   */
  static sanitizeUsername(username) {
    if (username === null || username === undefined) return '';
    username = String(username);

    return username
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .substring(0, 50);
  }

  /**
   * Sanitiza JSON
   * @param {*} obj - Objeto
   * @returns {*} Objeto sanitizado
   */
  static sanitizeJson(obj) {
    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeJson(item));
    }

    if (typeof obj === 'object' && obj !== null) {
      const sanitized = {};
      for (const key in obj) {
        sanitized[key] = this.sanitizeJson(obj[key]);
      }
      return sanitized;
    }

    return obj;
  }
}

/**
 * Classe para auditoria de segurança
 */
class SecurityAudit {
  /**
   * Construtor
   * @param {string} spreadsheetId - ID da planilha
   */
  constructor(spreadsheetId) {
    this.auditRepository = new BaseRepository(spreadsheetId, 'Auditoria');
  }

  /**
   * Registra evento de segurança
   * @param {string} userId - ID do usuário
   * @param {string} eventType - Tipo de evento
   * @param {string} details - Detalhes
   * @param {string} severity - Severidade
   */
  logSecurityEvent(userId, eventType, details, severity = 'info') {
    try {
      this.auditRepository.create([
        `audit_${Date.now()}`,
        userId,
        eventType,
        details,
        severity,
        new Date().toISOString()
      ]);
    } catch (error) {
      LoggerService.error(`Erro ao registrar evento: ${error.message}`);
    }
  }

  /**
   * Obtém eventos de segurança de um usuário
   * @param {string} userId - ID do usuário
   * @returns {Array<Array>} Eventos
   */
  getUserSecurityEvents(userId) {
    try {
      return this.auditRepository.findByColumn(2, userId);
    } catch (error) {
      return [];
    }
  }

  /**
   * Detecta atividade suspeita
   * @param {string} userId - ID do usuário
   * @returns {Array} Eventos suspeitos
   */
  detectSuspiciousActivity(userId) {
    try {
      const events = this.getUserSecurityEvents(userId);
      const suspicious = [];

      // Detecta múltiplas falhas de login
      const failedLogins = events.filter(e => e[2] === 'FAILED_LOGIN');
      if (failedLogins.length > 5) {
        suspicious.push({
          type: 'multiple_failed_logins',
          count: failedLogins.length,
          severity: 'high'
        });
      }

      // Detecta múltiplas tentativas de acesso em curto período
      const now = Date.now();
      const recentEvents = events.filter(e => {
        const eventTime = new Date(e[5]).getTime();
        return (now - eventTime) < 5 * 60 * 1000; // 5 minutos
      });

      if (recentEvents.length > 20) {
        suspicious.push({
          type: 'excessive_requests',
          count: recentEvents.length,
          severity: 'medium'
        });
      }

      return suspicious;
    } catch (error) {
      return [];
    }
  }

  /**
   * Gera relatório de segurança
   * @returns {Object} Relatório
   */
  generateSecurityReport() {
    try {
      const allEvents = this.auditRepository.readAll();
      const highSeverityEvents = allEvents.filter(e => e[4] === 'high');
      const mediumSeverityEvents = allEvents.filter(e => e[4] === 'medium');

      return {
        generatedAt: new Date().toISOString(),
        totalEvents: allEvents.length - 1,
        highSeverityEvents: highSeverityEvents.length,
        mediumSeverityEvents: mediumSeverityEvents.length,
        status: highSeverityEvents.length === 0 ? 'Seguro' : 'Atenção Necessária'
      };
    } catch (error) {
      return { error: error.message };
    }
  }
}
