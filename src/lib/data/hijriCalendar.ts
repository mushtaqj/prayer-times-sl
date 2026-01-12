/**
 * Hijri Calendar Data Access Layer
 * Provides static data and utility functions for Hijri calendar operations
 */

import hijriData from '@/data/hijriCalendar.json'
import { eventVirtues as monthVirtuesData } from './virtues'
import type { HijriDate, HijriMonth, HijriMonthInfo, MoonPhase } from './types'

// Import pure date utilities
import { parseDate, addDays, daysBetween } from '@/lib/utils/date'

// Constants
const NEW_MOON_DAY = 1

// ============================================================================
// Static Data - Computed once at module load
// ============================================================================

/** All Hijri months from calendar data */
export const months = hijriData.months as HijriMonth[]

/** Hijri month info (names, meanings) */
export const hijriMonths = hijriData.hijriMonths as HijriMonthInfo[]

/** Available years in the data */
export const availableYears = [...new Set(months.map(m => m.hijriYear))].sort((a, b) => a - b)

/** Calendar metadata */
export const metadata = hijriData.metadata

// ============================================================================
// Enriched Data
// ============================================================================

/** Hijri months enriched with virtue details */
export const enrichedHijriMonths: HijriMonthInfo[] = hijriMonths.map(m => ({
  ...m,
  details: monthVirtuesData[String(m.number) as keyof typeof monthVirtuesData]
}))

// ============================================================================
// Moon Phase Functions
// ============================================================================

/**
 * Get moon phase based on day of Hijri month (approximate)
 */
export function getMoonPhase(hijriDay: number): MoonPhase {
  if (hijriDay === NEW_MOON_DAY) return { phase: 'New Moon', icon: '🌑' }
  if (hijriDay >= 2 && hijriDay <= 6) return { phase: 'Waxing Crescent', icon: '🌒' }
  if (hijriDay >= 7 && hijriDay <= 9) return { phase: 'First Quarter', icon: '🌓' }
  if (hijriDay >= 10 && hijriDay <= 13) return { phase: 'Waxing Gibbous', icon: '🌔' }
  if (hijriDay >= 14 && hijriDay <= 16) return { phase: 'Full Moon', icon: '🌕' }
  if (hijriDay >= 17 && hijriDay <= 20) return { phase: 'Waning Gibbous', icon: '🌖' }
  if (hijriDay >= 21 && hijriDay <= 24) return { phase: 'Last Quarter', icon: '🌗' }
  return { phase: 'Waning Crescent', icon: '🌘' }
}

// ============================================================================
// Date Conversion Functions
// ============================================================================

/**
 * Convert Gregorian date to Hijri date
 * Returns null if date is outside available data range
 */
export function gregorianToHijri(date: Date): HijriDate | null {
  for (const month of months) {
    const startDate = parseDate(month.gregorianStart)
    const endDate = addDays(startDate, month.days - 1)

    if (date >= startDate && date <= endDate) {
      const dayOfMonth = daysBetween(startDate, date) + 1
      return {
        day: dayOfMonth,
        month: month.hijriMonth,
        monthName: month.monthName,
        year: month.hijriYear,
        gregorianDate: date,
      }
    }
  }
  return null
}

/**
 * Convert Hijri date to Gregorian date
 * Returns null if the Hijri date is invalid or outside available data
 */
export function hijriToGregorian(
  hijriYear: number,
  hijriMonth: number,
  hijriDay: number
): Date | null {
  const month = months.find(
    m => m.hijriYear === hijriYear && m.hijriMonth === hijriMonth
  )

  if (!month) return null
  if (hijriDay < 1 || hijriDay > month.days) return null

  const startDate = parseDate(month.gregorianStart)
  return addDays(startDate, hijriDay - 1)
}

// ============================================================================
// Formatting Functions
// ============================================================================

/**
 * Format Hijri date for display
 */
export function formatHijriDate(
  hijri: HijriDate | null,
  style: 'short' | 'long' = 'long'
): string {
  if (!hijri) return ''

  if (style === 'short') {
    return `${hijri.day} ${hijri.monthName.substring(0, 3)} ${hijri.year}`
  }

  return `${hijri.day} ${hijri.monthName} ${hijri.year} AH`
}

// ============================================================================
// Query Functions
// ============================================================================

/** Get today's Hijri date */
export function getTodayHijri(): HijriDate | null {
  return gregorianToHijri(new Date())
}

/** Get Hijri month info by number */
export function getHijriMonthInfo(monthNumber: number): HijriMonthInfo | undefined {
  return hijriMonths.find(m => m.number === monthNumber)
}

/** Get enriched Hijri month info by number */
export function getEnrichedHijriMonthInfo(monthNumber: number): HijriMonthInfo | undefined {
  return enrichedHijriMonths.find(m => m.number === monthNumber)
}

/** Get ongoing Hijri month */
export function getOngoingHijriMonth(): HijriMonth | undefined {
  return months.find(m => m.status === 'ongoing')
}

/** Get Hijri month by year and month number */
export function getHijriMonth(year: number, month: number): HijriMonth | undefined {
  return months.find(
    m => m.hijriYear === year && m.hijriMonth === month
  )
}

// Static today's Hijri date (for components that don't need real-time updates)
export const todayHijri = getTodayHijri()
