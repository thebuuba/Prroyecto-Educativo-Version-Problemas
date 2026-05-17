# Declarative Actions

## Objetivo

Reducir handlers inline y dependencia directa de `window` sin romper el sistema legacy. Las acciones declarativas viven en HTML como atributos `data-*` y se resuelven por listeners delegados.

## Listener central

El listener se registra desde `apps/web/src/page-entry/root.ts` mediante:

- `js/core/declarative-actions.ts`

Módulos auxiliares:

- `js/panels/autenticacion/utils/auth-actions.ts`
- `js/panels/estudiantes/utils/student-actions.ts`
- `js/panels/configuracion-academica/utils/academic-actions.ts`
- `js/panels/asistencia/utils/attendance-actions.ts`
- `js/panels/horario/utils/schedule-actions.ts`
- `js/panels/actividades/utils/activity-actions.ts`
- `js/panels/usuarios/utils/user-actions.ts`
- `js/core/form-actions.ts`

## Acciones soportadas

### Cerrar modal

```html
<button data-action="modal-close" data-modal-close="m-grade">Cancelar</button>
```

Reglas:

- `data-modal-close` debe contener el id del modal.
- El listener llama `closeM(id)`.
- `closeM` global se conserva por compatibilidad.

### Navegar

```html
<button data-action="navigate" data-route="estudiantes">Ir</button>
```

Con opciones controladas:

```html
<button
  data-action="navigate"
  data-route="actividades"
  data-route-options='{"activityViewMode":"matrix"}'>
  Matriz
</button>
```

Reglas:

- `data-route` debe ser una ruta existente del sistema actual.
- `data-route-options` debe ser JSON válido y objeto plano.
- Si el JSON es inválido, se registra un warning y se navega sin opciones.
- El listener llama `go(route, options)`.
- `go` global se conserva por compatibilidad.

### Auth

```html
<button data-auth-action="login">Iniciar sesión</button>
<button data-auth-action="show-register">Regístrate</button>
<button data-auth-action="toggle-password" data-auth-target="al-pass">...</button>
```

Acciones permitidas:

- `login`
- `register`
- `logout`
- `show-register`
- `show-login`
- `recover-password`
- `submit-password-reset`
- `toggle-password`
- `provider` con `data-auth-provider`
- `submit-profile-setup`
- `cancel-profile-setup`
- `clear-terms-error`
- `continue` con `data-auth-context`
- `back` con `data-auth-context`
- `cancel-education-section`
- `pick-education-section` con `data-auth-value`
- `confirm-education-section`

El módulo de auth usa una whitelist de adaptadores hacia funciones legacy existentes. No ejecuta nombres arbitrarios.

### Estudiantes

```html
<button data-student-action="bulk-upload" data-student-section-id="sec_1">Carga Masiva</button>
<input data-student-action="search">
<button data-student-action="delete" data-student-id="st_1">...</button>
```

Acciones permitidas:

- `create`, `edit`, `delete`, `save`, `cancel`
- `search`, `filter`, `clear-filter`, `select`
- `bulk-upload`, `bulk-preview`, `bulk-confirm`, `bulk-cancel`
- `export`, `import`

El registry vive en `js/panels/estudiantes/utils/student-actions.ts`. Los atributos secundarios (`data-student-id`, `data-student-value`, `data-student-filter`, `data-student-select`, `data-student-mode`, etc.) solo seleccionan ramas conocidas dentro del registry; no se ejecutan nombres de funciones desde HTML.

Migrado en esta fase:

- Vista principal de estudiantes: búsqueda, filtros de grado/sección, modo grid/table, doble clic para ver, edición, eliminación y acceso a carga masiva.
- Panel de crear estudiante: campos simples, selección de sección, foto y guardado.
- Panel de editar estudiante: campos simples, selección de sección, foto, guardado y eliminación.
- Modales legacy `m-est`, `m-est-edit`, `m-est-view`, `m-student-add-mode` y `m-est-bulk`.

Pendiente:

- Lectura real de archivos `.xlsx/.xls` en carga masiva; el flujo declarativo mantiene el comportamiento legacy existente.

### Académico

```html
<button data-academic-action="save-grade">Crear grado</button>
<select data-academic-action="filter" data-academic-target="section-curriculum"></select>
<button data-academic-action="clear-filter" data-academic-target="subject">+ Asignatura</button>
```

