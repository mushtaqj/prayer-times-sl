import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { JSONFilePreset } from 'lowdb/node'
import { formatDateISO } from './lib/hijriTransition.js'
import { syncFromAcju } from './lib/acjuSync.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const dryRun = process.env.DRY_RUN === 'true' || process.env.DRY_RUN === '1'
const countEnv = process.env.COUNT ? parseInt(process.env.COUNT, 10) : undefined
const maxCount = Number.isFinite(countEnv) && countEnv > 0 ? countEnv : undefined

const dbPath = join(__dirname, '../src/data/hijriCalendar.json')
const db = await JSONFilePreset(dbPath, { months: [], metadata: {}, hijriMonths: [] })

const target = dryRun ? structuredClone(db.data) : db.data
const transitions = await syncFromAcju(target, { maxCount })

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
