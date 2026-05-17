# Compatibilidad del backend

El backend Express vive ahora en `apps/api`.

Esta carpeta se conserva temporalmente para no romper comandos antiguos como:

- `npm --prefix server run check`
- `cd server && npm run smoke`

Los scripts delegan a `apps/api`. No agregues código nuevo aquí.
