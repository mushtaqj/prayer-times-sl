import { useState, useEffect } from 'react'
import { parseTime, formatCountdown } from '@/lib/utils/time'
import {
  DEFAULT_UPDATE_INTERVAL_MS,
  FALLBACK_PRAYER_DURATION_MS,
  MIN_PROGRESS,
  MAX_PROGRESS,
} from '@/lib/constants/countdownConstants'

interface UseCountdownOptions {
  /** Target prayer time in HH:MM format */
  targetTime: string
  /** Current prayer time for progress calculation (optional) */
  currentPrayerTime?: string
  /** Update interval in milliseconds (default: 60000) */
  updateInterval?: number
}

interface UseCountdownResult {
  /** Formatted countdown string (e.g., "2h 30m") */
  countdown: string
  /** Progress percentage (0-100) */
  progress: number
  /** Time remaining in milliseconds */
  remainingMs: number
}

/**
 * Hook to calculate countdown and progress between prayers
 * Handles midnight crossing for Fajr prayer
 */
export function useCountdown({
  targetTime,
  currentPrayerTime,
  updateInterval = DEFAULT_UPDATE_INTERVAL_MS,
}: UseCountdownOptions): UseCountdownResult {
  const [countdown, setCountdown] = useState('')
  const [progress, setProgress] = useState(0)
  const [remainingMs, setRemainingMs] = useState(0)

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date()
      const target = parseTime(targetTime)

      // If target time is in the past, it means next prayer is tomorrow (Fajr)
      if (target <= now) {
        target.setDate(target.getDate() + 1)
      }

      const diff = target.getTime() - now.getTime()
      setCountdown(formatCountdown(diff))
      setRemainingMs(diff)

      // Calculate progress based on time elapsed since current prayer
      if (currentPrayerTime) {
        const currentTime = parseTime(currentPrayerTime)
        let totalDuration = target.getTime() - currentTime.getTime()

        // If current prayer time is after target (crossing midnight), adjust
        if (totalDuration < 0) {
          currentTime.setDate(currentTime.getDate() - 1)
          totalDuration = target.getTime() - currentTime.getTime()
        }

        const elapsed = now.getTime() - currentTime.getTime()
        const progressPercent = Math.max(MIN_PROGRESS, Math.min(MAX_PROGRESS, (elapsed / totalDuration) * MAX_PROGRESS))
        setProgress(progressPercent)
      } else {
        // Fallback: assume ~6 hours between prayers
        const elapsed = FALLBACK_PRAYER_DURATION_MS - diff
        const progressPercent = Math.max(MIN_PROGRESS, Math.min(MAX_PROGRESS, (elapsed / FALLBACK_PRAYER_DURATION_MS) * MAX_PROGRESS))
        setProgress(progressPercent)
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, updateInterval)

    return () => clearInterval(interval)
  }, [targetTime, currentPrayerTime, updateInterval])

  return { countdown, progress, remainingMs }
}
