/**
 * Geographic utilities
 * Functions for distance calculations and location operations
 */

// ============================================================================
// Constants
// ============================================================================

/** Earth's radius in kilometers */
export const EARTH_RADIUS_KM = 6371

/** Geolocation options */
export const GEOLOCATION_OPTIONS = {
  /** Timeout for geolocation request in milliseconds */
  TIMEOUT_MS: 10000,
  /** Maximum age of cached position in milliseconds (5 minutes) */
  MAX_AGE_MS: 300000,
} as const

// ============================================================================
// Types
// ============================================================================

export interface Coordinates {
  lat: number
  lng: number
}

// ============================================================================
// Functions
// ============================================================================

/**
 * Convert degrees to radians
 */
export function toRadians(degrees: number): number {
  return degrees * Math.PI / 180
}

/**
 * Calculate distance between two geographic points using Haversine formula
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return EARTH_RADIUS_KM * c
}

/**
 * Find the nearest location from a list of coordinates
 * @returns The key of the nearest location
 */
export function findNearest<T extends string>(
  lat: number,
  lng: number,
  locations: Record<T, Coordinates>,
  defaultLocation: T
): T {
  let nearest: T = defaultLocation
  let minDistance = Infinity

  for (const [key, coords] of Object.entries(locations) as [T, Coordinates][]) {
    const distance = calculateDistance(lat, lng, coords.lat, coords.lng)
    if (distance < minDistance) {
      minDistance = distance
      nearest = key
    }
  }

  return nearest
}
