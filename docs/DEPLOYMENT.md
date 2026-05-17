# Deployment

## Frontend Vercel

Build:

```bash
npm run prepare:dist
```

Salida:

```text
dist/
```

Variables frontend:

```text
VITE_API_URL=https://tu-api.onrender.com
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_tu_clave_publica
```

No configurar claves privadas ni `service_role` en Vercel para el frontend.

## Backend Render

`render.yaml` apunta a `apps/api`:

```text
buildCommand: cd apps/api && npm install
startCommand: cd apps/api && npm run migrate && npm run start
```

Variables backend obligatorias en producción:

```text
NODE_ENV=production
DATABASE_URL=...
DATABASE_SSL=true
SUPABASE_URL=...
SUPABASE_PUBLISHABLE_KEY=...
JWT_SECRET=...
CORS_ORIGIN=https://tu-frontend.vercel.app
AUTH_COOKIE_SECURE=true
AUTH_COOKIE_SAMESITE=none
```

## Desarrollo local

Postgres:

```bash
docker compose up -d postgres
```

El compose local publica Postgres en `localhost:5433`.

API:

```bash
cd apps/api
npm install
npm run migrate
npm run dev
```

Web:

```bash
npm install
npm run dev
```

## Seguridad de cookies

- Producción cross-site: `AUTH_COOKIE_SECURE=true`, `AUTH_COOKIE_SAMESITE=none`.
- Desarrollo local: `AUTH_COOKIE_SECURE=false`, `AUTH_COOKIE_SAMESITE=lax`.
- Las cookies de sesión se crean `httpOnly` desde `apps/api/src/middleware/auth.js`.
