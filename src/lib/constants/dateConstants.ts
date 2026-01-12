/**
 * Gregorian date constants
 */

/** First month of the Gregorian year (January) */
export const FIRST_GREGORIAN_MONTH = 1

/** Last month of the Gregorian year (December) */
export const LAST_GREGORIAN_MONTH = 12

/** Gregorian month names */
export const GREGORIAN_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
] as const

/** Day of week indices (matching JavaScript's Date.getDay()) */
export const DAY_INDEX = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
} as const

/** Abbreviated weekday labels for UI display (ordered Sun-Sat) */
export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const
