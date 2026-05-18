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
| Horario | `setScheduleTab`, `changeCalendarMonth`, `openScheduleWizard`, `editScheduleCell`, `openAddEventModal` | Usados por `data-schedule-action` como adaptadores. |
| Actividades/instrumentos | `setActView`, `updateBlockMeta`, `handleActNameInput`, `updateActPts`, `addActToBlock`, `removeActFromBlock`, `autoAdjustBlock`, `setInstFilter`, `createNewInstrument`, `editInstrument`, `deleteInstrument`, `openInstrumentCreator` | Usados por `data-activity-action` y paneles relacionados. |
| Usuarios | `delUsr` | Usado por `data-user-action` como fallback si existe. |
| Planificaciones | `lessonPlanNew`, `lessonPlanContinue`, `lessonPlanReturnHome`, `lessonPlanSetActiveSection`, `lessonPlanSetGeneralField`, `lessonPlanSetCurriculumField` | El registry ya usa imports directos; globals se conservan temporalmente por compatibilidad. |
| Reportes | `reportDownloadExcel`, `reportDownloadPdf`, `reportDownloadWord` | El registry ya usa imports directos; globals se conservan temporalmente por compatibilidad. |
| Shell | `updateSBUser`, `closeProfileMenu`, `syncSidebarNavState`, `refreshTop` | Shell, routing y sesión los invocan aún vía `window`. |

## Globals Eliminados

- `window.openDashboardCourse`: eliminado porque el único uso runtime era el handler inline del curso en tablero. La acción ahora vive en `data-ui-action="open-dashboard-course"` con imports directos a `S`, `persist` y `go`.

## Globals Que Dejaron De Usarse Directamente Por Registries

- `data-report-action` ya no invoca `window.reportDownloadExcel`, `window.reportDownloadPdf` ni `window.reportDownloadWord`; importa esas funciones desde `apps/web/src/panels/reportes/utils/actions.ts`.
- `data-planning-action` usa imports directos hacia `apps/web/src/panels/planificaciones/utils/actions.ts`.
- Las acciones internas de planificaciones dejaron de invocar `window.go` y de leer `window.S`; usan imports directos hacia `go` y `S`.
- `data-ui-action` usa imports directos para contexto global e institución.

## Migración Física Aplicada

- `reportes` y `planificaciones` fueron movidos a `apps/web/src/panels/`.
- Las rutas legacy `js/panels/reportes/**` y `js/panels/planificaciones/**` permanecen como adaptadores de reexportación.
- No se eliminaron globals adicionales en esta fase; los globals de planificaciones y reportes siguen publicados como fallback temporal.

## Candidatas A Eliminar Después

- `lessonPlanNew`, `lessonPlanContinue`, `lessonPlanReturnHome`, `lessonPlanSetActiveSection`, `lessonPlanSetGeneralField`, `lessonPlanSetCurriculumField`.
- `reportDownloadExcel`, `reportDownloadPdf`, `reportDownloadWord`.
- Adaptadores de panel ya cubiertos por registries (`setActView`, `updateBlockMeta`, `setInstFilter`, etc.) cuando los registries dejen de invocar `window`.
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
