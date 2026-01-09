import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { NextPrayerBanner } from '@/components/NextPrayerBanner'
import { PrayerRow } from '@/components/PrayerRow'
import type { PrayerTime } from '@/hooks/usePrayerTimes'
import type { PrayerName } from '@/hooks/useAlarms'

interface DailyViewProps {
  prayers: PrayerTime | null
  nextPrayer: { name: string; time: string; displayName: string } | null
  alarms: Record<string, boolean>
  onToggleAlarm: (prayer: PrayerName) => void
  location: string
}

const prayerInfo: { key: PrayerName; label: string }[] = [
  { key: 'fajr', label: 'Fajr' },
  { key: 'sunrise', label: 'Sunrise' },
  { key: 'dhuhr', label: 'Dhuhr' },
  { key: 'asr', label: 'Asr' },
  { key: 'maghrib', label: 'Maghrib' },
  { key: 'isha', label: 'Isha' },
]

export function DailyView({ prayers, nextPrayer, alarms, onToggleAlarm, location }: DailyViewProps) {
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
    <div className="space-y-4">
      {/* Next Prayer Banner */}
      {nextPrayer && (
        <NextPrayerBanner
          prayerName={nextPrayer.displayName}
          prayerTime={nextPrayer.time}
        />
      )}

      {/* Prayer List */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">{dateString}</p>
            <p className="text-sm text-muted-foreground">{location}</p>
          </div>
          <Separator className="mb-2" />
          <div className="divide-y divide-border">
            {prayerInfo.map(({ key, label }) => (
              <PrayerRow
                key={key}
                name={label}
                time={prayers[key]}
                isNext={nextPrayer?.name === key}
                showAlarm
                alarmEnabled={alarms[key]}
                onToggleAlarm={() => onToggleAlarm(key)}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
