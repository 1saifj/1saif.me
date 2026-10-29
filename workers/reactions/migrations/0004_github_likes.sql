-- A like needs a GitHub sign-in now, so each account likes a post at most once. The likes made with a
-- browser ID name no account, so they go, and every count starts again from zero.
DROP TABLE likes;

CREATE TABLE likes (
  slug TEXT NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users (github_id),
  created_at INTEGER NOT NULL,
  PRIMARY KEY (slug, user_id)
) WITHOUT ROWID;

DELETE FROM post_stats;

-- Dropping the table dropped its triggers; these are the ones from 0002.
CREATE TRIGGER likes_insert AFTER INSERT ON likes BEGIN
  INSERT INTO post_stats (slug, likes) VALUES (NEW.slug, 1) ON CONFLICT (slug) DO UPDATE SET likes = likes + 1;
END;

CREATE TRIGGER likes_delete AFTER DELETE ON likes BEGIN
  UPDATE post_stats SET likes = MAX(0, likes - 1) WHERE slug = OLD.slug;
END;