Acciones permitidas:

- `create-grade`, `edit-grade`, `delete-grade`, `save-grade`
- `create-section`, `edit-section`, `delete-section`, `save-section`
- `select-grade`, `select-section`
- `filter`, `clear-filter`, `cancel`

El registry vive en `js/panels/configuracion-academica/utils/academic-actions.ts`. Los atributos secundarios (`data-academic-field`, `data-academic-target`, `data-academic-prefix`, `data-academic-mode`, etc.) seleccionan ramas conocidas; no se ejecutan nombres de funciones desde HTML.

Migrado en esta fase:

- Los `18` handlers académicos de `sections/panels/estudiantes/modals.html`.
- Fragments individuales `m-grade`, `m-sec`, `m-grade-edit` y `m-sec-edit`.
- Controles simples de los paneles modernos `configuracion-academica` y `crear-seccion`.

Riesgos:

- El fallback de edición de grado mantiene persistencia local básica si no existe una función legacy `saveEditGrade`.
- La creación manual de opciones personalizadas de área/asignatura/sección usa prompts acotados y agrega opciones al select actual; no cambia el schema.

### Asistencia

```html
<button data-attendance-action="previous-month">...</button>
<select data-attendance-action="select-section"></select>
<button data-attendance-action="edit" data-attendance-student-id="st_1" data-attendance-slot-index="0">P</button>
```

Acciones permitidas:

- `open`, `edit`, `save`, `cancel`
- `mark-present`, `mark-absent`, `mark-late`, `justify`
- `change-date`, `change-month`, `previous-day`, `next-day`, `previous-month`, `next-month`
- `filter`, `clear-filter`, `select-course`, `select-section`, `select-student`
- `export`, `print`

El registry vive en `js/panels/asistencia/utils/attendance-actions.ts`. Usa parámetros como `data-attendance-student-id`, `data-attendance-section-id`, `data-attendance-month`, `data-attendance-slot-index`, `data-attendance-status`, `data-attendance-target` y `data-attendance-value`.

Migrado en esta fase:

- Cambio de mes anterior/siguiente.
- Cambio de curso/sección activa.
- Generar días como acción declarativa equivalente al flujo legacy.
- Impresión y exportaciones como adaptadores seguros.
- Edición de número de día, ciclo de excepción y ciclo de marca por estudiante.

Pendiente:

- Las exportaciones dependen de globals legacy `exportToExcel` / `exportToPdf` si existen en runtime.
- `previous-day`, `next-day`, `clear-filter` y `select-student` quedan registrados como placeholders seguros hasta que existan controles específicos.

### Horario

```html
<button data-schedule-action="change-view" data-schedule-view="calendar">Calendario</button>
<button data-schedule-action="previous-month">...</button>
<div data-schedule-action="edit-block" data-schedule-day="1" data-schedule-time="07:30" data-schedule-end-time="08:10"></div>
```

Acciones permitidas:

- `create`, `edit`, `delete`, `save`, `cancel`
- `add-block`, `edit-block`, `delete-block`
- `select-day`, `select-time`, `select-subject`, `select-teacher`, `select-course`, `select-section`
- `change-view`, `clear`, `print`, `export`
- `open-wizard`, `close-wizard`, `generate`
- `previous-week`, `next-week`, `previous-month`, `next-month`

El registry vive en `js/panels/horario/utils/schedule-actions.ts`. Los parámetros se pasan por `data-schedule-day`, `data-schedule-time`, `data-schedule-end-time`, `data-schedule-view`, `data-schedule-target` y equivalentes. No ejecuta nombres de funciones desde atributos.

Migrado en esta fase:

- Cambio entre horario semanal y calendario escolar.
- Apertura/reinicio del asistente.
- Edición de bloque horario desde la grilla semanal.
- Navegación mensual del calendario.
- Apertura del flujo de evento personal.
- Creación de plantilla base desde `m-schedule-base`.

Pendiente:

- `generateTeacherScheduleBase` sigue como adaptador legacy si aparece en runtime; si no existe, se redirige al asistente.
- Acciones sin controles visibles actuales (`delete`, `save`, `clear`, `export`, selección de docente/asignatura/curso) quedan registradas como ramas seguras.

