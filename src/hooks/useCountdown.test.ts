import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCountdown } from './useCountdown'

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('countdown calculation', () => {
    it('calculates countdown to future time correctly', () => {
      // Current time: 12:00 PM, Target: 3:00 PM (3 hours away)
      vi.setSystemTime(new Date('2024-01-15T12:00:00'))

      const { result } = renderHook(() =>
        useCountdown({ targetTime: '3:00 PM' })
      )

      expect(result.current.countdown).toBe('3h 0m')
      expect(result.current.remainingMs).toBe(3 * 60 * 60 * 1000)
    })

    it('calculates countdown with minutes correctly', () => {
      // Current time: 12:00 PM, Target: 2:30 PM (2h 30m away)
      vi.setSystemTime(new Date('2024-01-15T12:00:00'))

      const { result } = renderHook(() =>
        useCountdown({ targetTime: '2:30 PM' })
      )

      expect(result.current.countdown).toBe('2h 30m')
    })

    it('handles countdown less than an hour', () => {
      // Current time: 12:00 PM, Target: 12:30 PM (30m away)
      vi.setSystemTime(new Date('2024-01-15T12:00:00'))

      const { result } = renderHook(() =>
        useCountdown({ targetTime: '12:30 PM' })
      )

      expect(result.current.countdown).toBe('30m')
    })

    it('handles midnight crossing (Fajr scenario)', () => {
      // Current time: 11:00 PM, Target: 5:00 AM (next day)
      vi.setSystemTime(new Date('2024-01-15T23:00:00'))

      const { result } = renderHook(() =>
        useCountdown({ targetTime: '5:00 AM' })
      )

      // 6 hours until Fajr
      expect(result.current.countdown).toBe('6h 0m')
    })

    it('handles target time that has passed today (wraps to tomorrow)', () => {
      // Current time: 3:00 PM, Target: 12:00 PM (passed, so tomorrow)
      vi.setSystemTime(new Date('2024-01-15T15:00:00'))

      const { result } = renderHook(() =>
        useCountdown({ targetTime: '12:00 PM' })
      )

      // 21 hours until tomorrow noon
      expect(result.current.countdown).toBe('21h 0m')
    })
  })

  describe('progress calculation', () => {
    it('calculates progress with currentPrayerTime', () => {
      // Current prayer at 12:00 PM, target at 3:00 PM (3 hour duration)
      // Current time: 1:30 PM (1.5 hours elapsed = 50% progress)
      vi.setSystemTime(new Date('2024-01-15T13:30:00'))

      const { result } = renderHook(() =>
        useCountdown({
          targetTime: '3:00 PM',
          currentPrayerTime: '12:00 PM',
        })
      )

      expect(result.current.progress).toBe(50)
    })

    it('clamps progress at 0 when before current prayer', () => {
      // Current prayer at 12:00 PM, target at 3:00 PM
      // Current time: 11:30 AM (before current prayer - should be 0)
      vi.setSystemTime(new Date('2024-01-15T11:30:00'))

      const { result } = renderHook(() =>
        useCountdown({
          targetTime: '3:00 PM',
          currentPrayerTime: '12:00 PM',
        })
      )

      expect(result.current.progress).toBe(0)
    })

    it('wraps target to tomorrow when past, recalculating progress', () => {
      // Current prayer at 12:00 PM, target at 3:00 PM
      // Current time: 3:30 PM - target has passed, so it wraps to tomorrow's 3:00 PM
      // The hook behavior: when target is past, it adds 1 day, making a new duration
      vi.setSystemTime(new Date('2024-01-15T15:30:00'))

      const { result } = renderHook(() =>
        useCountdown({
          targetTime: '3:00 PM',
          currentPrayerTime: '12:00 PM',
        })
      )

      // Target is now tomorrow 3:00 PM (23.5 hours away)
      // Progress starts over based on new duration calculation
      expect(result.current.progress).toBeGreaterThanOrEqual(0)
      expect(result.current.progress).toBeLessThan(100)
    })

    it('uses 6-hour fallback when no currentPrayerTime provided', () => {
      // Current time: 12:00 PM, Target: 3:00 PM (3 hours away)
      // With 6-hour fallback: elapsed = 3 hours, progress = 50%
      vi.setSystemTime(new Date('2024-01-15T12:00:00'))

      const { result } = renderHook(() =>
        useCountdown({ targetTime: '3:00 PM' })
      )

      // 3 hours remaining out of assumed 6 hours total = 50% elapsed
      expect(result.current.progress).toBe(50)
    })

    it('handles midnight crossing for progress calculation', () => {
      // Current prayer at 8:00 PM, target Fajr at 5:00 AM (9 hour duration)
      // Current time: 11:00 PM (3 hours elapsed = ~33.3% progress)
      vi.setSystemTime(new Date('2024-01-15T23:00:00'))

      const { result } = renderHook(() =>
        useCountdown({
          targetTime: '5:00 AM',
          currentPrayerTime: '8:00 PM',
        })
      )

      // 3 hours elapsed out of 9 hours total = 33.33%
      expect(result.current.progress).toBeCloseTo(33.33, 1)
    })
  })

  describe('interval updates', () => {
    it('updates countdown on interval', () => {
      vi.setSystemTime(new Date('2024-01-15T12:00:00'))

      const { result } = renderHook(() =>
        useCountdown({
          targetTime: '3:00 PM',
          updateInterval: 60000,
        })
      )

      expect(result.current.countdown).toBe('3h 0m')

      // Advance time by 30 minutes and trigger interval
      act(() => {
        vi.setSystemTime(new Date('2024-01-15T12:30:00'))
        vi.advanceTimersByTime(60000) // Trigger interval callback
      })

      // Allow for minor rounding differences (2h 29m or 2h 30m are both acceptable)
      expect(['2h 29m', '2h 30m']).toContain(result.current.countdown)
    })

    it('uses default 60-second interval', () => {
      vi.setSystemTime(new Date('2024-01-15T12:00:00'))
      const setIntervalSpy = vi.spyOn(global, 'setInterval')

      renderHook(() =>
        useCountdown({ targetTime: '3:00 PM' })
      )

      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 60000)
    })

    it('uses custom interval when provided', () => {
      vi.setSystemTime(new Date('2024-01-15T12:00:00'))
      const setIntervalSpy = vi.spyOn(global, 'setInterval')

      renderHook(() =>
        useCountdown({
          targetTime: '3:00 PM',
          updateInterval: 1000,
        })
      )

      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000)
    })

    it('clears interval on unmount', () => {
      vi.setSystemTime(new Date('2024-01-15T12:00:00'))
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval')

      const { unmount } = renderHook(() =>
        useCountdown({ targetTime: '3:00 PM' })
      )

      unmount()

      expect(clearIntervalSpy).toHaveBeenCalled()
    })
  })

  describe('remainingMs', () => {
    it('returns correct remaining milliseconds', () => {
      vi.setSystemTime(new Date('2024-01-15T12:00:00'))

      const { result } = renderHook(() =>
        useCountdown({ targetTime: '3:00 PM' })
      )

      expect(result.current.remainingMs).toBe(3 * 60 * 60 * 1000) // 3 hours in ms
    })

    it('updates remainingMs on interval', () => {
      vi.setSystemTime(new Date('2024-01-15T12:00:00'))

      const { result } = renderHook(() =>
        useCountdown({
          targetTime: '3:00 PM',
          updateInterval: 60000,
        })
      )

      const initialRemaining = result.current.remainingMs

      // Advance by 1 minute
      act(() => {
        vi.setSystemTime(new Date('2024-01-15T12:01:00'))
        vi.advanceTimersByTime(60000)
      })

      // Should be approximately 1 minute less (allow for minor timing differences)
      expect(result.current.remainingMs).toBeLessThan(initialRemaining)
      expect(result.current.remainingMs).toBeGreaterThanOrEqual(initialRemaining - 120000) // Within 2 minutes
    })
  })

  describe('edge cases', () => {
    it('handles target time exactly at current time', () => {
      vi.setSystemTime(new Date('2024-01-15T12:00:00'))

      const { result } = renderHook(() =>
        useCountdown({ targetTime: '12:00 PM' })
      )

      // Should wrap to tomorrow (24 hours)
      expect(result.current.countdown).toBe('24h 0m')
    })

    it('handles props change', () => {
      vi.setSystemTime(new Date('2024-01-15T12:00:00'))

      const { result, rerender } = renderHook(
        ({ targetTime }) => useCountdown({ targetTime }),
        { initialProps: { targetTime: '3:00 PM' } }
      )

      expect(result.current.countdown).toBe('3h 0m')

      rerender({ targetTime: '4:00 PM' })

      expect(result.current.countdown).toBe('4h 0m')
    })
  })

  describe('return value shape', () => {
    it('returns correct object shape', () => {
      vi.setSystemTime(new Date('2024-01-15T12:00:00'))

      const { result } = renderHook(() =>
        useCountdown({ targetTime: '3:00 PM' })
      )

      expect(result.current).toHaveProperty('countdown')
      expect(result.current).toHaveProperty('progress')
      expect(result.current).toHaveProperty('remainingMs')
      expect(typeof result.current.countdown).toBe('string')
      expect(typeof result.current.progress).toBe('number')
      expect(typeof result.current.remainingMs).toBe('number')
    })
  })
})
