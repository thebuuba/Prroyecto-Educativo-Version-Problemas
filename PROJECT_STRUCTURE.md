# Estructura del Proyecto (Fuente de Verdad)

Este proyecto se mantiene por secciones para localizar errores rápido por panel.

## HTML
- Fuente: `sections/html/*.html`
- Shell dividido en fragmentos:
  - `00-shell-head.html`
  - `01-shell-chrome.html`
- Autenticación dividida en fragmentos:
  - `02-auth-access-shell.html`
  - `03-auth-login-box.html`
  - `04-auth-register-box.html`
  - `05-auth-modal-utils.html`
- Ensamblado final: `index.html`
- Script: `scripts/assemble-index-html.sh`

## JS
- Fuente: `js/modules/*.js`
- Entradas por página: `js/page-entry/*.js`
- Bundles generados por panel: `js/bundles/*.js`
- Núcleo de autenticación:
  - `01-panel-autenticacion.js`
- Núcleo compartido:
  - `00-core-state-and-utils.js`
  - `03-core-persistencia-y-sesion.js`
  - `04-core-texto-y-normalizacion.js`
  - `05-core-hidratacion-y-restauracion.js`
  - `06-core-settings-guards.js`
  - `02-core-interacciones-y-motion.js`
- Paneles separados por dominio:
  - `10-panel-tablero.js`
  - `11-panel-tablero-estado.js`
  - `12-panel-estudiantes-state.js`
  - `13-panel-actividades-state.js`
  - `14-panel-planificaciones-state.js`
  - `15-panel-planificaciones-view.js`
  - `16-panel-planificaciones-actions.js`
  - `17-panel-asistencia.js`
  - `18-panel-ajustes.js`
  - `19-panel-horario-docente.js`
  - `20-panel-estudiantes.js`
  - `21-panel-actividades.js`
  - `22-panel-instrumentos-vista.js`
  - `23-panel-planificaciones-interfaz.js`
  - `24-panel-configuracion-actividades.js`
- Ensamblado monolítico de compatibilidad: `app.js`
- Bundles de runtime:
  - `js/bundles/app-core.js`
  - `js/bundles/app-shell.js`
  - `js/bundles/panel-*.js`
- Scripts:
  - `scripts/assemble-app-js.sh`
  - `scripts/assemble-app-bundles.sh`
  - `scripts/generate-panel-pages.sh`

## CSS
- Entrada: `styles.css`
- Capas:
  - `styles/01-base.css`
  - `styles/02-auth.css`
  - `styles/03-app-panels.css`
  - `styles/04-ui-overrides.css`
- Paneles detallados: `styles/03-panels/*.css`

## Flujo recomendado
1. Editar solo archivos fuente (`sections`, `js/modules`, `styles`).
2. Ejecutar ensamblado:
   - `./scripts/assemble-all.sh`
3. Validar la app legacy:
   - `cd web-legacy && npm run build`

## Nota
`index.html`, `app.js`, `js/bundles/*` y `js/page-entry/*` se consideran artefactos ensamblados. Evita editar esos archivos directamente.

## Deploy recomendado
- Un solo comando:
  - `./scripts/deploy.sh`
- Variables opcionales:
  - `FIREBASE_CONFIG=./firebase.json ./scripts/deploy.sh`
