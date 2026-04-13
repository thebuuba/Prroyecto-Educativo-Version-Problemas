/**
 * Punto de Entrada Raíz de EduGest (The Bridge).
 * --------------------------------------------------------------------------
 * Este archivo actúa como el puente universal entre la arquitectura modular 
 * moderna (ES Modules) y los componentes legados que aún dependen del 
 * ámbito global `window`.
 * 
 * Responsabilidades:
 * 1. Inicialización del Store global (window.S).
 * 2. Exposición de APIs nucleares (DB, SQL, Cloud).
 * 3. Mapeo de utilidades de dominio para compatibilidad hacia atrás.
 * 4. Orquestación del ciclo de arranque (Boot) y carga del Shell.
 */

import { S } from '../core/state.js';
import { go } from '../core/routing.js';
import { hydrate, persist, readBrowserSession, clearBrowserSession } from '../core/hydration.js';
import * as DomainUtils from '../core/domain-utils.js';
import * as Interactions from '../core/interactions.js';
import { boot } from '../core/app.js';
import { initShell, updateSBUser } from '../core/shell.js';
import { initDeleters } from '../core/deleters.js';
import * as Cloud from '../core/api-cloud.js';
import * as DB from '../core/api-db.js';
import * as SQL from '../core/api-sql.js';
import * as StudentLogic from '../core/student-logic.js';
import * as SectionLogic from '../core/section-logic.js';
import * as SetupPanel from '../panels/setup.js';
import * as UsersPanel from '../panels/users.js';
import * as GradeSetupPanel from '../panels/grade-setup.js';
import * as StudentCreatePanel from '../panels/student-create.js';
import * as StudentEditPanel from '../panels/student-edit.js';
import * as SectionCreatePanel from '../panels/section-create.js';
import * as DashboardPanel from '../panels/dashboard.js';
import * as StudentsPanel from '../panels/students.js';
import { ensurePanelBundleLoaded } from '../core/routing.js';

console.log('[EduGest] Cargando punto de entrada raíz modular...');

if (!window.__AULABASE_PERSIST_GUARDS_INSTALLED) {
  window.__AULABASE_PERSIST_GUARDS_INSTALLED = true;
  const flushPendingState = () => {
    try {
      window.EduGestDB?.flushPendingSave?.();
    } catch (_) {}
  };
  window.addEventListener('beforeunload', flushPendingState);
  window.addEventListener('pagehide', flushPendingState);
}

/**
 * --- Puente de Compatibilidad (Legacy Bridge) ---
 * Expone funciones modulares al objeto 'window' para que el HTML y scripts 
 * antiguos puedan invocarlas sin necesidad de importar módulos.
 */

// APIs de Persistencia y Nube
window.EduGestDB = DB;
window.AulaBaseSqlApi = SQL;
window.EduGestCloud = Cloud;

// Estado y Navegación
window.S = S;
window.go = go;
window.hydrate = hydrate;
window.persist = persist;
window.readBrowserSession = readBrowserSession;
window.clearBrowserSession = clearBrowserSession;

// --- Utilidades de Currículo y Normalización ---
/** @namespace CurriculumBridge */
window.curriculumNormalizeGradeKey = DomainUtils.curriculumNormalizeGradeKey;
window.curriculumSpecificCompetencyLookup = DomainUtils.curriculumSpecificCompetencyLookup;
window.curriculumGradeContext = DomainUtils.curriculumGradeContext;
window.restoreSpanishQuestionCorruption = DomainUtils.restoreSpanishQuestionCorruption;
window.curriculumNormalizeSpecificCompetencyText = DomainUtils.curriculumNormalizeSpecificCompetencyText;
window.curriculumNormalizeSpecificCompetencyFallbacks = DomainUtils.curriculumNormalizeSpecificCompetencyFallbacks;

// --- Utilidades Académicas y Matemáticas ---
/** @namespace AcademicBridge */
window.round2 = DomainUtils.round2;
window.getGrade = DomainUtils.getGrade;
window.studentFinal = DomainUtils.studentFinal;
window.studentBlockScore = DomainUtils.studentBlockScore;
window.mapEvaluationToActivityScore = DomainUtils.mapEvaluationToActivityScore;
window.mapGradeToSqlPayload = DomainUtils.mapGradeToSqlPayload;
window.mapSectionToSqlPayload = DomainUtils.mapSectionToSqlPayload;
window.mapStudentToSqlPayload = DomainUtils.mapStudentToSqlPayload;
window.mapActivityToSqlPayload = DomainUtils.mapActivityToSqlPayload;
window.mapEvaluationToSqlPayload = DomainUtils.mapEvaluationToSqlPayload;

// --- Gestión de Planificación Docente ---
/** @namespace PlanningBridge */
window.lessonPlanStoredGroupId = DomainUtils.lessonPlanStoredGroupId;
window.lessonPlanStoredPeriodId = DomainUtils.lessonPlanStoredPeriodId;
window.lessonPlanTeacherName = DomainUtils.lessonPlanTeacherName;
window.lessonPlanInstitutionName = DomainUtils.lessonPlanInstitutionName;
window.lessonPlanTransversalAxisDescription = DomainUtils.lessonPlanTransversalAxisDescription;
window.lessonPlanSpecificPlaceholderForFundamental = DomainUtils.lessonPlanSpecificPlaceholderForFundamental;

