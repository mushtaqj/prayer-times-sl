import { useMemo, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react'
import { VirtuesSheet } from '@/components/VirtuesSheet'
import { useHijriCalendar } from '@/hooks/useHijriCalendar'
import { useIslamicEvents } from '@/hooks/useIslamicEvents'
import { TooltipProvider } from '@/components/ui/tooltip'
import { generateDayContent } from '@/lib/utils/dayContent'
import {
  CalendarHeader,
  CalendarLegend,
  MonthEventsCard,
  CalendarDay,
  EmptyCalendarCell,
  UncertainDay30Cell,
  getMonthTheme,
  WEEKDAY_LABELS,
} from '@/components/calendar'

interface HijriCalendarViewProps {
  location: string
}

export function HijriCalendarView({ location }: HijriCalendarViewProps) {
  const [showLegend, setShowLegend] = useState(false)
  const [virtueSheet, setVirtueSheet] = useState<{
    title: string
    content: string
  } | null>(null)

  const {
    currentMonthData,
    currentHijriYear,
    currentHijriMonth,
    calendarDays,
    hijriMonths,
    previousMonth,
    nextMonth,
    goToToday,
    goToMonth,
    canGoPrevious,
    canGoNext,
    todayHijri,
    availableYears,
  } = useHijriCalendar()

  const {
    getEventsForMonth,
    getAllEventsForDay,
    isFastingDay,
    getMonthName,
    recurringFasts,
  } = useIslamicEvents()

  const monthEvents = useMemo(() => {
    return getEventsForMonth(currentHijriMonth)
  }, [currentHijriMonth, getEventsForMonth])

  const monthInfo = useMemo(() => {
    return getMonthName(currentHijriMonth)
  }, [currentHijriMonth, getMonthName])

  const startDayOfWeek = useMemo(() => {
    if (!calendarDays.length) return 0
    return calendarDays[0].gregorianDate.getDay()
  }, [calendarDays])

  const calendarGrid = useMemo(() => {
    const grid: (typeof calendarDays[0] | null)[] = []
    for (let i = 0; i < startDayOfWeek; i++) {
      grid.push(null)
    }
    grid.push(...calendarDays)
    return grid
  }, [calendarDays, startDayOfWeek])

  const isCurrentMonth = useMemo(() => {
    if (!todayHijri) return false
    return (
      currentHijriYear === todayHijri.year &&
      currentHijriMonth === todayHijri.month
    )
  }, [currentHijriYear, currentHijriMonth, todayHijri])

  const showDay30Uncertain = useMemo(() => {
    return isCurrentMonth && currentMonthData?.days === 29
  }, [isCurrentMonth, currentMonthData])

  const monthTheme = getMonthTheme(currentHijriMonth)

  const handleDayClick = useCallback(
    (day: typeof calendarDays[0], isFriday: boolean) => {
      const dayEvents = getAllEventsForDay(
        currentHijriMonth,
        day.hijriDay,
        day.gregorianDate
      )
      const fastingInfo = isFastingDay({
        day: day.hijriDay,
        month: currentHijriMonth,
        monthName: currentMonthData!.monthName,
        year: currentHijriYear,
        gregorianDate: day.gregorianDate,
      })

      const content = generateDayContent({
        monthName: currentMonthData!.monthName,
        hijriDay: day.hijriDay,
        gregorianDate: day.gregorianDate,
        dayEvents,
        fastingInfo,
        isFriday,
        recurringFasts,
      })

      setVirtueSheet({
        title: `${currentMonthData!.monthName} ${day.hijriDay}`,
        content,
      })
    },
    [
      currentHijriMonth,
      currentHijriYear,
      currentMonthData,
      getAllEventsForDay,
      isFastingDay,
      recurringFasts,
    ]
  )

  const gregorianRange = useMemo(() => {
    if (!currentMonthData) return ''
    const gregorianStart = new Date(currentMonthData.gregorianStart)
    const gregorianEnd = new Date(gregorianStart)
    gregorianEnd.setDate(gregorianEnd.getDate() + currentMonthData.days - 1)

    const startMonth = gregorianStart.toLocaleDateString('en-US', {
      month: 'short',
    })
    const endMonth = gregorianEnd.toLocaleDateString('en-US', { month: 'short' })
    const startYear = gregorianStart.getFullYear()
    const endYear = gregorianEnd.getFullYear()

    if (startMonth === endMonth && startYear === endYear) {
      return `${startMonth} ${gregorianStart.getDate()}-${gregorianEnd.getDate()}, ${endYear}`
    } else if (startYear === endYear) {
      return `${startMonth} ${gregorianStart.getDate()} → ${endMonth} ${gregorianEnd.getDate()}, ${endYear}`
    } else {
      return `${startMonth} ${gregorianStart.getDate()}, ${startYear} → ${endMonth} ${gregorianEnd.getDate()}, ${endYear}`
    }
  }, [currentMonthData])

  const showTodayButton = useMemo(() => {
    return Boolean(
      todayHijri &&
        (currentHijriYear !== todayHijri.year ||
          currentHijriMonth !== todayHijri.month)
    )
  }, [todayHijri, currentHijriYear, currentHijriMonth])

  if (!currentMonthData) {
    return (
      <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
        <CardContent className="p-6 text-center text-muted-foreground">
          Calendar data not available for this period.
        </CardContent>
      </Card>
    )
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-4">
        {/* Calendar Header Card */}
        <Card
          className={`${monthTheme.headerBorderColor} ${monthTheme.headerBgColor} backdrop-blur-sm shadow-sm overflow-hidden border`}
        >
          <CardContent className="p-0">
            <CalendarHeader
              monthName={currentMonthData.monthName}
              hijriYear={currentHijriYear}
              hijriMonth={currentHijriMonth}
              gregorianRange={gregorianRange}
              monthInfo={monthInfo}
              isCurrentMonth={isCurrentMonth}
              canGoPrevious={canGoPrevious}
              canGoNext={canGoNext}
              showTodayButton={showTodayButton}
              availableYears={availableYears || []}
              hijriMonths={hijriMonths}
              onPreviousMonth={previousMonth}
              onNextMonth={nextMonth}
              onGoToToday={goToToday}
              onGoToMonth={goToMonth}
              onOpenMonthDetails={(title, content) =>
                setVirtueSheet({ title, content })
              }
            />

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 bg-muted/50">
              {WEEKDAY_LABELS.map((day, idx) => (
                <div
                  key={day}
                  className={`py-3 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border ${idx < 6 ? 'border-r border-border/50' : ''} ${day === 'Fri' ? 'text-primary bg-primary/10' : ''}`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
              {calendarGrid.map((day, index) => {
                const colIndex = index % 7
                const isLastCol = colIndex === 6
                const isFriday = colIndex === 5

                if (!day) {
                  return (
                    <EmptyCalendarCell
                      key={`empty-${index}`}
                      isLastCol={isLastCol}
                      isFriday={isFriday}
                    />
                  )
                }

                const dayEvents = getAllEventsForDay(
                  currentHijriMonth,
                  day.hijriDay,
                  day.gregorianDate
                )
                const fastingInfo = isFastingDay({
                  day: day.hijriDay,
                  month: currentHijriMonth,
                  monthName: currentMonthData.monthName,
                  year: currentHijriYear,
                  gregorianDate: day.gregorianDate,
                })

                const hasSpecialFasting =
                  fastingInfo.isFasting && fastingInfo.reason !== 'Ramadan'
                const isClickable =
                  dayEvents.length > 0 ||
                  hasSpecialFasting ||
                  fastingInfo.type === 'forbidden' ||
                  isFriday

                return (
                  <CalendarDay
                    key={day.hijriDay}
                    day={day}
                    dayEvents={dayEvents}
                    fastingInfo={fastingInfo}
                    currentHijriMonth={currentHijriMonth}
                    isLastCol={isLastCol}
                    isFriday={isFriday}
                    onDayClick={
                      isClickable
                        ? () => handleDayClick(day, isFriday)
                        : undefined
                    }
                  />
                )
              })}

              {/* Day 30 Uncertain Cell */}
              {showDay30Uncertain && <UncertainDay30Cell />}
            </div>
          </CardContent>
        </Card>

        {/* Month Events */}
        <MonthEventsCard
          monthName={currentMonthData.monthName}
          monthEvents={monthEvents}
          recurringFastsMonthly={recurringFasts.monthly}
          onOpenVirtueSheet={(title, content) =>
            setVirtueSheet({ title, content })
          }
        />

        {/* Legend Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowLegend(!showLegend)}
          className="w-full flex items-center justify-center gap-2 text-muted-foreground"
        >
          <HelpCircle className="h-4 w-4" />
          <span>Legend</span>
          {showLegend ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>

        {/* Legend Content */}
        {showLegend && <CalendarLegend />}

        {/* Data Attribution */}
        <p className="text-center text-xs text-muted-foreground/60">
          Hijri calendar for {location} based on ACJU moon sighting data
        </p>

        <VirtuesSheet
          isOpen={!!virtueSheet}
          onClose={() => setVirtueSheet(null)}
          title={virtueSheet?.title || ''}
          content={virtueSheet?.content || ''}
        />
      </div>
    </TooltipProvider>
  )
}
