import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { parseTime, parseTimeToMinutes, formatCountdown } from './timeUtils'

describe('timeUtils', () => {
  describe('parseTime', () => {
    beforeEach(() => {
      // Mock the current date to a specific time for consistent tests
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-01-15T12:00:00'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should parse AM time correctly', () => {
      const result = parseTime('5:30 AM')
      expect(result.getHours()).toBe(5)
      expect(result.getMinutes()).toBe(30)
    })

    it('should parse PM time correctly', () => {
      const result = parseTime('3:45 PM')
      expect(result.getHours()).toBe(15)
      expect(result.getMinutes()).toBe(45)
    })

    it('should parse 12:00 AM (midnight) correctly', () => {
      const result = parseTime('12:00 AM')
      expect(result.getHours()).toBe(0)
      expect(result.getMinutes()).toBe(0)
    })

    it('should parse 12:00 PM (noon) correctly', () => {
      const result = parseTime('12:00 PM')
      expect(result.getHours()).toBe(12)
      expect(result.getMinutes()).toBe(0)
    })

    it('should parse 12:30 PM correctly', () => {
      const result = parseTime('12:30 PM')
      expect(result.getHours()).toBe(12)
      expect(result.getMinutes()).toBe(30)
    })

    it('should return a Date object for today', () => {
      const result = parseTime('5:30 AM')
      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(0) // January
      expect(result.getDate()).toBe(15)
    })
  })

  describe('parseTimeToMinutes', () => {
    it('should convert AM time to minutes since midnight', () => {
      expect(parseTimeToMinutes('5:30 AM')).toBe(5 * 60 + 30) // 330 minutes
    })

    it('should convert PM time to minutes since midnight', () => {
      expect(parseTimeToMinutes('3:45 PM')).toBe(15 * 60 + 45) // 945 minutes
    })

    it('should handle 12:00 AM (midnight)', () => {
      expect(parseTimeToMinutes('12:00 AM')).toBe(0)
    })

    it('should handle 12:00 PM (noon)', () => {
      expect(parseTimeToMinutes('12:00 PM')).toBe(12 * 60) // 720 minutes
    })

    it('should handle 12:30 AM', () => {
      expect(parseTimeToMinutes('12:30 AM')).toBe(30)
    })

    it('should handle 11:59 PM', () => {
      expect(parseTimeToMinutes('11:59 PM')).toBe(23 * 60 + 59) // 1439 minutes
    })
  })

  describe('formatCountdown', () => {
    it('should return "Now" for zero milliseconds', () => {
      expect(formatCountdown(0)).toBe('Now')
    })

    it('should return "Now" for negative milliseconds', () => {
      expect(formatCountdown(-1000)).toBe('Now')
    })

    it('should format minutes only when less than an hour', () => {
      expect(formatCountdown(30 * 60 * 1000)).toBe('30m')
    })

    it('should format hours and minutes', () => {
      expect(formatCountdown(2 * 60 * 60 * 1000 + 30 * 60 * 1000)).toBe('2h 30m')
    })

    it('should round down partial minutes', () => {
      expect(formatCountdown(30 * 60 * 1000 + 45 * 1000)).toBe('30m')
    })

    it('should handle exactly 1 hour', () => {
      expect(formatCountdown(60 * 60 * 1000)).toBe('1h 0m')
    })

    it('should handle 1 minute', () => {
      expect(formatCountdown(60 * 1000)).toBe('1m')
    })

    it('should handle less than 1 minute as 0m', () => {
      expect(formatCountdown(30 * 1000)).toBe('0m')
    })
  })
})
