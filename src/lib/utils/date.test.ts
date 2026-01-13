import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  parseDate,
  isSameDay,
  addDays,
  daysBetween,
  formatDate,
  isToday,
  formatDateISO,
} from './date'

describe('date utilities', () => {
  describe('parseDate', () => {
    it('parses YYYY-MM-DD format correctly', () => {
      const date = parseDate('2025-06-15')

      expect(date.getFullYear()).toBe(2025)
      expect(date.getMonth()).toBe(5) // 0-indexed
      expect(date.getDate()).toBe(15)
    })

    it('parses first day of year', () => {
      const date = parseDate('2025-01-01')

      expect(date.getFullYear()).toBe(2025)
      expect(date.getMonth()).toBe(0)
      expect(date.getDate()).toBe(1)
    })

    it('parses last day of year', () => {
      const date = parseDate('2025-12-31')

      expect(date.getFullYear()).toBe(2025)
      expect(date.getMonth()).toBe(11)
      expect(date.getDate()).toBe(31)
    })

    it('parses leap year date', () => {
      const date = parseDate('2024-02-29')

      expect(date.getFullYear()).toBe(2024)
      expect(date.getMonth()).toBe(1)
      expect(date.getDate()).toBe(29)
    })
  })

  describe('isSameDay', () => {
    it('returns true for same day', () => {
      const date1 = new Date(2025, 5, 15, 10, 30)
      const date2 = new Date(2025, 5, 15, 22, 45)

      expect(isSameDay(date1, date2)).toBe(true)
    })

    it('returns false for different days', () => {
      const date1 = new Date(2025, 5, 15)
      const date2 = new Date(2025, 5, 16)

      expect(isSameDay(date1, date2)).toBe(false)
    })

    it('returns false for different months', () => {
      const date1 = new Date(2025, 5, 15)
      const date2 = new Date(2025, 6, 15)

      expect(isSameDay(date1, date2)).toBe(false)
    })

    it('returns false for different years', () => {
      const date1 = new Date(2025, 5, 15)
      const date2 = new Date(2026, 5, 15)

      expect(isSameDay(date1, date2)).toBe(false)
    })

    it('ignores time component', () => {
      const date1 = new Date(2025, 5, 15, 0, 0, 0, 0)
      const date2 = new Date(2025, 5, 15, 23, 59, 59, 999)

      expect(isSameDay(date1, date2)).toBe(true)
    })
  })

  describe('addDays', () => {
    it('adds positive days', () => {
      const date = new Date(2025, 5, 15)
      const result = addDays(date, 5)

      expect(result.getDate()).toBe(20)
      expect(result.getMonth()).toBe(5)
    })

    it('adds negative days (subtracts)', () => {
      const date = new Date(2025, 5, 15)
      const result = addDays(date, -5)

      expect(result.getDate()).toBe(10)
      expect(result.getMonth()).toBe(5)
    })

    it('crosses month boundary forward', () => {
      const date = new Date(2025, 5, 28) // June 28
      const result = addDays(date, 5)

      expect(result.getDate()).toBe(3)
      expect(result.getMonth()).toBe(6) // July
    })

    it('crosses month boundary backward', () => {
      const date = new Date(2025, 5, 3) // June 3
      const result = addDays(date, -5)

      expect(result.getDate()).toBe(29)
      expect(result.getMonth()).toBe(4) // May
    })

    it('crosses year boundary', () => {
      const date = new Date(2025, 11, 30) // Dec 30
      const result = addDays(date, 5)

      expect(result.getDate()).toBe(4)
      expect(result.getMonth()).toBe(0) // January
      expect(result.getFullYear()).toBe(2026)
    })

    it('does not mutate original date', () => {
      const date = new Date(2025, 5, 15)
      const originalTime = date.getTime()

      addDays(date, 5)

      expect(date.getTime()).toBe(originalTime)
    })

    it('adds zero days', () => {
      const date = new Date(2025, 5, 15)
      const result = addDays(date, 0)

      expect(isSameDay(result, date)).toBe(true)
    })
  })

  describe('daysBetween', () => {
    it('calculates days between two dates', () => {
      const date1 = new Date(2025, 5, 10)
      const date2 = new Date(2025, 5, 15)

      expect(daysBetween(date1, date2)).toBe(5)
    })

    it('returns negative when date2 is before date1', () => {
      const date1 = new Date(2025, 5, 15)
      const date2 = new Date(2025, 5, 10)

      expect(daysBetween(date1, date2)).toBe(-5)
    })

    it('returns zero for same day', () => {
      const date1 = new Date(2025, 5, 15, 10, 0)
      const date2 = new Date(2025, 5, 15, 22, 0)

      expect(daysBetween(date1, date2)).toBe(0)
    })

    it('calculates across month boundary', () => {
      const date1 = new Date(2025, 5, 28) // June 28
      const date2 = new Date(2025, 6, 3)  // July 3

      expect(daysBetween(date1, date2)).toBe(5)
    })

    it('calculates across year boundary', () => {
      const date1 = new Date(2025, 11, 30) // Dec 30
      const date2 = new Date(2026, 0, 4)   // Jan 4

      expect(daysBetween(date1, date2)).toBe(5)
    })
  })

  describe('formatDate', () => {
    it('formats with default options', () => {
      const date = new Date(2025, 5, 15) // June 15, 2025
      const result = formatDate(date)

      // Default format includes weekday, day, month, year
      expect(result).toContain('Jun')
      expect(result).toContain('15')
      expect(result).toContain('2025')
    })

    it('formats with custom options', () => {
      const date = new Date(2025, 5, 15)
      const result = formatDate(date, { year: 'numeric', month: 'long', day: 'numeric' })

      expect(result).toContain('June')
      expect(result).toContain('15')
      expect(result).toContain('2025')
    })

    it('formats weekday only', () => {
      const date = new Date(2025, 5, 15) // Sunday
      const result = formatDate(date, { weekday: 'long' })

      expect(result).toBe('Sunday')
    })
  })

  describe('isToday', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('returns true for today', () => {
      vi.setSystemTime(new Date(2025, 5, 15, 12, 0, 0))

      const date = new Date(2025, 5, 15, 20, 30)

      expect(isToday(date)).toBe(true)
    })

    it('returns false for yesterday', () => {
      vi.setSystemTime(new Date(2025, 5, 15, 12, 0, 0))

      const date = new Date(2025, 5, 14)

      expect(isToday(date)).toBe(false)
    })

    it('returns false for tomorrow', () => {
      vi.setSystemTime(new Date(2025, 5, 15, 12, 0, 0))

      const date = new Date(2025, 5, 16)

      expect(isToday(date)).toBe(false)
    })
  })

  describe('formatDateISO', () => {
    it('formats date to YYYY-MM-DD', () => {
      // Use UTC noon to avoid timezone day boundary issues
      const date = new Date(Date.UTC(2025, 5, 15, 12, 0, 0))
      const result = formatDateISO(date)

      expect(result).toBe('2025-06-15')
    })

    it('pads single digit month', () => {
      const date = new Date(Date.UTC(2025, 0, 15, 12, 0, 0)) // January 15
      const result = formatDateISO(date)

      expect(result).toBe('2025-01-15')
    })

    it('pads single digit day', () => {
      const date = new Date(Date.UTC(2025, 5, 5, 12, 0, 0)) // June 5
      const result = formatDateISO(date)

      expect(result).toBe('2025-06-05')
    })

    it('handles year correctly', () => {
      const date = new Date(Date.UTC(2030, 11, 31, 12, 0, 0)) // Dec 31, 2030
      const result = formatDateISO(date)

      expect(result).toBe('2030-12-31')
    })
  })
})
