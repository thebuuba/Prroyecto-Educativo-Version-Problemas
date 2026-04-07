/**
 * EduGest Root Entry Point
 * 
 * Este archivo actúa como el puente universal ('The Bridge') entre la arquitectura 
 * modular moderna (ES Modules) y los paneles legados que aún dependen del objeto global window.
 * 
 * Responsabilidades:
 * 1. Inicializar el estado global window.S.
 * 2. Exponer APIs críticas (DB, SQL, Cloud) al ámbito global.
 * 3. Bridging de utilidades de dominio y manejadores de interacción.
 * 4. Orquestar la secuencia de arranque (Boot) y la hidratación de datos.
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

// Modular entry point for EduGest
console.log('[EduGest] Root entry point loading...');

// Expose core to global scope for legacy panel compatibility during transition
window.EduGestDB = DB;
window.AulaBaseSqlApi = SQL;
window.EduGestCloud = Cloud;
window.S = S;
window.go = go;
window.hydrate = hydrate;
window.persist = persist;
window.curriculumNormalizeGradeKey = DomainUtils.curriculumNormalizeGradeKey;
window.curriculumSpecificCompetencyLookup = DomainUtils.curriculumSpecificCompetencyLookup;
window.curriculumGradeContext = DomainUtils.curriculumGradeContext;
window.restoreSpanishQuestionCorruption = DomainUtils.restoreSpanishQuestionCorruption;
window.toggleDarkMode = DomainUtils.toggleDarkMode;
window.toggleSidebarPinnedPreference = DomainUtils.toggleSidebarPinnedPreference;
window.applyUserPreferences = DomainUtils.applyUserPreferences;
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
window.lessonPlanStoredGroupId = DomainUtils.lessonPlanStoredGroupId;
window.lessonPlanStoredPeriodId = DomainUtils.lessonPlanStoredPeriodId;
window.lessonPlanTeacherName = DomainUtils.lessonPlanTeacherName;
window.lessonPlanInstitutionName = DomainUtils.lessonPlanInstitutionName;
window.lessonPlanTransversalAxisDescription = DomainUtils.lessonPlanTransversalAxisDescription;
window.lessonPlanSpecificPlaceholderForFundamental = DomainUtils.lessonPlanSpecificPlaceholderForFundamental;
window.curriculumNormalizeSpecificCompetencyText = DomainUtils.curriculumNormalizeSpecificCompetencyText;
window.curriculumNormalizeSpecificCompetencyFallbacks = DomainUtils.curriculumNormalizeSpecificCompetencyFallbacks;
window.openSettingsPanel = Interactions.openSettingsPanel;
window.setSidebarPinned = Interactions.setSidebarPinned;
window.setSidebarExpanded = Interactions.setSidebarExpanded;
window.collapseSidebarIfAllowed = Interactions.collapseSidebarIfAllowed;
window.syncSidebarOverlayState = Interactions.syncSidebarOverlayState;
window.applyUserPreferences = Interactions.applyUserPreferences;
window.syncSqlEvaluationUpsert = DomainUtils.syncSqlEvaluationUpsert;
window.upsertLocalEvaluationRecord = DomainUtils.upsertLocalEvaluationRecord;
window.findActivity = DomainUtils.findActivity;
window.scoreClass = DomainUtils.scoreClass;
window.blockRawMax = DomainUtils.blockRawMax;
window.studentBlockRaw = DomainUtils.studentBlockRaw;
window.doNormalize = DomainUtils.doNormalize;
window.blockMeta = DomainUtils.blockMeta;
window.refreshTop = Interactions.refreshTop; // Moved this too!

document.addEventListener('DOMContentLoaded', () => {
  // Initialize modular subsystems
  initShell();
  initDeleters();
  if (UsersPanel.init) UsersPanel.init();

  boot().catch(err => {
    console.error('[EduGest][boot] Critical failure during startup:', err);
  });
});
