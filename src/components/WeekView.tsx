import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { PrayerTime } from '@/hooks/usePrayerTimes'

interface WeekViewProps {
  prayers: (PrayerTime & { date: Date })[]
}

export function WeekView({ prayers }: WeekViewProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>This Week</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto -mx-6 px-6">
          <div className="flex gap-3 min-w-max pb-2">
            {prayers.map((prayer, index) => {
              const date = new Date(prayer.date)
              date.setHours(0, 0, 0, 0)
              const isToday = date.getTime() === today.getTime()
              const dayName = prayer.date.toLocaleDateString('en-US', { weekday: 'short' })
              const dayNum = prayer.date.getDate()
              const month = prayer.date.toLocaleDateString('en-US', { month: 'short' })

              return (
                <div
                  key={index}
                  className={cn(
                    "flex-shrink-0 w-28 p-3 rounded-lg border transition-all",
                    isToday
                      ? "bg-primary text-primary-foreground border-primary shadow-lg"
                      : "bg-card border-border hover:bg-accent"
                  )}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-center">
                      <div className="font-bold">{dayName}</div>
                      <div className="text-xs opacity-80">{month} {dayNum}</div>
                    </div>
                    {isToday && (
                      <Badge variant="secondary" className="text-xs">Today</Badge>
                    )}
                    <div className="w-full space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="opacity-70">Fajr</span>
                        <span className="font-semibold">{prayer.fajr.split(' ')[0]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-70">Dhuhr</span>
                        <span className="font-semibold">{prayer.dhuhr.split(' ')[0]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-70">Asr</span>
                        <span className="font-semibold">{prayer.asr.split(' ')[0]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-70">Maghrib</span>
                        <span className="font-semibold">{prayer.maghrib.split(' ')[0]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-70">Isha</span>
                        <span className="font-semibold">{prayer.isha.split(' ')[0]}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
