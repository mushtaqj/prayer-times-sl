import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { JSONFilePreset } from 'lowdb/node'
import { formatDateISO, getOngoingDayNumber, isSyncDue } from './lib/hijriTransition.js'
import { syncFromAcju, isAcjuBlocked } from './lib/acjuSync.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const isTruthy = (value) => value === 'true' || value === '1'
const dryRun = isTruthy(process.env.DRY_RUN)
// WHEN_DUE=true (scheduled runs): only contact ACJU from day 29 of the ongoing month.
const onlyWhenDue = isTruthy(process.env.WHEN_DUE)
const countEnv = process.env.COUNT ? parseInt(process.env.COUNT, 10) : undefined
const maxCount = Number.isFinite(countEnv) && countEnv > 0 ? countEnv : undefined

const dbPath = join(__dirname, '../src/data/hijriCalendar.json')
const db = await JSONFilePreset(dbPath, { months: [], metadata: {}, hijriMonths: [] })

// Evaluate "today" in Sri Lanka time so a UTC runner agrees with ACJU's calendar day.
const todayColombo = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Colombo' }))

if (onlyWhenDue && !isSyncDue(db.data, todayColombo)) {
  const day = getOngoingDayNumber(db.data, todayColombo)
  console.log(`Not due: today is day ${day ?? '?'} of the ongoing month. Skipping ACJU check.`)
  process.exit(0)
}

const dayNumber = getOngoingDayNumber(db.data, todayColombo)
if (dayNumber !== null && dayNumber > 30) {
  console.log(
    `Calendar is on day ${dayNumber} of the ongoing month; the app is showing the assumed upcoming month until ACJU publishes the new one.`
  )
}

const target = dryRun ? structuredClone(db.data) : db.data
let transitions
try {
  transitions = await syncFromAcju(target, { maxCount })
} catch (error) {
  if (onlyWhenDue && isAcjuBlocked(error)) {
    // Scheduled runs get a fresh runner (and usually a different IP) every
    // slot, so a refused IP is not worth failing the job over. Surface it as
    // a warning annotation and let the next slot retry.
    console.log(`::warning title=ACJU blocked this runner::${error.message}. The next scheduled slot will retry from a different runner.`)
    process.exit(0)
  }
  throw error
}

if (dryRun) {
  console.log(JSON.stringify({ transitions }, null, 2))
  process.exit(0)
}

if (transitions.length === 0) {
  console.log('Calendar already in sync with ACJU. No changes.')
  process.exit(0)
}

for (const t of transitions) {
  console.log(
    `Synced: ${t.completed.monthName} ${t.completed.hijriYear} = ${t.completed.days} days; ongoing -> ${t.newOngoing.monthName} ${t.newOngoing.hijriYear} (${t.newOngoing.gregorianStart}); upcoming -> ${t.newUpcoming.monthName} ${t.newUpcoming.hijriYear} (${t.newUpcoming.gregorianStart})`
  )
}

db.data.metadata.lastUpdated = formatDateISO(new Date())
await db.write()
console.log(`Sync complete: ${transitions.length} month(s) advanced.`)
