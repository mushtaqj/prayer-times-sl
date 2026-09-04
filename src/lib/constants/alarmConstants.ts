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

/** Reminder time in minutes (for display) */
export const REMINDER_BEFORE_MINUTES = 10

/** Reminder time before prayer (in milliseconds) - derived from minutes */
export const REMINDER_BEFORE_MS = REMINDER_BEFORE_MINUTES * 60 * 1000

/** Notification icon path (shared with push notifications) */
export { NOTIFICATION_ICON } from '@/lib/notifications/prayerNotification'

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
