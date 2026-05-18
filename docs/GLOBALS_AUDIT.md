# Globals Audit

## Alcance

Auditoría sobre fuentes runtime, excluyendo `dist/`, `node_modules/` e `index.html` generado. `index.html` no se edita manualmente.

Comandos base:

- `rg -n "on(click|input|change|blur|focus|keydown|dblclick)=" js sections login-registro-auth apps -g '!dist/**' -g '!node_modules/**' -g '!index.html'`
- `rg -n "\\b(window|globalThis)\\." js sections login-registro-auth apps -g '!dist/**' -g '!node_modules/**' -g '!index.html'`
- Revisión manual de `js/core/legacy-api.ts` y `js/core/legacy-bridge.ts`.

## Handlers Inline Restantes

Conteo runtime actual: `0`.

Quedan coincidencias textuales de `onclick=` en selectores de compatibilidad (`event-bindings.ts`, `shell.ts`) y un comentario de routing, pero no son atributos HTML renderizados ni handlers runtime.

| Estado | Cantidad | Nota |
| --- | ---: | --- |
| Handlers inline runtime reales | 0 | No quedan atributos `on*=` emitidos por fuentes runtime. |
| Selectores/comentarios de compatibilidad | 7 | No ejecutan código inline; detectan HTML antiguo si aparece. |

## Eliminado En La Fase De Handlers

| Archivo | Antes | Después |
| --- | --- | --- |
| `js/panels/tablero/principal.ts` | `onclick="${mainFocus.clickAction}"` | `data-route` con ruta calculada segura. |
| `js/panels/tablero/components/course-item.ts` | `onclick="window.openDashboardCourse(...)"` | `data-ui-action="open-dashboard-course"`. |
| `js/panels/configuracion/components/vista.ts` | `oninput` con mutación de `window.S.profile` | `data-ui-action="update-institution"`. |
| `js/panels/configuracion/components/vista.ts` | `onchange` con `persist` y `flushSqlProfileSync` | `data-ui-action="update-institution"`. |
| `js/core/ui.ts` | `onchange="setActiveGroup(this.value)"` | `data-ui-action="set-active-group"`. |
| `js/core/ui.ts` | `onchange="setActivePeriod(this.value)"` | `data-ui-action="set-active-period"`. |

## Clasificación Por Dominio

| Dominio | Restantes | Notas |
| --- | ---: | --- |
| auth | 0 | Quedan selectores legacy en `event-bindings.ts`, no handlers runtime. |
| estudiantes | 0 | Migrado a `data-student-action`. |
| académico | 0 | Migrado a `data-academic-action`. |
| asistencia | 0 | Migrado a `data-attendance-action`. |
| horario | 0 | Migrado a `data-schedule-action`. |
| actividades | 0 | Migrado a `data-activity-action`. |
| usuarios | 0 | Migrado a `data-user-action`. |
| planificaciones | 0 | Migrado a `data-planning-action`. |
| reportes | 0 | Migrado a `data-report-action`. |
| shell/ui | 0 | Últimos 6 handlers migrados a `data-route` / `data-ui-action`. |
| otros | 0 | No se detectaron handlers runtime fuera de los anteriores. |

## Funciones Globales Todavía Usadas

Se mantienen porque hay referencias runtime reales, uso por registries como fallback, o wiring de compatibilidad del renderer.