// --- Interacciones de Interfaz y UX ---
/** @namespace UIBridge */
window.toggleDarkMode = DomainUtils.toggleDarkMode;
window.openSettingsPanel = Interactions.openSettingsPanel;
window.setSidebarExpanded = Interactions.setSidebarExpanded;
window.collapseSidebarIfAllowed = Interactions.collapseSidebarIfAllowed;
window.syncSidebarOverlayState = Interactions.syncSidebarOverlayState;
window.applyUserPreferences = DomainUtils.applyUserPreferences;
window.refreshTop = Interactions.refreshTop;
window.updateSBUser = updateSBUser; // Exportar explícitamente desde Shell

// --- Sincronización de Datos ---
/** @namespace SyncBridge */
window.syncSqlEvaluationUpsert = DomainUtils.syncSqlEvaluationUpsert;
window.upsertLocalEvaluationRecord = DomainUtils.upsertLocalEvaluationRecord;
window.findActivity = DomainUtils.findActivity;
window.scoreClass = DomainUtils.scoreClass;
window.blockRawMax = DomainUtils.blockRawMax;
window.studentBlockRaw = DomainUtils.studentBlockRaw;
window.doNormalize = DomainUtils.doNormalize;
window.blockMeta = DomainUtils.blockMeta;

// --- Motor de Autenticación y Sesión ---
window.logoutAuth = DomainUtils.logoutAuth;

// --- Motor de Creación Académica ---
window.saveGrade = DomainUtils.saveGrade;

// Estudiantes
window.openEstM = StudentLogic.openEstM;
window.saveEst = StudentLogic.saveEst;
window.openViewStudent = StudentLogic.openViewStudent;
window.openEditStudent = StudentLogic.openEditStudent;
window.saveEditStudent = StudentLogic.saveEditStudent;
window.openBulkEstM = StudentLogic.openBulkEstM;
window.chooseStudentAddMode = StudentLogic.chooseStudentAddMode;
window.openStudentAddModeModal = StudentLogic.openStudentAddModeModal;
window.handleBulkFileChange = StudentLogic.handleBulkFileChange;
window.analyzeBulkInput = StudentLogic.analyzeBulkInput;
window.saveBulkEst = StudentLogic.saveBulkEst;

// Secciones / Asignaturas
window.openSecM = SectionLogic.openSecM;
window.saveSec = SectionLogic.saveSec;
window.openEditSection = SectionLogic.openEditSection;
window.saveEditSection = SectionLogic.saveEditSection;
window.openSubjectInGrade = SectionLogic.openSubjectInGrade;
window.migrateSectionReferences = SectionLogic.migrateSectionReferences;

/**
 * --- Motor de Renderizado Reactivo ---
 */

/**
 * Orquestador principal de renderizado de paneles.
 * Busca la función de renderizado en el registro 'RENDERS' y la ejecuta 
 * sobre el contenedor principal. Si el panel no está cargado, intenta 
 * descargar su bundle dinámicamente.
 */
window._renderPanel = async () => {
  const container = document.getElementById('view');
  if (!container) return;
  
  const page = S.currentPage || 'dashboard';
  
  // 1. Verificar si ya tenemos el renderizador en memoria
  if (window.RENDERS && typeof window.RENDERS[page] === 'function') {
    window.RENDERS[page](container);
    window.refreshTop();
    return;
  }
  
  // 2. Si no, intentar cargar el bundle dinámicante
  try {
    const loaded = await ensurePanelBundleLoaded(page, window.RENDERS || {});
    if (loaded && window.RENDERS[page]) {
      window.RENDERS[page](container);
      window.refreshTop();
    } else {
      console.warn(`[EduGest][render] No se encontró renderizador para el panel: ${page}`);
    }
  } catch (err) {
    console.error(`[EduGest][render] Error cargando bundle para ${page}:`, err);
  }
};

/**
 * Inicialización principal al cargar el DOM.
 * Gestiona el arranque de los subsistemas y la hidratación de datos.
 */
function startEduGest() {
  // Inicializar componentes del shell (Sidebars, Modales, Tooltips)
  initShell();
  
  // Inicializar manejadores de eliminación (confirmaciones globales)
  initDeleters();
  
  // Inicializar paneles reactivos modernos
  if (DashboardPanel.init) DashboardPanel.init();
  if (UsersPanel.init) UsersPanel.init();
  if (StudentsPanel.init) StudentsPanel.init();
  if (SetupPanel.init) SetupPanel.init();

  // Ejecutar el orquestador de arranque (Hidratación, Auth, Sincronización)
  boot().catch(err => {
    console.error('[EduGest][boot] Fallo crítico durante el arranque:', err);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startEduGest);
} else {
  startEduGest();
}
