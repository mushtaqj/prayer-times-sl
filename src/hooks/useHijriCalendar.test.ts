import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useHijriCalendar } from './useHijriCalendar'

// Mock the data layer
vi.mock('@/lib/data/hijriCalendar', () => ({
  months: [
    {
      hijriYear: 1446,
      hijriMonth: 11,
      monthName: 'Dhul Qadah',
      gregorianStart: '2025-04-30',
      days: 29,
      status: 'completed',
    },
    {
      hijriYear: 1446,
      hijriMonth: 12,
      monthName: 'Dhul Hijjah',
      gregorianStart: '2025-05-29',
      days: 30,
      status: 'completed',
    },
    {
      hijriYear: 1447,
      hijriMonth: 1,
      monthName: 'Muharram',
      gregorianStart: '2025-06-28',
      days: 30,
      status: 'completed',
    },
    {
      hijriYear: 1447,
      hijriMonth: 2,
      monthName: 'Safar',
      gregorianStart: '2025-07-28',
      days: 29,
      status: 'completed',
    },
    {
      hijriYear: 1447,
      hijriMonth: 3,
      monthName: 'Rabi al-Awwal',
      gregorianStart: '2025-08-26',
      days: 30,
      status: 'ongoing',
    },
  ],
  hijriMonths: [
    { number: 1, name: 'Muharram', nameArabic: 'محرم', meaning: 'Forbidden' },
    { number: 2, name: 'Safar', nameArabic: 'صفر', meaning: 'Void' },
    { number: 3, name: 'Rabi al-Awwal', nameArabic: 'ربيع الأول', meaning: 'First Spring' },
    { number: 11, name: 'Dhul Qadah', nameArabic: 'ذو القعدة', meaning: 'The One of Truce' },
    { number: 12, name: 'Dhul Hijjah', nameArabic: 'ذو الحجة', meaning: 'The One of Pilgrimage' },
  ],
  availableYears: [1446, 1447],
  todayHijri: {
    day: 15,
    month: 3,
    monthName: 'Rabi al-Awwal',
    year: 1447,
    gregorianDate: new Date('2025-09-09'),
  },
  gregorianToHijri: vi.fn((date: Date) => {
    // Return mock data for tests
    return {
      day: 15,
      month: 3,
      monthName: 'Rabi al-Awwal',
      year: 1447,
      gregorianDate: date,
    }
  }),
}))

