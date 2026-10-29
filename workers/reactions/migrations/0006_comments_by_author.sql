-- The daily cap counts one account's comments on one post in 24 hours. With comments_by_post alone, D1 read every
-- comment the post got in that time; this index reads only the account's own.
CREATE INDEX comments_by_author ON comments (slug, user_id, created_at);
