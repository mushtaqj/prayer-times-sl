import { describe, it, expect } from 'vitest'
import {
  toRadians,
  calculateDistance,
  findNearest,
  EARTH_RADIUS_KM,
  GEOLOCATION_OPTIONS,
  type Coordinates,
} from './geo'

describe('geo utilities', () => {
  describe('constants', () => {
    it('exports EARTH_RADIUS_KM', () => {
      expect(EARTH_RADIUS_KM).toBe(6371)
    })

    it('exports GEOLOCATION_OPTIONS', () => {
      expect(GEOLOCATION_OPTIONS.TIMEOUT_MS).toBe(10000)
      expect(GEOLOCATION_OPTIONS.MAX_AGE_MS).toBe(300000)
    })
  })

  describe('toRadians', () => {
    it('converts 0 degrees to 0 radians', () => {
      expect(toRadians(0)).toBe(0)
    })

    it('converts 180 degrees to PI radians', () => {
      expect(toRadians(180)).toBeCloseTo(Math.PI)
    })

    it('converts 90 degrees to PI/2 radians', () => {
      expect(toRadians(90)).toBeCloseTo(Math.PI / 2)
    })

    it('converts 360 degrees to 2*PI radians', () => {
      expect(toRadians(360)).toBeCloseTo(2 * Math.PI)
    })

    it('converts negative degrees', () => {
      expect(toRadians(-90)).toBeCloseTo(-Math.PI / 2)
    })

    it('converts 45 degrees', () => {
      expect(toRadians(45)).toBeCloseTo(Math.PI / 4)
    })
  })

  describe('calculateDistance', () => {
    it('returns 0 for same location', () => {
      const distance = calculateDistance(6.9271, 79.8612, 6.9271, 79.8612)

      expect(distance).toBe(0)
    })

    it('calculates distance between Colombo and Kandy', () => {
      // Colombo: 6.9271, 79.8612
      // Kandy: 7.2906, 80.6337
      const distance = calculateDistance(6.9271, 79.8612, 7.2906, 80.6337)

      // Approximate straight-line distance is ~94km (road distance is ~115km)
      expect(distance).toBeGreaterThan(90)
      expect(distance).toBeLessThan(100)
    })

    it('calculates distance between London and Paris', () => {
      // London: 51.5074, -0.1278
      // Paris: 48.8566, 2.3522
      const distance = calculateDistance(51.5074, -0.1278, 48.8566, 2.3522)

      // Approximate distance is ~344km
      expect(distance).toBeGreaterThan(330)
      expect(distance).toBeLessThan(360)
    })

    it('calculates distance across the equator', () => {
      // Point at equator
      // Point south of equator
      const distance = calculateDistance(0, 0, -10, 0)

      // 10 degrees of latitude is approximately 1111 km
      expect(distance).toBeGreaterThan(1100)
      expect(distance).toBeLessThan(1120)
    })

    it('calculates distance across the date line', () => {
      // Points on either side of the date line
      const distance = calculateDistance(0, 179, 0, -179)

      // Should be about 222 km (2 degrees at equator)
      expect(distance).toBeGreaterThan(200)
      expect(distance).toBeLessThan(250)
    })

    it('is commutative (order of points does not matter)', () => {
      const distance1 = calculateDistance(6.9271, 79.8612, 7.2906, 80.6337)
      const distance2 = calculateDistance(7.2906, 80.6337, 6.9271, 79.8612)

      expect(distance1).toBeCloseTo(distance2)
    })
  })

  describe('findNearest', () => {
    const sriLankaDistricts: Record<string, Coordinates> = {
      colombo: { lat: 6.9271, lng: 79.8612 },
      kandy: { lat: 7.2906, lng: 80.6337 },
      galle: { lat: 6.0535, lng: 80.2210 },
      jaffna: { lat: 9.6615, lng: 80.0255 },
    }

    it('finds nearest location when exactly at location', () => {
      const nearest = findNearest(
        6.9271,
        79.8612,
        sriLankaDistricts,
        'colombo'
      )

      expect(nearest).toBe('colombo')
    })

    it('finds nearest location when closest to Kandy', () => {
      // Point near Kandy
      const nearest = findNearest(
        7.3,
        80.6,
        sriLankaDistricts,
        'colombo'
      )

      expect(nearest).toBe('kandy')
    })

    it('finds nearest location when closest to Galle', () => {
      // Point near Galle
      const nearest = findNearest(
        6.1,
        80.2,
        sriLankaDistricts,
        'colombo'
      )

      expect(nearest).toBe('galle')
    })

    it('finds nearest location when closest to Jaffna', () => {
      // Point in northern Sri Lanka
      const nearest = findNearest(
        9.5,
        80.0,
        sriLankaDistricts,
        'colombo'
      )

      expect(nearest).toBe('jaffna')
    })

    it('returns default when locations is empty', () => {
      const nearest = findNearest(
        6.9271,
        79.8612,
        {} as Record<string, Coordinates>,
        'defaultCity'
      )

      expect(nearest).toBe('defaultCity')
    })

    it('handles single location', () => {
      const singleLocation: Record<string, Coordinates> = {
        onlyCity: { lat: 0, lng: 0 },
      }

      const nearest = findNearest(
        50,
        50,
        singleLocation,
        'default'
      )

      expect(nearest).toBe('onlyCity')
    })

    it('handles equidistant locations (returns first found)', () => {
      // Two locations at same distance
      const equidistantLocations: Record<string, Coordinates> = {
        north: { lat: 1, lng: 0 },
        south: { lat: -1, lng: 0 },
      }

      const nearest = findNearest(
        0,
        0,
        equidistantLocations,
        'default'
      )

      // Should return one of them (order depends on object iteration)
      expect(['north', 'south']).toContain(nearest)
    })
  })
})
