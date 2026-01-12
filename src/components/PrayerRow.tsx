import { Toggle } from '@/components/ui/toggle'
import { Bell, BellOff } from 'lucide-react'
import { cn } from '@/lib/tailwind'

interface PrayerRowProps {
  name: string
  time: string
  isNext?: boolean
  showAlarm?: boolean
  alarmEnabled?: boolean
  onToggleAlarm?: () => void
}

export function PrayerRow({
  name,
  time,
  isNext,
  showAlarm = false,
  alarmEnabled = false,
  onToggleAlarm,
}: PrayerRowProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between py-4 px-3 rounded-xl transition-colors duration-300",
        isNext
          ? "bg-primary/10 border border-primary/20 shadow-sm"
          : "hover:bg-muted/50 border border-transparent"
      )}
    >
      <div className="flex items-center gap-4">
        <span className={cn(
          "font-medium text-base",
          isNext ? "text-primary font-bold font-heading" : "text-muted-foreground"
        )}>
          {name}
        </span>
        {isNext && (
          <span className="text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded-full shadow-sm">
            Upcoming
          </span>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span className={cn(
          "font-medium tabular-nums text-lg font-heading",
          isNext ? "text-primary" : "text-foreground"
        )}>
          {time}
        </span>
        {showAlarm && onToggleAlarm && (
          <Toggle
            size="sm"
            pressed={alarmEnabled}
            onPressedChange={onToggleAlarm}
            className={cn(
              "h-9 w-9 p-0 rounded-full data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
              !alarmEnabled && "hover:bg-muted text-muted-foreground"
            )}
            aria-label={`Toggle ${name} alarm`}
          >
            {alarmEnabled ? (
              <Bell className="h-4 w-4" />
            ) : (
              <BellOff className="h-4 w-4 opacity-50" />
            )}
          </Toggle>
        )}
      </div>
    </div>
  )
}
