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
  const sessionNameAsEmail = String(S.sessionUserName || '').includes('@') ? S.sessionUserName : '';
  const email = String(S.profile?.email || localUser?.email || authUser?.email || sessionNameAsEmail || '').trim().toLowerCase();
  const schoolId = String(S.profile?.schoolId || S.profile?.school?.id || '').trim();
  const schoolName = String(S.profile?.inst || '').trim();
  if (!email) return null;
  return {
    email,
    schoolId,
    schoolName,
    authProviderUid: S.sessionUserId || '',
    displayName: String(S.profile?.name || S.sessionUserName || localUser?.name || '').trim(),
    firstName: String(S.profile?.firstName || '').trim(),
    lastName: String(S.profile?.lastName || '').trim(),
    phone: String(S.profile?.phone || '').trim(),
    academicYear: String(S.profile?.year || S.schoolYear?.name || '').trim(),
    activePeriod: String(S.profile?.period || S.activePeriodId || '').trim(),
    educationLevel: String(S.profile?.educationSection || '').trim(),
    educationSections: cloneJson(S.profile?.educationSections || [], []),
    setupCompleted: S.profile?.setupCompleted === true,
    preferences: cloneJson(S.preferences || S.profile?.preferences || {}, {}),
    timezone: String(S.profile?.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Santo_Domingo').trim(),
    role: String(S.profile?.role || 'Docente').trim(),
  };
}

export function applySqlProfileBundle(result = {}) {
  if (!result || typeof result !== 'object') return;
  if (!S.profile || typeof S.profile !== 'object') S.profile = {};

  const profile = result.profile && typeof result.profile === 'object' ? result.profile : {};
  const settings = result.settings && typeof result.settings === 'object' ? result.settings : {};
  const metadata = profile.metadata && typeof profile.metadata === 'object' ? profile.metadata : {};

  const fullName = String(profile.full_name || result.user?.display_name || S.profile.name || '').trim();
  const firstName = String(metadata.firstName || S.profile.firstName || '').trim();
  const lastName = String(metadata.lastName || S.profile.lastName || '').trim();

  if (fullName) S.profile.name = fullName;
  if (firstName) S.profile.firstName = firstName;
  if (lastName) S.profile.lastName = lastName;
  if (result.user?.email) S.profile.email = String(result.user.email).trim().toLowerCase();
  if (profile.phone || result.user?.phone) S.profile.phone = String(profile.phone || result.user.phone || '').trim();
  if (profile.teacher_role) S.profile.role = profile.teacher_role;
  if (profile.institution_name) S.profile.inst = profile.institution_name;
  if (profile.academic_year) {
    S.profile.year = profile.academic_year;
    S.schoolYear = { ...(S.schoolYear || {}), id: profile.academic_year, name: profile.academic_year };
  }
  if (profile.education_level) S.profile.educationSection = profile.education_level;
  if (Array.isArray(metadata.educationSections)) S.profile.educationSections = cloneJson(metadata.educationSections, []);
  if (metadata.activePeriod) S.profile.period = metadata.activePeriod;
  if (metadata.setupCompleted === true) S.profile.setupCompleted = true;
  if (settings.timezone) S.profile.timeZone = settings.timezone;
  if (settings.preferences && typeof settings.preferences === 'object') {
    S.preferences = cloneJson(settings.preferences, {});
    S.profile.preferences = cloneJson(settings.preferences, {});
  }
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
    applySqlProfileBundle(result);
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
