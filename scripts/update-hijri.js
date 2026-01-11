import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Month names mapping
const MONTH_NAMES = [
  'Muharram',
  'Safar',
  'Rabi al-Awwal',
  'Rabi al-Thani',
  'Jumada al-Awwal',
  'Jumada al-Akhirah',
  'Rajab',
  'Shaban',
  'Ramadan',
  'Shawwal',
  'Dhul Qadah',
  'Dhul Hijjah'
]

// Read environment variable - just the days in the current month
const days = parseInt(process.env.DAYS, 10)

// Validate input
if (!days || (days !== 29 && days !== 30)) {
  console.error('Invalid days. Must be 29 or 30.')
  process.exit(1)
}

// Read the current JSON file
const jsonPath = join(__dirname, '../src/data/hijriCalendar.json')
const data = JSON.parse(readFileSync(jsonPath, 'utf-8'))

// Find the current ongoing month
const ongoingIndex = data.months.findIndex(m => m.status === 'ongoing')

if (ongoingIndex === -1) {
  console.error('No ongoing month found. Cannot update.')
  process.exit(1)
}

const currentMonth = data.months[ongoingIndex]

// Complete the current month
currentMonth.days = days
currentMonth.status = 'completed'
console.log(`Completed: ${currentMonth.monthName} ${currentMonth.hijriYear} (${days} days)`)

// Calculate next month
const nextHijriMonth = currentMonth.hijriMonth === 12 ? 1 : currentMonth.hijriMonth + 1
const nextHijriYear = currentMonth.hijriMonth === 12 ? currentMonth.hijriYear + 1 : currentMonth.hijriYear
const nextMonthName = MONTH_NAMES[nextHijriMonth - 1]

// Calculate gregorian start date for next month
// Next month starts = current month start + days in current month
const currentStart = new Date(currentMonth.gregorianStart)
const nextStart = new Date(currentStart)
nextStart.setDate(nextStart.getDate() + days)
const nextGregorianStart = nextStart.toISOString().split('T')[0]

// Create the next month
const nextMonth = {
  hijriYear: nextHijriYear,
  hijriMonth: nextHijriMonth,
  monthName: nextMonthName,
  gregorianStart: nextGregorianStart,
  days: 30, // Placeholder, will be set when this month is completed
  status: 'ongoing'
}

data.months.push(nextMonth)
console.log(`Created: ${nextMonthName} ${nextHijriYear} (starts ${nextGregorianStart})`)

// Update metadata
data.metadata.lastUpdated = new Date().toISOString().split('T')[0]

// Write back to file
writeFileSync(jsonPath, JSON.stringify(data, null, 2) + '\n')
console.log('Hijri calendar updated successfully!')
