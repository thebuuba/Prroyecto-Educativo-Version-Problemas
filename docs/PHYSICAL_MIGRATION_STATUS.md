# Physical Migration Status

## Estado

La migración física real ya inició con módulos de bajo acoplamiento. `reportes`, `planificaciones`, `matriz`, `instrumentos`, `actividades`, `usuarios`, `horario`, `asistencia` y `estudiantes` viven ahora en `apps/web/src/panels/`, mientras las rutas legacy en `js/panels/` quedaron como adaptadores temporales de reexportación.

Revisión de `matriz`: el panel contiene `principal.ts`, `view.ts`, `logic.ts`, `components/vista.ts` y `README.md`. Solo depende de `js/core/state.ts`, `config.ts`, `constants.ts` y `domain-utils.ts`; registra `window.RENDERS.matriz` para el renderer dinámico y no publica acciones/globales propios. El movimiento se completó conservando la clave pública `/js/panels/matriz/principal.ts`.

El contrato público del loader se conserva: `PANEL_BUNDLE_URLS` sigue exponiendo claves `/js/panels/...` para no romper lazy loading, pero `PANEL_MODULES` resuelve esos bundles hacia los módulos nuevos en `apps/web/src/panels/...`.

## Movidas Físicamente

| Módulo | Nuevo origen | Adaptador legacy | Riesgo actual |
| --- | --- | --- | --- |
| `reportes` | `apps/web/src/panels/reportes/` | `js/panels/reportes/**` reexporta al nuevo origen. | Bajo: conserva `window.RENDERS.reportes` y globals temporales de exportación. |
| `planificaciones` | `apps/web/src/panels/planificaciones/` | `js/panels/planificaciones/**` reexporta al nuevo origen. | Bajo-medio: conserva `window.RENDERS.planificaciones` y globals temporales `lessonPlan*`. |
| `matriz` | `apps/web/src/panels/matriz/` | `js/panels/matriz/**` reexporta al nuevo origen. | Bajo: conserva `window.RENDERS.matriz`; no tiene registry ni globals propios. |
| `instrumentos` | `apps/web/src/panels/instrumentos/` | `js/panels/instrumentos/**` reexporta al nuevo origen. | Bajo-medio: conserva `window.RENDERS.instrumentos` y globals temporales de acciones/vinculación. |
| `actividades` | `apps/web/src/panels/actividades/` | `js/panels/actividades/**` reexporta al nuevo origen. | Medio: conserva `window.RENDERS.actividades`, globals temporales de acciones/guardado y dependencias SQL globales. |
| `usuarios` | `apps/web/src/panels/usuarios/` | `js/panels/usuarios/**` reexporta al nuevo origen. | Bajo-medio: conserva `window.RENDERS.usuarios`, `saveUsr` y `delUsr` como adaptadores temporales. |
| `horario` | `apps/web/src/panels/horario/` | `js/panels/horario/**` reexporta al nuevo origen. | Medio: conserva `window.RENDERS.horario/calendario` y globals temporales de agenda. |
| `asistencia` | `apps/web/src/panels/asistencia/` | `js/panels/asistencia/**` reexporta al nuevo origen. | Medio: conserva `window.RENDERS.asistencia`, globals temporales y exportadores legacy encapsulados. |
| `estudiantes` | `apps/web/src/panels/estudiantes/` con `create/` y `edit/`. | `js/panels/estudiantes/**`, `js/panels/crear-estudiante/**` y `js/panels/editar-estudiante/**` reexportan al nuevo origen. | Medio: conserva FormState local por subpanel; CRUD/carga masiva/eliminación siguen implementados en core pero ya pasan por wrappers modulares. |

## Bloqueadas

| Carpeta | Bloqueo | Riesgo |
| --- | --- | --- |
| `js/core/` | Contiene `state`, routing, UI, bridge, API SQL/cloud y persistencia; muchas referencias cruzadas. | Alto |
| `js/panels/configuracion-academica/`, `crear-seccion/` | Dependen de funciones académicas globales y sync SQL. | Medio-alto |
| `login-registro-auth/` | Tiene bootstrap propio y compat auth. | Medio |

