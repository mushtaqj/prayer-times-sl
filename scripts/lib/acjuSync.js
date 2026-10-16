// ACJU sync, shared between the CLI script and the preview API endpoint.
//
// Given a calendar `data` object, asks ACJU once what comes after the current
// ongoing month. If ACJU has published that start date, one transition is
// applied: the ongoing month is closed with its real length, the upcoming
// month becomes ongoing, and a new upcoming month is appended as a local
// 30-day assumption. Nothing further is requested from ACJU; the months after
// that are pure calculation until the next run. Mutates `data.months` in
// place; callers should clone first if they want a dry run.

import {
  applyTransition,
  parseDate,
  VALID_MONTH_DAYS,
} from './hijriTransition.js'

const ACJU_ENDPOINT =
  'https://www.acju.lk/wp-content/plugins/hijri-calendar-plugin/fetch_next_month.php'

// ACJU's host (Imunify360) scores requests by IP reputation and client
// signature. Some GitHub runner IPs are refused outright with a 403; a real
// browser signature avoids the additional penalty for a bare "node" agent.
const BROWSER_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36'

/** ACJU refused the request because of the caller's IP (bot protection). */
export class AcjuBlockedError extends Error {
  constructor(status, body) {
    super(`ACJU refused this IP (HTTP ${status}): ${body}`)
    this.name = 'AcjuBlockedError'
    this.status = status
  }
}

export function isAcjuBlocked(error) {
  return error instanceof AcjuBlockedError
}

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
      'Accept-Language': 'en-GB,en;q=0.7',
      'X-Requested-With': 'XMLHttpRequest',
      'Origin': 'https://www.acju.lk',
      'Referer': 'https://www.acju.lk/calenders-en/',
      'User-Agent': BROWSER_USER_AGENT,
    },
    body: body.toString(),
  })

  if (!response.ok) {
    const text = await response.text()
    if (response.status === 403 && /imunify360|bot-protection/i.test(text)) {
      throw new AcjuBlockedError(response.status, text.replace(/\s+/g, ' ').trim())
    }
    throw new Error(`ACJU HTTP ${response.status}: ${text}`)
  }
  return response.json()
}

function daysBetween(startISO, endISO) {
  const ms = parseDate(endISO).getTime() - parseDate(startISO).getTime()
  return Math.round(ms / 86_400_000)
}

/**
 * Ask ACJU once for the month after the ongoing one and apply it if published.
 * Returns an array with zero or one transition: { completed: {monthName,
 * hijriYear, hijriMonth, gregorianStart, days}, newOngoing: {...}, newUpcoming:
 * {...} }. The array shape is kept so the CLI and preview API can treat it as
 * a plan.
 *
 * @param {object} data - calendar data { months, hijriMonths }
 * @param {object} [options]
 * @param {typeof fetch} [options.fetchImpl] - injected fetch (for tests)
 */
export async function syncFromAcju(data, options = {}) {
  const { fetchImpl } = options

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
    return []
  }

  const actualDays = daysBetween(ongoing.gregorianStart, response.start_date)
  if (actualDays <= 0) {
    // When ACJU has nothing newer than the ongoing month it does not answer
    // success:false; it echoes the ongoing month's own row back (same
    // start_date, is_last_start_date varies). That is "nothing published yet",
    // not a broken month length.
    return []
  }
  if (!VALID_MONTH_DAYS.includes(actualDays)) {
    throw new Error(
      `Computed ${actualDays} days for ${ongoing.monthName} ${ongoing.hijriYear} (start ${ongoing.gregorianStart} -> next ${response.start_date}); expected 29 or 30.`
    )
  }

  const result = applyTransition(data, actualDays)
  return [
    {
      completed: { ...ongoingSnapshot, days: actualDays },
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
    },
  ]
}
