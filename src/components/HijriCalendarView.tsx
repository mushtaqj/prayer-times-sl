import { useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ChevronLeft, ChevronRight, Calendar,
  ChevronDown, ChevronUp, HelpCircle,
  BookOpen
} from 'lucide-react'
import { VirtuesSheet } from '@/components/VirtuesSheet'
import { useHijriCalendar } from '@/hooks/useHijriCalendar'
import { useIslamicEvents } from '@/hooks/useIslamicEvents'
import { RECURRING_FAST_IDS } from '@/lib/data/islamicEvents'
import { RAMADAN_NAME } from '@/lib/utils/hijriConstants'
import {
  TooltipProvider,
} from '@/components/ui/tooltip'
import {
  CalendarLegend,
  MonthEventsCard,
  CalendarDay,
  EmptyCalendarCell,
  UncertainDay30Cell,
  JumpToDateDialog,
  getMonthTheme,
  SpecialMonthBanner,
  WEEKDAY_LABELS,
} from '@/components/calendar'

interface HijriCalendarViewProps {
  location: string
}

export function HijriCalendarView({ location }: HijriCalendarViewProps) {
  const [showLegend, setShowLegend] = useState(false)
  const [virtueSheet, setVirtueSheet] = useState<{ title: string; content: string } | null>(null)

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

  const { getEventsForMonth, getAllEventsForDay, isFastingDay, getMonthName, recurringFasts } = useIslamicEvents()

  const monthEvents = useMemo(() => {
    return getEventsForMonth(currentHijriMonth)
  }, [currentHijriMonth, getEventsForMonth])

  const monthInfo = useMemo(() => {
    return getMonthName(currentHijriMonth)
  }, [currentHijriMonth, getMonthName])

  // Calculate which day of week the month starts on (Sunday = 0)
  const startDayOfWeek = useMemo(() => {
    if (!calendarDays.length) return 0
    return calendarDays[0].gregorianDate.getDay()
  }, [calendarDays])

  // Create the calendar grid with empty cells for padding
  const calendarGrid = useMemo(() => {
    const grid: (typeof calendarDays[0] | null)[] = []
    for (let i = 0; i < startDayOfWeek; i++) {
      grid.push(null)
    }
    grid.push(...calendarDays)
    return grid
  }, [calendarDays, startDayOfWeek])

  // Check if viewing current month (for uncertainty indicator on day 30)
  const isCurrentMonth = useMemo(() => {
    if (!todayHijri) return false
    return currentHijriYear === todayHijri.year && currentHijriMonth === todayHijri.month
  }, [currentHijriYear, currentHijriMonth, todayHijri])

  // Check if day 30 is uncertain (current month with only 29 days so far)
  const showDay30Uncertain = useMemo(() => {
    return isCurrentMonth && currentMonthData?.days === 29
  }, [isCurrentMonth, currentMonthData])

  // Get month theme (Ramadan/Sacred month styling)
  const monthTheme = getMonthTheme(currentHijriMonth)

  // Handle day click - opens virtue sheet with day details
  const handleDayClick = (day: typeof calendarDays[0], isFriday: boolean) => {
    const dayEvents = getAllEventsForDay(currentHijriMonth, day.hijriDay, day.gregorianDate)
    const fastingInfo = isFastingDay({
      day: day.hijriDay,
      month: currentHijriMonth,
      monthName: currentMonthData!.monthName,
      year: currentHijriYear,
      gregorianDate: day.gregorianDate,
    })

    // Build day-specific content
    const dayName = day.gregorianDate.toLocaleDateString('en-US', { weekday: 'long' })
    let content = `# ${dayName}, ${currentMonthData!.monthName} ${day.hijriDay}\n\n`

    // Add events WITH their full details
    if (dayEvents.length > 0) {
      dayEvents.forEach(e => {
        if (e.details) {
          content += e.details + `\n\n`
        } else {
          content += `## ${e.name}\n`
          content += `*${e.type}*\n\n`
        }
      })
    }

    // Add Friday info
    if (isFriday) {
      const fridayVirtues = recurringFasts.friday?.details
      if (fridayVirtues) {
        content += fridayVirtues + `\n\n`
      } else {
        content += `## Friday Blessings\n`
        content += `- **Surah Kahf**: Recite for light until next Friday\n`
        content += `- **Salawat**: Send abundant blessings upon the Prophet ﷺ\n`
        content += `- **Best Dua Time**: Between Asr and Maghrib\n`
        content += `- **Jumu'ah Prayer**: Obligatory for men\n\n`
      }
    }

    // Add fasting info with details
    if (fastingInfo.isFasting && fastingInfo.reason !== RAMADAN_NAME) {
      if (fastingInfo.reason === 'Monday Fast') {
        const mondayDetails = recurringFasts.weekly.find(f => f.id === RECURRING_FAST_IDS.MONDAY)?.details
        if (mondayDetails) {
          content += mondayDetails + `\n\n`
        }
      } else if (fastingInfo.reason === 'Thursday Fast') {
        const thursdayDetails = recurringFasts.weekly.find(f => f.id === RECURRING_FAST_IDS.THURSDAY)?.details
        if (thursdayDetails) {
          content += thursdayDetails + `\n\n`
        }
      } else if (fastingInfo.reason === 'Ayyam al-Beed (White Days)') {
        const ayyamDetails = recurringFasts.monthly.ayyamAlBeed.details
        if (ayyamDetails) {
          content += ayyamDetails + `\n\n`
        }
      } else {
        content += `## Fasting\n`
        content += `- **${fastingInfo.reason}** (${fastingInfo.type})\n\n`
      }
    } else if (fastingInfo.type === 'forbidden') {
      content += `## Fasting Forbidden\n`
      content += `- **${fastingInfo.reason}**: Fasting is prohibited on this day\n\n`
    }

    setVirtueSheet({ title: `${currentMonthData!.monthName} ${day.hijriDay}`, content })
  }

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

  // Format Gregorian range
  const startMonth = gregorianStart.toLocaleDateString('en-US', { month: 'short' })
  const endMonth = gregorianEnd.toLocaleDateString('en-US', { month: 'short' })
  const startYear = gregorianStart.getFullYear()
  const endYear = gregorianEnd.getFullYear()

  let gregorianRange: string
  if (startMonth === endMonth && startYear === endYear) {
    gregorianRange = `${startMonth} ${gregorianStart.getDate()}-${gregorianEnd.getDate()}, ${endYear}`
  } else if (startYear === endYear) {
    gregorianRange = `${startMonth} ${gregorianStart.getDate()} → ${endMonth} ${gregorianEnd.getDate()}, ${endYear}`
  } else {
    gregorianRange = `${startMonth} ${gregorianStart.getDate()}, ${startYear} → ${endMonth} ${gregorianEnd.getDate()}, ${endYear}`
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-4">
        {/* Calendar Header Card */}
        <Card className={`${monthTheme.headerBorderColor} ${monthTheme.headerBgColor} backdrop-blur-sm shadow-sm overflow-hidden border`}>
          <CardContent className="p-0">
            {/* Special Month Banner */}
            <SpecialMonthBanner hijriMonth={currentHijriMonth} />

            {/* Month Navigation */}
            <div className={`flex items-center justify-between p-4 border-b border-border/50 relative ${isCurrentMonth ? 'bg-primary/5' : 'bg-transparent'}`}>
              {/* Current Month Ribbon */}
              {isCurrentMonth && (
                <div className="absolute top-0 right-0 overflow-hidden w-24 h-24 pointer-events-none">
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[9px] font-bold px-8 py-1 transform rotate-45 translate-x-8 translate-y-3 shadow-sm uppercase tracking-wider">
                    Current
                  </div>
                </div>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={previousMonth}
                disabled={!canGoPrevious}
                className="h-9 w-9"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <div className="text-center flex-1 flex flex-col items-center">
                <h2 className={`text-xl font-bold ${isCurrentMonth ? 'text-primary' : 'text-foreground'} flex items-center justify-center gap-2`}>
                  {currentMonthData.monthName} {currentHijriYear}
                  {monthInfo?.details && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full hover:bg-primary/10 text-primary/90 ml-2"
                      onClick={() => setVirtueSheet({ title: currentMonthData.monthName, content: monthInfo.details! })}
                      title="Learn about this month"
                    >
                      <BookOpen className="h-4 w-4" />
                    </Button>
                  )}
                </h2>
                <p className="text-sm text-muted-foreground">{gregorianRange}</p>
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
                className="h-9 w-9"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            {/* Quick Actions Bar */}
            <div className="px-4 py-2 border-b border-border/50 bg-muted/30 flex gap-2">
              {todayHijri && (currentHijriYear !== todayHijri.year || currentHijriMonth !== todayHijri.month) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToToday}
                  className="text-xs flex-1"
                >
                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                  Today
                </Button>
              )}
              <JumpToDateDialog
                availableYears={availableYears || []}
                hijriMonths={hijriMonths}
                onJump={goToMonth}
              />
            </div>

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

                const dayEvents = getAllEventsForDay(currentHijriMonth, day.hijriDay, day.gregorianDate)
                const fastingInfo = isFastingDay({
                  day: day.hijriDay,
                  month: currentHijriMonth,
                  monthName: currentMonthData.monthName,
                  year: currentHijriYear,
                  gregorianDate: day.gregorianDate,
                })

                // Determine if clickable
                const hasSpecialFasting = fastingInfo.isFasting && fastingInfo.reason !== 'Ramadan'
                const isClickable = dayEvents.length > 0 || hasSpecialFasting || fastingInfo.type === 'forbidden' || isFriday

                return (
                  <CalendarDay
                    key={day.hijriDay}
                    day={day}
                    dayEvents={dayEvents}
                    fastingInfo={fastingInfo}
                    currentHijriMonth={currentHijriMonth}
                    isLastCol={isLastCol}
                    isFriday={isFriday}
                    onDayClick={isClickable ? () => handleDayClick(day, isFriday) : undefined}
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
          onOpenVirtueSheet={(title, content) => setVirtueSheet({ title, content })}
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
          {showLegend ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
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
