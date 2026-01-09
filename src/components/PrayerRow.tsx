import { Toggle } from '@/components/ui/toggle'
import { Bell, BellOff } from 'lucide-react'
import { cn } from '@/lib/utils'

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
        "flex items-center justify-between py-4 px-2",
        isNext && "bg-primary/10 -mx-2 px-4 rounded-lg"
      )}
    >
      <div className="flex items-center gap-3">
        <span className={cn(
          "font-medium",
          isNext && "text-primary font-semibold"
        )}>
          {name}
        </span>
        {isNext && (
          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
            Next
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className={cn(
          "font-semibold tabular-nums",
          isNext ? "text-primary text-lg" : "text-foreground"
        )}>
          {time}
        </span>
        {showAlarm && onToggleAlarm && (
          <Toggle
            size="sm"
            pressed={alarmEnabled}
            onPressedChange={onToggleAlarm}
            className="h-8 w-8 p-0"
            aria-label={`Toggle ${name} alarm`}
          >
            {alarmEnabled ? (
              <Bell className="h-4 w-4" />
            ) : (
              <BellOff className="h-4 w-4 text-muted-foreground" />
            )}
          </Toggle>
        )}
      </div>
    </div>
  )
}
