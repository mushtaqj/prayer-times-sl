import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { JSONFilePreset } from 'lowdb/node'
import { formatDateISO } from '../src/lib/dateUtils.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Initialize lowdb
const dbPath = join(__dirname, '../src/data/hijriCalendar.json')
const db = await JSONFilePreset(dbPath, { months: [], metadata: {}, hijriMonths: [] })

// Find the current ongoing month (this is the one we want to remove)
const ongoingIndex = db.data.months.findIndex(m => m.status === 'ongoing')

if (ongoingIndex === -1) {
  console.error('No ongoing month found. Cannot rollback.')
  process.exit(1)
}

if (ongoingIndex === 0) {
  console.error('Cannot rollback - this is the first month in the database.')
  process.exit(1)
}

const ongoingMonth = db.data.months[ongoingIndex]
const previousMonth = db.data.months[ongoingIndex - 1]

if (previousMonth.status !== 'completed') {
  console.error('Previous month is not completed. Cannot rollback.')
  process.exit(1)
}

// Log what we're doing
console.log(`Rolling back: Removing ${ongoingMonth.monthName} ${ongoingMonth.hijriYear}`)
console.log(`Restoring: ${previousMonth.monthName} ${previousMonth.hijriYear} to ongoing status`)

// Remove the ongoing month
db.data.months.splice(ongoingIndex, 1)

// Set previous month back to ongoing
previousMonth.status = 'ongoing'

// Update metadata
db.data.metadata.lastUpdated = formatDateISO(new Date())

// Write changes
await db.write()
console.log('Hijri calendar rollback completed successfully!')
