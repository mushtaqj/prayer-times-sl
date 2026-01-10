import { useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Calendar, CalendarDays, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { useHijriCalendar, getMoonPhase } from '@/hooks/useHijriCalendar'
import { useIslamicEvents } from '@/hooks/useIslamicEvents'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Event type styling configuration
const EVENT_STYLES = {
  eid: {
    bg: 'bg-green-500/15',
    indicator: 'bg-green-500',
    text: 'text-green-700 dark:text-green-400',
    emoji: '🎉',
    label: 'Eid',
  },
  holy: {
    bg: 'bg-purple-500/15',
    indicator: 'bg-purple-500',
    text: 'text-purple-700 dark:text-purple-400',
    emoji: '⭐',
    label: 'Holy',
  },
  fast: {
    bg: 'bg-amber-500/15',
    indicator: 'bg-amber-500',
    text: 'text-amber-700 dark:text-amber-400',
    emoji: '🌙',
    label: 'Fast',
  },
  sunnah: {
    bg: 'bg-sky-500/10',
    indicator: 'bg-sky-400',
    text: 'text-sky-700 dark:text-sky-400',
    emoji: '🤲',
    label: 'Sunnah',
  },
  recommended: {
    bg: 'bg-indigo-500/10',
    indicator: 'bg-indigo-400',
    text: 'text-indigo-700 dark:text-indigo-400',
    emoji: '💎',
    label: 'Recommended',
  },
} as const

const HIJRI_MONTH_NAMES = [
  'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
  'Jumada al-Awwal', 'Jumada al-Akhirah', 'Rajab', 'Shaban',
  'Ramadan', 'Shawwal', 'Dhul Qadah', 'Dhul Hijjah'
]

interface HijriCalendarViewProps {
  location: string
}

export function HijriCalendarView({ location }: HijriCalendarViewProps) {
  const [jumpDialogOpen, setJumpDialogOpen] = useState(false)
  const [jumpMode, setJumpMode] = useState<'hijri' | 'gregorian'>('hijri')
  const [selectedHijriMonth, setSelectedHijriMonth] = useState<string>('')
  const [selectedHijriYear, setSelectedHijriYear] = useState<string>('')
  const [showLegend, setShowLegend] = useState(false)

  const {
    currentMonthData,
    currentHijriYear,
    currentHijriMonth,
    calendarDays,
    previousMonth,
    nextMonth,
    goToToday,
    goToMonth,
    canGoPrevious,
    canGoNext,
    todayHijri,
    availableYears,
  } = useHijriCalendar()

  const { getEventsForMonth, getAllEventsForDay, isFastingDay, getMonthName } = useIslamicEvents()

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

  // Handle jump to date
  const handleJumpToDate = () => {
    if (jumpMode === 'hijri') {
      const year = parseInt(selectedHijriYear)
      const month = parseInt(selectedHijriMonth)
      if (year && month) {
        goToMonth(year, month)
        setJumpDialogOpen(false)
      }
    } else {
      // For Gregorian, we'd need to convert - for now just use Hijri
      const year = parseInt(selectedHijriYear)
      const month = parseInt(selectedHijriMonth)
      if (year && month) {
        goToMonth(year, month)
        setJumpDialogOpen(false)
      }
    }
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
  const gregorianRange = `${gregorianStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${gregorianEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`

  return (
    <TooltipProvider delayDuration={300}>
    <div className="space-y-4">
      {/* Calendar Header Card */}
      <Card className="border-border/50 bg-card/40 backdrop-blur-sm shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {/* Month Navigation */}
          <div className={`flex items-center justify-between p-4 border-b border-border/50 ${
            isCurrentMonth
              ? 'bg-primary/15 ring-2 ring-primary/30 ring-inset'
              : 'bg-primary/5'
          }`}>
            <Button
              variant="ghost"
              size="icon"
              onClick={previousMonth}
              disabled={!canGoPrevious}
              className="h-9 w-9"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <div className="text-center flex-1">
              {isCurrentMonth && (
                <span className="text-[10px] uppercase tracking-widest text-primary font-semibold">
                  Current Month
                </span>
              )}
              <h2 className={`text-xl font-bold ${isCurrentMonth ? 'text-primary' : 'text-foreground'}`}>
                {currentMonthData.monthName} {currentHijriYear}
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
            <Dialog open={jumpDialogOpen} onOpenChange={setJumpDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs flex-1">
                  <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
                  Jump to Date
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Jump to Date</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="flex gap-2">
                    <Button
                      variant={jumpMode === 'hijri' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setJumpMode('hijri')}
                      className="flex-1"
                    >
                      Hijri
                    </Button>
                    <Button
                      variant={jumpMode === 'gregorian' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setJumpMode('gregorian')}
                      className="flex-1"
                      disabled
                    >
                      Gregorian
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Month</label>
                      <Select value={selectedHijriMonth} onValueChange={setSelectedHijriMonth}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                        <SelectContent>
                          {HIJRI_MONTH_NAMES.map((name, idx) => (
                            <SelectItem key={idx + 1} value={String(idx + 1)}>
                              {name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Year</label>
                      <Select value={selectedHijriYear} onValueChange={setSelectedHijriYear}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableYears?.map((year) => (
                            <SelectItem key={year} value={String(year)}>
                              {year} AH
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={handleJumpToDate} className="w-full">
                    Go to Date
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 bg-muted">
            {WEEKDAYS.map((day, idx) => (
              <div
                key={day}
                className={`py-2.5 text-center text-xs font-semibold uppercase tracking-wide border-b border-border ${
                  idx < 6 ? 'border-r border-border' : ''
                } ${day === 'Fri' ? 'text-primary bg-primary/5' : 'text-muted-foreground'}`}
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

              if (!day) {
                return (
                  <div
                    key={`empty-${index}`}
                    className={`aspect-square bg-muted/30 border-b border-border ${!isLastCol ? 'border-r border-border' : ''}`}
                  />
                )
              }

              const moonPhase = getMoonPhase(day.hijriDay)
              const dayEvents = getAllEventsForDay(currentHijriMonth, day.hijriDay, day.gregorianDate)
              const fastingInfo = isFastingDay({
                day: day.hijriDay,
                month: currentHijriMonth,
                monthName: currentMonthData.monthName,
                year: currentHijriYear,
                gregorianDate: day.gregorianDate,
              })
              const isFriday = day.gregorianDate.getDay() === 5
              const isAyyamAlBeed = [13, 14, 15].includes(day.hijriDay)
              const showMoon = day.hijriDay === 1 || day.hijriDay === 15 || day.hijriDay === 29

              // Determine primary event type for styling (priority: eid > holy > fast > recommended > sunnah)
              // Note: Weekly sunnah fasts (Mon/Thu) only show fasting dot, not colored background
              const getPrimaryEventType = (): keyof typeof EVENT_STYLES | null => {
                if (dayEvents.some(e => e.type === 'eid')) return 'eid'
                if (dayEvents.some(e => e.type === 'holy')) return 'holy'
                if (fastingInfo.isFasting && fastingInfo.type === 'obligatory') return 'fast'
                if (dayEvents.some(e => e.type === 'recommended')) return 'recommended'
                // Only show sunnah background for Ayyam al-Beed and Six Days of Shawwal, not weekly Mon/Thu fasts
                const significantSunnahEvents = dayEvents.filter(e =>
                  e.type === 'sunnah' && !e.name.includes('Monday') && !e.name.includes('Thursday')
                )
                if (isAyyamAlBeed || significantSunnahEvents.length > 0) return 'sunnah'
                return null
              }
              const primaryEventType = getPrimaryEventType()
              const eventStyle = primaryEventType ? EVENT_STYLES[primaryEventType] : null

              // Determine cell background
              let cellBg = 'bg-background'
              let textColor = 'text-foreground'
              if (day.isToday) {
                cellBg = 'bg-primary/15'
                textColor = 'text-primary'
              } else if (eventStyle) {
                cellBg = eventStyle.bg
                textColor = eventStyle.text
              } else if (isFriday) {
                cellBg = 'bg-primary/5'
                textColor = 'text-primary'
              }

              // Build tooltip content
              const tooltipLines: string[] = []
              if (dayEvents.length > 0) {
                dayEvents.forEach(e => {
                  const style = EVENT_STYLES[e.type as keyof typeof EVENT_STYLES]
                  const emoji = style?.emoji || ''
                  tooltipLines.push(`${emoji} ${e.name}`)
                })
              }
              if (fastingInfo.isFasting && fastingInfo.reason && !tooltipLines.some(l => l.includes(fastingInfo.reason!))) {
                const fastEmoji = fastingInfo.type === 'obligatory' ? '🌙' : '🤲'
                tooltipLines.push(`${fastEmoji} Fasting: ${fastingInfo.reason}`)
              }
              const hasTooltip = tooltipLines.length > 0

              const cellContent = (
                <div
                  className={`aspect-square p-1 flex flex-col items-center justify-center relative transition-colors border-b border-border ${!isLastCol ? 'border-r border-border' : ''} ${cellBg} ${
                    day.isToday ? 'ring-2 ring-primary ring-inset' : ''
                  }`}
                >
                  {/* Moon Phase - Only on key days */}
                  {showMoon && !eventStyle && (
                    <span className="absolute top-0.5 right-0.5 text-base">
                      {moonPhase.icon}
                    </span>
                  )}

                  {/* Event emoji - Top left corner */}
                  {eventStyle && (
                    <span className="absolute top-0.5 left-0.5 text-sm">
                      {eventStyle.emoji}
                    </span>
                  )}

                  {/* Event indicator dot - Top right (when there's an emoji and moon) */}
                  {showMoon && eventStyle && (
                    <span className="absolute top-0.5 right-0.5 text-base">
                      {moonPhase.icon}
                    </span>
                  )}

                  {/* Hijri Day Number - PROMINENT */}
                  <span
                    className={`text-xl font-bold leading-none ${
                      day.isToday ? 'text-primary' : textColor
                    }`}
                  >
                    {day.hijriDay}
                  </span>

                  {/* Gregorian Day - Secondary */}
                  <span className="text-xs text-muted-foreground mt-1 leading-none">
                    {day.gregorianDate.getDate()}
                  </span>

                  {/* Fasting Indicator - Bottom center */}
                  {fastingInfo.isFasting && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
                      <span
                        className={`inline-block w-2.5 h-2.5 rounded-full shadow-sm ${
                          fastingInfo.type === 'obligatory'
                            ? 'bg-amber-500'
                            : 'bg-sky-400'
                        }`}
                      />
                    </div>
                  )}
                </div>
              )

              return hasTooltip ? (
                <Tooltip key={day.hijriDay}>
                  <TooltipTrigger asChild>
                    {cellContent}
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <div className="space-y-1">
                      {tooltipLines.map((line, i) => (
                        <p key={i} className="text-sm">{line}</p>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <div key={day.hijriDay}>{cellContent}</div>
              )
            })}

            {/* Day 30 Uncertain Cell - only for current month */}
            {showDay30Uncertain && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="aspect-square p-1 flex flex-col items-center justify-center relative transition-colors border-b border-border bg-amber-500/10 ring-2 ring-dashed ring-amber-500 ring-inset cursor-help">
                    <span className="absolute top-0.5 right-0.5 text-base">🌘</span>
                    <span className="text-lg font-bold leading-none text-amber-600 dark:text-amber-400">
                      30?
                    </span>
                    <span className="text-[10px] text-amber-600/70 dark:text-amber-400/70 mt-1 leading-none">
                      Pending
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">Moon sighting will determine if month has 30 days</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recurring Events This Month */}
      <Card className="border-border/50 bg-card/40 backdrop-blur-sm shadow-sm">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
            <span>Events in {currentMonthData.monthName}</span>
          </h3>
          <div className="space-y-2">
            {/* Fixed Events */}
            {monthEvents.map((event) => {
              const style = EVENT_STYLES[event.type as keyof typeof EVENT_STYLES] || EVENT_STYLES.holy
              return (
                <div
                  key={event.id}
                  className={`flex items-start gap-3 p-2 rounded-lg ${style.bg} border border-${style.indicator.replace('bg-', '')}/20`}
                >
                  <div className="text-center min-w-[40px] flex flex-col items-center">
                    <span className="text-lg">{style.emoji}</span>
                    <span className={`text-lg font-bold ${style.text}`}>{event.hijriDay}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-foreground">{event.name}</p>
                    <p className="text-xs text-muted-foreground">{event.nameArabic}</p>
                    <p className="text-xs text-muted-foreground/80 mt-0.5">{event.description}</p>
                    {event.isFastingDay && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        {event.fastingType === 'obligatory' ? 'Obligatory Fast' : 'Recommended Fast'}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${style.bg} ${style.text}`}
                  >
                    {style.label}
                  </span>
                </div>
              )
            })}

            {/* Ayyam al-Beed (always shown) */}
            <div className="flex items-start gap-3 p-2 rounded-lg bg-sky-500/10 border border-sky-500/20">
              <div className="text-center min-w-[40px] flex flex-col items-center">
                <span className="text-lg">{EVENT_STYLES.sunnah.emoji}</span>
                <span className="text-sm font-bold text-sky-600 dark:text-sky-400">13-15</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm text-foreground">Ayyam al-Beed (White Days)</p>
                <p className="text-xs text-muted-foreground">ايام البيض</p>
                <p className="text-xs text-muted-foreground/80 mt-0.5">Sunnah fasting on the 13th, 14th, and 15th of every Hijri month</p>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-sky-500/20 text-sky-600 dark:text-sky-400">
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
      {showLegend && (
        <Card className="border-border/50 bg-card/40 backdrop-blur-sm shadow-sm">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {/* Event Types */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Event Types</p>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded border border-border bg-green-500/15 flex items-center justify-center text-sm">{EVENT_STYLES.eid.emoji}</span>
                  <span className="text-foreground">Eid</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded border border-border bg-purple-500/15 flex items-center justify-center text-sm">{EVENT_STYLES.holy.emoji}</span>
                  <span className="text-foreground">Holy Day</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded border border-border bg-amber-500/15 flex items-center justify-center text-sm">{EVENT_STYLES.fast.emoji}</span>
                  <span className="text-foreground">Obligatory Fast</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded border border-border bg-sky-500/10 flex items-center justify-center text-sm">{EVENT_STYLES.sunnah.emoji}</span>
                  <span className="text-foreground">Sunnah Fast</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded border border-border bg-indigo-500/10 flex items-center justify-center text-sm">{EVENT_STYLES.recommended.emoji}</span>
                  <span className="text-foreground">Recommended</span>
                </div>
              </div>
              {/* Other Indicators */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Other</p>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded border border-border bg-primary/15 ring-2 ring-primary flex items-center justify-center text-xs font-bold text-primary">1</span>
                  <span className="text-foreground">Today</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded border border-border bg-primary/5 flex items-center justify-center text-xs font-bold text-primary">F</span>
                  <span className="text-foreground">Friday</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base">🌑 🌕</span>
                  <span className="text-foreground">Moon Phase</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm"></span>
                  <span className="text-foreground text-xs">Obligatory Fast</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-sky-400 shadow-sm"></span>
                  <span className="text-foreground text-xs">Sunnah Fast</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Attribution */}
      <p className="text-center text-xs text-muted-foreground/60">
        Hijri calendar for {location} based on ACJU moon sighting data
      </p>
    </div>
    </TooltipProvider>
  )
}
