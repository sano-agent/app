// AiContractTestAdapter.gs — FROTA-08 (Sano Agent)
function _AiContractSubject_() {
  // Tenta a rota de geração de letra mais simples disponível
  try {
    var g = new SanoGemini();
    return typeof g.generateRock === 'function'
      ? g.generateRock('smoke test tema')
      : g.generate('smoke test tema');
  } catch(e) {
    // Se o construtor não existir, tenta global
    return typeof gerarLetraSano === 'function'
      ? gerarLetraSano('smoke')
      : { ok: false, source: 'no-entry', error: e.message };
  }
}