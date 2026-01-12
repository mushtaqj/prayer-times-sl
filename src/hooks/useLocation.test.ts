import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLocation } from './useLocation'

// Define GeolocationPositionError for jsdom environment
class MockGeolocationPositionError extends Error {
  code: number
  readonly PERMISSION_DENIED = 1
  readonly POSITION_UNAVAILABLE = 2
  readonly TIMEOUT = 3

  constructor(code: number, message: string) {
    super(message)
    this.code = code
    this.name = 'GeolocationPositionError'
  }
}

// Add to global scope
;(global as unknown as { GeolocationPositionError: typeof MockGeolocationPositionError }).GeolocationPositionError = MockGeolocationPositionError

describe('useLocation', () => {
  // Store original geolocation
  const originalGeolocation = navigator.geolocation

  // Create fresh mock for each test
  let mockGetCurrentPosition: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()

    // Create fresh mock
    mockGetCurrentPosition = vi.fn()

    // Setup geolocation mock
    Object.defineProperty(navigator, 'geolocation', {
      value: {
        getCurrentPosition: mockGetCurrentPosition,
      },
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    // Restore original geolocation
    Object.defineProperty(navigator, 'geolocation', {
      value: originalGeolocation,
      writable: true,
      configurable: true,
    })
  })

  describe('initial state', () => {
    it('returns initial state with false isDetecting', () => {
      const { result } = renderHook(() => useLocation())

      expect(result.current.isDetecting).toBe(false)
      expect(result.current.error).toBeNull()
      expect(typeof result.current.detectLocation).toBe('function')
    })
  })

  describe('detectLocation', () => {
    it('returns nearest district for Colombo coordinates', async () => {
      mockGetCurrentPosition.mockImplementation((success) => {
        success({
          coords: {
            latitude: 6.9271,
            longitude: 79.8612,
          },
        })
      })

      const { result } = renderHook(() => useLocation())

      let district: string | null = null
      await act(async () => {
        district = await result.current.detectLocation()
      })

      expect(district).toBe('colombo')
    })

    it('returns nearest district for Kandy coordinates', async () => {
      mockGetCurrentPosition.mockImplementation((success) => {
        success({
          coords: {
            latitude: 7.2906,
            longitude: 80.6337,
          },
        })
      })

      const { result } = renderHook(() => useLocation())

      let district: string | null = null
      await act(async () => {
        district = await result.current.detectLocation()
      })

      expect(district).toBe('kandy')
    })

    it('returns nearest district for Jaffna coordinates', async () => {
      mockGetCurrentPosition.mockImplementation((success) => {
        success({
          coords: {
            latitude: 9.6615,
            longitude: 80.0255,
          },
        })
      })

      const { result } = renderHook(() => useLocation())

      let district: string | null = null
      await act(async () => {
        district = await result.current.detectLocation()
      })

      expect(district).toBe('jaffna')
    })

    it('finds nearest district when coordinates are between districts', async () => {
      // Coordinates roughly between Colombo and Gampaha
      mockGetCurrentPosition.mockImplementation((success) => {
        success({
          coords: {
            latitude: 7.01,
            longitude: 79.93,
          },
        })
      })

      const { result } = renderHook(() => useLocation())

      let district: string | null = null
      await act(async () => {
        district = await result.current.detectLocation()
      })

      // Should be one of the nearby districts
      expect(['colombo', 'gampaha']).toContain(district)
    })

    it('sets isDetecting to false after successful detection', async () => {
      mockGetCurrentPosition.mockImplementation((success) => {
        success({
          coords: {
            latitude: 6.9271,
            longitude: 79.8612,
          },
        })
      })

      const { result } = renderHook(() => useLocation())

      await act(async () => {
        await result.current.detectLocation()
      })

      expect(result.current.isDetecting).toBe(false)
    })

    it('clears previous error on new detection', async () => {
      // First call fails
      mockGetCurrentPosition.mockImplementationOnce((_, error) => {
        const err = new MockGeolocationPositionError(1, 'Permission denied')
        error(err)
      })

      const { result } = renderHook(() => useLocation())

      await act(async () => {
        await result.current.detectLocation()
      })

      expect(result.current.error).not.toBeNull()

      // Second call succeeds
      mockGetCurrentPosition.mockImplementationOnce((success) => {
        success({
          coords: {
            latitude: 6.9271,
            longitude: 79.8612,
          },
        })
      })

      await act(async () => {
        await result.current.detectLocation()
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('error handling', () => {
    it('returns null and sets error when geolocation not supported', async () => {
      // Remove geolocation for this specific test
      Object.defineProperty(navigator, 'geolocation', {
        value: undefined,
        writable: true,
        configurable: true,
      })

      const { result } = renderHook(() => useLocation())

      let district: string | null = null
      await act(async () => {
        district = await result.current.detectLocation()
      })

      expect(district).toBeNull()
      expect(result.current.error).toBe('Geolocation is not supported by your browser')
    })

    it('handles permission denied error', async () => {
      mockGetCurrentPosition.mockImplementation((_, error) => {
        const err = new MockGeolocationPositionError(1, 'Permission denied')
        error(err)
      })

      const { result } = renderHook(() => useLocation())

      let district: string | null = null
      await act(async () => {
        district = await result.current.detectLocation()
      })

      expect(district).toBeNull()
      expect(result.current.error).toBe('Location permission denied')
    })

    it('handles position unavailable error', async () => {
      mockGetCurrentPosition.mockImplementation((_, error) => {
        const err = new MockGeolocationPositionError(2, 'Position unavailable')
        error(err)
      })

      const { result } = renderHook(() => useLocation())

      let district: string | null = null
      await act(async () => {
        district = await result.current.detectLocation()
      })

      expect(district).toBeNull()
      expect(result.current.error).toBe('Location unavailable')
    })

    it('handles timeout error', async () => {
      mockGetCurrentPosition.mockImplementation((_, error) => {
        const err = new MockGeolocationPositionError(3, 'Timeout')
        error(err)
      })

      const { result } = renderHook(() => useLocation())

      let district: string | null = null
      await act(async () => {
        district = await result.current.detectLocation()
      })

      expect(district).toBeNull()
      expect(result.current.error).toBe('Location request timed out')
    })

    it('handles generic error', async () => {
      mockGetCurrentPosition.mockImplementation(() => {
        throw new Error('Some other error')
      })

      const { result } = renderHook(() => useLocation())

      let district: string | null = null
      await act(async () => {
        district = await result.current.detectLocation()
      })

      expect(district).toBeNull()
      expect(result.current.error).toBe('Failed to get location')
    })

    it('sets isDetecting to false after error', async () => {
      mockGetCurrentPosition.mockImplementation((_, error) => {
        const err = new MockGeolocationPositionError(1, 'Permission denied')
        error(err)
      })

      const { result } = renderHook(() => useLocation())

      await act(async () => {
        await result.current.detectLocation()
      })

      expect(result.current.isDetecting).toBe(false)
    })
  })

  describe('geolocation options', () => {
    it('calls getCurrentPosition with correct options', async () => {
      mockGetCurrentPosition.mockImplementation((success) => {
        success({
          coords: {
            latitude: 6.9271,
            longitude: 79.8612,
          },
        })
      })

      const { result } = renderHook(() => useLocation())

      await act(async () => {
        await result.current.detectLocation()
      })

      expect(mockGetCurrentPosition).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000,
        }
      )
    })
  })

  describe('return value stability', () => {
    it('detectLocation function is stable across re-renders', () => {
      const { result, rerender } = renderHook(() => useLocation())

      const firstDetectLocation = result.current.detectLocation

      rerender()

      expect(result.current.detectLocation).toBe(firstDetectLocation)
    })
  })
})
