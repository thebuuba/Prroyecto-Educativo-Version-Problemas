# Revisión de Organización

## Estado actual

El proyecto ya tiene una base buena: la lógica principal vive en `js/core/` y los paneles están separados en `js/panels/<panel>/`. El build moderno con Vite funciona.

La fuente de verdad de datos cloud es Supabase SQL/PostgreSQL mediante `server/` y `js/core/api-sql/`.

## Ajustes aplicados

- HTML del shell movido a `sections/shell/`.
- Modales HTML movidos por dueño a `sections/panels/<panel>/` o al panel correspondiente en `js/panels/`.
- CSS específico movido junto a sus paneles en `js/panels/<panel>/styles/`.
- CSS compartido de paneles movido a `js/panels/shared/styles/`.
- `styles/03-app-panels.css` quedó como manifest único de importación.
- `styles/01-base.css` y `styles/04-ui-overrides.css` quedaron como manifests; sus reglas viven en `styles/base/` y `styles/overrides/`.
- El CSS del login se dividió en `login-registro-auth/login/styles/` por base, marca, formulario, footer y responsive.
- La autenticación se separó en utilidades de modo visual, sesión, eventos y soporte dentro de `js/panels/autenticacion/utils/`.
- `js/core/utils.js` quedó como barrel de compatibilidad y sus dominios se movieron a `js/core/utils/`.
- `js/core/api-sql.js` quedó como facade/orquestador y delega cliente HTTP, auth SQL, contexto, endpoints, bloques de estado, asistencia y actividades a `js/core/api-sql/`.
- `js/core/hydration.js` quedó como facade; persistencia, flujo de sesión/logout y normalización académica viven en `js/core/hydration/`.
- El calendario académico predeterminado quedó centralizado en `js/core/constants.js`; `config.js` e hidratación lo reutilizan.
- Se eliminaron los wrappers legacy de runtime (`js/config.js`, `js/db.js`, `js/cloud.js`, `js/sql-api.js`). Sus APIs globales salen ahora desde `js/core/legacy-bridge.js`.
- `js/core/legacy-bridge.js` organiza las funciones globales por dominio y reduce logs de render innecesarios.
- `js/auth-init.js` se eliminó porque `js/page-entry/root.js` ya inicializa autenticación y setup.
- Se retiraron logs de desarrollo (`console.log`) del runtime para dejar la consola enfocada en errores, warnings y depuración explícita.
- `scripts/assemble-all.sh` ya no llama scripts inexistentes.
- `scripts/assemble-index-html.sh` ensambla `index.html` desde los fragmentos organizados.
- Se eliminaron páginas HTML auto-generadas de ruta en la raíz (`estudiantes/index.html`, `reportes/index.html`, etc.). La app moderna usa `index.html` con rewrites del hosting.
- Se eliminaron placeholders legacy de autenticación en `sections/auth`.
- Se eliminaron scripts de migración antiguos con rutas absolutas.
- Se eliminaron carpetas vacías (`types/`, `utils/`, `components/`) que no tenían archivos reales.
- `package.json` ahora expone comandos claros: `assemble`, `check`, `backend:check`, `backend:smoke` y `prepare:dist`.
- Se eliminó el subproyecto `web-legacy` y el flujo `hosting-live`; el camino oficial es Vite -> `dist/` -> hosting estático elegido.
- Los paneles grandes separan entrada, vista y acciones:
  - `principal.js`: registra el panel y conecta acciones.
  - `components/vista.js`: contiene el HTML dinámico y renderizado.
  - `utils/actions.js`: contiene handlers y lógica de interacción cuando aplica.
- Los archivos duplicados/legacy de auth (`login/auth.js`, `registro/auth.js` y copias locales de `api-cloud.js`) se eliminaron. La integración oficial con Supabase vive en `js/core/api-cloud.js`.

## Convención recomendada por panel

```text
js/panels/nombre-del-panel/
├── principal.js
├── components/
├── html/
├── styles/
├── utils/
└── README.md
```

Si un panel no tiene HTML o CSS propio, no necesita crear carpetas vacías. La regla es simple: cada archivo debe vivir con el panel o sección que lo posee.

## Carpetas que no conviene editar directamente

- `dist/`
- `node_modules/`

Estas carpetas son salida de build, despliegue o dependencias.
