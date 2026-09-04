import { MaterialSymbol, type MaterialSymbolName } from '@/components/icons/MaterialSymbol'

interface NavigationButtonsProps {
  onPrayerTimesClick: () => void
  onHijriCalendarClick: () => void
  onJumpToMonthClick: () => void
}

interface NavCardProps {
  icon: MaterialSymbolName
  label: string
  hint: string
  onClick: () => void
}

function NavCard({ icon, label, hint, onClick }: NavCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-center gap-2.5 rounded-2xl border border-border/60 bg-card px-2 py-4 text-center shadow-sm
        transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md
        active:translate-y-0 active:scale-[0.98]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50
        sm:flex-row sm:items-center sm:gap-4 sm:px-5 sm:py-4 sm:text-left"
    >
      <span
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/15
          transition-colors duration-200 group-hover:bg-primary/15 sm:h-16 sm:w-16"
      >
        <MaterialSymbol name={icon} className="h-8 w-8 sm:h-9 sm:w-9" />
      </span>

      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-xs font-bold leading-tight tracking-tight text-foreground sm:text-base">{label}</span>
        <span className="text-[10px] font-medium leading-tight text-muted-foreground sm:text-xs">{hint}</span>
      </span>
    </button>
  )
}

export function NavigationButtons({
  onPrayerTimesClick,
  onHijriCalendarClick,
  onJumpToMonthClick,
}: NavigationButtonsProps) {
  return (
    <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
      <NavCard icon="prayer_times" label="Prayer Times" hint="Today & week" onClick={onPrayerTimesClick} />
      <NavCard icon="calendar_month" label="Hijri Calendar" hint="Events & moon" onClick={onHijriCalendarClick} />
      <NavCard icon="calendar_search" label="Jump to Month" hint="Pick a month" onClick={onJumpToMonthClick} />
    </div>
  )
}
