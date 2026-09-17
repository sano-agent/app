/**
 * @fileoverview export_reports.gs
 * @description Serviço de exportação e geração de relatórios.
 * Implementa exportação para PDF, CSV e geração de relatórios diversos.
 * @author SanoAgent Team
 * @version 1.0.0
 */

/**
 * Classe para exportação de dados
 */
class ExportService {
  /**
   * Construtor do serviço de exportação
   * @param {string} spreadsheetId - ID da planilha
   */
  constructor(spreadsheetId) {
    this.spreadsheetId = spreadsheetId;
    this.spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  }

  /**
   * Exporta dados para CSV
   * @param {Array<Array>} data - Dados a exportar
   * @param {string} filename - Nome do arquivo
   * @returns {string} Conteúdo CSV
   */
  exportToCsv(data, filename = 'export.csv') {
    let csv = '';
    
    data.forEach(row => {
      const escapedRow = row.map(cell => {
        const str = String(cell);
        return str.includes(',') || str.includes('"') 
          ? `"${str.replace(/"/g, '""')}"` 
          : str;
      });
      csv += escapedRow.join(',') + '\n';
    });

    return csv;
  }

  /**
   * Cria arquivo CSV no Google Drive
   * @param {Array<Array>} data - Dados
   * @param {string} filename - Nome do arquivo
   * @returns {Object} Resultado
   */
  createCsvFile(data, filename = 'export.csv') {
    try {
      const csv = this.exportToCsv(data, filename);
      const folderId = getDriveFolderId();
      
      if (folderId) {
        const folder = DriveApp.getFolderById(folderId);
        const file = folder.createFile(filename, csv, MimeType.PLAIN_TEXT);
        return {
          success: true,
          fileId: file.getId(),
          fileName: file.getName(),
          url: file.getUrl()
        };
      }

      return { success: false, error: 'Pasta de destino não configurada' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Exporta composições para documento de texto
   * @param {string} userId - ID do usuário
   * @returns {Object} Resultado
   */
  exportCompositionsAsDocument(userId) {
    try {
      const geminiKey = getGeminiApiKey();
      const compositionService = new CompositionService(this.spreadsheetId, geminiKey);
      const compositions = compositionService.getUserCompositions(userId);

      let content = 'PORTFÓLIO DE COMPOSIÇÕES MUSICAIS\n';
      content += '================================\n\n';
      content += `Data de Geração: ${new Date().toISOString()}\n\n`;

      compositions.forEach((comp, index) => {
        content += `COMPOSIÇÃO ${index + 1}\n`;
        content += `Gênero: ${comp[3]}\n`;
        content += `Data: ${comp[5]}\n`;
        content += `\n${comp[4]}\n`;
        content += '\n---\n\n';
      });

      const folderId = getDriveFolderId();
      if (folderId) {
        const folder = DriveApp.getFolderById(folderId);
        const file = folder.createFile(
          `Composições_${userId}_${Date.now()}.txt`,
          content,
          MimeType.PLAIN_TEXT
        );
        return {
          success: true,
          fileId: file.getId(),
          fileName: file.getName(),
          url: file.getUrl()
        };
      }

      return { success: false, error: 'Pasta de destino não configurada' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

/**
 * Classe para geração de relatórios
 */
class ReportGenerator {
  /**
   * Construtor do gerador de relatórios
   * @param {string} spreadsheetId - ID da planilha
   */
  constructor(spreadsheetId) {
    this.spreadsheetId = spreadsheetId;
  }

  /**
   * Gera relatório de atividade do usuário
   * @param {string} userId - ID do usuário
   * @returns {Object} Relatório
   */
  generateUserActivityReport(userId) {
    try {
      const diaryService = new DiaryService(this.spreadsheetId);
      const geminiKey = getGeminiApiKey();
      const compositionService = new CompositionService(this.spreadsheetId, geminiKey);

      const diaryEntries = diaryService.getUserDiaryEntries(userId);
      const compositions = compositionService.getUserCompositions(userId);
      const diaryStats = diaryService.getDiaryStatistics(userId);
      const compStats = compositionService.getCompositionStatistics(userId);

      return {
        userId: userId,
        generatedAt: new Date().toISOString(),
        diaryActivity: {
          totalEntries: diaryEntries.length,
          statistics: diaryStats
        },
        compositionActivity: {
          totalCompositions: compositions.length,
          statistics: compStats
        },
        summary: {
          message: `Usuário ${userId} tem ${diaryEntries.length} entradas de diário e ${compositions.length} composições.`
        }
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Gera relatório de sistema
   * @returns {Object} Relatório do sistema
   */
  generateSystemReport() {
    try {
      const diaryService = new DiaryService(this.spreadsheetId);
      const allDiaryData = diaryService.diaryRepository.readAll();
      const allCompositions = new BaseRepository(this.spreadsheetId, 'Composições').readAll();

      const processedCount = allDiaryData.filter(d => d[6] === 'Concluído').length;
      const pendingCount = allDiaryData.filter(d => d[6] === 'Pendente').length;
      const errorCount = allDiaryData.filter(d => d[6] === 'Erro').length;

      return {
        generatedAt: new Date().toISOString(),
        diaryMetrics: {
          totalEntries: allDiaryData.length - 1,
          processed: processedCount,
          pending: pendingCount,
          errors: errorCount
        },
        compositionMetrics: {
          totalCompositions: allCompositions.length - 1
        },
        systemHealth: {
          status: errorCount === 0 ? 'Healthy' : 'Needs Attention',
          errorRate: ((errorCount / (allDiaryData.length - 1)) * 100).toFixed(2) + '%'
        }
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Gera relatório de gêneros musicais
   * @returns {Object} Relatório de gêneros
   */
  generateGenreReport() {
    try {
      const compositionRepository = new BaseRepository(this.spreadsheetId, 'Composições');
      const allCompositions = compositionRepository.readAll();

      const genreCount = {};
      allCompositions.slice(1).forEach(comp => {
        const genre = comp[3];
        genreCount[genre] = (genreCount[genre] || 0) + 1;
      });

      return {
        generatedAt: new Date().toISOString(),
        genres: genreCount,
        total: allCompositions.length - 1,
        distribution: Object.keys(genreCount).map(genre => ({
          genre: genre,
          count: genreCount[genre],
          percentage: ((genreCount[genre] / (allCompositions.length - 1)) * 100).toFixed(2) + '%'
        }))
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Gera relatório de moods
   * @returns {Object} Relatório de moods
   */
  generateMoodReport() {
    try {
      const diaryService = new DiaryService(this.spreadsheetId);
      const allDiaryData = diaryService.diaryRepository.readAll();

      const moodCount = {};
      allDiaryData.slice(1).forEach(entry => {
        const mood = entry[3];
        moodCount[mood] = (moodCount[mood] || 0) + 1;
      });

      return {
        generatedAt: new Date().toISOString(),
        moods: moodCount,
        total: allDiaryData.length - 1,
        distribution: Object.keys(moodCount).map(mood => ({
          mood: mood,
          count: moodCount[mood],
          percentage: ((moodCount[mood] / (allDiaryData.length - 1)) * 100).toFixed(2) + '%'
        }))
      };
    } catch (error) {
      return { error: error.message };
    }
  }
}
