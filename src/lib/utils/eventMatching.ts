/**
 * Event matching utilities for Islamic calendar events
 */

import type { IslamicEvent, AnnualFast, HijriDate, FastingInfo, DayEvent } from '@/lib/data/types'
import { HIJRI_MONTHS, AYYAM_AL_BEED_DAYS, RAMADAN_NAME } from '@/lib/constants/hijriConstants'
import { DAY_INDEX } from '@/lib/constants/dateConstants'

/**
 * Check if a specific Hijri day falls within an annual recurring event range
 */
export function isInAnnualEventRange(
  hijriDay: number,
  event: AnnualFast
): boolean {
  if (event.startDay && event.endDay) {
    return hijriDay >= event.startDay && hijriDay <= event.endDay
  }
  if (event.startDay && event.duration) {
    return hijriDay >= event.startDay && hijriDay < event.startDay + event.duration
  }
  return false
}

/**
 * Check if fasting is forbidden on a given day based on events
 */
export function isFastingForbidden(events: IslamicEvent[]): IslamicEvent | null {
  return events.find(e => e.fastingForbidden) || null
}

/**
 * Check if a day is a fasting day based on events
 */
export function getFastingEvent(events: IslamicEvent[]): IslamicEvent | null {
  return events.find(e => e.isFastingDay) || null
}

/**
 * Get fasting info for a specific Hijri date
 */
export function getFastingInfo(
  hijriDate: HijriDate,
  fixedEvents: IslamicEvent[],
  ayyamAlBeedDays: readonly number[]
): FastingInfo {
  // Priority 1: Check if ANY event forbids fasting (Eid, Tashreeq)
  const forbiddenEvent = isFastingForbidden(fixedEvents)
  if (forbiddenEvent) {
    return { isFasting: false, type: 'forbidden', reason: forbiddenEvent.name }
  }

  // Priority 2: Check for specific fasting events (e.g. Arafah)
  const fastingEvent = getFastingEvent(fixedEvents)
  if (fastingEvent) {
    return { isFasting: true, type: fastingEvent.fastingType, reason: fastingEvent.name }
  }

  // Check Ramadan (entire month)
  if (hijriDate.month === HIJRI_MONTHS.RAMADAN) {
    return { isFasting: true, type: 'obligatory', reason: RAMADAN_NAME }
  }

  // Check Ayyam al-Beed (13th, 14th, 15th of each month)
  if (ayyamAlBeedDays.includes(hijriDate.day)) {
    return { isFasting: true, type: 'sunnah', reason: 'Ayyam al-Beed (White Days)' }
  }

  // Check Monday/Thursday
  const dayOfWeek = hijriDate.gregorianDate.getDay()
  if (dayOfWeek === DAY_INDEX.MONDAY) {
    return { isFasting: true, type: 'sunnah', reason: 'Monday Fast' }
  }
  if (dayOfWeek === DAY_INDEX.THURSDAY) {
    return { isFasting: true, type: 'sunnah', reason: 'Thursday Fast' }
  }

  return { isFasting: false }
}

/**
 * Get all events for a specific day including recurring
 */
export function getAllEventsForDay(
  hijriMonth: number,
  hijriDay: number,
  gregorianDate: Date | undefined,
  fixedEvents: IslamicEvent[],
  annualFasts: AnnualFast[],
  ayyamAlBeedDetails?: string,
  weeklyFastDetails?: { monday?: string; thursday?: string }
): DayEvent[] {
  const result: DayEvent[] = []

  // Add fixed events
  const dayFixedEvents = fixedEvents.filter(
    e => e.hijriMonth === hijriMonth && e.hijriDay === hijriDay
  )
  let isFastingForbiddenToday = false

  for (const event of dayFixedEvents) {
    result.push({
      name: event.name,
      type: event.type,
      isRecurring: false,
      details: event.details
    })
    if (event.fastingForbidden) {
      isFastingForbiddenToday = true
    }
  }

  // ONLY add recurring fasts if fasting is NOT forbidden
  if (!isFastingForbiddenToday) {
    // Add Ayyam al-Beed (13, 14, 15 of each month)
    if (AYYAM_AL_BEED_DAYS.includes(hijriDay)) {
      result.push({
        name: 'Ayyam al-Beed',
        type: 'sunnah',
        isRecurring: true,
        details: ayyamAlBeedDetails
      })
    }

    // Add fixed annual recurring events
    const annualFixedEvents = annualFasts.filter(
      e => e.hijriMonth === hijriMonth && e.timing === 'fixed'
    )

    for (const event of annualFixedEvents) {
      if (isInAnnualEventRange(hijriDay, event)) {
        result.push({
          name: event.name,
          type: event.type,
          isRecurring: true,
          details: event.details
        })
      }
    }

    // Add Monday/Thursday fasting if gregorianDate provided
    if (gregorianDate) {
      const dayOfWeek = gregorianDate.getDay()
      if (dayOfWeek === DAY_INDEX.MONDAY) {
        result.push({
          name: 'Monday Fast',
          type: 'sunnah',
          isRecurring: true,
          details: weeklyFastDetails?.monday
        })
      }
      if (dayOfWeek === DAY_INDEX.THURSDAY) {
        result.push({
          name: 'Thursday Fast',
          type: 'sunnah',
          isRecurring: true,
          details: weeklyFastDetails?.thursday
        })
      }
    }
  }

  return result
}

/**
 * Check if a specific Hijri day has any event
 */
export function hasEventOnDay(
  hijriMonth: number,
  hijriDay: number,
  fixedEvents: IslamicEvent[],
  annualFasts: AnnualFast[]
): boolean {
  // Check fixed events
  if (fixedEvents.some(e => e.hijriMonth === hijriMonth && e.hijriDay === hijriDay)) {
    return true
  }

  // Check Ayyam al-Beed (13, 14, 15 of each month)
  if (AYYAM_AL_BEED_DAYS.includes(hijriDay)) {
    return true
  }

  // Check annual recurring events with 'fixed' timing
  const annualFixedEvents = annualFasts.filter(
    e => e.hijriMonth === hijriMonth && e.timing === 'fixed'
  )

  for (const event of annualFixedEvents) {
    if (isInAnnualEventRange(hijriDay, event)) {
      return true
    }
  }

  return false
}

/**
 * Get the primary event type for styling purposes
 */
export function getPrimaryEventType(
  dayEvents: DayEvent[]
): 'eid' | 'holy' | 'ayyamAlBeed' | 'recommended' | null {
  if (dayEvents.some(e => e.type === 'eid')) return 'eid'
  if (dayEvents.some(e => e.type === 'holy')) return 'holy'
  if (dayEvents.some(e => e.isRecurring && e.name === 'Ayyam al-Beed')) return 'ayyamAlBeed'
  if (dayEvents.some(e => e.type === 'recommended')) return 'recommended'
  return null
}

/**
 * Get event type color classes for styling
 */
export function getEventTypeColor(type: string): string {
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
