import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Calendar, BookOpen } from 'lucide-react'
import { JumpToDateDialog } from './JumpToDateDialog'
import { SpecialMonthBanner } from './SpecialMonthBanner'
import type { HijriMonthInfo } from '@/lib/data/types'

interface MonthInfo {
  name: string
  meaning: string
  details?: string
}

interface CalendarHeaderProps {
  monthName: string
  hijriYear: number
  hijriMonth: number
  gregorianRange: string
  monthInfo: MonthInfo | undefined
  isCurrentMonth: boolean
  canGoPrevious: boolean
  canGoNext: boolean
  showTodayButton: boolean
  availableYears: number[]
  hijriMonths: HijriMonthInfo[]
  onPreviousMonth: () => void
  onNextMonth: () => void
  onGoToToday: () => void
  onGoToMonth: (year: number, month: number) => void
  onOpenMonthDetails: (title: string, content: string) => void
}

export function CalendarHeader({
  monthName,
  hijriYear,
  hijriMonth,
  gregorianRange,
  monthInfo,
  isCurrentMonth,
  canGoPrevious,
  canGoNext,
  showTodayButton,
  availableYears,
  hijriMonths,
  onPreviousMonth,
  onNextMonth,
  onGoToToday,
  onGoToMonth,
  onOpenMonthDetails,
}: CalendarHeaderProps) {
  return (
    <>
      {/* Special Month Banner */}
      <SpecialMonthBanner hijriMonth={hijriMonth} />

      {/* Month Navigation */}
      <div
        className={`flex items-center justify-between p-4 border-b border-border/50 relative ${isCurrentMonth ? 'bg-primary/5' : 'bg-transparent'}`}
      >
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
          onClick={onPreviousMonth}
          disabled={!canGoPrevious}
          className="h-9 w-9"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="text-center flex-1 flex flex-col items-center">
          <h2
            className={`text-xl font-bold ${isCurrentMonth ? 'text-primary' : 'text-foreground'} flex items-center justify-center gap-2`}
          >
            {monthName} {hijriYear}
            {monthInfo?.details && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full hover:bg-primary/10 text-primary/90 ml-2"
                onClick={() =>
                  onOpenMonthDetails(monthName, monthInfo.details!)
                }
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
          onClick={onNextMonth}
          disabled={!canGoNext}
          className="h-9 w-9"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Quick Actions Bar */}
      <div className="px-4 py-2 border-b border-border/50 bg-muted/30 flex gap-2">
        {showTodayButton && (
          <Button
            variant="outline"
            size="sm"
            onClick={onGoToToday}
            className="text-xs flex-1"
          >
            <Calendar className="h-3.5 w-3.5 mr-1.5" />
            Today
          </Button>
        )}
        <JumpToDateDialog
          availableYears={availableYears}
          hijriMonths={hijriMonths}
          onJump={onGoToMonth}
        />
      </div>
    </>
  )
}
