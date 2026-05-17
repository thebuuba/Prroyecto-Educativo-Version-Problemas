# Auth Migration Plan

## Estado actual

`login-registro-auth/` sigue en la raíz por compatibilidad. No se movió físicamente en esta fase.

Referencias actuales:

- `apps/web/src/page-entry/root.ts` importa `../../../../login-registro-auth/auth-loader.js`.
- `sections/shell/runtime-footer.html` carga `/login-registro-auth/auth-bootstrap.js`.
- `apps/web/styles/02-auth.css` importa `../../../login-registro-auth/auth.css`.
- `login-registro-auth/auth-loader.js` importa HTML como `?raw` desde `shared/`, `login/` y `registro/`.
- `login-registro-auth/auth.css` importa CSS relativo desde `shared/`, `login/` y `registro/`.

## Cambios hechos

- `login-registro-auth/login/login.html` usa `data-auth-action`.
- `login-registro-auth/registro/registro.html` usa `data-auth-action`.
- `login-registro-auth/shared/auth-modals.html` usa `data-auth-action`.
- `sections/modals/m-setup.html` y `js/panels/configuracion-inicial/html/setup-profile-modal.html` usan acciones declarativas para botones y campos simples.
- `js/panels/autenticacion/utils/auth-actions.ts` centraliza adaptadores hacia funciones legacy.

Conteo:

- `login-registro-auth/`: `21` handlers inline antes, `0` después.
- `m-setup`: `18` handlers inline antes, `0` después.

## Funciones legacy conservadas

- `setAuthMode`
- `togglePasswordVisibility`
- `handleForgotPassword`
- `loginAuth`
- `registerAuth`
- `authWithProvider`
- `submitForgotPassword`
- `clearTermsAcceptanceError`
- `cancelTermsAcceptance`
- `confirmTermsAcceptance`
- `cancelEducationSectionSetup`
- `pickSetupEducationSection`
- `confirmSetupEducationSection`
- `saveSetup`
- `cancelSetup`
- `returnSetupToRegister`

## Ruta recomendada

Mover a `apps/web/login-registro-auth/` antes de mover a `apps/web/src/auth/`.

Motivo: el módulo todavía contiene HTML y CSS servidos por rutas compatibles con Vite y ensamblado legacy. `apps/web/src/auth/` conviene después, cuando los handlers de auth ya no dependan de `window`.

## Adaptadores necesarios

1. Crear `login-registro-auth/auth-loader.js` como adaptador hacia `../apps/web/login-registro-auth/auth-loader.js`.
2. Crear `login-registro-auth/auth-bootstrap.js` como adaptador hacia `../apps/web/login-registro-auth/auth-bootstrap.js`.
3. Mantener `login-registro-auth/auth.css` como adaptador CSS hacia `../apps/web/login-registro-auth/auth.css`.
4. Actualizar `apps/web/styles/02-auth.css` para importar la ruta real cuando el adaptador esté validado.
5. Validar que `?raw` sigue funcionando en Vite después del movimiento.

## Pasos previos al movimiento

1. Revisar que no queden referencias runtime a archivos internos de `login-registro-auth/` fuera de `auth-loader.js`, `auth-bootstrap.js` y `auth.css`.
2. Mover físicamente a `apps/web/login-registro-auth/`.
3. Dejar adaptadores mínimos en la raíz.
4. Ejecutar `npm run imports:check`, `npm run check` y `npm run prepare:dist`.

No se movió en esta fase porque el script runtime absoluto `/login-registro-auth/auth-bootstrap.js` todavía está en `sections/shell/runtime-footer.html`; conviene mover con adaptadores en una fase dedicada y verificable.
