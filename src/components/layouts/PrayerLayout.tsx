/**
 * Shared layout for prayer view routes (/prayer, /prayer/week, /prayer/month)
 * Uses React Router's Outlet for nested route content
 * Passes prayer data to children via outlet context
 */
import { Outlet } from 'react-router-dom'
import { ViewSwitcher } from '@/components/ViewSwitcher'
import { ActionBanner } from '@/components/ActionBanner'
import { Bell } from 'lucide-react'
import type { DailyPrayerTimes, PrayerName } from '@/lib/data/types'

// Context type for child routes
export interface PrayerLayoutContext {
  todayPrayers: DailyPrayerTimes | null
  weekPrayers: (DailyPrayerTimes & { date: Date })[]
  getMonthPrayers: (month: number) => DailyPrayerTimes[]
  currentPrayer: { name: string; time: string; displayName: string } | null
  nextPrayer: { name: string; time: string; displayName: string } | null
  alarms: Record<string, boolean>
  onToggleAlarm: (prayer: PrayerName) => void
  location: string
}

interface PrayerLayoutProps {
  hasPermission: boolean
  onEnableNotifications: () => void
  context: PrayerLayoutContext
}

export function PrayerLayout({ hasPermission, onEnableNotifications, context }: PrayerLayoutProps) {
  return (
    <>
      {/* Sticky View Switcher */}
      <div className="sticky top-[calc(48px+env(safe-area-inset-top))] sm:top-[60px] z-30 mt-[calc(48px+env(safe-area-inset-top))] sm:mt-0 bg-background/95 backdrop-blur-md px-4 py-3 border-b border-border/50 supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <ViewSwitcher />
      </div>

      <div className="p-4 pb-20 sm:pb-4 space-y-6 flex-1">
        {/* Notification Banner */}
        {!hasPermission && (
          <ActionBanner
            icon={Bell}
            message="Enable notifications for prayer alerts"
            actionLabel="Enable"
            onAction={onEnableNotifications}
          />
        )}

        {/* Child Route Content */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Outlet context={context} />
        </div>
      </div>
    </>
  )
}
