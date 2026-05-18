# Physical Migration Status

## Estado

La migración física real ya inició con módulos de bajo acoplamiento. `reportes` y `planificaciones` viven ahora en `apps/web/src/panels/`, mientras las rutas legacy en `js/panels/` quedaron como adaptadores temporales de reexportación.

El contrato público del loader se conserva: `PANEL_BUNDLE_URLS` sigue exponiendo claves `/js/panels/...` para no romper lazy loading, pero `PANEL_MODULES` resuelve esos bundles hacia los módulos nuevos en `apps/web/src/panels/...`.

## Movidas Físicamente

| Módulo | Nuevo origen | Adaptador legacy | Riesgo actual |
| --- | --- | --- | --- |
| `reportes` | `apps/web/src/panels/reportes/` | `js/panels/reportes/**` reexporta al nuevo origen. | Bajo: conserva `window.RENDERS.reportes` y globals temporales de exportación. |
| `planificaciones` | `apps/web/src/panels/planificaciones/` | `js/panels/planificaciones/**` reexporta al nuevo origen. | Bajo-medio: conserva `window.RENDERS.planificaciones` y globals temporales `lessonPlan*`. |

## Próximas Listas Para Mover

| Carpeta | Estado | Riesgo | Adaptadores necesarios |
| --- | --- | --- | --- |
| `js/panels/usuarios/` | Parcialmente lista | Medio | Resolver fallback `delUsr` y modal `m-usr`. |
| `js/panels/matriz/` | Casi lista | Bajo | Verificar imports y renderer. |

## Bloqueadas

| Carpeta | Bloqueo | Riesgo |
| --- | --- | --- |
| `js/core/` | Contiene `state`, routing, UI, bridge, API SQL/cloud y persistencia; muchas referencias cruzadas. | Alto |
| `js/panels/estudiantes/`, `crear-estudiante/`, `editar-estudiante/` | Dependen de fallbacks globales, `legacy-api.ts`, deleters y fragments. | Medio-alto |
| `js/panels/configuracion-academica/`, `crear-seccion/` | Dependen de funciones académicas globales y sync SQL. | Medio-alto |
| `js/panels/asistencia/` | Mezcla modelo directo con actions legacy y sync SQL. | Medio |
| `js/panels/horario/` | Usa adaptadores legacy para calendario/asistente. | Medio |
| `js/panels/actividades/`, `instrumentos/` | `data-activity-action` todavía usa adaptadores `window.*`. | Medio-alto |
| `login-registro-auth/` | Tiene bootstrap propio y compat auth. | Medio |

## Imports Problemáticos

- Imports relativos profundos hacia `../../../core/...`.
- Los módulos movidos usan imports relativos profundos hacia `js/core/...` desde `apps/web/src/panels/...`; son explícitos y validados, pero deben reemplazarse por aliases cuando `js/core/` se mueva.
- Paneles que importan `domain-utils.ts`, que a su vez reexporta muchas APIs.
- `routing.ts` mantiene rutas públicas de bundles con paths legacy, aunque los imports directos de `reportes` y `planificaciones` apuntan al nuevo origen.
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
- `reportes` y `planificaciones` ya están físicamente en `apps/web`, pero todavía registran su renderer en `window.RENDERS`.

## Dependencias Legacy

- Selectores de compatibilidad auth en `event-bindings.ts`.
- Fallbacks por dominio en registries declarativos.
- Globals de setup obligatorio.
- Deleters globales (`delEst`, `delSec`, `delGrade`, `delTpl`).

## Orden Recomendado

1. Completar estabilización de `reportes` y `planificaciones` ya movidos.
2. Mover `matriz` si sus imports y renderer se mantienen aislados.
3. Convertir registries híbridos a imports directos por dominio.
4. Mover `usuarios` y luego `horario`/`asistencia`.
5. Mover estudiantes/académico cuando sus fallbacks globales hayan desaparecido.
6. Separar `js/core/` en submódulos dentro de `apps/web/src` con adaptadores raíz.
7. Mover `login-registro-auth/` cuando auth/setup ya no dependa de bootstrap HTML legacy.

## Criterio De Listo

Una carpeta puede moverse cuando:

- `rg "window\\.|onclick=|onchange=|oninput="` no encuentra dependencias runtime propias no documentadas.
- Sus registries usan imports directos o fallbacks explícitos estables.
- `routing.ts` puede apuntar al nuevo path sin romper lazy loading.
- `npm run imports:check`, `npm run check` y `npm run prepare:dist` pasan.
