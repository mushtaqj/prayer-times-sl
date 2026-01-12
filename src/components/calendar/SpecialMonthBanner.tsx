import { Star, Sparkles } from 'lucide-react'
import { SACRED_MONTH_NUMBERS, HIJRI_MONTHS } from '@/lib/utils/hijriConstants'

interface SpecialMonthBannerProps {
  hijriMonth: number
}

/**
 * Component to render special month banners (Ramadan, Sacred months)
 */
export function SpecialMonthBanner({ hijriMonth }: SpecialMonthBannerProps) {
  const isRamadan = hijriMonth === HIJRI_MONTHS.RAMADAN
  const isSacredMonth = SACRED_MONTH_NUMBERS.includes(hijriMonth)

  if (isRamadan) {
    return (
      <div className="w-full bg-amber-500/10 border-b border-amber-500/20 py-1.5 px-4 flex items-center justify-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
        <Star className="w-3.5 h-3.5 fill-current" />
        <span>BLESSED MONTH OF RAMADAN</span>
        <Star className="w-3.5 h-3.5 fill-current" />
      </div>
    )
  }

  if (isSacredMonth) {
    return (
      <div className="w-full bg-emerald-500/10 border-b border-emerald-500/20 py-1.5 px-4 flex items-center justify-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
        <Sparkles className="w-3.5 h-3.5" />
        <span>SACRED MONTH</span>
        <Sparkles className="w-3.5 h-3.5" />
      </div>
    )
  }

  return null
}
