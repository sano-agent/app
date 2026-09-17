/**
 * @fileoverview gemini_integration.gs
 * @description Integração com a API do Gemini para geração de letras musicais.
 * Implementa prompts estruturados para composição em estilos Rock e Tropicália.
 * @author SanoAgent Team
 * @version 1.0.0
 */

/**
 * Classe para integração com Gemini API
 */
class GeminiIntegration {
  /**
   * Construtor da integração Gemini
   * @param {string} apiKey - Chave da API do Gemini
   */
  constructor(apiKey) {
    this.apiKey = apiKey;
    // FROTA-07: modelo da property do script, nunca hardcoded; substitui o antigo
    // 'gemini-pro' (endpoint descontinuado) por um modelo permitido pela frota.
    this.model = (function () {
      try {
        return PropertiesService.getScriptProperties().getProperty('GEMINI_MODEL') || 'gemini-2.0-flash';
      } catch (e) {
        LoggerService.info('SanoAgent/FROTA-07 property indisponível: ' + e.message);
        return 'gemini-2.0-flash';
      }
    })();
    this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/' +
      this.model + ':generateContent';
  }

  /**
   * Gera letra musical em estilo Rock
   * @param {string} diaryContent - Conteúdo do diário
   * @param {string} mood - Humor/emoção
   * @returns {Object} Resultado com letra gerada
   */
  generateRockLyrics(diaryContent, mood = 'Feliz') {
    try {
      const prompt = this.buildRockPrompt(diaryContent, mood);
      return this.callGeminiApi(prompt);
    } catch (error) {
      return {
        success: false,
        error: `Erro ao gerar letra Rock: ${error.message}`
      };
    }
  }

  /**
   * Gera letra musical em estilo Tropicália
   * @param {string} diaryContent - Conteúdo do diário
   * @param {string} mood - Humor/emoção
   * @returns {Object} Resultado com letra gerada
   */
  generateTropicaliaLyrics(diaryContent, mood = 'Feliz') {
    try {
      const prompt = this.buildTropicaliaPrompt(diaryContent, mood);
      return this.callGeminiApi(prompt);
    } catch (error) {
      return {
        success: false,
        error: `Erro ao gerar letra Tropicália: ${error.message}`
      };
    }
  }

  /**
   * Constrói prompt para geração de letra Rock
   * @param {string} diaryContent - Conteúdo do diário
   * @param {string} mood - Humor
   * @returns {string} Prompt estruturado
   */
  buildRockPrompt(diaryContent, mood) {
    return `Você é um compositor de rock brasileiro criando uma canção para crianças de 9-10 anos.

Baseado no seguinte pensamento do diário:
"${diaryContent}"

Emoção associada: ${mood}

Crie uma letra de rock com as seguintes características:
- Métrica regular em 4/4
- Rimas simples e lineares
- Linguagem direta focada em ações e sentimentos
- 2 estrofes de 4 linhas cada
- 1 refrão de 2 linhas
- Inspiração em rock brasileiro (Jovem Guarda, clássico)
- Vocabulário acessível para crianças

Formato de resposta:
ESTROFE 1:
[4 linhas]

ESTROFE 2:
[4 linhas]

REFRÃO:
[2 linhas]

Gere apenas a letra, sem explicações adicionais.`;
  }

  /**
   * Constrói prompt para geração de letra Tropicália
   * @param {string} diaryContent - Conteúdo do diário
   * @param {string} mood - Humor
   * @returns {string} Prompt estruturado
   */
  buildTropicaliaPrompt(diaryContent, mood) {
    return `Você é um compositor tropicalista criando uma canção para crianças de 9-10 anos.

Baseado no seguinte pensamento do diário:
"${diaryContent}"

Emoção associada: ${mood}

Crie uma letra tropicalista com as seguintes características:
- Métrica sincopada e experimental
- Rimas internas e criativas
- Linguagem metafórica e poética
- Justaposição de imagens e cores
- 2 estrofes de 4 linhas cada
- 1 refrão de 2 linhas
- Inspiração em tropicália (Caetano, Gil, Mutantes)
- Mistura de elementos arcaicos e modernos
- Vocabulário rico mas acessível

Formato de resposta:
ESTROFE 1:
[4 linhas]

ESTROFE 2:
[4 linhas]

REFRÃO:
[2 linhas]

Gere apenas a letra, sem explicações adicionais.`;
  }

