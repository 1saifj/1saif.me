// Prints page views, likes, comments and Core Web Vitals from the Analytics Engine dataset that the
// reactions Worker writes (README, Insights). Needs CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN
// (Account Analytics: Read). Each run sends 11 SQL queries; the Free plan allows 10,000 a day.
//
//   npm run insights          # last 30 days
//   npm run insights -- 7     # last 7 days

const days = Number(process.argv[2] ?? 30)

const { CLOUDFLARE_ACCOUNT_ID: account, CLOUDFLARE_API_TOKEN: token } = process.env

// Analytics Engine keeps data for three months.
if (!Number.isInteger(days) || days < 1 || days > 90) {
  console.error('Days must be a whole number from 1 to 90.')
  process.exit(1)
}

if (!account || !token) {
  console.error('Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN (Account Analytics: Read).')
  process.exit(1)
}

// Pageviews: blob2 path, blob3 referrer host, blob4 language, blob5 country, blob6 device; double2-5 LCP, CLS, INP, TTFB.
// Reactions: index1 slug, blob2 country, blob3 language, blob4 rejection reason.
const from = `FROM post_reactions WHERE timestamp > NOW() - INTERVAL '${days}' DAY`

const views = `${from} AND blob1 = 'pageview'`

async function query(sql) {
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/analytics_engine/sql`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: `${sql} FORMAT JSON`,
  })

  if (!response.ok) throw new Error(`Analytics Engine answered ${response.status}: ${await response.text()}`)

  return (await response.json()).data
}

// Rows are sampled at high volume, so every count is SUM(_sample_interval), never COUNT().
const p75 = column => `SELECT index1 AS page, quantileExactWeighted(0.75)(${column}, _sample_interval) AS p75 ${views} AND ${column} >= 0 GROUP BY page`

const [events, referrers, viewLanguages, reactionLanguages, devices, countries, lcp, cls, inp, ttfb, daily] = await Promise.all([
  query(`SELECT index1 AS key, blob1 AS event, SUM(_sample_interval) AS n ${from} GROUP BY key, event`),
  query(`SELECT blob3 AS host, SUM(_sample_interval) AS n ${views} AND blob3 != '' GROUP BY host ORDER BY n DESC LIMIT 10`),
  query(`SELECT blob4 AS lang, SUM(_sample_interval) AS n ${views} GROUP BY lang`),
  query(`SELECT blob3 AS lang, SUM(_sample_interval) AS n ${from} AND blob1 != 'pageview' GROUP BY lang`),
  query(`SELECT blob6 AS device, SUM(_sample_interval) AS n ${views} GROUP BY device ORDER BY n DESC`),
  query(`SELECT index1 AS page, blob5 AS country, SUM(_sample_interval) AS n ${views} GROUP BY page, country`),
  query(p75('double2')),
  query(p75('double3')),
  query(p75('double4')),
  query(p75('double5')),
  query(`SELECT toStartOfInterval(timestamp, INTERVAL '1' DAY) AS day, SUM(_sample_interval) AS n ${views} GROUP BY day ORDER BY day`),
])

const count = (rows, test) => rows.filter(test).reduce((sum, row) => sum + Number(row.n), 0)

const percent = (part, whole) => whole ? `${Math.round((part / whole) * 100)}%` : '-'

const pad = (value, width) => String(value).padEnd(width)

const padNumber = (value, width) => String(value).padStart(width)

const topCountries = page => countries
  .filter(row => row.page === page)
  .sort((a, b) => Number(b.n) - Number(a.n))
  .slice(0, 3)
  .map(row => `${row.country || '??'} ${row.n}`)
  .join(', ')

const pageViews = page => count(events, row => row.key === page && row.event === 'pageview')

const totalViews = count(events, row => row.event === 'pageview')

console.log(`Last ${days} days\n`)

console.log('Daily page views')

const peak = Math.max(0, ...daily.map(row => Number(row.n)))

console.log(daily.map(row => '▁▂▃▄▅▆▇█'[Math.min(7, Math.floor((Number(row.n) / peak) * 8))]).join('') || '(none)')

console.log(`${totalViews} views in total, peak ${peak} a day\n`)

const pages = [...new Set(events.flatMap(row => row.event === 'pageview' ? [row.key] : []))].sort((a, b) => pageViews(b) - pageViews(a)).slice(0, 15)

const vital = (rows, page, digits) => {
  const value = rows.find(row => row.page === page)?.p75

  return value === undefined ? '-' : Number(value).toFixed(digits)
}

console.log('Top pages                                   views   LCP p75  INP p75  CLS p75  TTFB p75  countries')

for (const page of pages) console.log(`${pad(page.slice(0, 42), 42)} ${padNumber(pageViews(page), 6)}  ${padNumber(vital(lcp, page, 0), 7)}  ${padNumber(vital(inp, page, 0), 7)}  ${padNumber(vital(cls, page, 3), 7)}  ${padNumber(vital(ttfb, page, 0), 8)}  ${topCountries(page)}`)

const slugs = [...new Set(events.flatMap(row => row.key.startsWith('/') ? [] : [row.key]))]

const reaction = (slug, event) => count(events, row => row.key === slug && row.event === event)

console.log('\nPosts                                       views   likes  unlikes  comments  rejected  like rate')

for (const slug of slugs.sort((a, b) => reaction(b, 'like') - reaction(a, 'like'))) {
  const seen = pageViews(`/blog/${slug}`) + pageViews(`/ar/blog/${slug}`)

  console.log(`${pad(slug.slice(0, 42), 42)} ${padNumber(seen, 6)}  ${padNumber(reaction(slug, 'like'), 6)}  ${padNumber(reaction(slug, 'unlike'), 7)}  ${padNumber(reaction(slug, 'comment'), 8)}  ${padNumber(reaction(slug, 'comment_rejected'), 8)}  ${padNumber(percent(reaction(slug, 'like'), seen), 9)}`)
}

console.log(`\nTotals: ${totalViews} views, ${count(events, row => row.event === 'like')} likes, ${count(events, row => row.event === 'unlike')} unlikes, ${count(events, row => row.event === 'comment')} comments, ${count(events, row => row.event === 'comment_edited')} edits, ${count(events, row => row.event === 'comment_rejected')} rejected comments and edits`)

const split = rows => {
  const total = count(rows, () => true)

  return ['en', 'ar'].map(lang => `${lang.toUpperCase()} ${percent(count(rows, row => row.lang === lang), total)}`).join(' / ')
}

console.log(`Language: views ${split(viewLanguages)}, reactions ${split(reactionLanguages)}`)

console.log(`Devices: ${devices.map(row => `${row.device || 'unknown'} ${percent(Number(row.n), totalViews)}`).join(', ') || '-'}`)

const byCountry = new Map()

for (const row of countries) byCountry.set(row.country || '??', (byCountry.get(row.country || '??') ?? 0) + Number(row.n))

console.log(`Countries: ${[...byCountry].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([country, n]) => `${country} ${n}`).join(', ') || '-'}`)

console.log(`Referrers: ${referrers.map(row => `${row.host} ${row.n}`).join(', ') || '-'}`)

// The window starts and ends part-way through a day, so the line goes through the full days only.
const DAY = 86_400_000

const perDay = new Map(daily.map(row => [String(row.day).slice(0, 10), Number(row.n)]))

const series = Array.from({ length: days - 1 }, (_, i) => perDay.get(new Date(Date.now() - (days - 1 - i) * DAY).toISOString().slice(0, 10)) ?? 0)

console.log('\nForecast')

if (series.length < 2) {
  console.log('Needs at least 3 days.')
} else {
  const meanX = (series.length - 1) / 2
  const meanY = series.reduce((sum, n) => sum + n, 0) / series.length
  const slope = series.reduce((sum, n, x) => sum + (x - meanX) * (n - meanY), 0) / series.reduce((sum, _, x) => sum + (x - meanX) ** 2, 0)
  // Index series.length is today, so the next 30 days are series.length + 1 to + 30.
  const at = x => Math.max(0, meanY + slope * (x - meanX))
  const next = Array.from({ length: 30 }, (_, i) => at(series.length + 1 + i))
  const postViews = count(events, row => row.event === 'pageview' && /^\/(ar\/)?blog\/[^/]+$/.test(row.key))
  const allEvents = count(events, () => true)
  // README, Costs: a post view is at most 3 Worker requests (beacon, post read, own like), any other view 1, a reaction 1.
  const requestsPerView = totalViews ? 1 + (2 * postViews + allEvents - totalViews) / totalViews : 1
  const writesPerView = totalViews ? allEvents / totalViews : 1
  const busiest = Math.max(peak, ...next)

  console.log(`Next 30 days: about ${Math.round(next.reduce((sum, n) => sum + n, 0))} views, ${Math.round(next[29])} a day by the end (trend ${slope >= 0 ? '+' : ''}${slope.toFixed(1)} a day)`)
  console.log(`Busiest day (seen or forecast), ${Math.round(busiest)} views: about ${Math.round(busiest * requestsPerView)} Worker requests (${percent(busiest * requestsPerView, 100_000)} of the Free 100,000) and ${Math.round(busiest * writesPerView)} Analytics Engine writes (${percent(busiest * writesPerView, 100_000)} of 100,000)`)
}
