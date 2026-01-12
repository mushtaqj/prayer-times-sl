import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTheme } from './useTheme'

// Shared store for localStorage mock
let mockStore: Record<string, string> = {}

// Mock localStorage with shared store
const localStorageMock = {
  getItem: vi.fn((key: string) => mockStore[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    mockStore[key] = value
  }),
  removeItem: vi.fn((key: string) => {
    delete mockStore[key]
  }),
  clear: vi.fn(() => {
    mockStore = {}
  }),
}

// Mock matchMedia
const matchMediaMock = vi.fn()

describe('useTheme', () => {
  beforeEach(() => {
    // Clear the store
    mockStore = {}

    // Reset mock call counts but keep implementations
    vi.clearAllMocks()

    // Restore getItem implementation (in case it was overridden with mockReturnValue)
    localStorageMock.getItem.mockImplementation((key: string) => mockStore[key] ?? null)

    // Setup localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    })

    // Setup matchMedia mock - default to light mode
    matchMediaMock.mockReturnValue({ matches: false })
    Object.defineProperty(window, 'matchMedia', {
      value: matchMediaMock,
      writable: true,
    })

    // Reset document classes
    document.documentElement.classList.remove('dark')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('defaults to light theme when no saved preference and system prefers light', () => {
      matchMediaMock.mockReturnValue({ matches: false })

      const { result } = renderHook(() => useTheme())

      expect(result.current.isDark).toBe(false)
    })

    it('uses system dark preference when no saved theme', () => {
      matchMediaMock.mockReturnValue({ matches: true })

      const { result } = renderHook(() => useTheme())

      expect(result.current.isDark).toBe(true)
      expect(matchMediaMock).toHaveBeenCalledWith('(prefers-color-scheme: dark)')
    })

    it('uses saved dark theme from localStorage', () => {
      mockStore['theme'] = 'dark'

      const { result } = renderHook(() => useTheme())

      expect(result.current.isDark).toBe(true)
      expect(localStorageMock.getItem).toHaveBeenCalledWith('theme')
    })

    it('uses saved light theme from localStorage', () => {
      mockStore['theme'] = 'light'

      const { result } = renderHook(() => useTheme())

      expect(result.current.isDark).toBe(false)
    })

    it('saved preference overrides system preference', () => {
      mockStore['theme'] = 'light'
      matchMediaMock.mockReturnValue({ matches: true }) // System prefers dark

      const { result } = renderHook(() => useTheme())

      expect(result.current.isDark).toBe(false)
    })
  })

  describe('toggleTheme', () => {
    it('toggles from light to dark', () => {
      const { result } = renderHook(() => useTheme())

      expect(result.current.isDark).toBe(false)

      act(() => {
        result.current.toggleTheme()
      })

      expect(result.current.isDark).toBe(true)
    })

    it('toggles from dark to light', () => {
      mockStore['theme'] = 'dark'

      const { result } = renderHook(() => useTheme())

      expect(result.current.isDark).toBe(true)

      act(() => {
        result.current.toggleTheme()
      })

      expect(result.current.isDark).toBe(false)
    })

    it('can toggle multiple times', () => {
      const { result } = renderHook(() => useTheme())

      expect(result.current.isDark).toBe(false)

      act(() => {
        result.current.toggleTheme()
      })
      expect(result.current.isDark).toBe(true)

      act(() => {
        result.current.toggleTheme()
      })
      expect(result.current.isDark).toBe(false)

      act(() => {
        result.current.toggleTheme()
      })
      expect(result.current.isDark).toBe(true)
    })
  })

  describe('DOM updates', () => {
    it('adds dark class to document when dark mode', () => {
      mockStore['theme'] = 'dark'

      renderHook(() => useTheme())

      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('removes dark class from document when light mode', () => {
      document.documentElement.classList.add('dark')
      mockStore['theme'] = 'light'

      renderHook(() => useTheme())

      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })

    it('updates DOM class when toggling', () => {
      const { result } = renderHook(() => useTheme())

      expect(document.documentElement.classList.contains('dark')).toBe(false)

      act(() => {
        result.current.toggleTheme()
      })

      expect(document.documentElement.classList.contains('dark')).toBe(true)

      act(() => {
        result.current.toggleTheme()
      })

      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })
  })

  describe('localStorage persistence', () => {
    it('saves dark theme to localStorage', () => {
      const { result } = renderHook(() => useTheme())

      act(() => {
        result.current.toggleTheme()
      })

      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark')
    })

    it('saves light theme to localStorage', () => {
      mockStore['theme'] = 'dark'

      const { result } = renderHook(() => useTheme())

      act(() => {
        result.current.toggleTheme()
      })

      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light')
    })

    it('persists theme on initial render', () => {
      mockStore['theme'] = 'dark'

      renderHook(() => useTheme())

      // Effect runs on mount and saves the current state
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark')
    })
  })

  describe('return value stability', () => {
    it('returns consistent object shape', () => {
      const { result } = renderHook(() => useTheme())

      expect(result.current).toHaveProperty('isDark')
      expect(result.current).toHaveProperty('toggleTheme')
      expect(typeof result.current.isDark).toBe('boolean')
      expect(typeof result.current.toggleTheme).toBe('function')
    })
  })
})
