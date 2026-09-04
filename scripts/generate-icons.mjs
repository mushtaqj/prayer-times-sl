// Render the manifest shortcut icons (96x96 PNG) and PNG favicons using Playwright.
// Usage: node scripts/generate-icons.mjs
import { chromium } from '@playwright/test'
import { mkdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const OUT_DIR = resolve('public')
const BACKGROUND = '#19ad79'

// Lucide icon paths (ISC licence), drawn white on the app green.
const ICONS = {
  'shortcut-today-96x96.png':
    '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  'shortcut-week-96x96.png':
    '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/>',
  'shortcut-hijri-96x96.png': '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
}

const tiles = Object.entries(ICONS)
  .map(
    ([file, paths]) => `
    <div class="tile" data-file="${file}">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="56" height="56" fill="none"
           stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>
    </div>`
  )
  .join('')

const html = `<!doctype html><meta charset="utf-8">
<style>
  body { margin: 0; background: transparent; display: flex; gap: 16px; padding: 16px; }
  .tile { width: 96px; height: 96px; border-radius: 20px; background: ${BACKGROUND};
          display: flex; align-items: center; justify-content: center; }
</style>${tiles}`

mkdirSync(OUT_DIR, { recursive: true })
const browser = await chromium.launch({ channel: 'chromium' })
const page = await browser.newPage({ deviceScaleFactor: 1 })
await page.setContent(html)
for (const tile of await page.locator('.tile').all()) {
  const file = await tile.getAttribute('data-file')
  await tile.screenshot({ path: resolve(OUT_DIR, file), omitBackground: true })
  console.log('wrote', file)
}

// PNG favicons for browsers without SVG favicon support (Safari).
const faviconSvg = readFileSync(resolve(OUT_DIR, 'favicon.svg'), 'utf-8')
for (const size of [32, 48]) {
  await page.setContent(`<!doctype html><meta charset="utf-8"><style>body{margin:0;background:transparent}</style>
    <div id="f" style="width:${size}px;height:${size}px">${faviconSvg.replace('<svg ', `<svg width="${size}" height="${size}" `)}</div>`)
  const file = `favicon-${size}x${size}.png`
  await page.locator('#f').screenshot({ path: resolve(OUT_DIR, file), omitBackground: true })
  console.log('wrote', file)
}
await browser.close()
