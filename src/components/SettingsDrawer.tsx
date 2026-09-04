import { useState } from 'react'
import { X, MapPin, Loader2, HelpCircle, Bell, BellOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AppInfoModal } from './AppInfoModal'
import { ThemeToggleButton, DistrictSelector } from '@/components/common'
import { useLocation as useGeoLocation } from '@/hooks/useLocation'
import { useLocationContext, useThemeContext, usePushNotificationContext } from '@/contexts'

interface SettingsDrawerProps {
  open: boolean
  onClose: () => void
}

/**
 * Slide-out settings panel (location, appearance, notifications, about).
 * Used by the mobile hamburger menu and by the landing page header.
 */
export function SettingsDrawer({ open, onClose }: SettingsDrawerProps) {
  const [showInfo, setShowInfo] = useState(false)
  const { detectLocation, isDetecting } = useGeoLocation()

  const { districts, selectedDistrict, setSelectedDistrict } = useLocationContext()
  const { isDark, toggleTheme } = useThemeContext()
  const {
    isEnabled: pushEnabled,
    isSupported: pushSupported,
    openEnableModal,
    disable: disablePush,
  } = usePushNotificationContext()

  const handleDetectLocation = async () => {
    const district = await detectLocation()
    if (district) {
      setSelectedDistrict(district)
      onClose()
    }
  }

  return (
    <>
      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />

          <div
            role="dialog"
            aria-label="Settings"
            className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-background border-l border-border shadow-xl animate-in slide-in-from-right duration-300"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold">Settings</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="Close settings"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* Location Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Location</h3>

                <Button
                  variant="outline"
                  onClick={handleDetectLocation}
                  disabled={isDetecting}
                  className="w-full justify-start gap-2"
                >
                  {isDetecting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MapPin className="w-4 h-4" />
                  )}
                  Detect My Location
                </Button>

                <DistrictSelector
                  districts={districts}
                  value={selectedDistrict}
                  onChange={(value) => {
                    setSelectedDistrict(value)
                    onClose()
                  }}
                  size="full"
                />
              </div>

              {/* Appearance Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Appearance</h3>
                <ThemeToggleButton isDark={isDark} onToggle={toggleTheme} showLabel />
              </div>

              {/* Notifications Section */}
              {pushSupported && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Notifications</h3>
                  <Button
                    variant={pushEnabled ? 'default' : 'outline'}
                    onClick={() => {
                      if (pushEnabled) {
                        disablePush()
                      } else {
                        openEnableModal()
                        onClose()
                      }
                    }}
                    className="w-full justify-start gap-2"
                  >
                    {pushEnabled ? (
                      <>
                        <Bell className="w-4 h-4" />
                        Notifications Enabled
                      </>
                    ) : (
                      <>
                        <BellOff className="w-4 h-4" />
                        Enable Notifications
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Help Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">About</h3>

                <Button
                  variant="outline"
                  onClick={() => {
                    setShowInfo(true)
                    onClose()
                  }}
                  className="w-full justify-start gap-2"
                >
                  <HelpCircle className="w-4 h-4" />
                  App Info & Sources
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      <AppInfoModal isOpen={showInfo} onClose={() => setShowInfo(false)} />
    </>
  )
}
