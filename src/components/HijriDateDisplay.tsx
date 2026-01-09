import { useMemo } from 'react'
import { formatHijriDate, getMoonPhase, type HijriDate } from '@/hooks/useHijriCalendar'
import { useIslamicEvents } from '@/hooks/useIslamicEvents'

interface HijriDateDisplayProps {
  hijriDate: HijriDate | null
  showMoonPhase?: boolean
  showEvents?: boolean
  compact?: boolean
}

export function HijriDateDisplay({
  hijriDate,
  showMoonPhase = true,
  showEvents = true,
  compact = false,
}: HijriDateDisplayProps) {
  const { getEventsForDate, isFastingDay } = useIslamicEvents()

  const moonPhase = useMemo(() => {
    if (!hijriDate) return null
    return getMoonPhase(hijriDate.day)
  }, [hijriDate])

  const events = useMemo(() => {
    if (!showEvents) return []
    return getEventsForDate(hijriDate)
  }, [hijriDate, showEvents, getEventsForDate])

  const fastingInfo = useMemo(() => {
    return isFastingDay(hijriDate)
  }, [hijriDate, isFastingDay])

  if (!hijriDate) {
    return null
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {showMoonPhase && moonPhase && (
          <span className="text-base" title={moonPhase.phase}>{moonPhase.icon}</span>
        )}
        <span>{formatHijriDate(hijriDate, 'short')}</span>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        {showMoonPhase && moonPhase && (
          <span className="text-xl" title={moonPhase.phase}>{moonPhase.icon}</span>
        )}
        <span className="text-lg font-semibold text-foreground">
          {formatHijriDate(hijriDate, 'long')}
        </span>
      </div>

      {showEvents && events.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {events.map((event) => (
            <span
              key={event.id}
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                event.type === 'eid'
                  ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                  : event.type === 'holy'
                  ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                  : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
              }`}
            >
              {event.name}
            </span>
          ))}
        </div>
      )}

      {fastingInfo.isFasting && fastingInfo.type && (
        <div className="text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            {fastingInfo.type === 'obligatory' ? 'Fasting (Obligatory)' :
             fastingInfo.type === 'recommended' ? 'Fasting (Recommended)' :
             'Fasting (Sunnah)'}
          </span>
        </div>
      )}
    </div>
  )
}
