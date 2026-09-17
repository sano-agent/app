/**
 * Dados sintéticos — Sano Agent - Quem canta seus males espanta
 * Gerado em 2026-06-21 01:10:44 por generate_synthetic_data_all_projects.py
 *
 * Execute populateSyntheticData() PELO EDITOR do Apps Script para popular
 * as abas de domínio com ~30 registros cada (valida os gráficos do notebook).
 * Idempotente: limpa as linhas de dados antes de reinserir.
 *
 * NÃO define onOpen() — para não colidir com o menu real do projeto.
 */

function populateSyntheticData() {
  try {
    try {
      try {
        var ss = SpreadsheetApp.getActiveSpreadsheet();
        var results = [];

        // Composicoes
        try {
          var sheet_Composicoes = ss.getSheetByName('Composicoes') || ss.insertSheet('Composicoes');
          if (sheet_Composicoes.getLastRow() > 1) {
            sheet_Composicoes.deleteRows(2, sheet_Composicoes.getLastRow() - 1);
          }
          var h_sheet_Composicoes = ["ID", "Titulo", "Genero", "DuracaoSeg", "Tom", "Dificuldade", "Status", "CreatedAt"];
          sheet_Composicoes.getRange(1, 1, 1, h_sheet_Composicoes.length).setValues([h_sheet_Composicoes]);
          var d_sheet_Composicoes = [
            ["COM-0001", "Prática", "Rock", 341, "F", "dificil", "inativo", "2026-03-31 01:10:44"],
            ["COM-0002", "Revisão", "Samba", 72, "A", "medio", "ativo", "2026-04-18 01:10:44"],
            ["COM-0003", "Prática", "Pop", 61, "E", "dificil", "inativo", "2026-05-02 01:10:44"],
            ["COM-0004", "Revisão", "MPB", 462, "A", "dificil", "ativo", "2026-03-25 01:10:44"],
            ["COM-0005", "Avaliação", "MPB", 419, "C", "medio", "ativo", "2026-04-21 01:10:44"],
            ["COM-0006", "Prática", "Samba", 124, "C", "facil", "ativo", "2026-04-23 01:10:44"],
            ["COM-0007", "Avaliação", "Tropicália", 375, "D", "dificil", "inativo", "2026-06-16 01:10:44"],
            ["COM-0008", "Prática", "Pop", 595, "B", "dificil", "inativo", "2026-05-24 01:10:44"],
            ["COM-0009", "Revisão", "Clássica", 127, "C", "dificil", "ativo", "2026-04-06 01:10:44"],
            ["COM-0010", "Introdução", "Samba", 485, "C", "dificil", "ativo", "2026-04-22 01:10:44"],
            ["COM-0011", "Prática", "Tropicália", 427, "B", "dificil", "ativo", "2026-05-19 01:10:44"],
            ["COM-0012", "Revisão", "MPB", 559, "F", "facil", "inativo", "2026-05-14 01:10:44"],
            ["COM-0013", "Conceitos", "MPB", 327, "G", "medio", "inativo", "2026-06-06 01:10:44"],
            ["COM-0014", "Conceitos", "MPB", 233, "F", "medio", "ativo", "2026-06-20 01:10:44"],
            ["COM-0015", "Avaliação", "Tropicália", 210, "B", "medio", "ativo", "2026-05-13 01:10:44"],
            ["COM-0016", "Conceitos", "Rock", 378, "B", "dificil", "inativo", "2026-05-22 01:10:44"],
            ["COM-0017", "Avaliação", "Tropicália", 148, "C", "facil", "ativo", "2026-06-04 01:10:44"],
            ["COM-0018", "Revisão", "Samba", 54, "F", "medio", "ativo", "2026-03-23 01:10:44"],
            ["COM-0019", "Avaliação", "MPB", 567, "A", "medio", "ativo", "2026-04-28 01:10:44"],
            ["COM-0020", "Avaliação", "MPB", 315, "F", "dificil", "inativo", "2026-06-12 01:10:44"],
            ["COM-0021", "Introdução", "MPB", 299, "A", "medio", "inativo", "2026-04-30 01:10:44"],
            ["COM-0022", "Revisão", "Rock", 170, "C", "facil", "ativo", "2026-06-09 01:10:44"],
            ["COM-0023", "Revisão", "Rock", 231, "F", "dificil", "ativo", "2026-04-10 01:10:44"],
            ["COM-0024", "Prática", "Clássica", 98, "B", "dificil", "ativo", "2026-04-07 01:10:44"],
            ["COM-0025", "Avaliação", "MPB", 70, "D", "facil", "ativo", "2026-05-13 01:10:44"],
            ["COM-0026", "Conceitos", "Tropicália", 430, "C", "medio", "ativo", "2026-04-16 01:10:44"],
            ["COM-0027", "Introdução", "MPB", 567, "A", "medio", "ativo", "2026-05-13 01:10:44"],
            ["COM-0028", "Conceitos", "Pop", 279, "B", "medio", "ativo", "2026-05-27 01:10:44"],
            ["COM-0029", "Avaliação", "Clássica", 520, "D", "facil", "ativo", "2026-05-02 01:10:44"],
            ["COM-0030", "Revisão", "Tropicália", 584, "B", "facil", "ativo", "2026-03-27 01:10:44"]
          ];
          sheet_Composicoes.getRange(2, 1, d_sheet_Composicoes.length, h_sheet_Composicoes.length).setValues(d_sheet_Composicoes);
          results.push('OK Composicoes: ' + d_sheet_Composicoes.length + ' registros');
        } catch (e) {
          results.push('ERRO Composicoes: ' + e.message);
        }

        // Generos
        try {
          var sheet_Generos = ss.getSheetByName('Generos') || ss.insertSheet('Generos');
          if (sheet_Generos.getLastRow() > 1) {
            sheet_Generos.deleteRows(2, sheet_Generos.getLastRow() - 1);
          }
          var h_sheet_Generos = ["ID", "Nome", "Categoria", "Popularidade", "Status"];
          sheet_Generos.getRange(1, 1, 1, h_sheet_Generos.length).setValues([h_sheet_Generos]);
          var d_sheet_Generos = [
            ["GEN-0001", "Carla Oliveira", "categoria_2", "Manjericão", "inativo"],
            ["GEN-0002", "Bruno Santos", "categoria_2", "Rúcula", "inativo"],
            ["GEN-0003", "Felipe Costa", "categoria_2", "Hortelã", "inativo"],
            ["GEN-0004", "Ana Silva", "categoria_4", "Alface", "ativo"],
            ["GEN-0005", "Gabriela Rocha", "categoria_1", "Rúcula", "ativo"],
            ["GEN-0006", "Gabriela Rocha", "categoria_4", "Salsa", "ativo"],
            ["GEN-0007", "Carla Oliveira", "categoria_4", "Salsa", "inativo"],
            ["GEN-0008", "Carla Oliveira", "categoria_2", "Salsa", "ativo"],
            ["GEN-0009", "Henrique Alves", "categoria_1", "Cebolinha", "ativo"],
            ["GEN-0010", "Gabriela Rocha", "categoria_1", "Espinafre", "ativo"],
            ["GEN-0011", "Carla Oliveira", "categoria_1", "Tilápia", "ativo"],
            ["GEN-0012", "Gabriela Rocha", "categoria_3", "Couve", "ativo"],
            ["GEN-0013", "Eduarda Lima", "categoria_3", "Hortelã", "inativo"],
            ["GEN-0014", "Henrique Alves", "categoria_4", "Salsa", "ativo"],
            ["GEN-0015", "Henrique Alves", "categoria_3", "Manjericão", "inativo"],
            ["GEN-0016", "Felipe Costa", "categoria_1", "Hortelã", "ativo"],
            ["GEN-0017", "Eduarda Lima", "categoria_3", "Salsa", "ativo"],
            ["GEN-0018", "Felipe Costa", "categoria_3", "Rúcula", "ativo"],
            ["GEN-0019", "Felipe Costa", "categoria_3", "Rúcula", "ativo"],
            ["GEN-0020", "Gabriela Rocha", "categoria_3", "Hortelã", "inativo"],
            ["GEN-0021", "Diego Souza", "categoria_2", "Hortelã", "ativo"],
            ["GEN-0022", "Felipe Costa", "categoria_3", "Rúcula", "inativo"],
            ["GEN-0023", "Carla Oliveira", "categoria_1", "Hortelã", "ativo"],
            ["GEN-0024", "Diego Souza", "categoria_3", "Tomate", "inativo"],
            ["GEN-0025", "Felipe Costa", "categoria_2", "Cebolinha", "inativo"],
            ["GEN-0026", "Eduarda Lima", "categoria_4", "Espinafre", "ativo"],
            ["GEN-0027", "Carla Oliveira", "categoria_3", "Salsa", "ativo"],
            ["GEN-0028", "Eduarda Lima", "categoria_1", "Cebolinha", "inativo"],
            ["GEN-0029", "Ana Silva", "categoria_1", "Rúcula", "ativo"],
            ["GEN-0030", "Henrique Alves", "categoria_4", "Espinafre", "ativo"]
          ];
          sheet_Generos.getRange(2, 1, d_sheet_Generos.length, h_sheet_Generos.length).setValues(d_sheet_Generos);
          results.push('OK Generos: ' + d_sheet_Generos.length + ' registros');
        } catch (e) {
          results.push('ERRO Generos: ' + e.message);
        }

        // Humores
        try {
          var sheet_Humores = ss.getSheetByName('Humores') || ss.insertSheet('Humores');
          if (sheet_Humores.getLastRow() > 1) {
            sheet_Humores.deleteRows(2, sheet_Humores.getLastRow() - 1);
          }
          var h_sheet_Humores = ["ID", "Data", "Humor", "Intensidade", "Antes", "Depois", "Notas"];
          sheet_Humores.getRange(1, 1, 1, h_sheet_Humores.length).setValues([h_sheet_Humores]);
          var d_sheet_Humores = [
            ["HUM-0001", "2026-05-20 01:10:44", "triste", 14, "B", "C", 5.3],
            ["HUM-0002", "2026-05-25 01:10:44", "motivado", 9, "D", "D", 6.9],
            ["HUM-0003", "2026-06-14 01:10:44", "calmo", 10, "A", "C", 8.8],
            ["HUM-0004", "2026-06-18 01:10:44", "alegre", 9, "C", "A", 7.7],
            ["HUM-0005", "2026-06-04 01:10:44", "calmo", 9, "D", "B", 5.2],
            ["HUM-0006", "2026-05-10 01:10:44", "triste", 8, "A", "A", 6.7],
            ["HUM-0007", "2026-05-13 01:10:44", "ansioso", 12, "D", "B", 6.2],
            ["HUM-0008", "2026-05-13 01:10:44", "triste", 12, "C", "B", 5.8],
            ["HUM-0009", "2026-05-17 01:10:44", "triste", 13, "B", "B", 9.0],
            ["HUM-0010", "2026-04-30 01:10:44", "motivado", 11, "A", "B", 5.5],
            ["HUM-0011", "2026-05-05 01:10:44", "triste", 12, "D", "A", 5.5],
            ["HUM-0012", "2026-04-28 01:10:44", "motivado", 11, "B", "D", 8.0],
            ["HUM-0013", "2026-04-25 01:10:44", "calmo", 11, "C", "A", 5.0],
            ["HUM-0014", "2026-05-10 01:10:44", "ansioso", 14, "D", "D", 6.1],
            ["HUM-0015", "2026-06-15 01:10:44", "alegre", 14, "D", "D", 5.8],
            ["HUM-0016", "2026-04-26 01:10:44", "motivado", 14, "A", "C", 6.0],
            ["HUM-0017", "2026-05-09 01:10:44", "motivado", 14, "C", "C", 5.1],
            ["HUM-0018", "2026-05-20 01:10:44", "triste", 14, "D", "B", 6.9],
            ["HUM-0019", "2026-05-07 01:10:44", "alegre", 14, "B", "D", 6.0],
            ["HUM-0020", "2026-06-01 01:10:44", "ansioso", 14, "C", "B", 8.6],
            ["HUM-0021", "2026-04-25 01:10:44", "calmo", 14, "D", "A", 8.4],
            ["HUM-0022", "2026-05-16 01:10:44", "calmo", 9, "D", "A", 6.9],
            ["HUM-0023", "2026-05-30 01:10:44", "ansioso", 14, "A", "D", 7.2],
            ["HUM-0024", "2026-05-24 01:10:44", "motivado", 9, "D", "C", 6.7],
            ["HUM-0025", "2026-06-04 01:10:44", "ansioso", 12, "D", "B", 5.8],
            ["HUM-0026", "2026-04-28 01:10:44", "triste", 16, "B", "A", 9.9],
            ["HUM-0027", "2026-05-29 01:10:44", "alegre", 11, "A", "B", 5.5],
            ["HUM-0028", "2026-05-08 01:10:44", "triste", 8, "C", "A", 7.6],
            ["HUM-0029", "2026-06-05 01:10:44", "motivado", 10, "C", "B", 9.3],
            ["HUM-0030", "2026-06-04 01:10:44", "calmo", 11, "D", "C", 5.8]
          ];
          sheet_Humores.getRange(2, 1, d_sheet_Humores.length, h_sheet_Humores.length).setValues(d_sheet_Humores);
          results.push('OK Humores: ' + d_sheet_Humores.length + ' registros');
        } catch (e) {
          results.push('ERRO Humores: ' + e.message);
        }

        // Sessoes
        try {
          var sheet_Sessoes = ss.getSheetByName('Sessoes') || ss.insertSheet('Sessoes');
          if (sheet_Sessoes.getLastRow() > 1) {
            sheet_Sessoes.deleteRows(2, sheet_Sessoes.getLastRow() - 1);
          }
          var h_sheet_Sessoes = ["ID", "Data", "DuracaoMin", "ComposicoesPraticadas", "Avaliacao", "Status"];
          sheet_Sessoes.getRange(1, 1, 1, h_sheet_Sessoes.length).setValues([h_sheet_Sessoes]);
          var d_sheet_Sessoes = [
            ["SES-0001", "2026-06-17 01:10:44", 267, "A", "criar", "ativo"],
            ["SES-0002", "2026-06-03 01:10:44", 591, "D", "remover", "ativo"],
            ["SES-0003", "2026-06-06 01:10:44", 47, "B", "criar", "ativo"],
            ["SES-0004", "2026-05-03 01:10:44", 133, "C", "editar", "ativo"],
            ["SES-0005", "2026-05-03 01:10:44", 503, "C", "editar", "ativo"],
            ["SES-0006", "2026-05-18 01:10:44", 221, "B", "criar", "ativo"],
            ["SES-0007", "2026-04-28 01:10:44", 205, "C", "criar", "ativo"],
            ["SES-0008", "2026-05-27 01:10:44", 168, "B", "criar", "inativo"],
            ["SES-0009", "2026-06-12 01:10:44", 165, "B", "visualizar", "ativo"],
            ["SES-0010", "2026-05-23 01:10:44", 281, "D", "editar", "ativo"],
            ["SES-0011", "2026-05-07 01:10:44", 284, "B", "criar", "ativo"],
            ["SES-0012", "2026-05-28 01:10:44", 169, "A", "visualizar", "inativo"],
            ["SES-0013", "2026-05-19 01:10:44", 531, "D", "remover", "inativo"],
            ["SES-0014", "2026-05-11 01:10:44", 562, "C", "remover", "ativo"],
            ["SES-0015", "2026-05-19 01:10:44", 447, "B", "remover", "ativo"],
            ["SES-0016", "2026-05-01 01:10:44", 67, "B", "criar", "ativo"],
            ["SES-0017", "2026-04-29 01:10:44", 335, "A", "remover", "inativo"],
            ["SES-0018", "2026-05-28 01:10:44", 336, "C", "criar", "ativo"],
            ["SES-0019", "2026-05-21 01:10:44", 233, "A", "editar", "inativo"],
            ["SES-0020", "2026-05-03 01:10:44", 180, "D", "editar", "ativo"],
            ["SES-0021", "2026-05-27 01:10:44", 280, "B", "criar", "ativo"],
            ["SES-0022", "2026-04-25 01:10:44", 479, "C", "remover", "inativo"],
            ["SES-0023", "2026-05-23 01:10:44", 506, "C", "editar", "inativo"],
            ["SES-0024", "2026-06-13 01:10:44", 455, "A", "editar", "ativo"],
            ["SES-0025", "2026-04-25 01:10:44", 133, "C", "visualizar", "ativo"],
            ["SES-0026", "2026-05-30 01:10:44", 506, "D", "remover", "ativo"],
            ["SES-0027", "2026-05-14 01:10:44", 331, "C", "remover", "ativo"],
            ["SES-0028", "2026-04-23 01:10:44", 520, "A", "visualizar", "ativo"],
            ["SES-0029", "2026-06-09 01:10:44", 347, "B", "criar", "ativo"],
            ["SES-0030", "2026-06-12 01:10:44", 306, "A", "criar", "ativo"]
          ];
          sheet_Sessoes.getRange(2, 1, d_sheet_Sessoes.length, h_sheet_Sessoes.length).setValues(d_sheet_Sessoes);
          results.push('OK Sessoes: ' + d_sheet_Sessoes.length + ' registros');
        } catch (e) {
          results.push('ERRO Sessoes: ' + e.message);
        }

        // Metas
        try {
          var sheet_Metas = ss.getSheetByName('Metas') || ss.insertSheet('Metas');
          if (sheet_Metas.getLastRow() > 1) {
            sheet_Metas.deleteRows(2, sheet_Metas.getLastRow() - 1);
          }
          var h_sheet_Metas = ["ID", "Descricao", "Tipo", "Progresso", "Prazo", "Status"];
          sheet_Metas.getRange(1, 1, 1, h_sheet_Metas.length).setValues([h_sheet_Metas]);
          var d_sheet_Metas = [
            ["MET-0001", "Registro de sessão experimental", "tipo_a", 57, 56, "ativo"],
            ["MET-0002", "Acompanhamento de evolução", "tipo_b", 79, 46, "ativo"],
            ["MET-0003", "Registro de sessão experimental", "tipo_a", 66, 79, "ativo"],
            ["MET-0004", "Acompanhamento de evolução", "tipo_b", 55, 102, "ativo"],
            ["MET-0005", "Observação inicial do processo", "tipo_a", 48, 47, "inativo"],
            ["MET-0006", "Registro de sessão experimental", "tipo_a", 18, 102, "ativo"],
            ["MET-0007", "Observação inicial do processo", "tipo_c", 49, 40, "inativo"],
            ["MET-0008", "Dados coletados durante atividade", "tipo_a", 5, 43, "ativo"],
            ["MET-0009", "Dados coletados durante atividade", "tipo_a", 53, 77, "ativo"],
            ["MET-0010", "Acompanhamento de evolução", "tipo_a", 54, 75, "ativo"],
            ["MET-0011", "Dados coletados durante atividade", "tipo_a", 8, 25, "ativo"],
            ["MET-0012", "Registro de sessão experimental", "tipo_c", 61, 105, "ativo"],
            ["MET-0013", "Dados coletados durante atividade", "tipo_b", 21, 91, "inativo"],
            ["MET-0014", "Observação inicial do processo", "tipo_a", 85, 63, "ativo"],
            ["MET-0015", "Registro de sessão experimental", "tipo_b", 33, 78, "ativo"],
            ["MET-0016", "Registro de sessão experimental", "tipo_c", 19, 90, "ativo"],
            ["MET-0017", "Dados coletados durante atividade", "tipo_a", 2, 60, "inativo"],
            ["MET-0018", "Registro de sessão experimental", "tipo_b", 65, 43, "inativo"],
            ["MET-0019", "Acompanhamento de evolução", "tipo_a", 75, 43, "ativo"],
            ["MET-0020", "Observação inicial do processo", "tipo_a", 71, 33, "ativo"],
            ["MET-0021", "Dados coletados durante atividade", "tipo_b", 19, 17, "ativo"],
            ["MET-0022", "Acompanhamento de evolução", "tipo_c", 51, 58, "ativo"],
            ["MET-0023", "Registro de sessão experimental", "tipo_a", 31, 25, "inativo"],
            ["MET-0024", "Observação inicial do processo", "tipo_b", 7, 60, "inativo"],
            ["MET-0025", "Acompanhamento de evolução", "tipo_a", 53, 65, "ativo"],
            ["MET-0026", "Registro de sessão experimental", "tipo_b", 15, 44, "ativo"],
            ["MET-0027", "Acompanhamento de evolução", "tipo_b", 50, 80, "ativo"],
            ["MET-0028", "Acompanhamento de evolução", "tipo_b", 30, 41, "ativo"],
            ["MET-0029", "Dados coletados durante atividade", "tipo_b", 20, 81, "ativo"],
            ["MET-0030", "Acompanhamento de evolução", "tipo_a", 12, 15, "ativo"]
          ];
          sheet_Metas.getRange(2, 1, d_sheet_Metas.length, h_sheet_Metas.length).setValues(d_sheet_Metas);
          results.push('OK Metas: ' + d_sheet_Metas.length + ' registros');
        } catch (e) {
          results.push('ERRO Metas: ' + e.message);
        }

        Logger.log(results.join('\n'));
        return results;
      } catch (error) {
        Logger.log("Erro em populateSyntheticData: " + error.message);
        throw error; // Re-lança para tratamento superior
      }
    } catch (error) {
      Logger.log("Erro em populateSyntheticData: " + error.message);
      throw error;
    }
  } catch (error) {
    Logger.log("Erro em populateSyntheticData: " + error.message);
    throw error;
  }
}