## Imports Problemáticos

- Imports relativos profundos hacia `../../../core/...`.
- `instrumentos` ya usa imports relativos profundos desde `apps/web/src/panels/instrumentos/` hacia `js/core`.
- `actividades` ya usa imports relativos profundos desde `apps/web/src/panels/actividades/` hacia `js/core` e importa instrumentos por ruta relativa dentro de `apps/web/src/panels/`.
- Los módulos movidos usan imports relativos profundos hacia `js/core/...` desde `apps/web/src/panels/...`; son explícitos y validados, pero deben reemplazarse por aliases cuando `js/core/` se mueva.
- Paneles que importan `domain-utils.ts`, que a su vez reexporta muchas APIs.
- `routing.ts` mantiene rutas públicas de bundles con paths legacy, aunque los imports directos de `reportes`, `planificaciones` y `matriz` apuntan al nuevo origen.
- `legacy-api.ts` agrupa dominios con `Object.assign(window, ...)`.

## Dependencias Circulares Potenciales

- `core/ui.ts` llama hooks globales de setup/auth.
- `core/routing.ts` depende de `window._renderPanel`.
- `legacy-bridge.ts` usa routing y estado, mientras routing usa globals instalados por bridge.
- Académico llama funciones expuestas desde `legacy-api.ts`; estudiantes conserva compatibilidad por globals publicados desde wrappers modulares y `initDeleters()`.

## Dependencias Runtime

- `window.RENDERS` para registrar paneles.
- `window.S` como estado compartido.
- `_renderPanel` como punto de render.
- APIs `EduGestCloud`, `AulaBaseSqlApi`, `EduGestDB`.
- Fragments `sections/` cargados por ensamblado y modales bajo demanda.
- `reportes`, `planificaciones`, `matriz`, `instrumentos`, `actividades`, `usuarios`, `horario` y `asistencia` ya están físicamente en `apps/web`, pero todavía registran su renderer en `window.RENDERS`.

## Dependencias Legacy

- Selectores de compatibilidad auth en `event-bindings.ts`.
- Fallbacks por dominio en registries declarativos.
- Globals de setup obligatorio.
- Deleters globales (`delEst`, `delSec`, `delGrade`, `delTpl`).

## Preparación Actividades E Instrumentos

Instrumentos:

- Archivos movidos: `principal.ts`, `view.ts`, `logic.ts`, `components/vista.ts`, `utils/instrument-actions.ts`, `utils/instrument-linking.ts` y `README.md`.
- Adaptadores creados: los mismos paths bajo `js/panels/instrumentos/**` reexportan hacia `apps/web/src/panels/instrumentos/**`.
- Fuente modular real: `apps/web/src/panels/instrumentos/utils/instrument-actions.ts` y `apps/web/src/panels/instrumentos/utils/instrument-linking.ts`.
- Globals conservados como adaptadores: `setInstFilter`, `createNewInstrument`, `editInstrument`, `deleteInstrument`, `openInstrumentCreator`, `openApplyInstrumentModal`, `openCreateInstrumentTypePicker`, `confirmLinkInstrument`.
- Routing: `PANEL_MODULES` conserva la clave pública `/js/panels/instrumentos/principal.ts`, pero resuelve hacia `apps/web/src/panels/instrumentos/principal.ts`.

Actividades:

