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
  - `js/panels/*/`: cada panel en su propia carpeta con estructura estándar.
  - `js/page-entry/*.js`: puntos de entrada por página para Vite.
- Arquitectura real del runtime:
  - `js/page-entry/root.js`: puente principal entre módulos ES y el legado basado en `window`.
  - `js/core/app.js`: arranque de la aplicación.
  - `js/core/legacy-bridge.js`: encapsula la compatibilidad legacy y la exposición controlada a `window`.
  - `js/core/hydration.js` + `js/core/hydration-session.js`: separan la orquestación de hidratación de la persistencia/sesión local.
  - `js/core/routing.js`: navegación y carga diferida de paneles.
- Estructura de paneles (NUEVA - Carpetas en español, archivos internos en inglés):
  - Cada panel tiene su propia carpeta con estructura estándar:
    ```
    panel-name/
    ├── principal.js              # Archivo principal del panel (nombre en español)
    ├── components/               # Componentes UI reutilizables
    ├── utils/                   # Utilidades específicas del panel (archivos en inglés)
    │   ├── actions.js          # Acciones y lógica de negocio
    │   ├── model.js            # Modelos de datos
    │   └── support.js           # Funciones de soporte
    ├── types/                   # Definiciones de tipos (TypeScript opcional)
    └── README.md                # Documentación del panel
    ```
  - Paneles migrados a nueva estructura (nombres en español):
    - `js/panels/tablero/` - Panel principal
    - `js/panels/autenticacion/` - Panel de autenticación
    - `js/panels/actividades/` - Panel de actividades
    - `js/panels/estudiantes/` - Panel de estudiantes
    - `js/panels/asistencia/` - Panel de asistencia
    - `js/panels/planificaciones/` - Panel de planificaciones
    - `js/panels/horario/` - Panel de horario
    - `js/panels/reportes/` - Panel de reportes
    - `js/panels/instrumentos/` - Panel de instrumentos
    - `js/panels/configuracion/` - Panel de configuración
    - `js/panels/configuracion-academica/` - Panel de configuración académica
    - `js/panels/crear-estudiante/` - Panel de creación de estudiantes
    - `js/panels/editar-estudiante/` - Panel de edición de estudiantes
    - `js/panels/crear-seccion/` - Panel de creación de secciones
    - `js/panels/usuarios/` - Panel de usuarios
    - `js/panels/configuracion-inicial/` - Panel de configuración inicial
    - `js/panels/matriz/` - Panel de matriz de calificaciones
- Carga diferida:
  - Los paneles navegables se cargan vía `js/core/routing.js`.
  - Cada panel se carga desde su ruta `js/panels/[panel-name]/principal.js`.
  - `configuracion-inicial/principal.js` se carga de forma explícita en el arranque porque expone guardas y utilidades usadas fuera del flujo de navegación.
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
  - `scripts/migrate-panels.sh` - Script para migrar paneles a nueva estructura
  - `scripts/fix-imports.sh` - Script para actualizar rutas de importación
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

## Documentación
- `README.md` - Documentación general del sistema
- `LEARNING_GUIDE.md` - Guía de aprendizaje para nuevos desarrolladores
- `PROJECT_STRUCTURE.md` - Esta estructura detallada
- `FIREBASE_AUTH_SETUP.md` - Configuración de Firebase Auth
- `FIREBASE_SETUP.md` - Configuración de Firebase
- `DEPLOY_AUTOMATICO.md` - Guía de despliegue
- Panel `README.md` - Documentación específica de cada panel

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
- La app está modularizada por dominio, con cada panel en su propia carpeta.
- Cada panel sigue una estructura estándar: `principal.js`, `components/`, `utils/`, `types/`, `README.md`.
- Si agregas un panel navegable nuevo:
  1. Crea la carpeta del panel con estructura estándar
  2. Implementa `principal.js` con la función principal
  3. Crea componentes y utilidades según sea necesario
  4. Agrega `README.md` con documentación
  5. Registra su ruta y su cargador diferido en `js/core/routing.js`
- Si agregas una utilidad requerida por HTML inline o modales globales, documenta por qué debe exponerse en `window` y hazlo desde `js/core/legacy-bridge.js` o desde un `utils/actions.js` del panel responsable.
- Los componentes van en `components/`, las utilidades en `utils/`, y los tipos en `types/`.

## Deploy recomendado
- Un solo comando:
  - `./scripts/deploy.sh`
- Variables opcionales:
  - `FIREBASE_CONFIG=./firebase.json ./scripts/deploy.sh`
