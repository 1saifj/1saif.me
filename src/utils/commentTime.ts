const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [['week', 604_800_000], ['day', 86_400_000], ['hour', 3_600_000], ['minute', 60_000]]

// After four weeks a relative time says little, so the date shows instead.
const RELATIVE_FOR = 4 * 604_800_000

// "now", "5 minutes ago", "yesterday", "3 weeks ago", then the date, as GitHub shows comment times.
export function commentTime(time: number, now: number, locale: string, date: Intl.DateTimeFormat): string {
  const elapsed = now - time

  if (elapsed >= RELATIVE_FOR) return date.format(time)

  const format = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  const [unit, size] = UNITS.find(([, length]) => elapsed >= length) ?? ['second', Infinity]

  // A clock a little ahead of the server gives a small negative time, which still reads "now".
  return format.format(-Math.floor(Math.max(0, elapsed) / size), unit)
}
