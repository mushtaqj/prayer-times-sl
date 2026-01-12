import { useMemo, useCallback } from 'react'
import {
  events,
  hijriMonths,
  recurringFasts,
  getEventsForDate as getEventsForDateUtil,
  getEventsForMonth as getEventsForMonthUtil,
  getFastingInfo as getFastingInfoUtil,
  hasEvent as hasEventUtil,
  getAllEventsForDay as getAllEventsForDayUtil,
  getMonthByNumber,
  getTodayEvents,
  getUpcomingEvents,
  getEventTypeColor,
} from '@/lib/data/islamicEvents'
import type { HijriDate, IslamicEvent, FastingInfo, DayEvent } from '@/lib/data/types'

/**
 * Hook for accessing Islamic events data
 * Wraps the data layer with React-specific optimizations
 */
export function useIslamicEvents() {
  // Wrap pure functions in useCallback for stable references
  const getEventsForDate = useCallback((hijriDate: HijriDate | null): IslamicEvent[] => {
    if (!hijriDate) return []
    return getEventsForDateUtil(hijriDate.month, hijriDate.day)
  }, [])

  const getEventsForMonth = useCallback((hijriMonth: number): IslamicEvent[] => {
    return getEventsForMonthUtil(hijriMonth)
  }, [])

  const isFastingDay = useCallback((hijriDate: HijriDate | null): FastingInfo => {
    if (!hijriDate) return { isFasting: false }
    return getFastingInfoUtil(hijriDate)
  }, [])

  const getMonthName = useCallback((monthNumber: number) => {
    return getMonthByNumber(monthNumber)
  }, [])

  const hasEvent = useCallback((hijriMonth: number, hijriDay: number): boolean => {
    return hasEventUtil(hijriMonth, hijriDay)
  }, [])

  const getAllEventsForDay = useCallback((
    hijriMonth: number,
    hijriDay: number,
    gregorianDate?: Date
  ): DayEvent[] => {
    return getAllEventsForDayUtil(hijriMonth, hijriDay, gregorianDate)
  }, [])

  // Computed values that depend on current date
  const todayEvents = useMemo(() => getTodayEvents(), [])
  const upcomingEvents = useMemo(() => getUpcomingEvents(), [])

  return {
    events,
    hijriMonths,
    recurringFasts,
    todayEvents,
    upcomingEvents,
    getEventsForDate,
    getEventsForMonth,
    getAllEventsForDay,
    isFastingDay,
    getMonthName,
    hasEvent,
    getEventTypeColor,
  }
}