### Actividades y Calificaciones

```html
<button data-activity-action="change-matrix-view" data-matrix-view="matrix">Matriz</button>
<input data-activity-action="change-grade" data-activity-event="input" data-block-id="B1" data-activity-id="act_1">
<button data-activity-action="create-instrument">Nuevo Instrumento</button>
```

Acciones permitidas:

- `create`, `edit`, `delete`, `save`, `cancel`
- `select-block`, `create-block`, `edit-block`, `delete-block`
- `select-instrument`, `create-instrument`, `edit-instrument`, `delete-instrument`, `save-instrument`
- `evaluate-student`, `change-grade`, `clear-grade`, `save-grades`
- `open-matrix`, `edit-matrix`, `change-matrix-view`
- `filter`, `clear-filter`, `export`, `print`, `calculate-average`, `sync`

El registry vive en `js/panels/actividades/utils/activity-actions.ts`. Los parámetros se pasan por `data-activity-id`, `data-block-id`, `data-instrument-id`, `data-student-id`, `data-grade-value`, `data-matrix-view`, `data-target` y `data-value`. No ejecuta nombres de funciones desde atributos.

Migrado en esta fase:

- Tabs de actividades: bloques, matriz y configuración.
- Apertura de evaluación desde tarjetas y celdas de matriz.
- Configuración de meta por bloque, alta de actividad, autoajuste, edición de nombre/puntos y eliminación.
- Filtros, creación, edición y eliminación de instrumentos.
- Modales legacy `m-act`, `m-tpl` y `m-link-inst`.

Pendiente:

- `saveUsr()` del fragmento combinado de actividades fue tratado en el dominio usuarios.
- Guardado de actividad/plantilla y vinculación de instrumentos conservan adaptadores hacia globals legacy si existen en runtime.
- Exportación, sincronización y edición profunda de matriz quedan como ramas seguras hasta que existan controles y módulos específicos.

### Usuarios

```html
<button data-user-action="open-modal" data-user-modal-id="m-usr">Nuevo Usuario</button>
<button data-user-action="save">Crear usuario</button>
<button data-user-action="delete" data-user-id="usr_1">...</button>
```

Acciones permitidas:

- `create`, `edit`, `delete`, `save`, `cancel`
- `select-role`, `change-permission`
- `activate`, `deactivate`, `reset-password`
- `open-modal`
- `filter`, `clear-filter`, `search`
- `invite`, `update-profile`, `save-profile`, `change-status`

El registry vive en `js/panels/usuarios/utils/user-actions.ts`. Los parámetros se pasan por `data-user-id`, `data-user-role`, `data-user-permission`, `data-user-status`, `data-user-target`, `data-user-value` y `data-user-modal-id`. No ejecuta nombres de funciones desde atributos.

Migrado en esta fase:

- Apertura del modal de usuario desde el panel vacío y desde el header del panel.
- Guardado de usuario desde `sections/modals/m-usr.html` y desde el fragmento combinado legacy de actividades.
- Eliminación de usuarios desde la tabla de colaboradores.

Pendiente:

- Edición, permisos, activación/desactivación, reseteo de contraseña, invitación y perfil no tienen controles visibles actuales en el panel.
- `saveUsr` y `delUsr` se conservan como adaptadores legacy explícitos si existen en runtime.

### Formularios simples

```html
<input data-action="input-change" data-input-handler="setup-phone">
<input data-input-handler="setup-institution" data-keydown-handler="setup-institution">
```

Handlers permitidos actualmente:

- `setup-phone`
- `setup-institution`

El registry vive en `js/core/form-actions.ts`. Para agregar uno nuevo, se debe importar o adaptar explícitamente una función conocida y registrar una clave segura.

## Prohibido

- `eval`
- `new Function`
- Ejecutar nombres arbitrarios desde atributos HTML.
- Pasar código JavaScript dentro de `data-*`.
- Eliminar funciones globales mientras haya referencias reales.

## Cómo agregar una acción nueva

1. Agregar un atributo declarativo específico al HTML fuente, no a `index.html` generado.
2. Registrar la acción en un módulo con whitelist.
3. Mantener fallback legacy si todavía hay referencias inline.
4. Ejecutar `npm run imports:check`, `npm run check` y `npm run prepare:dist`.
