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
- Estudiantes y carga masiva: `53` handlers inline en las fuentes reales de `js/panels/estudiantes/`, `js/panels/crear-estudiante/`, `js/panels/editar-estudiante/` y `sections/modals/m-est*.html` / `m-student-add-mode.html` fueron migrados a `data-student-action`. El fragmento combinado `sections/panels/estudiantes/modals.html` recibió la misma migración para conservar el ensamblado legacy.
- Académico: los `18` handlers inline restantes de grados/secciones en `sections/panels/estudiantes/modals.html` fueron migrados a `data-academic-action`. También se migraron los fragments individuales `m-grade`, `m-sec`, `m-grade-edit`, `m-sec-edit` y acciones simples de `configuracion-academica` / `crear-seccion`.
- Asistencia: `11` handlers inline del panel `js/panels/asistencia/` fueron migrados a `data-attendance-action` con registry explícito para mes, curso/sección, edición de día, excepciones, marcas, impresión y exportación.
- Horario: `10` handlers inline del dominio `js/panels/horario/`, `sections/panels/horario/` y fragments `m-schedule*` fueron migrados a `data-schedule-action`.
- Actividades/calificaciones: `25` handlers inline de componentes y fragments directos fueron migrados a `data-activity-action`; el único restante en el alcance ampliado es `saveUsr()` del dominio usuarios.
- Usuarios/modales compartidos: `5` handlers inline de `js/panels/usuarios/`, `sections/modals/m-usr.html` y el fragmento combinado de actividades fueron migrados a `data-user-action`.
- Planificaciones/reportes: `25` handlers inline de `js/panels/planificaciones/` y `js/panels/reportes/` fueron migrados a `data-planning-action` y `data-report-action`.

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
| estudiantes/carga masiva inline en fuentes reales | 53 | 0 | Usa `data-student-action` con registry explícito. |
| `sections/panels/estudiantes/modals.html` inline de estudiantes | 25 | 0 | Duplicado legacy sincronizado; quedan handlers académicos de grados/secciones. |
| `data-student-action` en fuentes reales | 0 | 56 | Alta, edición, búsqueda, selección, foto y carga masiva. |
| `sections/panels/estudiantes/modals.html` inline académico | 18 | 0 | Grados/secciones migrados a `data-academic-action`. |
| inline académico en fragments individuales y vistas modernas | 33 | 0 | `m-grade`, `m-sec`, edición y paneles modernos seguros. |
| `data-academic-action` en alcance migrado | 0 | 51 | Registry explícito de dominio académico. |
| `js/panels/asistencia/` handlers inline | 11 | 0 | Mes, grupo, días, excepciones, marcas y exportación. |
| `data-attendance-action` en asistencia | 0 | 10 | Vista renderizada con parámetros por `data-*`. |
| Horario/calendario inline | 10 | 0 | Tabs, asistente, calendario, edición de bloque y plantilla base. |
| `data-schedule-action` en horario | 0 | 10 | Registry explícito de dominio horario. |
| Actividades/instrumentos/matriz inline en alcance revisado | 26 | 1 | El restante es `saveUsr()` en el fragmento combinado legacy, fuera del dominio actividades. |
| Fuentes directas de actividades/instrumentos migradas | 25 | 0 | Componentes renderizados y fragments `m-act`, `m-tpl`, `m-link-inst`. |
| `data-activity-action` en alcance migrado | 0 | 25 | Registry explícito de actividades, bloques, matriz e instrumentos. |
| Usuarios/modales compartidos inline | 5 | 0 | Apertura, guardado y eliminación de usuarios. |
| `data-user-action` en alcance migrado | 0 | 5 | Registry explícito de usuarios. |
| Planificaciones inline | 22 | 0 | Crear, continuar, secciones, campos del editor, volver y guardar. |
| Reportes inline | 3 | 0 | Exportaciones Excel, PDF y Word. |
| `data-planning-action` / `data-report-action` | 0 | 23 | Registries explícitos separados por dominio. |
| Shell/UI inline runtime | 6 | 0 | Tablero, institución y selectores globales de contexto. |
| `data-ui-action` en shell/UI | 0 | 4 | Acciones compartidas explícitas en `declarative-actions.ts`. |

## Pendiente

- Mantener `closeM(...)` programático en lógica de negocio hasta separar flujos por servicio/acción.
- Mantener `go(...)` programático en lógica interna hasta separar acciones de panel.
- Migrar vistas de panel por dominio, sustituyendo HTML inline por `data-action` y registrando acciones en `utils/actions.ts`.
- Revisar carga masiva con archivo `.xlsx/.xls`: el handler declarativo conserva el flujo existente, pero el parser legacy sigue analizando texto y no implementa lectura real de hojas de cálculo.
- Revisar la edición de grado legacy contra sincronización SQL: el fallback declarativo actual conserva edición local básica si no existe `window.saveEditGrade`.
- Implementar exportaciones reales de asistencia si no existen globals `exportToExcel` / `exportToPdf`; el registry conserva el adaptador si esas funciones aparecen en runtime.
- Completar acciones de día anterior/siguiente y selección individual de estudiante si se añaden controles visibles para esos flujos.
- Completar acciones de horario que hoy quedan como placeholders seguros (`save`, `delete`, `clear`, `export`, selección de docente/asignatura/curso) cuando existan controles visibles o lógica modular específica.
- `generateTeacherScheduleBase` no existe como módulo local; `data-schedule-action="generate"` conserva el adaptador legacy si aparece en runtime y cae al asistente si no está disponible.
- `saveUsr()` ya no queda inline en `sections/panels/actividades/modals.html`; fue migrado a `data-user-action="save"`.
- `openApplyInstrumentModal`, `openCreateInstrumentTypePicker`, `confirmLinkInstrument`, `saveAct` y `saveTpl` no tienen implementación modular local visible; `data-activity-action` conserva adaptadores legacy explícitos si esas funciones existen en runtime.
- Acciones de actividades sin controles visibles actuales (`clear-grade`, `save-grades`, `export`, `sync`, edición profunda de matriz) quedan registradas como ramas seguras o placeholders.
- Acciones de usuarios sin controles visibles actuales (`edit`, permisos, activar/desactivar, reset de contraseña, invitación y perfil) quedan registradas como ramas seguras hasta que existan flujos específicos.
- Acciones de planificación sin controles visibles actuales (`delete`, `duplicate`, plantillas y filtros complejos) quedan registradas como ramas seguras.
- Acciones de reportes sin controles visibles actuales (`select-*`, `open-detail`, filtros y descarga genérica por archivo) quedan registradas como ramas seguras.
- Auditoría global final de esta etapa: quedan `0` handlers inline runtime reales. Las coincidencias restantes de `onclick=` son selectores/comentarios de compatibilidad, no atributos renderizados.
- Reducir `window` en `legacy-api.ts` solo cuando no queden referencias reales en HTML o strings renderizados.
