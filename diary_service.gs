/**
 * @fileoverview diary_service.gs
 * @description Serviço para gerenciamento de registros de diário (pensamentos bons).
 * Implementa CRUD para entradas de diário e integração com processamento de IA.
 * @author SanoAgent Team
 * @version 1.0.0
 */

/**
 * Classe para gerenciamento de diários
 */
class DiaryService {
  /**
   * Construtor do serviço de diário
   * @param {string} spreadsheetId - ID da planilha
   */
  constructor(spreadsheetId) {
    this.diaryRepository = new BaseRepository(spreadsheetId, 'Diário');
  }

  /**
   * Cria nova entrada de diário
   * @param {string} userId - ID do usuário
   * @param {string} content - Conteúdo do pensamento bom
   * @param {string} mood - Humor/emoção associada
   * @param {string} category - Categoria (Gratidão, Conquista, Relacionamento, etc)
   * @returns {Object} Resultado da criação
   */
  createDiaryEntry(userId, content, mood = 'Feliz', category = 'Geral') {
    try {
      const timestamp = new Date().toISOString();
      const entryId = `entry_${Date.now()}`;
      
      this.diaryRepository.create([
        entryId,
        userId,
        content,
        mood,
        category,
        timestamp,
        'Pendente',  // Status de processamento
        ''           // Campo para letra gerada
      ]);

      return {
        success: true,
        entryId: entryId,
        message: 'Entrada de diário criada com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: `Erro ao criar entrada: ${error.message}`
      };
    }
  }

  /**
   * Obtém todas as entradas de um usuário
   * @param {string} userId - ID do usuário
   * @returns {Array<Array>} Entradas do usuário
   */
  getUserDiaryEntries(userId) {
    try {
      return this.diaryRepository.findByColumn(2, userId);
    } catch (error) {
      LoggerService.error(`Erro ao obter entradas: ${error.message}`);
      return [];
    }
  }

  /**
   * Obtém entrada específica de diário
   * @param {string} entryId - ID da entrada
   * @returns {Array} Dados da entrada
   */
  getDiaryEntry(entryId) {
    try {
      const results = this.diaryRepository.findByColumn(1, entryId);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      LoggerService.error(`Erro ao obter entrada: ${error.message}`);
      return null;
    }
  }

  /**
   * Atualiza entrada de diário
   * @param {string} entryId - ID da entrada
   * @param {string} newContent - Novo conteúdo
   * @returns {Object} Resultado da atualização
   */
  updateDiaryEntry(entryId, newContent) {
    try {
      const allEntries = this.diaryRepository.readAll();
      
      for (let i = 1; i < allEntries.length; i++) {
        if (allEntries[i][0] === entryId) {
          this.diaryRepository.updateCell(i, 3, newContent);
          return { success: true, message: 'Entrada atualizada' };
        }
      }
      
      return { success: false, error: 'Entrada não encontrada' };
    } catch (error) {
      return { success: false, error: `Erro: ${error.message}` };
    }
  }

  /**
   * Deleta entrada de diário
   * @param {string} entryId - ID da entrada
   * @returns {Object} Resultado da deleção
   */
  deleteDiaryEntry(entryId) {
    try {
      const allEntries = this.diaryRepository.readAll();
      
      for (let i = 1; i < allEntries.length; i++) {
        if (allEntries[i][0] === entryId) {
          this.diaryRepository.delete(i);
          return { success: true, message: 'Entrada deletada' };
        }
      }
      
      return { success: false, error: 'Entrada não encontrada' };
    } catch (error) {
      return { success: false, error: `Erro: ${error.message}` };
    }
  }

  /**
   * Atualiza status de processamento de uma entrada
   * @param {string} entryId - ID da entrada
   * @param {string} status - Novo status (Pendente, Processando, Concluído, Erro)
   */
  updateEntryStatus(entryId, status) {
    try {
      const allEntries = this.diaryRepository.readAll();
      
      for (let i = 1; i < allEntries.length; i++) {
        if (allEntries[i][0] === entryId) {
          this.diaryRepository.updateCell(i, 7, status);
          return { success: true };
        }
      }
      return { success: false, error: 'Entrada não encontrada' };
    } catch (error) {
      LoggerService.error(`Erro ao atualizar status: ${error.message}`);
    }
  }

  /**
   * Salva letra gerada para uma entrada
   * @param {string} entryId - ID da entrada
   * @param {string} lyrics - Letra gerada
   * @param {string} genre - Gênero musical (Rock, Tropicália)
   */
  saveLyrics(entryId, lyrics, genre = 'Rock') {
    try {
      const allEntries = this.diaryRepository.readAll();
      
      for (let i = 1; i < allEntries.length; i++) {
        if (allEntries[i][0] === entryId) {
          const lyricsData = JSON.stringify({ lyrics, genre, timestamp: new Date().toISOString() });
          this.diaryRepository.updateCell(i, 8, lyricsData);
          this.diaryRepository.updateCell(i, 7, 'Concluído');
          return { success: true };
        }
      }
      return { success: false, error: 'Entrada não encontrada' };
    } catch (error) {
      LoggerService.error(`Erro ao salvar letra: ${error.message}`);
    }
  }

  /**
   * Obtém entradas pendentes de processamento
   * @returns {Array<Array>} Entradas pendentes
   */
  getPendingEntries() {
    try {
      const allEntries = this.diaryRepository.readAll();
      return allEntries.filter(entry => entry[6] === 'Pendente');
    } catch (error) {
      LoggerService.error(`Erro ao obter entradas pendentes: ${error.message}`);
      return [];
    }
  }

  /**
   * Obtém estatísticas do diário
   * @param {string} userId - ID do usuário
   * @returns {Object} Estatísticas
   */
  getDiaryStatistics(userId) {
    try {
      const userEntries = this.getUserDiaryEntries(userId);
      const moods = {};
      const categories = {};
      
      userEntries.forEach(entry => {
        const mood = entry[3];
        const category = entry[4];
        
        moods[mood] = (moods[mood] || 0) + 1;
        categories[category] = (categories[category] || 0) + 1;
      });

      return {
        totalEntries: userEntries.length,
        moods: moods,
        categories: categories,
        lastEntry: userEntries.length > 0 ? userEntries[userEntries.length - 1][5] : null
      };
    } catch (error) {
      LoggerService.error(`Erro ao obter estatísticas: ${error.message}`);
      return {};
    }
  }

  /**
   * Exporta diário em formato JSON
   * @param {string} userId - ID do usuário
   * @returns {Array<Object>} Diário em JSON
   */
  exportDiaryAsJson(userId) {
    try {
      const userEntries = this.getUserDiaryEntries(userId);
      return userEntries.map(entry => ({
        id: entry[0],
        content: entry[2],
        mood: entry[3],
        category: entry[4],
        timestamp: entry[5],
        status: entry[6],
        lyrics: entry[7] ? JSON.parse(entry[7]) : null
      }));
    } catch (error) {
      LoggerService.error(`Erro ao exportar diário: ${error.message}`);
      return [];
    }
  }
}
