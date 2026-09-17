/**
 * AuthHelpers.gs — Rotinas Reutilizáveis De Autenticação (Prompt 18)
 * Implementa 11 rotinas padrão de autenticação baseadas em token para a frota.
 */

const SAQCSM_AUTH_CONFIG_ = { SESSION_KEY_PREFIX: 'SAQCSM_SESSION_', SESSION_TTL_SECONDS: 21600 };

function ensureUsuariosSheet_() {
  try {
    const ss = (typeof getBoundSpreadsheet_ === 'function')
      ? getBoundSpreadsheet_()
      : SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('Usuarios');
    if (!sheet) {
      sheet = ss.insertSheet('Usuarios');
      sheet.getRange(1, 1, 1, 8).setValues([['ID', 'Username', 'Password', 'PasswordHash', 'Role', 'Nome', 'Email', 'Status']]);
      sheet.getRange(1, 1, 1, 8).setFontWeight('bold');
    }
    return sheet;
  } catch (error) {
    Logger.log("Erro em ensureUsuariosSheet_: " + error.message);
    throw error; // Re-lança para tratamento superior
  }
}

function seedSyntheticAdminUsers_() {
  try {
    try {
      const sheet = ensureUsuariosSheet_();
      const data = sheet.getDataRange().getValues();
      const existing = data.slice(1).map(row => String(row[1]).toLowerCase());
      const toAdd = [];
      for (let i = 1; i <= 15; i++) {
        const u = `admin${String(i).padStart(2, '0')}`;
        if (!existing.includes(u)) toAdd.push([Utilities.getUuid(), u, 'admin123', '', 'Admin', `Admin ${i}`, `${u}@synthetic.local`, 'Active']);
      }
      if (toAdd.length > 0) sheet.getRange(sheet.getLastRow() + 1, 1, toAdd.length, 8).setValues(toAdd);
      return { added: toAdd.length, total: 15 };
    } catch (error) {
      Logger.log("Erro em seedSyntheticAdminUsers_: " + error.message);
      throw error; // Re-lança para tratamento superior
    }
  } catch (error) {
    Logger.log("Erro em seedSyntheticAdminUsers_: " + error.message);
    throw error;
  }
}

function readUsuariosRows_() {
  const sheet = ensureUsuariosSheet_();
  const data = sheet.getDataRange().getValues();
  return { headers: data[0], rows: data.slice(1) };
}

function findPlaintextUser_(username) {
  try {
    const norm = String(username).toLowerCase().trim();
    const { headers, rows } = readUsuariosRows_();
    const map = {}; headers.forEach((h, i) => { map[String(h).toLowerCase().trim()] = i; });
    if (map.username === undefined || (map.password === undefined && map.passwordhash === undefined)) return null;
    for (const row of rows) {
      if (String(row[map['username']]).toLowerCase().trim() === norm) {
        const passwordIndex = map.password !== undefined ? map.password : map.passwordhash;
        const id = map.id !== undefined && row[map.id] !== null && row[map.id] !== ''
          ? String(row[map.id]).trim()
          : String(row[map.username]).trim();
        const status = map.status === undefined ? 'active' : String(row[map.status] == null ? '' : row[map.status]).trim().toLowerCase();
        return {
          id: id,
          username: String(row[map['username']]),
          password: String(row[passwordIndex] || ''),
          role: String(row[map['role']] || 'Admin'),
          nome: String(row[map['nome']] || row[map['username']]),
          email: String(row[map['email']] || ''),
          active: ['inativo', 'inactive', 'desativado', 'disabled', 'bloqueado', 'blocked', 'false', '0'].indexOf(status) === -1
        };
      }
    }
    return null;
  } catch (error) {
    Logger.log("Erro em findPlaintextUser_: " + error.message);
    throw error;
  }
}

