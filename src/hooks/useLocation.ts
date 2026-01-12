import { useState, useCallback } from 'react'

// District coordinates (approximate centers) for all 26 districts
const districtCoordinates = {
  // Zone 01
  colombo: { lat: 6.9271, lng: 79.8612 },
  gampaha: { lat: 7.0917, lng: 80.0000 },
  kalutara: { lat: 6.5854, lng: 79.9607 },
  // Zone 02
  jaffna: { lat: 9.6615, lng: 80.0255 },
  nallur: { lat: 9.6781, lng: 80.0268 },
  // Zone 03
  mullaitivu: { lat: 9.2671, lng: 80.8142 },
  kilinochchi: { lat: 9.3803, lng: 80.3770 },
  vavuniya: { lat: 8.7514, lng: 80.4971 },
  // Zone 04
  mannar: { lat: 8.9810, lng: 79.9044 },
  puttalam: { lat: 8.0362, lng: 79.8283 },
  // Zone 05
  anuradhapura: { lat: 8.3114, lng: 80.4037 },
  polonnaruwa: { lat: 7.9403, lng: 81.0188 },
  // Zone 06
  kurunegala: { lat: 7.4863, lng: 80.3647 },
  // Zone 07
  kandy: { lat: 7.2906, lng: 80.6337 },
  matale: { lat: 7.4675, lng: 80.6234 },
  'nuwara-eliya': { lat: 6.9497, lng: 80.7891 },
  // Zone 08
  batticaloa: { lat: 7.7310, lng: 81.6747 },
  ampara: { lat: 7.2970, lng: 81.6720 },
  // Zone 09
  trincomalee: { lat: 8.5874, lng: 81.2152 },
  // Zone 10
  badulla: { lat: 6.9934, lng: 81.0550 },
  monaragala: { lat: 6.8728, lng: 81.3507 },
  // Zone 11
  ratnapura: { lat: 6.6828, lng: 80.3992 },
  kegalle: { lat: 7.2513, lng: 80.3464 },
  // Zone 12
  galle: { lat: 6.0535, lng: 80.2210 },
  matara: { lat: 5.9549, lng: 80.5550 },
  // Zone 13
  hambantota: { lat: 6.1241, lng: 81.1185 },
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
    if (!navigator.geolocation) {
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
