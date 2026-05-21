import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { JSONFilePreset } from 'lowdb/node'
import { revertTransition, formatDateISO } from './lib/hijriTransition.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const dbPath = join(__dirname, '../src/data/hijriCalendar.json')
const db = await JSONFilePreset(dbPath, { months: [], metadata: {}, hijriMonths: [] })

const { restored, demoted, removed } = revertTransition(db)

console.log(`Removed:  ${removed.monthName} ${removed.hijriYear} (upcoming)`)
console.log(`Demoted:  ${demoted.monthName} ${demoted.hijriYear} -> upcoming (start ${demoted.gregorianStart})`)
console.log(`Restored: ${restored.monthName} ${restored.hijriYear} -> ongoing`)

db.data.metadata.lastUpdated = formatDateISO(new Date())
await db.write()
console.log('Hijri calendar rollback completed successfully!')
