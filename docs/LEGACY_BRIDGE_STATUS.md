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
| Planificaciones | `lessonPlanNew`, `lessonPlanContinue`, `lessonPlanReturnHome`, `lessonPlanSetActiveSection`, `lessonPlanSetGeneralField`, `lessonPlanSetCurriculumField` | El registry ya usa imports directos; eliminar cuando no haya referencias runtime. |
| Reportes | `reportDownloadExcel`, `reportDownloadPdf`, `reportDownloadWord` | El registry ya usa imports directos; conservar por compatibilidad hasta retirar fallbacks. |
| Actividades/instrumentos | `setActView`, `updateBlockMeta`, `handleActNameInput`, `updateActPts`, `addActToBlock`, `removeActFromBlock`, `autoAdjustBlock`, `setInstFilter`, `createNewInstrument`, `editInstrument`, `deleteInstrument`, `openInstrumentCreator` | Convertir `data-activity-action` a imports directos por grupos pequeños. |
| Estudiantes/académico | `saveEst`, `saveEditStudent`, `saveSec`, `saveEditSection`, `saveGrade`, `delEst`, `delSec`, `delGrade` | Reemplazar fallbacks de registries cuando los módulos estén importables sin ciclos. |
| Auth/setup | `loginAuth`, `registerAuth`, `authWithProvider`, `saveSetup`, `populateSetupForm`, `enforceMandatorySetup` | Mantener hasta retirar HTML auth/setup legacy y selectores de compatibilidad. |

## Registries Con Imports Directos

- `data-planning-action`: usa imports directos desde `js/panels/planificaciones/utils/actions.ts`.
- `data-report-action`: usa imports directos desde `js/panels/reportes/utils/actions.ts`.
- `data-ui-action`: vive en `js/core/declarative-actions.ts` y usa imports directos para estado, persistencia, routing y sincronización de perfil.

## Registries Todavía Híbridos

- `data-student-action`: conserva fallbacks hacia funciones legacy de estudiantes.
- `data-academic-action`: conserva fallbacks hacia funciones académicas legacy.
- `data-attendance-action`: mezcla lógica directa con adaptadores de exportación.
- `data-schedule-action`: usa adaptadores de horario legacy.
- `data-activity-action`: usa adaptadores de actividades/instrumentos.
- `data-user-action`: usa fallback a `delUsr` / `saveUsr` si existen.

## Cambio Aplicado En Esta Fase

- Se eliminó `window.openDashboardCourse`.
- `data-report-action` dejó de depender directamente de `window.reportDownloadExcel`, `window.reportDownloadPdf` y `window.reportDownloadWord`.
- Los 6 handlers inline runtime restantes fueron migrados a `data-route` / `data-ui-action`.

## Riesgos Técnicos

- Retirar `legacy-bridge.ts` antes de sustituir `_renderPanel` y `RENDERS` rompe lazy loading.
- Retirar `window.S` antes de desacoplar paneles rompe múltiples componentes legacy.
- Retirar APIs SQL/cloud globales rompe persistencia, auth y sincronización.
- Retirar fallbacks de registries antes de imports directos puede romper fragments cargados dinámicamente.

## Ruta Para Retiro Gradual

1. Convertir registries híbridos a imports directos, uno por dominio.
2. Reemplazar `window.RENDERS` por registro modular explícito del router.
3. Reemplazar `_renderPanel` por una función importada desde routing/app.
4. Encapsular `S` detrás de store/imports directos.
5. Reducir `LEGACY_BRIDGE_REGISTRY` por grupos después de `rg` con cero referencias runtime.
