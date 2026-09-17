/**
 * @fileoverview auth_service.gs
 * @description Serviço de autenticação para o sistema SanoAgent.
 * Implementa validação de credenciais e gestão de sessões de usuário.
 * Nota: Utiliza senhas em texto plano para fins pedagógicos de transparência.
 * @author SanoAgent Team
 * @version 1.0.0
 */

/**
 * Classe para gerenciamento de autenticação
 */
class AuthService {
  /**
   * Construtor do serviço de autenticação
   * @param {string} spreadsheetId - ID da planilha
   */
  constructor(spreadsheetId) {
    this.usersRepository = new BaseRepository(spreadsheetId, 'Usuários');
    this.auditRepository = new BaseRepository(spreadsheetId, 'Histórico de Acesso');
  }

  /**
   * Valida credenciais de login
   * @param {string} username - Nome de usuário
   * @param {string} password - Senha
   * @returns {Object} Objeto com resultado da validação
   */
  validateCredentials(username, password) {
    try {
      const allUsers = this.usersRepository.readAll();
      
      for (let i = 1; i < allUsers.length; i++) {
        const row = allUsers[i];
        if (row[0] === username && row[1] === password) {
          return {
            success: true,
            userId: row[2] || `user_${i}`,
            userName: row[0],
            role: row[3] || 'student'
          };
        }
      }
      
      return {
        success: false,
        error: 'Credenciais inválidas'
      };
    } catch (error) {
      return {
        success: false,
        error: `Erro na validação: ${error.message}`
      };
    }
  }

  /**
   * Registra novo usuário
   * @param {string} username - Nome de usuário
   * @param {string} password - Senha
   * @param {string} role - Papel do usuário (student, teacher, admin)
   * @returns {Object} Resultado do registro
   */
  registerUser(username, password, role = 'student') {
    try {
      // Verifica se usuário já existe
      const allUsers = this.usersRepository.readAll();
      for (let i = 1; i < allUsers.length; i++) {
        if (allUsers[i][0] === username) {
          return {
            success: false,
            error: 'Usuário já existe'
          };
        }
      }

      const userId = `user_${Date.now()}`;
      const createdAt = new Date().toISOString();
      
      this.usersRepository.create([
        username,
        password,
        userId,
        role,
        createdAt
      ]);

      this.logAccess(userId, 'REGISTER', 'Novo usuário registrado');

      return {
        success: true,
        userId: userId,
        message: 'Usuário registrado com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: `Erro no registro: ${error.message}`
      };
    }
  }

  /**
   * Registra acesso do usuário no histórico
   * @param {string} userId - ID do usuário
   * @param {string} action - Ação realizada
   * @param {string} details - Detalhes da ação
   */
  logAccess(userId, action, details = '') {
    try {
      const timestamp = new Date().toISOString();
      this.auditRepository.create([
        userId,
        action,
        timestamp,
        details
      ]);
    } catch (error) {
      LoggerService.error(`Erro ao registrar acesso: ${error.message}`);
    }
  }

  /**
   * Obtém histórico de acesso de um usuário
   * @param {string} userId - ID do usuário
   * @returns {Array<Array>} Histórico de acesso
   */
  getUserAccessHistory(userId) {
    try {
      return this.auditRepository.findByColumn(1, userId);
    } catch (error) {
      LoggerService.error(`Erro ao obter histórico: ${error.message}`);
      return [];
    }
  }

  /**
   * Valida token de sessão (simulado)
   * @param {string} sessionToken - Token da sessão
   * @returns {boolean} Verdadeiro se válido
   */
  validateSessionToken(sessionToken) {
    const token = typeof sessionToken === 'string' ? sessionToken.trim() : '';
    if (!token || typeof getSessionUser !== 'function') return false;
    return !!getSessionUser(token);
  }

  /**
   * Gera token de sessão
   * @param {string} userId - ID do usuário
   * @returns {string} Token de sessão
   */
  generateSessionToken(userId) {
    const timestamp = Date.now();
    return `${userId}_${timestamp}_${Utilities.getUuid()}`;
  }

  /**
   * Altera a senha de um usuário
   * @param {string} userId - ID do usuário
   * @param {string} oldPassword - Senha antiga
   * @param {string} newPassword - Nova senha
   * @returns {Object} Resultado da alteração
   */
  changePassword(userId, oldPassword, newPassword) {
    try {
      const allUsers = this.usersRepository.readAll();
      
      for (let i = 1; i < allUsers.length; i++) {
        if (allUsers[i][2] === userId) {
          if (allUsers[i][1] === oldPassword) {
            this.usersRepository.updateCell(i, 2, newPassword);
            this.logAccess(userId, 'PASSWORD_CHANGE', 'Senha alterada');
            return { success: true, message: 'Senha alterada com sucesso' };
          } else {
            return { success: false, error: 'Senha atual incorreta' };
          }
        }
      }
      
      return { success: false, error: 'Usuário não encontrado' };
    } catch (error) {
      return { success: false, error: `Erro: ${error.message}` };
    }
  }
}
