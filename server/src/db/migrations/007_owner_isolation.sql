ALTER TABLE IF EXISTS grades
  ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS students
  ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS attendance_records
  ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS evaluations
  ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_grades_owner_user_id ON grades(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_students_owner_user_id ON students(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_owner_user_id ON attendance_records(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_owner_user_id ON evaluations(owner_user_id);
