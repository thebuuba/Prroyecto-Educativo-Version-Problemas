# Declarative Actions

## Objetivo

Reducir handlers inline y dependencia directa de `window` sin romper el sistema legacy. Las acciones declarativas viven en HTML como atributos `data-*` y se resuelven por listeners delegados.

## Listener central

El listener se registra desde `apps/web/src/page-entry/root.ts` mediante:

- `js/core/declarative-actions.ts`

Módulos auxiliares:

- `js/panels/autenticacion/utils/auth-actions.ts`
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
