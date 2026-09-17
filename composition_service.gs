/**
 * @fileoverview composition_service.gs
 * @description Serviço de composição musical que orquestra a geração de letras.
 * Integra Diary Service, Gemini Integration e Repository Pattern.
 * @author SanoAgent Team
 * @version 1.0.0
 */

/**
 * Classe para gerenciamento de composições musicais
 */
class CompositionService {
  /**
   * Construtor do serviço de composição
   * @param {string} spreadsheetId - ID da planilha
   * @param {string} geminiApiKey - Chave da API Gemini
   */
  constructor(spreadsheetId, geminiApiKey) {
    this.diaryService = new DiaryService(spreadsheetId);
    this.geminiIntegration = new GeminiIntegration(geminiApiKey);
    this.compositionRepository = new BaseRepository(spreadsheetId, 'Composições');
  }

  /**
   * Processa entrada de diário e gera composição
   * @param {string} entryId - ID da entrada de diário
   * @param {string} genre - Gênero musical (Rock, Tropicália, Auto)
   * @returns {Object} Resultado da composição
   */
  generateDraft(entryId, genre = 'Auto') {
    try {
      // Obtém entrada de diário
      const entry = this.diaryService.getDiaryEntry(entryId);
      if (!entry) {
        return { success: false, error: 'Entrada de diário não encontrada' };
      }

      const diaryContent = entry[2];
      const mood = entry[3];

      // Gera letra baseado no gênero
      let result;
      if (genre === 'Auto') {
        result = this.geminiIntegration.generateAutoLyrics(diaryContent, mood);
      } else if (genre === 'Rock') {
        result = this.geminiIntegration.generateRockLyrics(diaryContent, mood);
      } else if (genre === 'Tropicália') {
        result = this.geminiIntegration.generateTropicaliaLyrics(diaryContent, mood);
      } else {
        return { success: false, error: 'Gênero inválido' };
      }

      if (!result.success) {
        return result;
      }

      return {
        success: true,
        genre: result.genre || genre,
        lyrics: result.lyrics,
        message: 'Rascunho gerado; revise antes de salvar.'
      };
    } catch (error) {
      return {
        success: false,
        error: `Erro ao processar composição: ${error.message}`
      };
    }
  }

  /**
   * Persiste somente a versão que já passou pela aprovação humana na fachada.
   */
  saveApprovedComposition(entryId, userId, genre, lyrics) {
    try {
      const entry = this.diaryService.getDiaryEntry(entryId);
      if (!entry || String(entry[1] || '') !== String(userId || '')) {
        return { success: false, error: 'Entrada de diário não encontrada' };
      }
      const text = String(lyrics || '').trim();
      if (!text) return { success: false, error: 'A letra aprovada está vazia' };

      this.diaryService.saveLyrics(entryId, text, genre);
      const compositionId = `comp_${Date.now()}`;
      this.compositionRepository.create([
        compositionId, userId, entryId, genre, text,
        new Date().toISOString(), 'Ativa'
      ]);
      return {
        success: true,
        compositionId: compositionId,
        genre: genre,
        lyrics: text,
        message: 'Versão aprovada salva no portfólio.'
      };
    } catch (error) {
      return { success: false, error: `Erro ao salvar composição: ${error.message}` };
    }
  }

  /**
   * Compatibilidade: o processamento automático agora produz somente rascunho.
   */
  processComposition(entryId, genre = 'Auto') {
    return this.generateDraft(entryId, genre);
  }

  /**
   * Processa todas as entradas pendentes
   * @returns {Object} Resultado do processamento em lote
   */
  processPendingCompositions() {
    return {
      success: false,
      error: 'Processamento em lote desativado: cada letra exige consentimento e revisão humana interativa.'
    };
  }

  /**
   * Obtém composição por ID
   * @param {string} compositionId - ID da composição
   * @returns {Array} Dados da composição
   */
  getComposition(compositionId) {
    try {
      const results = this.compositionRepository.findByColumn(1, compositionId);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      LoggerService.error(`Erro ao obter composição: ${error.message}`);
      return null;
    }
  }

  /**
   * Obtém todas as composições de um usuário
   * @param {string} userId - ID do usuário
   * @returns {Array<Array>} Composições do usuário
   */
  getUserCompositions(userId) {
    try {
      return this.compositionRepository.findByColumn(2, userId);
    } catch (error) {
      LoggerService.error(`Erro ao obter composições: ${error.message}`);
      return [];
    }
  }

  /**
   * Refina composição existente
   * @param {string} compositionId - ID da composição
   * @param {string} feedback - Feedback para refinamento
   * @returns {Object} Composição refinada
   */
  refineComposition(compositionId, feedback) {
    try {
      const composition = this.getComposition(compositionId);
      if (!composition) {
        return { success: false, error: 'Composição não encontrada' };
      }

      const currentLyrics = composition[4];
      const result = this.geminiIntegration.refineLyrics(currentLyrics, feedback);

      if (result.success) {
        return {
          success: true,
          lyrics: result.lyrics,
          genre: composition[3],
          message: 'Refinamento gerado como rascunho; aprove antes de salvar.'
        };
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: `Erro ao refinar composição: ${error.message}`
      };
    }
  }

  /**
   * Obtém estatísticas de composições
   * @param {string} userId - ID do usuário
   * @returns {Object} Estatísticas
   */
  getCompositionStatistics(userId) {
    try {
      const userCompositions = this.getUserCompositions(userId);
      const genreCount = {};
      
      userCompositions.forEach(comp => {
        const genre = comp[3];
        genreCount[genre] = (genreCount[genre] || 0) + 1;
      });

      return {
        totalCompositions: userCompositions.length,
        byGenre: genreCount,
        lastComposition: userCompositions.length > 0 ? userCompositions[userCompositions.length - 1][5] : null
      };
    } catch (error) {
      LoggerService.error(`Erro ao obter estatísticas: ${error.message}`);
      return {};
    }
  }

  /**
   * Exporta composição em formato de texto
   * @param {string} compositionId - ID da composição
   * @returns {string} Composição formatada
   */
  exportCompositionAsText(compositionId) {
    try {
      const composition = this.getComposition(compositionId);
      if (!composition) return '';

      let text = `COMPOSIÇÃO MUSICAL
`;
      text += `================

`;
      text += `ID: ${composition[0]}
`;
      text += `Gênero: ${composition[3]}
`;
      text += `Data: ${composition[5]}

`;
      text += `LETRA:
`;
      text += `------
`;
      text += `${composition[4]}
`;

      return text;
    } catch (error) {
      LoggerService.error(`Erro ao exportar: ${error.message}`);
      return '';
    }
  }

  /**
   * Cria portfólio musical do semestre
   * @param {string} userId - ID do usuário
   * @returns {Object} Portfólio compilado
   */
  createSemesterPortfolio(userId) {
    try {
      const compositions = this.getUserCompositions(userId);
      const portfolio = {
        userId: userId,
        semester: new Date().toISOString(),
        totalCompositions: compositions.length,
        compositions: compositions.map(comp => ({
          id: comp[0],
          genre: comp[3],
          lyrics: comp[4],
          date: comp[5]
        }))
      };

      return {
        success: true,
        portfolio: portfolio
      };
    } catch (error) {
      return {
        success: false,
        error: `Erro ao criar portfólio: ${error.message}`
      };
    }
  }
}
