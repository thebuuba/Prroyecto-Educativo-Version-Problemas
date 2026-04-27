# Revisión de Organización

## Estado actual

El proyecto ya tiene una base buena: la lógica principal vive en `js/core/` y los paneles están separados en `js/panels/<panel>/`. El build moderno con Vite funciona.

## Ajustes aplicados

- HTML del shell movido a `sections/shell/`.
- Modales HTML movidos por dueño a `sections/panels/<panel>/` o al panel correspondiente en `js/panels/`.
- CSS específico movido junto a sus paneles en `js/panels/<panel>/styles/`.
- CSS compartido de paneles movido a `js/panels/shared/styles/`.
- `styles/03-app-panels.css` quedó como manifest único de importación.
- `scripts/assemble-all.sh` ya no llama scripts inexistentes.
- `scripts/assemble-index-html.sh` ensambla `index.html` desde los fragmentos organizados.
- Se eliminaron páginas HTML auto-generadas de ruta en la raíz (`estudiantes/index.html`, `reportes/index.html`, etc.). La app moderna usa `index.html` con rewrites del hosting.
- Se eliminaron placeholders legacy de autenticación en `sections/auth`.
- Se eliminaron scripts de migración antiguos con rutas absolutas.
- Se eliminaron carpetas vacías (`types/`, `utils/`, `components/`) que no tenían archivos reales.
- `package.json` ahora expone comandos claros: `assemble`, `check`, `backend:check` y `deploy`.
- Se eliminó el subproyecto `web-legacy` y el flujo `hosting-live`; el camino oficial es Vite -> `dist/` -> Firebase Hosting.
- Los paneles grandes separan entrada, vista y acciones:
  - `principal.js`: registra el panel y conecta acciones.
  - `components/vista.js`: contiene el HTML dinámico y renderizado.
  - `utils/actions.js`: contiene handlers y lógica de interacción cuando aplica.

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
