/**
 * @fileoverview repository_base.gs
 * @description Implementação do padrão Repository para abstração de acesso a dados.
 * Fornece interface unificada para operações CRUD na planilha Google Sheets,
 * com cache de dados, busca por múltiplos critérios, paginação e exportação.
 * @author SanoAgent Team
 * @version 1.1.0
 */

/**
 * Classe base para operações de repositório sobre Google Sheets.
 * Todos os repositórios do SanoAgent devem estender esta classe.
 */
class BaseRepository {

  /**
   * @param {string} spreadsheetId - ID da planilha Google Sheets.
   * @param {string} sheetName    - Nome da aba a ser gerenciada.
   */
  constructor(spreadsheetId, sheetName) {
    if (!spreadsheetId) throw new Error('BaseRepository: spreadsheetId é obrigatório.');
    if (!sheetName)    throw new Error('BaseRepository: sheetName é obrigatório.');

    this.spreadsheetId = spreadsheetId;
    this.sheetName     = sheetName;

    try {
      this.spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      this.sheet       = this.spreadsheet.getSheetByName(sheetName);
    } catch (err) {
      throw new Error(`BaseRepository: falha ao abrir planilha "${spreadsheetId}": ${err.message}`);
    }

    /** @type {Array<Array>|null} Cache local para a sessão */
    this._cache = null;
  }

  // ---------------------------------------------------------------------------
  // Helpers internos
  // ---------------------------------------------------------------------------

  /**
   * Garante que a aba existe, lançando erro descritivo caso contrário.
   * @throws {Error}
   */
  _requireSheet() {
    if (!this.sheet) {
      throw new Error(`Aba "${this.sheetName}" não encontrada na planilha ${this.spreadsheetId}.`);
    }
  }

  /**
   * Invalida o cache local. Deve ser chamado após qualquer operação de escrita.
   */
  _invalidateCache() {
    this._cache = null;
  }

