/**
 * End-to-end checks for the single service worker, push notifications and
 * PWA icons. Runs against the production build (see playwright.config.ts).
 */

import { test, expect, type BrowserContext, type Page, type Worker } from '@playwright/test'

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

interface PushData {
  prayer: string
  zone: string
  time: string
  title: string
  body: string
}

interface ShownNotification {
  title: string
  body: string
  tag: string
  icon: string
  badge: string
  requireInteraction: boolean
}

async function loadAppWithServiceWorker(context: BrowserContext, page: Page): Promise<Worker> {
  const swPromise = context.waitForEvent('serviceworker')
  await page.goto('/')
  const sw = await swPromise
  // clientsClaim() means the first load ends up controlled.
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null)
  return sw
}

/**
 * Dispatch a synthetic FCM push inside the service worker and return the
 * notifications currently shown by its registration.
 */
function dispatchPush(sw: Worker, data: PushData): Promise<ShownNotification[]> {
  return sw.evaluate(async (data: PushData) => {
    const scope = self as unknown as ServiceWorkerGlobalScope
    const fcmPayload = JSON.stringify({ data, fcmMessageId: `test-${data.prayer}`, from: 'e2e' })
    scope.dispatchEvent(new PushEvent('push', { data: fcmPayload }))

    // Give the SDK's async handler time to run.
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const shown = await scope.registration.getNotifications()
    return shown.map((n) => ({
      title: n.title,
      body: n.body,
      tag: n.tag,
      icon: n.icon,
      badge: n.badge,
      requireInteraction: n.requireInteraction,
    }))
  }, data)
}

test.describe('service worker', () => {
  test('exactly one worker controls the root scope', async ({ context, page }) => {
    const sw = await loadAppWithServiceWorker(context, page)
    expect(new URL(sw.url()).pathname).toBe('/sw.js')

    const registrations = await page.evaluate(async () => {
      const regs = await navigator.serviceWorker.getRegistrations()
      return regs.map((r) => ({
        scope: new URL(r.scope).pathname,
        script: r.active ? new URL(r.active.scriptURL).pathname : null,
      }))
    })

    expect(registrations).toEqual([{ scope: '/', script: '/sw.js' }])
  })

  test('a push shows one notification and the next prayer replaces it', async ({ context, page, baseURL }) => {
    await context.grantPermissions(['notifications'], { origin: baseURL })
    const sw = await loadAppWithServiceWorker(context, page)

    // With no visible window client the SDK takes the background path.
    await page.close()

    const afterFajr = await dispatchPush(sw, {
      prayer: 'fajr',
      zone: '01',
      time: '5:02 AM',
      title: 'Fajr Prayer',
      body: 'Fajr is in 10 minutes (5:02 AM)',
    })

    expect(afterFajr).toHaveLength(1)
    expect(afterFajr[0]).toMatchObject({
      title: 'Fajr Prayer',
      body: 'Fajr is in 10 minutes (5:02 AM)',
      tag: 'prayer-reminder',
      requireInteraction: false,
    })
    expect(new URL(afterFajr[0].icon).pathname).toBe('/icon-192x192.png')
    expect(new URL(afterFajr[0].badge).pathname).toBe('/badge-96x96.png')

    const afterDhuhr = await dispatchPush(sw, {
      prayer: 'dhuhr',
      zone: '01',
      time: '12:10 PM',
      title: 'Dhuhr Prayer',
      body: 'Dhuhr is in 10 minutes (12:10 PM)',
    })

    // Same tag: the Dhuhr reminder replaced Fajr instead of stacking.
    expect(afterDhuhr).toHaveLength(1)
    expect(afterDhuhr[0].title).toBe('Dhuhr Prayer')
  })
})

test.describe('icons', () => {
  const ICONS = [
    '/icon-192x192.png',
    '/icon-512x512.png',
    '/icon-maskable-512x512.png',
    '/apple-touch-icon.png',
    '/badge-96x96.png',
  ]

  for (const path of ICONS) {
    test(`${path} is served as a real PNG`, async ({ request }) => {
      const response = await request.get(path)
      expect(response.status()).toBe(200)
      expect(response.headers()['content-type']).toContain('image/png')
      const body = await response.body()
      expect(body.subarray(0, 8).equals(PNG_SIGNATURE)).toBe(true)
    })
  }

  test('manifest lists any and maskable icons', async ({ request }) => {
    const response = await request.get('/manifest.webmanifest')
    expect(response.status()).toBe(200)
    const manifest = await response.json()
    const icons = manifest.icons as Array<{ src: string; sizes: string; purpose?: string }>

    expect(icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ src: 'icon-192x192.png', sizes: '192x192', purpose: 'any' }),
        expect.objectContaining({ src: 'icon-512x512.png', sizes: '512x512', purpose: 'any' }),
        expect.objectContaining({ src: 'icon-maskable-512x512.png', sizes: '512x512', purpose: 'maskable' }),
      ])
    )
  })
})
