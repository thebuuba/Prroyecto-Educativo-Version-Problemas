/**
 * Registro central de APIs legacy expuestas temporalmente a `window`.
 *
 * Este archivo es el punto de migración hacia imports ES: cada dominio agrupa
 * funciones que ya existen como módulos y que todavía deben publicarse globalmente
 * para HTML inline o paneles heredados.
 */

import { S } from './state.ts';
import { go } from './routing.ts';
import { hydrate, persist, readBrowserSession, clearBrowserSession } from './hydration.ts';
import * as Config from './config.ts';
import * as DomainUtils from './domain-utils.ts';
import * as Interactions from './interactions.ts';
import { updateSBUser } from './shell.ts';
import * as Cloud from './api-cloud.ts';
import * as DB from './api-db.ts';
import * as SQL from './api-sql.ts';
import * as StudentLogic from './student-logic.ts';
import * as SectionLogic from './section-logic.ts';

export const LEGACY_BRIDGE_REGISTRY = {
  core: {
    EduGestConfig: Config,
    EduGestDB: DB,
    AulaBaseSqlApi: SQL,
    EduGestCloud: Cloud,
    S,
    hydrate,
    persist,
    readBrowserSession,
    clearBrowserSession,
  },
  routing: {
    go,
  },
  curriculum: {
    curriculumNormalizeGradeKey: DomainUtils.curriculumNormalizeGradeKey,
    curriculumSpecificCompetencyLookup: DomainUtils.curriculumSpecificCompetencyLookup,
    curriculumGradeContext: DomainUtils.curriculumGradeContext,
    restoreSpanishQuestionCorruption: DomainUtils.restoreSpanishQuestionCorruption,
    curriculumNormalizeSpecificCompetencyText: DomainUtils.curriculumNormalizeSpecificCompetencyText,
    curriculumNormalizeSpecificCompetencyFallbacks: DomainUtils.curriculumNormalizeSpecificCompetencyFallbacks,
  },
  scoring: {
    round2: DomainUtils.round2,
    getGrade: DomainUtils.getGrade,
    studentFinal: DomainUtils.studentFinal,
    studentBlockScore: DomainUtils.studentBlockScore,
    mapEvaluationToActivityScore: DomainUtils.mapEvaluationToActivityScore,
    findActivity: DomainUtils.findActivity,
    scoreClass: DomainUtils.scoreClass,
    blockRawMax: DomainUtils.blockRawMax,
    studentBlockRaw: DomainUtils.studentBlockRaw,
    doNormalize: DomainUtils.doNormalize,
    blockMeta: DomainUtils.blockMeta,
  },
  sqlMapping: {
    mapGradeToSqlPayload: DomainUtils.mapGradeToSqlPayload,
    mapSectionToSqlPayload: DomainUtils.mapSectionToSqlPayload,
    mapStudentToSqlPayload: DomainUtils.mapStudentToSqlPayload,
    mapActivityToSqlPayload: DomainUtils.mapActivityToSqlPayload,
    mapEvaluationToSqlPayload: DomainUtils.mapEvaluationToSqlPayload,
    syncSqlEvaluationUpsert: DomainUtils.syncSqlEvaluationUpsert,
    applySqlAcademicSnapshot: SQL.applySqlAcademicSnapshot,
    hydrateSqlAcademicSnapshotForActiveUser: SQL.hydrateSqlAcademicSnapshotForActiveUser,
    hydrateSqlStateBlocksForActiveUser: SQL.hydrateSqlStateBlocksForActiveUser,
    scheduleSqlProfileSync: SQL.scheduleSqlProfileSync,
    flushSqlProfileSync: SQL.flushSqlProfileSync,
    scheduleSqlStateBlockSyncs: SQL.scheduleSqlStateBlockSyncs,
    flushSqlStateBlockSyncs: SQL.flushSqlStateBlockSyncs,
    syncSqlActivityDelete: SQL.syncSqlActivityDelete,
    syncSqlEvaluationsDelete: SQL.syncSqlEvaluationsDelete,
  },
  lessonPlanning: {
    lessonPlanStoredGroupId: DomainUtils.lessonPlanStoredGroupId,
    lessonPlanStoredPeriodId: DomainUtils.lessonPlanStoredPeriodId,
    lessonPlanTeacherName: DomainUtils.lessonPlanTeacherName,
    lessonPlanInstitutionName: DomainUtils.lessonPlanInstitutionName,
    lessonPlanTransversalAxisDescription: DomainUtils.lessonPlanTransversalAxisDescription,
    lessonPlanSpecificPlaceholderForFundamental: DomainUtils.lessonPlanSpecificPlaceholderForFundamental,
  },
  ui: {
    toggleDarkMode: DomainUtils.toggleDarkMode,
    applyUserPreferences: DomainUtils.applyUserPreferences,
    openSettingsPanel: Interactions.openSettingsPanel,
    setSidebarExpanded: Interactions.setSidebarExpanded,
    collapseSidebarIfAllowed: Interactions.collapseSidebarIfAllowed,
    syncSidebarOverlayState: Interactions.syncSidebarOverlayState,
    refreshTop: Interactions.refreshTop,
    updateSBUser,
  },
  auth: {
    logoutAuth: DomainUtils.logoutAuth,
  },
  students: {
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
  },
  sections: {
    openSecM: SectionLogic.openSecM,
    saveSec: SectionLogic.saveSec,
    openEditSection: SectionLogic.openEditSection,
    saveEditSection: SectionLogic.saveEditSection,
    openSubjectInGrade: SectionLogic.openSubjectInGrade,
    migrateSectionReferences: SectionLogic.migrateSectionReferences,
  },
  grades: {
    upsertLocalEvaluationRecord: DomainUtils.upsertLocalEvaluationRecord,
    saveGrade: DomainUtils.saveGrade,
  },
} as const;

export function flattenLegacyBridgeRegistry() {
  return Object.values(LEGACY_BRIDGE_REGISTRY).reduce<Record<string, unknown>>((globals, domain) => {
    Object.assign(globals, domain);
    return globals;
  }, {});
}