  /**
   * Chama a API do Gemini
   * @param {string} prompt - Prompt para geração
   * @returns {Object} Resposta da API
   */
  callGeminiApi(prompt) {
    // FROTA-05: bloqueio de rate limit / quota antes de atingir o provedor.
    try {
      if (typeof AiRateLimitService !== 'undefined') {
        const _rl = AiRateLimitService.check('sanoLyrics', prompt);
        if (_rl && _rl.dedupHit && _rl.cached) return _rl.cached;
      }
    } catch (e) {
      if (e && e.isAiLimit) {
        return { success: false, rateLimited: true,
          error: 'Limite de geração atingido. Aguarde um instante e tente novamente.' };
      }
      throw e;
    }

    const _t06 = Date.now();
    try {
      const payload = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      };

      const options = {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      };

      const url = `${this.apiUrl}?key=${this.apiKey}`;
      const response = this.fetchComRetentativa(url, options);
      const result = JSON.parse(response.getContentText());

      if (response.getResponseCode() === 200) {
        const generatedText = result.candidates[0].content.parts[0].text;
        _sanoGeminiAudit_(this.model, _t06, 'ok', '');
        return {
          success: true,
          lyrics: generatedText,
          timestamp: new Date().toISOString()
        };
      } else {
        _sanoGeminiAudit_(this.model, _t06, 'fail', 'API_' + response.getResponseCode());
        return {
          success: false,
          error: (result.error && result.error.message) || 'Erro na API do Gemini'
        };
      }
    } catch (error) {
      _sanoGeminiAudit_(this.model, _t06, 'fail', String(error.message).slice(0, 60));
      return {
        success: false,
        error: `Erro ao chamar API: ${error.message}`
      };
    }
  }

  /**
   * Wrapper de resiliência sobre UrlFetchApp.fetch: repete a chamada em falhas
   * transitórias do Gemini (HTTP 429/500/503 e exceções de rede) com backoff
   * exponencial. As opções devem manter muteHttpExceptions:true.
   * @param {string} url
   * @param {Object} options
   * @returns {GoogleAppsScript.URL_Fetch.HTTPResponse}
   */
  fetchComRetentativa(url, options) {
    const MAX_TENTATIVAS = 3;
    let esperaMs = 700;
    for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa++) {
      try {
        const resp = UrlFetchApp.fetch(url, options);
        const codigo = resp.getResponseCode();
        const transitorio = (codigo === 429 || codigo === 500 || codigo === 503);
        if (transitorio && tentativa < MAX_TENTATIVAS) {
          Utilities.sleep(esperaMs);
          esperaMs *= 2;
          continue;
        }
        return resp;
      } catch (e) {
        if (tentativa >= MAX_TENTATIVAS) throw e;
        Utilities.sleep(esperaMs);
        esperaMs *= 2;
      }
    }
  }

  /**
   * Gera sugestão de gênero baseado no conteúdo
   * @param {string} diaryContent - Conteúdo do diário
   * @returns {string} Gênero sugerido (Rock ou Tropicália)
   */
  suggestGenre(diaryContent) {
    // Palavras-chave para cada gênero
    const rockKeywords = ['ação', 'correr', 'jogar', 'ganhar', 'forte', 'rápido', 'vitória'];
    const tropicaliaKeywords = ['cores', 'sonho', 'imaginação', 'beleza', 'natureza', 'poesia'];

    let rockScore = 0;
    let tropicaliaScore = 0;

    const lowerContent = diaryContent.toLowerCase();

    rockKeywords.forEach(keyword => {
      if (lowerContent.includes(keyword)) rockScore++;
    });

    tropicaliaKeywords.forEach(keyword => {
      if (lowerContent.includes(keyword)) tropicaliaScore++;
    });

    return rockScore > tropicaliaScore ? 'Rock' : 'Tropicália';
  }

  /**
   * Gera letra com gênero automático
   * @param {string} diaryContent - Conteúdo do diário
   * @param {string} mood - Humor
   * @returns {Object} Resultado com letra e gênero
   */
  generateAutoLyrics(diaryContent, mood = 'Feliz') {
    const suggestedGenre = this.suggestGenre(diaryContent);
    
    if (suggestedGenre === 'Rock') {
      const result = this.generateRockLyrics(diaryContent, mood);
      result.genre = 'Rock';
      return result;
    } else {
      const result = this.generateTropicaliaLyrics(diaryContent, mood);
      result.genre = 'Tropicália';
      return result;
    }
  }

  /**
   * Refina letra existente
   * @param {string} lyrics - Letra a refinar
   * @param {string} feedback - Feedback para refinamento
   * @returns {Object} Letra refinada
   */
  refineLyrics(lyrics, feedback) {
    try {
      const prompt = `Você é um compositor musical refinando uma letra infantil.

Letra original:
${lyrics}

Feedback para melhoria:
${feedback}

Refine a letra mantendo o estilo e a estrutura, mas incorporando o feedback fornecido.
Retorne apenas a letra refinada, sem explicações.`;

      return this.callGeminiApi(prompt);
    } catch (error) {
      return {
        success: false,
        error: `Erro ao refinar letra: ${error.message}`
      };
    }
  }
}

/**
 * FROTA-06: grava o registro técnico mínimo da geração no log de auditoria da
 * frota, sem reproduzir conteúdo sensível (diário, letra ou prompt). Silencioso
 * se o serviço de auditoria não estiver presente.
 * @param {string} model    Modelo efetivamente usado.
 * @param {number} startMs   Timestamp do início da chamada.
 * @param {string} status    'ok' | 'fail'
 * @param {string} errorCode Código resumido do erro (vazio em sucesso).
 */
function _sanoGeminiAudit_(model, startMs, status, errorCode) {
  try {
    if (typeof AiAuditLogService === 'undefined') return;
    AiAuditLogService.record({
      useCase: 'sanoLyrics',
      model: model,
      durationMs: Date.now() - startMs,
      status: status,
      fallback: false,
      errorCode: errorCode || ''
    });
  } catch (_) { /* auditoria nunca quebra o fluxo */ }
}