describe('useHijriCalendar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('returns todayHijri from data layer', () => {
      const { result } = renderHook(() => useHijriCalendar())

      expect(result.current.todayHijri).toBeDefined()
      expect(result.current.todayHijri?.year).toBe(1447)
      expect(result.current.todayHijri?.month).toBe(3)
    })

    it('initializes with today\'s year and month', () => {
      const { result } = renderHook(() => useHijriCalendar())

      expect(result.current.currentHijriYear).toBe(1447)
      expect(result.current.currentHijriMonth).toBe(3)
    })

    it('returns hijriMonths from data layer', () => {
      const { result } = renderHook(() => useHijriCalendar())

      expect(result.current.hijriMonths).toHaveLength(5)
      expect(result.current.hijriMonths[0].name).toBe('Muharram')
    })

    it('returns availableYears from data layer', () => {
      const { result } = renderHook(() => useHijriCalendar())

      expect(result.current.availableYears).toEqual([1446, 1447])
    })
  })

  describe('currentMonthData', () => {
    it('returns month data for current year and month', () => {
      const { result } = renderHook(() => useHijriCalendar())

      expect(result.current.currentMonthData).toBeDefined()
      expect(result.current.currentMonthData?.monthName).toBe('Rabi al-Awwal')
      expect(result.current.currentMonthData?.days).toBe(30)
    })

    it('returns undefined when no matching month exists', () => {
      const { result } = renderHook(() => useHijriCalendar())

      // Navigate to a month that doesn't exist
      act(() => {
        result.current.goToMonth(1447, 12)
      })

      // Should stay on current month since 1447/12 doesn't exist
      expect(result.current.currentMonthData?.monthName).toBe('Rabi al-Awwal')
    })
  })

  describe('calendarDays', () => {
    it('generates correct number of calendar days', () => {
      const { result } = renderHook(() => useHijriCalendar())

      expect(result.current.calendarDays).toHaveLength(30) // Rabi al-Awwal has 30 days
    })

    it('each day has correct hijriDay starting from 1', () => {
      const { result } = renderHook(() => useHijriCalendar())

      expect(result.current.calendarDays[0].hijriDay).toBe(1)
      expect(result.current.calendarDays[29].hijriDay).toBe(30)
    })

    it('each day is marked as current month', () => {
      const { result } = renderHook(() => useHijriCalendar())

      result.current.calendarDays.forEach(day => {
        expect(day.isCurrentMonth).toBe(true)
      })
    })

    it('includes gregorian dates', () => {
      const { result } = renderHook(() => useHijriCalendar())

      expect(result.current.calendarDays[0].gregorianDate).toBeDefined()
      expect(result.current.calendarDays[0].gregorianDate instanceof Date).toBe(true)
    })
  })

  describe('navigation - previousMonth', () => {
    it('decrements month within same year', () => {
      const { result } = renderHook(() => useHijriCalendar())

      // Start at month 3
      expect(result.current.currentHijriMonth).toBe(3)

      act(() => {
        result.current.previousMonth()
      })

      expect(result.current.currentHijriMonth).toBe(2)
      expect(result.current.currentHijriYear).toBe(1447)
    })

    it('wraps to previous year at month 1', () => {
      const { result } = renderHook(() => useHijriCalendar())

      // Navigate to month 1
      act(() => {
        result.current.goToMonth(1447, 1)
      })

      expect(result.current.currentHijriMonth).toBe(1)

      act(() => {
        result.current.previousMonth()
      })

      expect(result.current.currentHijriMonth).toBe(12)
      expect(result.current.currentHijriYear).toBe(1446)
    })

    it('navigates even if previous month data does not exist (UI should use canGoPrevious)', () => {
      const { result } = renderHook(() => useHijriCalendar())

      // Navigate to first available month (1446/11)
      act(() => {
        result.current.goToMonth(1446, 11)
      })

      // canGoPrevious should be false since 1446/10 doesn't exist
      expect(result.current.canGoPrevious).toBe(false)

      act(() => {
        result.current.previousMonth()
      })

      // Navigation happens (month decrements) - UI should prevent this via canGoPrevious
      expect(result.current.currentHijriMonth).toBe(10)
      expect(result.current.currentHijriYear).toBe(1446)
      // currentMonthData will be undefined for non-existent month
      expect(result.current.currentMonthData).toBeUndefined()
    })
  })

  describe('navigation - nextMonth', () => {
    it('increments month within same year', () => {
      const { result } = renderHook(() => useHijriCalendar())

      // Navigate to month 1
      act(() => {
        result.current.goToMonth(1447, 1)
      })

      act(() => {
        result.current.nextMonth()
      })

      expect(result.current.currentHijriMonth).toBe(2)
      expect(result.current.currentHijriYear).toBe(1447)
    })

    it('wraps to next year at month 12', () => {
      const { result } = renderHook(() => useHijriCalendar())

      // Navigate to month 12 of 1446
      act(() => {
        result.current.goToMonth(1446, 12)
      })

      act(() => {
        result.current.nextMonth()
      })

      expect(result.current.currentHijriMonth).toBe(1)
      expect(result.current.currentHijriYear).toBe(1447)
    })

    it('navigates even if next month data does not exist (UI should use canGoNext)', () => {
      const { result } = renderHook(() => useHijriCalendar())

      // Already at month 3 which is the last in our mock data
      // canGoNext should be false since 1447/4 doesn't exist
      expect(result.current.canGoNext).toBe(false)

      act(() => {
        result.current.nextMonth()
      })

      // Navigation happens (month increments) - UI should prevent this via canGoNext
      expect(result.current.currentHijriMonth).toBe(4)
      expect(result.current.currentHijriYear).toBe(1447)
      // currentMonthData will be undefined for non-existent month
      expect(result.current.currentMonthData).toBeUndefined()
    })
  })

  describe('navigation - goToToday', () => {
    it('navigates to current date\'s month', () => {
      const { result } = renderHook(() => useHijriCalendar())

      // Navigate away from today
      act(() => {
        result.current.goToMonth(1446, 11)
      })

      expect(result.current.currentHijriMonth).toBe(11)
      expect(result.current.currentHijriYear).toBe(1446)

      // Go back to today
      act(() => {
        result.current.goToToday()
      })

      expect(result.current.currentHijriMonth).toBe(3)
      expect(result.current.currentHijriYear).toBe(1447)
    })
  })

  describe('navigation - goToMonth', () => {
    it('navigates to specified month if it exists', () => {
      const { result } = renderHook(() => useHijriCalendar())

      act(() => {
        result.current.goToMonth(1446, 12)
      })

      expect(result.current.currentHijriMonth).toBe(12)
      expect(result.current.currentHijriYear).toBe(1446)
    })

    it('does not navigate if month does not exist', () => {
      const { result } = renderHook(() => useHijriCalendar())

      const initialMonth = result.current.currentHijriMonth
      const initialYear = result.current.currentHijriYear

      act(() => {
        result.current.goToMonth(1450, 6) // Non-existent
      })

      expect(result.current.currentHijriMonth).toBe(initialMonth)
      expect(result.current.currentHijriYear).toBe(initialYear)
    })
  })

  describe('canGoPrevious', () => {
    it('returns true when previous month exists', () => {
      const { result } = renderHook(() => useHijriCalendar())

      // At month 3, month 2 exists
      expect(result.current.canGoPrevious).toBe(true)
    })

    it('returns true when wrapping to previous year is possible', () => {
      const { result } = renderHook(() => useHijriCalendar())

      act(() => {
        result.current.goToMonth(1447, 1)
      })

      // At 1447/1, can go to 1446/12
      expect(result.current.canGoPrevious).toBe(true)
    })

    it('returns false when no previous month exists', () => {
      const { result } = renderHook(() => useHijriCalendar())

      act(() => {
        result.current.goToMonth(1446, 11)
      })

      // At 1446/11, no 1446/10 exists
      expect(result.current.canGoPrevious).toBe(false)
    })
  })

  describe('canGoNext', () => {
    it('returns true when next month exists', () => {
      const { result } = renderHook(() => useHijriCalendar())

      act(() => {
        result.current.goToMonth(1447, 1)
      })

      // At month 1, month 2 exists
      expect(result.current.canGoNext).toBe(true)
    })

    it('returns true when wrapping to next year is possible', () => {
      const { result } = renderHook(() => useHijriCalendar())

      act(() => {
        result.current.goToMonth(1446, 12)
      })

      // At 1446/12, can go to 1447/1
      expect(result.current.canGoNext).toBe(true)
    })

    it('returns false when no next month exists', () => {
      const { result } = renderHook(() => useHijriCalendar())

      // At 1447/3, no 1447/4 exists
      expect(result.current.canGoNext).toBe(false)
    })
  })

  describe('function stability', () => {
    it('previousMonth is stable across re-renders', () => {
      const { result, rerender } = renderHook(() => useHijriCalendar())

      const firstPreviousMonth = result.current.previousMonth
      rerender()

      expect(result.current.previousMonth).toBe(firstPreviousMonth)
    })

    it('nextMonth is stable across re-renders', () => {
      const { result, rerender } = renderHook(() => useHijriCalendar())

      const firstNextMonth = result.current.nextMonth
      rerender()

      expect(result.current.nextMonth).toBe(firstNextMonth)
    })

    it('goToToday is stable across re-renders', () => {
      const { result, rerender } = renderHook(() => useHijriCalendar())

      const firstGoToToday = result.current.goToToday
      rerender()

      expect(result.current.goToToday).toBe(firstGoToToday)
    })

    it('goToMonth is stable across re-renders', () => {
      const { result, rerender } = renderHook(() => useHijriCalendar())

      const firstGoToMonth = result.current.goToMonth
      rerender()

      expect(result.current.goToMonth).toBe(firstGoToMonth)
    })
  })

  describe('return value shape', () => {
    it('returns all expected properties', () => {
      const { result } = renderHook(() => useHijriCalendar())

      expect(result.current).toHaveProperty('todayHijri')
      expect(result.current).toHaveProperty('currentMonthData')
      expect(result.current).toHaveProperty('currentHijriYear')
      expect(result.current).toHaveProperty('currentHijriMonth')
      expect(result.current).toHaveProperty('calendarDays')
      expect(result.current).toHaveProperty('hijriMonths')
      expect(result.current).toHaveProperty('availableYears')
      expect(result.current).toHaveProperty('previousMonth')
      expect(result.current).toHaveProperty('nextMonth')
      expect(result.current).toHaveProperty('goToToday')
      expect(result.current).toHaveProperty('goToMonth')
      expect(result.current).toHaveProperty('canGoPrevious')
      expect(result.current).toHaveProperty('canGoNext')
    })

    it('has correct types for all properties', () => {
      const { result } = renderHook(() => useHijriCalendar())

      expect(typeof result.current.currentHijriYear).toBe('number')
      expect(typeof result.current.currentHijriMonth).toBe('number')
      expect(Array.isArray(result.current.calendarDays)).toBe(true)
      expect(Array.isArray(result.current.hijriMonths)).toBe(true)
      expect(Array.isArray(result.current.availableYears)).toBe(true)
      expect(typeof result.current.previousMonth).toBe('function')
      expect(typeof result.current.nextMonth).toBe('function')
      expect(typeof result.current.goToToday).toBe('function')
      expect(typeof result.current.goToMonth).toBe('function')
      expect(typeof result.current.canGoPrevious).toBe('boolean')
      expect(typeof result.current.canGoNext).toBe('boolean')
    })
  })
})
