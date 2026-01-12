import { useState, useEffect } from 'react'
import { parseTime, formatCountdown } from '@/lib/utils/time'

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
  updateInterval = 60000,
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
        const progressPercent = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100))
        setProgress(progressPercent)
      } else {
        // Fallback: assume ~6 hours between prayers
        const totalDuration = 6 * 60 * 60 * 1000
        const elapsed = totalDuration - diff
        const progressPercent = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100))
        setProgress(progressPercent)
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, updateInterval)

    return () => clearInterval(interval)
  }, [targetTime, currentPrayerTime, updateInterval])

  return { countdown, progress, remainingMs }
}
