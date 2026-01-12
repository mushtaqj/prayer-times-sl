import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { JSONFilePreset } from 'lowdb/node'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Read environment variable
const days = parseInt(process.env.DAYS, 10)

if (!days || (days !== 29 && days !== 30)) {
  console.error('Invalid days. Must be 29 or 30.')
  process.exit(1)
}

// Initialize lowdb
const dbPath = join(__dirname, '../src/data/hijriCalendar.json')
const db = await JSONFilePreset(dbPath, { months: [], metadata: {} })

// Find the current ongoing month
const ongoingIndex = db.data.months.findIndex(m => m.status === 'ongoing')

if (ongoingIndex === -1) {
  console.error('No ongoing month found. Cannot update.')
  process.exit(1)
}

const currentMonth = db.data.months[ongoingIndex]

// Complete the current month
currentMonth.days = days
currentMonth.status = 'completed'
console.log(`Completed: ${currentMonth.monthName} ${currentMonth.hijriYear} (${days} days)`)

// Calculate next month
const nextHijriMonth = currentMonth.hijriMonth === 12 ? 1 : currentMonth.hijriMonth + 1
const nextHijriYear = currentMonth.hijriMonth === 12 ? currentMonth.hijriYear + 1 : currentMonth.hijriYear

// Get month name from hijriMonths (single source of truth)
const monthInfo = db.data.hijriMonths.find(m => m.number === nextHijriMonth)
const nextMonthName = monthInfo?.name || `Month ${nextHijriMonth}`

// Calculate gregorian start date for next month
const currentStart = new Date(currentMonth.gregorianStart)
const nextStart = new Date(currentStart)
nextStart.setDate(nextStart.getDate() + days)
const nextGregorianStart = nextStart.toISOString().split('T')[0]

// Create and add the next month
db.data.months.push({
  hijriYear: nextHijriYear,
  hijriMonth: nextHijriMonth,
  monthName: nextMonthName,
  gregorianStart: nextGregorianStart,
  days: 30,
  status: 'ongoing'
})
console.log(`Created: ${nextMonthName} ${nextHijriYear} (starts ${nextGregorianStart})`)

// Update metadata
db.data.metadata.lastUpdated = new Date().toISOString().split('T')[0]

// Write changes
await db.write()
console.log('Hijri calendar updated successfully!')
