# Legacy Inline Handlers

## Estado actual

El frontend todavía depende de handlers inline HTML (`onclick`, `onchange`, `oninput`, etc.) para compatibilidad con el bridge legacy basado en `window`.

Conteo aproximado antes de la fase declarativa de auth:

| Handler | Cantidad |
| --- | ---: |
| `onclick` | 165 |
| `onchange` | 45 |
| `oninput` | 28 |
| `ondblclick` | 4 |
| `onblur` | 3 |
| `onkeydown` | 2 |
| `onfocus` | 2 |

Conteo después de esta fase:

| Handler | Cantidad |
| --- | ---: |
| `onclick` | 135 |
| `onchange` | 44 |
| `oninput` | 24 |
| `ondblclick` | 4 |
| `onblur` | 1 |
| `onkeydown` | 0 |
| `onfocus` | 0 |

`index.html` contiene más ocurrencias porque se genera desde `sections/`, `login-registro-auth/` y HTML de paneles. No debe editarse manualmente para migrar handlers; la fuente debe ser el fragmento o componente correspondiente.

## Dominios encontrados

- `auth`: login, registro, recuperación de contraseña, proveedores sociales y aceptación de términos. `login-registro-auth/` quedó en `0` handlers inline.
- `modales`: cierres ya migrados; acciones internas como guardar/crear siguen pendientes por dominio.
- `navegación`: navegación simple y navegación con opciones seguras ya migradas.
- `formularios`: perfil inicial migrado para teléfono e institución; quedan formularios de estudiantes, grados, secciones, asistencia y actividades.
- `setup`: perfil inicial, institución, teléfono y sección educativa migrados en los casos de bajo riesgo.
- `ui`: apertura/cierre de modales (`openM`, `closeM`), menú de perfil, navegación y cierre de sesión.
- `routing`: navegación con `go(...)` desde vistas renderizadas.
- `estudiantes`: alta, edición, foto, carga masiva, búsqueda y acciones de tarjetas/tablas.
- `academico`: grados, secciones, áreas, asignaturas y currículo.
- `asistencia`: calendario, cambios de mes, exportación y edición de días.
- `actividades/calificaciones`: bloques, instrumentos, evaluación y matriz.
- `horario/planificaciones/reportes`: asistentes, celdas de horario, plantillas y exportaciones.

## Archivos principales con deuda

- `sections/modals/*.html`
- `sections/panels/*/modals.html`
- `sections/shell/chrome.html`
- `login-registro-auth/login/login.html`
- `login-registro-auth/registro/registro.html`
- `login-registro-auth/shared/auth-modals.html`
- `js/panels/*/components/vista.ts`
- `js/panels/configuracion-inicial/html/setup-profile-modal.html`

## Migrado en esta fase

- `sections/shell/chrome.html`: los botones de cierre de sesión del shell dejaron de usar `onclick="logoutAuth()"` y ahora usan `data-shell-action="logout"`.
- `js/core/shell.ts`: el listener delegado de la shell resuelve `[data-shell-action="logout"]` y mantiene compatibilidad temporal con `.sb-logout-btn`, `#sb-logout` y `button[onclick="logoutAuth()"]`.
- `js/core/declarative-actions.ts`: listener delegado central para acciones declarativas.
- Cierres de modales: `76` apariciones exactas de `onclick="closeM('...')"` fueron migradas a `data-action="modal-close"` y `data-modal-close="..."`.
- Navegación simple: `18` apariciones exactas de `onclick="go('...')"` o `onclick="window.go('...')"` fueron migradas a `data-action="navigate"` y `data-route="..."`.
- Auth: `21` handlers inline en `login-registro-auth/` fueron migrados a `data-auth-action`.
- Setup de perfil: `18` handlers inline en `m-setup` fueron migrados a `data-auth-action`, `data-input-handler`, `data-keydown-handler`, `data-focus-handler` y `data-blur-handler`.
- Logout de configuración: `window.logoutAuth()` fue migrado a `data-auth-action="logout"`.
- Navegación con opciones: `window.go('actividades', { activityViewMode: 'matrix' })` fue migrado a `data-route-options='{"activityViewMode":"matrix"}'`.

## Conteo de fase 3

| Patrón | Antes | Después | Nota |
| --- | ---: | ---: | --- |
| `onclick="closeM('...')"` | 76 | 0 | Migrado en fragments HTML de modales y auth compartido. |
| `data-modal-close="..."` | 0 | 76 | Resuelto por listener delegado. |
| `onclick="go('...')"` / `onclick="window.go('...')"` simple | 18 | 0 | Solo rutas sin opciones. |
| `data-route="..."` | 0 | 18 | Resuelto por listener delegado. |
| `login-registro-auth/` handlers inline | 21 | 0 | Adaptados por `auth-actions.ts`. |
| `m-setup` handlers inline | 18 | 0 | Botones auth/setup y campos simples. |
| navegación inline con opciones | 1 | 0 | Usa `data-route-options`. |

## Pendiente

- Mantener `closeM(...)` programático en lógica de negocio hasta separar flujos por servicio/acción.
- Mantener `go(...)` programático en lógica interna hasta separar acciones de panel.
- Migrar vistas de panel por dominio, sustituyendo HTML inline por `data-action` y registrando acciones en `utils/actions.ts`.
- Migrar formularios de estudiantes y carga masiva con registries explícitos por dominio.
- Migrar `onchange` de grados/secciones a acciones académicas declarativas.
- Migrar `ondblclick` de estudiantes después de crear acciones de estudiante con IDs seguros.
- Reducir `window` en `legacy-api.ts` solo cuando no queden referencias reales en HTML o strings renderizados.
