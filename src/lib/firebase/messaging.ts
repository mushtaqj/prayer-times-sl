/**
 * Firebase Cloud Messaging utilities for push notifications
 */

import { getToken, onMessage } from 'firebase/messaging'
import { getMessagingInstance, VAPID_KEY } from './config'
import { buildPrayerNotification, type PrayerPushData } from '@/lib/notifications/prayerNotification'
import { showNotificationFromPage, PUSH_SW_SCOPE } from '@/lib/notifications/showNotification'
import { PUSH_STORAGE_KEYS, getPushSettings } from '@/lib/notifications/pushSettings'

export { getPushSettings }

const STORAGE_KEYS = PUSH_STORAGE_KEYS

/** The app service worker (Workbox precache + FCM push), registered by vite-plugin-pwa. */
const SW_URL = '/sw.js'
const SW_READY_TIMEOUT_MS = 10000

/**
 * Check if push notifications are supported
 */
export async function isPushSupported(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  if (!('Notification' in window)) return false
  if (!('serviceWorker' in navigator)) return false

  const messaging = await getMessagingInstance()
  return messaging !== null
}

/**
 * Get the current notification permission status
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined') return 'unsupported'
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission
}

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false

  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

/**
 * Resolve the active app service worker registration at scope "/".
 *
 * vite-plugin-pwa registers the worker on page load (as /sw.js in production,
 * or a dev-only URL under `vite dev`), so an existing registration is reused.
 * Registering /sw.js ourselves is only a fallback, and it also upgrades installs
 * that still have the legacy firebase-messaging-sw.js at this scope. The push
 * subscription lives on the registration, so tokens survive the upgrade.
 */
export async function getPushServiceWorkerRegistration(): Promise<ServiceWorkerRegistration> {
  const existing = await navigator.serviceWorker.getRegistration(PUSH_SW_SCOPE)
  if (!existing) {
    await navigator.serviceWorker.register(SW_URL, { scope: PUSH_SW_SCOPE })
  }

  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Service worker activation timeout')), SW_READY_TIMEOUT_MS)
  })

  return Promise.race([navigator.serviceWorker.ready, timeout])
}

/**
 * Get FCM token for this device
 */
export async function getFCMToken(): Promise<string | null> {
  const messaging = await getMessagingInstance()
  if (!messaging) return null

  try {
    const registration = await getPushServiceWorkerRegistration()

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    })

    return token
  } catch (error) {
    console.error('Error getting FCM token:', error)
    return null
  }
}

/**
 * Subscribe to a zone topic for push notifications
 */
export async function subscribeToZone(zoneId: string): Promise<boolean> {
  const token = await getFCMToken()
  if (!token) return false

  try {
    const response = await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, topic: `zone-${zoneId}` }),
    })

    if (!response.ok) throw new Error('Subscribe failed')

    // Store in localStorage
    localStorage.setItem(STORAGE_KEYS.FCM_TOKEN, token)

    return true
  } catch (error) {
    console.error('Error subscribing to zone:', error)
    return false
  }
}

/**
 * Unsubscribe from a zone topic
 */
export async function unsubscribeFromZone(zoneId: string): Promise<boolean> {
  const token = localStorage.getItem(STORAGE_KEYS.FCM_TOKEN)
  if (!token) return true // Already unsubscribed

  try {
    const response = await fetch('/api/notifications/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, topic: `zone-${zoneId}` }),
    })

    if (!response.ok) throw new Error('Unsubscribe failed')

    return true
  } catch (error) {
    console.error('Error unsubscribing from zone:', error)
    return false
  }
}

/**
 * Enable push notifications for a district
 */
export async function enablePushNotifications(
  district: string,
  zoneId: string
): Promise<{ success: boolean; error?: string }> {
  // Check support
  const supported = await isPushSupported()
  if (!supported) {
    return { success: false, error: 'Push notifications not supported on this device' }
  }

  // Request permission
  const granted = await requestNotificationPermission()
  if (!granted) {
    return { success: false, error: 'Notification permission denied' }
  }

  // Subscribe to zone
  const subscribed = await subscribeToZone(zoneId)
  if (!subscribed) {
    return { success: false, error: 'Failed to subscribe to notifications' }
  }

  // Save to localStorage
  localStorage.setItem(STORAGE_KEYS.PUSH_ENABLED, 'true')
  localStorage.setItem(STORAGE_KEYS.NOTIFICATION_DISTRICT, district)
  localStorage.setItem(STORAGE_KEYS.NOTIFICATION_ZONE, zoneId)

  return { success: true }
}

/**
 * Disable push notifications
 */
export async function disablePushNotifications(): Promise<boolean> {
  const zoneId = localStorage.getItem(STORAGE_KEYS.NOTIFICATION_ZONE)

  if (zoneId) {
    await unsubscribeFromZone(zoneId)
  }

  // Clear localStorage
  localStorage.removeItem(STORAGE_KEYS.PUSH_ENABLED)
  localStorage.removeItem(STORAGE_KEYS.NOTIFICATION_DISTRICT)
  localStorage.removeItem(STORAGE_KEYS.NOTIFICATION_ZONE)
  localStorage.removeItem(STORAGE_KEYS.FCM_TOKEN)

  return true
}

/**
 * Change notification zone (when user moves to different district)
 */
export async function changeNotificationZone(
  newDistrict: string,
  newZoneId: string
): Promise<{ success: boolean; error?: string }> {
  const oldZoneId = localStorage.getItem(STORAGE_KEYS.NOTIFICATION_ZONE)

  // Unsubscribe from old zone
  if (oldZoneId && oldZoneId !== newZoneId) {
    await unsubscribeFromZone(oldZoneId)
  }

  // Subscribe to new zone
  const subscribed = await subscribeToZone(newZoneId)
  if (!subscribed) {
    // Try to resubscribe to old zone on failure
    if (oldZoneId) await subscribeToZone(oldZoneId)
    return { success: false, error: 'Failed to update notification zone' }
  }

  // Update localStorage
  localStorage.setItem(STORAGE_KEYS.NOTIFICATION_DISTRICT, newDistrict)
  localStorage.setItem(STORAGE_KEYS.NOTIFICATION_ZONE, newZoneId)

  return { success: true }
}

/**
 * Check if location change prompt should be shown
 */
export function shouldShowLocationChangePrompt(
  newZoneId: string,
  dismissedZones: Set<string>
): boolean {
  const settings = getPushSettings()

  if (!settings.enabled) return false
  if (!settings.zone) return false
  if (settings.zone === newZoneId) return false
  if (dismissedZones.has(newZoneId)) return false

  return true
}

/**
 * Show a prayer reminder from the page (used when a push arrives in the foreground).
 */
export async function showPrayerNotification(data?: PrayerPushData): Promise<boolean> {
  const { title, options } = buildPrayerNotification(data)
  return showNotificationFromPage(title, options)
}

/**
 * Set up foreground message handler.
 *
 * FCM does not display anything while the app is in the foreground, so the
 * page shows the reminder itself using the same builder and tag as the
 * service worker.
 */
export async function setupForegroundMessaging(
  onMessageReceived: (payload: { title?: string; body?: string; data?: Record<string, string> }) => void
): Promise<(() => void) | null> {
  const messaging = await getMessagingInstance()
  if (!messaging) return null

  const unsubscribe = onMessage(messaging, (payload) => {
    const data = payload.data as PrayerPushData | undefined

    onMessageReceived({
      title: data?.title ?? payload.notification?.title,
      body: data?.body ?? payload.notification?.body,
      data: payload.data,
    })

    void showPrayerNotification(data)
  })

  return unsubscribe
}
