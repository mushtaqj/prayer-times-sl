import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

import { cn } from '@/lib/tailwind'
import type { DailyPrayerTimes } from '@/lib/data/types'
import { gregorianToHijri, getMoonPhase } from '@/lib/data/hijriCalendar'
import { prayerNames } from '@/lib/data/prayerTimes'

interface WeekViewProps {
  prayers: (DailyPrayerTimes & { date: Date })[]
  location: string
}

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
    <Card className="border-border/50 bg-card/40 backdrop-blur-sm shadow-sm transition-all hover:bg-card/50">
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/30">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{todayDateString}</p>
          <div className="flex items-center gap-1.5 text-sm text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            <span className="font-medium">{location}</span>
          </div>
        </div>
        <div className="p-4 space-y-6">
          {prayers.map((prayer, index) => {
            const date = new Date(prayer.date)
            date.setHours(0, 0, 0, 0)
            const isToday = date.getTime() === today.getTime()
            const dayName = prayer.date.toLocaleDateString('en-US', { weekday: 'long' })
            const dateStr = prayer.date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })
            const hijriDate = gregorianToHijri(prayer.date)
            const moonPhase = hijriDate ? getMoonPhase(hijriDate.day) : null

            return (
              <div key={index} className={cn("rounded-xl transition-all", isToday && "bg-primary/5 -mx-2 px-2 py-2 border border-primary/10")}>
                {/* Day Header */}
                <div className={cn(
                  "flex items-center gap-3 mb-3",
                  isToday ? "text-primary" : "text-muted-foreground"
                )}>
                  <Separator className={cn("flex-1", isToday ? "bg-primary/20" : "bg-border")} />
                  <div className="flex flex-col items-center gap-0.5 px-2">
                    <div className="flex items-center gap-2">
                      <span className={cn("font-bold text-lg font-heading", isToday && "text-primary")}>{dayName}</span>
                      <span className="text-xs uppercase tracking-wider opacity-70 mt-1">{dateStr}</span>
                      {isToday && (
                        <Badge variant="default" className="text-[10px] h-5 ml-1 bg-primary shadow-sm hover:bg-primary">Today</Badge>
                      )}
                    </div>
                    {hijriDate && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        {moonPhase && <span className="text-sm">{moonPhase.icon}</span>}
                        <span>{hijriDate.day} {hijriDate.monthName} {hijriDate.year}</span>
                      </div>
                    )}
                  </div>
                  <Separator className={cn("flex-1", isToday ? "bg-primary/20" : "bg-border")} />
                </div>

                {/* Prayer Times */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {prayerNames.map((key) => (
                    <div key={key} className="flex flex-col items-center p-2 rounded-lg bg-background/50 border border-border/50 shadow-sm hover:border-primary/30 transition-colors">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{key}</span>
                      <span className="font-medium font-heading text-lg">{prayer[key]}</span>
                    </div>
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
