import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { usePushNotifications } from './usePushNotifications'

// Mock firebase messaging module
vi.mock('@/lib/firebase/messaging', () => ({
  isPushSupported: vi.fn(() => Promise.resolve(true)),
  getNotificationPermission: vi.fn(() => 'default'),
  enablePushNotifications: vi.fn(() => Promise.resolve({ success: true })),
  disablePushNotifications: vi.fn(() => Promise.resolve(true)),
  changeNotificationZone: vi.fn(() => Promise.resolve({ success: true })),
  getPushSettings: vi.fn(() => ({
    enabled: false,
    district: null,
    zone: null,
  })),
  shouldShowLocationChangePrompt: vi.fn(() => false),
  setupForegroundMessaging: vi.fn(() => Promise.resolve(null)),
}))

// Mock prayerTimes data
vi.mock('@/lib/data/prayerTimes', () => ({
  getDistrictById: vi.fn((id: string) => {
    const districts: Record<string, { id: string; name: string; zone: string }> = {
      colombo: { id: 'colombo', name: 'Colombo', zone: '01' },
      kandy: { id: 'kandy', name: 'Kandy', zone: '07' },
      galle: { id: 'galle', name: 'Galle', zone: '12' },
    }
    return districts[id] || undefined
  }),
}))

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

