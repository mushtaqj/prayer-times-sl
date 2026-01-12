import { useMemo, useState, useCallback } from 'react'
import hijriData from '@/data/hijriCalendar.json'
import type { HijriDate, HijriMonth, HijriMonthInfo, CalendarDay, MoonPhase } from '@/lib/data/types'
import { parseDate, isSameDay, addDays, daysBetween } from '@/lib/dateUtils'
import {
  FIRST_HIJRI_MONTH,
  LAST_HIJRI_MONTH,
  NEW_MOON_DAY,
} from '@/lib/hijriConstants'

// Re-export types for backwards compatibility
export type { HijriDate, HijriMonth, HijriMonthInfo as HijriMonthMaster, CalendarDay }

// Get moon phase based on day of Hijri month (approximate)
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

export function useHijriCalendar() {
  const [currentHijriYear, setCurrentHijriYear] = useState<number>(() => {
    // Default to current year's Hijri year
    const today = new Date()
    const hijri = gregorianToHijri(today)
    return hijri?.year || 1446
  })

  const [currentHijriMonth, setCurrentHijriMonth] = useState<number>(() => {
    const today = new Date()
    const hijri = gregorianToHijri(today)
    return hijri?.month || FIRST_HIJRI_MONTH
  })

  const months = useMemo(() => hijriData.months as HijriMonth[], [])

  // Hijri month metadata (names, meanings) - single source of truth
  const hijriMonths = useMemo(() => hijriData.hijriMonths as HijriMonthInfo[], [])

  // Convert Gregorian date to Hijri
  const gregorianToHijriMemo = useCallback((date: Date): HijriDate | null => {
    return gregorianToHijri(date)
  }, [])

  // Get today's Hijri date
  const todayHijri = useMemo(() => {
    const today = new Date()
    return gregorianToHijri(today)
  }, [])

  // Get current month data
  const currentMonthData = useMemo(() => {
    return months.find(
      m => m.hijriYear === currentHijriYear && m.hijriMonth === currentHijriMonth
    )
  }, [months, currentHijriYear, currentHijriMonth])

  // Get calendar days for the current month view
  const calendarDays = useMemo((): CalendarDay[] => {
    if (!currentMonthData) return []

    const today = new Date()
    const days: CalendarDay[] = []
    const startDate = parseDate(currentMonthData.gregorianStart)

    for (let i = 0; i < currentMonthData.days; i++) {
      const gregorianDate = addDays(startDate, i)
      days.push({
        hijriDay: i + 1,
        gregorianDate,
        isCurrentMonth: true,
        isToday: isSameDay(gregorianDate, today),
      })
    }

    return days
  }, [currentMonthData])

  // Navigate to previous month
  const previousMonth = useCallback(() => {
    if (currentHijriMonth === FIRST_HIJRI_MONTH) {
      // Go to Dhul Hijjah of previous year
      const prevYearExists = months.some(m => m.hijriYear === currentHijriYear - 1)
      if (prevYearExists) {
        setCurrentHijriYear(currentHijriYear - 1)
        setCurrentHijriMonth(LAST_HIJRI_MONTH)
      }
    } else {
      setCurrentHijriMonth(currentHijriMonth - 1)
    }
  }, [currentHijriMonth, currentHijriYear, months])

  // Navigate to next month
  const nextMonth = useCallback(() => {
    if (currentHijriMonth === LAST_HIJRI_MONTH) {
      // Go to Muharram of next year
      const nextYearExists = months.some(m => m.hijriYear === currentHijriYear + 1)
      if (nextYearExists) {
        setCurrentHijriYear(currentHijriYear + 1)
        setCurrentHijriMonth(FIRST_HIJRI_MONTH)
      }
    } else {
      setCurrentHijriMonth(currentHijriMonth + 1)
    }
  }, [currentHijriMonth, currentHijriYear, months])

  // Go to today
  const goToToday = useCallback(() => {
    if (todayHijri) {
      setCurrentHijriYear(todayHijri.year)
      setCurrentHijriMonth(todayHijri.month)
    }
  }, [todayHijri])

  // Check if we can navigate to previous month
  const canGoPrevious = useMemo(() => {
    if (currentHijriMonth === FIRST_HIJRI_MONTH) {
      // Check if Dhul Hijjah of previous year exists
      return months.some(m => m.hijriYear === currentHijriYear - 1 && m.hijriMonth === LAST_HIJRI_MONTH)
    }
    // Check if previous month of current year exists
    return months.some(m => m.hijriYear === currentHijriYear && m.hijriMonth === currentHijriMonth - 1)
  }, [currentHijriMonth, currentHijriYear, months])

  // Check if we can navigate to next month
  const canGoNext = useMemo(() => {
    if (currentHijriMonth === LAST_HIJRI_MONTH) {
      // Check if Muharram of next year exists
      return months.some(m => m.hijriYear === currentHijriYear + 1 && m.hijriMonth === FIRST_HIJRI_MONTH)
    }
    // Check if next month of current year exists
    return months.some(m => m.hijriYear === currentHijriYear && m.hijriMonth === currentHijriMonth + 1)
  }, [currentHijriMonth, currentHijriYear, months])

  // Get available years range
  const yearsRange = useMemo(() => {
    const years = [...new Set(months.map(m => m.hijriYear))].sort()
    return {
      min: years[0],
      max: years[years.length - 1],
    }
  }, [months])

  // Get array of available years
  const availableYears = useMemo(() => {
    return [...new Set(months.map(m => m.hijriYear))].sort()
  }, [months])

  // Navigate to a specific month
  const goToMonth = useCallback((year: number, month: number) => {
    const monthExists = months.some(m => m.hijriYear === year && m.hijriMonth === month)
    if (monthExists) {
      setCurrentHijriYear(year)
      setCurrentHijriMonth(month)
    }
  }, [months])

  return {
    todayHijri,
    currentMonthData,
    currentHijriYear,
    currentHijriMonth,
    calendarDays,
    hijriMonths,
    previousMonth,
    nextMonth,
    goToToday,
    goToMonth,
    canGoPrevious,
    canGoNext,
    yearsRange,
    availableYears,
    gregorianToHijri: gregorianToHijriMemo,
    getMoonPhase,
    setCurrentHijriYear,
    setCurrentHijriMonth,
  }
}

// Standalone function for use outside the hook
export function gregorianToHijri(date: Date): HijriDate | null {
  const months = hijriData.months as HijriMonth[]

  // Find the Hijri month that contains this Gregorian date
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

// Convert Hijri date to Gregorian
export function hijriToGregorian(
  hijriYear: number,
  hijriMonth: number,
  hijriDay: number
): Date | null {
  const months = hijriData.months as HijriMonth[]

  const month = months.find(
    m => m.hijriYear === hijriYear && m.hijriMonth === hijriMonth
  )

  if (!month) return null
  if (hijriDay < 1 || hijriDay > month.days) return null

  const startDate = parseDate(month.gregorianStart)
  return addDays(startDate, hijriDay - 1)
}

// Format Hijri date for display
export function formatHijriDate(hijri: HijriDate | null, style: 'short' | 'long' = 'long'): string {
  if (!hijri) return ''

  if (style === 'short') {
    return `${hijri.day} ${hijri.monthName.substring(0, 3)} ${hijri.year}`
  }

  return `${hijri.day} ${hijri.monthName} ${hijri.year} AH`
}
