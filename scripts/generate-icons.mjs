// Render every app icon from scripts/assets/app-icon-glyph.svg using Playwright.
// Usage: node scripts/generate-icons.mjs
//
// Outputs (public/):
//   icon-192x192.png, icon-512x512.png   rounded-corner app icon (manifest purpose "any", in-app logo)
//   icon-maskable-512x512.png            full-bleed (manifest purpose "maskable")
//   apple-touch-icon.png                 180px full-bleed (iOS applies its own mask)
//   badge-96x96.png                      white glyph on transparent (Android status-bar badge)
//   favicon.svg, favicon-32x32.png, favicon-48x48.png
//   shortcut-*.png                       manifest shortcut icons (Material Symbols, Apache 2.0)
import { chromium } from '@playwright/test'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const OUT_DIR = resolve('public')
const BRAND_GREEN = '#19ad79'
const CORNER_RADIUS = 0.22 // fraction of the tile size, matches iOS/Android app icon rounding

const glyph = readFileSync(resolve('scripts/assets/app-icon-glyph.svg'), 'utf-8').replace(/<!--[\s\S]*?-->\s*/, '')

const SHORTCUTS = {
  'shortcut-today-96x96.png':
    '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  'shortcut-week-96x96.png':
    '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/>',
  'shortcut-hijri-96x96.png': '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
}

/** Green tile with the white glyph; radius 0 for full-bleed variants. */
const tile = (size, radius) => `
  <div id="t" style="width:${size}px;height:${size}px;border-radius:${Math.round(size * radius)}px;background:${BRAND_GREEN};color:#fff;display:grid;place-items:center">
    <div style="width:${size}px;height:${size}px">${glyph.replace('<svg ', '<svg style="display:block;width:100%;height:100%" ')}</div>
  </div>`

/** White glyph only, cropped to its own bounds, for the monochrome badge. */
const badge = (size) => `
  <div id="t" style="width:${size}px;height:${size}px;color:#fff">
    ${glyph.replace('viewBox="0 0 512 512"', 'viewBox="64 64 384 384"').replace('<svg ', '<svg style="display:block;width:100%;height:100%" ')}
  </div>`

mkdirSync(OUT_DIR, { recursive: true })
const browser = await chromium.launch({ channel: 'chromium' })
const page = await browser.newPage({ deviceScaleFactor: 1 })

async function shoot(html, file) {
  await page.setContent(`<!doctype html><meta charset="utf-8"><style>body{margin:0;background:transparent}</style>${html}`)
  await page.locator('#t').screenshot({ path: resolve(OUT_DIR, file), omitBackground: true })
  console.log('wrote', file)
}

await shoot(tile(192, CORNER_RADIUS), 'icon-192x192.png')
await shoot(tile(512, CORNER_RADIUS), 'icon-512x512.png')
await shoot(tile(512, 0), 'icon-maskable-512x512.png')
await shoot(tile(180, 0), 'apple-touch-icon.png')
await shoot(badge(96), 'badge-96x96.png')

const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <!-- App mark: crescent dial on the brand green. Source: scripts/assets/app-icon-glyph.svg -->
  <rect width="512" height="512" rx="112" fill="${BRAND_GREEN}"/>
  <g fill="#fff" color="#fff">${glyph.replace(/<svg[^>]*>/, '').replace('</svg>', '')}</g>
</svg>
`
writeFileSync(resolve(OUT_DIR, 'favicon.svg'), faviconSvg)
console.log('wrote favicon.svg')
await shoot(tile(32, CORNER_RADIUS), 'favicon-32x32.png')
await shoot(tile(48, CORNER_RADIUS), 'favicon-48x48.png')

for (const [file, paths] of Object.entries(SHORTCUTS)) {
  await shoot(
    `<div id="t" style="width:96px;height:96px;border-radius:20px;background:${BRAND_GREEN};display:grid;place-items:center">
       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>
     </div>`,
    file
  )
}

await browser.close()
