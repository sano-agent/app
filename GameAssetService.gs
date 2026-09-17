/**
 * Contrato remoto dos assets do Sano Agent.
 *
 * webapp/assets é somente o espelho local de autoria. O webapp publicado
 * procura cada arquivo pelo nome exato dentro da pasta indicada por FOLDER_ID.
 */
var GAME_ASSET_PROJECT = 'sano-agent';
var GAME_ASSET_FILES = [
  'blocos_composicao.png',
  'estilos_musicais.svg',
  'estudio_criativo_hero.webp',
  'jornada_da_cancao.svg',
  'mascote_onda_sonora.png',
  'selo_voz_autoral.svg',
  'textura_caderno_palco.webp'
];

var GAME_ASSET_MIME_TYPES = Object.freeze({
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp'
});

function getGameAssetManifest() {
  return GameAssetService_getManifest_(GAME_ASSET_FILES, GAME_ASSET_PROJECT);
}

function GameAssetService_resolveFolder_() {
  var value = String(PropertiesService.getScriptProperties().getProperty('FOLDER_ID') || '').trim();
  return { id: value, configuredBy: value ? 'FOLDER_ID' : '' };
}

function GameAssetService_getManifest_(expectedFiles, project) {
  expectedFiles = (expectedFiles || []).slice();
  var manifest = {
    project: project || '',
    folderProperty: 'FOLDER_ID',
    configuredBy: '',
    expectedFiles: expectedFiles,
    assets: {},
    assetItems: [],
    missingFiles: [],
    invalidFiles: [],
    duplicateFiles: [],
    ok: false
  };

  try {
    var folderConfig = GameAssetService_resolveFolder_();
    manifest.configuredBy = folderConfig.configuredBy;
    if (!folderConfig.id) {
      manifest.missingFiles = expectedFiles.slice();
      manifest.error = 'Configure FOLDER_ID com a pasta de assets do Sano Agent no Google Drive.';
      return manifest;
    }

    var folder = DriveApp.getFolderById(folderConfig.id);
    expectedFiles.forEach(function(name) {
      var files = folder.getFilesByName(name);
      if (!files.hasNext()) {
        manifest.missingFiles.push(name);
        return;
      }

      var file = files.next();
      if (files.hasNext()) {
        manifest.duplicateFiles.push(name);
        return;
      }

      var extension = /\.[^.]+$/.exec(name.toLowerCase());
      var expectedMime = extension ? GAME_ASSET_MIME_TYPES[extension[0]] : '';
      var actualMime = String(file.getMimeType() || '').toLowerCase();
      if (!expectedMime || actualMime !== expectedMime) {
        manifest.invalidFiles.push({
          name: name,
          expectedMimeType: expectedMime,
          actualMimeType: actualMime
        });
        return;
      }

      var url = 'https://drive.google.com/uc?export=view&id=' + encodeURIComponent(file.getId());
      manifest.assets[name] = url;
      manifest.assetItems.push({ name: name, url: url, mimeType: actualMime });
    });

    manifest.ok = manifest.missingFiles.length === 0 &&
      manifest.invalidFiles.length === 0 &&
      manifest.duplicateFiles.length === 0;
    if (!manifest.ok) {
      manifest.assets = {};
      manifest.assetItems = [];
      manifest.error = 'A pasta FOLDER_ID não contém um conjunto único e válido de todos os assets do Sano Agent.';
    }
    return manifest;
  } catch (error) {
    Logger.log('[GameAssetService] ' + error.message);
    manifest.assets = {};
    manifest.assetItems = [];
    manifest.error = 'Não foi possível ler a pasta de assets configurada em FOLDER_ID.';
    return manifest;
  }
}
