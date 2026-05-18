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
| `js/panels/usuarios/` | Parcialmente lista | Medio | Creación/eliminación ya están en módulo exportable; `delUsr` queda como adaptador global y el renderer sigue legacy. |
| `js/panels/horario/` | Parcialmente lista | Medio | Registry parcialmente directo; falta separar generación avanzada y confirmar referencias runtime. |
| `js/panels/actividades/` | Parcialmente lista | Medio | Bloques/matriz e instrumentos ya directos; guardado y plantillas siguen como fallbacks. |
| `js/panels/instrumentos/` | Parcialmente lista | Medio | Acciones básicas y vinculación separadas en `utils/`; renderer aún está en el entrypoint legacy. |

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

## Orden Recomendado

1. Completar estabilización de `reportes`, `planificaciones` y `matriz` ya movidos.
2. Convertir registries híbridos a imports directos por dominio.
3. Mover `usuarios` y luego `horario`/`asistencia`.
4. Mover estudiantes/académico cuando sus fallbacks globales hayan desaparecido.
5. Separar `js/core/` en submódulos dentro de `apps/web/src` con adaptadores raíz.
6. Mover `login-registro-auth/` cuando auth/setup ya no dependa de bootstrap HTML legacy.

## Criterio De Listo

Una carpeta puede moverse cuando:

- `rg "window\\.|onclick=|onchange=|oninput="` no encuentra dependencias runtime propias no documentadas.
- Sus registries usan imports directos o fallbacks explícitos estables.
- `routing.ts` puede apuntar al nuevo path sin romper lazy loading.
- `npm run imports:check`, `npm run check` y `npm run prepare:dist` pasan.
