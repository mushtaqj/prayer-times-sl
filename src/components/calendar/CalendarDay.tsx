import { Moon } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { getMoonPhase } from '@/lib/hijriCalendar'
import { getPrimaryEventType } from '@/lib/eventMatching'
import { EVENT_STYLES } from './calendarConstants'
import type { CalendarDay as CalendarDayType, DayEvent, FastingInfo } from '@/lib/data/types'

interface CalendarDayProps {
  day: CalendarDayType
  dayEvents: DayEvent[]
  fastingInfo: FastingInfo
  currentHijriMonth: number
  isLastCol: boolean
  isFriday: boolean
  onDayClick?: () => void
}

export function CalendarDay({
  day,
  dayEvents,
  fastingInfo,
  isLastCol,
  isFriday,
  onDayClick,
}: CalendarDayProps) {
  const moonPhase = getMoonPhase(day.hijriDay)
  const showMoon = day.hijriDay === 1 || day.hijriDay === 15

  // Detect Gregorian Month Change
  const isGregorianStart = day.gregorianDate.getDate() === 1
  const gregorianMonthName = day.gregorianDate.toLocaleDateString('en-US', { month: 'short' })
  const gregorianDayLabel = isGregorianStart
    ? `${gregorianMonthName} 1`
    : day.gregorianDate.getDate().toString()

  // Determine primary event type for styling
  const primaryEventType = getPrimaryEventType(dayEvents)
  const eventStyle = primaryEventType ? EVENT_STYLES[primaryEventType] : null

  // Determine cell background
  let cellBg = 'bg-background'
  let textColor = 'text-foreground'
  let borderColor = 'border-transparent'

  if (day.isToday) {
    cellBg = 'bg-primary/20'
    textColor = 'text-primary'
  } else if (eventStyle) {
    cellBg = eventStyle.bg
    textColor = eventStyle.text
    borderColor = eventStyle.border
  } else if (isFriday) {
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

  // Determine if clickable
  const hasSpecialFasting = fastingInfo.isFasting && fastingInfo.reason !== 'Ramadan'
  const isClickable = (dayEvents.length > 0 || hasSpecialFasting || fastingInfo.type === 'forbidden' || isFriday) && onDayClick

  const cellContent = (
    <div
      className={`aspect-square p-1 flex flex-col relative transition-colors border-b border-border ${isClickable ? 'cursor-pointer hover:bg-muted/50' : ''} ${!isLastCol ? 'border-r border-border' : ''} ${cellBg} ${day.isToday ? 'ring-2 ring-primary ring-inset z-10' : ''}`}
      onClick={isClickable ? onDayClick : undefined}
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

      {/* Indicators Row (Bottom Left) */}
      <div className="absolute bottom-1.5 left-1.5 flex gap-0.5 z-10">
        {eventStyle && (
          <eventStyle.icon className={`w-3 h-3 ${eventStyle.text}`} fill="currentColor" />
        )}
        {fastingInfo.isFasting && !eventStyle && (
          <Moon className={`w-3 h-3 ${fastingInfo.type === 'obligatory' ? 'text-amber-500 fill-amber-500' : 'text-sky-400'}`} />
        )}
      </div>

      {/* Hijri Day Number - CENTER */}
      <div className="flex-1 flex items-center justify-center z-0">
        <span className={`text-2xl font-bold leading-none tracking-tight ${day.isToday ? 'text-primary' : textColor}`}>
          {day.hijriDay}
        </span>
      </div>

      {/* Gregorian Day - Bottom Right */}
      <span className={`absolute bottom-1 right-1.5 text-[10px] font-medium leading-none ${isGregorianStart ? 'text-primary font-bold' : 'text-muted-foreground/60'}`}>
        {gregorianDayLabel}
      </span>
    </div>
  )

  if (hasTooltip) {
    return (
      <Tooltip>
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
    )
  }

  return cellContent
}

/**
 * Empty cell for calendar grid padding
 */
export function EmptyCalendarCell({ isLastCol, isFriday }: { isLastCol: boolean; isFriday: boolean }) {
  return (
    <div
      className={`aspect-square border-b border-border ${!isLastCol ? 'border-r border-border' : ''} ${isFriday ? 'bg-primary/5' : 'bg-muted/10'}`}
    />
  )
}

/**
 * Uncertain Day 30 cell for current month
 */
export function UncertainDay30Cell() {
  return (
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
  )
}