| Grupo | Globales | Razón |
| --- | --- | --- |
| Renderer | `window.RENDERS`, `window._renderPanel` | El router carga bundles y renderiza paneles por nombre. |
| Estado/base | `window.S`, `window.persist`, `window.hydrate`, `window.EduGestDB`, `window.EduGestCloud`, `window.AulaBaseSqlApi` | Persistencia, auth cloud y sincronización SQL todavía consultan estas APIs desde varios módulos. |
| Routing/UI | `window.go`, `window.currentPage`, `window.openM`, `window.closeM`, `window.forceCloseM`, `window.toast` | Usadas por flujos de sesión, modales, shell y fallbacks. |
| Auth/setup | `loginAuth`, `registerAuth`, `authWithProvider`, `handleForgotPassword`, `togglePasswordVisibility`, `saveSetup`, `populateSetupForm`, `enforceMandatorySetup`, `logoutAuth` | Compatibilidad con auth, setup obligatorio y selectores legacy de `event-bindings.ts`. |
| Estudiantes | `openEstM`, `saveEst`, `openViewStudent`, `openEditStudent`, `saveEditStudent`, `openBulkEstM`, `handleBulkFileChange`, `analyzeBulkInput`, `saveBulkEst`, `delEst`, callbacks de crear/editar estudiante | La fuente de panel vive en `apps/web/src/panels/estudiantes/`; `legacy-api.ts` publica wrappers modulares y los globals se conservan por FormState tardio, fragments y rutas `student-create`/`student-edit`. |
| Académico | `openSecM`, `saveSec`, `openEditSection`, `saveEditSection`, `saveGrade`, `delSec`, `delGrade` | Fallbacks de creación/edición/eliminación y sincronización académica. |
| Asistencia | `shiftMonth`, `setActiveGroup`, `cycleMark`, `commitDayDay`, `cycleException`, `applyWeeklySchedule`, `exportToExcel`, `exportToPdf` | El módulo de asistencia ya vive en `apps/web/src/panels/asistencia/`; globals conservados como adaptadores temporales. |
| Horario | `setScheduleTab`, `changeCalendarMonth`, `openScheduleWizard`, `editScheduleCell`, `openAddEventModal`, `generateTeacherScheduleBase` | Ya no son la ruta primaria de `data-schedule-action`; se conservan como adaptadores de compatibilidad runtime. |
| Actividades | `setActView`, `updateBlockMeta`, `handleActNameInput`, `updateActPts`, `addActToBlock`, `removeActFromBlock`, `autoAdjustBlock`, `saveAct`, `saveTpl` | Ya no son la ruta primaria de `data-activity-action`; se conservan como adaptadores y compatibilidad runtime. |
| Instrumentos | `setInstFilter`, `createNewInstrument`, `editInstrument`, `deleteInstrument`, `openInstrumentCreator` | Ya no son la ruta primaria de `data-activity-action`; se conservan como adaptadores temporales. |
| Vinculación de instrumentos | `openApplyInstrumentModal`, `openCreateInstrumentTypePicker`, `confirmLinkInstrument` | Ya no son la ruta primaria; `instrument-linking.ts` es la fuente principal y los globals quedan como adaptadores temporales. |
| Usuarios | `saveUsr`, `delUsr` | Adaptadores legacy temporales publicados por `apps/web/src/panels/usuarios/principal.ts`; `data-user-action` ya usa imports directos. |
| Planificaciones | `lessonPlanNew`, `lessonPlanContinue`, `lessonPlanReturnHome`, `lessonPlanSetActiveSection`, `lessonPlanSetGeneralField`, `lessonPlanSetCurriculumField` | El registry ya usa imports directos; globals se conservan temporalmente por compatibilidad. |
| Reportes | `reportDownloadExcel`, `reportDownloadPdf`, `reportDownloadWord` | El registry ya usa imports directos; globals se conservan temporalmente por compatibilidad. |
| Shell | `updateSBUser`, `closeProfileMenu`, `syncSidebarNavState`, `refreshTop` | Shell, routing y sesión los invocan aún vía `window`. |

## Globals Eliminados

- `window.openDashboardCourse`: eliminado porque el único uso runtime era el handler inline del curso en tablero. La acción ahora vive en `data-ui-action="open-dashboard-course"` con imports directos a `S`, `persist` y `go`.

## Globals Que Dejaron De Usarse Directamente Por Registries

