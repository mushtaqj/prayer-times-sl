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
    <Card className="relative overflow-hidden border-none shadow-lg bg-primary text-primary-foreground group">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent scale-150" />
      <div className="absolute top-0 right-0 p-12 opacity-5 bg-gradient-to-bl from-accent to-transparent rounded-full blur-3xl pointer-events-none" />

      <CardContent className="p-8 relative z-10">
        <div className="text-center space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-medium opacity-80 uppercase tracking-[0.2em] font-sans">Next Prayer</p>
            <h2 className="text-5xl font-bold font-heading tracking-tight">{prayerName}</h2>
          </div>

          <div className="py-2">
            <p className="text-3xl font-light font-sans opacity-95">{prayerTime}</p>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm font-medium bg-primary-foreground/10 py-1.5 px-4 rounded-full w-fit mx-auto backdrop-blur-sm">
            <span>Starts in {countdown}</span>
          </div>

          <div className="pt-2 max-w-xs mx-auto">
            <Progress
              value={progress}
              className="h-1.5 bg-black/20 [&>div]:bg-accent"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
