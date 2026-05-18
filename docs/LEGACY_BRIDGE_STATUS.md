# Legacy Bridge Status

## Estado

`js/core/legacy-bridge.ts` sigue siendo necesario. Ya no es el lugar para añadir comportamiento nuevo, pero todavía instala contratos runtime centrales que el proyecto usa durante la transición modular.

## Globals Obligatorios

| Global | Clasificación | Motivo |
| --- | --- | --- |
| `window.RENDERS` | runtime dinámico | Cada panel se registra por nombre y el router lo consume. |
| `window._renderPanel` | runtime dinámico | Punto de render actual invocado por `go()` tras cargar bundles. |
| `window.S` | crítico | Estado compartido por paneles legacy y módulos en transición. |
| `window.go`, `window.currentPage` | crítico | Navegación y compatibilidad con flujos legacy. |
| `window.openM`, `window.closeM`, `window.forceCloseM`, `window.toast` | crítico | Modales, sesión y feedback visual. |
| `window.EduGestCloud`, `window.AulaBaseSqlApi`, `window.EduGestDB` | crítico | Auth cloud, SQL y persistencia local. |
| `window.updateSBUser`, `window.refreshTop`, `window.syncSidebarNavState` | runtime dinámico | Shell, routing y sesión. |
| `window.logoutAuth` | crítico | Cierre de sesión desde shell/setup. |

## Temporales

| Grupo | Globals | Próximo paso |
| --- | --- | --- |
| Planificaciones | `lessonPlanNew`, `lessonPlanContinue`, `lessonPlanReturnHome`, `lessonPlanSetActiveSection`, `lessonPlanSetGeneralField`, `lessonPlanSetCurriculumField` | El módulo ya vive en `apps/web/src/panels/planificaciones/` y el registry usa imports directos; eliminar cuando no haya referencias runtime. |
| Reportes | `reportDownloadExcel`, `reportDownloadPdf`, `reportDownloadWord` | El módulo ya vive en `apps/web/src/panels/reportes/` y el registry usa imports directos; conservar por compatibilidad hasta retirar fallbacks. |
| Matriz | No publica globals propios. | El módulo ya vive en `apps/web/src/panels/matriz/`; mantiene solo `window.RENDERS.matriz` por contrato del renderer dinámico. |
| Horario | `setScheduleTab`, `changeCalendarMonth`, `openScheduleWizard`, `editScheduleCell`, `openAddEventModal`, `generateTeacherScheduleBase` | La fuente real vive en `apps/web/src/panels/horario/utils/actions.ts`; conservar globals como adaptadores por compatibilidad runtime. |
| Asistencia | `shiftMonth`, `setActiveGroup`, `cycleMark`, `commitDayDay`, `cycleException`, `applyWeeklySchedule`, `exportToExcel`, `exportToPdf` | La fuente real vive en `apps/web/src/panels/asistencia/`; exportaciones encapsuladas en `attendance-export.ts`. |
| Actividades | `setActView`, `updateBlockMeta`, `handleActNameInput`, `updateActPts`, `addActToBlock`, `removeActFromBlock`, `autoAdjustBlock`, `saveAct`, `saveTpl` | La fuente real vive en `apps/web/src/panels/actividades/`; conservar globals como adaptadores por compatibilidad runtime. |
| Usuarios | `saveUsr`, `delUsr` | La fuente real vive en `apps/web/src/panels/usuarios/utils/user-save.ts`; conservar globals como adaptadores por compatibilidad runtime. |
| Instrumentos | `setInstFilter`, `createNewInstrument`, `editInstrument`, `deleteInstrument`, `openInstrumentCreator` | La fuente real vive en `apps/web/src/panels/instrumentos/utils/instrument-actions.ts`; conservar globals como adaptadores temporales. |
| Vinculación de instrumentos | `openApplyInstrumentModal`, `openCreateInstrumentTypePicker`, `confirmLinkInstrument` | La fuente real vive en `apps/web/src/panels/instrumentos/utils/instrument-linking.ts`; globals quedan como adaptadores temporales. |
| Estudiantes | `openEstM`, `saveEst`, `openViewStudent`, `openEditStudent`, `saveEditStudent`, `openBulkEstM`, `handleBulkFileChange`, `analyzeBulkInput`, `saveBulkEst`, `delEst`, acciones de crear/editar panel | La fuente de panel vive en `apps/web/src/panels/estudiantes/`; `legacy-api.ts` ya delega sus APIs de estudiantes a wrappers modulares, pero los globals se conservan por fragments, rutas `student-create`/`student-edit` y FormState tardio. |
| Académico | `saveSec`, `saveEditSection`, `saveGrade`, `delSec`, `delGrade` | Reemplazar fallbacks de registries cuando los módulos estén importables sin ciclos. |
| Auth/setup | `loginAuth`, `registerAuth`, `authWithProvider`, `saveSetup`, `populateSetupForm`, `enforceMandatorySetup` | Mantener hasta retirar HTML auth/setup legacy y selectores de compatibilidad. |