- `data-report-action` ya no invoca `window.reportDownloadExcel`, `window.reportDownloadPdf` ni `window.reportDownloadWord`; importa esas funciones desde `apps/web/src/panels/reportes/utils/actions.ts`.
- `data-planning-action` usa imports directos hacia `apps/web/src/panels/planificaciones/utils/actions.ts`.
- `data-schedule-action` usa imports directos para las acciones visibles de horario: tabs, mes, asistente, celdas, eventos y generación base.
- `data-attendance-action` usa imports directos para exportaciones desde `apps/web/src/panels/asistencia/utils/attendance-export.ts`; ya no llama directamente `window.exportToExcel`, `window.exportToPdf` ni `window.print`.
- `data-activity-action` usa imports directos para las acciones de bloques y matriz: vista, metas, nombre, puntos, alta, eliminación y autoajuste.
- `data-activity-action` usa imports directos para guardar actividades y plantillas desde `apps/web/src/panels/actividades/utils/activity-save.ts`.
- `data-activity-action` usa imports directos para acciones básicas de instrumentos desde `apps/web/src/panels/instrumentos/utils/instrument-actions.ts`.
- `data-activity-action` usa implementación modular para vincular instrumentos: `openApplyInstrumentModal`, `openCreateInstrumentTypePicker` y `confirmLinkInstrument`.
- `data-activity-action` usa `apps/web/src/panels/instrumentos/utils/instrument-link-state.ts` para leer contexto de vinculación; ya no lee directamente `window._linkActId`.
- `data-user-action` usa imports directos hacia `apps/web/src/panels/usuarios/utils/user-save.ts` para crear y eliminar usuarios; ya no invoca `window.saveUsr` ni `window.delUsr` como ruta primaria.
- `data-student-action` usa imports directos hacia `apps/web/src/panels/estudiantes/utils/student-domain-actions.ts` para creación, edición, eliminación, guardado, búsqueda, filtros, selección y fotos.
- `data-student-action` usa imports directos hacia `apps/web/src/panels/estudiantes/utils/student-bulk.ts` para carga masiva, preview, confirmación, cancelación y exportaciones CSV.
- `legacy-api.ts` publica las APIs de estudiantes desde `apps/web/src/panels/estudiantes/utils/student-crud.ts` y `student-bulk.ts`, conservando los nombres legacy.
- Las acciones internas de planificaciones dejaron de invocar `window.go` y de leer `window.S`; usan imports directos hacia `go` y `S`.
- `data-ui-action` usa imports directos para contexto global e institución.

## Diagnóstico De Vinculación De Instrumentos

Búsqueda aplicada sobre fuentes, excluyendo `dist/` y `node_modules`: `openApplyInstrumentModal`, `openCreateInstrumentTypePicker`, `confirmLinkInstrument`, `_linkActId`, `m-link-inst`, `applyInstrument`, `linkInstrument`, `instrument modal`, `instrumento vinculado` y `actividad vinculada`.

Resultado:

- La lógica real quedó localizada y modularizada en `apps/web/src/panels/instrumentos/utils/instrument-linking.ts`.
- `apps/web/src/panels/instrumentos/principal.ts` registra `window.RENDERS.instrumentos` y llama `registerInstrumentActions()`; `js/panels/instrumentos/principal.ts` solo reexporta.
- Los fragments `sections/modals/m-link-inst.html` y `sections/modals/m-inst-type.html` siguen siendo dueños del marcado visual; no se cambiaron textos ni IDs.
- Dependencias de estado: `S.activeGroupId`, `S.activePeriodId`, `S.instruments` y la actividad encontrada por `findActivity()`.
- Dependencias UI: `openM('m-link-inst')`, `openM('m-inst-type')`, `closeM('m-link-inst')` y los IDs DOM `li-act`, `li-inst`, `li-create-btn`, `inst-type-grid`.
- Dependencias `window`: `_linkActId` y `_linkStudentId` siguen como espejo legacy sincronizado desde `instrument-link-state.ts`; el registry declarativo ya no los lee directamente.
- `activity-actions.ts` ya no llama directamente a `window.openApplyInstrumentModal`, `window.openCreateInstrumentTypePicker` ni `window.confirmLinkInstrument`; importa esas funciones desde `instrument-actions.ts`.
- `instrument-actions.ts` ya no conserva fallback interno a implementaciones legacy capturadas; los globals publicados son adaptadores directos a la fuente modular.

