import { describe, it, expect } from 'vitest'
import {
  isInAnnualEventRange,
  isFastingForbidden,
  getFastingEvent,
  getFastingInfo,
  getAllEventsForDay,
  hasEventOnDay,
  getPrimaryEventType,
  getEventTypeColor,
} from './eventMatching'
import type { IslamicEvent, AnnualFast, HijriDate, DayEvent } from '@/lib/data/types'
import { HIJRI_MONTHS, WEEKDAYS, AYYAM_AL_BEED_DAYS } from './hijriConstants'

// Helper factory functions to create test data with required properties
function createEvent(overrides: Partial<IslamicEvent> & Pick<IslamicEvent, 'id' | 'name' | 'type' | 'hijriMonth' | 'hijriDay'>): IslamicEvent {
  return {
    nameArabic: '',
    isFastingDay: false,
    description: '',
    ...overrides,
  }
}

function createAnnualFast(overrides: Partial<AnnualFast> & Pick<AnnualFast, 'id' | 'name' | 'hijriMonth' | 'type'>): AnnualFast {
  return {
    nameArabic: '',
    description: '',
    ...overrides,
  }
}

describe('eventMatching utilities', () => {
  describe('isInAnnualEventRange', () => {
    it('returns true when day is within startDay and endDay range', () => {
      const event = createAnnualFast({
        id: 'test-fast',
        name: 'Test Fast',
        hijriMonth: 1,
        type: 'recommended',
        timing: 'fixed',
        startDay: 9,
        endDay: 11,
      })

      expect(isInAnnualEventRange(9, event)).toBe(true)
      expect(isInAnnualEventRange(10, event)).toBe(true)
      expect(isInAnnualEventRange(11, event)).toBe(true)
    })

    it('returns false when day is outside startDay and endDay range', () => {
      const event = createAnnualFast({
        id: 'test-fast',
        name: 'Test Fast',
        hijriMonth: 1,
        type: 'recommended',
        timing: 'fixed',
        startDay: 9,
        endDay: 11,
      })

      expect(isInAnnualEventRange(8, event)).toBe(false)
      expect(isInAnnualEventRange(12, event)).toBe(false)
    })

    it('returns true when day is within startDay and duration range', () => {
      const event = createAnnualFast({
        id: 'test-fast',
        name: 'Test Fast',
        hijriMonth: 1,
        type: 'recommended',
        timing: 'fixed',
        startDay: 13,
        duration: 6,
      })

      // Days 13-18 (13 + 6 = 19, so < 19)
      expect(isInAnnualEventRange(13, event)).toBe(true)
      expect(isInAnnualEventRange(15, event)).toBe(true)
      expect(isInAnnualEventRange(18, event)).toBe(true)
    })

    it('returns false when day is outside startDay and duration range', () => {
      const event = createAnnualFast({
        id: 'test-fast',
        name: 'Test Fast',
        hijriMonth: 1,
        type: 'recommended',
        timing: 'fixed',
        startDay: 13,
        duration: 6,
      })

      expect(isInAnnualEventRange(12, event)).toBe(false)
      expect(isInAnnualEventRange(19, event)).toBe(false)
    })

    it('returns false when event has neither endDay nor duration', () => {
      const event = createAnnualFast({
        id: 'test-fast',
        name: 'Test Fast',
        hijriMonth: 1,
        type: 'recommended',
        timing: 'fixed',
      })

      expect(isInAnnualEventRange(10, event)).toBe(false)
    })
  })

  describe('isFastingForbidden', () => {
    it('returns the event when fasting is forbidden', () => {
      const events: IslamicEvent[] = [
        createEvent({ id: '1', name: 'Regular Event', type: 'holy', hijriMonth: 1, hijriDay: 1 }),
        createEvent({ id: '2', name: 'Eid al-Fitr', type: 'eid', hijriMonth: 10, hijriDay: 1, fastingForbidden: true }),
      ]

      const result = isFastingForbidden(events)
      expect(result).not.toBeNull()
      expect(result?.name).toBe('Eid al-Fitr')
    })

    it('returns null when no event forbids fasting', () => {
      const events: IslamicEvent[] = [
        createEvent({ id: '1', name: 'Regular Event', type: 'holy', hijriMonth: 1, hijriDay: 1 }),
        createEvent({ id: '2', name: 'Another Event', type: 'recommended', hijriMonth: 1, hijriDay: 10 }),
      ]

      expect(isFastingForbidden(events)).toBeNull()
    })

    it('returns null for empty array', () => {
      expect(isFastingForbidden([])).toBeNull()
    })

    it('returns first forbidden event if multiple exist', () => {
      const events: IslamicEvent[] = [
        createEvent({ id: '1', name: 'First Forbidden', type: 'eid', hijriMonth: 10, hijriDay: 1, fastingForbidden: true }),
        createEvent({ id: '2', name: 'Second Forbidden', type: 'eid', hijriMonth: 12, hijriDay: 10, fastingForbidden: true }),
      ]

      const result = isFastingForbidden(events)
      expect(result?.name).toBe('First Forbidden')
    })
  })

  describe('getFastingEvent', () => {
    it('returns the fasting event when present', () => {
      const events: IslamicEvent[] = [
        createEvent({ id: '1', name: 'Regular Event', type: 'holy', hijriMonth: 1, hijriDay: 1 }),
        createEvent({ id: '2', name: 'Day of Arafah', type: 'fast', hijriMonth: 12, hijriDay: 9, isFastingDay: true, fastingType: 'recommended' }),
      ]

      const result = getFastingEvent(events)
      expect(result).not.toBeNull()
      expect(result?.name).toBe('Day of Arafah')
    })

    it('returns null when no fasting event exists', () => {
      const events: IslamicEvent[] = [
        createEvent({ id: '1', name: 'Regular Event', type: 'holy', hijriMonth: 1, hijriDay: 1 }),
      ]

      expect(getFastingEvent(events)).toBeNull()
    })

    it('returns null for empty array', () => {
      expect(getFastingEvent([])).toBeNull()
    })
  })

  describe('getFastingInfo', () => {
    const createHijriDate = (month: number, day: number, gregorianDate: Date): HijriDate => ({
      day,
      month,
      monthName: 'Test Month',
      year: 1446,
      gregorianDate,
    })

    it('returns forbidden when event forbids fasting', () => {
      const hijriDate = createHijriDate(10, 1, new Date(2025, 5, 15)) // Shawwal 1 (Eid)
      const events: IslamicEvent[] = [
        createEvent({ id: '1', name: 'Eid al-Fitr', type: 'eid', hijriMonth: 10, hijriDay: 1, fastingForbidden: true }),
      ]

      const result = getFastingInfo(hijriDate, events, AYYAM_AL_BEED_DAYS)

      expect(result.isFasting).toBe(false)
      expect(result.type).toBe('forbidden')
      expect(result.reason).toBe('Eid al-Fitr')
    })

    it('returns fasting event info when fasting day', () => {
      const hijriDate = createHijriDate(12, 9, new Date(2025, 5, 15))
      const events: IslamicEvent[] = [
        createEvent({ id: '1', name: 'Day of Arafah', type: 'fast', hijriMonth: 12, hijriDay: 9, isFastingDay: true, fastingType: 'recommended' }),
      ]

      const result = getFastingInfo(hijriDate, events, AYYAM_AL_BEED_DAYS)

      expect(result.isFasting).toBe(true)
      expect(result.type).toBe('recommended')
      expect(result.reason).toBe('Day of Arafah')
    })

    it('returns obligatory fasting for Ramadan', () => {
      const hijriDate = createHijriDate(HIJRI_MONTHS.RAMADAN, 15, new Date(2025, 5, 15))

      const result = getFastingInfo(hijriDate, [], AYYAM_AL_BEED_DAYS)

      expect(result.isFasting).toBe(true)
      expect(result.type).toBe('obligatory')
      expect(result.reason).toBe('Ramadan')
    })

    it('returns sunnah fasting for Ayyam al-Beed days', () => {
      // Day 13, which is an Ayyam al-Beed day
      const hijriDate = createHijriDate(1, 13, new Date(2025, 5, 18)) // Not Monday/Thursday

      const result = getFastingInfo(hijriDate, [], AYYAM_AL_BEED_DAYS)

      expect(result.isFasting).toBe(true)
      expect(result.type).toBe('sunnah')
      expect(result.reason).toBe('Ayyam al-Beed (White Days)')
    })

    it('returns sunnah fasting for Monday', () => {
      // Create a date that falls on Monday (day = 1)
      const monday = new Date(2025, 5, 16) // June 16, 2025 is a Monday
      expect(monday.getDay()).toBe(WEEKDAYS.MONDAY)

      const hijriDate = createHijriDate(1, 20, monday) // Day 20 is not Ayyam al-Beed

      const result = getFastingInfo(hijriDate, [], AYYAM_AL_BEED_DAYS)

      expect(result.isFasting).toBe(true)
      expect(result.type).toBe('sunnah')
      expect(result.reason).toBe('Monday Fast')
    })

    it('returns sunnah fasting for Thursday', () => {
      // Create a date that falls on Thursday (day = 4)
      const thursday = new Date(2025, 5, 19) // June 19, 2025 is a Thursday
      expect(thursday.getDay()).toBe(WEEKDAYS.THURSDAY)

      const hijriDate = createHijriDate(1, 20, thursday) // Day 20 is not Ayyam al-Beed

      const result = getFastingInfo(hijriDate, [], AYYAM_AL_BEED_DAYS)

      expect(result.isFasting).toBe(true)
      expect(result.type).toBe('sunnah')
      expect(result.reason).toBe('Thursday Fast')
    })

    it('returns no fasting for regular days', () => {
      // Wednesday, not Ayyam al-Beed, not Ramadan
      const wednesday = new Date(2025, 5, 18) // June 18, 2025 is a Wednesday
      expect(wednesday.getDay()).toBe(3) // Wednesday

      const hijriDate = createHijriDate(1, 20, wednesday)

      const result = getFastingInfo(hijriDate, [], AYYAM_AL_BEED_DAYS)

      expect(result.isFasting).toBe(false)
      expect(result.type).toBeUndefined()
      expect(result.reason).toBeUndefined()
    })

    it('prioritizes forbidden over all other types', () => {
      // Ramadan 1 but fasting is forbidden (hypothetical)
      const hijriDate = createHijriDate(HIJRI_MONTHS.RAMADAN, 1, new Date(2025, 5, 16))
      const events: IslamicEvent[] = [
        createEvent({ id: '1', name: 'Forbidden Day', type: 'eid', hijriMonth: 9, hijriDay: 1, fastingForbidden: true }),
      ]

      const result = getFastingInfo(hijriDate, events, AYYAM_AL_BEED_DAYS)

      expect(result.isFasting).toBe(false)
      expect(result.type).toBe('forbidden')
    })
  })

  describe('getAllEventsForDay', () => {
    const fixedEvents: IslamicEvent[] = [
      createEvent({ id: '1', name: 'Ashura', type: 'holy', hijriMonth: 1, hijriDay: 10, details: 'Day of Ashura' }),
      createEvent({ id: '2', name: 'Eid al-Fitr', type: 'eid', hijriMonth: 10, hijriDay: 1, fastingForbidden: true }),
    ]

    const annualFasts: AnnualFast[] = [
      createAnnualFast({
        id: 'muharram-fasting',
        name: 'Muharram Fasting',
        hijriMonth: 1,
        type: 'recommended',
        timing: 'fixed',
        startDay: 9,
        endDay: 11,
      }),
    ]

    it('returns fixed events for the day', () => {
      const result = getAllEventsForDay(1, 10, undefined, fixedEvents, annualFasts)

      expect(result).toContainEqual(expect.objectContaining({
        name: 'Ashura',
        type: 'holy',
        isRecurring: false,
      }))
    })

    it('adds Ayyam al-Beed for days 13, 14, 15', () => {
      const result = getAllEventsForDay(1, 13, undefined, [], [])

      expect(result).toContainEqual(expect.objectContaining({
        name: 'Ayyam al-Beed',
        type: 'sunnah',
        isRecurring: true,
      }))
    })

    it('adds annual recurring events', () => {
      const result = getAllEventsForDay(1, 9, undefined, [], annualFasts)

      expect(result).toContainEqual(expect.objectContaining({
        name: 'Muharram Fasting',
        type: 'recommended',
        isRecurring: true,
      }))
    })

    it('adds Monday Fast when gregorianDate is Monday', () => {
      const monday = new Date(2025, 5, 16) // Monday
      expect(monday.getDay()).toBe(WEEKDAYS.MONDAY)

      const result = getAllEventsForDay(1, 20, monday, [], [], undefined, { monday: 'Monday details' })

      expect(result).toContainEqual(expect.objectContaining({
        name: 'Monday Fast',
        type: 'sunnah',
        isRecurring: true,
        details: 'Monday details',
      }))
    })

    it('adds Thursday Fast when gregorianDate is Thursday', () => {
      const thursday = new Date(2025, 5, 19) // Thursday
      expect(thursday.getDay()).toBe(WEEKDAYS.THURSDAY)

      const result = getAllEventsForDay(1, 20, thursday, [], [], undefined, { thursday: 'Thursday details' })

      expect(result).toContainEqual(expect.objectContaining({
        name: 'Thursday Fast',
        type: 'sunnah',
        isRecurring: true,
        details: 'Thursday details',
      }))
    })

    it('does NOT add recurring fasts when fasting is forbidden', () => {
      // Eid day - fasting forbidden
      const monday = new Date(2025, 5, 16) // Monday
      const result = getAllEventsForDay(10, 1, monday, fixedEvents, [])

      // Should have Eid event
      expect(result).toContainEqual(expect.objectContaining({
        name: 'Eid al-Fitr',
        type: 'eid',
      }))

      // Should NOT have Monday Fast
      expect(result).not.toContainEqual(expect.objectContaining({
        name: 'Monday Fast',
      }))
    })

    it('does NOT add Ayyam al-Beed when fasting is forbidden', () => {
      // Make an event that forbids fasting on day 13
      const forbiddenEvents: IslamicEvent[] = [
        createEvent({ id: '1', name: 'Forbidden Day', type: 'eid', hijriMonth: 1, hijriDay: 13, fastingForbidden: true }),
      ]

      const result = getAllEventsForDay(1, 13, undefined, forbiddenEvents, [])

      expect(result).toContainEqual(expect.objectContaining({
        name: 'Forbidden Day',
      }))

      expect(result).not.toContainEqual(expect.objectContaining({
        name: 'Ayyam al-Beed',
      }))
    })

    it('returns empty array when no events match', () => {
      const wednesday = new Date(2025, 5, 18) // Wednesday
      const result = getAllEventsForDay(1, 20, wednesday, [], [])

      expect(result).toEqual([])
    })

    it('includes ayyamAlBeedDetails when provided', () => {
      const result = getAllEventsForDay(1, 14, undefined, [], [], 'White Days details')

      expect(result).toContainEqual(expect.objectContaining({
        name: 'Ayyam al-Beed',
        details: 'White Days details',
      }))
    })
  })

  describe('hasEventOnDay', () => {
    const fixedEvents: IslamicEvent[] = [
      createEvent({ id: '1', name: 'Ashura', type: 'holy', hijriMonth: 1, hijriDay: 10 }),
    ]

    const annualFasts: AnnualFast[] = [
      createAnnualFast({
        id: 'shaban-fasting',
        name: 'Shaban Fasting',
        hijriMonth: 8,
        type: 'recommended',
        timing: 'fixed',
        startDay: 1,
        endDay: 15,
      }),
    ]

    it('returns true for fixed event day', () => {
      expect(hasEventOnDay(1, 10, fixedEvents, [])).toBe(true)
    })

    it('returns true for Ayyam al-Beed days', () => {
      expect(hasEventOnDay(5, 13, [], [])).toBe(true)
      expect(hasEventOnDay(5, 14, [], [])).toBe(true)
      expect(hasEventOnDay(5, 15, [], [])).toBe(true)
    })

    it('returns true for annual recurring event days', () => {
      expect(hasEventOnDay(8, 1, [], annualFasts)).toBe(true)
      expect(hasEventOnDay(8, 10, [], annualFasts)).toBe(true)
      expect(hasEventOnDay(8, 15, [], annualFasts)).toBe(true)
    })

    it('returns false for days with no events', () => {
      expect(hasEventOnDay(1, 20, [], [])).toBe(false)
      expect(hasEventOnDay(5, 16, [], [])).toBe(false)
    })

    it('returns false for wrong month', () => {
      // Ashura is in month 1, day 10
      expect(hasEventOnDay(2, 10, fixedEvents, [])).toBe(false)
    })

    it('does not consider weekly fasts (Monday/Thursday)', () => {
      // This function only checks fixed and annual events, not weekly
      // A regular day 20 should be false even if it might be Monday
      expect(hasEventOnDay(1, 20, [], [])).toBe(false)
    })
  })

  describe('getPrimaryEventType', () => {
    it('returns eid for eid events', () => {
      const events: DayEvent[] = [
        { name: 'Eid al-Fitr', type: 'eid', isRecurring: false },
        { name: 'Monday Fast', type: 'sunnah', isRecurring: true },
      ]

      expect(getPrimaryEventType(events)).toBe('eid')
    })

    it('returns holy for holy events when no eid', () => {
      const events: DayEvent[] = [
        { name: 'Ashura', type: 'holy', isRecurring: false },
        { name: 'Monday Fast', type: 'sunnah', isRecurring: true },
      ]

      expect(getPrimaryEventType(events)).toBe('holy')
    })

    it('returns ayyamAlBeed for Ayyam al-Beed when no eid or holy', () => {
      const events: DayEvent[] = [
        { name: 'Ayyam al-Beed', type: 'sunnah', isRecurring: true },
        { name: 'Monday Fast', type: 'sunnah', isRecurring: true },
      ]

      expect(getPrimaryEventType(events)).toBe('ayyamAlBeed')
    })

    it('returns recommended for recommended events when no higher priority', () => {
      const events: DayEvent[] = [
        { name: 'Recommended Fast', type: 'recommended', isRecurring: false },
      ]

      expect(getPrimaryEventType(events)).toBe('recommended')
    })

    it('returns null for empty array', () => {
      expect(getPrimaryEventType([])).toBeNull()
    })

    it('returns null when no matching types', () => {
      const events: DayEvent[] = [
        { name: 'Monday Fast', type: 'sunnah', isRecurring: true },
        { name: 'Thursday Fast', type: 'sunnah', isRecurring: true },
      ]

      expect(getPrimaryEventType(events)).toBeNull()
    })

    it('prioritizes eid over all others', () => {
      const events: DayEvent[] = [
        { name: 'Ayyam al-Beed', type: 'sunnah', isRecurring: true },
        { name: 'Holy Event', type: 'holy', isRecurring: false },
        { name: 'Recommended', type: 'recommended', isRecurring: false },
        { name: 'Eid', type: 'eid', isRecurring: false },
      ]

      expect(getPrimaryEventType(events)).toBe('eid')
    })
  })

  describe('getEventTypeColor', () => {
    it('returns correct classes for eid type', () => {
      const result = getEventTypeColor('eid')
      expect(result).toContain('bg-green-500')
      expect(result).toContain('text-green-600')
    })

    it('returns correct classes for holy type', () => {
      const result = getEventTypeColor('holy')
      expect(result).toContain('bg-blue-500')
      expect(result).toContain('text-blue-600')
    })

    it('returns correct classes for fast type', () => {
      const result = getEventTypeColor('fast')
      expect(result).toContain('bg-amber-500')
      expect(result).toContain('text-amber-600')
    })

    it('returns correct classes for recommended type', () => {
      const result = getEventTypeColor('recommended')
      expect(result).toContain('bg-purple-500')
      expect(result).toContain('text-purple-600')
    })

    it('returns default classes for unknown type', () => {
      const result = getEventTypeColor('unknown')
      expect(result).toContain('bg-muted')
      expect(result).toContain('text-muted-foreground')
    })

    it('returns default classes for empty string', () => {
      const result = getEventTypeColor('')
      expect(result).toContain('bg-muted')
    })
  })
})
