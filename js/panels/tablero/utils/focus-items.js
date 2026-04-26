/**
 * Utilidad: Constructor de Elementos de Enfoque
 * --------------------------------------------------------------------------
 * Genera la lista de elementos de enfoque prioritario basados en el estado
 * del usuario para guiarlo a través del flujo de configuración inicial.
 */

/**
 * Construye la lista de elementos de enfoque prioritario basados en el estado del usuario.
 * @param {Object} params - Parámetros de estado
 * @param {Array} params.courses - Lista de cursos
 * @param {number} params.totalStudents - Total de estudiantes
 * @param {number} params.totalActivities - Total de actividades
 * @param {number} params.pendingInstruments - Actividades sin instrumento
 * @param {boolean} params.hasPlanning - Si hay planificaciones
 * @returns {Array} Lista de elementos de enfoque
 */
export function buildFocusItems({ courses, totalStudents, totalActivities, pendingInstruments, hasPlanning }) {
  const items = [];
  
  if (courses.length === 0) {
    items.push({ 
      tone: 'rose', 
      icon: 'add_circle', 
      eyebrow: 'Paso 1', 
      title: 'Crea tu primer curso', 
      text: 'Define los grados y secciones que impartirás este año escolar.', 
      clickAction: "window.go('configuracion-academica')", 
      action: '<button class="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-colors">Crear grado</button>' 
    });
  } else if (totalStudents === 0) {
    items.push({ 
      tone: 'aqua', 
      icon: 'person_add', 
      eyebrow: 'Paso 2', 
      title: 'Carga tu matrícula', 
      text: 'Agrega los estudiantes a tus secciones para habilitar el registro de asistencia y notas.', 
      clickAction: "window.go('estudiantes')", 
      action: '<button class="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-colors">Ir a estudiantes</button>' 
    });
  } else if (!hasPlanning) {
    items.push({ 
      tone: 'green', 
      icon: 'drafts', 
      eyebrow: 'Paso 3', 
      title: 'Prepara tu planificación', 
      text: 'Organiza las competencias y bloques para el período activo.', 
      clickAction: "window.go('planificaciones')", 
      action: '<button class="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-colors">Planificar ahora</button>' 
    });
  } else if (totalActivities === 0) {
    items.push({ 
      tone: 'amber', 
      icon: 'assignment_add', 
      eyebrow: 'Paso 4', 
      title: 'Define tus actividades', 
      text: 'Crea las actividades evaluativas para comenzar a calificar a tus estudiantes.', 
      clickAction: "window.go('actividades')", 
      action: '<button class="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-colors">Crear actividades</button>' 
    });
  } else if (pendingInstruments > 0) {
    items.push({ 
      tone: 'rose', 
      icon: 'rule', 
      eyebrow: 'Pendiente', 
      title: 'Vincula instrumentos', 
      text: `Tienes ${pendingInstruments} actividad(es) sin instrumento de evaluación asignado.`, 
      clickAction: "window.go('instrumentos')", 
      action: '<button class="px-5 py-2.5 bg-rose-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-rose-200 dark:shadow-none hover:bg-rose-700 transition-colors">Vincular instrumentos</button>' 
    });
  } else {
    items.push({ 
      tone: 'emerald', 
      icon: 'verified', 
      eyebrow: 'Todo listo', 
      title: 'Tu panel está al día', 
      text: 'Ya puedes monitorear el progreso de tus secciones y generar reportes periódicos.', 
      clickAction: "window.go('reportes')", 
      action: '<button class="px-5 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 transition-colors">Ver reportes</button>' 
    });
  }
  
  return items;
}