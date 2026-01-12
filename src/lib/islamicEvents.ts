/**
 * Islamic events data layer
 * Provides enriched static data and utility functions for Islamic events
 */

import eventsData from '@/data/islamicEvents.json'
import hijriCalendarData from '@/data/hijriCalendar.json'
import virtuesData from '@/data/virtues.json'
import { gregorianToHijri } from '@/lib/hijriCalendar'
import {
  getFastingInfo as getFastingInfoUtil,
  getAllEventsForDay as getAllEventsForDayUtil,
  hasEventOnDay as hasEventOnDayUtil,
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

// ============================================================================
// Enriched Static Data - Computed once at module load
// ============================================================================

/** Events enriched with virtue details from virtues.json */
export const events: IslamicEvent[] = (eventsData.events as IslamicEvent[]).map(e => ({
  ...e,
  details: virtuesData.events[e.id as keyof typeof virtuesData.events]
}))

/** Hijri months enriched with virtue details */
export const hijriMonths: HijriMonthInfo[] = (hijriCalendarData.hijriMonths as HijriMonthInfo[]).map(m => ({
  ...m,
  details: virtuesData.months[String(m.number) as keyof typeof virtuesData.months]
}))

/** Recurring fasts enriched with virtue details */
export const recurringFasts: RecurringFasts = (() => {
  const rf = eventsData.recurringFasts

  // Enrich annual fasts
  const annual: AnnualFast[] = rf.annual.map(f => ({
    ...f,
    timing: f.timing as 'fixed' | 'flexible' | undefined,
    details: virtuesData.recurring[f.id as keyof typeof virtuesData.recurring]
  }))

  // Enrich monthly fast (Ayyam al-Beed)
  const ayyamAlBeedId = 'ayyam-al-beed'
  const monthly: MonthlyFast = {
    ...rf.monthly,
    ayyamAlBeed: {
      ...rf.monthly.ayyamAlBeed,
      details: virtuesData.recurring[ayyamAlBeedId as keyof typeof virtuesData.recurring]
    }
  }

  // Enrich weekly fasts
  const weekly: WeeklyFast[] = rf.weekly.map(f => ({
    ...f,
    details: virtuesData.recurring[f.id as keyof typeof virtuesData.recurring]
  }))

  // Friday data from virtues (special day, not a fast)
  const fridayId = 'friday'
  const friday = {
    id: fridayId,
    name: 'Friday',
    nameArabic: 'يوم الجمعة',
    details: virtuesData.recurring[fridayId as keyof typeof virtuesData.recurring]
  }

  return { annual, monthly, weekly, friday }
})()

// ============================================================================
// Derived Constants - From the data itself
// ============================================================================

/** IDs of weekly fasts, derived from the data */
export const weeklyFastIds = {
  monday: recurringFasts.weekly.find(f => f.dayOfWeek === 1)?.id,
  thursday: recurringFasts.weekly.find(f => f.dayOfWeek === 4)?.id,
} as const

/** Weekly fast details lookup */
export const weeklyFastDetails = {
  monday: recurringFasts.weekly.find(f => f.dayOfWeek === 1)?.details,
  thursday: recurringFasts.weekly.find(f => f.dayOfWeek === 4)?.details,
}

// ============================================================================
// Query Functions
// ============================================================================

/** Get events for a specific Hijri month and day */
export function getEventsForDate(month: number, day: number): IslamicEvent[] {
  return events.filter(e => e.hijriMonth === month && e.hijriDay === day)
}

/** Get all events for a specific Hijri month (including annual recurring) */
export function getEventsForMonth(hijriMonth: number): IslamicEvent[] {
  const monthEvents = [...events.filter(e => e.hijriMonth === hijriMonth)]

  // Add any annual recurring events for this month
  const annualEvents = recurringFasts.annual.filter(e => e.hijriMonth === hijriMonth)

  for (const event of annualEvents) {
    monthEvents.push({
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
    })
  }

  return monthEvents
}

/** Get fasting info for a Hijri date */
export function getFastingInfo(hijriDate: HijriDate): FastingInfo {
  const dayEvents = getEventsForDate(hijriDate.month, hijriDate.day)
  return getFastingInfoUtil(
    hijriDate,
    dayEvents,
    recurringFasts.monthly.ayyamAlBeed.days
  )
}

/** Check if a specific Hijri day has an event */
export function hasEvent(hijriMonth: number, hijriDay: number): boolean {
  return hasEventOnDayUtil(hijriMonth, hijriDay, events, recurringFasts.annual)
}

/** Get all events for a specific day including recurring */
export function getAllEventsForDay(
  hijriMonth: number,
  hijriDay: number,
  gregorianDate?: Date
): DayEvent[] {
  return getAllEventsForDayUtil(
    hijriMonth,
    hijriDay,
    gregorianDate,
    events,
    recurringFasts.annual,
    recurringFasts.monthly.ayyamAlBeed.details,
    weeklyFastDetails
  )
}

/** Get month info by number */
export function getMonthByNumber(monthNumber: number): HijriMonthInfo | undefined {
  return hijriMonths.find(m => m.number === monthNumber)
}

/** Get today's events */
export function getTodayEvents(): IslamicEvent[] {
  const today = new Date()
  const hijriToday = gregorianToHijri(today)
  if (!hijriToday) return []
  return getEventsForDate(hijriToday.month, hijriToday.day)
}

/** Number of days to look ahead for upcoming events */
const UPCOMING_EVENTS_DAYS = 60

/** Get upcoming events for the next N days */
export function getUpcomingEvents(): { event: IslamicEvent; gregorianDate: Date; hijriDate: HijriDate }[] {
  const upcoming: { event: IslamicEvent; gregorianDate: Date; hijriDate: HijriDate }[] = []
  const today = new Date()

  for (let i = 0; i < UPCOMING_EVENTS_DAYS; i++) {
    const checkDate = new Date(today)
    checkDate.setDate(today.getDate() + i)
    const hijri = gregorianToHijri(checkDate)

    if (hijri) {
      const dayEvents = getEventsForDate(hijri.month, hijri.day)
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
}

// Re-export the event type color function for convenience
export { getEventTypeColor }
