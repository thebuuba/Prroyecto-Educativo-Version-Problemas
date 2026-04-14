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
- Fuente principal actual:
  - `js/core/*.js`: estado global, routing, hidratación, shell, utilidades y APIs.
  - `js/panels/*.js`: render e interacción por panel o flujo de UI.
  - `js/page-entry/*.js`: puntos de entrada por página para Vite.
- Arquitectura real del runtime:
  - `js/page-entry/root.js`: puente principal entre módulos ES y el legado basado en `window`.
  - `js/core/app.js`: arranque de la aplicación.
  - `js/core/legacy-bridge.js`: encapsula la compatibilidad legacy y la exposición controlada a `window`.
  - `js/core/hydration.js` + `js/core/hydration-session.js`: separan la orquestación de hidratación de la persistencia/sesión local.
  - `js/core/routing.js`: navegación y carga diferida de paneles.
  - `js/panels/auth.js` + `js/panels/auth-support.js`: autenticación y helpers de formulario/sesión local.
  - `js/panels/planning.js` + `js/panels/planning-actions.js` + `js/panels/planning-render.js`: registro del panel, acciones globales y render.
  - `js/panels/attendance.js` + `js/panels/attendance-model.js` + `js/panels/attendance-actions.js` + `js/panels/attendance-render.js`: orquestación del panel, modelo de asistencia, acciones globales y vista.
  - `js/panels/schedule.js` + `js/panels/schedule-actions.js` + `js/panels/schedule-render.js`: orquestación, hooks globales y vistas de horario/calendario.
  - `js/panels/reports.js` + `js/panels/reports-actions.js`: render del panel y exportaciones/side effects del navegador.
  - `js/panels/activities.js` + `js/panels/activities-actions.js`: render del panel y mutaciones/configuración expuestas al HTML legacy.
  - `js/panels/grade-setup.js` + `js/panels/grade-setup-actions.js`: formulario de grados y controladores de selección/guardado.
  - `js/panels/student-create.js` + `js/panels/student-create-actions.js`: formulario de alta de estudiantes y bridges de guardado/carga de foto.
  - `js/panels/student-edit.js` + `js/panels/student-edit-actions.js`: edición de estudiantes y acciones de actualización/eliminación.
  - `js/panels/students.js` + `js/panels/students-actions.js`: render del panel y puentes de interacción.
  - `js/panels/setup.js`: onboarding y configuración inicial obligatoria.
- Carga diferida:
  - Los paneles navegables se cargan vía `js/core/routing.js`.
  - `setup.js` se carga de forma explícita en el arranque porque expone guardas y utilidades usadas fuera del flujo de navegación.
- Compatibilidad heredada:
  - El proyecto todavía expone funciones a `window` para mantener compatibilidad con HTML inline y flujos legacy.
  - Esa capa de compatibilidad se registra desde `js/core/legacy-bridge.js` y se activa en `js/page-entry/root.js`.
- Artefactos o salidas heredadas:
  - `js/bundles/*.js`
  - `hosting-live/**`
  - `web-legacy/public/legacy/**`
  - `dist/**`
- Scripts auxiliares:
  - `scripts/assemble-all.sh`
  - `scripts/generate-panel-pages.sh`
  - `scripts/prepare-hosting-live.sh`
  - `web-legacy/package.json#build`

## CSS
- Entrada: `styles.css`
- Capas:
  - `styles/01-base.css`
  - `styles/02-auth.css`
  - `styles/03-app-panels.css`
  - `styles/04-ui-overrides.css`
- Paneles detallados: `styles/03-panels/*.css`

## Flujo recomendado
1. Editar solo archivos fuente (`sections`, `js/core`, `js/panels`, `js/page-entry`, `styles`, `server/src`).
2. Ejecutar ensamblado:
   - `./scripts/assemble-all.sh`
3. Validar frontend moderno:
   - `npm run build`
4. Validar backend:
   - `npm --prefix server run check`
5. Validar la app legacy:
   - `cd web-legacy && npm run build`
   - Ese comando sincroniza `web-legacy/public/legacy` y `hosting-live` antes de compilar.

## Nota
`dist/*`, `hosting-live/*` y `web-legacy/public/legacy/dist/*` se consideran artefactos generados.

`js/page-entry/*` ya no se trata como artefacto ensamblado: forma parte de la arquitectura fuente actual y puede editarse cuando sea necesario para el arranque o la integración entre módulos.

## Modularidad
- La app está modularizada por dominio, pero aún mantiene una capa puente hacia `window` por compatibilidad.
- Si agregas un panel navegable nuevo, registra su ruta y su cargador diferido en `js/core/routing.js`.
- Si agregas una utilidad requerida por HTML inline o modales globales, documenta por qué debe exponerse en `window` y hazlo desde `js/core/legacy-bridge.js` o desde un `*-actions.js` del panel responsable.
- Si un panel empieza a mezclar estado, acciones globales y plantilla HTML en un solo archivo, la convención actual es separarlo en `panel.js`, `panel-actions.js` y, si hace falta, `panel-render.js`.

## Deploy recomendado
- Un solo comando:
  - `./scripts/deploy.sh`
- Variables opcionales:
  - `FIREBASE_CONFIG=./firebase.json ./scripts/deploy.sh`
