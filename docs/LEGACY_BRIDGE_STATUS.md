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
| Horario | `setScheduleTab`, `changeCalendarMonth`, `openScheduleWizard`, `editScheduleCell`, `openAddEventModal` | El registry ya usa imports directos con fallback temporal; eliminar globals cuando no haya referencias runtime. |
| Actividades | `setActView`, `updateBlockMeta`, `handleActNameInput`, `updateActPts`, `addActToBlock`, `removeActFromBlock`, `autoAdjustBlock`, `saveAct`, `saveTpl` | El registry ya usa imports directos; conservar globals como adaptadores por compatibilidad hasta mover el panel. |
| Instrumentos | `setInstFilter`, `createNewInstrument`, `editInstrument`, `deleteInstrument`, `openInstrumentCreator` | Ya tienen fuente exportable en `js/panels/instrumentos/utils/instrument-actions.ts`; conservar globals como adaptadores temporales. |
| Vinculación de instrumentos | `openApplyInstrumentModal`, `openCreateInstrumentTypePicker`, `confirmLinkInstrument` | Implementación principal extraída a `js/panels/instrumentos/utils/instrument-linking.ts`; globals quedan como adaptadores temporales. |
| Estudiantes/académico | `saveEst`, `saveEditStudent`, `saveSec`, `saveEditSection`, `saveGrade`, `delEst`, `delSec`, `delGrade` | Reemplazar fallbacks de registries cuando los módulos estén importables sin ciclos. |
| Auth/setup | `loginAuth`, `registerAuth`, `authWithProvider`, `saveSetup`, `populateSetupForm`, `enforceMandatorySetup` | Mantener hasta retirar HTML auth/setup legacy y selectores de compatibilidad. |

## Registries Con Imports Directos

- `data-planning-action`: usa imports directos desde `apps/web/src/panels/planificaciones/utils/actions.ts`.
- `data-report-action`: usa imports directos desde `apps/web/src/panels/reportes/utils/actions.ts`.
- `data-schedule-action`: usa imports directos para tabs, navegación mensual, asistente, edición de celda y eventos; conserva fallback `window.*`.
- `data-activity-action`: usa imports directos para vista de matriz/bloques, metas, nombre, puntos, alta, eliminación, autoajuste, guardado y acciones exportables de instrumentos.
- `data-ui-action`: vive en `js/core/declarative-actions.ts` y usa imports directos para estado, persistencia, routing y sincronización de perfil.

## Registries Todavía Híbridos

- `data-student-action`: conserva fallbacks hacia funciones legacy de estudiantes.
- `data-academic-action`: conserva fallbacks hacia funciones académicas legacy.
- `data-attendance-action`: mezcla lógica directa con adaptadores de exportación.
- `data-schedule-action`: parcialmente directo; conserva `generateTeacherScheduleBase` y fallbacks por compatibilidad.
- `data-user-action`: usa imports directos hacia `js/panels/usuarios/utils/user-domain-actions.ts`; `delUsr` queda como adaptador global temporal.

## Diagnóstico Vinculación De Instrumentos

- La implementación runtime principal vive ahora en `js/panels/instrumentos/utils/instrument-linking.ts`; `js/panels/instrumentos/principal.ts` solo registra renderer y adaptadores.
- Los fragments `sections/modals/m-link-inst.html` y `sections/modals/m-inst-type.html` contienen la estructura visual y los IDs requeridos: `m-link-inst`, `m-inst-type`, `li-act`, `li-inst`, `li-create-btn` e `inst-type-grid`.
- La lógica depende directamente de `S`, `persist`, `go`, `openM`, `closeM`, `findActivity`, `escapeHtml`, `BASIC_INSTRUMENT_TYPES` e `INSTRUMENT_META`.
- La dependencia a `window` queda limitada al estado transicional `_linkActId` y `_linkStudentId`, más la publicación temporal de `window.openApplyInstrumentModal`, `window.openCreateInstrumentTypePicker` y `window.confirmLinkInstrument`.
- `instrument-actions.ts` publica globals como adaptadores, pero ya no conserva fallback interno hacia una implementación legacy capturada.
- No se encontraron implementaciones reales alternativas en `principal.ts`; las referencias restantes son modales/fragments, documentación y adaptadores.

## Diagnóstico Guardado De Actividades

