-- Índices compuestos para los filtros más frecuentes de la API Express.
-- Mantener idempotente para despliegues repetidos en Supabase PostgreSQL.

CREATE INDEX IF NOT EXISTS idx_school_memberships_school_user_status
  ON school_memberships(school_id, user_id, status);

CREATE INDEX IF NOT EXISTS idx_school_memberships_user_status
  ON school_memberships(user_id, status);

CREATE INDEX IF NOT EXISTS idx_sections_school_grade_teacher
  ON sections(school_id, grade_id, teacher_user_id);

CREATE INDEX IF NOT EXISTS idx_students_school_section_owner_name
  ON students(school_id, section_id, owner_user_id, last_name, first_name);

CREATE INDEX IF NOT EXISTS idx_activities_school_section_period_teacher
  ON activities(school_id, section_id, period_id, teacher_user_id);

CREATE INDEX IF NOT EXISTS idx_evaluations_school_section_period_owner
  ON evaluations(school_id, section_id, period_id, owner_user_id);

CREATE INDEX IF NOT EXISTS idx_attendance_school_section_owner_date
  ON attendance_records(school_id, section_id, owner_user_id, attendance_date);
