/**
 * React hook for Hijri calendar state management
 */

import { useMemo, useState, useCallback } from 'react'
import type { CalendarDay } from '@/lib/data/types'
import { parseDate, isSameDay, addDays } from '@/lib/utils/date'
import { FIRST_HIJRI_MONTH, LAST_HIJRI_MONTH } from '@/lib/utils/hijriConstants'
import {
  months,
  hijriMonths,
  availableYears,
  todayHijri,
  gregorianToHijri,
} from '@/lib/data/hijriCalendar'

export function useHijriCalendar() {
  const [currentHijriYear, setCurrentHijriYear] = useState<number>(
    todayHijri?.year ?? availableYears[0]
  )

  const [currentHijriMonth, setCurrentHijriMonth] = useState<number>(
    todayHijri?.month ?? FIRST_HIJRI_MONTH
  )

  // Get current month data
  const currentMonthData = useMemo(() => {
    return months.find(
      m => m.hijriYear === currentHijriYear && m.hijriMonth === currentHijriMonth
    )
  }, [currentHijriYear, currentHijriMonth])

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
      const prevYearExists = months.some(m => m.hijriYear === currentHijriYear - 1)
      if (prevYearExists) {
        setCurrentHijriYear(currentHijriYear - 1)
        setCurrentHijriMonth(LAST_HIJRI_MONTH)
      }
    } else {
      setCurrentHijriMonth(currentHijriMonth - 1)
    }
  }, [currentHijriMonth, currentHijriYear])

  // Navigate to next month
  const nextMonth = useCallback(() => {
    if (currentHijriMonth === LAST_HIJRI_MONTH) {
      const nextYearExists = months.some(m => m.hijriYear === currentHijriYear + 1)
      if (nextYearExists) {
        setCurrentHijriYear(currentHijriYear + 1)
        setCurrentHijriMonth(FIRST_HIJRI_MONTH)
      }
    } else {
      setCurrentHijriMonth(currentHijriMonth + 1)
    }
  }, [currentHijriMonth, currentHijriYear])

  // Go to today
  const goToToday = useCallback(() => {
    const today = gregorianToHijri(new Date())
    if (today) {
      setCurrentHijriYear(today.year)
      setCurrentHijriMonth(today.month)
    }
  }, [])

  // Check if we can navigate to previous month
  const canGoPrevious = useMemo(() => {
    if (currentHijriMonth === FIRST_HIJRI_MONTH) {
      return months.some(m => m.hijriYear === currentHijriYear - 1 && m.hijriMonth === LAST_HIJRI_MONTH)
    }
    return months.some(m => m.hijriYear === currentHijriYear && m.hijriMonth === currentHijriMonth - 1)
  }, [currentHijriMonth, currentHijriYear])

  // Check if we can navigate to next month
  const canGoNext = useMemo(() => {
    if (currentHijriMonth === LAST_HIJRI_MONTH) {
      return months.some(m => m.hijriYear === currentHijriYear + 1 && m.hijriMonth === FIRST_HIJRI_MONTH)
    }
    return months.some(m => m.hijriYear === currentHijriYear && m.hijriMonth === currentHijriMonth + 1)
  }, [currentHijriMonth, currentHijriYear])

  // Navigate to a specific month
  const goToMonth = useCallback((year: number, month: number) => {
    const monthExists = months.some(m => m.hijriYear === year && m.hijriMonth === month)
    if (monthExists) {
      setCurrentHijriYear(year)
      setCurrentHijriMonth(month)
    }
  }, [])

  return {
    todayHijri,
    currentMonthData,
    currentHijriYear,
    currentHijriMonth,
    calendarDays,
    hijriMonths,
    availableYears,
    previousMonth,
    nextMonth,
    goToToday,
    goToMonth,
    canGoPrevious,
    canGoNext,
  }
}