  _withWriteLock(operationName, callback) {
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(10000)) {
      throw new Error(`BaseRepository: nao foi possivel obter lock para ${operationName}.`);
    }
    try {
      return callback();
    } finally {
      lock.releaseLock();
    }
  }

  // ---------------------------------------------------------------------------
  // CREATE
  // ---------------------------------------------------------------------------

  /**
   * Insere uma nova linha no final da aba.
   * @param {Array} rowData - Valores a inserir.
   * @returns {number} Número da linha inserida (1-based).
   * @throws {Error} Se rowData for inválido ou a aba não existir.
   */
  create(rowData) {
    this._requireSheet();
    if (!Array.isArray(rowData) || rowData.length === 0) {
      throw new Error('create: rowData deve ser um array não vazio.');
    }
    return this._withWriteLock(`create:${this.sheetName}`, () => {
      this.sheet.appendRow(rowData);
      this._invalidateCache();
      return this.sheet.getLastRow();
    });
  }

  // ---------------------------------------------------------------------------
  // READ
  // ---------------------------------------------------------------------------

  /**
   * Lê todos os registros da aba, usando cache quando disponível.
   * @param {boolean} [forceRefresh=false] - Ignora cache e relê a planilha.
   * @returns {Array<Array>} Matriz de dados (inclui linha de cabeçalho).
   */
  readAll(forceRefresh = false) {
    this._requireSheet();
    if (!forceRefresh && this._cache !== null) {
      return this._cache;
    }
    const lastRow = this.sheet.getLastRow();
    const lastCol = this.sheet.getLastColumn();
    if (lastRow === 0 || lastCol === 0) {
      this._cache = [];
      return this._cache;
    }
    this._cache = this.sheet.getRange(1, 1, lastRow, lastCol).getValues();
    return this._cache;
  }

  /**
   * Lê uma linha específica pelo índice.
   * @param {number} rowIndex - Índice 1-based.
   * @returns {Array} Dados da linha.
   */
  readByRow(rowIndex) {
    this._requireSheet();
    if (!Number.isInteger(rowIndex) || rowIndex < 1) {
      throw new Error(`readByRow: índice inválido: ${rowIndex}`);
    }
    const lastCol = this.sheet.getLastColumn();
    return this.sheet.getRange(rowIndex, 1, 1, lastCol).getValues()[0];
  }

  /**
   * Retorna dados paginados (exclui cabeçalho).
   * @param {number} page     - Número da página (1-based).
   * @param {number} pageSize - Itens por página.
   * @returns {{ items: Array<Array>, total: number, page: number, pageSize: number }}
   */
  readPaginated(page = 1, pageSize = 20) {
    const all    = this.readAll();
    const data   = all.slice(1);          // sem cabeçalho
    const start  = (page - 1) * pageSize;
    const items  = data.slice(start, start + pageSize);
    return { items, total: data.length, page, pageSize };
  }

  // ---------------------------------------------------------------------------
  // UPDATE
  // ---------------------------------------------------------------------------

  /**
   * Substitui todos os valores de uma linha.
   * @param {number} rowIndex - Índice 1-based.
   * @param {Array}  rowData  - Novos valores.
   */
  update(rowIndex, rowData) {
    this._requireSheet();
    if (!Number.isInteger(rowIndex) || rowIndex < 1) {
      throw new Error(`update: índice inválido: ${rowIndex}`);
    }
    if (!Array.isArray(rowData) || rowData.length === 0) {
      throw new Error('update: rowData deve ser um array não vazio.');
    }
    return this._withWriteLock(`update:${this.sheetName}`, () => {
      this.sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
      this._invalidateCache();
      return rowData;
    });
  }

  /**
   * Atualiza o valor de uma célula específica.
   * @param {number} row    - Linha (1-based).
   * @param {number} column - Coluna (1-based).
   * @param {*}      value  - Novo valor.
   */
  updateCell(row, column, value) {
    this._requireSheet();
    return this._withWriteLock(`updateCell:${this.sheetName}`, () => {
      this.sheet.getRange(row, column).setValue(value);
      this._invalidateCache();
      return value;
    });
  }

  // ---------------------------------------------------------------------------
  // DELETE
  // ---------------------------------------------------------------------------

  /**
   * Remove uma linha da aba.
   * @param {number} rowIndex - Índice 1-based.
   */
  delete(rowIndex) {
    this._requireSheet();
    if (!Number.isInteger(rowIndex) || rowIndex < 1) {
      throw new Error(`delete: índice inválido: ${rowIndex}`);
    }
    return this._withWriteLock(`delete:${this.sheetName}`, () => {
      this.sheet.deleteRow(rowIndex);
      this._invalidateCache();
      return true;
    });
  }

  // ---------------------------------------------------------------------------
  // BUSCA
  // ---------------------------------------------------------------------------

  /**
   * Busca registros onde uma coluna corresponde ao valor dado.
   * @param {number} columnIndex - Índice da coluna (1-based).
   * @param {*}      searchValue - Valor a comparar.
   * @returns {Array<Array>} Linhas correspondentes.
   */
  findByColumn(columnIndex, searchValue) {
    if (!Number.isInteger(columnIndex) || columnIndex < 1) {
      throw new Error(`findByColumn: índice de coluna inválido: ${columnIndex}`);
    }
    const all = this.readAll();
    return all.filter(row => row[columnIndex - 1] === searchValue);
  }

  /**
   * Busca registros que satisfaçam TODOS os critérios fornecidos.
   * @param {Object.<number, *>} criteria - Mapa de {columnIndex: value} (1-based).
   * @returns {Array<Array>} Linhas correspondentes.
   * @example
   *   repo.findByMultiple({ 2: 'student', 5: 'Feliz' })
   */
  findByMultiple(criteria) {
    if (!criteria || Object.keys(criteria).length === 0) return this.readAll();
    const all = this.readAll();
    return all.filter(row =>
      Object.entries(criteria).every(([col, val]) => row[Number(col) - 1] === val)
    );
  }

  /**
   * Conta registros que correspondem a um critério de coluna.
   * @param {number} columnIndex - Índice da coluna (1-based).
   * @param {*}      searchValue - Valor a contar.
   * @returns {number}
   */
  countByColumn(columnIndex, searchValue) {
    return this.findByColumn(columnIndex, searchValue).length;
  }

  // ---------------------------------------------------------------------------
  // UTILIDADES
  // ---------------------------------------------------------------------------

  /**
   * Retorna o número total de linhas de dados (sem cabeçalho).
   * @returns {number}
   */
  getRowCount() {
    this._requireSheet();
    const total = this.sheet.getLastRow();
    return Math.max(0, total - 1); // desconta cabeçalho
  }

  /**
   * Exporta dados com cabeçalho como array de objetos JSON.
   * @param {boolean} [forceRefresh=false]
   * @returns {Array<Object>}
   */
  exportToJson(forceRefresh = false) {
    const data = this.readAll(forceRefresh);
    if (data.length < 2) return [];

    const headers = data[0];
    return data.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, i) => { obj[header] = row[i]; });
      return obj;
    });
  }

  /**
   * Limpa todos os conteúdos da aba (preserva formatação).
   * @param {boolean} [includeHeaders=false] - Se true, remove também o cabeçalho.
   */
  clearAll(includeHeaders = false) {
    this._requireSheet();
    if (includeHeaders) {
      this._withWriteLock(`clearAll:${this.sheetName}`, () => {
        this.sheet.clearContents();
      });
    } else {
      const lastRow = this.sheet.getLastRow();
      if (lastRow > 1) {
        this._withWriteLock(`clearAll:${this.sheetName}`, () => {
          this.sheet.getRange(2, 1, lastRow - 1, this.sheet.getLastColumn()).clearContent();
        });
      }
    }
    this._invalidateCache();
  }
}
