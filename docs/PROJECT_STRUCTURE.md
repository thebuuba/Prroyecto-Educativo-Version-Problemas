# Estructura del Proyecto (Fuente de Verdad)

Este proyecto se mantiene por secciones para localizar errores rápido por panel.

## HTML
- Fuente del shell: `sections/shell/*.html`
  - `head.html`
  - `chrome.html`
  - `runtime-footer.html`
- Fuente de modales por panel:
  - `sections/panels/estudiantes/modals.html`
  - `sections/panels/actividades/modals.html`
  - `sections/panels/instrumentos/modals.html`
  - `sections/panels/horario/modals.html`
  - `js/panels/configuracion-inicial/html/setup-profile-modal.html`
- Autenticación real: `login-registro-auth/`
- Ensamblado final: `index.html`
- Script: `scripts/assemble-index-html.sh`

## JS
- Fuente principal actual:
  - `js/core/*.js`: estado global, routing, hidratación, shell, utilidades y APIs.
  - `js/panels/*/`: cada panel en su propia carpeta con estructura estándar.
  - `js/page-entry/root.js`: punto de entrada raíz para Vite.
- Arquitectura real del runtime:
  - `js/page-entry/root.js`: puente principal entre módulos ES y el legado basado en `window`.
  - `js/page-entry/root.js` es el único inicializador de auth/setup dentro del runtime moderno.
  - `js/core/app.js`: arranque de la aplicación.
  - `js/core/legacy-bridge.js`: encapsula la compatibilidad legacy y la exposición controlada a `window`.
  - `js/core/hydration.js`: facade de hidratación y restauración inicial.
  - `js/core/hydration/*.js`: persistencia con debounce, flujo de sesión/logout y normalización académica.
  - `js/core/hydration-session.js`: storage local, workspace privado y helpers de sesión.
  - `js/core/routing.js`: navegación y carga diferida de paneles.
  - `js/core/utils.js`: barrel de utilidades; la implementación vive en `js/core/utils/*.js`.
  - `js/core/api-sql.js`: facade y orquestador de SQL académico.
  - `js/core/api-sql/*.js`: cliente HTTP, auth, contexto académico, endpoints, bloques de estado, asistencia y sync de actividades.
- Estructura de paneles (NUEVA - Carpetas en español, archivos internos en inglés):
  - Cada panel tiene su propia carpeta con estructura estándar:
    ```
    panel-name/
    ├── principal.js              # Archivo principal del panel
    ├── components/               # Componentes UI reutilizables
    ├── html/                     # Fragmentos HTML propios del panel, cuando aplica
    ├── styles/                   # CSS propio del panel, cuando aplica
    ├── utils/                    # Utilidades específicas del panel
    │   ├── actions.js          # Acciones y lógica de negocio
    │   ├── model.js            # Modelos de datos
    │   └── support.js           # Funciones de soporte
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
  - `principal.js` debe ser pequeño: registra renderizadores, instala acciones y delega el HTML a `components/vista.js` cuando el panel tenga una vista grande.
  - `configuracion-inicial/principal.js` se carga de forma explícita en el arranque porque expone guardas y utilidades usadas fuera del flujo de navegación.
- Compatibilidad heredada:
  - El proyecto todavía expone funciones a `window` para mantener compatibilidad con HTML inline y flujos legacy.
  - Esa capa de compatibilidad se registra desde `js/core/legacy-bridge.js`, agrupada por dominio, y se activa en `js/page-entry/root.js`.
  - El HTML no carga wrappers legacy de config/db/cloud/sql; el bridge publica `EduGestConfig`, `EduGestDB`, `EduGestCloud` y `AulaBaseSqlApi`.
- Artefactos generados:
  - `dist/**`
- Scripts auxiliares:
  - `scripts/assemble-all.sh`
  - `scripts/assemble-index-html.sh`
  - `scripts/deploy.sh`

## CSS
- Entrada: `styles.css`
- Capas:
  - `styles/01-base.css` como manifest de `styles/base/*.css`
  - `styles/02-auth.css`
  - `styles/03-app-panels.css`
  - `styles/04-ui-overrides.css` como manifest de `styles/overrides/*.css`
- Estilos de paneles:
  - Compartidos: `js/panels/shared/styles/*.css`
  - Por panel: `js/panels/<panel>/styles/*.css`
- Manifest global de paneles: `styles/03-app-panels.css`
- Autenticación:
  - `login-registro-auth/auth.css` es el manifest de auth.
  - `login-registro-auth/login/styles/*.css` divide la pantalla de inicio por base, marca, formulario, footer y responsive.
  - La lógica vive en `js/panels/autenticacion/principal.js` y `js/panels/autenticacion/utils/*.js`.

## Documentación
- `README.md` - Documentación general del sistema
- `docs/LEARNING_GUIDE.md` - Guía de aprendizaje para nuevos desarrolladores
- `docs/PROJECT_STRUCTURE.md` - Esta estructura detallada
- `docs/FIREBASE_AUTH_SETUP.md` - Configuración de Firebase Auth
- `docs/FIREBASE_SETUP.md` - Configuración de Firebase
- `docs/DEPLOY_AUTOMATICO.md` - Guía de despliegue
- Panel `README.md` - Documentación específica de cada panel

## Flujo recomendado
1. Editar solo archivos fuente (`sections`, `login-registro-auth`, `js/core`, `js/panels`, `js/page-entry`, `styles`, `server/src`).
2. Ejecutar ensamblado:
   - `npm run assemble`
3. Validar frontend y backend:
   - `npm run check`
## Nota
`dist/*` se considera artefacto generado y no se versiona.

`js/page-entry/root.js` forma parte de la arquitectura fuente actual y puede editarse cuando sea necesario para el arranque o la integración entre módulos.

## Modularidad
- La app está modularizada por dominio, con cada panel en su propia carpeta.
- Cada panel sigue una estructura estándar según necesidad: `principal.js`, `components/`, `utils/`, `styles/`, `html/`, `README.md`.
- Si agregas un panel navegable nuevo:
  1. Crea la carpeta del panel.
  2. Implementa `principal.js` como punto de entrada pequeño.
  3. Crea `components/`, `utils/`, `styles/` o `html/` solo cuando haya archivos reales.
  4. Agrega `README.md` con documentación
  5. Registra su ruta y su cargador diferido en `js/core/routing.js`
- Si agregas una utilidad requerida por HTML inline o modales globales, documenta por qué debe exponerse en `window` y hazlo desde `js/core/legacy-bridge.js` o desde un `utils/actions.js` del panel responsable.
- Los componentes van en `components/`, las utilidades en `utils/`, los estilos del panel en `styles/` y los fragmentos HTML propios en `html/`.

## Deploy recomendado
- Un solo comando:
  - `npm run deploy`
- Variables opcionales:
  - `FIREBASE_CONFIG=./firebase.json npm run deploy`
