/**
 * Capa de compatibilidad legacy.
 * Centraliza la exposición de APIs modulares al ámbito global `window`
 * para que el HTML inline y los flujos heredados sigan funcionando.
 */

import { S } from './state.js';
import { go, ensurePanelBundleLoaded } from './routing.js';
import { hydrate, persist, readBrowserSession, clearBrowserSession } from './hydration.js';
import * as DomainUtils from './domain-utils.js';
import * as Interactions from './interactions.js';
import { updateSBUser } from './shell.js';
import * as Cloud from './api-cloud.js';
import * as DB from './api-db.js';
import * as SQL from './api-sql.js';
import * as StudentLogic from './student-logic.js';
import * as SectionLogic from './section-logic.js';

export function installPersistGuards() {
  if (window.__AULABASE_PERSIST_GUARDS_INSTALLED) return;

  window.__AULABASE_PERSIST_GUARDS_INSTALLED = true;
  const flushPendingState = () => {
    try {
      window.EduGestDB?.flushPendingSave?.();
    } catch (_) {}
  };

  window.addEventListener('beforeunload', flushPendingState);
  window.addEventListener('pagehide', flushPendingState);
}

export function registerLegacyBridge() {
  Object.assign(window, {
    EduGestDB: DB,
    AulaBaseSqlApi: SQL,
    EduGestCloud: Cloud,
    S,
    go,
    hydrate,
    persist,
    readBrowserSession,
    clearBrowserSession,
    curriculumNormalizeGradeKey: DomainUtils.curriculumNormalizeGradeKey,
    curriculumSpecificCompetencyLookup: DomainUtils.curriculumSpecificCompetencyLookup,
    curriculumGradeContext: DomainUtils.curriculumGradeContext,
    restoreSpanishQuestionCorruption: DomainUtils.restoreSpanishQuestionCorruption,
    curriculumNormalizeSpecificCompetencyText: DomainUtils.curriculumNormalizeSpecificCompetencyText,
    curriculumNormalizeSpecificCompetencyFallbacks: DomainUtils.curriculumNormalizeSpecificCompetencyFallbacks,
    round2: DomainUtils.round2,
    getGrade: DomainUtils.getGrade,
    studentFinal: DomainUtils.studentFinal,
    studentBlockScore: DomainUtils.studentBlockScore,
    mapEvaluationToActivityScore: DomainUtils.mapEvaluationToActivityScore,
    mapGradeToSqlPayload: DomainUtils.mapGradeToSqlPayload,
    mapSectionToSqlPayload: DomainUtils.mapSectionToSqlPayload,
    mapStudentToSqlPayload: DomainUtils.mapStudentToSqlPayload,
    mapActivityToSqlPayload: DomainUtils.mapActivityToSqlPayload,
    mapEvaluationToSqlPayload: DomainUtils.mapEvaluationToSqlPayload,
    lessonPlanStoredGroupId: DomainUtils.lessonPlanStoredGroupId,
    lessonPlanStoredPeriodId: DomainUtils.lessonPlanStoredPeriodId,
    lessonPlanTeacherName: DomainUtils.lessonPlanTeacherName,
    lessonPlanInstitutionName: DomainUtils.lessonPlanInstitutionName,
    lessonPlanTransversalAxisDescription: DomainUtils.lessonPlanTransversalAxisDescription,
    lessonPlanSpecificPlaceholderForFundamental: DomainUtils.lessonPlanSpecificPlaceholderForFundamental,
    toggleDarkMode: DomainUtils.toggleDarkMode,
    applyUserPreferences: DomainUtils.applyUserPreferences,
    openSettingsPanel: Interactions.openSettingsPanel,
    setSidebarExpanded: Interactions.setSidebarExpanded,
    collapseSidebarIfAllowed: Interactions.collapseSidebarIfAllowed,
    syncSidebarOverlayState: Interactions.syncSidebarOverlayState,
    refreshTop: Interactions.refreshTop,
    updateSBUser,
    syncSqlEvaluationUpsert: DomainUtils.syncSqlEvaluationUpsert,
    upsertLocalEvaluationRecord: DomainUtils.upsertLocalEvaluationRecord,
    findActivity: DomainUtils.findActivity,
    scoreClass: DomainUtils.scoreClass,
    blockRawMax: DomainUtils.blockRawMax,
    studentBlockRaw: DomainUtils.studentBlockRaw,
    doNormalize: DomainUtils.doNormalize,
    blockMeta: DomainUtils.blockMeta,
    logoutAuth: DomainUtils.logoutAuth,
    saveGrade: DomainUtils.saveGrade,
    applySqlAcademicSnapshot: SQL.applySqlAcademicSnapshot,
    hydrateSqlAcademicSnapshotForActiveUser: SQL.hydrateSqlAcademicSnapshotForActiveUser,
    hydrateSqlStateBlocksForActiveUser: SQL.hydrateSqlStateBlocksForActiveUser,
    scheduleSqlStateBlockSyncs: SQL.scheduleSqlStateBlockSyncs,
    flushSqlStateBlockSyncs: SQL.flushSqlStateBlockSyncs,
    syncSqlActivityDelete: SQL.syncSqlActivityDelete,
    syncSqlEvaluationsDelete: SQL.syncSqlEvaluationsDelete,
    openEstM: StudentLogic.openEstM,
    saveEst: StudentLogic.saveEst,
    openViewStudent: StudentLogic.openViewStudent,
    openEditStudent: StudentLogic.openEditStudent,
    saveEditStudent: StudentLogic.saveEditStudent,
    openBulkEstM: StudentLogic.openBulkEstM,
    chooseStudentAddMode: StudentLogic.chooseStudentAddMode,
    openStudentAddModeModal: StudentLogic.openStudentAddModeModal,
    handleBulkFileChange: StudentLogic.handleBulkFileChange,
    analyzeBulkInput: StudentLogic.analyzeBulkInput,
    saveBulkEst: StudentLogic.saveBulkEst,
    openSecM: SectionLogic.openSecM,
    saveSec: SectionLogic.saveSec,
    openEditSection: SectionLogic.openEditSection,
    saveEditSection: SectionLogic.saveEditSection,
    openSubjectInGrade: SectionLogic.openSubjectInGrade,
    migrateSectionReferences: SectionLogic.migrateSectionReferences,
  });
}

