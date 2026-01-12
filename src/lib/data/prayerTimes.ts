/**
 * Prayer Times Data Access Layer
 * Provides typed access to prayer times data
 */

import prayerTimesJson from '@/data/prayerTimes.json'
import { parseTimeToMinutes } from '@/lib/utils/time'
import type { District, DailyPrayerTimes, PrayerTimesData, PrayerName, PrayerInfo } from './types'

// Type assertion for imported JSON
const prayerTimesData = prayerTimesJson as PrayerTimesData

// ============================================================================
// Static Data
// ============================================================================

/** All districts */
export const districts: District[] = prayerTimesData.districts

/** Prayer metadata - display names and Arabic names */
export const prayerMetadata: Record<PrayerName, { displayName: string; arabicName: string }> = {
  fajr: { displayName: 'Fajr', arabicName: 'الفجر' },
  sunrise: { displayName: 'Sunrise', arabicName: 'الشروق' },
  dhuhr: { displayName: 'Dhuhr', arabicName: 'الظهر' },
  asr: { displayName: 'Asr', arabicName: 'العصر' },
  maghrib: { displayName: 'Maghrib', arabicName: 'المغرب' },
  isha: { displayName: 'Isha', arabicName: 'العشاء' },
}

/** Ordered list of prayer names */
export const prayerNames: PrayerName[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']

/** Prayer indices for lookup */
export const PRAYER_INDEX = {
  FAJR: 0,
  SUNRISE: 1,
  DHUHR: 2,
  ASR: 3,
  MAGHRIB: 4,
  ISHA: 5,
} as const

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
