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
| Estudiantes | `openEstM`, `saveEst`, `openViewStudent`, `openEditStudent`, `saveEditStudent`, `openBulkEstM`, `handleBulkFileChange`, `analyzeBulkInput`, `saveBulkEst`, `delEst` | Registries y módulos de crear/editar estudiante los usan como adaptadores. |
| Académico | `openSecM`, `saveSec`, `openEditSection`, `saveEditSection`, `saveGrade`, `delSec`, `delGrade` | Fallbacks de creación/edición/eliminación y sincronización académica. |
| Asistencia | `shiftMonth`, `setActiveGroup`, `cycleMark`, `commitDayDay`, `cycleException`, `applyWeeklySchedule` | El módulo legacy de asistencia todavía los publica. |
| Horario | `setScheduleTab`, `changeCalendarMonth`, `openScheduleWizard`, `editScheduleCell`, `openAddEventModal` | Ya no son la ruta primaria de `data-schedule-action`; se conservan como fallback y compatibilidad runtime. |
| Actividades | `setActView`, `updateBlockMeta`, `handleActNameInput`, `updateActPts`, `addActToBlock`, `removeActFromBlock`, `autoAdjustBlock`, `saveAct`, `saveTpl` | Ya no son la ruta primaria de `data-activity-action`; se conservan como adaptadores y compatibilidad runtime. |
| Instrumentos | `setInstFilter`, `createNewInstrument`, `editInstrument`, `deleteInstrument`, `openInstrumentCreator` | Ya no son la ruta primaria de `data-activity-action`; se conservan como adaptadores temporales. |
| Vinculación de instrumentos | `openApplyInstrumentModal`, `openCreateInstrumentTypePicker`, `confirmLinkInstrument` | Ya no son la ruta primaria; `instrument-linking.ts` es la fuente principal y los globals quedan como adaptadores temporales. |
| Usuarios | `delUsr` | Adaptador legacy temporal publicado por `js/panels/usuarios/principal.ts`; `data-user-action` ya usa imports directos. |
| Planificaciones | `lessonPlanNew`, `lessonPlanContinue`, `lessonPlanReturnHome`, `lessonPlanSetActiveSection`, `lessonPlanSetGeneralField`, `lessonPlanSetCurriculumField` | El registry ya usa imports directos; globals se conservan temporalmente por compatibilidad. |
| Reportes | `reportDownloadExcel`, `reportDownloadPdf`, `reportDownloadWord` | El registry ya usa imports directos; globals se conservan temporalmente por compatibilidad. |
| Shell | `updateSBUser`, `closeProfileMenu`, `syncSidebarNavState`, `refreshTop` | Shell, routing y sesión los invocan aún vía `window`. |

## Globals Eliminados

- `window.openDashboardCourse`: eliminado porque el único uso runtime era el handler inline del curso en tablero. La acción ahora vive en `data-ui-action="open-dashboard-course"` con imports directos a `S`, `persist` y `go`.

## Globals Que Dejaron De Usarse Directamente Por Registries

- `data-report-action` ya no invoca `window.reportDownloadExcel`, `window.reportDownloadPdf` ni `window.reportDownloadWord`; importa esas funciones desde `apps/web/src/panels/reportes/utils/actions.ts`.
- `data-planning-action` usa imports directos hacia `apps/web/src/panels/planificaciones/utils/actions.ts`.
- `data-schedule-action` usa imports directos para las acciones simples de horario: tabs, mes, asistente, celdas y eventos.
- `data-activity-action` usa imports directos para las acciones de bloques y matriz: vista, metas, nombre, puntos, alta, eliminación y autoajuste.
- `data-activity-action` usa imports directos para guardar actividades y plantillas desde `js/panels/actividades/utils/activity-save.ts`.
- `data-activity-action` usa imports directos para acciones básicas de instrumentos desde `js/panels/instrumentos/utils/instrument-actions.ts`.
- `data-activity-action` usa implementación modular para vincular instrumentos: `openApplyInstrumentModal`, `openCreateInstrumentTypePicker` y `confirmLinkInstrument`.
- `data-user-action` usa imports directos hacia `js/panels/usuarios/utils/user-domain-actions.ts` para crear y eliminar usuarios; ya no invoca `window.saveUsr` ni `window.delUsr` como ruta primaria.
- Las acciones internas de planificaciones dejaron de invocar `window.go` y de leer `window.S`; usan imports directos hacia `go` y `S`.
- `data-ui-action` usa imports directos para contexto global e institución.

## Diagnóstico De Vinculación De Instrumentos

Búsqueda aplicada sobre fuentes, excluyendo `dist/` y `node_modules`: `openApplyInstrumentModal`, `openCreateInstrumentTypePicker`, `confirmLinkInstrument`, `_linkActId`, `m-link-inst`, `applyInstrument`, `linkInstrument`, `instrument modal`, `instrumento vinculado` y `actividad vinculada`.

Resultado:

