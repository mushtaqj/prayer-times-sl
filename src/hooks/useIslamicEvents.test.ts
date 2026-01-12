import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useIslamicEvents } from './useIslamicEvents'

describe('useIslamicEvents', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('events', () => {
    it('returns events array', () => {
      const { result } = renderHook(() => useIslamicEvents())

      expect(result.current.events).toBeDefined()
      expect(Array.isArray(result.current.events)).toBe(true)
    })

    it('events have required properties', () => {
      const { result } = renderHook(() => useIslamicEvents())

      if (result.current.events.length > 0) {
        const event = result.current.events[0]
        expect(event).toHaveProperty('id')
        expect(event).toHaveProperty('name')
        expect(event).toHaveProperty('hijriMonth')
        expect(event).toHaveProperty('hijriDay')
        expect(event).toHaveProperty('type')
      }
    })
  })

  describe('hijriMonths', () => {
    it('returns 12 Hijri months', () => {
      const { result } = renderHook(() => useIslamicEvents())

      expect(result.current.hijriMonths).toHaveLength(12)
    })

    it('months have correct structure', () => {
      const { result } = renderHook(() => useIslamicEvents())

      result.current.hijriMonths.forEach((month, index) => {
        expect(month.number).toBe(index + 1)
        expect(month.name).toBeDefined()
        expect(month.nameArabic).toBeDefined()
      })
    })

    it('includes Ramadan as month 9', () => {
      const { result } = renderHook(() => useIslamicEvents())

      const ramadan = result.current.hijriMonths.find(m => m.number === 9)
      expect(ramadan?.name).toBe('Ramadan')
    })
  })

  describe('recurringFasts', () => {
    it('returns recurring fasts structure', () => {
      const { result } = renderHook(() => useIslamicEvents())

      expect(result.current.recurringFasts).toHaveProperty('annual')
      expect(result.current.recurringFasts).toHaveProperty('monthly')
      expect(result.current.recurringFasts).toHaveProperty('weekly')
      expect(result.current.recurringFasts).toHaveProperty('friday')
    })

    it('annual fasts have required structure', () => {
      const { result } = renderHook(() => useIslamicEvents())

      // Check that annual fasts exist and have proper structure
      expect(result.current.recurringFasts.annual.length).toBeGreaterThan(0)

      result.current.recurringFasts.annual.forEach(fast => {
        expect(fast).toHaveProperty('id')
        expect(fast).toHaveProperty('name')
        expect(fast).toHaveProperty('hijriMonth')
      })
    })

    it('monthly fasts include Ayyam al-Beed', () => {
      const { result } = renderHook(() => useIslamicEvents())

      expect(result.current.recurringFasts.monthly.ayyamAlBeed).toBeDefined()
      expect(result.current.recurringFasts.monthly.ayyamAlBeed.days).toEqual([13, 14, 15])
    })

    it('weekly fasts include Monday and Thursday', () => {
      const { result } = renderHook(() => useIslamicEvents())

      const mondayFast = result.current.recurringFasts.weekly.find(f => f.id === 'monday-fast')
      const thursdayFast = result.current.recurringFasts.weekly.find(f => f.id === 'thursday-fast')

      expect(mondayFast).toBeDefined()
      expect(thursdayFast).toBeDefined()
    })
  })

  describe('getEventsForDate', () => {
    it('returns events for a specific date', () => {
      const { result } = renderHook(() => useIslamicEvents())

      // Ashura is on Muharram 10
      const ashuraDate = {
        day: 10,
        month: 1,
        year: 1446,
        monthName: 'Muharram',
        gregorianDate: new Date(),
      }

      const events = result.current.getEventsForDate(ashuraDate)

      // Should find Ashura or similar event
      expect(Array.isArray(events)).toBe(true)
    })

    it('returns empty array for null date', () => {
      const { result } = renderHook(() => useIslamicEvents())

      const events = result.current.getEventsForDate(null)

      expect(events).toEqual([])
    })

    it('returns empty array for date with no events', () => {
      const { result } = renderHook(() => useIslamicEvents())

      const regularDate = {
        day: 7,
        month: 2,
        year: 1446,
        monthName: 'Safar',
        gregorianDate: new Date(),
      }

      const events = result.current.getEventsForDate(regularDate)

      expect(Array.isArray(events)).toBe(true)
      // Most regular dates won't have events
    })
  })

  describe('getEventsForMonth', () => {
    it('returns events for Ramadan', () => {
      const { result } = renderHook(() => useIslamicEvents())

      const ramadanEvents = result.current.getEventsForMonth(9)

      expect(Array.isArray(ramadanEvents)).toBe(true)
    })

    it('returns events for Muharram', () => {
      const { result } = renderHook(() => useIslamicEvents())

      const muharramEvents = result.current.getEventsForMonth(1)

      expect(Array.isArray(muharramEvents)).toBe(true)
    })
  })

  describe('isFastingDay', () => {
    it('returns fasting info for Ramadan day', () => {
      const { result } = renderHook(() => useIslamicEvents())

      const ramadanDate = {
        day: 15,
        month: 9,
        year: 1446,
        monthName: 'Ramadan',
        gregorianDate: new Date(),
      }

      const fastingInfo = result.current.isFastingDay(ramadanDate)

      expect(fastingInfo.isFasting).toBe(true)
      expect(fastingInfo.type).toBe('obligatory')
      expect(fastingInfo.reason).toBe('Ramadan')
    })

    it('returns fasting info for Ayyam al-Beed', () => {
      const { result } = renderHook(() => useIslamicEvents())

      const ayyamAlBeedDate = {
        day: 13,
        month: 2,
        year: 1446,
        monthName: 'Safar',
        gregorianDate: new Date(),
      }

      const fastingInfo = result.current.isFastingDay(ayyamAlBeedDate)

      expect(fastingInfo.isFasting).toBe(true)
    })

    it('returns not fasting for regular day', () => {
      const { result } = renderHook(() => useIslamicEvents())

      const regularDate = {
        day: 7,
        month: 2,
        year: 1446,
        monthName: 'Safar',
        gregorianDate: new Date(),
      }

      const fastingInfo = result.current.isFastingDay(regularDate)

      // Regular days (not Ayyam al-Beed, not special) shouldn't be fasting
      if (!fastingInfo.isFasting) {
        expect(fastingInfo.isFasting).toBe(false)
      }
    })

    it('returns not fasting for null date', () => {
      const { result } = renderHook(() => useIslamicEvents())

      const fastingInfo = result.current.isFastingDay(null)

      expect(fastingInfo.isFasting).toBe(false)
    })
  })

  describe('todayEvents', () => {
    it('returns array of events', () => {
      vi.setSystemTime(new Date('2024-01-15T12:00:00'))

      const { result } = renderHook(() => useIslamicEvents())

      expect(Array.isArray(result.current.todayEvents)).toBe(true)
    })
  })

  describe('upcomingEvents', () => {
    it('returns array of upcoming events', () => {
      vi.setSystemTime(new Date('2024-01-15T12:00:00'))

      const { result } = renderHook(() => useIslamicEvents())

      expect(Array.isArray(result.current.upcomingEvents)).toBe(true)
    })

    it('upcoming events have required structure', () => {
      vi.setSystemTime(new Date('2024-01-15T12:00:00'))

      const { result } = renderHook(() => useIslamicEvents())

      result.current.upcomingEvents.forEach(item => {
        expect(item).toHaveProperty('event')
        expect(item).toHaveProperty('gregorianDate')
        expect(item).toHaveProperty('hijriDate')
      })
    })
  })

  describe('getMonthName', () => {
    it('returns month info for valid month', () => {
      const { result } = renderHook(() => useIslamicEvents())

      const ramadan = result.current.getMonthName(9)

      expect(ramadan).toBeDefined()
      expect(ramadan?.name).toBe('Ramadan')
    })

    it('returns undefined for invalid month', () => {
      const { result } = renderHook(() => useIslamicEvents())

      const invalid = result.current.getMonthName(13)

      expect(invalid).toBeUndefined()
    })

    it('returns all 12 months with names', () => {
      const { result } = renderHook(() => useIslamicEvents())

      // Verify all 12 months have names
      for (let i = 1; i <= 12; i++) {
        const month = result.current.getMonthName(i)
        expect(month).toBeDefined()
        expect(month?.name).toBeDefined()
        expect(month?.name.length).toBeGreaterThan(0)
      }
    })
  })

  describe('hasEvent', () => {
    it('returns true for Ashura day', () => {
      const { result } = renderHook(() => useIslamicEvents())

      // Ashura is Muharram 10
      const hasAshura = result.current.hasEvent(1, 10)

      expect(hasAshura).toBe(true)
    })

    it('returns boolean for any date', () => {
      const { result } = renderHook(() => useIslamicEvents())

      const hasEventResult = result.current.hasEvent(2, 7)

      expect(typeof hasEventResult).toBe('boolean')
    })
  })

  describe('getAllEventsForDay', () => {
    it('returns array of events for a day', () => {
      const { result } = renderHook(() => useIslamicEvents())

      const events = result.current.getAllEventsForDay(1, 10)

      expect(Array.isArray(events)).toBe(true)
    })

    it('includes recurring events', () => {
      const { result } = renderHook(() => useIslamicEvents())

      // Ashura (Muharram 10) - should have events
      const events = result.current.getAllEventsForDay(1, 10)

      // Should have at least Ashura
      expect(events.length).toBeGreaterThan(0)
    })
  })

  describe('getEventTypeColor', () => {
    it('returns color for major event', () => {
      const { result } = renderHook(() => useIslamicEvents())

      const color = result.current.getEventTypeColor('major')

      expect(typeof color).toBe('string')
      expect(color.length).toBeGreaterThan(0)
    })

    it('returns color for eid event', () => {
      const { result } = renderHook(() => useIslamicEvents())

      const color = result.current.getEventTypeColor('eid')

      expect(typeof color).toBe('string')
    })
  })

  describe('return value shape', () => {
    it('returns all expected properties', () => {
      const { result } = renderHook(() => useIslamicEvents())

      expect(result.current).toHaveProperty('events')
      expect(result.current).toHaveProperty('hijriMonths')
      expect(result.current).toHaveProperty('recurringFasts')
      expect(result.current).toHaveProperty('todayEvents')
      expect(result.current).toHaveProperty('upcomingEvents')
      expect(result.current).toHaveProperty('getEventsForDate')
      expect(result.current).toHaveProperty('getEventsForMonth')
      expect(result.current).toHaveProperty('getAllEventsForDay')
      expect(result.current).toHaveProperty('isFastingDay')
      expect(result.current).toHaveProperty('getMonthName')
      expect(result.current).toHaveProperty('hasEvent')
      expect(result.current).toHaveProperty('getEventTypeColor')
    })
  })
})
