import { Clock, Calendar, CalendarSearch } from 'lucide-react'

interface NavigationButtonsProps {
  onPrayerTimesClick: () => void
  onHijriCalendarClick: () => void
  onJumpToMonthClick: () => void
}

export function NavigationButtons({
  onPrayerTimesClick,
  onHijriCalendarClick,
  onJumpToMonthClick,
}: NavigationButtonsProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <button
        onClick={onPrayerTimesClick}
        className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20 hover:shadow-lg hover:scale-[1.02] transition-all active:scale-[0.98]"
      >
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white/20 flex items-center justify-center">
          <Clock className="w-5 h-5" />
        </div>
        <span className="text-[10px] sm:text-xs font-semibold">Prayer Times</span>
      </button>

      <button
        onClick={onHijriCalendarClick}
        className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20 hover:shadow-lg hover:scale-[1.02] transition-all active:scale-[0.98]"
      >
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white/20 flex items-center justify-center">
          <Calendar className="w-5 h-5" />
        </div>
        <span className="text-[10px] sm:text-xs font-semibold">Hijri Calendar</span>
      </button>

      <button
        onClick={onJumpToMonthClick}
        className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20 hover:shadow-lg hover:scale-[1.02] transition-all active:scale-[0.98]"
      >
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white/20 flex items-center justify-center">
          <CalendarSearch className="w-5 h-5" />
        </div>
        <span className="text-[10px] sm:text-xs font-semibold">Jump to Month</span>
      </button>
    </div>
  )
}
