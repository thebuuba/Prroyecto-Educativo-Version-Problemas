# Supabase Database

Contiene el esquema y migraciones SQL compatibles con Supabase PostgreSQL.

- `schema.sql`: esquema base idempotente.
- `migrations/`: migraciones incrementales idempotentes.
- `seed.sql`: reservado para datos semilla no sensibles.

La API ejecuta estos archivos desde `apps/api/src/db/migrate.js`.
