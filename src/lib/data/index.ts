// ============================================
// CENTRALIZED DATA ACCESS LAYER
// ============================================
// All data is loaded from static JSON files.
// This module provides typed access to all app data.

import type {
  District,
  DailyPrayerTimes,
  PrayerTimesData,
  HijriCalendarData,
  HijriMonth,
  HijriMonthInfo,
  IslamicEventsData,
  IslamicEvent,
  VirtuesData,
} from './types'

// Import static JSON data
import prayerTimesJson from '@/data/prayerTimes.json'
import hijriCalendarJson from '@/data/hijriCalendar.json'
import islamicEventsJson from '@/data/islamicEvents.json'
import virtuesJson from '@/data/virtues.json'

// Type assertions for imported JSON
const prayerTimesData = prayerTimesJson as PrayerTimesData
const hijriCalendarData = hijriCalendarJson as HijriCalendarData
const islamicEventsData = islamicEventsJson as IslamicEventsData
const virtuesData = virtuesJson as VirtuesData

// ============================================
// PRAYER TIMES
// ============================================

export function getDistricts(): District[] {
  return prayerTimesData.districts
}

export function getDistrictById(id: string): District | undefined {
  return prayerTimesData.districts.find(d => d.id === id)
}

export function getDistrictsByZone(zone: string): District[] {
  return prayerTimesData.districts.filter(d => d.zone === zone)
}

export function getPrayerTimesForDay(
  zone: string,
  month: number,
  day: number
): DailyPrayerTimes | undefined {
  const monthData = prayerTimesData.zones[zone]?.[String(month)]
  return monthData?.find(d => d.day === day)
}

export function getPrayerTimesForMonth(
  zone: string,
  month: number
): DailyPrayerTimes[] {
  return prayerTimesData.zones[zone]?.[String(month)] || []
}

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

// ============================================
// HIJRI CALENDAR
// ============================================

export function getHijriMonthsInfo(): HijriMonthInfo[] {
  return hijriCalendarData.hijriMonths
}

export function getHijriMonthInfo(monthNumber: number): HijriMonthInfo | undefined {
  return hijriCalendarData.hijriMonths.find(m => m.number === monthNumber)
}

export function getAllHijriMonths(): HijriMonth[] {
  return hijriCalendarData.months
}

export function getOngoingHijriMonth(): HijriMonth | undefined {
  return hijriCalendarData.months.find(m => m.status === 'ongoing')
}

export function getHijriMonth(year: number, month: number): HijriMonth | undefined {
  return hijriCalendarData.months.find(
    m => m.hijriYear === year && m.hijriMonth === month
  )
}

export function getHijriDateForGregorian(gregorianDate: Date): {
  day: number
  month: number
  monthName: string
  year: number
} | null {
  const targetDate = new Date(gregorianDate)
  targetDate.setHours(0, 0, 0, 0)

  for (const month of hijriCalendarData.months) {
    const startDate = new Date(month.gregorianStart)
    startDate.setHours(0, 0, 0, 0)

    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + month.days)

    if (targetDate >= startDate && targetDate < endDate) {
      const dayDiff = Math.floor(
        (targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      )

      return {
        day: dayDiff + 1,
        month: month.hijriMonth,
        monthName: month.monthName,
        year: month.hijriYear,
      }
    }
  }

  return null
}

export function getHijriCalendarMetadata() {
  return hijriCalendarData.metadata
}

// ============================================
// ISLAMIC EVENTS
// ============================================

export function getAllIslamicEvents(): IslamicEvent[] {
  return islamicEventsData.events
}

export function getIslamicEvent(id: string): IslamicEvent | undefined {
  return islamicEventsData.events.find(e => e.id === id)
}

export function getEventsForHijriDate(
  hijriMonth: number,
  hijriDay: number
): IslamicEvent[] {
  return islamicEventsData.events.filter(
    e => e.hijriMonth === hijriMonth && e.hijriDay === hijriDay
  )
}

export function getEventsForHijriMonth(hijriMonth: number): IslamicEvent[] {
  return islamicEventsData.events.filter(e => e.hijriMonth === hijriMonth)
}

export function getFastingDays(): IslamicEvent[] {
  return islamicEventsData.events.filter(e => e.isFastingDay)
}

export function getEidDays(): IslamicEvent[] {
  return islamicEventsData.events.filter(e => e.type === 'eid')
}

// ============================================
// VIRTUES (Markdown content)
// ============================================

export function getMonthVirtue(monthNumber: number): string | undefined {
  return virtuesData.months[String(monthNumber)]
}

export function getEventVirtue(eventId: string): string | undefined {
  return virtuesData.events[eventId]
}

export function getRecurringVirtue(key: string): string | undefined {
  return virtuesData.recurring[key]
}

// ============================================
// RE-EXPORT TYPES
// ============================================

export * from './types'
