/**
 * Prayer Times Data Access Layer
 * Provides typed access to prayer times data
 */

import prayerTimesJson from '@/data/prayerTimes.json'
import type { District, DailyPrayerTimes, PrayerTimesData } from './types'

// Type assertion for imported JSON
const prayerTimesData = prayerTimesJson as PrayerTimesData

// ============================================================================
// Static Data
// ============================================================================

/** All districts */
export const districts: District[] = prayerTimesData.districts

// ============================================================================
// Query Functions
// ============================================================================

/** Get all districts */
export function getDistricts(): District[] {
  return districts
}

/** Get district by ID */
export function getDistrictById(id: string): District | undefined {
  return districts.find(d => d.id === id)
}

/** Get districts by zone */
export function getDistrictsByZone(zone: string): District[] {
  return districts.filter(d => d.zone === zone)
}

/** Get prayer times for a specific day */
export function getPrayerTimesForDay(
  zone: string,
  month: number,
  day: number
): DailyPrayerTimes | undefined {
  const monthData = prayerTimesData.zones[zone]?.[String(month)]
  return monthData?.find(d => d.day === day)
}

/** Get prayer times for an entire month */
export function getPrayerTimesForMonth(
  zone: string,
  month: number
): DailyPrayerTimes[] {
  return prayerTimesData.zones[zone]?.[String(month)] || []
}

/** Get today's prayer times for a district */
export function getTodayPrayerTimes(districtId: string): DailyPrayerTimes | undefined {
  const district = getDistrictById(districtId)
  if (!district) return undefined

  const today = new Date()
  return getPrayerTimesForDay(
    district.zone,
    today.getMonth() + 1,
    today.getDate()
  )
}
