import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface NextPrayerBannerProps {
  prayerName: string
  prayerTime: string
}

function parseTime(time: string): Date {
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

function formatCountdown(ms: number): string {
  if (ms <= 0) return 'Now'

  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

export function NextPrayerBanner({ prayerName, prayerTime }: NextPrayerBannerProps) {
  const [countdown, setCountdown] = useState('')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const targetTime = parseTime(prayerTime)

    const updateCountdown = () => {
      const now = new Date()
      const diff = targetTime.getTime() - now.getTime()

      setCountdown(formatCountdown(diff))

      // Calculate progress (assuming ~6 hours between prayers on average)
      const totalDuration = 6 * 60 * 60 * 1000 // 6 hours in ms
      const elapsed = totalDuration - diff
      const progressPercent = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100))
      setProgress(progressPercent)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [prayerTime])

  return (
    <Card className="bg-primary text-primary-foreground border-primary">
      <CardContent className="p-6">
        <div className="text-center space-y-3">
          <p className="text-sm opacity-90 uppercase tracking-wide">Next Prayer</p>
          <h2 className="text-3xl font-bold">{prayerName}</h2>
          <p className="text-xl font-semibold">{prayerTime}</p>
          <div className="flex items-center justify-center gap-2 text-sm opacity-90">
            <span>in {countdown}</span>
          </div>
          <Progress
            value={progress}
            className="h-2 bg-primary-foreground/20 [&>div]:bg-primary-foreground"
          />
        </div>
      </CardContent>
    </Card>
  )
}
