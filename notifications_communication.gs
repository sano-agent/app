/**
 * @fileoverview notifications_communication.gs
 * @description Sistema de notificações e comunicação do SanoAgent.
 * Implementa envio de emails, alertas e mensagens aos usuários.
 * @author SanoAgent Team
 * @version 1.0.0
 */

/**
 * Classe para gerenciamento de notificações
 */
class NotificationService {
  /**
   * Construtor do serviço de notificações
   * @param {string} senderEmail - Email do remetente
   */
  constructor(senderEmail = 'noreply@sanoagent.com') {
    this.senderEmail = senderEmail;
  }

  /**
   * Envia email de boas-vindas
   * @param {string} userEmail - Email do usuário
   * @param {string} userName - Nome do usuário
   * @returns {Object} Resultado
   */
  sendWelcomeEmail(userEmail, userName) {
    try {
      const subject = 'Bem-vindo ao SanoAgent!';
      const body = `
Olá ${userName},

Bem-vindo ao SanoAgent - Sistema de Composição Musical Mediada por IA!

Estamos felizes em tê-lo conosco. Aqui você pode:
- Registrar seus pensamentos bons em um diário
- Transformar seus pensamentos em letras musicais
- Explorar diferentes gêneros musicais (Rock e Tropicália)
- Acompanhar seu progresso ao longo do semestre

Para começar, acesse seu diário e registre seu primeiro pensamento bom!

Qualquer dúvida, entre em contato conosco.

Atenciosamente,
Equipe SanoAgent
      `;

      MailApp.sendEmail(userEmail, subject, body);

      return {
        success: true,
        message: `Email de boas-vindas enviado para ${userEmail}`
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Envia notificação de composição gerada
   * @param {string} userEmail - Email do usuário
   * @param {string} compositionId - ID da composição
   * @param {string} genre - Gênero musical
   * @returns {Object} Resultado
   */
  sendCompositionNotification(userEmail, compositionId, genre) {
    try {
      const subject = 'Sua composição está pronta!';
      const body = `
Sua composição foi gerada com sucesso!

ID da Composição: ${compositionId}
Gênero: ${genre}

Acesse o SanoAgent para visualizar sua letra e refiná-la se desejar.

Divirta-se criando!
Equipe SanoAgent
      `;

      MailApp.sendEmail(userEmail, subject, body);

      return {
        success: true,
        message: `Notificação enviada para ${userEmail}`
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Envia relatório semanal
   * @param {string} userEmail - Email do usuário
   * @param {Object} stats - Estatísticas
   * @returns {Object} Resultado
   */
  sendWeeklyReport(userEmail, stats) {
    try {
      const subject = 'Seu Relatório Semanal - SanoAgent';
      const body = `
Olá!

Aqui está seu relatório semanal:

Entradas de Diário: ${stats.diaryEntries || 0}
Composições Geradas: ${stats.compositions || 0}
Gênero Favorito: ${stats.favoriteGenre || 'N/A'}
Humor Predominante: ${stats.dominantMood || 'N/A'}

Continue registrando seus pensamentos bons e criando composições incríveis!

Equipe SanoAgent
      `;

      MailApp.sendEmail(userEmail, subject, body);

      return {
        success: true,
        message: `Relatório enviado para ${userEmail}`
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Envia alerta de erro
   * @param {string} userEmail - Email do usuário
   * @param {string} errorMessage - Mensagem de erro
   * @returns {Object} Resultado
   */
  sendErrorAlert(userEmail, errorMessage) {
    try {
      const subject = 'Alerta: Erro no SanoAgent';
      const body = `
Olá,

Ocorreu um erro ao processar sua solicitação:

${errorMessage}

Nossa equipe foi notificada e está trabalhando para resolver o problema.

Equipe SanoAgent
      `;

      MailApp.sendEmail(userEmail, subject, body);

      return {
        success: true,
        message: `Alerta enviado para ${userEmail}`
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Envia convite para compartilhar composição
   * @param {string} recipientEmail - Email do destinatário
   * @param {string} senderName - Nome de quem envia
   * @param {string} compositionId - ID da composição
   * @returns {Object} Resultado
   */
  sendShareInvitation(recipientEmail, senderName, compositionId) {
    try {
      const subject = `${senderName} compartilhou uma composição com você!`;
      const body = `
Olá!

${senderName} compartilhou uma composição musical criada no SanoAgent com você!

ID da Composição: ${compositionId}

Acesse o SanoAgent para visualizar a composição e deixar um comentário.

Divirta-se!
Equipe SanoAgent
      `;

      MailApp.sendEmail(recipientEmail, subject, body);

      return {
        success: true,
        message: `Convite enviado para ${recipientEmail}`
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

/**
 * Classe para gerenciamento de alertas do sistema
 */
class AlertManager {
  /**
   * Construtor do gerenciador de alertas
   * @param {string} spreadsheetId - ID da planilha
   */
  constructor(spreadsheetId) {
    this.alertRepository = new BaseRepository(spreadsheetId, 'Alertas');
  }

  /**
   * Cria novo alerta
   * @param {string} type - Tipo de alerta
   * @param {string} message - Mensagem
   * @param {string} severity - Severidade (low, medium, high)
   * @returns {Object} Resultado
   */
  createAlert(type, message, severity = 'medium') {
    try {
      const alertId = `alert_${Date.now()}`;
      this.alertRepository.create([
        alertId,
        type,
        message,
        severity,
        new Date().toISOString(),
        'Ativo'
      ]);

      return {
        success: true,
        alertId: alertId
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtém alertas ativos
   * @returns {Array<Array>} Alertas
   */
  getActiveAlerts() {
    try {
      const allAlerts = this.alertRepository.readAll();
      return allAlerts.filter(alert => alert[5] === 'Ativo');
    } catch (error) {
      LoggerService.error(`Erro ao obter alertas: ${error.message}`);
      return [];
    }
  }

  /**
   * Marca alerta como resolvido
   * @param {string} alertId - ID do alerta
   * @returns {Object} Resultado
   */
  resolveAlert(alertId) {
    try {
      const allAlerts = this.alertRepository.readAll();
      
      for (let i = 1; i < allAlerts.length; i++) {
        if (allAlerts[i][0] === alertId) {
          this.alertRepository.updateCell(i, 6, 'Resolvido');
          return { success: true };
        }
      }

      return { success: false, error: 'Alerta não encontrado' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtém alertas por severidade
   * @param {string} severity - Severidade
   * @returns {Array<Array>} Alertas
   */
  getAlertsBySeverity(severity) {
    try {
      const allAlerts = this.alertRepository.readAll();
      return allAlerts.filter(alert => alert[3] === severity && alert[5] === 'Ativo');
    } catch (error) {
      return [];
    }
  }
}
