/// <reference lib="webworker" />
/**
 * Single app service worker: Workbox precaching for offline support plus
 * Firebase Cloud Messaging for background push.
 *
 * One worker at scope "/" avoids the previous setup where the Workbox worker
 * and firebase-messaging-sw.js fought over the same scope.
 */

import { clientsClaim } from 'workbox-core'
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { initializeApp } from 'firebase/app'
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw'
import { buildPrayerNotification, NOTIFICATION_CLICK_URL } from './lib/notifications/prayerNotification'
import { setAppBadge, clearAppBadge } from './lib/pwa/appBadge'

declare let self: ServiceWorkerGlobalScope

// ---------------------------------------------------------------------------
// Offline support (Workbox)
// ---------------------------------------------------------------------------

self.skipWaiting()
clientsClaim()
cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

// SPA navigation fallback; API routes are never served from the precache.
registerRoute(
  new NavigationRoute(createHandlerBoundToURL('index.html'), {
    denylist: [/^\/api\//],
  })
)

// ---------------------------------------------------------------------------
// Push notifications (Firebase Cloud Messaging)
// ---------------------------------------------------------------------------

function initMessaging(): void {
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  }

  if (!config.apiKey || !config.projectId || !config.messagingSenderId || !config.appId) {
    console.warn('[sw] Firebase config missing; push notifications disabled in this build.')
    return
  }

  try {
    const messaging = getMessaging(initializeApp(config))

    // The Cloud Function sends data-only messages, so the SDK never displays
    // anything itself. This handler is the only place a push becomes a
    // notification, which is what prevents duplicates.
    onBackgroundMessage(messaging, async (payload) => {
      const { title, options } = buildPrayerNotification(payload.data)
      await self.registration.showNotification(title, options)
      // Mark the app icon until the user opens the app (cleared on open).
      await setAppBadge()
    })
  } catch (error) {
    console.error('[sw] Failed to initialise Firebase messaging:', error)
  }
}

initMessaging()

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  void clearAppBadge()

  const targetUrl = (event.notification.data?.url as string | undefined) || NOTIFICATION_CLICK_URL

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          return client.focus()
        }
      }
      return self.clients.openWindow(targetUrl)
    })
  )
})
