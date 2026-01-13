import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { ThemeProvider, useThemeContext } from './ThemeContext'

// Mock the useTheme hook
vi.mock('@/hooks/useTheme', () => ({
  useTheme: vi.fn(() => ({
    isDark: false,
    toggleTheme: vi.fn(),
  })),
}))

import { useTheme } from '@/hooks/useTheme'

describe('ThemeContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('ThemeProvider', () => {
    it('provides isDark state from useTheme hook', () => {
      vi.mocked(useTheme).mockReturnValue({
        isDark: false,
        toggleTheme: vi.fn(),
      })

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      )

      const { result } = renderHook(() => useThemeContext(), { wrapper })

      expect(result.current.isDark).toBe(false)
    })

    it('provides dark mode when isDark is true', () => {
      vi.mocked(useTheme).mockReturnValue({
        isDark: true,
        toggleTheme: vi.fn(),
      })

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      )

      const { result } = renderHook(() => useThemeContext(), { wrapper })

      expect(result.current.isDark).toBe(true)
    })

    it('provides toggleTheme function', () => {
      const mockToggle = vi.fn()
      vi.mocked(useTheme).mockReturnValue({
        isDark: false,
        toggleTheme: mockToggle,
      })

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      )

      const { result } = renderHook(() => useThemeContext(), { wrapper })

      act(() => {
        result.current.toggleTheme()
      })

      expect(mockToggle).toHaveBeenCalledTimes(1)
    })

    it('toggleTheme updates theme state', () => {
      let currentIsDark = false
      const mockToggle = vi.fn(() => {
        currentIsDark = !currentIsDark
      })

      vi.mocked(useTheme).mockImplementation(() => ({
        isDark: currentIsDark,
        toggleTheme: mockToggle,
      }))

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      )

      const { result } = renderHook(() => useThemeContext(), { wrapper })

      expect(result.current.isDark).toBe(false)

      act(() => {
        result.current.toggleTheme()
      })

      expect(mockToggle).toHaveBeenCalled()
    })
  })

  describe('useThemeContext', () => {
    it('throws error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        renderHook(() => useThemeContext())
      }).toThrow('useThemeContext must be used within a ThemeProvider')

      consoleSpy.mockRestore()
    })
  })
})
