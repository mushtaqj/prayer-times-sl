import { useMemo } from 'react'
import eventsData from '@/data/islamicEvents.json'
import virtuesData from '@/data/virtues.json'
import { gregorianToHijri } from './useHijriCalendar'
import {
  getFastingInfo,
  getAllEventsForDay as getAllEventsForDayUtil,
  hasEventOnDay,
  getEventTypeColor,
} from '@/lib/eventMatching'
import type {
  HijriDate,
  IslamicEvent,
  HijriMonthInfo,
  WeeklyFast,
  AnnualFast,
  MonthlyFast,
  RecurringFasts,
  FastingInfo,
  DayEvent,
} from '@/lib/data/types'

// Re-export types for backwards compatibility
export type { IslamicEvent, HijriMonthInfo }

export function useIslamicEvents() {
  // Load and enrich events with virtue details
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const events: IslamicEvent[] = useMemo(() => {
    return (eventsData.events as IslamicEvent[]).map(e => ({
      ...e,
      details: virtuesData.events[e.id as keyof typeof virtuesData.events]
    }))
  }, [])

  // Load and enrich hijri months with virtue details
  const hijriMonths = useMemo(() => {
    return (eventsData.hijriMonths as HijriMonthInfo[]).map(m => ({
      ...m,
      details: virtuesData.months[String(m.number) as keyof typeof virtuesData.months]
    }))
  }, [])

  // Load and enrich recurring fasts with virtue details
  const recurringFasts: RecurringFasts = useMemo(() => {
    const rf = eventsData.recurringFasts

    const annual: AnnualFast[] = rf.annual.map(f => ({
      ...f,
      timing: f.timing as 'fixed' | 'flexible' | undefined,
      details: virtuesData.recurring[f.id as keyof typeof virtuesData.recurring]
    }))

    const monthly: MonthlyFast = {
      ...rf.monthly,
      ayyamAlBeed: {
        ...rf.monthly.ayyamAlBeed,
        details: virtuesData.recurring['ayyam-al-beed']
      }
    }

    const weekly: WeeklyFast[] = rf.weekly.map(f => ({
      ...f,
      details: virtuesData.recurring[f.id as keyof typeof virtuesData.recurring]
    }))

    const friday = {
      id: 'friday',
      name: 'Friday',
      nameArabic: 'يوم الجمعة',
      details: virtuesData.recurring['friday' as keyof typeof virtuesData.recurring]
    }

    return { annual, monthly, weekly, friday }
  }, [])

  // Get events for a specific Hijri date
  const getEventsForDate = useMemo(() => {
    return (hijriDate: HijriDate | null): IslamicEvent[] => {
      if (!hijriDate) return []
      return events.filter(
        e => e.hijriMonth === hijriDate.month && e.hijriDay === hijriDate.day
      )
    }
  }, [events])

  // Get events for a specific Hijri month (including annual recurring)
  const getEventsForMonth = useMemo(() => {
    return (hijriMonth: number): IslamicEvent[] => {
      const monthEvents = events.filter(e => e.hijriMonth === hijriMonth)

      // Add any annual recurring events for this month
      const annualEvents = recurringFasts.annual.filter(e => e.hijriMonth === hijriMonth)

      annualEvents.forEach(event => {
        const eventToAdd: IslamicEvent = {
          id: event.id,
          name: event.name,
          nameArabic: event.nameArabic,
          hijriMonth: event.hijriMonth,
          hijriDay: 0,
          type: event.type as IslamicEvent['type'],
          isFastingDay: true,
          fastingType: event.type === 'recommended' ? 'recommended' : 'sunnah',
          description: event.description,
          details: event.details,
          isRecurring: true
        }
        monthEvents.push(eventToAdd)
      })

      return monthEvents
    }
  }, [events, recurringFasts.annual])

  // Check if a date is a fasting day - uses eventMatching utility
  const isFastingDay = useMemo(() => {
    return (hijriDate: HijriDate | null): FastingInfo => {
      if (!hijriDate) return { isFasting: false }

      const dayEvents = events.filter(
        e => e.hijriMonth === hijriDate.month && e.hijriDay === hijriDate.day
      )

      return getFastingInfo(
        hijriDate,
        dayEvents,
        recurringFasts.monthly.ayyamAlBeed.days
      )
    }
  }, [events, recurringFasts.monthly.ayyamAlBeed.days])

  // Get today's events
  const todayEvents = useMemo(() => {
    const today = new Date()
    const hijriToday = gregorianToHijri(today)
    return getEventsForDate(hijriToday)
  }, [getEventsForDate])

  // Get upcoming events (next 60 days)
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const upcomingEvents = useMemo(() => {
    const upcoming: { event: IslamicEvent; gregorianDate: Date; hijriDate: HijriDate }[] = []
    const today = new Date()
    const hijriToday = gregorianToHijri(today)

    if (!hijriToday) return []

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

  // Check if a specific Hijri day has an event - uses eventMatching utility
  const hasEvent = useMemo(() => {
    return (hijriMonth: number, hijriDay: number): boolean => {
      return hasEventOnDay(hijriMonth, hijriDay, events, recurringFasts.annual)
    }
  }, [events, recurringFasts.annual])

  // Get all events for a specific day including recurring - uses eventMatching utility
  const getAllEventsForDay = useMemo(() => {
    return (hijriMonth: number, hijriDay: number, gregorianDate?: Date): DayEvent[] => {
      return getAllEventsForDayUtil(
        hijriMonth,
        hijriDay,
        gregorianDate,
        events,
        recurringFasts.annual,
        recurringFasts.monthly.ayyamAlBeed.details,
        {
          monday: recurringFasts.weekly.find(f => f.id === 'monday-fast')?.details,
          thursday: recurringFasts.weekly.find(f => f.id === 'thursday-fast')?.details
        }
      )
    }
  }, [events, recurringFasts])

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
