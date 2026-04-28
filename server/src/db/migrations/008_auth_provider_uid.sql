DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'firebase_uid'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'auth_provider_uid'
  ) THEN
    ALTER TABLE users RENAME COLUMN firebase_uid TO auth_provider_uid;
  END IF;
END $$;

ALTER TABLE IF EXISTS users
  ADD COLUMN IF NOT EXISTS auth_provider_uid TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_auth_provider_uid_unique
  ON users(auth_provider_uid)
  WHERE auth_provider_uid IS NOT NULL;