- Archivos movidos: `principal.ts`, `view.ts`, `logic.ts`, `components/vista.ts`, `utils/actions.ts`, `utils/activity-actions.ts`, `utils/activity-save.ts` y `README.md`.
- Adaptadores creados: los mismos paths bajo `js/panels/actividades/**` reexportan hacia `apps/web/src/panels/actividades/**`.
- Fuente modular real: `apps/web/src/panels/actividades/utils/actions.ts`, `apps/web/src/panels/actividades/utils/activity-actions.ts` y `apps/web/src/panels/actividades/utils/activity-save.ts`.
- Wrapper SQL modular: `apps/web/src/panels/actividades/utils/activity-sql.ts` encapsula llamadas de creación/actualización, eliminación de actividad y eliminación de evaluaciones.
- Globals conservados como adaptadores: `setActView`, `updateBlockMeta`, `handleActNameInput`, `updateActPts`, `addActToBlock`, `removeActFromBlock`, `autoAdjustBlock`, `saveAct`, `saveTpl`.
- Routing: `PANEL_MODULES` conserva la clave pública `/js/panels/actividades/principal.ts`, pero resuelve hacia `apps/web/src/panels/actividades/principal.ts`.
- Riesgo pendiente: `window.AulaBaseSqlApi` queda como fallback interno del wrapper SQL; `_linkActId` y `_linkStudentId` quedan como espejo legacy dentro de `instrument-link-state.ts`.

## Orden Recomendado

1. Reducir callbacks/globales restantes de estudiantes después de estabilizar la migración física.
2. Continuar con reducción de dependencias SQL/window en dominios restantes.
3. Mover académico cuando sus fallbacks globales hayan desaparecido.
4. Separar `js/core/` en submódulos dentro de `apps/web/src` con adaptadores raíz.
5. Mover `login-registro-auth/` cuando auth/setup ya no dependa de bootstrap HTML legacy.

## Usuarios

- Archivos movidos: `principal.ts`, `view.ts`, `logic.ts`, `components/vista.ts`, `utils/user-actions.ts`, `utils/user-domain-actions.ts`, `utils/user-save.ts` y `README.md`.
- Adaptadores creados: los mismos paths bajo `js/panels/usuarios/**` reexportan hacia `apps/web/src/panels/usuarios/**`.
- Fuente modular real: `apps/web/src/panels/usuarios/utils/user-actions.ts`, `apps/web/src/panels/usuarios/utils/user-domain-actions.ts` y `apps/web/src/panels/usuarios/utils/user-save.ts`.
- Globals conservados como adaptadores: `saveUsr` y `delUsr`.
- Routing: `PANEL_MODULES` conserva la clave pública `/js/panels/usuarios/principal.ts`, pero resuelve hacia `apps/web/src/panels/usuarios/principal.ts`.

## Horario

- Archivos movidos: `principal.ts`, `view.ts`, `logic.ts`, `components/vista.ts`, `utils/actions.ts`, `utils/schedule-actions.ts` y `README.md`.
- Adaptadores creados: los mismos paths bajo `js/panels/horario/**` reexportan hacia `apps/web/src/panels/horario/**`.
- Fuente modular real: `apps/web/src/panels/horario/utils/actions.ts` y `apps/web/src/panels/horario/utils/schedule-actions.ts`.
- Fallbacks internos reducidos: `data-schedule-action` usa imports directos para tabs, mes, asistente, celdas, eventos y generación base.
- Globals conservados como adaptadores: `setScheduleTab`, `changeCalendarMonth`, `openScheduleWizard`, `editScheduleCell`, `openAddEventModal`, `generateTeacherScheduleBase`.
- Routing: `PANEL_MODULES` conserva la clave pública `/js/panels/horario/principal.ts`, pero resuelve hacia `apps/web/src/panels/horario/principal.ts`.

## Asistencia

- Archivos movidos: `principal.ts`, `view.ts`, `logic.ts`, `components/vista.ts`, `utils/actions.ts`, `utils/attendance-actions.ts`, `utils/attendance-export.ts`, `utils/model.ts` y `README.md`.
- Adaptadores creados: los mismos paths bajo `js/panels/asistencia/**` reexportan hacia `apps/web/src/panels/asistencia/**`.
- Fuente modular real: `apps/web/src/panels/asistencia/utils/attendance-actions.ts`, `apps/web/src/panels/asistencia/utils/model.ts` y `apps/web/src/panels/asistencia/utils/actions.ts`.
- Exportaciones separadas: `apps/web/src/panels/asistencia/utils/attendance-export.ts` encapsula `exportToExcel`, `exportToPdf` y `window.print`.
- Globals conservados como adaptadores: `shiftMonth`, `setActiveGroup`, `cycleMark`, `commitDayDay`, `cycleException`, `applyWeeklySchedule`, `exportToExcel`, `exportToPdf`.
- Routing: `PANEL_MODULES` conserva la clave pública `/js/panels/asistencia/principal.ts`, pero resuelve hacia `apps/web/src/panels/asistencia/principal.ts`.