## Registries Con Imports Directos

- `data-planning-action`: usa imports directos desde `apps/web/src/panels/planificaciones/utils/actions.ts`.
- `data-report-action`: usa imports directos desde `apps/web/src/panels/reportes/utils/actions.ts`.
- `data-schedule-action`: usa imports directos desde `apps/web/src/panels/horario/utils/actions.ts` para tabs, navegación mensual, asistente, edición de celda, eventos y generación base.
- `data-activity-action`: usa imports directos para vista de matriz/bloques, metas, nombre, puntos, alta, eliminación, autoajuste, guardado y acciones exportables de instrumentos.
- `data-ui-action`: vive en `js/core/declarative-actions.ts` y usa imports directos para estado, persistencia, routing y sincronización de perfil.

## Registries Todavía Híbridos

- `data-student-action`: usa imports directos desde `apps/web/src/panels/estudiantes/`; conserva fallbacks puntuales para callbacks de crear/editar cuando el contexto de panel todavía no está registrado.
- `data-academic-action`: conserva fallbacks hacia funciones académicas legacy.
- `data-attendance-action`: usa imports directos para lógica de asistencia y exportaciones encapsuladas; conserva globals solo como compatibilidad.
- `data-schedule-action`: directo para acciones visibles; los globals de horario quedan publicados como adaptadores.
- `data-user-action`: usa imports directos hacia `apps/web/src/panels/usuarios/utils/user-save.ts`; `saveUsr` y `delUsr` quedan como adaptadores globales temporales.

## Diagnóstico Vinculación De Instrumentos

- La implementación runtime principal vive ahora en `apps/web/src/panels/instrumentos/`; `js/panels/instrumentos/**` solo reexporta como adaptador legacy.
- Los fragments `sections/modals/m-link-inst.html` y `sections/modals/m-inst-type.html` contienen la estructura visual y los IDs requeridos: `m-link-inst`, `m-inst-type`, `li-act`, `li-inst`, `li-create-btn` e `inst-type-grid`.
- La lógica depende directamente de `S`, `persist`, `go`, `openM`, `closeM`, `findActivity`, `escapeHtml`, `BASIC_INSTRUMENT_TYPES` e `INSTRUMENT_META`.
- El estado transicional de linking vive en `apps/web/src/panels/instrumentos/utils/instrument-link-state.ts`; `_linkActId` y `_linkStudentId` quedan sincronizados como espejo legacy temporal.
- La dependencia a `window` queda limitada al espejo legacy `_linkActId` / `_linkStudentId`, `window.setTimeout` y la publicación temporal de `window.openApplyInstrumentModal`, `window.openCreateInstrumentTypePicker` y `window.confirmLinkInstrument`.
- `instrument-actions.ts` publica globals como adaptadores, pero ya no conserva fallback interno hacia una implementación legacy capturada.
- No se encontraron implementaciones reales alternativas en `principal.ts`; las referencias restantes son modales/fragments, documentación y adaptadores.

## Diagnóstico Guardado De Actividades

