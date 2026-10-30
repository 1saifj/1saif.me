-- One random salt per day. A visitor ID is a hash of the day's salt, the IP address and the browser, so it changes
-- every day. The Worker deletes the salts of earlier days, so an old ID can never be matched to an IP address again.
CREATE TABLE salts (
  day TEXT PRIMARY KEY,
  salt TEXT NOT NULL
);

-- One row per visitor, page and day. The primary key is the table (WITHOUT ROWID) and there is no other index,
-- so a view writes one row. The first view of the day sets the details; later views add to the counts.
-- entry is 1 when a view of the row started a visit (it came from outside the site). channel, source, medium and
-- campaign tell where that visit came from: the campaign tags, a click ID's ad network (never the ID) or the
-- referrer's host. browser and os are families only, without versions. seconds is the time the page was visible,
-- scroll the deepest point read in percent, and lcp, inp, cls and ttfb the first measured speed; NULL is not measured.
CREATE TABLE views (
  day TEXT NOT NULL,
  page TEXT NOT NULL,
  visitor TEXT NOT NULL,
  hour INTEGER NOT NULL,
  entry INTEGER NOT NULL,
  channel TEXT NOT NULL,
  source TEXT NOT NULL,
  medium TEXT NOT NULL,
  campaign TEXT NOT NULL,
  language TEXT NOT NULL,
  country TEXT NOT NULL,
  device TEXT NOT NULL,
  browser TEXT NOT NULL,
  os TEXT NOT NULL,
  views INTEGER NOT NULL DEFAULT 1,
  seconds INTEGER NOT NULL,
  scroll INTEGER,
  lcp INTEGER,
  inp INTEGER,
  cls REAL,
  ttfb INTEGER,
  PRIMARY KEY (day, page, visitor)
) WITHOUT ROWID;
