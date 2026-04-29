# AulaBase SQL API

Backend de AulaBase/EduGest para sincronizar contra Supabase PostgreSQL. Esta API es la capa oficial de datos cloud.

## Inicio rapido

1. Copia `.env.example` a `.env`.
2. Para desarrollo local, levanta PostgreSQL:
   - `docker compose up -d postgres`
   Para nube, usa el `DATABASE_URL` del proyecto Supabase.
3. Instala dependencias:
   - `cd server && npm install`
4. Ejecuta la migracion:
   - `npm run migrate`
5. Arranca la API:
   - `npm run dev`
6. Ejecuta smoke test de API + DB:
   - `npm run smoke`

## Endpoints iniciales

- `GET /health`
- `GET /api/users`
- `POST /api/users`
- `GET /api/schools`
- `POST /api/schools`
- `GET /api/grades`
- `POST /api/grades`
- `GET /api/sections`
- `POST /api/sections`
- `GET /api/students`
- `POST /api/students`

## Notas

- El frontend usa Supabase Auth como proveedor cloud.
- Para conectar Supabase Postgres, configura `DATABASE_URL` con el connection string del proyecto y `DATABASE_SSL=true`.
- En producción, configura `VITE_API_URL` con la URL pública de esta API. Si falta, el frontend no intentará sincronizar contra `127.0.0.1:4000`.
- Si despliegas la API en Render, `render.yaml` espera que `DATABASE_URL` sea el connection string de Supabase. No crea una base Postgres paralela en Render.
- Configura también `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `JWT_SECRET` y `CORS_ORIGIN` en el entorno de producción.
- En producción, la API falla al arrancar si falta `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `JWT_SECRET` o `CORS_ORIGIN`.
- `npm run migrate` aplica `schema.sql` y las migraciones idempotentes contra la base configurada en `DATABASE_URL`.
