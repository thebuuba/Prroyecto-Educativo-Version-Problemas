CREATE TABLE IF NOT EXISTS workspace_state_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  block_key TEXT NOT NULL CHECK (block_key IN ('academics', 'assessment', 'planner')),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  payload_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (school_id, user_id, block_key)
);

CREATE INDEX IF NOT EXISTS idx_workspace_state_blocks_school_id
  ON workspace_state_blocks(school_id);
CREATE INDEX IF NOT EXISTS idx_workspace_state_blocks_user_id
  ON workspace_state_blocks(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_state_blocks_block_key
  ON workspace_state_blocks(block_key);
