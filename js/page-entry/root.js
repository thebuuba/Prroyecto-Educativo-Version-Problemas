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
import { hydrate, persist } from '../core/hydration.js';
import * as DomainUtils from '../core/domain-utils.js';
import * as Interactions from '../core/interactions.js';
import { boot } from '../core/app.js';
import { initShell } from '../core/shell.js';
import { initDeleters } from '../core/deleters.js';
import * as UsersPanel from '../panels/users.js';
import * as DB from '../core/api-db.js';
import * as SQL from '../core/api-sql.js';
import * as Cloud from '../core/api-cloud.js';

console.log('[EduGest] Cargando punto de entrada raíz modular...');

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
window.toggleSidebarPinnedPreference = DomainUtils.toggleSidebarPinnedPreference;
window.openSettingsPanel = Interactions.openSettingsPanel;
window.setSidebarPinned = Interactions.setSidebarPinned;
window.setSidebarExpanded = Interactions.setSidebarExpanded;
window.collapseSidebarIfAllowed = Interactions.collapseSidebarIfAllowed;
window.syncSidebarOverlayState = Interactions.syncSidebarOverlayState;
window.applyUserPreferences = DomainUtils.applyUserPreferences;
window.refreshTop = Interactions.refreshTop;

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

/**
 * Inicialización principal al cargar el DOM.
 * Gestiona el arranque de los subsistemas y la hidratación de datos.
 */
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar componentes del shell (Sidebars, Modales, Tooltips)
  initShell();
  
  // Inicializar manejadores de eliminación (confirmaciones globales)
  initDeleters();
  
  // Inicializar paneles reactivos modernos
  if (UsersPanel.init) UsersPanel.init();

  // Ejecutar el orquestador de arranque (Hidratación, Auth, Sincronización)
  boot().catch(err => {
    console.error('[EduGest][boot] Fallo crítico durante el arranque:', err);
  });
});
