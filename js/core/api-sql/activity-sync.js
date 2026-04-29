import { mapActivityToSqlPayload } from '../api-mappings.js';
import { isEnabled } from './client.js';
import { createActivity, updateActivity } from './academic-endpoints.js';
import { ensureSqlAcademicContext } from './context.js';
import { isSqlUuidLike, rememberSqlId, resolveEntitySqlId } from '../sql-id-utils.js';

/**
 * Sincroniza una actividad evaluativa con la base de datos SQL.
 * Determina automáticamente si debe crear o actualizar basándose en el ID.
 */
export async function syncSqlActivityCreateOrUpdate(activity, meta = {}) {
  if (!isEnabled()) return null;
  const context = await ensureSqlAcademicContext();
  if (!context?.schoolId) return null;
  
  const payload = mapActivityToSqlPayload(activity, {
    ...meta,
    schoolId: context.schoolId,
    teacherUserId: context.userId || meta.teacherUserId || '',
  });
  
  if (!payload.sectionId || !payload.name) return null;
  
  const activitySqlId = resolveEntitySqlId(activity);
  const shouldUpdate = isSqlUuidLike(activitySqlId);
  const result = shouldUpdate
    ? await updateActivity(activitySqlId, payload)
    : await createActivity(payload);
  rememberSqlId(activity, result?.id);
  return result;
}
