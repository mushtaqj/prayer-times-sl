import { Card, CardContent, CardHeader, CardTitle } from '@/components/retroui/Card'
import { Badge } from '@/components/retroui/Badge'
import type { PrayerTime } from '@/hooks/usePrayerTimes'

interface WeekViewProps {
  prayers: (PrayerTime & { date: Date })[]
}

export function WeekView({ prayers }: WeekViewProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>This Week</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto -mx-4 md:-mx-6 px-4 md:px-6">
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
                  className={`flex-shrink-0 w-28 p-3 rounded-xl border-2 border-[var(--foreground)] transition-all ${
                    isToday
                      ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[4px_4px_0px_0px_var(--foreground)]'
                      : 'bg-[var(--card)]'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-center">
                      <div className="font-bold">{dayName}</div>
                      <div className="text-xs">{month} {dayNum}</div>
                    </div>
                    {isToday && (
                      <Badge variant="secondary" className="text-xs">Today</Badge>
                    )}
                    <div className="w-full space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Fajr</span>
                        <span className="font-semibold">{prayer.fajr.split(' ')[0]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Dhuhr</span>
                        <span className="font-semibold">{prayer.dhuhr.split(' ')[0]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Asr</span>
                        <span className="font-semibold">{prayer.asr.split(' ')[0]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Maghrib</span>
                        <span className="font-semibold">{prayer.maghrib.split(' ')[0]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Isha</span>
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
