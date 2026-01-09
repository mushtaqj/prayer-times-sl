import { useMemo } from 'react'
import eventsData from '@/data/islamicEvents.json'
import { gregorianToHijri } from './useHijriCalendar'
import type { HijriDate } from './useHijriCalendar'

export interface IslamicEvent {
  id: string
  name: string
  nameArabic: string
  hijriMonth: number
  hijriDay: number
  type: 'holy' | 'eid' | 'fast' | 'recommended'
  isFastingDay: boolean
  fastingType?: 'obligatory' | 'recommended' | 'sunnah'
  fastingForbidden?: boolean
  description: string
}

export interface HijriMonthInfo {
  number: number
  name: string
  nameArabic: string
  meaning: string
}

export function useIslamicEvents() {
  const events = useMemo(() => eventsData.events as IslamicEvent[], [])
  const hijriMonths = useMemo(() => eventsData.hijriMonths as HijriMonthInfo[], [])
  const recurringFasts = useMemo(() => eventsData.recurringFasts, [])

  // Get events for a specific Hijri date
  const getEventsForDate = useMemo(() => {
    return (hijriDate: HijriDate | null): IslamicEvent[] => {
      if (!hijriDate) return []
      return events.filter(
        e => e.hijriMonth === hijriDate.month && e.hijriDay === hijriDate.day
      )
    }
  }, [events])

  // Get events for a specific Hijri month
  const getEventsForMonth = useMemo(() => {
    return (hijriMonth: number): IslamicEvent[] => {
      return events.filter(e => e.hijriMonth === hijriMonth)
    }
  }, [events])

  // Check if a date is a fasting day
  const isFastingDay = useMemo(() => {
    return (hijriDate: HijriDate | null): { isFasting: boolean; type?: string; reason?: string } => {
      if (!hijriDate) return { isFasting: false }

      // Check fixed events
      const dayEvents = events.filter(
        e => e.hijriMonth === hijriDate.month && e.hijriDay === hijriDate.day
      )

      for (const event of dayEvents) {
        if (event.fastingForbidden) {
          return { isFasting: false, type: 'forbidden', reason: event.name }
        }
        if (event.isFastingDay) {
          return { isFasting: true, type: event.fastingType, reason: event.name }
        }
      }

      // Check Ramadan (entire month)
      if (hijriDate.month === 9) {
        return { isFasting: true, type: 'obligatory', reason: 'Ramadan' }
      }

      // Check Ayyam al-Beed (13th, 14th, 15th of each month)
      if (recurringFasts.monthly.ayyamAlBeed.days.includes(hijriDate.day)) {
        return { isFasting: true, type: 'sunnah', reason: 'Ayyam al-Beed (White Days)' }
      }

      // Check Monday/Thursday
      const dayOfWeek = hijriDate.gregorianDate.getDay()
      if (dayOfWeek === 1) {
        return { isFasting: true, type: 'sunnah', reason: 'Monday Fast' }
      }
      if (dayOfWeek === 4) {
        return { isFasting: true, type: 'sunnah', reason: 'Thursday Fast' }
      }

      return { isFasting: false }
    }
  }, [events, recurringFasts])

  // Get today's events
  const todayEvents = useMemo(() => {
    const today = new Date()
    const hijriToday = gregorianToHijri(today)
    return getEventsForDate(hijriToday)
  }, [getEventsForDate])

  // Get upcoming events (next 30 days)
  const upcomingEvents = useMemo(() => {
    const upcoming: { event: IslamicEvent; gregorianDate: Date; hijriDate: HijriDate }[] = []
    const today = new Date()
    const hijriToday = gregorianToHijri(today)

    if (!hijriToday) return []

    // Look through next 60 days (covers ~2 Hijri months)
    for (let i = 0; i < 60; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() + i)
      const hijri = gregorianToHijri(checkDate)

      if (hijri) {
        const dayEvents = getEventsForDate(hijri)
        for (const event of dayEvents) {
          upcoming.push({
            event,
            gregorianDate: checkDate,
            hijriDate: hijri,
          })
        }
      }
    }

    return upcoming
  }, [getEventsForDate])

  // Get month name by number
  const getMonthName = useMemo(() => {
    return (monthNumber: number): HijriMonthInfo | undefined => {
      return hijriMonths.find(m => m.number === monthNumber)
    }
  }, [hijriMonths])

  // Check if a specific Hijri day has an event
  const hasEvent = useMemo(() => {
    return (hijriMonth: number, hijriDay: number): boolean => {
      return events.some(e => e.hijriMonth === hijriMonth && e.hijriDay === hijriDay)
    }
  }, [events])

  // Get event type colors for styling
  const getEventTypeColor = (type: string): string => {
    switch (type) {
      case 'eid':
        return 'bg-green-500/20 text-green-600 dark:text-green-400'
      case 'holy':
        return 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
      case 'fast':
        return 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
      case 'recommended':
        return 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  return {
    events,
    hijriMonths,
    recurringFasts,
    todayEvents,
    upcomingEvents,
    getEventsForDate,
    getEventsForMonth,
    isFastingDay,
    getMonthName,
    hasEvent,
    getEventTypeColor,
  }
}