## Diagnóstico De Guardado De Actividades

Búsqueda aplicada sobre fuentes, excluyendo `dist/` y `node_modules`: `saveAct`, `saveTpl`, `actividad guardar`, `plantilla guardar`, `m-act`, `m-tpl`, `activity modal`, `template modal`, `bloques de actividades`, `ACT` y `TPL`.

Resultado:

- La implementación real actual se consolidó en `apps/web/src/panels/actividades/utils/activity-save.ts`.
- La implementación original fue localizada en bundles legacy históricos, no en `principal.ts`; `utils/actions.ts` solo contenía acciones de bloques/matriz.
- Dependencias de estado/dominio: `S.activeGroupId`, `S.activePeriodId`, `S.templates`, `getGroupCfg`, `uid`, `round2`, `parseDecimalInput` y `BNAME`.
- Dependencias de persistencia/sync: `persist()` y `syncSqlActivityCreateOrUpdate()` para nuevas actividades.
- Acciones de bloques: `activity-sql.ts` encapsula `isEnabled`, `ensureSqlAcademicContext`, `syncSqlActivityCreateOrUpdate`, `syncSqlActivityDelete`, `deleteActivity` y `deleteEvaluations`; `window.AulaBaseSqlApi` queda solo como fallback interno del wrapper.
- Dependencias UI: `closeM('m-act')`, `closeM('m-tpl')`, `go('config')` y `toast(...)`.
- IDs DOM requeridos: `a-nom`, `a-blq`, `a-tipo`, `a-pts`, `a-fecha`, `a-obs`, `tpl-name` y `tpl-desc`.
- `activity-actions.ts` ya no invoca `window.saveAct` ni `window.saveTpl`; `actions.ts` solo publica esos nombres globales como adaptadores temporales.
- `actions.ts` ya no invoca directamente `window.AulaBaseSqlApi`; delega en `apps/web/src/panels/actividades/utils/activity-sql.ts`.

## Migración Física Actividades/Instrumentos

- `js/panels/instrumentos/**` fue movido a `apps/web/src/panels/instrumentos/**`; la ruta legacy quedó como adaptador de reexportación.
- `js/panels/actividades/**` fue movido a `apps/web/src/panels/actividades/**`; la ruta legacy quedó como adaptador de reexportación.
- `data-activity-action` ya apunta a la fuente real de actividades en `apps/web/src/panels/actividades/utils/activity-actions.ts` y a la fuente real de instrumentos en `apps/web/src/panels/instrumentos/utils/instrument-actions.ts`.
- `routing.ts` conserva la clave pública `/js/panels/instrumentos/principal.ts`, pero `PANEL_MODULES` resuelve hacia `apps/web/src/panels/instrumentos/principal.ts`.
- `routing.ts` conserva la clave pública `/js/panels/actividades/principal.ts`, pero `PANEL_MODULES` resuelve hacia `apps/web/src/panels/actividades/principal.ts`.
- Actividades conserva `window.AulaBaseSqlApi` solo como fallback dentro de `activity-sql.ts`.
- Instrumentos conserva `_linkActId` y `_linkStudentId` solo como espejo legacy dentro de `instrument-link-state.ts`.

## Migración Física Aplicada