function loginWithToken(username, password) {
  try {
    try {
      try {
        try {
          if (!username || !password) return { success: false, message: 'Credenciais inválidas.' };
          const user = findPlaintextUser_(username);
          if (!user || user.password !== password || !user.active) return { success: false, message: 'Credenciais inválidas.' };
          const token = Utilities.getUuid().replace(/-/g, '');
          PropertiesService.getScriptProperties().setProperty(
            SAQCSM_AUTH_CONFIG_.SESSION_KEY_PREFIX + token,
            JSON.stringify({ userId: user.id, username: user.username, role: user.role, nome: user.nome, email: user.email, expiresAt: Date.now() + (SAQCSM_AUTH_CONFIG_.SESSION_TTL_SECONDS * 1000) })
          );
          return { success: true, token: token, user: { id: user.id, username: user.username, nome: user.nome, email: user.email, role: user.role }, redirectUrl: ScriptApp.getService().getUrl() + '?page=app#tok=' + token, message: 'Login realizado com sucesso.' };
        } catch (error) {
          return { success: false, message: String(error.message || error) };
        }
      } catch (error) {
        Logger.log("Erro em loginWithToken: " + error.message);
        throw error; // Re-lança para tratamento superior
      }
    } catch (error) {
      Logger.log("Erro em loginWithToken: " + error.message);
      throw error;
    }
  } catch (error) {
    Logger.log("Erro em loginWithToken: " + error.message);
    throw error;
  }
}

function isAuthenticatedByToken(tok) {
  try {
    try {
      const normalizedToken = String(tok == null ? '' : tok).trim();
      if (!normalizedToken) return false;
      const key = SAQCSM_AUTH_CONFIG_.SESSION_KEY_PREFIX + normalizedToken;
      const props = PropertiesService.getScriptProperties();
      const raw = props.getProperty(key);
      if (!raw) return false;
      try {
        const session = JSON.parse(raw);
        const expiresAt = Number(session && session.expiresAt);
        if (!session || !String(session.userId == null ? '' : session.userId).trim() || !isFinite(expiresAt) || expiresAt <= Date.now()) {
          props.deleteProperty(key);
          return false;
        }
        return true;
      } catch (e) {
        props.deleteProperty(key);
        return false;
      }
    } catch (error) {
      Logger.log("Erro em isAuthenticatedByToken: " + error.message);
      throw error;
    }
  } catch (error) {
    Logger.log("Erro em isAuthenticatedByToken: " + error.message);
    throw error;
  }
}

function getSessionUser(tok) {
  const normalizedToken = String(tok == null ? '' : tok).trim();
  if (!normalizedToken) return null;
  const props = PropertiesService.getScriptProperties();
  const key = SAQCSM_AUTH_CONFIG_.SESSION_KEY_PREFIX + normalizedToken;
  const raw = props.getProperty(key);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw);
    const expiresAt = Number(session && session.expiresAt);
    if (!session || !String(session.userId == null ? '' : session.userId).trim() || !isFinite(expiresAt) || expiresAt <= Date.now()) {
      props.deleteProperty(key);
      return null;
    }
    return { userId: session.userId, username: session.username, role: session.role, nome: session.nome || session.username, email: session.email || '' };
  } catch (e) {
    props.deleteProperty(key);
    return null;
  }
}

function logoutWithToken(tok) {
  try {
    try {
      try {
        const normalizedToken = String(tok == null ? '' : tok).trim();
        if (normalizedToken) PropertiesService.getScriptProperties().deleteProperty(SAQCSM_AUTH_CONFIG_.SESSION_KEY_PREFIX + normalizedToken);
        return { success: true, message: 'Sessão encerrada.' };
      } catch (error) {
        Logger.log("Erro em logoutWithToken: " + error.message);
        throw error; // Re-lança para tratamento superior
      }
    } catch (error) {
      Logger.log("Erro em logoutWithToken: " + error.message);
      throw error;
    }
  } catch (error) {
    Logger.log("Erro em logoutWithToken: " + error.message);
    throw error;
  }
}

function buildAuthenticatedRedirectUrl_(tok) {
  return ScriptApp.getService().getUrl() + '?page=app#tok=' + encodeURIComponent(String(tok || '').trim());
}

function resolveAuthTokenFromPayload_(payloadOrToken) {
  if (typeof payloadOrToken === 'string') return normalizeSaqToken_(payloadOrToken);
  if (typeof payloadOrToken === 'object' && payloadOrToken !== null) {
    return normalizeSaqToken_(payloadOrToken._authToken || payloadOrToken.tok || payloadOrToken.sessionToken || payloadOrToken.token);
  }
  return null;
}

function normalizeSaqToken_(token) {
  if (typeof token !== 'string') return null;
  token = token.trim();
  return token || null;
}

function requireAuthenticatedPrincipal_(payloadOrToken) {
  const token = resolveAuthTokenFromPayload_(payloadOrToken);
  if (!token) throw new Error('Sua sessão terminou. Entre novamente.');
  const session = getSessionUser(token);
  if (!session) throw new Error('Sua sessão terminou. Entre novamente.');
  return session;
}