- La implementación original de `saveAct` y `saveTpl` fue localizada en bundles legacy históricos (`js/bundles/app-core.js`), no en `js/panels/actividades/principal.ts` ni en `utils/actions.ts` actuales.
- La implementación principal vive ahora en `apps/web/src/panels/actividades/utils/activity-save.ts`.
- `saveAct` depende de `S`, `persist`, `go`, `closeM`, `toast`, `syncSqlActivityCreateOrUpdate`, `getGroupCfg`, `parseDecimalInput`, `round2`, `uid` y `BNAME`.
- `saveTpl` depende de `S`, `persist`, `closeM`, `toast`, `getGroupCfg` y `uid`.
- Los modales `sections/modals/m-act.html` y `sections/modals/m-tpl.html` conservan los IDs DOM requeridos: `a-nom`, `a-blq`, `a-tipo`, `a-pts`, `a-fecha`, `a-obs`, `tpl-name` y `tpl-desc`.
- `apps/web/src/panels/actividades/utils/actions.ts` publica `window.saveAct` y `window.saveTpl` como adaptadores hacia el módulo nuevo; no queda una segunda implementación.
- La sincronización SQL de acciones de bloques vive ahora en `apps/web/src/panels/actividades/utils/activity-sql.ts`; `actions.ts` ya no llama directamente a `window.AulaBaseSqlApi`.
- `activity-sql.ts` usa imports directos de `js/core/api-sql.ts` para `isEnabled`, `ensureSqlAcademicContext`, `syncSqlActivityCreateOrUpdate`, `syncSqlActivityDelete`, `deleteActivity` y `deleteEvaluations`, conservando `window.AulaBaseSqlApi` solo como fallback interno.

## Diagnóstico Estudiantes

- La lógica CRUD real de estudiantes sigue viviendo en `js/core/student-logic.ts` (`openEstM`, `saveEst`, `openViewStudent`, `openEditStudent`, `saveEditStudent`, `openBulkEstM`, `handleBulkFileChange`, `analyzeBulkInput`, `saveBulkEst`, `registerStudentSilently`, `upsertStudentDirectoryEntry`) y en `js/core/deleters.ts` (`delEst`).
- La vista principal de estudiantes vive en `apps/web/src/panels/estudiantes/`; `js/panels/estudiantes/**` solo reexporta.
- `crear-estudiante` y `editar-estudiante` viven bajo `apps/web/src/panels/estudiantes/create/` y `apps/web/src/panels/estudiantes/edit/`; conservan `FormState` local y callbacks exportables.
- `apps/web/src/panels/estudiantes/utils/student-modals.ts` encapsula wrappers para `openEstM`, `saveEst`, `openViewStudent`, `openEditStudent` y `saveEditStudent`, delegando a `js/core/student-logic.ts` sin duplicar DOM, validaciones, SQL ni mensajes.
- `apps/web/src/panels/estudiantes/utils/student-crud.ts` encapsula wrappers seguros para consulta por ID, alta programatica, navegación a panel y edición, delegando modales a `student-modals.ts`.
- `apps/web/src/panels/estudiantes/utils/student-delete.ts` encapsula eliminación de estudiantes y delega a `js/core/deleters.ts` sin duplicar confirmación ni persistencia.
- `apps/web/src/panels/estudiantes/utils/student-helpers.ts` contiene helpers puros de texto, matrícula, búsqueda por ID y directorio local; `student-logic.ts` los consume sin mover modales ni SQL.
- `apps/web/src/panels/estudiantes/utils/student-bulk-state.ts` contiene `BULK_IMPORT_STATE` y setters/getters; `student-logic.ts` conserva el parser y actualiza ese estado compartido.
- `apps/web/src/panels/estudiantes/utils/student-domain-actions.ts` centraliza acciones base: creación, edición, eliminación, guardado, búsqueda, filtros, selección, fotos y selección recordada.
- `apps/web/src/panels/estudiantes/utils/student-bulk.ts` centraliza carga masiva, exportaciones CSV y wrappers hacia el parser legacy sin cambiar formato esperado.
- `data-student-action` dejó de usar `window.openEstM`, `window.delEst`, `window.setStudentsGlobalSearch`, `window.setStudentsGradeView`, `window.setActiveSection`, `window.setStudentsViewMode`, `window.openBulkEstM`, `window.analyzeBulkInput`, `window.saveBulkEst` y `window.handleBulkFileChange` como ruta primaria.
- Fallbacks conservados: `confirmSaveStudent`, `confirmSaveEditStudent`, campos/fotos de crear/editar y selección recordada, porque dependen de que el contexto de panel se haya registrado y podrían aparecer fragments cargados tarde durante la transición.
- Routing conserva las URLs legacy de bundles y resuelve `estudiantes`, `student-create` y `student-edit` hacia `apps/web/src/panels/estudiantes/`.
- `legacy-api.ts` conserva las claves públicas de estudiantes, pero publica los modales desde `student-modals.ts` y la carga masiva desde `student-bulk.ts`; `legacy-bridge.ts` no cambió y sigue instalando el registro plano en `window`.

