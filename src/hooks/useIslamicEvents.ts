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
  isRecurring?: boolean
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
      const monthEvents = events.filter(e => e.hijriMonth === hijriMonth)

      // Add any annual recurring events for this month (e.g. Shawwal 6 days, Dhul Hijjah 1st 9 days)
      const annualEvents = recurringFasts.annual.filter(e => e.hijriMonth === hijriMonth)

      annualEvents.forEach(event => {
        monthEvents.push({
          id: event.id,
          name: event.name,
          nameArabic: event.nameArabic,
          hijriMonth: event.hijriMonth,
          hijriDay: 0, // 0 indicates general month event or range
          type: event.type as any,
          isFastingDay: true,
          fastingType: event.type === 'recommended' ? 'recommended' : 'sunnah',
          description: event.description,
          isRecurring: true
        })
      })

      return monthEvents
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

      // Priority 1: Check if ANY event forbids fasting (Eid, Tashreeq)
      if (dayEvents.some(e => e.fastingForbidden)) {
        const forbiddenEvent = dayEvents.find(e => e.fastingForbidden)
        return { isFasting: false, type: 'forbidden', reason: forbiddenEvent?.name }
      }

      // Priority 2: Check for specific fasting events (e.g. Arafah)
      // We check this AFTER forbidden to ensure we don't fast on Eid even if another event mistakenly says yes
      for (const event of dayEvents) {
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

  // Check if a specific Hijri day has an event (including recurring)
  const hasEvent = useMemo(() => {
    return (hijriMonth: number, hijriDay: number): boolean => {
      // Check fixed events
      if (events.some(e => e.hijriMonth === hijriMonth && e.hijriDay === hijriDay)) {
        return true
      }
      // Check Ayyam al-Beed (13, 14, 15 of each month)
      if ([13, 14, 15].includes(hijriDay)) {
        return true
      }
      // Check annual recurring events with 'fixed' timing (e.g. Dhul Hijjah)
      const annualFixedEvents = recurringFasts.annual.filter(
        e => e.hijriMonth === hijriMonth && (e as any).timing === 'fixed'
      )

      for (const event of annualFixedEvents) {
        if (event.startDay && event.endDay) {
          if (hijriDay >= event.startDay && hijriDay <= event.endDay) return true
        } else if (event.startDay && event.duration) {
          if (hijriDay >= event.startDay && hijriDay < event.startDay + event.duration) return true
        }
      }
      return false
    }
  }, [events])

  // Get all events for a specific day including recurring
  const getAllEventsForDay = useMemo(() => {
    return (hijriMonth: number, hijriDay: number, gregorianDate?: Date): { name: string; type: string; isRecurring: boolean }[] => {
      const result: { name: string; type: string; isRecurring: boolean }[] = []

      // Add fixed events
      const fixedEvents = events.filter(e => e.hijriMonth === hijriMonth && e.hijriDay === hijriDay)
      let isFastingForbidden = false

      for (const event of fixedEvents) {
        result.push({ name: event.name, type: event.type, isRecurring: false })
        if (event.fastingForbidden) {
          isFastingForbidden = true
        }
      }

      // ONLY add recurring fasts if fasting is NOT forbidden
      if (!isFastingForbidden) {
        // Add Ayyam al-Beed (13, 14, 15 of each month)
        if ([13, 14, 15].includes(hijriDay)) {
          result.push({ name: 'Ayyam al-Beed', type: 'sunnah', isRecurring: true })
        }

        // Add fixed annual recurring events
        const annualFixedEvents = recurringFasts.annual.filter(
          e => e.hijriMonth === hijriMonth && (e as any).timing === 'fixed'
        )

        for (const event of annualFixedEvents) {
          let isMatch = false
          if (event.startDay && event.endDay) {
            if (hijriDay >= event.startDay && hijriDay <= event.endDay) isMatch = true
          } else if (event.startDay && event.duration) {
            if (hijriDay >= event.startDay && hijriDay < event.startDay + event.duration) isMatch = true
          }

          if (isMatch) {
            result.push({
              name: event.name,
              type: event.type,
              isRecurring: true
            })
          }
        }

        // Add Monday/Thursday fasting if gregorianDate provided
        if (gregorianDate) {
          const dayOfWeek = gregorianDate.getDay()
          if (dayOfWeek === 1) {
            result.push({ name: 'Monday Fast', type: 'sunnah', isRecurring: true })
          }
          if (dayOfWeek === 4) {
            result.push({ name: 'Thursday Fast', type: 'sunnah', isRecurring: true })
          }
        }
      }

      return result
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
    getAllEventsForDay,
    isFastingDay,
    getMonthName,
    hasEvent,
    getEventTypeColor,
  }
}