## Estudiantes

- Estado: migrado físicamente a `apps/web/src/panels/estudiantes/`.
- Archivos movidos: listado (`principal.ts`, `view.ts`, `logic.ts`, `components/vista.ts`, `utils/actions.ts`, `utils/student-actions.ts`, `utils/student-domain-actions.ts`, `utils/student-bulk.ts`, `README.md`), alta (`create/**`) y edición (`edit/**`).
- Adaptadores creados: `js/panels/estudiantes/**`, `js/panels/crear-estudiante/**` y `js/panels/editar-estudiante/**` reexportan al nuevo origen; sus README documentan que son temporales.
- Routing: las claves públicas `/js/panels/estudiantes/principal.ts`, `/js/panels/crear-estudiante/principal.ts` y `/js/panels/editar-estudiante/principal.ts` se conservan; `PANEL_MODULES` resuelve hacia `apps/web/src/panels/estudiantes/`, `create/` y `edit/`.
- Acciones base: `apps/web/src/panels/estudiantes/utils/student-domain-actions.ts` encapsula creación, edición, eliminación, guardado, búsqueda, filtros, selección y fotos.
- Wrappers CRUD: `apps/web/src/panels/estudiantes/utils/student-crud.ts` delega a `js/core/student-logic.ts` para apertura, guardado, vista, edición, alta programática y directorio.
- Wrappers de eliminación: `apps/web/src/panels/estudiantes/utils/student-delete.ts` delega a `js/core/deleters.ts` sin duplicar confirmación ni persistencia.
- Carga masiva: `apps/web/src/panels/estudiantes/utils/student-bulk.ts` encapsula apertura, modo texto/archivo, preview, confirmación, cancelación, exportaciones CSV y wrappers hacia el parser legacy sin cambiar formato esperado.
- `data-student-action` ahora se importa desde `apps/web/src/panels/estudiantes/utils/student-actions.ts`.
- FormState: permanece local en `create/components/vista.ts` y `edit/components/vista.ts`; los callbacks tardíos se registran desde `principal.ts` con el contexto del panel.
- Globals conservados como adaptadores: `openEstM`, `saveEst`, `openViewStudent`, `openEditStudent`, `saveEditStudent`, `openBulkEstM`, `handleBulkFileChange`, `analyzeBulkInput`, `saveBulkEst`, `delEst`, `setStudentsGradeView`, `setActiveSection`, `setStudentsViewMode`, `setStudentsGlobalSearch`, `openStudentSearchResult`, `updateStudentCreateField`, `handleStudentCreatePhoto`, `confirmSaveStudent`, `updateStudentEditField`, `handleStudentEditPhoto`, `confirmSaveEditStudent`, `handleDeleteStudent`.
- Deuda restante: CRUD/carga masiva real sigue en `js/core/student-logic.ts`; eliminación sigue en `js/core/deleters.ts`; `legacy-api.ts` sigue publicando APIs de estudiantes por compatibilidad, pero ya delega a wrappers del dominio.

## Criterio De Listo

Una carpeta puede moverse cuando:

- `rg "window\\.|onclick=|onchange=|oninput="` no encuentra dependencias runtime propias no documentadas.
- Sus registries usan imports directos o fallbacks explícitos estables.
- `routing.ts` puede apuntar al nuevo path sin romper lazy loading.
- `npm run imports:check`, `npm run check` y `npm run prepare:dist` pasan.
