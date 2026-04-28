import { request } from './client.js';
import { getSqlStateContext } from './context.js';
import { buildQuery } from './query.js';

/**
 * Carga la lista de grados asociados al perfil.
 */
export async function loadGrades(params = {}) {
  const context = getSqlStateContext();
  const enrichedParams = {
    ...params,
    ...(context?.authProviderUid ? { authProviderUid: context.authProviderUid } : {}),
    ...(context?.userId ? { userId: context.userId } : {}),
  };
  return request(`/api/grades${buildQuery(enrichedParams)}`);
}

/**
 * Carga la lista de secciones (cursos) asociadas al perfil.
 */
export async function loadSections(params = {}) {
  const context = getSqlStateContext();
  const enrichedParams = {
    ...params,
    ...(context?.authProviderUid ? { authProviderUid: context.authProviderUid } : {}),
    ...(context?.userId ? { userId: context.userId } : {}),
  };
  return request(`/api/sections${buildQuery(enrichedParams)}`);
}

/**
 * Carga la lista de estudiantes.
 */
export async function loadStudents(params = {}) {
  const context = getSqlStateContext();
  const enrichedParams = {
    ...params,
    ...(context?.authProviderUid ? { authProviderUid: context.authProviderUid } : {}),
    ...(context?.userId ? { userId: context.userId } : {}),
  };
  return request(`/api/students${buildQuery(enrichedParams)}`);
}

/**
 * Carga los registros de asistencia históricos.
 */
export async function loadAttendance(params = {}) {
  const context = getSqlStateContext();
  const enrichedParams = {
    ...params,
    ...(context?.authProviderUid ? { authProviderUid: context.authProviderUid } : {}),
    ...(context?.userId ? { userId: context.userId } : {}),
  };
  return request(`/api/attendance${buildQuery(enrichedParams)}`);
}

/**
 * Carga la lista de actividades evaluativas.
 */
export async function loadActivities(params = {}) {
  const context = getSqlStateContext();
  const enrichedParams = {
    ...params,
    ...(context?.authProviderUid ? { authProviderUid: context.authProviderUid } : {}),
    ...(context?.userId ? { userId: context.userId } : {}),
  };
  return request(`/api/activities${buildQuery(enrichedParams)}`);
}

/**
 * Carga los resultados de evaluaciones para estudiantes y actividades.
 */
export async function loadEvaluations(params = {}) {
  const context = getSqlStateContext();
  const enrichedParams = {
    ...params,
    ...(context?.authProviderUid ? { authProviderUid: context.authProviderUid } : {}),
    ...(context?.userId ? { userId: context.userId } : {}),
  };
  return request(`/api/evaluations${buildQuery(enrichedParams)}`);
}

/**
 * Reemplaza o crea masivamente los registros de asistencia para un mes específico.
 */
export async function replaceAttendanceMonth(payload = {}) {
  return request('/api/attendance', {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  });
}

/**
 * Elimina todos los registros de asistencia de un mes/sección.
 */
export async function clearAttendanceMonth(payload = {}) {
  return request('/api/attendance', {
    method: 'DELETE',
    body: JSON.stringify(payload || {}),
  });
}

/**
 * Crea un nuevo grado en el servidor SQL.
 */
export async function createGrade(payload = {}) {
  const context = getSqlStateContext();
  const enrichedPayload = {
    ...payload,
    ...(context?.authProviderUid ? { authProviderUid: context.authProviderUid } : {}),
    ...(context?.userId ? { userId: context.userId } : {}),
  };
  return request('/api/grades', {
    method: 'POST',
    body: JSON.stringify(enrichedPayload || {}),
  });
}

/**
 * Actualiza parcialmente los datos de un grado existente.
 */
export async function updateGrade(gradeId, payload = {}) {
  return request(`/api/grades/${encodeURIComponent(String(gradeId || '').trim())}`, {
    method: 'PATCH',
    body: JSON.stringify(payload || {}),
  });
}

/**
 * Crea una nueva sección (curso) en el servidor SQL.
 */
