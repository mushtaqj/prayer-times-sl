import { Moon, Star, Gift, Sparkles } from 'lucide-react'

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export const SACRED_MONTHS = [1, 7, 11, 12] // Muharram, Rajab, Dhul Qadah, Dhul Hijjah

export const EVENT_STYLES = {
  eid: {
    bg: 'bg-emerald-500/15',
    indicator: 'bg-emerald-500',
    text: 'text-emerald-700 dark:text-emerald-400',
    icon: Gift,
    label: 'Eid',
    border: 'border-emerald-500/30'
  },
  holy: {
    bg: 'bg-fuchsia-500/15',
    indicator: 'bg-fuchsia-500',
    text: 'text-fuchsia-700 dark:text-fuchsia-400',
    icon: Sparkles,
    label: 'Holy',
    border: 'border-fuchsia-500/30'
  },
  fast: {
    bg: 'bg-transparent',
    indicator: 'bg-amber-500',
    text: 'text-foreground',
    icon: Moon,
    label: 'Fast',
    border: 'border-transparent'
  },
  ayyamAlBeed: {
    bg: 'bg-indigo-500/10',
    indicator: 'bg-indigo-400',
    text: 'text-indigo-700 dark:text-indigo-300',
    icon: Moon,
    label: 'White Days',
    border: 'border-indigo-500/20'
  },
  sunnah: {
    bg: 'bg-transparent',
    indicator: 'bg-sky-400',
    text: 'text-foreground',
    icon: Moon,
    label: 'Sunnah',
    border: 'border-transparent'
  },
  recommended: {
    bg: 'bg-transparent',
    indicator: 'bg-indigo-400',
    text: 'text-foreground',
    icon: Star,
    label: 'Recommended',
    border: 'border-transparent'
  },
} as const

export type EventStyleKey = keyof typeof EVENT_STYLES

export interface MonthThemeData {
  headerBorderColor: string
  headerBgColor: string
  type: 'ramadan' | 'sacred' | 'normal'
}

/**
 * Get theme configuration for special months (Ramadan, Sacred months)
 */
export function getMonthTheme(hijriMonth: number): MonthThemeData {
  const isRamadan = hijriMonth === 9
  const isSacredMonth = SACRED_MONTHS.includes(hijriMonth)

  if (isRamadan) {
    return {
      headerBorderColor: 'border-amber-500/30',
      headerBgColor: 'bg-amber-500/5',
      type: 'ramadan',
    }
  }

  if (isSacredMonth) {
    return {
      headerBorderColor: 'border-emerald-500/30',
      headerBgColor: 'bg-emerald-500/5',
      type: 'sacred',
    }
  }

  return {
    headerBorderColor: 'border-border/50',
    headerBgColor: 'bg-card/40',
    type: 'normal',
  }
}
