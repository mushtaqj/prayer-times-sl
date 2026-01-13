import { getDistrictById } from '@/lib/data/prayerTimes'
import { MapPin, X } from 'lucide-react'

interface LocationChangePromptProps {
  promptDistrictId: string
  currentNotificationDistrict: string | null
  onAccept: () => Promise<boolean>
  onDismiss: () => void
  isLoading: boolean
}

/**
 * Sleek top banner prompting user to update their notification location
 */
export function LocationChangePrompt({
  promptDistrictId,
  currentNotificationDistrict,
  onAccept,
  onDismiss,
  isLoading,
}: LocationChangePromptProps) {
  const newDistrict = getDistrictById(promptDistrictId)
  const currentDistrict = currentNotificationDistrict
    ? getDistrictById(currentNotificationDistrict)
    : null

  if (!newDistrict) return null

  return (
    <div className="bg-amber-50 dark:bg-amber-950/50 border-b border-amber-200 dark:border-amber-800 py-3 px-4 animate-in slide-in-from-top duration-200">
      <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <p className="text-sm text-amber-800 dark:text-amber-200 truncate">
            <span className="hidden sm:inline">Notifications: </span>
            <span className="font-medium">{currentDistrict?.name || 'Not set'}</span>
            <span className="text-amber-600 dark:text-amber-400"> → </span>
            <span className="font-medium">{newDistrict.name}?</span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onAccept}
            disabled={isLoading}
            className="px-3 py-1.5 text-sm font-medium bg-amber-600 hover:bg-amber-700 text-white rounded transition-colors disabled:opacity-50"
          >
            {isLoading ? '...' : 'Update'}
          </button>
          <button
            onClick={onDismiss}
            disabled={isLoading}
            className="p-1.5 text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900 rounded transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
