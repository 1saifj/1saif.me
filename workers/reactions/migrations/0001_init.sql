-- One row per visitor who likes a post. The visitor is a random ID the browser made, not a person.
CREATE TABLE likes (
  slug TEXT NOT NULL,
  visitor TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (slug, visitor)
) WITHOUT ROWID;

-- The like count per post, recounted from likes on every change, so a read never counts rows.
CREATE TABLE post_stats (
  slug TEXT PRIMARY KEY,
  likes INTEGER NOT NULL DEFAULT 0
);

-- hidden = 1 removes a comment from the page without deleting it (README, Hide a comment).
CREATE TABLE comments (
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  hidden INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX comments_by_post ON comments (slug, hidden, created_at);
