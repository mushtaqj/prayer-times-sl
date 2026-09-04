/**
 * Show a notification from a window context.
 *
 * Prefers the service worker registration (required on Android, where the
 * `Notification` constructor throws) and falls back to `new Notification`.
 */

import type { PrayerNotificationOptions } from './prayerNotification'

/** Scope of the single app service worker (precache + push). */
export const PUSH_SW_SCOPE = '/'

export async function showNotificationFromPage(
  title: string,
  options: PrayerNotificationOptions
): Promise<boolean> {
  if (typeof window === 'undefined') return false
  if (!('Notification' in window) || Notification.permission !== 'granted') return false

  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration(PUSH_SW_SCOPE)
      if (registration) {
        await registration.showNotification(title, options)
        return true
      }
    } catch (error) {
      console.warn('Service worker notification failed, falling back:', error)
    }
  }

  try {
    new Notification(title, options)
    return true
  } catch (error) {
    console.error('Unable to show notification:', error)
    return false
  }
}
