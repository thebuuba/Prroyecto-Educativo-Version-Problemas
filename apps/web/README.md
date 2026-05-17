# AulaBase Web

Aplicación frontend Vite de AulaBase/EduGest.

## Estado actual

La configuración de Vite vive en `apps/web/vite.config.js`. CSS global, assets públicos y la entrada principal `src/page-entry/root.ts` ya viven en `apps/web/`, pero parte del runtime del frontend sigue siendo temporalmente el root del repositorio para mantener compatibilidad con:

- `index.html`
- `js/`
- `sections/`
- `login-registro-auth/`

Adaptadores activos:

- `/styles.css` sigue resolviendo por el archivo raíz `styles.css`, que importa `apps/web/styles.css`.
- `/assets/...` se sirve desde `apps/web/public` mediante `publicDir` en Vite.
- `/js/page-entry/root.ts` sigue existiendo como adaptador hacia `apps/web/src/page-entry/root.ts`.

Mover esos directorios físicamente a `apps/web/` queda para la siguiente fase, cuando se actualicen los imports absolutos, el ensamblado de `index.html` y las referencias HTML inline.

## Próxima fase segura

1. Crear aliases de compatibilidad (`/js`, `/styles`, `/sections`, `/login-registro-auth`).
2. Mover `login-registro-auth/` o `sections/` solo cuando el ensamblado HTML pueda resolver adaptadores.
3. Mover paneles por dominio, validando `npm run build` después de cada grupo.
4. Mantener `index.html` raíz como adaptador hasta que Vercel y scripts apunten a `apps/web`.