- `reportes` y `planificaciones` fueron movidos a `apps/web/src/panels/`.
- `matriz` fue movido a `apps/web/src/panels/matriz/`.
- `instrumentos` fue movido a `apps/web/src/panels/instrumentos/`.
- `actividades` fue movido a `apps/web/src/panels/actividades/`.
- `usuarios` fue movido a `apps/web/src/panels/usuarios/`.
- `horario` fue movido a `apps/web/src/panels/horario/`.
- `asistencia` fue movido a `apps/web/src/panels/asistencia/`.
- Las rutas legacy `js/panels/reportes/**` y `js/panels/planificaciones/**` permanecen como adaptadores de reexportación.
- La ruta legacy `js/panels/matriz/**` permanece como adaptador de reexportación.
- Las rutas legacy `js/panels/instrumentos/**` y `js/panels/actividades/**` permanecen como adaptadores de reexportación.
- La ruta legacy `js/panels/usuarios/**` permanece como adaptador de reexportación.
- La ruta legacy `js/panels/horario/**` permanece como adaptador de reexportación.
- La ruta legacy `js/panels/asistencia/**` permanece como adaptador de reexportación.
- No se eliminaron globals adicionales en esta fase; los globals de planificaciones y reportes siguen publicados como fallback temporal.

## Diagnóstico Estudiantes

Búsqueda focalizada aplicada sobre `js/panels/estudiantes/**`, `js/panels/crear-estudiante/**`, `js/panels/editar-estudiante/**`, fragments relacionados, `routing.ts` y `declarative-actions.ts`.

Resultado:

- La fuente real de paneles vive en `apps/web/src/panels/estudiantes/`, con `create/` y `edit/` como subdominios.
- La implementación real de guardado, edición modal, vista modal, apertura manual y carga masiva vive en `js/core/student-logic.ts`.
- La eliminación real vive en `js/core/deleters.ts` como `delEst`.
- `student-crud.ts` envuelve `openEstM`, `saveEst`, `openViewStudent`, `openEditStudent`, `saveEditStudent`, `registerStudentSilently` y `upsertStudentDirectoryEntry` sin duplicar logica.
- `student-delete.ts` envuelve `delEst` y conserva su confirmación, sync SQL, persistencia, navegación y toast originales.
- `student-bulk.ts` ahora expone wrappers explícitos para `openBulkEstM`, `handleBulkFileChange`, `analyzeBulkInput` y `saveBulkEst`, manteniendo el parser legacy en core.
- `student-helpers.ts` extrae helpers puros: normalización de texto/matrícula, búsqueda por ID, detección de matrícula duplicada y mapeo/upsert de directorio local.
- `student-bulk-state.ts` extrae `BULK_IMPORT_STATE` con setters/getters; conserva la misma forma del estado (`mode`, `analyzed`, `entries`, `sourceName`, `lastRows`).
- Las acciones de vista/listado viven en `apps/web/src/panels/estudiantes/utils/actions.ts`; exportan funciones modulares y siguen publicando globals temporales.
- Las acciones de los paneles `student-create` y `student-edit` viven en `apps/web/src/panels/estudiantes/create/utils/actions.ts` y `apps/web/src/panels/estudiantes/edit/utils/actions.ts`; exportan funciones y conservan `window.*` como adaptador.
- `student-bulk.ts` separó apertura, modo de entrada, archivo, preview, confirmación, cancelación y exportaciones. No agrega parser nuevo para `.xlsx/.xls`; conserva el comportamiento legacy de selección de archivo.
- `student-domain-actions.ts` separó create/edit/delete/save/search/filter/select/import de fotos y selección recordada.
- `js/panels/estudiantes/**`, `js/panels/crear-estudiante/**` y `js/panels/editar-estudiante/**` son adaptadores de reexportacion.
- `FormState` permanece local en los subpaneles `create` y `edit`; no se fusiono para evitar cambios de comportamiento.

## Candidatas A Eliminar Después

