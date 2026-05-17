ALTER TABLE IF EXISTS grades
  DROP CONSTRAINT IF EXISTS grades_school_id_education_level_name_key;

ALTER TABLE IF EXISTS students
  DROP CONSTRAINT IF EXISTS students_enrollment_code_key;

DROP INDEX IF EXISTS idx_sections_grade_name_subject_unique;
DROP INDEX IF EXISTS idx_grades_school_owner_level_name_unique;
DROP INDEX IF EXISTS idx_grades_school_level_name_shared_unique;
DROP INDEX IF EXISTS idx_sections_grade_teacher_name_subject_unique;
DROP INDEX IF EXISTS idx_sections_grade_name_subject_shared_unique;
DROP INDEX IF EXISTS idx_students_school_owner_enrollment_unique;
DROP INDEX IF EXISTS idx_students_school_enrollment_shared_unique;

CREATE UNIQUE INDEX IF NOT EXISTS idx_grades_school_owner_level_name_unique
  ON grades (school_id, owner_user_id, education_level, name)
  WHERE owner_user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_grades_school_level_name_shared_unique
  ON grades (school_id, education_level, name)
  WHERE owner_user_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_sections_grade_teacher_name_subject_unique
  ON sections (grade_id, teacher_user_id, name, COALESCE(subject_name, ''))
  WHERE teacher_user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_sections_grade_name_subject_shared_unique
  ON sections (grade_id, name, COALESCE(subject_name, ''))
  WHERE teacher_user_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_students_school_owner_enrollment_unique
  ON students (school_id, owner_user_id, enrollment_code)
  WHERE owner_user_id IS NOT NULL AND enrollment_code IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_students_school_enrollment_shared_unique
  ON students (school_id, enrollment_code)
  WHERE owner_user_id IS NULL AND enrollment_code IS NOT NULL;
