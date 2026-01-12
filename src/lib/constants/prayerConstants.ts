/**
 * Prayer-related constants
 */

// ============================================================================
// Prayer Names
// ============================================================================

/** Prayer name identifiers */
export const PRAYER_NAME = {
  FAJR: 'fajr',
  SUNRISE: 'sunrise',
  DHUHR: 'dhuhr',
  ASR: 'asr',
  MAGHRIB: 'maghrib',
  ISHA: 'isha',
} as const

/** Derived PrayerName type from constants */
export type PrayerName = typeof PRAYER_NAME[keyof typeof PRAYER_NAME]

/** Ordered list of prayer names */
export const PRAYER_NAMES: PrayerName[] = [
  PRAYER_NAME.FAJR,
  PRAYER_NAME.SUNRISE,
  PRAYER_NAME.DHUHR,
  PRAYER_NAME.ASR,
  PRAYER_NAME.MAGHRIB,
  PRAYER_NAME.ISHA,
]

// ============================================================================
// Prayer Indices
// ============================================================================

/** Prayer indices for lookup (matches PRAYER_NAMES order) */
export const PRAYER_INDEX = {
  FAJR: 0,
  SUNRISE: 1,
  DHUHR: 2,
  ASR: 3,
  MAGHRIB: 4,
  ISHA: 5,
} as const

// ============================================================================
// Prayer Metadata
// ============================================================================

/** Prayer display names and Arabic names */
export const PRAYER_METADATA: Record<PrayerName, { displayName: string; arabicName: string }> = {
  fajr: { displayName: 'Fajr', arabicName: 'الفجر' },
  sunrise: { displayName: 'Sunrise', arabicName: 'الشروق' },
  dhuhr: { displayName: 'Dhuhr', arabicName: 'الظهر' },
  asr: { displayName: 'Asr', arabicName: 'العصر' },
  maghrib: { displayName: 'Maghrib', arabicName: 'المغرب' },
  isha: { displayName: 'Isha', arabicName: 'العشاء' },
}

// ============================================================================
// Defaults
// ============================================================================

/** Default district ID */
export const DEFAULT_DISTRICT_ID = 'colombo'
