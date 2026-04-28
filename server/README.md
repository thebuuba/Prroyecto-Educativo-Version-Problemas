# AulaBase SQL API

Backend inicial para usar AulaBase/EduGest con PostgreSQL, compatible con Supabase.

## Inicio rapido

1. Copia `.env.example` a `.env`.
2. Levanta PostgreSQL:
   - `docker compose up -d postgres`
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
