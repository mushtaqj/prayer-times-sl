import { useState, useCallback } from 'react'
import { findNearestDistrict } from '@/lib/data/prayerTimes'
import { GEOLOCATION_OPTIONS } from '@/lib/utils/geo'

interface UseLocationReturn {
  detectLocation: () => Promise<string | null>
  isDetecting: boolean
  error: string | null
}

export function useLocation(): UseLocationReturn {
  const [isDetecting, setIsDetecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const detectLocation = useCallback(async (): Promise<string | null> => {
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
          timeout: GEOLOCATION_OPTIONS.TIMEOUT_MS,
          maximumAge: GEOLOCATION_OPTIONS.MAX_AGE_MS,
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
