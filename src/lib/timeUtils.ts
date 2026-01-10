/**
 * Time utility functions for parsing and formatting prayer times
 */

/**
 * Parse a 12-hour time string (e.g. "5:30 AM") to a Date object for today
 */
export function parseTime(time: string): Date {
  const now = new Date()
  const [timePart, period] = time.split(' ')
  const [hours, minutes] = timePart.split(':').map(Number)

  let targetHours = hours
  if (period === 'PM' && hours !== 12) targetHours += 12
  if (period === 'AM' && hours === 12) targetHours = 0

  const targetTime = new Date(now)
  targetTime.setHours(targetHours, minutes, 0, 0)
  return targetTime
}

/**
 * Parse a 12-hour time string to minutes since midnight
 */
export function parseTimeToMinutes(time: string): number {
  const [timePart, period] = time.split(' ')
  const [hours, minutes] = timePart.split(':').map(Number)
  let prayerHours = hours
  if (period === 'PM' && hours !== 12) prayerHours += 12
  if (period === 'AM' && hours === 12) prayerHours = 0
  return prayerHours * 60 + minutes
}

/**
 * Format milliseconds to a countdown string (e.g. "2h 30m" or "45m")
 */
export function formatCountdown(ms: number): string {
  if (ms <= 0) return 'Now'

  const totalMinutes = Math.floor(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}
