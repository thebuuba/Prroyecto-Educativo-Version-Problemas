# Globals Audit

## Alcance

Auditoría sobre fuentes runtime, excluyendo `dist/`, `node_modules/` e `index.html` generado. `index.html` no se edita manualmente.

Comandos base:

- `rg -n "on(click|input|change|blur|focus|keydown|dblclick)=" js sections login-registro-auth apps -g '!dist/**' -g '!node_modules/**' -g '!index.html'`
- `rg -n "\\b(window|globalThis)\\." js sections login-registro-auth apps -g '!dist/**' -g '!node_modules/**' -g '!index.html'`
- Revisión manual de `js/core/legacy-api.ts` y `js/core/legacy-bridge.ts`.

## Handlers Inline Restantes

Conteo runtime actual: `6`.

No se cuentan selectores de compatibilidad dentro de código, comentarios ni documentación.

| Archivo | Handler | Dominio | Estado |
| --- | --- | --- | --- |
| `js/panels/tablero/principal.ts` | `onclick="${mainFocus.clickAction}"` | shell/ui | Pendiente. Usa acciones calculadas desde `focus-items.ts`. |
| `js/panels/tablero/components/course-item.ts` | `onclick="window.openDashboardCourse(...)"` | shell/ui | Pendiente. Cambia curso activo y navega a actividades. |
| `js/panels/configuracion/components/vista.ts` | `oninput="...window.S.profile..."` | shell/ui | Pendiente. Mutación compleja de perfil e institución. |
| `js/panels/configuracion/components/vista.ts` | `onchange="window.persist(...); window.flushSqlProfileSync?.()"` | shell/ui | Pendiente. Sincronización inmediata de perfil. |
| `js/core/ui.ts` | `onchange="setActiveGroup(this.value)"` | shell/ui | Pendiente. Selector global de contexto académico. |
| `js/core/ui.ts` | `onchange="setActivePeriod(this.value)"` | shell/ui | Pendiente. Selector global de período. |

## Clasificación Por Dominio

| Dominio | Restantes | Notas |
| --- | ---: | --- |
| auth | 0 | Quedan selectores legacy en `event-bindings.ts`, pero no handlers runtime. |
| estudiantes | 0 | Migrado a `data-student-action`. |
| académico | 0 | Migrado a `data-academic-action`. |
| asistencia | 0 | Migrado a `data-attendance-action`. |
| horario | 0 | Migrado a `data-schedule-action`. |
| actividades | 0 | Migrado a `data-activity-action`. |
| usuarios | 0 | Migrado a `data-user-action`. |
| planificaciones | 0 | Migrado a `data-planning-action`. |
| reportes | 0 | Migrado a `data-report-action`. |
| shell/ui | 6 | Tablero, configuración y selectores globales de contexto. |
| otros | 0 | No se detectaron handlers runtime fuera de los anteriores. |

## Funciones Globales Todavía Usadas

Se mantienen porque hay referencias runtime reales, uso por registries como fallback, o wiring de compatibilidad del renderer.

| Grupo | Globales | Razón |
| --- | --- | --- |
| Renderer | `window.RENDERS`, `window._renderPanel` | El router carga bundles y renderiza paneles por nombre. |
| Estado/base | `window.S`, `window.persist`, `window.hydrate`, `window.EduGestDB`, `window.EduGestCloud`, `window.AulaBaseSqlApi` | Persistencia, auth cloud y sincronización SQL todavía consultan estas APIs desde varios módulos. |
| Routing/UI | `window.go`, `window.currentPage`, `window.openM`, `window.closeM`, `window.forceCloseM`, `window.toast` | Usadas por flujos de sesión, modales, shell, registries y fallbacks. |
| Auth/setup | `loginAuth`, `registerAuth`, `authWithProvider`, `handleForgotPassword`, `togglePasswordVisibility`, `saveSetup`, `populateSetupForm`, `enforceMandatorySetup`, `logoutAuth` | Compatibilidad con auth, setup obligatorio y selectores legacy de `event-bindings.ts`. |
| Estudiantes | `openEstM`, `saveEst`, `openViewStudent`, `openEditStudent`, `saveEditStudent`, `openBulkEstM`, `handleBulkFileChange`, `analyzeBulkInput`, `saveBulkEst`, `delEst` | Registries y módulos de crear/editar estudiante los usan como adaptadores. |
| Académico | `openSecM`, `saveSec`, `openEditSection`, `saveEditSection`, `saveGrade`, `delSec`, `delGrade` | Fallbacks de creación/edición/eliminación y sincronización académica. |
| Asistencia | `shiftMonth`, `setActiveGroup`, `cycleMark`, `commitDayDay`, `cycleException`, `applyWeeklySchedule` | El módulo legacy de asistencia todavía los publica; algunos selectores globales dependen de `setActiveGroup`. |
| Horario | `setScheduleTab`, `changeCalendarMonth`, `openScheduleWizard`, `editScheduleCell`, `openAddEventModal` | Usados por `data-schedule-action` como adaptadores. |
| Actividades/instrumentos | `setActView`, `updateBlockMeta`, `handleActNameInput`, `updateActPts`, `addActToBlock`, `removeActFromBlock`, `autoAdjustBlock`, `setInstFilter`, `createNewInstrument`, `editInstrument`, `deleteInstrument`, `openInstrumentCreator` | Usados por `data-activity-action` y paneles relacionados. |
| Usuarios | `delUsr` | Usado por `data-user-action` como fallback si existe. |
| Planificaciones | `lessonPlanNew`, `lessonPlanContinue`, `lessonPlanReturnHome`, `lessonPlanSetActiveSection`, `lessonPlanSetGeneralField`, `lessonPlanSetCurriculumField` | Aunque el registry importa funciones directas, se conservan temporalmente por compatibilidad. |
| Reportes | `reportDownloadExcel`, `reportDownloadPdf`, `reportDownloadWord` | Usados por `data-report-action` como exportadores permitidos. |
| Shell | `updateSBUser`, `closeProfileMenu`, `syncSidebarNavState`, `refreshTop` | Shell, routing y sesión los invocan aún vía `window`. |

## Candidatas A Eliminar

No se eliminó ningún global en esta fase.

Candidatas para una fase posterior, después de reemplazar sus usos por imports directos o confirmar cero referencias runtime:

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

1. Migrar los 6 handlers inline restantes de shell/ui con un registry específico solo si se consolida una API clara de contexto y configuración.
2. Cambiar registries de dominio para importar funciones directas en vez de llamar adaptadores `window.*`.
3. Quitar globals dominio por dominio solo después de `rg` en `sections/`, `login-registro-auth/`, `js/panels/`, `js/core/` y strings renderizados.
4. Mantener `legacy-bridge.ts` hasta que `window.RENDERS`, `_renderPanel`, `S`, routing y APIs de persistencia tengan reemplazo modular completo.
