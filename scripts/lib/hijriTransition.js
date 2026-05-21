// Shared transition logic for Hijri calendar maintenance.
// Invariant after every applyTransition: the tail of months is
//   [..., completed, ongoing (days=30), upcoming (days=30)]
// where ongoing.days and upcoming.days stay at the default until a real
// moon-sighting closes them out via the next applyTransition call.
//
// All functions take a plain `data` object of shape { months, hijriMonths }
// (the lowdb `db.data` shape) so they can be reused by both CLI scripts and
// serverless functions without depending on lowdb.

export const MONTHS_IN_HIJRI_YEAR = 12
export const FIRST_HIJRI_MONTH = 1
export const VALID_MONTH_DAYS = [29, 30]
export const DEFAULT_MONTH_DAYS = 30

export function parseDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function addDays(date, days) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function formatDateISO(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function nextHijriMonth(currentMonth, currentYear) {
  const isLast = currentMonth === MONTHS_IN_HIJRI_YEAR
  return {
    hijriMonth: isLast ? FIRST_HIJRI_MONTH : currentMonth + 1,
    hijriYear: isLast ? currentYear + 1 : currentYear,
  }
}

function monthNameFor(data, hijriMonth) {
  const info = data.hijriMonths.find((m) => m.number === hijriMonth)
  return info?.name || `Month ${hijriMonth}`
}

/**
 * Close out the current ongoing month with its actual day count, promote the
 * existing upcoming month to ongoing (correcting its start date if the actual
 * length differed from the assumed 30), and append a new upcoming month after
 * it with the default 30-day assumption.
 *
 * Returns { completed, newOngoing, newUpcoming } describing the resulting
 * entries (references into data.months).
 */
export function applyTransition(data, actualDays) {
  if (!VALID_MONTH_DAYS.includes(actualDays)) {
    throw new Error(`Invalid days: ${actualDays}. Must be one of ${VALID_MONTH_DAYS.join(', ')}`)
  }

  const ongoingIndex = data.months.findIndex((m) => m.status === 'ongoing')
  if (ongoingIndex === -1) {
    throw new Error('No ongoing month found.')
  }
  const upcomingIndex = data.months.findIndex((m) => m.status === 'upcoming')
  if (upcomingIndex === -1) {
    throw new Error('No upcoming month found. Calendar invariant broken.')
  }

  const ongoing = data.months[ongoingIndex]
  const upcoming = data.months[upcomingIndex]

  ongoing.days = actualDays
  ongoing.status = 'completed'

  const correctedUpcomingStart = formatDateISO(addDays(parseDate(ongoing.gregorianStart), actualDays))
  upcoming.gregorianStart = correctedUpcomingStart
  upcoming.days = DEFAULT_MONTH_DAYS
  upcoming.status = 'ongoing'

  const next = nextHijriMonth(upcoming.hijriMonth, upcoming.hijriYear)
  const newUpcoming = {
    hijriYear: next.hijriYear,
    hijriMonth: next.hijriMonth,
    monthName: monthNameFor(data, next.hijriMonth),
    gregorianStart: formatDateISO(addDays(parseDate(upcoming.gregorianStart), DEFAULT_MONTH_DAYS)),
    days: DEFAULT_MONTH_DAYS,
    status: 'upcoming',
  }
  data.months.push(newUpcoming)

  return { completed: ongoing, newOngoing: upcoming, newUpcoming }
}

/**
 * Inverse of applyTransition.
 */
export function revertTransition(data) {
  const ongoingIndex = data.months.findIndex((m) => m.status === 'ongoing')
  if (ongoingIndex === -1) {
    throw new Error('No ongoing month found.')
  }
  if (ongoingIndex === 0) {
    throw new Error('Cannot rollback: no previous month exists.')
  }

  const previous = data.months[ongoingIndex - 1]
  const currentOngoing = data.months[ongoingIndex]
  const trailing = data.months[data.months.length - 1]

  if (previous.status !== 'completed') {
    throw new Error('Previous month is not completed; cannot rollback.')
  }
  if (!trailing || trailing.status !== 'upcoming') {
    throw new Error('Trailing month is not upcoming; calendar invariant broken.')
  }
  if (trailing === currentOngoing) {
    throw new Error('Calendar invariant broken: ongoing is the trailing entry.')
  }

  data.months.pop()

  currentOngoing.status = 'upcoming'
  currentOngoing.days = DEFAULT_MONTH_DAYS
  currentOngoing.gregorianStart = formatDateISO(
    addDays(parseDate(previous.gregorianStart), DEFAULT_MONTH_DAYS)
  )

  previous.status = 'ongoing'
  previous.days = DEFAULT_MONTH_DAYS

  return { restored: previous, demoted: currentOngoing, removed: trailing }
}
