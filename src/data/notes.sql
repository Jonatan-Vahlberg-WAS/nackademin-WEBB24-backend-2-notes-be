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

INSERT INTO notes (title, content, is_pinned, user_id) VALUES
('Morning Ideas', 'Write three new blog topics over coffee.', FALSE, NULL),
('Grocery List', 'Eggs, oat milk, spinach, frozen berries.', FALSE, NULL),
('Pinned Inspiration', '“Stay hungry, stay foolish.” – Steve Jobs', TRUE, NULL),
('Workout Plan', 'Monday: Push\nWednesday: Pull\nFriday: Legs', FALSE, NULL),
('Book Notes', 'Notes from “Atomic Habits”: focus on identity, not outcomes.', FALSE, NULL),
('Weekend Project', 'Build a simple note app using Hono + PostgreSQL.', TRUE, NULL),
('Recipe Draft', 'Homemade ramen broth – slow simmer 4 hours.', FALSE, NULL),
('Travel Bucket List', 'Japan, Iceland, New Zealand, Peru, Norway.', FALSE, NULL),
('Pinned Reminder', 'Back up the database every Sunday night.', TRUE, NULL),
('Random Thoughts', 'What if reminders could auto-pin based on urgency?', FALSE, NULL);

create policy "notes_access_for_owner"
on public.notes
for ALL
using ( user_id = auth.uid());

create policy "notes_select_for_admin"
on public.notes
for select
using ( public.is_current_user_admin() );