import { useState } from 'react'
import { ChevronDown, ChevronUp, History } from 'lucide-react'
import { formatShortDateYear } from '@/lib/utils/date'

interface CompletedMonth {
  hijriYear: number
  hijriMonth: number
  monthName: string
  days: number
  gregorianStart: string
}

interface RecentChangesHistoryProps {
  recentMonths: CompletedMonth[]
}

export function RecentChangesHistory({ recentMonths }: RecentChangesHistoryProps) {
  const [showHistory, setShowHistory] = useState(false)

  if (recentMonths.length === 0) {
    return null
  }

  return (
    <div className="mt-6">
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="w-full flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border hover:bg-card/80 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          <History className="w-4 h-4" />
          Recent Changes
        </span>
        {showHistory ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {showHistory && (
        <div className="mt-2 border border-border rounded-lg overflow-hidden">
          {recentMonths.map((month, index) => (
            <div
              key={`${month.hijriYear}-${month.hijriMonth}`}
              className={`flex items-center justify-between p-3 text-sm ${
                index !== recentMonths.length - 1 ? 'border-b border-border' : ''
              } ${index === 0 ? 'bg-muted/30' : ''}`}
            >
              <div>
                <span className="font-medium text-foreground">
                  {month.monthName} {month.hijriYear}
                </span>
                <span className="text-muted-foreground ml-2">
                  ({month.days} days)
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatShortDateYear(new Date(month.gregorianStart))}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
