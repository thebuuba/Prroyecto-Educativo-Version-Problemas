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
