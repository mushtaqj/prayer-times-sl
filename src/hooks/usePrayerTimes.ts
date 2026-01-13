import { useMemo, useCallback, useState, useEffect } from 'react'
import {
  districts,
  getDistrictById,
  getTodayPrayerTimes,
  getWeekPrayerTimes,
  getPrayerTimesForMonth,
  getCurrentAndNextPrayer,
} from '@/lib/data/prayerTimes'
import type { DailyPrayerTimes } from '@/lib/data/types'

// Update interval in milliseconds (1 minute)
const PRAYER_UPDATE_INTERVAL = 60000

export function usePrayerTimes(districtId: string) {
  // Time-based trigger that updates every minute to recalculate current/next prayer
  const [currentMinute, setCurrentMinute] = useState(() => {
    const now = new Date()
    return now.getHours() * 60 + now.getMinutes()
  })

  // Update the minute tracker periodically
  useEffect(() => {
    const updateMinute = () => {
      const now = new Date()
      setCurrentMinute(now.getHours() * 60 + now.getMinutes())
    }

    const interval = setInterval(updateMinute, PRAYER_UPDATE_INTERVAL)
    return () => clearInterval(interval)
  }, [])

  const district = useMemo(() => {
    return getDistrictById(districtId) || districts[0]
  }, [districtId])

  const todayPrayers = useMemo((): DailyPrayerTimes | null => {
    return getTodayPrayerTimes(districtId) || null
  }, [districtId])

  const weekPrayers = useMemo(() => {
    return getWeekPrayerTimes(districtId)
  }, [districtId])

  const getMonthPrayers = useCallback((month: number): DailyPrayerTimes[] => {
    return getPrayerTimesForMonth(district.zone, month)
  }, [district.zone])

  // Include currentMinute in dependencies to trigger re-calculation when time changes
  const prayerInfo = useMemo(() => {
    return getCurrentAndNextPrayer(todayPrayers)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayPrayers, currentMinute])

  return {
    districts,
    district,
    todayPrayers,
    weekPrayers,
    getMonthPrayers,
    currentPrayer: prayerInfo.current,
    nextPrayer: prayerInfo.next,
  }
}
