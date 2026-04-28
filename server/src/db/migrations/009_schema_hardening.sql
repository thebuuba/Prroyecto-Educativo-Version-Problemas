ALTER TABLE IF EXISTS users
  DROP CONSTRAINT IF EXISTS users_auth_provider_uid_key;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_auth_provider_uid_unique
  ON users(auth_provider_uid)
  WHERE auth_provider_uid IS NOT NULL;

ALTER TABLE IF EXISTS users
  DROP CONSTRAINT IF EXISTS users_status_check,
  ADD CONSTRAINT users_status_check CHECK (status IN ('active', 'disabled', 'pending'));

ALTER TABLE IF EXISTS school_memberships
  DROP CONSTRAINT IF EXISTS school_memberships_role_check,
  ADD CONSTRAINT school_memberships_role_check CHECK (role IN ('teacher', 'Docente', 'Coordinador', 'Dirección', 'Direccion', 'admin', 'owner')),
  DROP CONSTRAINT IF EXISTS school_memberships_status_check,
  ADD CONSTRAINT school_memberships_status_check CHECK (status IN ('active', 'inactive', 'disabled', 'pending'));

ALTER TABLE IF EXISTS students
  DROP CONSTRAINT IF EXISTS students_status_check,
  ADD CONSTRAINT students_status_check CHECK (status IN ('active', 'inactive', 'retired', 'new'));

ALTER TABLE IF EXISTS attendance_records
  DROP CONSTRAINT IF EXISTS attendance_records_status_check,
  ADD CONSTRAINT attendance_records_status_check CHECK (status IN ('P', 'A', 'E', 'R'));

ALTER TABLE IF EXISTS activities
  DROP CONSTRAINT IF EXISTS activities_points_check,
  ADD CONSTRAINT activities_points_check CHECK (points >= 0);

ALTER TABLE IF EXISTS evaluations
  DROP CONSTRAINT IF EXISTS evaluations_score_check,
  ADD CONSTRAINT evaluations_score_check CHECK (score >= 0),
  DROP CONSTRAINT IF EXISTS evaluations_score_percent_check,
  ADD CONSTRAINT evaluations_score_percent_check CHECK (score_percent IS NULL OR (score_percent >= 0 AND score_percent <= 100));

ALTER TABLE IF EXISTS teacher_schedule_segments
  DROP CONSTRAINT IF EXISTS teacher_schedule_segments_weekday_check,
  ADD CONSTRAINT teacher_schedule_segments_weekday_check CHECK (weekday BETWEEN 0 AND 6),
  DROP CONSTRAINT IF EXISTS teacher_schedule_segments_time_check,
  ADD CONSTRAINT teacher_schedule_segments_time_check CHECK (start_time < end_time);

ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS school_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS students ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS workspace_state_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS teacher_planner_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS teacher_schedule_segments ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
