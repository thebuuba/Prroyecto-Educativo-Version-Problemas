# Physical Migration Status

## Estado

La migración física real ya inició con módulos de bajo acoplamiento. `reportes`, `planificaciones` y `matriz` viven ahora en `apps/web/src/panels/`, mientras las rutas legacy en `js/panels/` quedaron como adaptadores temporales de reexportación.

Revisión de `matriz`: el panel contiene `principal.ts`, `view.ts`, `logic.ts`, `components/vista.ts` y `README.md`. Solo depende de `js/core/state.ts`, `config.ts`, `constants.ts` y `domain-utils.ts`; registra `window.RENDERS.matriz` para el renderer dinámico y no publica acciones/globales propios. El movimiento se completó conservando la clave pública `/js/panels/matriz/principal.ts`.

El contrato público del loader se conserva: `PANEL_BUNDLE_URLS` sigue exponiendo claves `/js/panels/...` para no romper lazy loading, pero `PANEL_MODULES` resuelve esos bundles hacia los módulos nuevos en `apps/web/src/panels/...`.

## Movidas Físicamente

| Módulo | Nuevo origen | Adaptador legacy | Riesgo actual |
| --- | --- | --- | --- |
| `reportes` | `apps/web/src/panels/reportes/` | `js/panels/reportes/**` reexporta al nuevo origen. | Bajo: conserva `window.RENDERS.reportes` y globals temporales de exportación. |
| `planificaciones` | `apps/web/src/panels/planificaciones/` | `js/panels/planificaciones/**` reexporta al nuevo origen. | Bajo-medio: conserva `window.RENDERS.planificaciones` y globals temporales `lessonPlan*`. |
| `matriz` | `apps/web/src/panels/matriz/` | `js/panels/matriz/**` reexporta al nuevo origen. | Bajo: conserva `window.RENDERS.matriz`; no tiene registry ni globals propios. |

## Próximas Listas Para Mover

| Carpeta | Estado | Riesgo | Adaptadores necesarios |
| --- | --- | --- | --- |
| `js/panels/instrumentos/` | Lista para preparar movimiento | Bajo-medio | Mover a `apps/web/src/panels/instrumentos/` con adaptadores en `js/panels/instrumentos/**`; mantener clave pública `/js/panels/instrumentos/principal.ts`. |
| `js/panels/actividades/` | Parcialmente lista | Medio | Bloques/matriz, instrumentos y guardado ya directos; conviene mover después de instrumentos por su import a acciones de instrumentos y por dependencias SQL/window. |
| `js/panels/usuarios/` | Parcialmente lista | Medio | Creación/eliminación ya están en módulo exportable; `delUsr` queda como adaptador global y el renderer sigue legacy. |
| `js/panels/horario/` | Parcialmente lista | Medio | Registry parcialmente directo; falta separar generación avanzada y confirmar referencias runtime. |

## Bloqueadas

| Carpeta | Bloqueo | Riesgo |
| --- | --- | --- |
| `js/core/` | Contiene `state`, routing, UI, bridge, API SQL/cloud y persistencia; muchas referencias cruzadas. | Alto |
| `js/panels/estudiantes/`, `crear-estudiante/`, `editar-estudiante/` | Dependen de fallbacks globales, `legacy-api.ts`, deleters y fragments. | Medio-alto |
| `js/panels/configuracion-academica/`, `crear-seccion/` | Dependen de funciones académicas globales y sync SQL. | Medio-alto |
| `js/panels/asistencia/` | Mezcla modelo directo con actions legacy y sync SQL. | Medio |
| `login-registro-auth/` | Tiene bootstrap propio y compat auth. | Medio |

## Imports Problemáticos

- Imports relativos profundos hacia `../../../core/...`.
- Al mover `instrumentos` a `apps/web/src/panels/instrumentos/`, sus imports a `js/core` deben subir hasta `../../../../../js/core/...`; `activity-actions.ts` puede seguir importando desde adaptadores legacy para evitar un salto cruzado largo.
- Al mover `actividades` a `apps/web/src/panels/actividades/`, sus imports a `js/core` y a `apps/web/src/panels/instrumentos/` deben ajustarse juntos; no conviene moverlo antes de estabilizar instrumentos.
- Los módulos movidos usan imports relativos profundos hacia `js/core/...` desde `apps/web/src/panels/...`; son explícitos y validados, pero deben reemplazarse por aliases cuando `js/core/` se mueva.
- Paneles que importan `domain-utils.ts`, que a su vez reexporta muchas APIs.
- `routing.ts` mantiene rutas públicas de bundles con paths legacy, aunque los imports directos de `reportes`, `planificaciones` y `matriz` apuntan al nuevo origen.
- `legacy-api.ts` agrupa dominios con `Object.assign(window, ...)`.

