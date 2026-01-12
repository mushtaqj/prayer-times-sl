import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { getStorageString, setStorageString } from '@/lib/utils/storage'
import { districts as allDistricts } from '@/lib/data/prayerTimes'
import type { District } from '@/lib/data/types'

interface LocationContextValue {
  districts: District[]
  selectedDistrict: string
  setSelectedDistrict: (district: string) => void
  locationName: string
}

const LocationContext = createContext<LocationContextValue | null>(null)

interface LocationProviderProps {
  children: ReactNode
}

export function LocationProvider({ children }: LocationProviderProps) {
  const [selectedDistrict, setSelectedDistrictState] = useState(() => {
    return getStorageString('selectedDistrict', 'colombo')
  })

  useEffect(() => {
    setStorageString('selectedDistrict', selectedDistrict)
  }, [selectedDistrict])

  const locationName =
    allDistricts.find((d) => d.id === selectedDistrict)?.name || 'Colombo'

  const setSelectedDistrict = (district: string) => {
    setSelectedDistrictState(district)
  }

  return (
    <LocationContext.Provider
      value={{
        districts: allDistricts,
        selectedDistrict,
        setSelectedDistrict,
        locationName,
      }}
    >
      {children}
    </LocationContext.Provider>
  )
}

export function useLocationContext(): LocationContextValue {
  const context = useContext(LocationContext)
  if (!context) {
    throw new Error('useLocationContext must be used within a LocationProvider')
  }
  return context
}
