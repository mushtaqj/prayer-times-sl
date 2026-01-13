import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { PushNotificationProvider, usePushNotificationContext } from './PushNotificationContext'
import { LocationProvider } from './LocationContext'

// Mock usePushNotifications hook
vi.mock('@/hooks/usePushNotifications', () => ({
  usePushNotifications: vi.fn(() => ({
    state: {
      isSupported: true,
      permission: 'default',
      isEnabled: false,
      notificationDistrict: null,
      notificationZone: null,
    },
    isLoading: false,
    error: null,
    enable: vi.fn(() => Promise.resolve(true)),
    disable: vi.fn(() => Promise.resolve(true)),
    changeZone: vi.fn(() => Promise.resolve(true)),
    showLocationPrompt: false,
    promptDistrictId: null,
    dismissPrompt: vi.fn(),
    acceptPromptChange: vi.fn(() => Promise.resolve(true)),
    isIOS: false,
    isIOSInstalled: false,
  })),
}))

// Mock storage
vi.mock('@/lib/utils/storage', () => ({
  getStorageString: vi.fn(() => 'colombo'),
  setStorageString: vi.fn(() => true),
}))

// Mock notification components
vi.mock('@/components/notifications', () => ({
  NotificationEnableModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="enable-modal">Enable Modal</div> : null,
  LocationChangePrompt: () => <div data-testid="location-prompt">Location Prompt</div>,
}))

import { usePushNotifications } from '@/hooks/usePushNotifications'

describe('PushNotificationContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <LocationProvider>
      <PushNotificationProvider>{children}</PushNotificationProvider>
    </LocationProvider>
  )

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('PushNotificationProvider', () => {
    it('provides push notification state', async () => {
      const { result } = renderHook(() => usePushNotificationContext(), { wrapper })

      expect(result.current.isSupported).toBe(true)
      expect(result.current.isEnabled).toBe(false)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('provides notification district and zone', async () => {
      vi.mocked(usePushNotifications).mockReturnValue({
        state: {
          isSupported: true,
          permission: 'granted',
          isEnabled: true,
          notificationDistrict: 'colombo',
          notificationZone: '01',
        },
        isLoading: false,
        error: null,
        enable: vi.fn(),
        disable: vi.fn(),
        changeZone: vi.fn(),
        showLocationPrompt: false,
        promptDistrictId: null,
        dismissPrompt: vi.fn(),
        acceptPromptChange: vi.fn(),
        isIOS: false,
        isIOSInstalled: false,
      })

      const { result } = renderHook(() => usePushNotificationContext(), { wrapper })

      expect(result.current.isEnabled).toBe(true)
      expect(result.current.notificationDistrict).toBe('colombo')
      expect(result.current.notificationZone).toBe('01')
    })

    it('provides openEnableModal function', async () => {
      const { result } = renderHook(() => usePushNotificationContext(), { wrapper })

      expect(typeof result.current.openEnableModal).toBe('function')
    })

    it('provides disable function', async () => {
      const mockDisable = vi.fn(() => Promise.resolve(true))
      vi.mocked(usePushNotifications).mockReturnValue({
        state: {
          isSupported: true,
          permission: 'granted',
          isEnabled: true,
          notificationDistrict: 'colombo',
          notificationZone: '01',
        },
        isLoading: false,
        error: null,
        enable: vi.fn(),
        disable: mockDisable,
        changeZone: vi.fn(),
        showLocationPrompt: false,
        promptDistrictId: null,
        dismissPrompt: vi.fn(),
        acceptPromptChange: vi.fn(),
        isIOS: false,
        isIOSInstalled: false,
      })

      const { result } = renderHook(() => usePushNotificationContext(), { wrapper })

      await act(async () => {
        await result.current.disable()
      })

      expect(mockDisable).toHaveBeenCalled()
    })

    it('provides location prompt state', async () => {
      vi.mocked(usePushNotifications).mockReturnValue({
        state: {
          isSupported: true,
          permission: 'granted',
          isEnabled: true,
          notificationDistrict: 'colombo',
          notificationZone: '01',
        },
        isLoading: false,
        error: null,
        enable: vi.fn(),
        disable: vi.fn(),
        changeZone: vi.fn(),
        showLocationPrompt: true,
        promptDistrictId: 'kandy',
        dismissPrompt: vi.fn(),
        acceptPromptChange: vi.fn(),
        isIOS: false,
        isIOSInstalled: false,
      })

      const { result } = renderHook(() => usePushNotificationContext(), { wrapper })

      expect(result.current.showLocationPrompt).toBe(true)
      expect(result.current.promptDistrictId).toBe('kandy')
    })

    it('provides iOS detection state', async () => {
      vi.mocked(usePushNotifications).mockReturnValue({
        state: {
          isSupported: true,
          permission: 'default',
          isEnabled: false,
          notificationDistrict: null,
          notificationZone: null,
        },
        isLoading: false,
        error: null,
        enable: vi.fn(),
        disable: vi.fn(),
        changeZone: vi.fn(),
        showLocationPrompt: false,
        promptDistrictId: null,
        dismissPrompt: vi.fn(),
        acceptPromptChange: vi.fn(),
        isIOS: true,
        isIOSInstalled: false,
      })

      const { result } = renderHook(() => usePushNotificationContext(), { wrapper })

      expect(result.current.isIOS).toBe(true)
      expect(result.current.isIOSInstalled).toBe(false)
    })
  })

  describe('usePushNotificationContext', () => {
    it('throws error when used outside provider', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        renderHook(() => usePushNotificationContext())
      }).toThrow('usePushNotificationContext must be used within a PushNotificationProvider')

      consoleSpy.mockRestore()
    })
  })
})
