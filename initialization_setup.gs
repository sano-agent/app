/**
 * @fileoverview initialization_setup.gs
 * @description Script de inicialização e configuração do sistema SanoAgent.
 * Implementa setup automático, criação de abas e dados iniciais.
 * @author SanoAgent Team
 * @version 1.0.0
 */

/**
 * Função principal de inicialização
 * Execute esta função uma vez para configurar o sistema
 */
function initializeSanoAgent() {
  try {
    LoggerService.info('Iniciando configuração do SanoAgent...');

    // 1. Inicializa propriedades padrão
    initializeDefaultProperties();
    LoggerService.info('✓ Propriedades padrão inicializadas');

    // 2. Cria abas necessárias
    createRequiredSheets();
    LoggerService.info('✓ Abas criadas');

    // 3. Adiciona cabeçalhos
    addSheetHeaders();
    LoggerService.info('✓ Cabeçalhos adicionados');

    // 4. Instala triggers
    installTriggers();
    LoggerService.info('✓ Triggers instalados');

    // 5. Cria usuário de teste
    createTestUser();
    LoggerService.info('✓ Usuário de teste criado');

    LoggerService.info('✓ Configuração do SanoAgent concluída com sucesso!');
    return { success: true, message: 'Sistema inicializado' };
  } catch (error) {
    LoggerService.error(`✗ Erro na inicialização: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Cria abas necessárias na planilha
 */
function createRequiredSheets() {
  try {
    try {
      const spreadsheetId = getSpreadsheetId();
      const spreadsheet = SpreadsheetApp.openById(spreadsheetId);

      const requiredSheets = [
        'Usuários',
        'Diário',
        'Composições',
        'Histórico de Acesso',
        'Auditoria',
        'Alertas',
        'Configurações'
      ];

      requiredSheets.forEach(sheetName => {
        try {
          const sheet = spreadsheet.getSheetByName(sheetName);
          if (!sheet) {
            spreadsheet.insertSheet(sheetName);
            LoggerService.info(`Aba criada: ${sheetName}`);
          }
        } catch (error) {
          LoggerService.error(`Erro ao criar aba ${sheetName}: ${error.message}`);
        }
      });
    } catch (error) {
      Logger.log("Erro em createRequiredSheets: " + error.message);
      throw error;
    }
  } catch (error) {
    Logger.log("Erro em createRequiredSheets: " + error.message);
    throw error;
  }
}

/**
 * Adiciona cabeçalhos às abas
 */
function addSheetHeaders() {
  try {
    const spreadsheetId = getSpreadsheetId();
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);

    const headers = {
      'Usuários': ['username', 'password', 'userId', 'role', 'createdAt'],
      'Diário': ['entryId', 'userId', 'content', 'mood', 'category', 'timestamp', 'status', 'lyrics'],
      'Composições': ['compositionId', 'userId', 'entryId', 'genre', 'lyrics', 'timestamp', 'status'],
      'Histórico de Acesso': ['userId', 'action', 'timestamp', 'details'],
      'Auditoria': ['auditId', 'userId', 'eventType', 'details', 'severity', 'timestamp'],
      'Alertas': ['alertId', 'type', 'message', 'severity', 'timestamp', 'status'],
      'Configurações': ['key', 'value', 'description', 'lastUpdated']
    };

    for (const [sheetName, headerRow] of Object.entries(headers)) {
      try {
        const sheet = spreadsheet.getSheetByName(sheetName);
        if (sheet && sheet.getLastRow() === 0) {
          sheet.appendRow(headerRow);
          LoggerService.info(`Cabeçalhos adicionados: ${sheetName}`);
        }
      } catch (error) {
        LoggerService.error(`Erro ao adicionar cabeçalhos em ${sheetName}: ${error.message}`);
      }
    }
  } catch (error) {
    Logger.log("Erro em addSheetHeaders: " + error.message);
    throw error;
  }
}

/**
 * Cria usuário de teste
 */
function createTestUser() {
  try {
    const spreadsheetId = getSpreadsheetId();
    const authService = new AuthService(spreadsheetId);

    const result = authService.registerUser('teste', 'teste123', 'student');

    if (result.success) {
      LoggerService.info(`Usuário de teste criado: ${result.userId}`);
    }
  } catch (error) {
    LoggerService.error(`Erro ao criar usuário de teste: ${error.message}`);
  }
}

/**
 * Reseta o sistema (remove todos os dados)
 * CUIDADO: Esta função deleta todos os dados!
 */
function resetSystem() {
  try {
    if (!confirm('Tem certeza que deseja resetar o sistema? Todos os dados serão perdidos!')) {
      return;
    }

    const spreadsheetId = getSpreadsheetId();
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);

    const sheets = spreadsheet.getSheets();
    sheets.forEach(sheet => {
      if (sheet.getSheetId() !== spreadsheet.getActiveSheet().getSheetId()) {
        spreadsheet.deleteSheet(sheet);
      }
    });

    LoggerService.info('Sistema resetado');
  } catch (error) {
    LoggerService.error(`Erro ao resetar: ${error.message}`);
  }
}

/**
 * Valida configuração do sistema
 * @returns {Object} Resultado da validação
 */
function validateSystemConfiguration() {
  try {
    const issues = [];

    // Verifica propriedades
    const spreadsheetId = getSpreadsheetId();
    if (!spreadsheetId) {
      issues.push('SPREADSHEETS_ID não configurado');
    }

    const geminiKey = getGeminiApiKey();
    if (!geminiKey) {
      issues.push('GEMINI_API_KEY não configurado');
    }

    // Verifica abas
    try {
      const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      const requiredSheets = ['Usuários', 'Diário', 'Composições'];
    
      requiredSheets.forEach(sheetName => {
        if (!spreadsheet.getSheetByName(sheetName)) {
          issues.push(`Aba '${sheetName}' não encontrada`);
        }
      });
    } catch (error) {
      issues.push(`Erro ao validar abas: ${error.message}`);
    }

    return {
      valid: issues.length === 0,
      issues: issues,
      status: issues.length === 0 ? 'OK' : 'Problemas Encontrados'
    };
  } catch (error) {
    Logger.log("Erro em validateSystemConfiguration: " + error.message);
    throw error;
  }
}

/**
 * Exibe status do sistema
 */
function showSystemStatus() {
  try {
    try {
      const validation = validateSystemConfiguration();
      const report = new ReportGenerator(getSpreadsheetId()).generateSystemReport();

      const status = {
        configuration: validation,
        metrics: report
      };

      LoggerService.info(JSON.stringify(status, null, 2));
      return status;
    } catch (error) {
      Logger.log("Erro em showSystemStatus: " + error.message);
      throw error;
    }
  } catch (error) {
    Logger.log("Erro em showSystemStatus: " + error.message);
    throw error;
  }
}

/**
 * Cria dados de exemplo para teste
 */
function createSampleData() {
  try {
    try {
      const spreadsheetId = getSpreadsheetId();
      const diaryService = new DiaryService(spreadsheetId);

      // Cria entradas de exemplo
      const sampleEntries = [
        { content: 'Hoje aprendi algo novo na escola!', mood: 'Feliz', category: 'Conquista' },
        { content: 'Brinquei com meus amigos no parque.', mood: 'Animado', category: 'Relacionamento' },
        { content: 'Ajudei minha mãe a preparar o almoço.', mood: 'Grato', category: 'Família' }
      ];

      sampleEntries.forEach(entry => {
        diaryService.createDiaryEntry(
          'user_teste',
          entry.content,
          entry.mood,
          entry.category
        );
      });

      LoggerService.info('Dados de exemplo criados');
      return { success: true, message: 'Dados de exemplo criados' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  } catch (error) {
    Logger.log("Erro em createSampleData: " + error.message);
    throw error;
  }
}

/**
 * Exporta configuração do sistema
 * @returns {Object} Configuração
 */
function exportSystemConfiguration() {
  const config = {
    version: '1.0.0',
    language: 'pt-BR',
    spreadsheetId: getSpreadsheetId(),
    musicGenres: ['Rock', 'Tropicália'],
    validMoods: ['Feliz', 'Triste', 'Animado', 'Calmo', 'Reflexivo', 'Grato', 'Pensativo'],
    categories: ['Geral', 'Conquista', 'Relacionamento', 'Família', 'Escola', 'Gratidão'],
    validation: validateSystemConfiguration()
  };

  return config;
}
