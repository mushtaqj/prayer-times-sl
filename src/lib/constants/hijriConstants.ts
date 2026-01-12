/**
 * Hijri calendar constants - single source of truth for magic numbers
 */

import { DAY_INDEX } from './dateConstants'

// Hijri year structure
export const MONTHS_IN_HIJRI_YEAR = 12
export const FIRST_HIJRI_MONTH = 1
export const LAST_HIJRI_MONTH = 12

// Hijri month lengths
export const VALID_MONTH_DAYS = [29, 30] as const
export const DEFAULT_MONTH_DAYS = 30

// Special months (1-indexed)
export const HIJRI_MONTHS = {
  MUHARRAM: 1,
  SAFAR: 2,
  RABI_AL_AWWAL: 3,
  RABI_AL_THANI: 4,
  JUMADA_AL_AWWAL: 5,
  JUMADA_AL_AKHIRAH: 6,
  RAJAB: 7,
  SHABAN: 8,
  RAMADAN: 9,
  SHAWWAL: 10,
  DHUL_QADAH: 11,
  DHUL_HIJJAH: 12,
} as const

// Sacred months in Islam
export const SACRED_MONTH_NUMBERS: readonly number[] = [
  HIJRI_MONTHS.MUHARRAM,
  HIJRI_MONTHS.RAJAB,
  HIJRI_MONTHS.DHUL_QADAH,
  HIJRI_MONTHS.DHUL_HIJJAH,
]

// Sunnah fasting days (uses DAY_INDEX from dateConstants)
export const SUNNAH_FASTING_DAYS = [DAY_INDEX.MONDAY, DAY_INDEX.THURSDAY] as const

// Ayyam al-Beed (White Days) - 13th, 14th, 15th of each Hijri month
export const AYYAM_AL_BEED_DAYS: readonly number[] = [13, 14, 15]

// Moon phase days
export const NEW_MOON_DAY = 1
export const FULL_MOON_DAY = 15

// Days to display moon phase icon (new moon on 1st, full moon on 15th)
export const MOON_PHASE_DISPLAY_DAYS = [NEW_MOON_DAY, FULL_MOON_DAY] as const

// Ramadan month name for string comparisons
export const RAMADAN_NAME = 'Ramadan'

// ============================================================================
// Fasting Types
// ============================================================================

/** Fasting type values */
export const FASTING_TYPE = {
  OBLIGATORY: 'obligatory',
  SUNNAH: 'sunnah',
  RECOMMENDED: 'recommended',
  FORBIDDEN: 'forbidden',
} as const

// ============================================================================
// Fast Names (for recurring fasts)
// ============================================================================

/** Recurring fast names */
export const FAST_NAMES = {
  AYYAM_AL_BEED: 'Ayyam al-Beed',
  AYYAM_AL_BEED_FULL: 'Ayyam al-Beed (White Days)',
  MONDAY_FAST: 'Monday Fast',
  THURSDAY_FAST: 'Thursday Fast',
} as const

// ============================================================================
// Event Types
// ============================================================================

/** Event type values */
export const EVENT_TYPE = {
  EID: 'eid',
  HOLY: 'holy',
  FAST: 'fast',
  RECOMMENDED: 'recommended',
  SUNNAH: 'sunnah',
} as const

/** Event timing values */
export const EVENT_TIMING = {
  FIXED: 'fixed',
} as const
