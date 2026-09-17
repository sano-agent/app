/**
 * @fileoverview analytics_recommendations.gs
 * @description Serviço de análise de dados e recomendações personalizadas.
 * Implementa análise de padrões e sugestões para melhorar a experiência do usuário.
 * @author SanoAgent Team
 * @version 1.0.0
 */

/**
 * Classe para análise de dados
 */
class AnalyticsService {
  /**
   * Construtor do serviço de análise
   * @param {string} spreadsheetId - ID da planilha
   */
  constructor(spreadsheetId) {
    this.spreadsheetId = spreadsheetId;
    this.diaryService = new DiaryService(spreadsheetId);
  }

  /**
   * Analisa padrões de escrita do usuário
   * @param {string} userId - ID do usuário
   * @returns {Object} Análise de padrões
   */
  analyzeWritingPatterns(userId) {
    try {
      const entries = this.diaryService.getUserDiaryEntries(userId);
      
      if (entries.length === 0) {
        return { message: 'Sem dados suficientes para análise' };
      }

      const wordCounts = entries.map(e => e[2].split(' ').length);
      const avgWordCount = wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length;
      const maxWordCount = Math.max(...wordCounts);
      const minWordCount = Math.min(...wordCounts);

      const moods = entries.map(e => e[3]);
      const moodFrequency = {};
      moods.forEach(mood => {
        moodFrequency[mood] = (moodFrequency[mood] || 0) + 1;
      });

      const dominantMood = Object.keys(moodFrequency).reduce((a, b) => 
        moodFrequency[a] > moodFrequency[b] ? a : b
      );

      return {
        userId: userId,
        totalEntries: entries.length,
        writingStats: {
          averageWordCount: Math.round(avgWordCount),
          maxWordCount: maxWordCount,
          minWordCount: minWordCount
        },
        moodAnalysis: {
          dominantMood: dominantMood,
          moodDistribution: moodFrequency
        },
        writingStyle: this.classifyWritingStyle(avgWordCount)
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Classifica estilo de escrita
   * @param {number} avgWordCount - Média de palavras
   * @returns {string} Classificação
   */
  classifyWritingStyle(avgWordCount) {
    if (avgWordCount < 20) return 'Conciso';
    if (avgWordCount < 50) return 'Moderado';
    if (avgWordCount < 100) return 'Detalhado';
    return 'Muito Detalhado';
  }

  /**
   * Analisa tendência temporal de entradas
   * @param {string} userId - ID do usuário
   * @returns {Object} Análise temporal
   */
  analyzeTemporalTrend(userId) {
    try {
      const entries = this.diaryService.getUserDiaryEntries(userId);
      
      if (entries.length < 2) {
        return { message: 'Sem dados suficientes para análise temporal' };
      }

      const entriesByDay = {};
      entries.forEach(entry => {
        const date = new Date(entry[5]).toDateString();
        entriesByDay[date] = (entriesByDay[date] || 0) + 1;
      });

      const sortedDates = Object.keys(entriesByDay).sort();
      const trend = sortedDates.map(date => ({
        date: date,
        count: entriesByDay[date]
      }));

      const avgEntriesPerDay = entries.length / sortedDates.length;

      return {
        userId: userId,
        totalDays: sortedDates.length,
        averageEntriesPerDay: avgEntriesPerDay.toFixed(2),
        trend: trend,
        consistency: this.calculateConsistency(entriesByDay)
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Calcula consistência de uso
   * @param {Object} entriesByDay - Entradas por dia
   * @returns {string} Nível de consistência
   */
  calculateConsistency(entriesByDay) {
    const values = Object.values(entriesByDay);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev < 0.5) return 'Muito Consistente';
    if (stdDev < 1) return 'Consistente';
    if (stdDev < 2) return 'Moderadamente Consistente';
    return 'Inconsistente';
  }

  /**
   * Analisa emoções ao longo do tempo
   * @param {string} userId - ID do usuário
   * @returns {Object} Análise emocional
   */
  analyzeEmotionalJourney(userId) {
    try {
      const entries = this.diaryService.getUserDiaryEntries(userId);
      
      if (entries.length === 0) {
        return { message: 'Sem dados para análise emocional' };
      }

      const emotionalTimeline = entries.map(entry => ({
        date: entry[5],
        mood: entry[3],
        content: entry[2]
      }));

      const moodProgression = emotionalTimeline.map(e => e.mood);
      const uniqueMoods = [...new Set(moodProgression)];

      return {
        userId: userId,
        totalMoodChanges: this.countMoodChanges(moodProgression),
        uniqueMoods: uniqueMoods,
        timeline: emotionalTimeline,
        emotionalRange: uniqueMoods.length,
        startingMood: moodProgression[0],
        currentMood: moodProgression[moodProgression.length - 1]
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Conta mudanças de humor
   * @param {Array} moodProgression - Progressão de moods
   * @returns {number} Número de mudanças
   */
  countMoodChanges(moodProgression) {
    let changes = 0;
    for (let i = 1; i < moodProgression.length; i++) {
      if (moodProgression[i] !== moodProgression[i - 1]) {
        changes++;
      }
    }
    return changes;
  }
}

/**
 * Classe para recomendações personalizadas
 */
class RecommendationEngine {
  /**
   * Construtor do motor de recomendações
   * @param {string} spreadsheetId - ID da planilha
   */
  constructor(spreadsheetId) {
    this.spreadsheetId = spreadsheetId;
    this.analyticsService = new AnalyticsService(spreadsheetId);
    this.diaryService = new DiaryService(spreadsheetId);
  }

  /**
   * Gera recomendações para usuário
   * @param {string} userId - ID do usuário
   * @returns {Object} Recomendações
   */
  generateRecommendations(userId) {
    try {
      const recommendations = [];

      // Análise de atividade
      const entries = this.diaryService.getUserDiaryEntries(userId);
      
      if (entries.length === 0) {
        recommendations.push({
          type: 'engagement',
          priority: 'high',
          message: 'Comece a registrar seus pensamentos bons no diário!',
          action: 'create_first_entry'
        });
      } else if (entries.length < 5) {
        recommendations.push({
          type: 'engagement',
          priority: 'medium',
          message: `Você tem ${entries.length} entrada(s). Que tal adicionar mais pensamentos?`,
          action: 'create_entry'
        });
      }

      // Análise de padrões
      const patterns = this.analyticsService.analyzeWritingPatterns(userId);
      if (patterns.writingStyle === 'Conciso') {
        recommendations.push({
          type: 'writing',
          priority: 'low',
          message: 'Tente descrever seus pensamentos com mais detalhes!',
          action: 'expand_writing'
        });
      }

      // Análise temporal
      const temporal = this.analyticsService.analyzeTemporalTrend(userId);
      if (temporal.consistency === 'Inconsistente') {
        recommendations.push({
          type: 'consistency',
          priority: 'medium',
          message: 'Tente ser mais consistente com suas entradas de diário.',
          action: 'maintain_consistency'
        });
      }

      // Análise emocional
      const emotional = this.analyticsService.analyzeEmotionalJourney(userId);
      if (emotional.emotionalRange > 3) {
        recommendations.push({
          type: 'emotional',
          priority: 'low',
          message: 'Você está experimentando várias emoções. Isso é natural!',
          action: 'emotional_awareness'
        });
      }

      return {
        userId: userId,
        generatedAt: new Date().toISOString(),
        recommendations: recommendations,
        summary: `${recommendations.length} recomendação(ões) gerada(s)`
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Recomenda gênero musical baseado em padrões
   * @param {string} userId - ID do usuário
   * @returns {Object} Recomendação de gênero
   */
  recommendGenre(userId) {
    try {
      const patterns = this.analyticsService.analyzeWritingPatterns(userId);
      
      if (!patterns.moodAnalysis) {
        return { recommendation: 'Auto', reason: 'Sem dados suficientes' };
      }

      const dominantMood = patterns.moodAnalysis.dominantMood;

      let recommendation = 'Auto';
      let reason = '';

      if (dominantMood === 'Feliz' || dominantMood === 'Animado') {
        recommendation = 'Rock';
        reason = 'Seu humor positivo combina bem com o dinamismo do Rock';
      } else if (dominantMood === 'Reflexivo' || dominantMood === 'Pensativo') {
        recommendation = 'Tropicália';
        reason = 'Seu estilo reflexivo se alinha com a poesia da Tropicália';
      }

      return {
        userId: userId,
        recommendation: recommendation,
        reason: reason,
        confidence: 'medium'
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Sugere próximos passos para o usuário
   * @param {string} userId - ID do usuário
   * @returns {Array} Próximos passos
   */
  suggestNextSteps(userId) {
    try {
      const entries = this.diaryService.getUserDiaryEntries(userId);
      const steps = [];

      if (entries.length === 0) {
        steps.push('Crie sua primeira entrada de diário');
      } else if (entries.length < 3) {
        steps.push('Adicione mais entradas de diário');
      } else {
        steps.push('Gere composições para suas entradas');
      }

      const pendingEntries = entries.filter(e => e[6] === 'Pendente');
      if (pendingEntries.length > 0) {
        steps.push(`Processe ${pendingEntries.length} entrada(s) pendente(s)`);
      }

      steps.push('Revise e refine suas composições');
      steps.push('Compartilhe suas composições com amigos');

      return steps;
    } catch (error) {
      return [];
    }
  }
}
