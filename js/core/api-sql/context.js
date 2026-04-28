import { S } from '../state.js';
import { readBrowserSession } from '../hydration-session.js';
import { normTxt } from '../utils.js';
import { isEnabled } from './client.js';
import { syncProfile } from './bootstrap.js';

const SQL_ACADEMIC_CONTEXT_CACHE = { key: '', data: null };

function cloneJson(value, fallback) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (_) {
    return fallback;
  }
}

/**
 * Normaliza el nombre de una escuela para comparaciones seguras.
 */
export function normalizeSchoolName(name) {
  return normTxt(name);
}

/**
 * Obtiene el contexto consolidado del usuario para operaciones de sincronización SQL.
 * Incluye email, institución, rol y año académico.
 * @returns {Object|null}
 */
export function getSqlStateContext() {
  const localUser = readBrowserSession();
  const authUser = Array.isArray(S.authUsers) ? S.authUsers.find((user) => user.id === S.sessionUserId) : null;
  const email = String(S.profile?.email || localUser?.email || authUser?.email || '').trim().toLowerCase();
  const schoolId = String(S.profile?.schoolId || S.profile?.school?.id || '').trim();
  const schoolName = normalizeSchoolName(S.profile?.inst || '');
  if (!email || (!schoolId && !schoolName)) return null;
  return {
    email,
    schoolId,
    schoolName,
    authProviderUid: S.sessionUserId || '',
    displayName: String(S.profile?.name || S.sessionUserName || localUser?.name || '').trim(),
    phone: String(S.profile?.phone || '').trim(),
    academicYear: String(S.profile?.year || S.schoolYear?.name || '').trim(),
    timezone: String(S.profile?.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Santo_Domingo').trim(),
    role: String(S.profile?.role || 'Docente').trim(),
  };
}

/**
 * Comprueba si un ID tiene formato de UUID estándar.
 * @returns {boolean}
 */
export function isSqlUuidLike(value) {
  const str = String(value || '');
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

/**
 * Garantiza que exista un contexto académico en la base de datos SQL.
 * Crea el perfil del usuario y la escuela si no existen y retorna sus IDs internos.
 * @returns {Promise<Object|null>}
 */
export async function ensureSqlAcademicContext() {
  if (!isEnabled()) return null;
  const context = getSqlStateContext();
  if (!context) return null;
  
  const cacheKey = `${context.email}::${context.schoolId || context.schoolName || ''}::${context.authProviderUid || ''}`;
  if (SQL_ACADEMIC_CONTEXT_CACHE.key === cacheKey && SQL_ACADEMIC_CONTEXT_CACHE.data) {
    return SQL_ACADEMIC_CONTEXT_CACHE.data;
  }
  
  try {
    const result = await syncProfile(context);
    const resolvedSchoolId = String(result?.school?.id || context.schoolId || '').trim();
    const resolvedSchoolName = String(result?.school?.name || context.schoolName || '').trim();
    if (resolvedSchoolId) {
      if (!S.profile || typeof S.profile !== 'object') S.profile = {};
      S.profile.schoolId = resolvedSchoolId;
      if (resolvedSchoolName) S.profile.inst = resolvedSchoolName;
      if (result?.school) {
        S.profile.school = cloneJson(result.school, null);
      }
    }
    const resolved = {
      ...context,
      userId: result?.user?.id || '',
      schoolId: resolvedSchoolId,
      school: result?.school || null,
      user: result?.user || null,
    };
    SQL_ACADEMIC_CONTEXT_CACHE.key = `${context.email}::${resolvedSchoolId || resolvedSchoolName || ''}::${context.authProviderUid || ''}`;
    SQL_ACADEMIC_CONTEXT_CACHE.data = resolved;
    return resolved;
  } catch (error) {
    console.warn('[EduGest][sql] Failed to ensure academic context', error);
    return null;
  }
}

/**
 * Atajo para obtener el schoolId de la base de datos SQL para el perfil activo.
 */
export async function ensureSqlSchoolIdForProfile() {
  const context = await ensureSqlAcademicContext();
  return String(context?.schoolId || '').trim();
}
