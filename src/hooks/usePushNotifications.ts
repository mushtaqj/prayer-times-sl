import { useState, useEffect, useCallback, useRef } from 'react'
import {
  isPushSupported,
  getNotificationPermission,
  enablePushNotifications,
  disablePushNotifications,
  changeNotificationZone,
  getPushSettings,
  shouldShowLocationChangePrompt,
  setupForegroundMessaging,
} from '@/lib/firebase/messaging'
import { getDistrictById } from '@/lib/data/prayerTimes'

interface PushNotificationState {
  isSupported: boolean
  permission: NotificationPermission | 'unsupported'
  isEnabled: boolean
  notificationDistrict: string | null
  notificationZone: string | null
}

interface UsePushNotificationsReturn {
  // State
  state: PushNotificationState
  isLoading: boolean
  error: string | null

  // Actions
  enable: (districtId: string) => Promise<boolean>
  disable: () => Promise<boolean>
  changeZone: (newDistrictId: string) => Promise<boolean>

  // Location change prompt
  showLocationPrompt: boolean
  promptDistrictId: string | null
  dismissPrompt: () => void
  acceptPromptChange: () => Promise<boolean>

  // iOS detection
  isIOS: boolean
  isIOSInstalled: boolean
}

/**
 * Hook for managing push notifications
 */
export function usePushNotifications(
  currentDistrictId: string | null
): UsePushNotificationsReturn {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    permission: 'unsupported',
    isEnabled: false,
    notificationDistrict: null,
    notificationZone: null,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Track dismissed zones for location change prompt
  const [dismissedZones, setDismissedZones] = useState<Set<string>>(new Set())
  const [promptDistrictId, setPromptDistrictId] = useState<string | null>(null)

  // Track if foreground messaging is set up
  const foregroundUnsubscribeRef = useRef<(() => void) | null>(null)

  // iOS detection
  const isIOS =
    typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as unknown as { MSStream?: unknown }).MSStream

  const isIOSInstalled =
    isIOS &&
    typeof window !== 'undefined' &&
    (window.navigator as unknown as { standalone?: boolean }).standalone === true

  // Initialize state on mount
  useEffect(() => {
    async function init() {
      const supported = await isPushSupported()
      const permission = getNotificationPermission()
      const settings = getPushSettings()

      setState({
        isSupported: supported,
        permission,
        isEnabled: settings.enabled,
        notificationDistrict: settings.district,
        notificationZone: settings.zone,
      })

      // Set up foreground messaging if enabled
      if (settings.enabled && supported) {
        const unsubscribe = await setupForegroundMessaging((payload) => {
          console.log('Foreground notification received:', payload)
          // The notification will be shown by the browser automatically
          // We can add custom handling here if needed (e.g., update UI)
        })
        foregroundUnsubscribeRef.current = unsubscribe
      }
    }

    init()

    return () => {
      if (foregroundUnsubscribeRef.current) {
        foregroundUnsubscribeRef.current()
      }
    }
  }, [])

  // Check for location change prompt when currentDistrictId changes
  useEffect(() => {
    if (!currentDistrictId || !state.isEnabled || !state.notificationZone) {
      setPromptDistrictId(null)
      return
    }

    const currentDistrict = getDistrictById(currentDistrictId)
    if (!currentDistrict) {
      setPromptDistrictId(null)
      return
    }

    const shouldShow = shouldShowLocationChangePrompt(
      currentDistrict.zone,
      dismissedZones
    )

    if (shouldShow) {
      setPromptDistrictId(currentDistrictId)
    } else {
      setPromptDistrictId(null)
    }
  }, [currentDistrictId, state.isEnabled, state.notificationZone, dismissedZones])

  const enable = useCallback(async (districtId: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const district = getDistrictById(districtId)
      if (!district) {
        setError('Invalid district')
        return false
      }

      const result = await enablePushNotifications(districtId, district.zone)

      if (result.success) {
        setState((prev) => ({
          ...prev,
          permission: 'granted',
          isEnabled: true,
          notificationDistrict: districtId,
          notificationZone: district.zone,
        }))

        // Set up foreground messaging
        const unsubscribe = await setupForegroundMessaging((payload) => {
          console.log('Foreground notification received:', payload)
        })
        foregroundUnsubscribeRef.current = unsubscribe

        return true
      } else {
        setError(result.error || 'Failed to enable notifications')
        return false
      }
    } catch {
      setError('Failed to enable notifications')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const disable = useCallback(async (): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      await disablePushNotifications()

      // Clean up foreground messaging
      if (foregroundUnsubscribeRef.current) {
        foregroundUnsubscribeRef.current()
        foregroundUnsubscribeRef.current = null
      }

      setState((prev) => ({
        ...prev,
        isEnabled: false,
        notificationDistrict: null,
        notificationZone: null,
      }))

      return true
    } catch {
      setError('Failed to disable notifications')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const changeZone = useCallback(async (newDistrictId: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const district = getDistrictById(newDistrictId)
      if (!district) {
        setError('Invalid district')
        return false
      }

      const result = await changeNotificationZone(newDistrictId, district.zone)

      if (result.success) {
        setState((prev) => ({
          ...prev,
          notificationDistrict: newDistrictId,
          notificationZone: district.zone,
        }))
        return true
      } else {
        setError(result.error || 'Failed to change notification zone')
        return false
      }
    } catch {
      setError('Failed to change notification zone')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const dismissPrompt = useCallback(() => {
    if (promptDistrictId) {
      const district = getDistrictById(promptDistrictId)
      if (district) {
        setDismissedZones((prev) => new Set(prev).add(district.zone))
      }
    }
    setPromptDistrictId(null)
  }, [promptDistrictId])

  const acceptPromptChange = useCallback(async (): Promise<boolean> => {
    if (!promptDistrictId) return false

    const success = await changeZone(promptDistrictId)
    if (success) {
      setPromptDistrictId(null)
    }
    return success
  }, [promptDistrictId, changeZone])

  return {
    state,
    isLoading,
    error,
    enable,
    disable,
    changeZone,
    showLocationPrompt: promptDistrictId !== null,
    promptDistrictId,
    dismissPrompt,
    acceptPromptChange,
    isIOS,
    isIOSInstalled,
  }
}
