/**
 * Prayer Times Data Access Layer
 * Provides typed access to prayer times data
 */

import prayerTimesJson from '@/data/prayerTimes.json'
import { parseTimeToMinutes } from '@/lib/utils/time'
import { findNearest } from '@/lib/utils/geo'
import {
  PRAYER_INDEX,
  PRAYER_NAMES,
  PRAYER_METADATA,
  DEFAULT_DISTRICT_ID,
} from '@/lib/constants/prayerConstants'
import type { District, DailyPrayerTimes, PrayerTimesData, PrayerInfo } from './types'

// Type assertion for imported JSON
const prayerTimesData = prayerTimesJson as PrayerTimesData

// Re-export constants for backwards compatibility
export { PRAYER_INDEX, PRAYER_NAMES, PRAYER_METADATA, DEFAULT_DISTRICT_ID }

// Aliases for backwards compatibility
export const prayerMetadata = PRAYER_METADATA
export const prayerNames = PRAYER_NAMES

// ============================================================================
// Static Data
// ============================================================================

/** All districts */
export const districts: District[] = prayerTimesData.districts

/** District coordinates (approximate centers) for geolocation */
export const districtCoordinates: Record<string, { lat: number; lng: number }> = {
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

/** Get prayer times for the next N days */
export function getWeekPrayerTimes(
  districtId: string,
  days: number = 7
): (DailyPrayerTimes & { date: Date })[] {
  const district = getDistrictById(districtId)
  if (!district) return []

  const today = new Date()
  const prayers: (DailyPrayerTimes & { date: Date })[] = []

  for (let i = 0; i < days; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)

    const prayer = getPrayerTimesForDay(
      district.zone,
      date.getMonth() + 1,
      date.getDate()
    )

    if (prayer) {
      prayers.push({ ...prayer, date })
    }
  }

  return prayers
}

/** Convert daily prayer times to PrayerInfo array */
export function toPrayerInfoArray(dailyTimes: DailyPrayerTimes): PrayerInfo[] {
  return prayerNames.map(name => ({
    name,
    time: dailyTimes[name],
    displayName: prayerMetadata[name].displayName,
    arabicName: prayerMetadata[name].arabicName,
  }))
}

/** Get current and next prayer based on current time */
export function getCurrentAndNextPrayer(
  dailyTimes: DailyPrayerTimes | null
): { current: PrayerInfo | null; next: PrayerInfo | null } {
  if (!dailyTimes) return { current: null, next: null }

  const now = new Date()
  const currentTime = now.getHours() * 60 + now.getMinutes()
  const prayers = toPrayerInfoArray(dailyTimes)

  // Find next prayer index
  let nextPrayerIndex = -1
  for (let i = 0; i < prayers.length; i++) {
    const prayerTime = parseTimeToMinutes(prayers[i].time)
    if (prayerTime > currentTime) {
      nextPrayerIndex = i
      break
    }
  }

  // If no next prayer found today, next is Fajr (tomorrow)
  if (nextPrayerIndex === -1) {
    nextPrayerIndex = PRAYER_INDEX.FAJR
  }

  // Determine current prayer (the active prayer period we're in)
  let currentPrayer: PrayerInfo | null = null

  if (nextPrayerIndex === PRAYER_INDEX.FAJR) {
    // After Isha, before Fajr - current is Isha
    currentPrayer = prayers[PRAYER_INDEX.ISHA]
  } else if (nextPrayerIndex === PRAYER_INDEX.SUNRISE) {
    // After Fajr, before Sunrise - current is Fajr
    currentPrayer = prayers[PRAYER_INDEX.FAJR]
  } else {
    // Current is the previous prayer (skip sunrise for actual prayers)
    const prevIndex = nextPrayerIndex - 1
    if (prevIndex === PRAYER_INDEX.SUNRISE) {
      // Previous was sunrise, so current is still Fajr period ending
      currentPrayer = prayers[PRAYER_INDEX.FAJR]
    } else {
      currentPrayer = prayers[prevIndex]
    }
  }

  return {
    current: currentPrayer,
    next: prayers[nextPrayerIndex],
  }
}

// ============================================================================
// Location Functions
// ============================================================================

/** Find the nearest district based on coordinates */
export function findNearestDistrict(lat: number, lng: number): string {
  return findNearest(lat, lng, districtCoordinates, DEFAULT_DISTRICT_ID)
}
