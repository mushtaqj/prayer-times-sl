import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  isPushSupported,
  getNotificationPermission,
  requestNotificationPermission,
  getPushSettings,
  shouldShowLocationChangePrompt,
} from './messaging'

// Mock firebase modules
vi.mock('firebase/messaging', () => ({
  getToken: vi.fn(),
  onMessage: vi.fn(),
}))

vi.mock('./config', () => ({
  getMessagingInstance: vi.fn(() => Promise.resolve({})),
  VAPID_KEY: 'test-vapid-key',
}))

describe('Firebase Messaging Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()

    // Mock window.Notification
    Object.defineProperty(window, 'Notification', {
      value: {
        permission: 'default',
        requestPermission: vi.fn(() => Promise.resolve('granted')),
      },
      writable: true,
      configurable: true,
    })

    // Mock navigator.serviceWorker
    Object.defineProperty(navigator, 'serviceWorker', {
      value: {},
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('isPushSupported', () => {
    it('returns true when all features are available', async () => {
      const result = await isPushSupported()
      expect(result).toBe(true)
    })

    it('returns false when Notification is not available', async () => {
      // Save original and delete to remove from 'in' check
      const originalNotification = window.Notification
      // @ts-expect-error - Deleting for test
      delete window.Notification

      const result = await isPushSupported()
      expect(result).toBe(false)

      // Restore
      window.Notification = originalNotification
    })

    it('returns false when serviceWorker is not available', async () => {
      // Save original and delete
      const originalServiceWorker = navigator.serviceWorker
      // @ts-expect-error - Deleting for test
      delete navigator.serviceWorker

      const result = await isPushSupported()
      expect(result).toBe(false)

      // Restore
      Object.defineProperty(navigator, 'serviceWorker', {
        value: originalServiceWorker,
        writable: true,
        configurable: true,
      })
    })
  })

  describe('getNotificationPermission', () => {
    it('returns current permission status', () => {
      Object.defineProperty(window.Notification, 'permission', {
        value: 'granted',
        writable: true,
      })

      const result = getNotificationPermission()
      expect(result).toBe('granted')
    })

    it('returns denied when permission is denied', () => {
      Object.defineProperty(window.Notification, 'permission', {
        value: 'denied',
        writable: true,
      })

      const result = getNotificationPermission()
      expect(result).toBe('denied')
    })

    it('returns unsupported when Notification is not available', () => {
      const originalNotification = window.Notification
      // @ts-expect-error - Deleting for test
      delete window.Notification

      const result = getNotificationPermission()
      expect(result).toBe('unsupported')

      // Restore
      window.Notification = originalNotification
    })
  })

  describe('requestNotificationPermission', () => {
    it('returns true when permission is granted', async () => {
      window.Notification.requestPermission = vi.fn(() =>
        Promise.resolve('granted' as NotificationPermission)
      )

      const result = await requestNotificationPermission()
      expect(result).toBe(true)
    })

    it('returns false when permission is denied', async () => {
      window.Notification.requestPermission = vi.fn(() =>
        Promise.resolve('denied' as NotificationPermission)
      )

      const result = await requestNotificationPermission()
      expect(result).toBe(false)
    })

    it('returns false when Notification is not available', async () => {
      const originalNotification = window.Notification
      // @ts-expect-error - Deleting for test
      delete window.Notification

      const result = await requestNotificationPermission()
      expect(result).toBe(false)

      // Restore
      window.Notification = originalNotification
    })
  })

  describe('getPushSettings', () => {
    it('returns default settings when nothing is stored', () => {
      const result = getPushSettings()

      expect(result).toEqual({
        enabled: false,
        district: null,
        zone: null,
      })
    })

    it('returns stored settings', () => {
      localStorage.setItem('pushEnabled', 'true')
      localStorage.setItem('notificationDistrict', 'colombo')
      localStorage.setItem('notificationZone', '01')

      const result = getPushSettings()

      expect(result).toEqual({
        enabled: true,
        district: 'colombo',
        zone: '01',
      })
    })

    it('returns enabled false when pushEnabled is not "true"', () => {
      localStorage.setItem('pushEnabled', 'false')

      const result = getPushSettings()

      expect(result.enabled).toBe(false)
    })
  })

  describe('shouldShowLocationChangePrompt', () => {
    it('returns false when push is not enabled', () => {
      const result = shouldShowLocationChangePrompt('07', new Set())
      expect(result).toBe(false)
    })

    it('returns false when no notification zone is set', () => {
      localStorage.setItem('pushEnabled', 'true')

      const result = shouldShowLocationChangePrompt('07', new Set())
      expect(result).toBe(false)
    })

    it('returns false when zones are the same', () => {
      localStorage.setItem('pushEnabled', 'true')
      localStorage.setItem('notificationZone', '07')

      const result = shouldShowLocationChangePrompt('07', new Set())
      expect(result).toBe(false)
    })

    it('returns true when zones are different', () => {
      localStorage.setItem('pushEnabled', 'true')
      localStorage.setItem('notificationZone', '01')

      const result = shouldShowLocationChangePrompt('07', new Set())
      expect(result).toBe(true)
    })

    it('returns false when zone has been dismissed', () => {
      localStorage.setItem('pushEnabled', 'true')
      localStorage.setItem('notificationZone', '01')

      const dismissed = new Set(['07'])
      const result = shouldShowLocationChangePrompt('07', dismissed)
      expect(result).toBe(false)
    })
  })
})
