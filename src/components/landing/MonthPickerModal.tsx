import { Button } from '@/components/ui/button'

interface HijriMonth {
  number: number
  name: string
  nameArabic: string
}

interface MonthPickerModalProps {
  isOpen: boolean
  currentMonth: number | null
  hijriMonths: HijriMonth[]
  onMonthSelect: (monthNumber: number) => void
  onClose: () => void
}

export function MonthPickerModal({
  isOpen,
  currentMonth,
  hijriMonths,
  onMonthSelect,
  onClose,
}: MonthPickerModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="bg-card w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        <div className="p-4 border-b border-border bg-muted/30">
          <h3 className="text-lg font-semibold">Jump to Hijri Month</h3>
          <p className="text-xs text-muted-foreground">
            Select a month to view in the calendar
          </p>
        </div>
        <div className="p-4 grid grid-cols-3 gap-2 max-h-[50vh] overflow-y-auto">
          {hijriMonths.map((month) => (
            <button
              key={month.number}
              onClick={() => onMonthSelect(month.number)}
              className={`p-3 rounded-xl text-center transition-all hover:scale-[1.02] active:scale-[0.98] ${
                currentMonth === month.number
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-muted/50 hover:bg-muted text-foreground'
              }`}
            >
              <span className="text-sm font-medium block">{month.name}</span>
              <span className="text-[10px] opacity-70">{month.nameArabic}</span>
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-border">
          <Button variant="outline" className="w-full" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
