-- An author can edit their own comment. edited_at is the time of the last edit (NULL for none), and edits
-- caps the edits of one comment, because each edit mails Saif.
ALTER TABLE comments ADD COLUMN edited_at INTEGER;

ALTER TABLE comments ADD COLUMN edits INTEGER NOT NULL DEFAULT 0;
