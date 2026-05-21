import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { JSONFilePreset } from 'lowdb/node'
import {
  applyTransition,
  parseDate,
  formatDateISO,
  VALID_MONTH_DAYS,
} from './lib/hijriTransition.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const ACJU_ENDPOINT =
  'https://www.acju.lk/wp-content/plugins/hijri-calendar-plugin/fetch_next_month.php'

const MAX_ITERATIONS = 24 // safety: never advance more than two years in one run

async function fetchNextMonth(currentStartDate) {
  const monthYear = currentStartDate.slice(0, 7) // YYYY-MM
  const body = new URLSearchParams({
    current_month_year: monthYear,
    current_start_date: currentStartDate,
  })

  const response = await fetch(ACJU_ENDPOINT, {
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

const dbPath = join(__dirname, '../src/data/hijriCalendar.json')
const db = await JSONFilePreset(dbPath, { months: [], metadata: {}, hijriMonths: [] })

let iterations = 0
let transitions = 0

while (iterations++ < MAX_ITERATIONS) {
  const ongoing = db.data.months.find((m) => m.status === 'ongoing')
  if (!ongoing) {
    throw new Error('No ongoing month found in calendar; cannot sync.')
  }

  const data = await fetchNextMonth(ongoing.gregorianStart)
  if (!data || data.success === false) {
    console.log(`ACJU has no next-month data after ${ongoing.monthName} ${ongoing.hijriYear} (${ongoing.gregorianStart}). Stopping.`)
    break
  }

  const nextStart = data.start_date
  if (!nextStart) {
    throw new Error(`ACJU response missing start_date: ${JSON.stringify(data)}`)
  }

  const actualDays = daysBetween(ongoing.gregorianStart, nextStart)
  if (!VALID_MONTH_DAYS.includes(actualDays)) {
    throw new Error(
      `Computed ${actualDays} days for ${ongoing.monthName} ${ongoing.hijriYear} (start ${ongoing.gregorianStart} -> next ${nextStart}); expected 29 or 30.`
    )
  }

  const { completed, newOngoing, newUpcoming } = applyTransition(db, actualDays)
  transitions++
  console.log(
    `Synced: ${completed.monthName} ${completed.hijriYear} = ${actualDays} days; ongoing -> ${newOngoing.monthName} ${newOngoing.hijriYear} (${newOngoing.gregorianStart}); upcoming -> ${newUpcoming.monthName} ${newUpcoming.hijriYear} (${newUpcoming.gregorianStart})`
  )
}

if (iterations >= MAX_ITERATIONS) {
  throw new Error(`Aborting: hit MAX_ITERATIONS (${MAX_ITERATIONS}). ACJU may be returning success without advancing.`)
}

if (transitions === 0) {
  console.log('Calendar already in sync with ACJU. No changes.')
} else {
  db.data.metadata.lastUpdated = formatDateISO(new Date())
  await db.write()
  console.log(`Sync complete: ${transitions} month(s) advanced.`)
}
