import { ArrowRight } from 'lucide-react'
import { formatShortDateYear } from '@/lib/utils/date'

interface MonthTransitionCardProps {
  currentMonth: {
    monthName: string
    hijriYear: number
    gregorianStart: string
  }
  nextMonth: {
    monthName: string
    hijriYear: number
  }
  nextStartDate: string
}

export function MonthTransitionCard({
  currentMonth,
  nextMonth,
  nextStartDate,
}: MonthTransitionCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Current Month</p>
          <p className="text-lg font-semibold text-foreground">
            {currentMonth.monthName} {currentMonth.hijriYear}
          </p>
          <p className="text-sm text-muted-foreground">
            Started {formatShortDateYear(new Date(currentMonth.gregorianStart))}
          </p>
        </div>
        <ArrowRight className="w-6 h-6 text-muted-foreground/50" />
        <div className="text-right">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Next Month</p>
          <p className="text-lg font-semibold text-primary">
            {nextMonth.monthName} {nextMonth.hijriYear}
          </p>
          <p className="text-sm text-muted-foreground">
            Starts {nextStartDate}
          </p>
        </div>
      </div>
    </div>
  )
}