describe('usePushNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Reset mocks to default values
    vi.mocked(isPushSupported).mockResolvedValue(true)
    vi.mocked(getNotificationPermission).mockReturnValue('default')
    vi.mocked(getPushSettings).mockReturnValue({
      enabled: false,
      district: null,
      zone: null,
    })
    vi.mocked(shouldShowLocationChangePrompt).mockReturnValue(false)
    vi.mocked(setupForegroundMessaging).mockResolvedValue(null)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('initial state', () => {
    it('initializes with default state', async () => {
      const { result } = renderHook(() => usePushNotifications('colombo'))

      await waitFor(() => {
        expect(result.current.state.isSupported).toBe(true)
      })

      expect(result.current.state.isEnabled).toBe(false)
      expect(result.current.state.notificationDistrict).toBeNull()
      expect(result.current.state.notificationZone).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('loads saved settings on mount', async () => {
      vi.mocked(getPushSettings).mockReturnValue({
        enabled: true,
        district: 'colombo',
        zone: '01',
      })

      const { result } = renderHook(() => usePushNotifications('colombo'))

      await waitFor(() => {
        expect(result.current.state.isEnabled).toBe(true)
      })

      expect(result.current.state.notificationDistrict).toBe('colombo')
      expect(result.current.state.notificationZone).toBe('01')
    })

    it('detects when push is not supported', async () => {
      vi.mocked(isPushSupported).mockResolvedValue(false)

      const { result } = renderHook(() => usePushNotifications('colombo'))

      await waitFor(() => {
        expect(result.current.state.isSupported).toBe(false)
      })
    })
  })

  describe('enable', () => {
    it('enables push notifications successfully', async () => {
      vi.mocked(enablePushNotifications).mockResolvedValue({ success: true })

      const { result } = renderHook(() => usePushNotifications('colombo'))

      await waitFor(() => {
        expect(result.current.state.isSupported).toBe(true)
      })

      let success: boolean = false
      await act(async () => {
        success = await result.current.enable('colombo')
      })

      expect(success).toBe(true)
      expect(enablePushNotifications).toHaveBeenCalledWith('colombo', '01')
      expect(result.current.state.isEnabled).toBe(true)
      expect(result.current.state.notificationDistrict).toBe('colombo')
      expect(result.current.state.notificationZone).toBe('01')
    })

    it('handles enable failure', async () => {
      vi.mocked(enablePushNotifications).mockResolvedValue({
        success: false,
        error: 'Permission denied',
      })

      const { result } = renderHook(() => usePushNotifications('colombo'))

      await waitFor(() => {
        expect(result.current.state.isSupported).toBe(true)
      })

      let success: boolean = true
      await act(async () => {
        success = await result.current.enable('colombo')
      })

      expect(success).toBe(false)
      expect(result.current.error).toBe('Permission denied')
      expect(result.current.state.isEnabled).toBe(false)
    })

    it('returns false for invalid district', async () => {
      const { result } = renderHook(() => usePushNotifications('colombo'))

      await waitFor(() => {
        expect(result.current.state.isSupported).toBe(true)
      })

      let success: boolean = true
      await act(async () => {
        success = await result.current.enable('invalid-district')
      })

      expect(success).toBe(false)
      expect(result.current.error).toBe('Invalid district')
    })

    it('sets loading state during enable', async () => {
      let resolveEnable: (value: { success: boolean }) => void
      vi.mocked(enablePushNotifications).mockReturnValue(
        new Promise((resolve) => {
          resolveEnable = resolve
        })
      )

      const { result } = renderHook(() => usePushNotifications('colombo'))

      await waitFor(() => {
        expect(result.current.state.isSupported).toBe(true)
      })

      act(() => {
        result.current.enable('colombo')
      })

      expect(result.current.isLoading).toBe(true)

      await act(async () => {
        resolveEnable!({ success: true })
      })

      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('disable', () => {
    it('disables push notifications successfully', async () => {
      vi.mocked(getPushSettings).mockReturnValue({
        enabled: true,
        district: 'colombo',
        zone: '01',
      })
      vi.mocked(disablePushNotifications).mockResolvedValue(true)

      const { result } = renderHook(() => usePushNotifications('colombo'))

      await waitFor(() => {
        expect(result.current.state.isEnabled).toBe(true)
      })

      let success: boolean = false
      await act(async () => {
        success = await result.current.disable()
      })

      expect(success).toBe(true)
      expect(disablePushNotifications).toHaveBeenCalled()
      expect(result.current.state.isEnabled).toBe(false)
      expect(result.current.state.notificationDistrict).toBeNull()
      expect(result.current.state.notificationZone).toBeNull()
    })
  })

  describe('changeZone', () => {
    it('changes zone successfully', async () => {
      vi.mocked(getPushSettings).mockReturnValue({
        enabled: true,
        district: 'colombo',
        zone: '01',
      })
      vi.mocked(changeNotificationZone).mockResolvedValue({ success: true })

      const { result } = renderHook(() => usePushNotifications('colombo'))

      await waitFor(() => {
        expect(result.current.state.isEnabled).toBe(true)
      })

      let success: boolean = false
      await act(async () => {
        success = await result.current.changeZone('kandy')
      })

      expect(success).toBe(true)
      expect(changeNotificationZone).toHaveBeenCalledWith('kandy', '07')
      expect(result.current.state.notificationDistrict).toBe('kandy')
      expect(result.current.state.notificationZone).toBe('07')
    })

    it('handles zone change failure', async () => {
      vi.mocked(changeNotificationZone).mockResolvedValue({
        success: false,
        error: 'Network error',
      })

      const { result } = renderHook(() => usePushNotifications('colombo'))

      await waitFor(() => {
        expect(result.current.state.isSupported).toBe(true)
      })

      let success: boolean = true
      await act(async () => {
        success = await result.current.changeZone('kandy')
      })

      expect(success).toBe(false)
      expect(result.current.error).toBe('Network error')
    })
  })

  describe('location change prompt', () => {
    it('shows prompt when browsing different zone', async () => {
      vi.mocked(getPushSettings).mockReturnValue({
        enabled: true,
        district: 'colombo',
        zone: '01',
      })
      vi.mocked(shouldShowLocationChangePrompt).mockReturnValue(true)

      const { result } = renderHook(() => usePushNotifications('kandy'))

      await waitFor(() => {
        expect(result.current.showLocationPrompt).toBe(true)
      })

      expect(result.current.promptDistrictId).toBe('kandy')
    })

    it('does not show prompt when in same zone', async () => {
      vi.mocked(getPushSettings).mockReturnValue({
        enabled: true,
        district: 'colombo',
        zone: '01',
      })
      vi.mocked(shouldShowLocationChangePrompt).mockReturnValue(false)

      const { result } = renderHook(() => usePushNotifications('colombo'))

      await waitFor(() => {
        expect(result.current.state.isEnabled).toBe(true)
      })

      expect(result.current.showLocationPrompt).toBe(false)
    })

    it('dismissPrompt clears the prompt', async () => {
      vi.mocked(getPushSettings).mockReturnValue({
        enabled: true,
        district: 'colombo',
        zone: '01',
      })
      // Mock shouldShowLocationChangePrompt to respect dismissedZones
      vi.mocked(shouldShowLocationChangePrompt).mockImplementation(
        (zoneId: string, dismissed: Set<string>) => !dismissed.has(zoneId)
      )

      const { result } = renderHook(() => usePushNotifications('kandy'))

      await waitFor(() => {
        expect(result.current.showLocationPrompt).toBe(true)
      })

      act(() => {
        result.current.dismissPrompt()
      })

      await waitFor(() => {
        expect(result.current.showLocationPrompt).toBe(false)
      })
      expect(result.current.promptDistrictId).toBeNull()
    })

    it('acceptPromptChange changes zone and clears prompt', async () => {
      vi.mocked(getPushSettings).mockReturnValue({
        enabled: true,
        district: 'colombo',
        zone: '01',
      })
      vi.mocked(shouldShowLocationChangePrompt).mockReturnValue(true)
      vi.mocked(changeNotificationZone).mockResolvedValue({ success: true })

      const { result } = renderHook(() => usePushNotifications('kandy'))

      await waitFor(() => {
        expect(result.current.showLocationPrompt).toBe(true)
      })

      let success: boolean = false
      await act(async () => {
        success = await result.current.acceptPromptChange()
      })

      expect(success).toBe(true)
      expect(changeNotificationZone).toHaveBeenCalledWith('kandy', '07')
    })
  })

  describe('iOS detection', () => {
    it('detects non-iOS device', async () => {
      const { result } = renderHook(() => usePushNotifications('colombo'))

      await waitFor(() => {
        expect(result.current.state.isSupported).toBe(true)
      })

      // In jsdom environment, this should be false
      expect(result.current.isIOS).toBe(false)
    })
  })
})
