// Build docs/screenshots/README.md from the captured images.
import { readdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const DIR = resolve('docs/screenshots')
const TITLES = {
  landing: ['Landing page', '/'],
  'prayer-today': ["Today's prayer times", '/prayer'],
  'prayer-week': ['Weekly schedule', '/prayer/week'],
  'prayer-month': ['Monthly schedule', '/prayer/month'],
  'hijri-calendar': ['Hijri calendar', '/hijri'],
  about: ['About dialog', '/prayer'],
  notifications: ['Enable notifications dialog', '/prayer'],
  'mobile-menu': ['Mobile menu', '/prayer'],
  admin: ['Admin sign-in', '/admin'],
}

const files = readdirSync(DIR).filter((f) => f.endsWith('.png'))
const bySlug = new Map()
for (const f of files) {
  const m = f.match(/^(.+?)--(mobile|desktop)--(light|dark)\.png$/)
  if (!m) continue
  const [, slug, viewport, theme] = m
  if (!bySlug.has(slug)) bySlug.set(slug, {})
  bySlug.get(slug)[`${viewport}-${theme}`] = f
}

let md = `# Screenshots

Generated with \`npm run screenshots\` (Playwright against the production build).
Each image carries a label with the route it shows. Mobile is 390×844 at 2x,
desktop is 1280×800.

`
for (const slug of Object.keys(TITLES)) {
  const shots = bySlug.get(slug)
  if (!shots) continue
  const [title, route] = TITLES[slug]
  md += `## ${title}\n\nRoute: \`${route}\`\n\n`
  md += `| Mobile · light | Mobile · dark | Desktop · light | Desktop · dark |\n|---|---|---|---|\n`
  const cell = (k) => (shots[k] ? `<img src="./${shots[k]}" width="${k.startsWith('mobile') ? 180 : 360}" alt="${title} (${k})">` : '')
  md += `| ${cell('mobile-light')} | ${cell('mobile-dark')} | ${cell('desktop-light')} | ${cell('desktop-dark')} |\n\n`
}
writeFileSync(resolve(DIR, 'README.md'), md)
console.log(`Gallery written with ${bySlug.size} screens, ${files.length} images.`)
