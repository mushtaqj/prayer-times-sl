import { Card, CardContent } from '@/components/ui/card'

import { NextPrayerBanner } from '@/components/NextPrayerBanner'
import { PrayerRow } from '@/components/PrayerRow'
import { HijriDateDisplay } from '@/components/HijriDateDisplay'
import { gregorianToHijri } from '@/lib/hijriCalendar'
import type { PrayerTime } from '@/hooks/usePrayerTimes'
import type { PrayerName } from '@/hooks/useAlarms'

interface DailyViewProps {
  prayers: PrayerTime | null
  nextPrayer: { name: string; time: string; displayName: string } | null
  currentPrayer: { name: string; time: string; displayName: string } | null
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

export function DailyView({ prayers, nextPrayer, currentPrayer, alarms, onToggleAlarm, location }: DailyViewProps) {
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
  const hijriToday = gregorianToHijri(today)

  return (
    <div className="space-y-4">
      {/* Next Prayer Banner */}
      {nextPrayer && (
        <NextPrayerBanner
          prayerName={nextPrayer.displayName}
          prayerTime={nextPrayer.time}
          currentPrayerTime={currentPrayer?.time}
        />
      )}

      {/* Prayer List */}
      <Card className="border-border/50 bg-card/40 backdrop-blur-sm shadow-sm">
        <CardContent className="p-0">
          <div className="p-4 border-b border-border/50 bg-muted/30 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{dateString}</p>
              <div className="flex items-center gap-1.5 text-sm text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                <span className="font-medium">{location}</span>
              </div>
            </div>
            {/* Hijri Date */}
            <HijriDateDisplay hijriDate={hijriToday} showMoonPhase={true} showEvents={true} />
          </div>
          <div className="divide-y divide-border/50 p-2">
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
