import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { DistrictSelector } from '@/components/common/DistrictSelector'
import { districts, getDistrictById } from '@/lib/data/prayerTimes'
import { Bell, AlertCircle, Smartphone } from 'lucide-react'

interface NotificationEnableModalProps {
  isOpen: boolean
  onClose: () => void
  onEnable: (districtId: string) => Promise<boolean>
  isLoading: boolean
  error: string | null
  currentDistrictId: string | null
  isIOS: boolean
  isIOSInstalled: boolean
}

/**
 * Modal for enabling push notifications with district selection
 */
export function NotificationEnableModal({
  isOpen,
  onClose,
  onEnable,
  isLoading,
  error,
  currentDistrictId,
  isIOS,
  isIOSInstalled,
}: NotificationEnableModalProps) {
  const [selectedDistrict, setSelectedDistrict] = useState<string>(
    currentDistrictId || 'colombo'
  )

  const handleEnable = async () => {
    const success = await onEnable(selectedDistrict)
    if (success) {
      onClose()
    }
  }

  const selectedDistrictInfo = getDistrictById(selectedDistrict)

  // iOS not installed - show install guide
  if (isIOS && !isIOSInstalled) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-border/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-serif text-primary">
              <Smartphone className="w-5 h-5" />
              Install Required for Notifications
            </DialogTitle>
            <DialogDescription>
              Add to Home Screen for push notifications
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
              <p className="text-sm text-amber-600 dark:text-amber-400">
                Push notifications require this app to be installed on your home screen.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-foreground">How to install:</h4>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>Tap the <span className="font-medium text-foreground">Share</span> button in Safari</li>
                <li>Scroll down and tap <span className="font-medium text-foreground">Add to Home Screen</span></li>
                <li>Tap <span className="font-medium text-foreground">Add</span> in the top right</li>
                <li>Open the app from your home screen</li>
              </ol>
            </div>

            <p className="text-xs text-muted-foreground">
              Note: iOS 16.4 or later is required for push notifications.
            </p>
          </div>

          <DialogFooter>
            <Button onClick={onClose} variant="outline">
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-serif text-primary">
            <Bell className="w-5 h-5" />
            Enable Prayer Notifications
          </DialogTitle>
          <DialogDescription>
            Get notified when it's time to pray
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* District Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Notification Location
            </label>
            <DistrictSelector
              districts={districts}
              value={selectedDistrict}
              onChange={setSelectedDistrict}
              size="full"
            />
            {selectedDistrictInfo && (
              <p className="text-xs text-muted-foreground">
                Zone {selectedDistrictInfo.zone} prayer times
              </p>
            )}
          </div>

          {/* Info */}
          <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
            <p className="text-sm text-muted-foreground">
              You'll receive notifications for all 5 daily prayers based on the selected location's prayer times.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button onClick={onClose} variant="outline" disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleEnable} disabled={isLoading}>
            {isLoading ? 'Enabling...' : 'Enable Notifications'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
