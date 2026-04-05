# AulaBase SQL API

Backend inicial para migrar AulaBase desde almacenamiento local/Firestore hacia PostgreSQL.

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

- Esta primera version no reemplaza todavia Firebase del frontend.
- El objetivo es crear la base relacional y una API lista para migracion gradual.
