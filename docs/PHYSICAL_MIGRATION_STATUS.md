# Physical Migration Status

## Estado

No se movieron carpetas en esta fase. El objetivo es dejar claro qué puede moverse físicamente después de estabilizar los últimos contratos globales.

## Listas Para Mover Primero

| Carpeta | Estado | Riesgo | Adaptadores necesarios |
| --- | --- | --- | --- |
| `js/panels/reportes/` | Casi lista | Bajo | Mantener alias/ruta de bundle en `routing.ts`; conservar exportadores legacy temporalmente. |
| `js/panels/planificaciones/` | Casi lista | Bajo-medio | Mantener ruta dinámica del panel y compat de acciones legacy hasta retirar globals. |
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
- Paneles que importan `domain-utils.ts`, que a su vez reexporta muchas APIs.
- `routing.ts` mantiene rutas de bundles con paths físicos legacy.
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

## Dependencias Legacy

- Selectores de compatibilidad auth en `event-bindings.ts`.
- Fallbacks por dominio en registries declarativos.
- Globals de setup obligatorio.
- Deleters globales (`delEst`, `delSec`, `delGrade`, `delTpl`).

## Orden Recomendado

1. Mover paneles de menor acoplamiento: `reportes`, `matriz`, `planificaciones`.
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
