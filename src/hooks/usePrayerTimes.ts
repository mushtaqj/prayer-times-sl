import { useMemo } from 'react'
import prayerData from '@/data/prayerTimes.json'
import { parseTimeToMinutes } from '@/lib/timeUtils'
import type { District, DailyPrayerTimes, PrayerInfo } from '@/lib/data/types'

// Re-export types for backwards compatibility
export type { District, DailyPrayerTimes, PrayerInfo }
// PrayerTime is an alias for DailyPrayerTimes for backwards compatibility
export type PrayerTime = DailyPrayerTimes

export function usePrayerTimes(districtId: string) {
  const district = useMemo(() => {
    return (prayerData.districts as District[]).find(d => d.id === districtId) || prayerData.districts[0] as District
  }, [districtId])

  const getTodayPrayers = useMemo((): DailyPrayerTimes | null => {
    const today = new Date()
    const month = (today.getMonth() + 1).toString()
    const day = today.getDate()

    const zone = district.zone as keyof typeof prayerData.zones
    const monthData = prayerData.zones[zone]?.[month as keyof typeof prayerData.zones["01"]]

    if (!monthData) return null

    return (monthData as DailyPrayerTimes[]).find(p => p.day === day) || null
  }, [district])

  const getWeekPrayers = useMemo(() => {
    const today = new Date()
    const prayers: (DailyPrayerTimes & { date: Date })[] = []

    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)

      const month = (date.getMonth() + 1).toString()
      const day = date.getDate()

      const zone = district.zone as keyof typeof prayerData.zones
      const monthData = prayerData.zones[zone]?.[month as keyof typeof prayerData.zones["01"]]

      if (monthData) {
        const prayer = (monthData as DailyPrayerTimes[]).find(p => p.day === day)
        if (prayer) {
          prayers.push({ ...prayer, date })
        }
      }
    }

    return prayers
  }, [district])

  const getMonthPrayers = useMemo(() => {
    return (month: number): DailyPrayerTimes[] => {
      const zone = district.zone as keyof typeof prayerData.zones
      const monthData = prayerData.zones[zone]?.[month.toString() as keyof typeof prayerData.zones["01"]]
      return (monthData as DailyPrayerTimes[]) || []
    }
  }, [district])

  const getPrayerInfo = useMemo(() => {
    if (!getTodayPrayers) return { current: null, next: null }

    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()

    const prayers: PrayerInfo[] = [
      { name: 'fajr', time: getTodayPrayers.fajr, displayName: 'Fajr', arabicName: 'الفجر' },
      { name: 'sunrise', time: getTodayPrayers.sunrise, displayName: 'Sunrise', arabicName: 'الشروق' },
      { name: 'dhuhr', time: getTodayPrayers.dhuhr, displayName: 'Dhuhr', arabicName: 'الظهر' },
      { name: 'asr', time: getTodayPrayers.asr, displayName: 'Asr', arabicName: 'العصر' },
      { name: 'maghrib', time: getTodayPrayers.maghrib, displayName: 'Maghrib', arabicName: 'المغرب' },
      { name: 'isha', time: getTodayPrayers.isha, displayName: 'Isha', arabicName: 'العشاء' },
    ]

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
      nextPrayerIndex = 0
    }

    // Determine current prayer (the active prayer period we're in)
    let currentPrayer: PrayerInfo | null = null
    if (nextPrayerIndex === 0) {
      // After Isha, before Fajr - current is Isha
      currentPrayer = prayers[5] // Isha
    } else if (nextPrayerIndex === 1) {
      // After Fajr, before Sunrise - current is Fajr
      currentPrayer = prayers[0] // Fajr
    } else {
      // Current is the previous prayer (skip sunrise for actual prayers)
      const prevIndex = nextPrayerIndex - 1
      if (prevIndex === 1) {
        // Previous was sunrise, so current is still Fajr period ending
        currentPrayer = prayers[0]
      } else {
        currentPrayer = prayers[prevIndex]
      }
    }

    return {
      current: currentPrayer,
      next: prayers[nextPrayerIndex]
    }
  }, [getTodayPrayers])

  return {
    districts: prayerData.districts as District[],
    district,
    todayPrayers: getTodayPrayers,
    weekPrayers: getWeekPrayers,
    getMonthPrayers,
    currentPrayer: getPrayerInfo.current,
    nextPrayer: getPrayerInfo.next,
  }
}