export function registerPanelRenderer() {
  console.log('[LegacyBridge] Registrando panel renderer');
  window._renderPanel = async () => {
    console.log('[LegacyBridge][_renderPanel] Renderizando panel para página:', S.currentPage);
    const container = document.getElementById('view');
    if (!container) {
      console.log('[LegacyBridge][_renderPanel] Contenedor #view no encontrado');
      console.log('[LegacyBridge][_renderPanel] Elementos con id view:', document.querySelectorAll('[id*="view"]'));
      return;
    }
    console.log('[LegacyBridge][_renderPanel] Contenedor #view encontrado');
    console.log('[LegacyBridge][_renderPanel] Contenedor innerHTML antes:', container.innerHTML.substring(0, 100));

    const page = S.currentPage || 'tablero';
    console.log('[LegacyBridge][_renderPanel] Página a renderizar:', page);

    if (window.RENDERS && typeof window.RENDERS[page] === 'function') {
      console.log('[LegacyBridge][_renderPanel] Usando renderizador existente para:', page);
      console.log('[LegacyBridge][_renderPanel] Llamando a RENDERS[' + page + ']');
      window.RENDERS[page](container);
      console.log('[LegacyBridge][_renderPanel] Contenedor innerHTML después:', container.innerHTML.substring(0, 100));
      console.log('[LegacyBridge][_renderPanel] Renderizador ejecutado, llamando a refreshTop');
      console.log('[LegacyBridge][_renderPanel] refreshTop existe:', typeof window.refreshTop);
      if (typeof window.refreshTop === 'function') {
        window.refreshTop();
        console.log('[LegacyBridge][_renderPanel] refreshTop ejecutado');
      }
      return;
    }

    try {
      console.log('[LegacyBridge][_renderPanel] Cargando bundle para:', page);
      const loaded = await ensurePanelBundleLoaded(page, window.RENDERS || {});
      if (loaded && window.RENDERS[page]) {
        console.log('[LegacyBridge][_renderPanel] Bundle cargado, renderizando:', page);
        window.RENDERS[page](container);
        window.refreshTop();
      } else {
        console.warn(`[EduGest][render] No se encontró renderizador para el panel: ${page}`);
      }
    } catch (err) {
      console.error(`[EduGest][render] Error cargando bundle para ${page}:`, err);
    }
  };
  console.log('[LegacyBridge] Panel renderer registrado');
}
