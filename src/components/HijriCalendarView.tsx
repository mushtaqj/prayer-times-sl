import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { useHijriCalendar, getMoonPhase } from '@/hooks/useHijriCalendar'
import { useIslamicEvents } from '@/hooks/useIslamicEvents'

const WEEKDAYS = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']

interface HijriCalendarViewProps {
  location: string
}

export function HijriCalendarView({ location }: HijriCalendarViewProps) {
  const {
    currentMonthData,
    currentHijriYear,
    currentHijriMonth,
    calendarDays,
    previousMonth,
    nextMonth,
    goToToday,
    canGoPrevious,
    canGoNext,
    todayHijri,
  } = useHijriCalendar()

  const { getEventsForMonth, hasEvent, isFastingDay, getMonthName } = useIslamicEvents()

  const monthEvents = useMemo(() => {
    return getEventsForMonth(currentHijriMonth)
  }, [currentHijriMonth, getEventsForMonth])

  const monthInfo = useMemo(() => {
    return getMonthName(currentHijriMonth)
  }, [currentHijriMonth, getMonthName])

  // Calculate which day of week the month starts on
  const startDayOfWeek = useMemo(() => {
    if (!calendarDays.length) return 0
    // Get the day of week (0 = Sunday, 6 = Saturday)
    // We want to start from Saturday, so we adjust
    const dayOfWeek = calendarDays[0].gregorianDate.getDay()
    // Convert to our week format (Saturday = 0)
    return (dayOfWeek + 1) % 7
  }, [calendarDays])

  // Create the calendar grid with empty cells for padding
  const calendarGrid = useMemo(() => {
    const grid: (typeof calendarDays[0] | null)[] = []

    // Add empty cells for days before the month starts
    for (let i = 0; i < startDayOfWeek; i++) {
      grid.push(null)
    }

    // Add all the days
    grid.push(...calendarDays)

    return grid
  }, [calendarDays, startDayOfWeek])

  if (!currentMonthData) {
    return (
      <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
        <CardContent className="p-6 text-center text-muted-foreground">
          Calendar data not available for this period.
        </CardContent>
      </Card>
    )
  }

  const gregorianStart = new Date(currentMonthData.gregorianStart)
  const gregorianEnd = new Date(gregorianStart)
  gregorianEnd.setDate(gregorianEnd.getDate() + currentMonthData.days - 1)

  const gregorianRange = `${gregorianStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${gregorianEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`

  return (
    <div className="space-y-4">
      {/* Calendar Header Card */}
      <Card className="border-border/50 bg-card/40 backdrop-blur-sm shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {/* Month Navigation */}
          <div className="flex items-center justify-between p-4 bg-primary/5 border-b border-border/50">
            <Button
              variant="ghost"
              size="icon"
              onClick={previousMonth}
              disabled={!canGoPrevious}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="text-center">
              <h2 className="text-lg font-bold text-foreground">
                {currentMonthData.monthName} {currentHijriYear}
              </h2>
              <p className="text-xs text-muted-foreground">{gregorianRange}</p>
              {monthInfo && (
                <p className="text-xs text-muted-foreground/70 mt-0.5">
                  "{monthInfo.meaning}"
                </p>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={nextMonth}
              disabled={!canGoNext}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Go to Today button */}
          {todayHijri && (currentHijriYear !== todayHijri.year || currentHijriMonth !== todayHijri.month) && (
            <div className="px-4 py-2 border-b border-border/50 bg-muted/30">
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
                className="w-full text-xs"
              >
                <Calendar className="h-3 w-3 mr-1.5" />
                Go to Today
              </Button>
            </div>
          )}

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b border-border/50 bg-muted/50">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className={`py-2 text-center text-xs font-medium uppercase tracking-wide ${
                  day === 'Fri' ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-border/30">
            {calendarGrid.map((day, index) => {
              if (!day) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="aspect-square bg-card/30"
                  />
                )
              }

              const moonPhase = getMoonPhase(day.hijriDay)
              const dayHasEvent = hasEvent(currentHijriMonth, day.hijriDay)
              const fastingInfo = isFastingDay({
                day: day.hijriDay,
                month: currentHijriMonth,
                monthName: currentMonthData.monthName,
                year: currentHijriYear,
                gregorianDate: day.gregorianDate,
              })
              const isFriday = day.gregorianDate.getDay() === 5

              return (
                <div
                  key={day.hijriDay}
                  className={`aspect-square p-1 flex flex-col items-center justify-center relative transition-colors ${
                    day.isToday
                      ? 'bg-primary/20 ring-2 ring-primary ring-inset'
                      : 'bg-card/50 hover:bg-card/80'
                  }`}
                >
                  {/* Hijri Day Number */}
                  <span
                    className={`text-sm font-semibold ${
                      day.isToday
                        ? 'text-primary'
                        : isFriday
                        ? 'text-primary/80'
                        : 'text-foreground'
                    }`}
                  >
                    {day.hijriDay}
                  </span>

                  {/* Gregorian Day */}
                  <span className="text-[10px] text-muted-foreground">
                    {day.gregorianDate.getDate()}
                  </span>

                  {/* Moon Phase (show on key days) */}
                  {(day.hijriDay === 1 || day.hijriDay === 15 || day.hijriDay === 29) && (
                    <span className="text-[10px] absolute top-0.5 right-0.5">
                      {moonPhase.icon}
                    </span>
                  )}

                  {/* Event Indicator */}
                  {dayHasEvent && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-green-500" />
                  )}

                  {/* Fasting Indicator */}
                  {fastingInfo.isFasting && fastingInfo.type === 'obligatory' && (
                    <span className="absolute top-0.5 left-0.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Events for this month */}
      {monthEvents.length > 0 && (
        <Card className="border-border/50 bg-card/40 backdrop-blur-sm shadow-sm">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-3 text-foreground">
              Events in {currentMonthData.monthName}
            </h3>
            <div className="space-y-2">
              {monthEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-2 rounded-lg bg-muted/30"
                >
                  <div className="text-center min-w-[40px]">
                    <span className="text-lg font-bold text-primary">{event.hijriDay}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-foreground">{event.name}</p>
                    <p className="text-xs text-muted-foreground">{event.nameArabic}</p>
                    <p className="text-xs text-muted-foreground/80 mt-0.5">{event.description}</p>
                    {event.isFastingDay && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 mt-1">
                        <span className="w-1 h-1 rounded-full bg-amber-500"></span>
                        {event.fastingType === 'obligatory' ? 'Obligatory Fast' : 'Recommended Fast'}
                      </span>
                    )}
                    {event.fastingForbidden && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-red-600 dark:text-red-400 mt-1">
                        <span className="w-1 h-1 rounded-full bg-red-500"></span>
                        Fasting Forbidden
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      event.type === 'eid'
                        ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                        : 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                    }`}
                  >
                    {event.type === 'eid' ? 'Eid' : 'Holy'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Card className="border-border/50 bg-card/40 backdrop-blur-sm shadow-sm">
        <CardContent className="p-3">
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground justify-center">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span>Today</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span>Event</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Fasting</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>🌑</span>
              <span>New Moon</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>🌕</span>
              <span>Full Moon</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Attribution */}
      <p className="text-center text-xs text-muted-foreground/60">
        Hijri calendar for {location} based on ACJU moon sighting data
      </p>
    </div>
  )
}
