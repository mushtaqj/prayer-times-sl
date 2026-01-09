import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PrayerRow } from '@/components/PrayerRow'
import { cn } from '@/lib/utils'
import type { PrayerTime } from '@/hooks/usePrayerTimes'

interface WeekViewProps {
  prayers: (PrayerTime & { date: Date })[]
  location: string
}

const prayerKeys = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as const

export function WeekView({ prayers, location }: WeekViewProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todayDateString = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">{todayDateString}</p>
          <p className="text-sm text-muted-foreground">{location}</p>
        </div>
        <div className="space-y-6">
          {prayers.map((prayer, index) => {
            const date = new Date(prayer.date)
            date.setHours(0, 0, 0, 0)
            const isToday = date.getTime() === today.getTime()
            const dayName = prayer.date.toLocaleDateString('en-US', { weekday: 'long' })
            const dateStr = prayer.date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })

            return (
              <div key={index}>
                {/* Day Header */}
                <div className={cn(
                  "flex items-center gap-3 mb-3",
                  isToday && "text-primary"
                )}>
                  <Separator className="flex-1" />
                  <div className="flex items-center gap-2 px-2">
                    <span className="font-semibold">{dayName}</span>
                    <span className="text-muted-foreground text-sm">{dateStr}</span>
                    {isToday && (
                      <Badge variant="default" className="text-xs">Today</Badge>
                    )}
                  </div>
                  <Separator className="flex-1" />
                </div>

                {/* Prayer Times */}
                <div className={cn(
                  "rounded-lg",
                  isToday && "bg-primary/5 p-2 -mx-2"
                )}>
                  {prayerKeys.map((key) => (
                    <PrayerRow
                      key={key}
                      name={key.charAt(0).toUpperCase() + key.slice(1)}
                      time={prayer[key]}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
