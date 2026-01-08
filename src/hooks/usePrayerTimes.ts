import { useMemo } from 'react'
import prayerData from '@/data/prayerTimes.json'

export interface PrayerTime {
  day: number
  fajr: string
  sunrise: string
  dhuhr: string
  asr: string
  maghrib: string
  isha: string
}

export interface District {
  id: string
  name: string
  zone: string
}

export function usePrayerTimes(districtId: string) {
  const district = useMemo(() => {
    return prayerData.districts.find(d => d.id === districtId) || prayerData.districts[0]
  }, [districtId])

  const getTodayPrayers = useMemo(() => {
    const today = new Date()
    const month = (today.getMonth() + 1).toString()
    const day = today.getDate()

    const zone = district.zone as keyof typeof prayerData.zones
    const monthData = prayerData.zones[zone]?.[month as keyof typeof prayerData.zones["01"]]

    if (!monthData) return null

    return (monthData as PrayerTime[]).find(p => p.day === day) || null
  }, [district])

  const getWeekPrayers = useMemo(() => {
    const today = new Date()
    const prayers: (PrayerTime & { date: Date })[] = []

    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)

      const month = (date.getMonth() + 1).toString()
      const day = date.getDate()

      const zone = district.zone as keyof typeof prayerData.zones
      const monthData = prayerData.zones[zone]?.[month as keyof typeof prayerData.zones["01"]]

      if (monthData) {
        const prayer = (monthData as PrayerTime[]).find(p => p.day === day)
        if (prayer) {
          prayers.push({ ...prayer, date })
        }
      }
    }

    return prayers
  }, [district])

  const getMonthPrayers = useMemo(() => {
    return (month: number) => {
      const zone = district.zone as keyof typeof prayerData.zones
      const monthData = prayerData.zones[zone]?.[month.toString() as keyof typeof prayerData.zones["01"]]
      return (monthData as PrayerTime[]) || []
    }
  }, [district])

  const getNextPrayer = useMemo(() => {
    if (!getTodayPrayers) return null

    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()

    const prayers: { name: string; time: string; displayName: string }[] = [
      { name: 'fajr', time: getTodayPrayers.fajr, displayName: 'Fajr' },
      { name: 'sunrise', time: getTodayPrayers.sunrise, displayName: 'Sunrise' },
      { name: 'dhuhr', time: getTodayPrayers.dhuhr, displayName: 'Dhuhr' },
      { name: 'asr', time: getTodayPrayers.asr, displayName: 'Asr' },
      { name: 'maghrib', time: getTodayPrayers.maghrib, displayName: 'Maghrib' },
      { name: 'isha', time: getTodayPrayers.isha, displayName: 'Isha' },
    ]

    for (const prayer of prayers) {
      const [timePart, period] = prayer.time.split(' ')
      const [hours, minutes] = timePart.split(':').map(Number)

      let prayerHours = hours
      if (period === 'PM' && hours !== 12) prayerHours += 12
      if (period === 'AM' && hours === 12) prayerHours = 0

      const prayerTime = prayerHours * 60 + minutes

      if (prayerTime > currentTime) {
        return prayer
      }
    }

    return prayers[0]
  }, [getTodayPrayers])

  return {
    districts: prayerData.districts as District[],
    district,
    todayPrayers: getTodayPrayers,
    weekPrayers: getWeekPrayers,
    getMonthPrayers,
    nextPrayer: getNextPrayer,
  }
}
