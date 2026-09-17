/**
 * @fileoverview triggers_automation.gs
 * @description Configuração de triggers e automações do sistema SanoAgent.
 * Implementa gatilhos para processamento automático de diários e composições.
 * @author SanoAgent Team
 * @version 1.0.0
 */

/**
 * Trigger executado ao editar a planilha
 * @param {Object} e - Evento de edição
 */
function onEdit(e) {
  try {
    const range = e.range;
    const sheet = range.getSheet();
    const sheetName = sheet.getName();

    // Se editou a aba de Diário, marca como pendente
    if (sheetName === 'Diário') {
      const row = range.getRow();
      if (row > 1) {
        sheet.getRange(row, 7).setValue('Pendente');
      }
    }
  } catch (error) {
    LoggerService.error(`Erro em onEdit: ${error.message}`);
  }
}

/**
 * Trigger instalável: Processa diários a cada hora
 * Deve ser instalado via Google Apps Script dashboard
 */
function processCompositionsHourly() {
  try {
    const spreadsheetId = getSpreadsheetId();
    const geminiKey = getGeminiApiKey();

    if (!spreadsheetId || !geminiKey) {
      LoggerService.info('Configurações não inicializadas');
      return;
    }

    const compositionService = new CompositionService(spreadsheetId, geminiKey);
    const result = compositionService.processPendingCompositions();

    LoggerService.info(`Processamento horário concluído: ${result.processed} composições`);
  } catch (error) {
    LoggerService.error(`Erro em processamento horário: ${error.message}`);
  }
}

/**
 * Trigger instalável: Gera relatório diário
 * Deve ser instalado via Google Apps Script dashboard
 */
function generateDailyReport() {
  try {
    try {
      const spreadsheetId = getSpreadsheetId();
      const diaryService = new DiaryService(spreadsheetId);

      const allEntries = diaryService.diaryRepository.readAll();
      const todayEntries = allEntries.filter(entry => {
        const entryDate = new Date(entry[5]).toDateString();
        const today = new Date().toDateString();
        return entryDate === today;
      });

      const report = {
        date: new Date().toISOString(),
        totalEntries: todayEntries.length,
        processed: todayEntries.filter(e => e[6] === 'Concluído').length,
        pending: todayEntries.filter(e => e[6] === 'Pendente').length
      };

      LoggerService.info(`Relatório diário: ${JSON.stringify(report)}`);
    } catch (error) {
      LoggerService.error(`Erro ao gerar relatório: ${error.message}`);
    }
  } catch (error) {
    Logger.log("Erro em generateDailyReport: " + error.message);
    throw error;
  }
}

/**
 * Trigger instalável: Limpeza semanal de dados antigos
 * Deve ser instalado via Google Apps Script dashboard
 */
function weeklyCleanup() {
  try {
    const spreadsheetId = getSpreadsheetId();
    const diaryService = new DiaryService(spreadsheetId);

    // Remove entradas com erro de mais de 30 dias
    const allEntries = diaryService.diaryRepository.readAll();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    for (let i = allEntries.length - 1; i > 0; i--) {
      const entryDate = new Date(allEntries[i][5]);
      if (entryDate < thirtyDaysAgo && allEntries[i][6] === 'Erro') {
        diaryService.diaryRepository.delete(i);
      }
    }

    LoggerService.info('Limpeza semanal concluída');
  } catch (error) {
    LoggerService.error(`Erro na limpeza semanal: ${error.message}`);
  }
}

/**
 * Instala triggers automáticos
 * Execute esta função uma vez para configurar os triggers
 */
function installTriggers() {
  try {
    try {
      const scriptId = ScriptApp.getScriptId();

      // Remove triggers existentes
      const triggers = ScriptApp.getProjectTriggers();
      triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));

      // Cria novo trigger horário
      ScriptApp.newTrigger('processCompositionsHourly')
        .timeBased()
        .everyHours(1)
        .create();

      // Cria trigger diário
      ScriptApp.newTrigger('generateDailyReport')
        .timeBased()
        .atTime(23, 0)  // 23:00
        .everyDays(1)
        .create();

      // Cria trigger semanal
      ScriptApp.newTrigger('weeklyCleanup')
        .timeBased()
        .onWeekDay(ScriptApp.WeekDay.SUNDAY)
        .atTime(2, 0)  // 02:00
        .create();

      LoggerService.info('Triggers instalados com sucesso');
    } catch (error) {
      LoggerService.error(`Erro ao instalar triggers: ${error.message}`);
    }
  } catch (error) {
    Logger.log("Erro em installTriggers: " + error.message);
    throw error;
  }
}

/**
 * Remove todos os triggers instalados
 */
function removeTriggers() {
  try {
    try {
      const triggers = ScriptApp.getProjectTriggers();
      triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
      LoggerService.info('Todos os triggers foram removidos');
    } catch (error) {
      LoggerService.error(`Erro ao remover triggers: ${error.message}`);
    }
  } catch (error) {
    Logger.log("Erro em removeTriggers: " + error.message);
    throw error;
  }
}

/**
 * Obtém informações sobre triggers instalados
 * @returns {Array} Lista de triggers
 */
function getTriggerInfo() {
  try {
    try {
      const triggers = ScriptApp.getProjectTriggers();
      const info = triggers.map(trigger => ({
        handlerFunction: trigger.getHandlerFunction(),
        triggerSource: trigger.getTriggerSource(),
        eventType: trigger.getEventType()
      }));

      LoggerService.info(`Triggers instalados: ${info.length}`);
      return info;
    } catch (error) {
      LoggerService.error(`Erro ao obter info de triggers: ${error.message}`);
      return [];
    }
  } catch (error) {
    Logger.log("Erro em getTriggerInfo: " + error.message);
    throw error;
  }
}
