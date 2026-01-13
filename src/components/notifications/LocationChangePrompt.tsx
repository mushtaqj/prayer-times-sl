import { getDistrictById } from '@/lib/data/prayerTimes'
import { Button } from '@/components/ui/button'
import { MapPin, X } from 'lucide-react'

interface LocationChangePromptProps {
  promptDistrictId: string
  currentNotificationDistrict: string | null
  onAccept: () => Promise<boolean>
  onDismiss: () => void
  isLoading: boolean
}

/**
 * Subtle banner prompting user to update their notification location
 * when they browse a different zone
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
    <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 animate-in slide-in-from-top-2 duration-300">
      <div className="flex items-start gap-3">
        <div className="bg-primary/20 p-1.5 rounded-full shrink-0">
          <MapPin className="w-4 h-4 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">
            Update notification location?
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            You're viewing{' '}
            <span className="font-medium text-foreground">{newDistrict.name}</span>
            {currentDistrict && (
              <>
                {' '}but receiving notifications for{' '}
                <span className="font-medium text-foreground">
                  {currentDistrict.name}
                </span>
              </>
            )}
          </p>
        </div>

        <button
          onClick={onDismiss}
          className="p-1 hover:bg-muted rounded-sm shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-2 mt-3 ml-9">
        <Button
          size="sm"
          variant="outline"
          onClick={onDismiss}
          disabled={isLoading}
          className="h-7 text-xs"
        >
          Keep current
        </Button>
        <Button
          size="sm"
          onClick={onAccept}
          disabled={isLoading}
          className="h-7 text-xs"
        >
          {isLoading ? 'Updating...' : `Use ${newDistrict.name}`}
        </Button>
      </div>
    </div>
  )
}