export async function createSection(payload = {}) {
  const context = getSqlStateContext();
  const enrichedPayload = {
    ...payload,
    ...(context?.authProviderUid ? { authProviderUid: context.authProviderUid } : {}),
    ...(context?.userId ? { userId: context.userId } : {}),
  };
  return request('/api/sections', {
    method: 'POST',
    body: JSON.stringify(enrichedPayload || {}),
  });
}

/**
 * Actualiza parcialmente los datos de una sección existente.
 */
export async function updateSection(sectionId, payload = {}) {
  return request(`/api/sections/${encodeURIComponent(String(sectionId || '').trim())}`, {
    method: 'PATCH',
    body: JSON.stringify(payload || {}),
  });
}

/**
 * Crea un nuevo estudiante en el servidor SQL.
 */
export async function createStudent(payload = {}) {
  const context = getSqlStateContext();
  const enrichedPayload = {
    ...payload,
    ...(context?.authProviderUid ? { authProviderUid: context.authProviderUid } : {}),
    ...(context?.userId ? { userId: context.userId } : {}),
  };
  return request('/api/students', {
    method: 'POST',
    body: JSON.stringify(enrichedPayload || {}),
  });
}

/**
 * Actualiza parcialmente los datos de un estudiante existente.
 */
export async function updateStudent(studentId, payload = {}) {
  return request(`/api/students/${encodeURIComponent(String(studentId || '').trim())}`, {
    method: 'PATCH',
    body: JSON.stringify(payload || {}),
  });
}

/**
 * Elimina un grado de la base de datos SQL.
 */
export async function deleteGrade(gradeId, payload = {}) {
  return request(`/api/grades/${encodeURIComponent(String(gradeId || '').trim())}`, {
    method: 'DELETE',
    body: JSON.stringify(payload || {}),
  });
}

/**
 * Elimina una sección de la base de datos SQL.
 */
export async function deleteSection(sectionId, payload = {}) {
  return request(`/api/sections/${encodeURIComponent(String(sectionId || '').trim())}`, {
    method: 'DELETE',
    body: JSON.stringify(payload || {}),
  });
}

/**
 * Elimina un estudiante de la base de datos SQL.
 */
export async function deleteStudent(studentId, payload = {}) {
  return request(`/api/students/${encodeURIComponent(String(studentId || '').trim())}`, {
    method: 'DELETE',
    body: JSON.stringify(payload || {}),
  });
}

/**
 * Crea una nueva actividad evaluativa en el servidor SQL.
 */
export async function createActivity(payload = {}) {
  const context = getSqlStateContext();
  const enrichedPayload = {
    ...payload,
    ...(context?.authProviderUid ? { authProviderUid: context.authProviderUid } : {}),
    ...(context?.userId ? { userId: context.userId } : {}),
  };
  return request('/api/activities', {
    method: 'POST',
    body: JSON.stringify(enrichedPayload || {}),
  });
}

/**
 * Actualiza parcialmente los datos de una actividad existente.
 */
export async function updateActivity(activityId, payload = {}) {
  return request(`/api/activities/${encodeURIComponent(String(activityId || '').trim())}`, {
    method: 'PATCH',
    body: JSON.stringify(payload || {}),
  });
}

/**
 * Elimina una actividad de la base de datos SQL.
 */
export async function deleteActivity(activityId, payload = {}) {
  return request(`/api/activities/${encodeURIComponent(String(activityId || '').trim())}`, {
    method: 'DELETE',
    body: JSON.stringify(payload || {}),
  });
}

/**
 * Crea o actualiza masivamente un conjunto de evaluaciones (calificaciones).
 */
export async function upsertEvaluations(payload = {}) {
  return request('/api/evaluations', {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  });
}

/**
 * Elimina registros de evaluaciones específicos.
 */
export async function deleteEvaluations(payload = {}) {
  return request('/api/evaluations', {
    method: 'DELETE',
    body: JSON.stringify(payload || {}),
  });
}

/**
 * Carga una captura completa de los datos académicos para sincronización fuera de línea.
 */
export async function loadAcademicSnapshot(params = {}) {
  const [grades, sections, students, activities, evaluations, attendance] = await Promise.all([
    loadGrades(params),
    loadSections(params),
    loadStudents(params),
    loadActivities(params),
    loadEvaluations(params),
    loadAttendance(params),
  ]);
  return { grades, sections, students, activities, evaluations, attendance };
}