- `lessonPlanNew`, `lessonPlanContinue`, `lessonPlanReturnHome`, `lessonPlanSetActiveSection`, `lessonPlanSetGeneralField`, `lessonPlanSetCurriculumField`.
- `reportDownloadExcel`, `reportDownloadPdf`, `reportDownloadWord`.
- Adaptadores de horario ya cubiertos por imports directos (`setScheduleTab`, `changeCalendarMonth`, `openScheduleWizard`, `editScheduleCell`, `openAddEventModal`, `generateTeacherScheduleBase`) cuando no existan referencias runtime.
- Adaptadores de asistencia (`shiftMonth`, `setActiveGroup`, `cycleMark`, `commitDayDay`, `cycleException`, `applyWeeklySchedule`, `exportToExcel`, `exportToPdf`) cuando no existan referencias runtime.
- Adaptadores de actividades ya cubiertos por imports directos (`setActView`, `updateBlockMeta`, `handleActNameInput`, `updateActPts`, `addActToBlock`, `removeActFromBlock`, `autoAdjustBlock`, `saveAct`, `saveTpl`) cuando no existan referencias runtime.
- Espejos legacy de linking (`_linkActId`, `_linkStudentId`) cuando no existan referencias runtime fuera de `instrument-link-state.ts`.
- Adaptadores de instrumentos (`setInstFilter`, `createNewInstrument`, `editInstrument`, `deleteInstrument`, `openInstrumentCreator`) cuando no existan referencias runtime.
- Adaptadores de vinculación (`openApplyInstrumentModal`, `openCreateInstrumentTypePicker`, `confirmLinkInstrument`) cuando no existan referencias runtime fuera de `instrument-actions.ts`.
- Adaptadores de usuarios (`saveUsr`, `delUsr`) cuando no existan referencias runtime fuera de `user-save.ts` y su publicación temporal.
- Adaptadores de estudiantes ya cubiertos por imports directos (`setStudentsGradeView`, `setActiveSection`, `setStudentsViewMode`, `setStudentsGlobalSearch`, `openStudentSearchResult`, callbacks de crear/editar, `openBulkEstM`, `handleBulkFileChange`, `analyzeBulkInput`, `saveBulkEst`) cuando no existan referencias runtime fuera de `apps/web/src/panels/estudiantes/`, fragments y wrappers publicados por `legacy-api.ts`.
- Selectores legacy en `js/panels/autenticacion/utils/event-bindings.ts` cuando se retire compatibilidad con HTML auth antiguo.

## Deben Mantenerse Temporalmente

- `legacy-bridge.ts`: sigue instalando `LEGACY_BRIDGE_REGISTRY` y `_renderPanel`.
- `go`, `openM`, `closeM`, `forceCloseM`, `toast`, `logoutAuth`: usados por flujos críticos de navegación, sesión y modales.
- APIs SQL/cloud (`AulaBaseSqlApi`, `EduGestCloud`, `flushSqlProfileSync`, `flushSqlStateBlockSyncs`, etc.): usadas por persistencia y sincronización.
- `window.RENDERS` y `window.S`: son contratos centrales del runtime actual.

## Riesgos De Eliminación

- Eliminar globals de routing/UI rompe modales, navegación y sesión.
- Eliminar globals SQL/cloud rompe sincronización de perfil, estado académico y auth.
- Eliminar globals usados como fallback por registries rompe compatibilidad con fragments cargados tarde.
- Eliminar `_renderPanel` o `RENDERS` rompe el router y carga dinámica de paneles.
- Eliminar globals de setup puede dejar al usuario bloqueado en onboarding obligatorio.

## Estrategia Para Reducir `legacy-bridge.ts`

1. Convertir registries restantes para importar funciones directas en vez de llamar adaptadores `window.*`.
2. Quitar globals dominio por dominio solo después de `rg` en `sections/`, `login-registro-auth/`, `js/panels/`, `js/core/` y strings renderizados.
3. Mantener `legacy-bridge.ts` hasta que `window.RENDERS`, `_renderPanel`, `S`, routing y APIs de persistencia tengan reemplazo modular completo.
