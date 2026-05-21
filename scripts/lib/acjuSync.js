// ACJU sync loop, shared between the CLI script and the preview API endpoint.
//
// Given a calendar `data` object, repeatedly asks ACJU what comes after the
// current ongoing month and applies a transition until ACJU has no more data
// (or `maxCount` is reached). Mutates `data.months` in place; callers should
// clone first if they want a dry run.

import {
  applyTransition,
  parseDate,
  VALID_MONTH_DAYS,
} from './hijriTransition.js'

const ACJU_ENDPOINT =
  'https://www.acju.lk/wp-content/plugins/hijri-calendar-plugin/fetch_next_month.php'

const MAX_ITERATIONS_HARD_CAP = 24

export async function fetchNextMonth(currentStartDate, fetchImpl = fetch) {
  const monthYear = currentStartDate.slice(0, 7)
  const body = new URLSearchParams({
    current_month_year: monthYear,
    current_start_date: currentStartDate,
  })

  const response = await fetchImpl(ACJU_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'X-Requested-With': 'XMLHttpRequest',
      'Origin': 'https://www.acju.lk',
      'Referer': 'https://www.acju.lk/calenders-en/',
    },
    body: body.toString(),
  })

  if (!response.ok) {
    throw new Error(`ACJU HTTP ${response.status}: ${await response.text()}`)
  }
  return response.json()
}

function daysBetween(startISO, endISO) {
  const ms = parseDate(endISO).getTime() - parseDate(startISO).getTime()
  return Math.round(ms / 86_400_000)
}

/**
 * Run the ACJU sync loop against `data` (mutating it). Returns an array of
 * applied transitions: { completed: {monthName, hijriYear, days}, newOngoing:
 * {monthName, hijriYear, gregorianStart}, newUpcoming: same }.
 *
 * @param {object} data - calendar data { months, hijriMonths }
 * @param {object} [options]
 * @param {number} [options.maxCount] - hard cap on how many transitions to apply
 * @param {typeof fetch} [options.fetchImpl] - injected fetch (for tests)
 */
export async function syncFromAcju(data, options = {}) {
  const { maxCount, fetchImpl } = options
  const cap = Math.min(maxCount ?? MAX_ITERATIONS_HARD_CAP, MAX_ITERATIONS_HARD_CAP)

  const transitions = []
  let iterations = 0

  while (iterations++ < cap) {
    const ongoing = data.months.find((m) => m.status === 'ongoing')
    if (!ongoing) {
      throw new Error('No ongoing month found in calendar; cannot sync.')
    }

    const ongoingSnapshot = {
      monthName: ongoing.monthName,
      hijriYear: ongoing.hijriYear,
      hijriMonth: ongoing.hijriMonth,
      gregorianStart: ongoing.gregorianStart,
    }

    const response = await fetchNextMonth(ongoing.gregorianStart, fetchImpl)
    if (!response || response.success === false || !response.start_date) {
      break
    }

    const actualDays = daysBetween(ongoing.gregorianStart, response.start_date)
    if (!VALID_MONTH_DAYS.includes(actualDays)) {
      throw new Error(
        `Computed ${actualDays} days for ${ongoing.monthName} ${ongoing.hijriYear} (start ${ongoing.gregorianStart} -> next ${response.start_date}); expected 29 or 30.`
      )
    }

    const result = applyTransition(data, actualDays)
    transitions.push({
      completed: {
        monthName: ongoingSnapshot.monthName,
        hijriYear: ongoingSnapshot.hijriYear,
        hijriMonth: ongoingSnapshot.hijriMonth,
        gregorianStart: ongoingSnapshot.gregorianStart,
        days: actualDays,
      },
      newOngoing: {
        monthName: result.newOngoing.monthName,
        hijriYear: result.newOngoing.hijriYear,
        hijriMonth: result.newOngoing.hijriMonth,
        gregorianStart: result.newOngoing.gregorianStart,
        days: result.newOngoing.days,
      },
      newUpcoming: {
        monthName: result.newUpcoming.monthName,
        hijriYear: result.newUpcoming.hijriYear,
        hijriMonth: result.newUpcoming.hijriMonth,
        gregorianStart: result.newUpcoming.gregorianStart,
        days: result.newUpcoming.days,
      },
    })
  }

  if (iterations > MAX_ITERATIONS_HARD_CAP) {
    throw new Error(
      `Aborting: hit MAX_ITERATIONS_HARD_CAP (${MAX_ITERATIONS_HARD_CAP}). ACJU may be returning success without advancing.`
    )
  }

  return transitions
}