- La lógica real quedó localizada y modularizada en `js/panels/instrumentos/utils/instrument-linking.ts`.
- `js/panels/instrumentos/principal.ts` no contiene lógica de vinculación; solo registra `window.RENDERS.instrumentos` y llama `registerInstrumentActions()`.
- Los fragments `sections/modals/m-link-inst.html` y `sections/modals/m-inst-type.html` siguen siendo dueños del marcado visual; no se cambiaron textos ni IDs.
- Dependencias de estado: `S.activeGroupId`, `S.activePeriodId`, `S.instruments` y la actividad encontrada por `findActivity()`.
- Dependencias UI: `openM('m-link-inst')`, `openM('m-inst-type')`, `closeM('m-link-inst')` y los IDs DOM `li-act`, `li-inst`, `li-create-btn`, `inst-type-grid`.
- Dependencias `window`: `_linkActId` sigue como llave transicional usada por el registry declarativo; `_linkStudentId` se conserva para compatibilidad de flujo de evaluación por estudiante.
- `activity-actions.ts` ya no llama directamente a `window.openApplyInstrumentModal`, `window.openCreateInstrumentTypePicker` ni `window.confirmLinkInstrument`; importa esas funciones desde `instrument-actions.ts`.
- `instrument-actions.ts` ya no conserva fallback interno a implementaciones legacy capturadas; los globals publicados son adaptadores directos a la fuente modular.

## Diagnóstico De Guardado De Actividades

Búsqueda aplicada sobre fuentes, excluyendo `dist/` y `node_modules`: `saveAct`, `saveTpl`, `actividad guardar`, `plantilla guardar`, `m-act`, `m-tpl`, `activity modal`, `template modal`, `bloques de actividades`, `ACT` y `TPL`.

Resultado:

- La implementación real actual se consolidó en `js/panels/actividades/utils/activity-save.ts`.
- La implementación original fue localizada en bundles legacy históricos, no en `principal.ts`; `utils/actions.ts` solo contenía acciones de bloques/matriz.
- Dependencias de estado/dominio: `S.activeGroupId`, `S.activePeriodId`, `S.templates`, `getGroupCfg`, `uid`, `round2`, `parseDecimalInput` y `BNAME`.
- Dependencias de persistencia/sync: `persist()` y `syncSqlActivityCreateOrUpdate()` para nuevas actividades.
- Dependencias UI: `closeM('m-act')`, `closeM('m-tpl')`, `go('config')` y `toast(...)`.
- IDs DOM requeridos: `a-nom`, `a-blq`, `a-tipo`, `a-pts`, `a-fecha`, `a-obs`, `tpl-name` y `tpl-desc`.
- `activity-actions.ts` ya no invoca `window.saveAct` ni `window.saveTpl`; `actions.ts` solo publica esos nombres globales como adaptadores temporales.

## Preparación Física Actividades/Instrumentos

- `js/panels/instrumentos/**` puede moverse primero a `apps/web/src/panels/instrumentos/**` dejando adaptadores de reexportación en la ruta legacy.
- `js/panels/actividades/**` debe moverse después de instrumentos; hoy importa acciones de instrumentos y conserva dependencias documentadas a `window.AulaBaseSqlApi` y `_linkActId`.
- `routing.ts` debe conservar las claves públicas `/js/panels/instrumentos/principal.ts` y `/js/panels/actividades/principal.ts`, pero puede resolver `PANEL_MODULES` hacia `apps/web/src/panels/...` cuando cada panel se mueva.
- No hay handlers inline runtime que bloqueen el movimiento; el bloqueo restante es de rutas relativas profundas y contratos globales temporales.

## Migración Física Aplicada

- `reportes` y `planificaciones` fueron movidos a `apps/web/src/panels/`.
- `matriz` fue movido a `apps/web/src/panels/matriz/`.
- Las rutas legacy `js/panels/reportes/**` y `js/panels/planificaciones/**` permanecen como adaptadores de reexportación.
- La ruta legacy `js/panels/matriz/**` permanece como adaptador de reexportación.
- No se eliminaron globals adicionales en esta fase; los globals de planificaciones y reportes siguen publicados como fallback temporal.

## Candidatas A Eliminar Después

- `lessonPlanNew`, `lessonPlanContinue`, `lessonPlanReturnHome`, `lessonPlanSetActiveSection`, `lessonPlanSetGeneralField`, `lessonPlanSetCurriculumField`.
- `reportDownloadExcel`, `reportDownloadPdf`, `reportDownloadWord`.
- Adaptadores de horario ya cubiertos por imports directos (`setScheduleTab`, `changeCalendarMonth`, `openScheduleWizard`, `editScheduleCell`, `openAddEventModal`) cuando no existan referencias runtime.
- Adaptadores de actividades ya cubiertos por imports directos (`setActView`, `updateBlockMeta`, `handleActNameInput`, `updateActPts`, `addActToBlock`, `removeActFromBlock`, `autoAdjustBlock`, `saveAct`, `saveTpl`) cuando no existan referencias runtime.
- Adaptadores de instrumentos (`setInstFilter`, `createNewInstrument`, `editInstrument`, `deleteInstrument`, `openInstrumentCreator`) cuando no existan referencias runtime.
- Adaptadores de vinculación (`openApplyInstrumentModal`, `openCreateInstrumentTypePicker`, `confirmLinkInstrument`) cuando no existan referencias runtime fuera de `instrument-actions.ts`.
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
