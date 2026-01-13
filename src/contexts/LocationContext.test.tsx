import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { LocationProvider, useLocationContext } from './LocationContext'

// Mock storage utilities
vi.mock('@/lib/utils/storage', () => ({
  getStorageString: vi.fn((_key: string, defaultValue: string) => defaultValue),
  setStorageString: vi.fn(() => true),
}))

import { getStorageString, setStorageString } from '@/lib/utils/storage'

describe('LocationContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('LocationProvider', () => {
    it('provides default district when no stored value', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LocationProvider>{children}</LocationProvider>
      )

      const { result } = renderHook(() => useLocationContext(), { wrapper })

      expect(result.current.selectedDistrict).toBe('colombo')
      expect(result.current.locationName).toBe('Colombo')
    })

    it('loads stored district from localStorage', () => {
      vi.mocked(getStorageString).mockReturnValue('kandy')

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LocationProvider>{children}</LocationProvider>
      )

      const { result } = renderHook(() => useLocationContext(), { wrapper })

      expect(result.current.selectedDistrict).toBe('kandy')
      expect(result.current.locationName).toBe('Kandy')
    })

    it('provides all districts', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LocationProvider>{children}</LocationProvider>
      )

      const { result } = renderHook(() => useLocationContext(), { wrapper })

      expect(result.current.districts.length).toBeGreaterThan(0)
      expect(result.current.districts.some(d => d.id === 'colombo')).toBe(true)
      expect(result.current.districts.some(d => d.id === 'kandy')).toBe(true)
    })

    it('updates selectedDistrict when setSelectedDistrict is called', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LocationProvider>{children}</LocationProvider>
      )

      const { result } = renderHook(() => useLocationContext(), { wrapper })

      act(() => {
        result.current.setSelectedDistrict('galle')
      })

      expect(result.current.selectedDistrict).toBe('galle')
      expect(result.current.locationName).toBe('Galle')
    })

    it('persists district to localStorage when changed', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LocationProvider>{children}</LocationProvider>
      )

      const { result } = renderHook(() => useLocationContext(), { wrapper })

      act(() => {
        result.current.setSelectedDistrict('jaffna')
      })

      expect(setStorageString).toHaveBeenCalledWith('selectedDistrict', 'jaffna')
    })

    it('returns fallback location name for unknown district', () => {
      vi.mocked(getStorageString).mockReturnValue('unknown-district')

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LocationProvider>{children}</LocationProvider>
      )

      const { result } = renderHook(() => useLocationContext(), { wrapper })

      expect(result.current.locationName).toBe('Colombo')
    })
  })

  describe('useLocationContext', () => {
    it('throws error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        renderHook(() => useLocationContext())
      }).toThrow('useLocationContext must be used within a LocationProvider')

      consoleSpy.mockRestore()
    })
  })

  describe('districts data', () => {
    it('each district has required properties', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LocationProvider>{children}</LocationProvider>
      )

      const { result } = renderHook(() => useLocationContext(), { wrapper })

      result.current.districts.forEach(district => {
        expect(district).toHaveProperty('id')
        expect(district).toHaveProperty('name')
        expect(district).toHaveProperty('zone')
        expect(typeof district.id).toBe('string')
        expect(typeof district.name).toBe('string')
        expect(typeof district.zone).toBe('string')
      })
    })

    it('districts have unique IDs', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <LocationProvider>{children}</LocationProvider>
      )

      const { result } = renderHook(() => useLocationContext(), { wrapper })

      const ids = result.current.districts.map(d => d.id)
      const uniqueIds = new Set(ids)

      expect(uniqueIds.size).toBe(ids.length)
    })
  })
})
