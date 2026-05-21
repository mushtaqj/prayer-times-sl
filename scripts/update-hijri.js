import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { JSONFilePreset } from 'lowdb/node'
import {
  applyTransition,
  formatDateISO,
  VALID_MONTH_DAYS,
} from './lib/hijriTransition.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const days = parseInt(process.env.DAYS, 10)

if (!days || !VALID_MONTH_DAYS.includes(days)) {
  console.error(`Invalid days. Must be one of: ${VALID_MONTH_DAYS.join(', ')}`)
  process.exit(1)
}

const dbPath = join(__dirname, '../src/data/hijriCalendar.json')
const db = await JSONFilePreset(dbPath, { months: [], metadata: {}, hijriMonths: [] })

const { completed, newOngoing, newUpcoming } = applyTransition(db, days)

console.log(`Completed: ${completed.monthName} ${completed.hijriYear} (${days} days)`)
console.log(`Ongoing:   ${newOngoing.monthName} ${newOngoing.hijriYear} starts ${newOngoing.gregorianStart}`)
console.log(`Upcoming:  ${newUpcoming.monthName} ${newUpcoming.hijriYear} starts ${newUpcoming.gregorianStart}`)

db.data.metadata.lastUpdated = formatDateISO(new Date())
await db.write()
console.log('Hijri calendar updated successfully!')
