-- The count follows each like and unlike inside the same statement, so a like costs a few rows,
-- not one row per like the post already has.
CREATE TRIGGER likes_insert AFTER INSERT ON likes BEGIN
  INSERT INTO post_stats (slug, likes) VALUES (NEW.slug, 1) ON CONFLICT (slug) DO UPDATE SET likes = likes + 1;
END;

CREATE TRIGGER likes_delete AFTER DELETE ON likes BEGIN
  UPDATE post_stats SET likes = MAX(0, likes - 1) WHERE slug = OLD.slug;
END;
