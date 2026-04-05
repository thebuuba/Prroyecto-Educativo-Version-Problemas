(function initAulaBaseSqlApi(global) {
  const DEFAULT_BASE_URL = 'http://127.0.0.1:4000';

  // Obtiene get base url.
  function getBaseUrl() {
    const runtime = String(global.localStorage?.getItem('aulabase:sql-api-base-url') || '').trim();
    if (runtime) return runtime.replace(/\/+$/, '');
    return DEFAULT_BASE_URL;
  }

  // Comprueba si is activada.
  function isEnabled() {
    return !!getBaseUrl();
  }

  // Gestiona request.
  async function request(path, options = {}) {
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
  async function loadSchoolCatalog() {
    const payload = await request('/api/bootstrap/catalog');
    return Array.isArray(payload?.schools) ? payload.schools : [];
  }

  // Sincroniza sync perfil.
  async function syncProfile(payload) {
    return request('/api/bootstrap/profile', {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    });
  }

  // Carga cargar grades.
  async function loadGrades(params = {}) {
    return request(`/api/grades${buildQuery(params)}`);
  }

  // Carga cargar sections.
  async function loadSections(params = {}) {
    return request(`/api/sections${buildQuery(params)}`);
  }

  // Carga cargar estudiantes.
  async function loadStudents(params = {}) {
    return request(`/api/students${buildQuery(params)}`);
  }

  // Carga cargar asistencia.
  async function loadAttendance(params = {}) {
    return request(`/api/attendance${buildQuery(params)}`);
  }

  // Carga cargar actividades.
  async function loadActivities(params = {}) {
    return request(`/api/activities${buildQuery(params)}`);
  }

  // Carga cargar evaluations.
  async function loadEvaluations(params = {}) {
    return request(`/api/evaluations${buildQuery(params)}`);
  }

  // Gestiona replace asistencia mes.
  async function replaceAttendanceMonth(payload = {}) {
    return request('/api/attendance', {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    });
  }

  // Gestiona clear asistencia mes.
  async function clearAttendanceMonth(payload = {}) {
    return request('/api/attendance', {
      method: 'DELETE',
      body: JSON.stringify(payload || {}),
    });
  }

  // Crea crear grado.
  async function createGrade(payload = {}) {
    return request('/api/grades', {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    });
  }

  // Actualiza actualizar grado.
  async function updateGrade(gradeId, payload = {}) {
    return request(`/api/grades/${encodeURIComponent(String(gradeId || '').trim())}`, {
      method: 'PATCH',
      body: JSON.stringify(payload || {}),
    });
  }

  // Crea crear sección.
  async function createSection(payload = {}) {
    return request('/api/sections', {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    });
  }

  // Actualiza actualizar sección.
  async function updateSection(sectionId, payload = {}) {
    return request(`/api/sections/${encodeURIComponent(String(sectionId || '').trim())}`, {
      method: 'PATCH',
      body: JSON.stringify(payload || {}),
    });
  }

  // Crea crear estudiante.
  async function createStudent(payload = {}) {
    return request('/api/students', {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    });
  }

  // Actualiza actualizar estudiante.
  async function updateStudent(studentId, payload = {}) {
    return request(`/api/students/${encodeURIComponent(String(studentId || '').trim())}`, {
      method: 'PATCH',
      body: JSON.stringify(payload || {}),
    });
  }

  // Elimina eliminar grado.
  async function deleteGrade(gradeId, payload = {}) {
    return request(`/api/grades/${encodeURIComponent(String(gradeId || '').trim())}`, {
      method: 'DELETE',
      body: JSON.stringify(payload || {}),
    });
  }

  // Elimina eliminar sección.
  async function deleteSection(sectionId, payload = {}) {
    return request(`/api/sections/${encodeURIComponent(String(sectionId || '').trim())}`, {
      method: 'DELETE',
      body: JSON.stringify(payload || {}),
    });
  }

  // Elimina eliminar estudiante.
  async function deleteStudent(studentId, payload = {}) {
    return request(`/api/students/${encodeURIComponent(String(studentId || '').trim())}`, {
      method: 'DELETE',
      body: JSON.stringify(payload || {}),
    });
  }

  // Crea crear actividad.
  async function createActivity(payload = {}) {
    return request('/api/activities', {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    });
  }

  // Actualiza actualizar actividad.
  async function updateActivity(activityId, payload = {}) {
    return request(`/api/activities/${encodeURIComponent(String(activityId || '').trim())}`, {
      method: 'PATCH',
      body: JSON.stringify(payload || {}),
    });
  }

  // Elimina eliminar actividad.
  async function deleteActivity(activityId, payload = {}) {
    return request(`/api/activities/${encodeURIComponent(String(activityId || '').trim())}`, {
      method: 'DELETE',
      body: JSON.stringify(payload || {}),
    });
  }

  // Gestiona upsert evaluations.
  async function upsertEvaluations(payload = {}) {
    return request('/api/evaluations', {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    });
  }

  // Elimina eliminar evaluations.
  async function deleteEvaluations(payload = {}) {
    return request('/api/evaluations', {
      method: 'DELETE',
      body: JSON.stringify(payload || {}),
    });
  }

  // Carga cargar academic snapshot.
  async function loadAcademicSnapshot(params = {}) {
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
  function buildQuery(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      const normalized = String(value ?? '').trim();
      if (normalized) query.set(key, normalized);
    });
    const serialized = query.toString();
    return serialized ? `?${serialized}` : '';
  }

  // Carga cargar estado block.
  async function loadStateBlock(blockKey, context = {}) {
    const cleanBlockKey = String(blockKey || '').trim();
    return request(`/api/state/${encodeURIComponent(cleanBlockKey)}${buildQuery(context)}`);
  }

  // Sincroniza sync estado block.
  async function syncStateBlock(blockKey, context = {}, payload = {}, payloadHash = '') {
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

  global.AulaBaseSqlApi = {
    getBaseUrl,
    isEnabled,
    loadAcademicSnapshot,
    loadAttendance,
    replaceAttendanceMonth,
    clearAttendanceMonth,
    loadGrades,
    loadSections,
    loadStudents,
    createGrade,
    updateGrade,
    createSection,
    updateSection,
    createStudent,
    updateStudent,
    deleteGrade,
    deleteSection,
    deleteStudent,
    loadActivities,
    loadEvaluations,
    createActivity,
    updateActivity,
    deleteActivity,
    upsertEvaluations,
    deleteEvaluations,
    loadSchoolCatalog,
    syncProfile,
    loadStateBlock,
    syncStateBlock,
  };
})(window);
