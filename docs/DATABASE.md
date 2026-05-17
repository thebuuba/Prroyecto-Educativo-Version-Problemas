# Database

## Ubicación

- `supabase/schema.sql`: esquema base.
- `supabase/migrations/*.sql`: migraciones idempotentes.
- `supabase/seed.sql`: datos semilla no sensibles.
- `apps/api/src/db/migrate.js`: aplica schema y migraciones.

## Tablas principales

- `users`: usuarios locales o sincronizados con Supabase Auth.
- `user_profiles`: perfil docente.
- `user_settings`: preferencias.
- `user_sessions`: sesiones locales con hash de token.
- `schools`: instituciones.
- `school_memberships`: permisos por institución.
- `grades`: grados/cursos.
- `sections`: secciones/asignaturas.
- `students`: estudiantes.
- `activities`: actividades evaluables.
- `evaluations`: resultados por estudiante/actividad.
- `attendance_records`: asistencia.
- `workspace_state_blocks`: bloques JSON de estado por usuario/institución.
- `teacher_planner_events`: planificación/calendario docente.
- `teacher_schedule_segments`: segmentos de horario.

## Seguridad Supabase

La migración `009_schema_hardening.sql`:

- habilita RLS en tablas públicas principales
- revoca acceso a `anon` y `authenticated`

La API Express accede por `DATABASE_URL`. Si más adelante se exponen tablas por Supabase Data API, se deben crear políticas RLS explícitas antes de otorgar permisos.

## Índices

Índices existentes cubren claves primarias, foráneas y búsquedas simples.

La migración `011_query_path_indexes.sql` agrega índices compuestos para rutas frecuentes:

- membresía por `school_id`, `user_id`, `status`
- secciones por `school_id`, `grade_id`, `teacher_user_id`
- estudiantes por `school_id`, `section_id`, `owner_user_id`, nombre
- actividades por `school_id`, `section_id`, `period_id`, `teacher_user_id`
- evaluaciones por `school_id`, `section_id`, `period_id`, `owner_user_id`
- asistencia por `school_id`, `section_id`, `owner_user_id`, `attendance_date`

Revisión de esta fase: no se agregaron índices nuevos. La ruta backend movida (`schools`) usa `school_memberships.user_id/status` y `school_id`; esa consulta queda cubierta por los índices existentes del esquema y por `011_query_path_indexes.sql`.

## Reglas para nuevas migraciones

1. Usar `CREATE ... IF NOT EXISTS` o `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`.
2. No incluir datos sensibles.
3. Mantener compatibilidad con PostgreSQL/Supabase.
4. Validar con `npm --prefix apps/api run migrate` contra una base local antes de producción.
5. Si se agregan vistas en schemas expuestos, usar `security_invoker = true` en Postgres 15+ o revocar permisos.
