/**
 * Firebase Cloud Messaging utilities for push notifications
 */

import { getToken, onMessage } from 'firebase/messaging'
import { getMessagingInstance, VAPID_KEY } from './config'

// Storage keys
const STORAGE_KEYS = {
  PUSH_ENABLED: 'pushEnabled',
  NOTIFICATION_DISTRICT: 'notificationDistrict',
  NOTIFICATION_ZONE: 'notificationZone',
  FCM_TOKEN: 'fcmToken',
} as const

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
 * Get FCM token for this device
 */
export async function getFCMToken(): Promise<string | null> {
  const messaging = await getMessagingInstance()
  if (!messaging) return null

  try {
    console.log('Getting FCM token with VAPID key:', VAPID_KEY?.substring(0, 20) + '...')

    // First, ensure Firebase messaging service worker is registered
    const registrations = await navigator.serviceWorker.getRegistrations()
    console.log('Existing service worker registrations:', registrations.length)

    let firebaseReg = registrations.find(r => r.active?.scriptURL.includes('firebase-messaging-sw.js'))

    if (!firebaseReg) {
      console.log('Registering Firebase messaging service worker...')
      firebaseReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js')

      // Wait for it to be active
      if (!firebaseReg.active) {
        console.log('Waiting for Firebase SW to activate...')
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('SW activation timeout')), 10000)

          const checkState = () => {
            if (firebaseReg!.active) {
              clearTimeout(timeout)
              resolve()
            }
          }

          firebaseReg!.addEventListener('updatefound', () => {
            const newWorker = firebaseReg!.installing
            newWorker?.addEventListener('statechange', checkState)
          })

          // Check immediately in case it's already active
          checkState()
        })
      }
      console.log('Firebase SW registered and active')
    } else {
      console.log('Firebase SW already registered:', firebaseReg.active?.scriptURL)
    }

    console.log('Requesting FCM token...')
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: firebaseReg,
    })

    console.log('FCM Token obtained successfully:', token?.substring(0, 20) + '...')
    return token
  } catch (error) {
    console.error('Error getting FCM token:', error)
    console.error('VAPID_KEY present:', !!VAPID_KEY)
    console.error('VAPID_KEY length:', VAPID_KEY?.length)
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
 * Get current push notification settings
 */
export function getPushSettings(): {
  enabled: boolean
  district: string | null
  zone: string | null
} {
  if (typeof window === 'undefined') {
    return { enabled: false, district: null, zone: null }
  }

  return {
    enabled: localStorage.getItem(STORAGE_KEYS.PUSH_ENABLED) === 'true',
    district: localStorage.getItem(STORAGE_KEYS.NOTIFICATION_DISTRICT),
    zone: localStorage.getItem(STORAGE_KEYS.NOTIFICATION_ZONE),
  }
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
 * Set up foreground message handler
 */
export async function setupForegroundMessaging(
  onMessageReceived: (payload: { title?: string; body?: string; data?: Record<string, string> }) => void
): Promise<(() => void) | null> {
  const messaging = await getMessagingInstance()
  if (!messaging) return null

  const unsubscribe = onMessage(messaging, (payload) => {
    onMessageReceived({
      title: payload.notification?.title,
      body: payload.notification?.body,
      data: payload.data,
    })
  })

  return unsubscribe
}
