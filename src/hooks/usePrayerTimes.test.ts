import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { usePrayerTimes } from './usePrayerTimes'

describe('usePrayerTimes', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('district selection', () => {
    it('returns the selected district', () => {
      const { result } = renderHook(() => usePrayerTimes('colombo'))

      expect(result.current.district.id).toBe('colombo')
      expect(result.current.district.name).toBe('Colombo')
    })

    it('returns first district as fallback for invalid id', () => {
      const { result } = renderHook(() => usePrayerTimes('invalid-district'))

      expect(result.current.district).toBeDefined()
      expect(result.current.district.id).toBeDefined()
    })

    it('returns all districts', () => {
      const { result } = renderHook(() => usePrayerTimes('colombo'))

      expect(result.current.districts).toBeDefined()
      expect(result.current.districts.length).toBeGreaterThan(0)
      expect(result.current.districts[0]).toHaveProperty('id')
      expect(result.current.districts[0]).toHaveProperty('name')
    })

    it('updates when district id changes', () => {
      const { result, rerender } = renderHook(
        ({ districtId }) => usePrayerTimes(districtId),
        { initialProps: { districtId: 'colombo' } }
      )

      expect(result.current.district.id).toBe('colombo')

      rerender({ districtId: 'kandy' })

      expect(result.current.district.id).toBe('kandy')
    })
  })

  describe('todayPrayers', () => {
    it('returns prayer times for today', () => {
      // Set to a known date with data available (assuming January has data)
      vi.setSystemTime(new Date('2024-01-15T12:00:00'))

      const { result } = renderHook(() => usePrayerTimes('colombo'))

      expect(result.current.todayPrayers).not.toBeNull()
      expect(result.current.todayPrayers).toHaveProperty('fajr')
      expect(result.current.todayPrayers).toHaveProperty('sunrise')
      expect(result.current.todayPrayers).toHaveProperty('dhuhr')
      expect(result.current.todayPrayers).toHaveProperty('asr')
      expect(result.current.todayPrayers).toHaveProperty('maghrib')
      expect(result.current.todayPrayers).toHaveProperty('isha')
    })

    it('returns prayer times in correct format', () => {
      vi.setSystemTime(new Date('2024-01-15T12:00:00'))

      const { result } = renderHook(() => usePrayerTimes('colombo'))

      // Prayer times should be strings in format like "5:30 AM"
      if (result.current.todayPrayers) {
        expect(typeof result.current.todayPrayers.fajr).toBe('string')
        expect(result.current.todayPrayers.fajr).toMatch(/^\d{1,2}:\d{2} (AM|PM)$/)
      }
    })

    it('includes day number', () => {
      vi.setSystemTime(new Date('2024-01-15T12:00:00'))

      const { result } = renderHook(() => usePrayerTimes('colombo'))

      if (result.current.todayPrayers) {
        expect(result.current.todayPrayers.day).toBe(15)
      }
    })
  })

  describe('weekPrayers', () => {
    it('returns 7 days of prayer times', () => {
      vi.setSystemTime(new Date('2024-01-15T12:00:00'))

      const { result } = renderHook(() => usePrayerTimes('colombo'))

      expect(result.current.weekPrayers).toHaveLength(7)
    })

    it('includes date for each day', () => {
      vi.setSystemTime(new Date('2024-01-15T12:00:00'))

      const { result } = renderHook(() => usePrayerTimes('colombo'))

      result.current.weekPrayers.forEach(prayer => {
        expect(prayer.date).toBeInstanceOf(Date)
      })
    })

    it('returns consecutive days starting from today', () => {
      vi.setSystemTime(new Date('2024-01-15T12:00:00'))

      const { result } = renderHook(() => usePrayerTimes('colombo'))

      expect(result.current.weekPrayers[0].day).toBe(15)
      expect(result.current.weekPrayers[1].day).toBe(16)
      expect(result.current.weekPrayers[2].day).toBe(17)
    })
  })

  describe('getMonthPrayers', () => {
    it('returns prayer times for specified month', () => {
      const { result } = renderHook(() => usePrayerTimes('colombo'))

      const januaryPrayers = result.current.getMonthPrayers(1)

      expect(januaryPrayers).toBeDefined()
      expect(januaryPrayers.length).toBeGreaterThan(0)
    })

    it('returns array of prayer times with day numbers', () => {
      const { result } = renderHook(() => usePrayerTimes('colombo'))

      const prayers = result.current.getMonthPrayers(1)

      prayers.forEach(prayer => {
        expect(prayer).toHaveProperty('day')
        expect(prayer).toHaveProperty('fajr')
        expect(prayer).toHaveProperty('isha')
      })
    })

    it('returns empty array for invalid month', () => {
      const { result } = renderHook(() => usePrayerTimes('colombo'))

      const invalidMonthPrayers = result.current.getMonthPrayers(13)

      expect(invalidMonthPrayers).toEqual([])
    })
  })

  describe('currentPrayer and nextPrayer', () => {
    it('returns Fajr as current and Sunrise as next during Fajr time', () => {
      // Set time to after Fajr but before Sunrise (around 5:30 AM)
      vi.setSystemTime(new Date('2024-01-15T05:45:00'))

      const { result } = renderHook(() => usePrayerTimes('colombo'))

      expect(result.current.currentPrayer?.name).toBe('fajr')
      expect(result.current.nextPrayer?.name).toBe('sunrise')
    })

    it('returns Dhuhr as current and Asr as next during Dhuhr time', () => {
      // Set time to after Dhuhr but before Asr (around 1:00 PM)
      vi.setSystemTime(new Date('2024-01-15T13:00:00'))

      const { result } = renderHook(() => usePrayerTimes('colombo'))

      expect(result.current.currentPrayer?.name).toBe('dhuhr')
      expect(result.current.nextPrayer?.name).toBe('asr')
    })

    it('returns Isha as current and Fajr as next after Isha', () => {
      // Set time to after Isha (around 9:00 PM)
      vi.setSystemTime(new Date('2024-01-15T21:00:00'))

      const { result } = renderHook(() => usePrayerTimes('colombo'))

      expect(result.current.currentPrayer?.name).toBe('isha')
      expect(result.current.nextPrayer?.name).toBe('fajr')
    })

    it('includes display names and Arabic names', () => {
      vi.setSystemTime(new Date('2024-01-15T12:00:00'))

      const { result } = renderHook(() => usePrayerTimes('colombo'))

      if (result.current.currentPrayer) {
        expect(result.current.currentPrayer.displayName).toBeDefined()
        expect(result.current.currentPrayer.arabicName).toBeDefined()
      }

      if (result.current.nextPrayer) {
        expect(result.current.nextPrayer.displayName).toBeDefined()
        expect(result.current.nextPrayer.arabicName).toBeDefined()
      }
    })

    it('includes prayer time in the result', () => {
      vi.setSystemTime(new Date('2024-01-15T12:00:00'))

      const { result } = renderHook(() => usePrayerTimes('colombo'))

      if (result.current.nextPrayer) {
        expect(result.current.nextPrayer.time).toMatch(/^\d{1,2}:\d{2} (AM|PM)$/)
      }
    })
  })

  describe('return value shape', () => {
    it('returns all expected properties', () => {
      vi.setSystemTime(new Date('2024-01-15T12:00:00'))

      const { result } = renderHook(() => usePrayerTimes('colombo'))

      expect(result.current).toHaveProperty('districts')
      expect(result.current).toHaveProperty('district')
      expect(result.current).toHaveProperty('todayPrayers')
      expect(result.current).toHaveProperty('weekPrayers')
      expect(result.current).toHaveProperty('getMonthPrayers')
      expect(result.current).toHaveProperty('currentPrayer')
      expect(result.current).toHaveProperty('nextPrayer')
    })
  })
})
