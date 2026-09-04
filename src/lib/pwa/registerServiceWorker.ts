/**
 * Service worker registration with proactive update checks.
 *
 * Browsers only look for a new service worker on navigation or roughly once a
 * day. Installed PWAs are rarely navigated or reloaded, so a release could sit
 * unseen for days. This registers immediately, re-checks whenever the app
 * comes to the foreground and on an hourly timer, and (in autoUpdate mode)
 * the plugin reloads the page once the new worker has taken control.
 */

import { registerSW } from 'virtual:pwa-register'

export const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000

export function registerServiceWorker(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

  registerSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return

      const checkForUpdate = () => {
        registration.update().catch((error) => {
          console.warn('[pwa] Update check failed:', error)
        })
      }

      window.setInterval(checkForUpdate, UPDATE_CHECK_INTERVAL_MS)

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') checkForUpdate()
      })
    },
    onRegisterError(error) {
      console.error('[pwa] Service worker registration failed:', error)
    },
  })
}
