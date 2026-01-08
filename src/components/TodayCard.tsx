import { Card, CardContent, CardHeader, CardTitle } from '@/components/retroui/Card'
import { Badge } from '@/components/retroui/Badge'
import { Toggle } from '@/components/retroui/Toggle'
import { Bell, BellOff } from 'lucide-react'
import type { PrayerTime } from '@/hooks/usePrayerTimes'
import type { PrayerName } from '@/hooks/useAlarms'

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
      <Card className="w-full">
        <CardContent className="p-6">
          <p className="text-center text-[var(--muted-foreground)]">
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
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle>Today's Prayer Times</CardTitle>
          <Badge variant="primary" className="w-fit">{dateString}</Badge>
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
                className={`relative p-3 rounded-xl border-2 border-[var(--foreground)] transition-all ${
                  isNext
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[4px_4px_0px_0px_var(--foreground)]'
                    : 'bg-[var(--card)]'
                }`}
              >
                {isNext && (
                  <Badge variant="secondary" className="absolute -top-2 -right-2 text-xs">
                    Next
                  </Badge>
                )}
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl">{icon}</span>
                  <span className="font-semibold text-sm">{label}</span>
                  <span className={`text-lg font-bold ${isNext ? '' : 'text-[var(--primary)]'}`}>
                    {time}
                  </span>
                  <Toggle
                    size="sm"
                    pressed={alarms[key]}
                    onPressedChange={() => onToggleAlarm(key)}
                    className={`mt-1 ${isNext ? 'border-[var(--primary-foreground)]' : ''}`}
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
