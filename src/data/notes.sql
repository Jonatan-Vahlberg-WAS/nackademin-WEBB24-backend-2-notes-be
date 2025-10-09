CREATE TABLE notes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT        NOT NULL,
  content    TEXT        NOT NULL,
  is_pinned  BOOLEAN     NOT NULL DEFAULT FALSE,
  user_id    UUID        NULL,
  created_at TIMESTAMP   NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- Optional indexes for performance
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_is_pinned ON notes(is_pinned);