import { useMemo, useState, useCallback } from 'react'
import hijriData from '@/data/hijriCalendar.json'

export interface HijriDate {
  day: number
  month: number
  monthName: string
  year: number
  gregorianDate: Date
}

export interface HijriMonth {
  hijriYear: number
  hijriMonth: number
  monthName: string
  gregorianStart: string
  days: number
  status: 'completed' | 'ongoing' | 'upcoming'
}

export interface HijriMonthMaster {
  number: number
  name: string
  nameArabic: string
  meaning: string
}

interface CalendarDay {
  hijriDay: number
  gregorianDate: Date
  isCurrentMonth: boolean
  isToday: boolean
}

// Get moon phase based on day of Hijri month (approximate)
export function getMoonPhase(hijriDay: number): { phase: string; icon: string } {
  if (hijriDay === 1) return { phase: 'New Moon', icon: '🌑' }
  if (hijriDay >= 2 && hijriDay <= 6) return { phase: 'Waxing Crescent', icon: '🌒' }
  if (hijriDay >= 7 && hijriDay <= 9) return { phase: 'First Quarter', icon: '🌓' }
  if (hijriDay >= 10 && hijriDay <= 13) return { phase: 'Waxing Gibbous', icon: '🌔' }
  if (hijriDay >= 14 && hijriDay <= 16) return { phase: 'Full Moon', icon: '🌕' }
  if (hijriDay >= 17 && hijriDay <= 20) return { phase: 'Waning Gibbous', icon: '🌖' }
  if (hijriDay >= 21 && hijriDay <= 24) return { phase: 'Last Quarter', icon: '🌗' }
  return { phase: 'Waning Crescent', icon: '🌘' }
}

function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000
  return Math.floor((date2.getTime() - date1.getTime()) / oneDay)
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
    return hijri?.month || 1
  })

  const months = useMemo(() => hijriData.months as HijriMonth[], [])

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
    if (currentHijriMonth === 1) {
      // Go to Dhul Hijjah of previous year
      const prevYearExists = months.some(m => m.hijriYear === currentHijriYear - 1)
      if (prevYearExists) {
        setCurrentHijriYear(currentHijriYear - 1)
        setCurrentHijriMonth(12)
      }
    } else {
      setCurrentHijriMonth(currentHijriMonth - 1)
    }
  }, [currentHijriMonth, currentHijriYear, months])

  // Navigate to next month
  const nextMonth = useCallback(() => {
    if (currentHijriMonth === 12) {
      // Go to Muharram of next year
      const nextYearExists = months.some(m => m.hijriYear === currentHijriYear + 1)
      if (nextYearExists) {
        setCurrentHijriYear(currentHijriYear + 1)
        setCurrentHijriMonth(1)
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
    if (currentHijriMonth === 1) {
      // Check if Dhul Hijjah of previous year exists
      return months.some(m => m.hijriYear === currentHijriYear - 1 && m.hijriMonth === 12)
    }
    // Check if previous month of current year exists
    return months.some(m => m.hijriYear === currentHijriYear && m.hijriMonth === currentHijriMonth - 1)
  }, [currentHijriMonth, currentHijriYear, months])

  // Check if we can navigate to next month
  const canGoNext = useMemo(() => {
    if (currentHijriMonth === 12) {
      // Check if Muharram of next year exists
      return months.some(m => m.hijriYear === currentHijriYear + 1 && m.hijriMonth === 1)
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
