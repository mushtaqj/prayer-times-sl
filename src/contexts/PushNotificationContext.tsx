import { createContext, useContext, useState, type ReactNode } from 'react'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import { useLocationContext } from './LocationContext'
import { NotificationEnableModal, LocationChangePrompt } from '@/components/notifications'

interface PushNotificationContextValue {
  // State
  isSupported: boolean
  isEnabled: boolean
  isLoading: boolean
  error: string | null
  notificationDistrict: string | null
  notificationZone: string | null

  // Actions
  openEnableModal: () => void
  disable: () => Promise<boolean>

  // Location change prompt
  showLocationPrompt: boolean
  promptDistrictId: string | null

  // iOS detection
  isIOS: boolean
  isIOSInstalled: boolean
}

const PushNotificationContext = createContext<PushNotificationContextValue | null>(null)

interface PushNotificationProviderProps {
  children: ReactNode
}

export function PushNotificationProvider({ children }: PushNotificationProviderProps) {
  const { selectedDistrict } = useLocationContext()
  const [showEnableModal, setShowEnableModal] = useState(false)

  const pushNotifications = usePushNotifications(selectedDistrict)

  const handleEnable = async (districtId: string) => {
    const success = await pushNotifications.enable(districtId)
    return success
  }

  const openEnableModal = () => {
    setShowEnableModal(true)
  }

  const value: PushNotificationContextValue = {
    // State
    isSupported: pushNotifications.state.isSupported,
    isEnabled: pushNotifications.state.isEnabled,
    isLoading: pushNotifications.isLoading,
    error: pushNotifications.error,
    notificationDistrict: pushNotifications.state.notificationDistrict,
    notificationZone: pushNotifications.state.notificationZone,

    // Actions
    openEnableModal,
    disable: pushNotifications.disable,

    // Location change prompt
    showLocationPrompt: pushNotifications.showLocationPrompt,
    promptDistrictId: pushNotifications.promptDistrictId,

    // iOS detection
    isIOS: pushNotifications.isIOS,
    isIOSInstalled: pushNotifications.isIOSInstalled,
  }

  return (
    <PushNotificationContext.Provider value={value}>
      {children}

      {/* Notification Enable Modal */}
      <NotificationEnableModal
        isOpen={showEnableModal}
        onClose={() => setShowEnableModal(false)}
        onEnable={handleEnable}
        isLoading={pushNotifications.isLoading}
        error={pushNotifications.error}
        currentDistrictId={selectedDistrict}
        isIOS={pushNotifications.isIOS}
        isIOSInstalled={pushNotifications.isIOSInstalled}
      />

      {/* Location Change Prompt - rendered at top level */}
      {pushNotifications.showLocationPrompt && pushNotifications.promptDistrictId && (
        <div className="fixed top-[calc(48px+env(safe-area-inset-top)+8px)] sm:top-[68px] left-4 right-4 z-50 max-w-md mx-auto">
          <LocationChangePrompt
            promptDistrictId={pushNotifications.promptDistrictId}
            currentNotificationDistrict={pushNotifications.state.notificationDistrict}
            onAccept={pushNotifications.acceptPromptChange}
            onDismiss={pushNotifications.dismissPrompt}
            isLoading={pushNotifications.isLoading}
          />
        </div>
      )}
    </PushNotificationContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePushNotificationContext(): PushNotificationContextValue {
  const context = useContext(PushNotificationContext)
  if (!context) {
    throw new Error('usePushNotificationContext must be used within a PushNotificationProvider')
  }
  return context
}
