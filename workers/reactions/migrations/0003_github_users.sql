-- Comments need a GitHub sign-in, so each one belongs to a user. Production had no comments when
-- this ran, so the comments table is rebuilt instead of migrated.
-- blocked = 1 hides every comment of a user and refuses new ones (README, Moderate comments).
CREATE TABLE users (
  github_id INTEGER PRIMARY KEY,
  login TEXT NOT NULL,
  name TEXT,
  blocked INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

DROP TABLE comments;

-- hidden = 1 removes one comment from the page without deleting it (README, Moderate comments).
CREATE TABLE comments (
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users (github_id),
  body TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  hidden INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX comments_by_post ON comments (slug, hidden, created_at);