- La implementación original de `saveAct` y `saveTpl` fue localizada en bundles legacy históricos (`js/bundles/app-core.js`), no en `js/panels/actividades/principal.ts` ni en `utils/actions.ts` actuales.
- La implementación principal vive ahora en `js/panels/actividades/utils/activity-save.ts`.
- `saveAct` depende de `S`, `persist`, `go`, `closeM`, `toast`, `syncSqlActivityCreateOrUpdate`, `getGroupCfg`, `parseDecimalInput`, `round2`, `uid` y `BNAME`.
- `saveTpl` depende de `S`, `persist`, `closeM`, `toast`, `getGroupCfg` y `uid`.
- Los modales `sections/modals/m-act.html` y `sections/modals/m-tpl.html` conservan los IDs DOM requeridos: `a-nom`, `a-blq`, `a-tipo`, `a-pts`, `a-fecha`, `a-obs`, `tpl-name` y `tpl-desc`.
- `js/panels/actividades/utils/actions.ts` publica `window.saveAct` y `window.saveTpl` como adaptadores hacia el módulo nuevo; no queda una segunda implementación.

## Cambios Recientes Aplicados

- `reportes` y `planificaciones` fueron movidos físicamente a `apps/web/src/panels/`.
- `matriz` fue movido físicamente a `apps/web/src/panels/matriz/`.
- `js/panels/reportes/**` y `js/panels/planificaciones/**` quedaron como adaptadores temporales.
- `js/panels/matriz/**` quedó como adaptador temporal.
- `routing.ts` conserva las claves legacy de bundles, pero importa los paneles movidos desde `apps/web/src/panels/...`.
- `declarative-actions.ts` importa `data-planning-action` y `data-report-action` desde los módulos movidos.
- Las acciones internas de planificaciones dejaron de depender directamente de `window.S` y `window.go`; usan imports directos a `S` y `go`.
- `data-schedule-action` dejó de depender directamente de `window.setScheduleTab`, `window.changeCalendarMonth`, `window.openScheduleWizard`, `window.editScheduleCell` y `window.openAddEventModal` cuando el módulo de horario está inicializado.
- `data-activity-action` dejó de depender directamente de `window.setActView`, `window.updateBlockMeta`, `window.handleActNameInput`, `window.updateActPts`, `window.addActToBlock`, `window.removeActFromBlock` y `window.autoAdjustBlock`.
- `data-activity-action` ahora importa `setInstFilter`, `createNewInstrument`, `editInstrument`, `deleteInstrument` y `openInstrumentCreator` desde `js/panels/instrumentos/utils/instrument-actions.ts`.
- `data-activity-action` dejó de llamar `window.saveAct` / `window.saveTpl`; el guardado vive en `js/panels/actividades/utils/activity-save.ts`.
- `openApplyInstrumentModal`, `openCreateInstrumentTypePicker` y `confirmLinkInstrument` tienen implementación modular principal en `instrument-linking.ts`; `instrument-actions.ts` ya no conserva fallback interno legacy.
- `data-user-action` dejó de llamar `window.saveUsr` / `window.delUsr` como ruta primaria; creación y eliminación viven en `js/panels/usuarios/utils/user-domain-actions.ts`.
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
| `data-schedule-action` | Parcialmente directo | Reemplazables ya importados: tabs, mes, asistente, celdas y eventos. Fallback temporal: los mismos globals si el panel no inicializó. No tocar todavía: `generateTeacherScheduleBase`. |
| `data-activity-action` | Directo para acciones visibles | Reemplazables ya importados: vista, metas, edición de nombre/puntos, alta/eliminación, autoajuste, instrumentos básicos, vinculación de instrumentos y guardado de actividad/plantilla. |
| `data-attendance-action` | Mayormente directo | Conservar temporalmente: `exportToExcel` / `exportToPdf`, porque no hay exportador modular equivalente en este dominio. |
| `data-user-action` | Directo con adaptador legacy | Creación y eliminación usan imports directos. `delUsr` se conserva como global temporal para compatibilidad legacy; `saveUsr` no tiene referencia runtime real. |
| `data-student-action` | Híbrido | Conservar fallbacks de crear/editar/búsqueda/fotos hasta exportar acciones desde estudiantes, crear-estudiante y editar-estudiante sin ciclos. |
| `data-academic-action` | Híbrido | Conservar fallbacks de setup académico, edición/eliminación y prompts; mover por grupos después de desacoplar creación/edición. |
| `data-auth-action` | Legacy explícito | Conservar: auth/setup sigue acoplado a bootstrap y compatibilidad de `login-registro-auth/`. |

## Ruta Para Retiro Gradual

1. Mover físicamente `instrumentos` con adaptadores legacy en `js/panels/instrumentos/**`.
2. Mover físicamente `actividades` después de estabilizar imports cruzados con instrumentos.
3. Convertir registries híbridos restantes a imports directos, uno por dominio.
4. Reemplazar `window.RENDERS` por registro modular explícito del router.
5. Reemplazar `_renderPanel` por una función importada desde routing/app.
6. Encapsular `S` detrás de store/imports directos.
7. Reducir `LEGACY_BRIDGE_REGISTRY` por grupos después de `rg` con cero referencias runtime.
