-- content is the visit's utm_content tag: which link of a campaign started it, such as one of two posts that share the
-- campaign. Rows from before this column have ''.
ALTER TABLE views ADD COLUMN content TEXT NOT NULL DEFAULT '';
