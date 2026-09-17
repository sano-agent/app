/**
 * @fileoverview cloud_storage_integration.gs
 * @description Integração com Google Drive e serviços de armazenamento em nuvem.
 * Implementa upload, download e gerenciamento de arquivos.
 * @author SanoAgent Team
 * @version 1.0.0
 */

/**
 * Classe para gerenciamento de armazenamento em nuvem
 */
class CloudStorageManager {
  /**
   * Construtor do gerenciador
   * @param {string} folderId - ID da pasta no Google Drive
   */
  constructor(folderId) {
    this.folderId = folderId;
    this.folder = folderId ? DriveApp.getFolderById(folderId) : null;
  }

  /**
   * Cria pasta para usuário
   * @param {string} userId - ID do usuário
   * @returns {Object} Resultado
   */
  createUserFolder(userId) {
    try {
      if (!this.folder) {
        return { success: false, error: 'Pasta raiz não configurada' };
      }

      const userFolderName = `SanoAgent_${userId}`;
      let userFolder = null;

      // Verifica se pasta já existe
      const folders = this.folder.getFoldersByName(userFolderName);
      if (folders.hasNext()) {
        userFolder = folders.next();
      } else {
        userFolder = this.folder.createFolder(userFolderName);
      }

      return {
        success: true,
        folderId: userFolder.getId(),
        folderName: userFolder.getName(),
        url: userFolder.getUrl()
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Salva arquivo de composição
   * @param {string} userId - ID do usuário
   * @param {string} compositionId - ID da composição
   * @param {string} content - Conteúdo
   * @param {string} format - Formato (txt, pdf)
   * @returns {Object} Resultado
   */
  saveCompositionFile(userId, compositionId, content, format = 'txt') {
    try {
      const userFolderResult = this.createUserFolder(userId);
      if (!userFolderResult.success) {
        return userFolderResult;
      }

      const userFolder = DriveApp.getFolderById(userFolderResult.folderId);
      const fileName = `Composição_${compositionId}.${format}`;
      const mimeType = format === 'pdf' ? MimeType.PDF : MimeType.PLAIN_TEXT;

      const file = userFolder.createFile(fileName, content, mimeType);

      return {
        success: true,
        fileId: file.getId(),
        fileName: file.getName(),
        url: file.getUrl()
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Salva portfólio de composições
   * @param {string} userId - ID do usuário
   * @param {Array} compositions - Array de composições
   * @returns {Object} Resultado
   */
  savePortfolio(userId, compositions) {
    try {
      const userFolderResult = this.createUserFolder(userId);
      if (!userFolderResult.success) {
        return userFolderResult;
      }

      const userFolder = DriveApp.getFolderById(userFolderResult.folderId);
      let portfolioContent = 'PORTFÓLIO DE COMPOSIÇÕES MUSICAIS\n';
      portfolioContent += '================================\n\n';
      portfolioContent += `Usuário: ${userId}\n`;
      portfolioContent += `Data de Geração: ${new Date().toISOString()}\n`;
      portfolioContent += `Total de Composições: ${compositions.length}\n\n`;

      compositions.forEach((comp, index) => {
        portfolioContent += `\n--- COMPOSIÇÃO ${index + 1} ---\n`;
        portfolioContent += `ID: ${comp.id}\n`;
        portfolioContent += `Gênero: ${comp.genre}\n`;
        portfolioContent += `Data: ${comp.date}\n`;
        portfolioContent += `\n${comp.lyrics}\n`;
      });

      const fileName = `Portfólio_${userId}_${Date.now()}.txt`;
      const file = userFolder.createFile(fileName, portfolioContent, MimeType.PLAIN_TEXT);

      return {
        success: true,
        fileId: file.getId(),
        fileName: file.getName(),
        url: file.getUrl()
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Lista arquivos do usuário
   * @param {string} userId - ID do usuário
   * @returns {Array} Lista de arquivos
   */
  listUserFiles(userId) {
    try {
      const userFolderResult = this.createUserFolder(userId);
      if (!userFolderResult.success) {
        return [];
      }

      const userFolder = DriveApp.getFolderById(userFolderResult.folderId);
      const files = userFolder.getFiles();
      const fileList = [];
      const max = 200;

      while (files.hasNext() && fileList.length < max) {
        const file = files.next();
        fileList.push({
          id: file.getId(),
          name: file.getName(),
          url: file.getUrl(),
          mimeType: file.getMimeType(),
          createdDate: file.getDateCreated()
        });
      }

      return fileList;
    } catch (error) {
      LoggerService.error(`Erro ao listar arquivos: ${error.message}`);
      return [];
    }
  }

  /**
   * Deleta arquivo
   * @param {string} fileId - ID do arquivo
   * @returns {Object} Resultado
   */
  deleteFile(fileId) {
    try {
      const file = DriveApp.getFileById(fileId);
      file.setTrashed(true);
      return { success: true, message: 'Arquivo deletado' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtém conteúdo do arquivo
   * @param {string} fileId - ID do arquivo
   * @returns {string} Conteúdo
   */
  getFileContent(fileId) {
    try {
      const file = DriveApp.getFileById(fileId);
      return file.getAs(MimeType.PLAIN_TEXT).getDataAsString();
    } catch (error) {
      return '';
    }
  }

  /**
   * Compartilha arquivo com email
   * @param {string} fileId - ID do arquivo
   * @param {string} email - Email para compartilhar
   * @returns {Object} Resultado
   */
  shareFile(fileId, email) {
    try {
      const file = DriveApp.getFileById(fileId);
      file.addEditor(email);
      return {
        success: true,
        message: `Arquivo compartilhado com ${email}`
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Cria backup de dados
   * @param {string} spreadsheetId - ID da planilha
   * @returns {Object} Resultado
   */
  createBackup(spreadsheetId) {
    try {
      if (!this.folder) {
        return { success: false, error: 'Pasta raiz não configurada' };
      }

      const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      const fileName = `Backup_SanoAgent_${Date.now()}`;
      
      // Cria cópia da planilha
      const backup = spreadsheet.copy(fileName);
      const backupFile = DriveApp.getFileById(backup.getId());
      
      this.folder.addFile(backupFile);

      return {
        success: true,
        backupId: backup.getId(),
        fileName: fileName,
        url: backup.getUrl()
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Limpa arquivos antigos
   * @param {number} daysOld - Número de dias
   * @returns {Object} Resultado
   */
  cleanupOldFiles(daysOld = 30) {
    try {
      if (!this.folder) {
        return { success: false, error: 'Pasta raiz não configurada' };
      }

      const files = this.folder.getFiles();
      const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
      let deletedCount = 0;

      while (files.hasNext()) {
        const file = files.next();
        if (file.getDateCreated() < cutoffDate) {
          file.setTrashed(true);
          deletedCount++;
        }
      }

      return {
        success: true,
        deletedCount: deletedCount,
        message: `${deletedCount} arquivo(s) removido(s)`
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

/**
 * Função para inicializar gerenciador de armazenamento
 * @returns {CloudStorageManager} Gerenciador
 */
function initializeCloudStorage() {
  const folderId = getDriveFolderId();
  return new CloudStorageManager(folderId);
}

function initializeBackupStorage() {
  const folderId = typeof getBackupFolderId === 'function' ? getBackupFolderId() : getDriveFolderId();
  return new CloudStorageManager(folderId);
}
