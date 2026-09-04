/**
 * Push notification settings persisted in localStorage.
 * Kept free of Firebase imports so any module can read them cheaply.
 */

export const PUSH_STORAGE_KEYS = {
  PUSH_ENABLED: 'pushEnabled',
  NOTIFICATION_DISTRICT: 'notificationDistrict',
  NOTIFICATION_ZONE: 'notificationZone',
  FCM_TOKEN: 'fcmToken',
} as const

export interface PushSettings {
  enabled: boolean
  district: string | null
  zone: string | null
}

export function getPushSettings(): PushSettings {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return { enabled: false, district: null, zone: null }
  }

  return {
    enabled: localStorage.getItem(PUSH_STORAGE_KEYS.PUSH_ENABLED) === 'true',
    district: localStorage.getItem(PUSH_STORAGE_KEYS.NOTIFICATION_DISTRICT),
    zone: localStorage.getItem(PUSH_STORAGE_KEYS.NOTIFICATION_ZONE),
  }
}

export function isPushEnabled(): boolean {
  return getPushSettings().enabled
}
