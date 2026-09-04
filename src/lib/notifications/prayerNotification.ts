/**
 * Prayer notification builder.
 *
 * Shared by the service worker (background push), the foreground FCM handler,
 * and the local alarm scheduler so every path produces the same notification.
 * All prayer reminders share one tag: a new reminder replaces the previous one
 * instead of piling up in the notification tray.
 */

export const PRAYER_REMINDER_TAG = 'prayer-reminder'
export const PRAYER_TIME_TAG = 'prayer-time'
export const NOTIFICATION_ICON = '/icon-192x192.png'
/** Monochrome (white on transparent) status-bar icon; Android renders it as an alpha mask. */
export const NOTIFICATION_BADGE = '/badge-96x96.png'
export const NOTIFICATION_CLICK_URL = '/prayer'
export const REMINDER_MINUTES = 10

/** Data payload sent by the Cloud Function (data-only FCM message). */
export interface PrayerPushData {
  prayer?: string
  zone?: string
  time?: string
  title?: string
  body?: string
}

/** NotificationOptions plus fields TypeScript's DOM lib omits but browsers support. */
export interface PrayerNotificationOptions extends NotificationOptions {
  renotify?: boolean
  vibrate?: number[]
  timestamp?: number
}

export interface PrayerNotification {
  title: string
  options: PrayerNotificationOptions
}

const PRAYER_DISPLAY_NAMES: Record<string, string> = {
  fajr: 'Fajr',
  sunrise: 'Sunrise',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
}

export function getPrayerDisplayName(prayer?: string): string {
  if (!prayer) return 'Prayer'
  const key = prayer.toLowerCase()
  return PRAYER_DISPLAY_NAMES[key] ?? key.charAt(0).toUpperCase() + key.slice(1)
}

/**
 * Build the notification for a prayer reminder push.
 * Falls back to sensible text when the payload carries no title/body.
 */
export function buildPrayerNotification(
  data: PrayerPushData = {},
  now: number = Date.now()
): PrayerNotification {
  const name = getPrayerDisplayName(data.prayer)
  const title = data.title || `${name} Prayer`
  const body =
    data.body ||
    (data.time
      ? `${name} is in ${REMINDER_MINUTES} minutes (${data.time})`
      : `${name} is in ${REMINDER_MINUTES} minutes`)

  return {
    title,
    options: {
      body,
      icon: NOTIFICATION_ICON,
      badge: NOTIFICATION_BADGE,
      tag: PRAYER_REMINDER_TAG,
      renotify: true,
      requireInteraction: false,
      vibrate: [200, 100, 200],
      timestamp: now,
      data: {
        url: NOTIFICATION_CLICK_URL,
        prayer: data.prayer,
        zone: data.zone,
        time: data.time,
      },
    },
  }
}