## Cambios Recientes Aplicados

- `reportes` y `planificaciones` fueron movidos físicamente a `apps/web/src/panels/`.
- `matriz` fue movido físicamente a `apps/web/src/panels/matriz/`.
- `js/panels/reportes/**` y `js/panels/planificaciones/**` quedaron como adaptadores temporales.
- `js/panels/matriz/**` quedó como adaptador temporal.
- `routing.ts` conserva las claves legacy de bundles, pero importa los paneles movidos desde `apps/web/src/panels/...`.
- `declarative-actions.ts` importa `data-planning-action` y `data-report-action` desde los módulos movidos.
- Las acciones internas de planificaciones dejaron de depender directamente de `window.S` y `window.go`; usan imports directos a `S` y `go`.
- `data-schedule-action` dejó de depender directamente de `window.setScheduleTab`, `window.changeCalendarMonth`, `window.openScheduleWizard`, `window.editScheduleCell` y `window.openAddEventModal` cuando el módulo de horario está inicializado.
- `horario` fue movido físicamente a `apps/web/src/panels/horario/`; las rutas `js/panels/horario/**` quedaron como adaptadores de reexportación.
- `data-schedule-action` dejó de usar fallbacks internos para `setScheduleTab`, `changeCalendarMonth`, `openScheduleWizard`, `editScheduleCell`, `openAddEventModal` y `generateTeacherScheduleBase`.
- `asistencia` fue movido físicamente a `apps/web/src/panels/asistencia/`; las rutas `js/panels/asistencia/**` quedaron como adaptadores de reexportación.
- `estudiantes`, `crear-estudiante` y `editar-estudiante` fueron movidos físicamente a `apps/web/src/panels/estudiantes/`, `create/` y `edit/`; las rutas legacy quedaron como adaptadores de reexportación.
- `legacy-api.ts` comenzó a funcionar como adaptador para estudiantes: sus funciones públicas delegan a wrappers en `apps/web/src/panels/estudiantes/utils/`.
- Las APIs legacy `openEstM`, `saveEst`, `openViewStudent`, `openEditStudent` y `saveEditStudent` delegan específicamente en `student-modals.ts`.
- `data-attendance-action` dejó de llamar directamente `window.exportToExcel`, `window.exportToPdf` y `window.print`; ahora usa `attendance-export.ts`.
- `data-student-action` separó acciones base en `student-domain-actions.ts` y carga masiva/exportación en `student-bulk.ts`; ahora esas fuentes viven bajo `apps/web/src/panels/estudiantes/`.
- Helpers puros de estudiantes y estado de carga masiva fueron extraídos a `student-helpers.ts` y `student-bulk-state.ts`; `student-logic.ts` sigue siendo dueño de DOM, modales, SQL y parser.
- `data-activity-action` dejó de depender directamente de `window.setActView`, `window.updateBlockMeta`, `window.handleActNameInput`, `window.updateActPts`, `window.addActToBlock`, `window.removeActFromBlock` y `window.autoAdjustBlock`.
- `data-activity-action` ahora importa `setInstFilter`, `createNewInstrument`, `editInstrument`, `deleteInstrument` y `openInstrumentCreator` desde `apps/web/src/panels/instrumentos/utils/instrument-actions.ts`.
- `instrumentos` fue movido físicamente a `apps/web/src/panels/instrumentos/`; las rutas `js/panels/instrumentos/**` quedaron como adaptadores de reexportación.
- `actividades` fue movido físicamente a `apps/web/src/panels/actividades/`; las rutas `js/panels/actividades/**` quedaron como adaptadores de reexportación.
- `data-activity-action` dejó de llamar `window.saveAct` / `window.saveTpl`; el guardado vive en `apps/web/src/panels/actividades/utils/activity-save.ts`.
- `data-activity-action` dejó de leer directamente `window._linkActId`; ahora consulta `instrument-link-state.ts`.
- `actions.ts` de actividades dejó de llamar directamente a `window.AulaBaseSqlApi`; ahora delega en `activity-sql.ts`.
- `openApplyInstrumentModal`, `openCreateInstrumentTypePicker` y `confirmLinkInstrument` tienen implementación modular principal en `instrument-linking.ts`; `instrument-actions.ts` ya no conserva fallback interno legacy.
- `usuarios` fue movido físicamente a `apps/web/src/panels/usuarios/`; las rutas `js/panels/usuarios/**` quedaron como adaptadores de reexportación.
- `data-user-action` dejó de llamar `window.saveUsr` / `window.delUsr` como ruta primaria; creación y eliminación viven en `apps/web/src/panels/usuarios/utils/user-save.ts`, respaldado por `user-domain-actions.ts`.
- Se eliminó `window.openDashboardCourse`.
- `data-report-action` dejó de depender directamente de `window.reportDownloadExcel`, `window.reportDownloadPdf` y `window.reportDownloadWord`.
- Los 6 handlers inline runtime restantes fueron migrados a `data-route` / `data-ui-action`.

