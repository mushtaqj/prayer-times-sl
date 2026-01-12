import { Card, CardContent } from '@/components/ui/card'
import { Moon, Info } from 'lucide-react'
import { EVENT_STYLES } from './calendarConstants'
import type { IslamicEvent } from '@/lib/data/types'

interface RecurringFastsMonthly {
  ayyamAlBeed: {
    name: string
    nameArabic: string
    days: number[]
    type: string
    description: string
    details?: string
  }
}

interface MonthEventsCardProps {
  monthName: string
  monthEvents: IslamicEvent[]
  recurringFastsMonthly: RecurringFastsMonthly
  onOpenVirtueSheet: (title: string, content: string) => void
}

export function MonthEventsCard({
  monthName,
  monthEvents,
  recurringFastsMonthly,
  onOpenVirtueSheet
}: MonthEventsCardProps) {
  return (
    <Card className="border-border/50 bg-card/40 backdrop-blur-sm shadow-sm">
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
          <span>Events in {monthName}</span>
        </h3>
        <div className="space-y-2">
          {/* Fixed Events */}
          {monthEvents.map((event) => {
            const style = EVENT_STYLES[event.type as keyof typeof EVENT_STYLES] || EVENT_STYLES.holy
            return (
              <div
                key={event.id}
                className={`flex items-start gap-3 p-2 rounded-lg ${style.bg === 'bg-transparent' ? 'bg-muted/30' : style.bg} border ${style.border}`}
              >
                <div className="text-center min-w-[40px] flex flex-col items-center justify-center pt-1">
                  <style.icon className={`w-5 h-5 ${style.text}`} />
                  <span className={`text-sm font-bold mt-1 ${style.text}`}>
                    {event.hijriDay === 0 ? (event.name.includes('Days') ? '1-9' : 'All') : event.hijriDay}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm text-foreground flex items-center gap-2">
                    {event.name}
                    {event.details && (
                      <button
                        onClick={() => onOpenVirtueSheet(event.name, event.details!)}
                        className="inline-flex items-center justify-center text-primary/80 hover:text-primary transition-colors ml-1"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">{event.nameArabic}</p>
                  <p className="text-xs text-muted-foreground/80 mt-0.5">{event.description}</p>
                  {event.isFastingDay && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 mt-1">
                      <Moon className="w-3 h-3 fill-current" />
                      {event.fastingType === 'obligatory' ? 'Obligatory Fast' : 'Recommended Fast'}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${style.bg === 'bg-transparent' ? '' : style.bg} ${style.text} border border-current/10`}
                >
                  {style.label}
                </span>
              </div>
            )
          })}

          {/* Ayyam al-Beed (always shown) */}
          <div className={`flex items-start gap-3 p-2 rounded-lg ${EVENT_STYLES.ayyamAlBeed.bg} border ${EVENT_STYLES.ayyamAlBeed.border}`}>
            <div className="text-center min-w-[40px] flex flex-col items-center justify-center pt-1">
              <Moon className={`w-5 h-5 ${EVENT_STYLES.ayyamAlBeed.text}`} />
              <span className={`text-sm font-bold mt-1 ${EVENT_STYLES.ayyamAlBeed.text}`}>13-15</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm text-foreground flex items-center gap-2">
                Ayyam al-Beed (White Days)
                {recurringFastsMonthly.ayyamAlBeed.details && (
                  <button
                    onClick={() => onOpenVirtueSheet('Ayyam al-Beed', recurringFastsMonthly.ayyamAlBeed.details!)}
                    className="inline-flex items-center justify-center text-primary/80 hover:text-primary transition-colors"
                    title="Learn about White Days"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                )}
              </p>
              <p className="text-xs text-muted-foreground">ايام البيض</p>
              <p className="text-xs text-muted-foreground/80 mt-0.5">Sunnah fasting on the 13th, 14th, and 15th of every Hijri month</p>
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${EVENT_STYLES.ayyamAlBeed.bg} ${EVENT_STYLES.ayyamAlBeed.text} border border-current/10`}>
              Sunnah
            </span>
          </div>

          {monthEvents.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-2">
              No major events this month
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
