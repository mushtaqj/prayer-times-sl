import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { JSONFilePreset } from 'lowdb/node'
import { parseDate, addDays, formatDateISO } from '../src/lib/dateUtils.ts'
import {
  MONTHS_IN_HIJRI_YEAR,
  FIRST_HIJRI_MONTH,
  VALID_MONTH_DAYS,
  DEFAULT_MONTH_DAYS,
} from '../src/lib/hijriConstants.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Read environment variable
const days = parseInt(process.env.DAYS, 10)

if (!days || !VALID_MONTH_DAYS.includes(days)) {
  console.error(`Invalid days. Must be one of: ${VALID_MONTH_DAYS.join(', ')}`)
  process.exit(1)
}

// Initialize lowdb
const dbPath = join(__dirname, '../src/data/hijriCalendar.json')
const db = await JSONFilePreset(dbPath, { months: [], metadata: {}, hijriMonths: [] })

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
const isLastMonthOfYear = currentMonth.hijriMonth === MONTHS_IN_HIJRI_YEAR
const nextHijriMonth = isLastMonthOfYear ? FIRST_HIJRI_MONTH : currentMonth.hijriMonth + 1
const nextHijriYear = isLastMonthOfYear ? currentMonth.hijriYear + 1 : currentMonth.hijriYear

// Get month name from hijriMonths (single source of truth)
const monthInfo = db.data.hijriMonths.find(m => m.number === nextHijriMonth)
const nextMonthName = monthInfo?.name || `Month ${nextHijriMonth}`

// Calculate gregorian start date for next month using dateUtils
const currentStart = parseDate(currentMonth.gregorianStart)
const nextStart = addDays(currentStart, days)
const nextGregorianStart = formatDateISO(nextStart)

// Create and add the next month
db.data.months.push({
  hijriYear: nextHijriYear,
  hijriMonth: nextHijriMonth,
  monthName: nextMonthName,
  gregorianStart: nextGregorianStart,
  days: DEFAULT_MONTH_DAYS, // Will be updated on moon sighting
  status: 'ongoing'
})
console.log(`Created: ${nextMonthName} ${nextHijriYear} (starts ${nextGregorianStart})`)

// Update metadata
db.data.metadata.lastUpdated = formatDateISO(new Date())

// Write changes
await db.write()
console.log('Hijri calendar updated successfully!')
