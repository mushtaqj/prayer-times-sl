/**
 * Alarm and notification constants
 */

import type { PrayerName } from '@/lib/data/types'

// ============================================================================
// Storage
// ============================================================================

/** Storage key for prayer alarms */
export const ALARM_STORAGE_KEY = 'prayerAlarms'

// ============================================================================
// Notification Settings
// ============================================================================

/** Reminder time before prayer (in milliseconds) */
export const REMINDER_BEFORE_MS = 10 * 60 * 1000 // 10 minutes

/** Reminder time in minutes (for display) */
export const REMINDER_BEFORE_MINUTES = 10

/** Notification icon path */
export const NOTIFICATION_ICON = '/icon-192x192.png'

// ============================================================================
// Default State
// ============================================================================

/** Default alarm settings (all off) */
export const DEFAULT_ALARMS: Record<PrayerName, boolean> = {
  fajr: false,
  sunrise: false,
  dhuhr: false,
  asr: false,
  maghrib: false,
  isha: false,
}