## Dependencias Circulares Potenciales

- `core/ui.ts` llama hooks globales de setup/auth.
- `core/routing.ts` depende de `window._renderPanel`.
- `legacy-bridge.ts` usa routing y estado, mientras routing usa globals instalados por bridge.
- Paneles de estudiantes/académico llaman funciones expuestas desde `legacy-api.ts`.

## Dependencias Runtime

- `window.RENDERS` para registrar paneles.
- `window.S` como estado compartido.
- `_renderPanel` como punto de render.
- APIs `EduGestCloud`, `AulaBaseSqlApi`, `EduGestDB`.
- Fragments `sections/` cargados por ensamblado y modales bajo demanda.
- `reportes`, `planificaciones` y `matriz` ya están físicamente en `apps/web`, pero todavía registran su renderer en `window.RENDERS`.

## Dependencias Legacy

- Selectores de compatibilidad auth en `event-bindings.ts`.
- Fallbacks por dominio en registries declarativos.
- Globals de setup obligatorio.
- Deleters globales (`delEst`, `delSec`, `delGrade`, `delTpl`).

## Preparación Actividades E Instrumentos

Instrumentos:

- Archivos movibles: `principal.ts`, `view.ts`, `logic.ts`, `components/vista.ts`, `utils/instrument-actions.ts`, `utils/instrument-linking.ts` y `README.md`.
- Adaptadores requeridos: mantener los mismos paths bajo `js/panels/instrumentos/**` reexportando hacia `apps/web/src/panels/instrumentos/**`.
- Fuente modular real: `utils/instrument-actions.ts` y `utils/instrument-linking.ts`.
- Globals conservados como adaptadores: `setInstFilter`, `createNewInstrument`, `editInstrument`, `deleteInstrument`, `openInstrumentCreator`, `openApplyInstrumentModal`, `openCreateInstrumentTypePicker`, `confirmLinkInstrument`.
- Bloqueo pendiente: ajustar imports relativos profundos y actualizar `PANEL_MODULES` para que la clave pública legacy cargue el origen nuevo.

Actividades:

- Archivos movibles: `principal.ts`, `view.ts`, `logic.ts`, `components/vista.ts`, `utils/actions.ts`, `utils/activity-actions.ts`, `utils/activity-save.ts` y `README.md`.
- Adaptadores requeridos: mantener `js/panels/actividades/**` reexportando hacia `apps/web/src/panels/actividades/**`.
- Fuente modular real: `utils/actions.ts`, `utils/activity-actions.ts` y `utils/activity-save.ts`.
- Globals conservados como adaptadores: `setActView`, `updateBlockMeta`, `handleActNameInput`, `updateActPts`, `addActToBlock`, `removeActFromBlock`, `autoAdjustBlock`, `saveAct`, `saveTpl`.
- Bloqueo pendiente: `utils/actions.ts` todavía usa `window.AulaBaseSqlApi` para sincronización SQL y `activity-actions.ts` lee `_linkActId`; mover después de instrumentos reduce el riesgo de imports cruzados.

## Orden Recomendado

1. Mover `instrumentos` a `apps/web/src/panels/instrumentos/` con adaptadores legacy.
2. Mover `actividades` a `apps/web/src/panels/actividades/` cuando instrumentos ya esté estable.
3. Continuar con `usuarios`, `horario` y `asistencia` por grupos pequeños.
4. Mover estudiantes/académico cuando sus fallbacks globales hayan desaparecido.
5. Separar `js/core/` en submódulos dentro de `apps/web/src` con adaptadores raíz.
6. Mover `login-registro-auth/` cuando auth/setup ya no dependa de bootstrap HTML legacy.

## Criterio De Listo

Una carpeta puede moverse cuando:

- `rg "window\\.|onclick=|onchange=|oninput="` no encuentra dependencias runtime propias no documentadas.
- Sus registries usan imports directos o fallbacks explícitos estables.
- `routing.ts` puede apuntar al nuevo path sin romper lazy loading.
- `npm run imports:check`, `npm run check` y `npm run prepare:dist` pasan.
