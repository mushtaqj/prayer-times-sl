import { useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ChevronLeft, ChevronRight, Calendar, CalendarDays, HelpCircle,
  ChevronDown, ChevronUp, Moon, Star, Sparkles,
  BookOpen
} from 'lucide-react'
import { VirtuesSheet } from '@/components/VirtuesSheet'
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
import {
  CalendarLegend,
  MonthEventsCard,
  WEEKDAYS,
  HIJRI_MONTH_NAMES,
  SACRED_MONTHS,
  EVENT_STYLES
} from '@/components/calendar'

interface HijriCalendarViewProps {
  location: string
}

export function HijriCalendarView({ location }: HijriCalendarViewProps) {
  const [jumpDialogOpen, setJumpDialogOpen] = useState(false)
  const [jumpMode, setJumpMode] = useState<'hijri' | 'gregorian'>('hijri')
  const [selectedHijriMonth, setSelectedHijriMonth] = useState<string>('')
  const [selectedHijriYear, setSelectedHijriYear] = useState<string>('')
  const [showLegend, setShowLegend] = useState(false)
  const [virtueSheet, setVirtueSheet] = useState<{ title: string; content: string } | null>(null) // Added virtueSheet state

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

  // Determine Month Theme
  const isSacredMonth = SACRED_MONTHS.includes(currentHijriMonth)
  const isRamadan = currentHijriMonth === 9

  let headerBorderColor = 'border-border/50'
  let headerBgColor = 'bg-card/40'
  // Special Month Banner Configuration
  let specialMonthBanner = null

  if (isRamadan) {
    headerBorderColor = 'border-amber-500/30'
    headerBgColor = 'bg-amber-500/5'
    specialMonthBanner = (
      <div className="w-full bg-amber-500/10 border-b border-amber-500/20 py-1.5 px-4 flex items-center justify-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
        <Star className="w-3.5 h-3.5 fill-current" />
        <span>BLESSED MONTH OF RAMADAN</span>
        <Star className="w-3.5 h-3.5 fill-current" />
      </div>
    )
  } else if (isSacredMonth) {
    headerBorderColor = 'border-emerald-500/30'
    headerBgColor = 'bg-emerald-500/5'
    specialMonthBanner = (
      <div className="w-full bg-emerald-500/10 border-b border-emerald-500/20 py-1.5 px-4 flex items-center justify-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
        <Sparkles className="w-3.5 h-3.5" />
        <span>SACRED MONTH</span>
        <Sparkles className="w-3.5 h-3.5" />
      </div>
    )
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

  // Format Gregorian range - show months prominently when spanning two months
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
        <Card className={`${headerBorderColor} ${headerBgColor} backdrop-blur-sm shadow-sm overflow-hidden border`}>
          <CardContent className="p-0">
            {/* Special Month Banner */}
            {specialMonthBanner}

            {/* Month Navigation */}
            <div className={`flex items-center justify-between p-4 border-b border-border/50 relative ${isCurrentMonth
              ? 'bg-primary/5'
              : 'bg-transparent'
              }`}>

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
            <div className="grid grid-cols-7 bg-muted/50">
              {WEEKDAYS.map((day, idx) => (
                <div
                  key={day}
                  className={`py-3 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border ${idx < 6 ? 'border-r border-border/50' : ''
                    } ${day === 'Fri' ? 'text-primary bg-primary/10' : ''}`} // Friday header highlighted
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
                const isFriday = colIndex === 5 // Friday is 6th column (index 5 from 0)

                if (!day) {
                  // Empty cell rendering
                  return (
                    <div
                      key={`empty-${index}`}
                      className={`aspect-square border-b border-border ${!isLastCol ? 'border-r border-border' : ''} ${isFriday ? 'bg-primary/5' : 'bg-muted/10'}`}
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
                const showMoon = day.hijriDay === 1 || day.hijriDay === 15

                // Detect Gregorian Month Change
                const isGregorianStart = day.gregorianDate.getDate() === 1
                const gregorianMonthName = day.gregorianDate.toLocaleDateString('en-US', { month: 'short' })
                const gregorianDayLabel = isGregorianStart
                  ? `${gregorianMonthName} 1`
                  : day.gregorianDate.getDate().toString()

                // Determine primary event type for styling
                const getPrimaryEventType = (): keyof typeof EVENT_STYLES | null => {
                  if (dayEvents.some(e => e.type === 'eid')) return 'eid'
                  if (dayEvents.some(e => e.type === 'holy')) return 'holy'
                  // Ayyam al-Beed check - prioritized
                  if (dayEvents.some(e => e.isRecurring && e.name === 'Ayyam al-Beed')) return 'ayyamAlBeed'
                  // Fixed Recurring Events (e.g. Dhul Hijjah)
                  if (dayEvents.some(e => e.type === 'recommended')) return 'recommended'
                  return null
                }
                const primaryEventType = getPrimaryEventType()
                const eventStyle = primaryEventType ? EVENT_STYLES[primaryEventType] : null

                // Determine cell background
                let cellBg = 'bg-background'
                let textColor = 'text-foreground'
                let borderColor = 'border-transparent' // For inner border/ring

                if (day.isToday) {
                  cellBg = 'bg-primary/20'
                  textColor = 'text-primary'
                } else if (eventStyle) {
                  // Backgrounds for Eid, Holy, Ayyam al-Beed
                  cellBg = eventStyle.bg
                  textColor = eventStyle.text
                  borderColor = eventStyle.border
                } else if (isFriday) {
                  // Subtle highlight for entire Friday column
                  cellBg = 'bg-primary/5'
                  textColor = 'text-primary'
                }

                // Build tooltip content
                const tooltipLines: string[] = []
                if (dayEvents.length > 0) {
                  dayEvents.forEach(e => {
                    tooltipLines.push(e.name)
                  })
                }
                if (fastingInfo.isFasting && fastingInfo.reason && !tooltipLines.some(l => l.includes(fastingInfo.reason!))) {
                  tooltipLines.push(`Fasting: ${fastingInfo.reason}`)
                }
                const hasTooltip = tooltipLines.length > 0

                // Determine if this day should be clickable
                // isFriday is already defined above based on column index
                // Exclude regular Ramadan days from being clickable (only special events, not just fasting)
                const isRegularRamadanDay = currentHijriMonth === 9 && dayEvents.length === 0 && fastingInfo.reason === 'Ramadan'
                const hasSpecialFasting = fastingInfo.isFasting && fastingInfo.reason !== 'Ramadan' // Ashura, Arafah, etc.
                const isClickable = (dayEvents.length > 0 || hasSpecialFasting || fastingInfo.type === 'forbidden' || isFriday) && !isRegularRamadanDay

                const handleDayClick = () => {
                  if (!isClickable) return

                  // Build day-specific content
                  const dayName = day.gregorianDate.toLocaleDateString('en-US', { weekday: 'long' })
                  let content = `# ${dayName}, ${currentMonthData.monthName} ${day.hijriDay}\n\n`

                  // Add events WITH their full details
                  if (dayEvents.length > 0) {
                    dayEvents.forEach(e => {
                      if (e.details) {
                        // Use the full virtues content
                        content += e.details + `\n\n`
                      } else {
                        content += `## ${e.name}\n`
                        content += `*${e.type}*\n\n`
                      }
                    })
                  }

                  // Add Friday info - use full content from virtues data
                  if (isFriday) {
                    // Get Friday virtues from our data
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
                  if (fastingInfo.isFasting && fastingInfo.reason !== 'Ramadan') {
                    // Check if we have detailed content for this fast
                    if (fastingInfo.reason === 'Monday Fast') {
                      const mondayDetails = recurringFasts.weekly.find(f => f.id === 'monday-fast')?.details
                      if (mondayDetails) {
                        content += mondayDetails + `\n\n`
                      }
                    } else if (fastingInfo.reason === 'Thursday Fast') {
                      const thursdayDetails = recurringFasts.weekly.find(f => f.id === 'thursday-fast')?.details
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

                  setVirtueSheet({ title: `${currentMonthData.monthName} ${day.hijriDay}`, content })
                }

                const cellContent = (
                  <div
                    className={`aspect-square p-1 flex flex-col relative transition-colors border-b border-border ${isClickable ? 'cursor-pointer hover:bg-muted/50' : ''} ${!isLastCol ? 'border-r border-border' : ''} ${cellBg} ${day.isToday ? 'ring-2 ring-primary ring-inset z-10' : ''
                      }`}
                    onClick={handleDayClick}
                  >
                    {/* Internal border for events */}
                    {eventStyle && (
                      <div className={`absolute inset-0.5 border ${borderColor} rounded-sm pointer-events-none`} />
                    )}

                    {/* Moon Phase - Top Right (Key days) */}
                    {showMoon && (
                      <span className="absolute top-1 right-1 text-sm opacity-80">
                        {moonPhase.icon}
                      </span>
                    )}

                    {/* Eid Text Logic */}
                    {primaryEventType === 'eid' && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-10">
                        <span className="text-3xl font-extrabold uppercase">EID</span>
                        <span className="text-3xl font-extrabold font-arabic">عيد</span>
                      </div>
                    )}

                    {/* Indicators Row (Bottom Left) - INCREASED SIZE + ICONS */}
                    <div className="absolute bottom-1.5 left-1.5 flex gap-0.5 z-10">
                      {/* Event Icon - Only for Eid/Holy/Ayyam al-Beed */}
                      {eventStyle && (
                        <eventStyle.icon className={`w-3 h-3 ${eventStyle.text}`} fill="currentColor" />
                      )}

                      {/* Fasting Icon - Consistent for ALL fasts */}
                      {fastingInfo.isFasting && !eventStyle && (
                        <Moon className={`w-3 h-3 ${fastingInfo.type === 'obligatory' ? 'text-amber-500 fill-amber-500' : 'text-sky-400'}`} />
                      )}
                    </div>

                    {/* Hijri Day Number - CENTER LARGED */}
                    <div className="flex-1 flex items-center justify-center z-0">
                      <span
                        className={`text-2xl font-bold leading-none tracking-tight ${day.isToday ? 'text-primary' : textColor
                          }`}
                      >
                        {day.hijriDay}
                      </span>
                    </div>

                    {/* Gregorian Day - Bottom Right */}
                    <span className={`absolute bottom-1 right-1.5 text-[10px] font-medium leading-none ${isGregorianStart ? 'text-primary font-bold' : 'text-muted-foreground/60'}`}>
                      {gregorianDayLabel}
                    </span>
                  </div>
                )

                return hasTooltip ? (
                  <Tooltip key={day.hijriDay}>
                    <TooltipTrigger asChild>
                      {cellContent}
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs p-2">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground font-semibold border-b border-border/20 pb-1 mb-1">
                          {day.gregorianDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
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
