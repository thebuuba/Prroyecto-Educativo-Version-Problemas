const DEFAULT_BASE_URL = 'http://127.0.0.1:4000';

// Obtiene get base url.
export function getBaseUrl() {
  const runtime = String(window.localStorage?.getItem('aulabase:sql-api-base-url') || '').trim();
  if (runtime) return runtime.replace(/\/+$/, '');
  return DEFAULT_BASE_URL;
}

// Comprueba si is activada.
export function isEnabled() {
  return !!getBaseUrl();
}

// Gestiona request.
export async function request(path, options = {}) {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch (_) {
    payload = null;
  }

  if (!response.ok) {
    const message = String(payload?.message || `SQL API error (${response.status})`).trim();
    throw new Error(message);
  }

  return payload;
}

// Carga cargar escuela catalog.
export async function loadSchoolCatalog() {
  const payload = await request('/api/bootstrap/catalog');
  return Array.isArray(payload?.schools) ? payload.schools : [];
}

// Sincroniza sync perfil.
export async function syncProfile(payload) {
  return request('/api/bootstrap/profile', {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  });
}

// Carga cargar grades.
export async function loadGrades(params = {}) {
  return request(`/api/grades${buildQuery(params)}`);
}

// Carga cargar sections.
export async function loadSections(params = {}) {
  return request(`/api/sections${buildQuery(params)}`);
}

// Carga cargar estudiantes.
export async function loadStudents(params = {}) {
  return request(`/api/students${buildQuery(params)}`);
}

// Carga cargar asistencia.
export async function loadAttendance(params = {}) {
  return request(`/api/attendance${buildQuery(params)}`);
}

// Carga cargar actividades.
export async function loadActivities(params = {}) {
  return request(`/api/activities${buildQuery(params)}`);
}

// Carga cargar evaluations.
export async function loadEvaluations(params = {}) {
  return request(`/api/evaluations${buildQuery(params)}`);
}

// Gestiona replace asistencia mes.
export async function replaceAttendanceMonth(payload = {}) {
  return request('/api/attendance', {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  });
}

// Gestiona clear asistencia mes.
export async function clearAttendanceMonth(payload = {}) {
  return request('/api/attendance', {
    method: 'DELETE',
    body: JSON.stringify(payload || {}),
  });
}

// Crea crear grado.
export async function createGrade(payload = {}) {
  return request('/api/grades', {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  });
}

// Actualiza actualizar grado.
export async function updateGrade(gradeId, payload = {}) {
  return request(`/api/grades/${encodeURIComponent(String(gradeId || '').trim())}`, {
    method: 'PATCH',
    body: JSON.stringify(payload || {}),
  });
}

// Crea crear sección.
export async function createSection(payload = {}) {
  return request('/api/sections', {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  });
}

// Actualiza actualizar sección.
export async function updateSection(sectionId, payload = {}) {
  return request(`/api/sections/${encodeURIComponent(String(sectionId || '').trim())}`, {
    method: 'PATCH',
    body: JSON.stringify(payload || {}),
  });
}

// Crea crear estudiante.
export async function createStudent(payload = {}) {
  return request('/api/students', {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  });
}

// Actualiza actualizar estudiante.
export async function updateStudent(studentId, payload = {}) {
  return request(`/api/students/${encodeURIComponent(String(studentId || '').trim())}`, {
    method: 'PATCH',
    body: JSON.stringify(payload || {}),
  });
}

// Elimina eliminar grado.
export async function deleteGrade(gradeId, payload = {}) {
  return request(`/api/grades/${encodeURIComponent(String(gradeId || '').trim())}`, {
    method: 'DELETE',
    body: JSON.stringify(payload || {}),
  });
}

// Elimina eliminar sección.
export async function deleteSection(sectionId, payload = {}) {
  return request(`/api/sections/${encodeURIComponent(String(sectionId || '').trim())}`, {
    method: 'DELETE',
    body: JSON.stringify(payload || {}),
  });
}

// Elimina eliminar estudiante.
export async function deleteStudent(studentId, payload = {}) {
  return request(`/api/students/${encodeURIComponent(String(studentId || '').trim())}`, {
    method: 'DELETE',
    body: JSON.stringify(payload || {}),
  });
}

// Crea crear actividad.
export async function createActivity(payload = {}) {
  return request('/api/activities', {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  });
}

// Actualiza actualizar actividad.
export async function updateActivity(activityId, payload = {}) {
  return request(`/api/activities/${encodeURIComponent(String(activityId || '').trim())}`, {
    method: 'PATCH',
    body: JSON.stringify(payload || {}),
  });
}

// Elimina eliminar actividad.
export async function deleteActivity(activityId, payload = {}) {
  return request(`/api/activities/${encodeURIComponent(String(activityId || '').trim())}`, {
    method: 'DELETE',
    body: JSON.stringify(payload || {}),
  });
}

// Gestiona upsert evaluations.
export async function upsertEvaluations(payload = {}) {
  return request('/api/evaluations', {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  });
}

// Elimina eliminar evaluations.
export async function deleteEvaluations(payload = {}) {
  return request('/api/evaluations', {
    method: 'DELETE',
    body: JSON.stringify(payload || {}),
  });
}

// Carga cargar academic snapshot.
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

// Construye construir query.
export function buildQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    const normalized = String(value ?? '').trim();
    if (normalized) query.set(key, normalized);
  });
  const serialized = query.toString();
  return serialized ? `?${serialized}` : '';
}

// Carga cargar estado block.
export async function loadStateBlock(blockKey, context = {}) {
  const cleanBlockKey = String(blockKey || '').trim();
  return request(`/api/state/${encodeURIComponent(cleanBlockKey)}${buildQuery(context)}`);
}

// Sincroniza sync estado block.
export async function syncStateBlock(blockKey, context = {}, payload = {}, payloadHash = '') {
  const cleanBlockKey = String(blockKey || '').trim();
  return request(`/api/state/${encodeURIComponent(cleanBlockKey)}`, {
    method: 'POST',
    body: JSON.stringify({
      ...(context || {}),
      payload,
      payloadHash: String(payloadHash || '').trim(),
    }),
  });
}
