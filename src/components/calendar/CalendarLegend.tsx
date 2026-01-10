import { Card, CardContent } from '@/components/ui/card'
import { Moon, Gift, Sparkles } from 'lucide-react'
import { EVENT_STYLES } from './calendarConstants'

export function CalendarLegend() {
  return (
    <Card className="border-border/50 bg-card/40 backdrop-blur-sm shadow-sm">
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          {/* Event Types */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Event Types</p>
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded border ${EVENT_STYLES.eid.border} ${EVENT_STYLES.eid.bg} flex items-center justify-center text-sm`}>
                <Gift className={`w-3 h-3 ${EVENT_STYLES.eid.text}`} />
              </span>
              <span className="text-foreground">Eid</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded border ${EVENT_STYLES.holy.border} ${EVENT_STYLES.holy.bg} flex items-center justify-center text-sm`}>
                <Sparkles className={`w-3 h-3 ${EVENT_STYLES.holy.text}`} />
              </span>
              <span className="text-foreground">Holy Day</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded border ${EVENT_STYLES.ayyamAlBeed.border} ${EVENT_STYLES.ayyamAlBeed.bg} flex items-center justify-center text-sm`}>
                <Moon className={`w-3 h-3 ${EVENT_STYLES.ayyamAlBeed.text}`} />
              </span>
              <span className="text-foreground">Ayyam al-Beed</span>
            </div>
          </div>
          {/* Other Indicators */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Indicators</p>
            <div className="flex items-center gap-2">
              <Moon className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span className="text-foreground text-xs">Obligatory Fast</span>
            </div>
            <div className="flex items-center gap-2">
              <Moon className="w-3 h-3 text-sky-400" />
              <span className="text-foreground text-xs">Sunnah Fast</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-primary/10 px-2 py-0.5 rounded text-[10px] font-bold text-primary">Fri</span>
              <span className="text-foreground text-xs">Friday (Blessed)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