## Riesgos Técnicos

- Retirar `legacy-bridge.ts` antes de sustituir `_renderPanel` y `RENDERS` rompe lazy loading.
- Retirar `window.S` antes de desacoplar paneles rompe múltiples componentes legacy.
- Retirar APIs SQL/cloud globales rompe persistencia, auth y sincronización.
- Retirar fallbacks de registries antes de imports directos puede romper fragments cargados dinámicamente.

## Clasificación De Registries

| Registry | Estado | Clasificación `window.*` |
| --- | --- | --- |
| `data-report-action` | Directo | Solo `window.print()`, API del navegador. |
| `data-planning-action` | Directo | Solo `window.print()`, API del navegador. |
| `data-schedule-action` | Directo para acciones visibles | Reemplazables ya importados: tabs, mes, asistente, celdas, eventos y generación base. Globals conservados solo como adaptadores temporales. |
| `data-activity-action` | Directo para acciones visibles | Reemplazables ya importados: vista, metas, edición de nombre/puntos, alta/eliminación, autoajuste, instrumentos básicos, vinculación de instrumentos y guardado de actividad/plantilla. `_linkActId` se consulta por estado modular con espejo legacy. |
| `data-attendance-action` | Directo para acciones visibles | Exportación encapsulada en `attendance-export.ts`, con `exportToExcel` / `exportToPdf` como fallback legacy interno. |
| `data-user-action` | Directo con adaptador legacy | Creación y eliminación usan imports directos. `saveUsr` y `delUsr` se conservan como globales temporales para compatibilidad legacy. |
| `data-student-action` | Híbrido | Conservar fallbacks de crear/editar/búsqueda/fotos hasta exportar acciones desde estudiantes, crear-estudiante y editar-estudiante sin ciclos. |
| `data-academic-action` | Híbrido | Conservar fallbacks de setup académico, edición/eliminación y prompts; mover por grupos después de desacoplar creación/edición. |
| `data-auth-action` | Legacy explícito | Conservar: auth/setup sigue acoplado a bootstrap y compatibilidad de `login-registro-auth/`. |

## Ruta Para Retiro Gradual

1. Reducir el uso directo de APIs SQL/cloud globales en dominios restantes.
2. Convertir registries híbridos restantes a imports directos, uno por dominio.
4. Reemplazar `window.RENDERS` por registro modular explícito del router.
5. Reemplazar `_renderPanel` por una función importada desde routing/app.
6. Encapsular `S` detrás de store/imports directos.
7. Reducir `LEGACY_BRIDGE_REGISTRY` por grupos después de `rg` con cero referencias runtime.
