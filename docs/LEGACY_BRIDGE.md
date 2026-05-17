# Legacy Bridge

## Propósito

El frontend todavía depende de HTML inline y de algunos paneles que llaman funciones en `window`. Para no romper la app, la compatibilidad se mantiene con dos módulos:

- `js/core/legacy-api.ts`: registro por dominio de APIs ES que se exponen temporalmente.
- `js/core/legacy-bridge.ts`: instala el registro en `window` y mantiene `window._renderPanel`.

## Globals expuestos desde el bridge

### Core y configuración

- `EduGestConfig`
- `EduGestDB`
- `AulaBaseSqlApi`
- `EduGestCloud`
- `S`
- `hydrate`
- `persist`
- `readBrowserSession`
- `clearBrowserSession`

### Routing

- `go`

### Auth

- `logoutAuth`

### UI

- `toggleDarkMode`
- `applyUserPreferences`
- `openSettingsPanel`
- `setSidebarExpanded`
- `collapseSidebarIfAllowed`
- `syncSidebarOverlayState`
- `refreshTop`
- `updateSBUser`

### Estudiantes

- `openEstM`
- `saveEst`
- `openViewStudent`
- `openEditStudent`
- `saveEditStudent`
- `openBulkEstM`
- `chooseStudentAddMode`
- `openStudentAddModeModal`
- `handleBulkFileChange`
- `analyzeBulkInput`
- `saveBulkEst`

### Secciones

- `openSecM`
- `saveSec`
- `openEditSection`
- `saveEditSection`
- `openSubjectInGrade`
- `migrateSectionReferences`

### Calificaciones y evaluaciones

- `round2`
- `getGrade`
- `studentFinal`
- `studentBlockScore`
- `mapEvaluationToActivityScore`
- `findActivity`
- `scoreClass`
- `blockRawMax`
- `studentBlockRaw`
- `doNormalize`
- `blockMeta`
- `upsertLocalEvaluationRecord`
- `saveGrade`

### SQL sync

- `mapGradeToSqlPayload`
- `mapSectionToSqlPayload`
- `mapStudentToSqlPayload`
- `mapActivityToSqlPayload`
- `mapEvaluationToSqlPayload`
- `syncSqlEvaluationUpsert`
- `applySqlAcademicSnapshot`
- `hydrateSqlAcademicSnapshotForActiveUser`
- `hydrateSqlStateBlocksForActiveUser`
- `scheduleSqlProfileSync`
- `flushSqlProfileSync`
- `scheduleSqlStateBlockSyncs`
- `flushSqlStateBlockSyncs`
- `syncSqlActivityDelete`
- `syncSqlEvaluationsDelete`

### Currículo y planificación

- `curriculumNormalizeGradeKey`
- `curriculumSpecificCompetencyLookup`
- `curriculumGradeContext`
- `restoreSpanishQuestionCorruption`
- `curriculumNormalizeSpecificCompetencyText`
- `curriculumNormalizeSpecificCompetencyFallbacks`
- `lessonPlanStoredGroupId`
- `lessonPlanStoredPeriodId`
- `lessonPlanTeacherName`
- `lessonPlanInstitutionName`
- `lessonPlanTransversalAxisDescription`
- `lessonPlanSpecificPlaceholderForFundamental`

## Globals todavía fuera del bridge central

Estos deben migrarse en fases posteriores:

- `js/core/ui.ts`: `v`, `initials`, `openM`, `closeM`, `forceCloseM`, `toast`
- `js/core/routing.ts`: `go`, `currentPage`
- `js/core/state.ts`: `S`, `RENDERS`
- `js/core/domain-utils.ts`: `getGroupCfg`, `ensurePeriodBuckets`, `studentsInGroup`, `fixMojibakeText`
- `js/core/deleters.ts`: `delEst`, `delSec`, `delGrade`, `delTpl`
- `js/panels/*/utils/actions.ts`: handlers inline de paneles como asistencia, horario, crear estudiante y crear sección.

## Criterio para retirar un global

1. `rg "window\\.nombre|onclick=.*nombre|nombre\\("` no encuentra referencias runtime.
2. Existe import ES equivalente.
3. `npm run build` y `npm run imports:check` pasan.
4. Se actualiza esta documentación.
