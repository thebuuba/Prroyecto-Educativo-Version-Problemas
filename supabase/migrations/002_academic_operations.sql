CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  teacher_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  period_id TEXT NOT NULL DEFAULT 'P1',
  block_key TEXT,
  name TEXT NOT NULL,
  description TEXT,
  points NUMERIC(8, 2) NOT NULL DEFAULT 0,
  activity_type TEXT,
  scheduled_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  period_id TEXT NOT NULL DEFAULT 'P1',
  score NUMERIC(8, 2) NOT NULL DEFAULT 0,
  score_percent NUMERIC(8, 2),
  notes TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (activity_id, student_id, period_id)
);

CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  status TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, attendance_date)
);

CREATE TABLE IF NOT EXISTS teacher_planner_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  teacher_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_date DATE NOT NULL,
  title TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'custom',
  source_label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS teacher_schedule_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  teacher_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  weekday SMALLINT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  title TEXT NOT NULL,
  section_id UUID REFERENCES sections(id) ON DELETE SET NULL,
  subject_name TEXT,
  room_label TEXT,
  shift_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activities_school_id ON activities(school_id);
CREATE INDEX IF NOT EXISTS idx_activities_section_id ON activities(section_id);
CREATE INDEX IF NOT EXISTS idx_activities_period_id ON activities(period_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_student_id ON evaluations(student_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_activity_id ON evaluations(activity_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_period_id ON evaluations(period_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_student_id ON attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_section_id ON attendance_records(section_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_attendance_date ON attendance_records(attendance_date);
CREATE INDEX IF NOT EXISTS idx_teacher_planner_events_teacher_user_id ON teacher_planner_events(teacher_user_id);
CREATE INDEX IF NOT EXISTS idx_teacher_planner_events_event_date ON teacher_planner_events(event_date);
CREATE INDEX IF NOT EXISTS idx_teacher_schedule_segments_teacher_user_id ON teacher_schedule_segments(teacher_user_id);
CREATE INDEX IF NOT EXISTS idx_teacher_schedule_segments_weekday ON teacher_schedule_segments(weekday);
