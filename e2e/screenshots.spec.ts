/**
 * Capture documentation screenshots of every screen, on mobile and desktop,
 * in light and dark themes. Each image carries a label with the route it
 * shows. Output: docs/screenshots/. Run with `npm run screenshots`.
 */

import { test, type Browser, type Page } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const OUT_DIR = resolve('docs/screenshots')

type ViewportName = 'mobile' | 'desktop'
type Theme = 'light' | 'dark'

const VIEWPORTS: Record<ViewportName, Parameters<Browser['newContext']>[0]> = {
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  desktop: { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 },
}

const THEMES: Theme[] = ['light', 'dark']

interface Screen {
  slug: string
  route: string
  title: string
  /** Extra interaction before capture (open a dialog, menu, ...). */
  open?: (page: Page, viewport: ViewportName) => Promise<void>
  only?: ViewportName
}

async function openMobileMenu(page: Page) {
  await page.getByRole('button', { name: 'Open menu' }).click()
  await page.waitForTimeout(400)
}

const SCREENS: Screen[] = [
  { slug: 'landing', route: '/', title: 'Landing page' },
  { slug: 'prayer-today', route: '/prayer', title: "Today's prayer times" },
  { slug: 'prayer-week', route: '/prayer/week', title: 'Weekly schedule' },
  { slug: 'prayer-month', route: '/prayer/month', title: 'Monthly schedule' },
  { slug: 'hijri-calendar', route: '/hijri', title: 'Hijri calendar' },
  {
    slug: 'about',
    route: '/prayer',
    title: 'About dialog',
    open: async (page, viewport) => {
      if (viewport === 'mobile') {
        await openMobileMenu(page)
        await page.getByRole('button', { name: 'App Info & Sources' }).click()
      } else {
        await page.locator('button[title="App Info & Sources"]').click()
      }
      await page.waitForTimeout(500)
    },
  },
  {
    slug: 'notifications',
    route: '/prayer',
    title: 'Enable notifications dialog',
    open: async (page, viewport) => {
      if (viewport === 'mobile') {
        await openMobileMenu(page)
        await page.getByRole('button', { name: /notification/i }).first().click()
      } else {
        await page.locator('button[title="Enable notifications"]').click()
      }
      await page.waitForTimeout(500)
    },
  },
  { slug: 'mobile-menu', route: '/prayer', title: 'Mobile menu', open: openMobileMenu, only: 'mobile' },
  { slug: 'admin', route: '/admin', title: 'Admin sign-in' },
]

/**
 * Compose the capture with a label band above it so the image itself says
 * which route it shows, without covering any of the app's own header.
 */
async function withRouteLabel(page: Page, capture: Buffer, cssWidth: number, label: string): Promise<Buffer> {
  await page.setContent(`<!doctype html><meta charset="utf-8">
    <style>
      body { margin: 0; background: #111827; }
      #frame { width: ${cssWidth}px; }
      #band { padding: 6px 10px; background: #111827; color: #fff; text-align: center;
              font: 600 13px/18px ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: 0.02em; }
      img { display: block; width: ${cssWidth}px; }
    </style>
    <div id="frame"><div id="band"></div><img></div>`)
  await page.evaluate(
    ({ label, src }) => {
      document.getElementById('band')!.textContent = label
      document.querySelector('img')!.src = src
    },
    { label, src: `data:image/png;base64,${capture.toString('base64')}` }
  )
  await page.locator('img').evaluate((img: HTMLImageElement) => img.decode())
  return page.locator('#frame').screenshot()
}

mkdirSync(OUT_DIR, { recursive: true })

for (const viewportName of Object.keys(VIEWPORTS) as ViewportName[]) {
  for (const theme of THEMES) {
    for (const screen of SCREENS) {
      if (screen.only && screen.only !== viewportName) continue

      test(`${screen.slug} · ${viewportName} · ${theme}`, async ({ browser, baseURL }) => {
        const context = await browser.newContext({
          ...VIEWPORTS[viewportName],
          colorScheme: theme,
          locale: 'en-GB',
          timezoneId: 'Asia/Colombo',
        })
        await context.addInitScript(
          ({ theme }) => {
            localStorage.setItem('theme', theme)
            localStorage.setItem('selectedDistrict', 'colombo')
          },
          { theme }
        )

        const page = await context.newPage()
        await page.goto(screen.route, { waitUntil: 'networkidle' })
        await page.waitForTimeout(600)

        if (screen.open) await screen.open(page, viewportName)

        // Mobile and dialog screens are captured at viewport size, like a real
        // phone screenshot, so fixed navigation and dialog overlays render in
        // place. Plain desktop pages are captured full length.
        const fullPage = viewportName === 'desktop' && !screen.open
        const capture = await page.screenshot({ fullPage })

        const label = `${screen.route}  ·  ${viewportName}  ·  ${theme}`
        const composed = await withRouteLabel(
          await context.newPage(),
          capture,
          VIEWPORTS[viewportName]!.viewport!.width,
          label
        )
        writeFileSync(resolve(OUT_DIR, `${screen.slug}--${viewportName}--${theme}.png`), composed)

        await context.close()
        void baseURL
      })
    }
  }
}
