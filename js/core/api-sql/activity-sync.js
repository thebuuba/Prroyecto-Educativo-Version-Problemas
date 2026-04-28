import { mapActivityToSqlPayload } from '../api-mappings.js';
import { isEnabled } from './client.js';
import { createActivity, updateActivity } from './academic-endpoints.js';
import { ensureSqlAcademicContext, isSqlUuidLike } from './context.js';

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
  
  const shouldUpdate = isSqlUuidLike(activity?.id);
  return shouldUpdate
    ? updateActivity(activity.id, payload)
    : createActivity(payload);
}
