/**
 * Hijri calendar utility functions
 * Pure functions for date conversion and formatting
 */

import hijriData from '@/data/hijriCalendar.json'
import type { HijriDate, HijriMonth, HijriMonthInfo, MoonPhase } from '@/lib/data/types'
import { parseDate, addDays, daysBetween } from '@/lib/dateUtils'
import { NEW_MOON_DAY } from '@/lib/hijriConstants'

// Static data - computed once at module load
export const months = hijriData.months as HijriMonth[]
export const hijriMonths = hijriData.hijriMonths as HijriMonthInfo[]
export const availableYears = [...new Set(months.map(m => m.hijriYear))].sort((a, b) => a - b)

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

/**
 * Get today's Hijri date
 * Computed once - for real-time updates, call gregorianToHijri(new Date())
 */
export const todayHijri = gregorianToHijri(new Date())
