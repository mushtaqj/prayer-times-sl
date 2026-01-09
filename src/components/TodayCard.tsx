import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Toggle } from '@/components/ui/toggle'
import { Bell, BellOff } from 'lucide-react'
import type { PrayerTime } from '@/hooks/usePrayerTimes'
import type { PrayerName } from '@/hooks/useAlarms'
import { cn } from '@/lib/utils'

interface TodayCardProps {
  prayers: PrayerTime | null
  nextPrayer: { name: string; time: string; displayName: string } | null
  alarms: Record<string, boolean>
  onToggleAlarm: (prayer: PrayerName) => void
}

const prayerInfo: { key: PrayerName; label: string; icon: string }[] = [
  { key: 'fajr', label: 'Fajr', icon: '🌅' },
  { key: 'sunrise', label: 'Sunrise', icon: '☀️' },
  { key: 'dhuhr', label: 'Dhuhr', icon: '🌤️' },
  { key: 'asr', label: 'Asr', icon: '⛅' },
  { key: 'maghrib', label: 'Maghrib', icon: '🌇' },
  { key: 'isha', label: 'Isha', icon: '🌙' },
]

export function TodayCard({ prayers, nextPrayer, alarms, onToggleAlarm }: TodayCardProps) {
  if (!prayers) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Prayer times not available for this date.
          </p>
        </CardContent>
      </Card>
    )
  }

  const today = new Date()
  const dateString = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle>Today's Prayer Times</CardTitle>
          <Badge variant="default">{dateString}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {prayerInfo.map(({ key, label, icon }) => {
            const isNext = nextPrayer?.name === key
            const time = prayers[key]

            return (
              <div
                key={key}
                className={cn(
                  "relative p-4 rounded-lg border transition-all",
                  isNext
                    ? "bg-primary text-primary-foreground border-primary shadow-lg"
                    : "bg-card border-border hover:bg-accent"
                )}
              >
                {isNext && (
                  <Badge variant="secondary" className="absolute -top-2 -right-2 text-xs">
                    Next
                  </Badge>
                )}
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl">{icon}</span>
                  <span className="font-semibold text-sm">{label}</span>
                  <span className={cn(
                    "text-lg font-bold",
                    isNext ? "" : "text-primary"
                  )}>
                    {time}
                  </span>
                  <Toggle
                    size="sm"
                    pressed={alarms[key]}
                    onPressedChange={() => onToggleAlarm(key)}
                    className="mt-1"
                  >
                    {alarms[key] ? (
                      <Bell className="w-3 h-3" />
                    ) : (
                      <BellOff className="w-3 h-3" />
                    )}
                  </Toggle>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
