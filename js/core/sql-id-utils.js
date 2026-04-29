import { S } from './state.js';

export function isSqlUuidLike(value) {
  const str = String(value || '');
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export function resolveEntitySqlId(entity) {
  if (!entity || typeof entity !== 'object') return '';
  const sqlId = String(entity.sqlId || '').trim();
  if (isSqlUuidLike(sqlId)) return sqlId;
  const id = String(entity.id || '').trim();
  return isSqlUuidLike(id) ? id : '';
}

function findByLocalOrSqlId(items, id) {
  const cleanId = String(id || '').trim();
  if (!cleanId || !Array.isArray(items)) return null;
  return items.find((item) => String(item?.id || '') === cleanId || String(item?.sqlId || '') === cleanId) || null;
}

export function resolveGradeSqlId(gradeOrId) {
  if (gradeOrId && typeof gradeOrId === 'object') return resolveEntitySqlId(gradeOrId);
  return resolveEntitySqlId(findByLocalOrSqlId(S.grades, gradeOrId)) || (isSqlUuidLike(gradeOrId) ? String(gradeOrId).trim() : '');
}

export function resolveSectionSqlId(sectionOrId) {
  if (sectionOrId && typeof sectionOrId === 'object') return resolveEntitySqlId(sectionOrId);
  return resolveEntitySqlId(findByLocalOrSqlId(S.secciones, sectionOrId)) || (isSqlUuidLike(sectionOrId) ? String(sectionOrId).trim() : '');
}

export function resolveStudentSqlId(studentOrId) {
  if (studentOrId && typeof studentOrId === 'object') return resolveEntitySqlId(studentOrId);
  return resolveEntitySqlId(findByLocalOrSqlId(S.estudiantes, studentOrId)) || (isSqlUuidLike(studentOrId) ? String(studentOrId).trim() : '');
}

export function rememberSqlId(entity, sqlId) {
  const cleanSqlId = String(sqlId || '').trim();
  if (!entity || typeof entity !== 'object' || !isSqlUuidLike(cleanSqlId)) return false;
  entity.sqlId = cleanSqlId;
  return true;
}
