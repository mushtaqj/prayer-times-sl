import { useState, useCallback } from 'react'

// District coordinates (approximate centers)
const districtCoordinates = {
  colombo: { lat: 6.9271, lng: 79.8612 },
  gampaha: { lat: 7.0917, lng: 80.0000 },
  kalutara: { lat: 6.5854, lng: 79.9607 },
}

type DistrictId = keyof typeof districtCoordinates

interface UseLocationReturn {
  detectLocation: () => Promise<DistrictId | null>
  isDetecting: boolean
  error: string | null
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  // Haversine formula for distance between two points
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function findNearestDistrict(lat: number, lng: number): DistrictId {
  let nearestDistrict: DistrictId = 'colombo'
  let minDistance = Infinity

  for (const [district, coords] of Object.entries(districtCoordinates)) {
    const distance = calculateDistance(lat, lng, coords.lat, coords.lng)
    if (distance < minDistance) {
      minDistance = distance
      nearestDistrict = district as DistrictId
    }
  }

  return nearestDistrict
}

export function useLocation(): UseLocationReturn {
  const [isDetecting, setIsDetecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const detectLocation = useCallback(async (): Promise<DistrictId | null> => {
    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported by your browser')
      return null
    }

    setIsDetecting(true)
    setError(null)

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes cache
        })
      })

      const { latitude, longitude } = position.coords
      const nearestDistrict = findNearestDistrict(latitude, longitude)

      setIsDetecting(false)
      return nearestDistrict
    } catch (err) {
      setIsDetecting(false)

      if (err instanceof GeolocationPositionError) {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Location permission denied')
            break
          case err.POSITION_UNAVAILABLE:
            setError('Location unavailable')
            break
          case err.TIMEOUT:
            setError('Location request timed out')
            break
          default:
            setError('Failed to get location')
        }
      } else {
        setError('Failed to get location')
      }

      return null
    }
  }, [])

  return {
    detectLocation,
    isDetecting,
    error,
  }
}
