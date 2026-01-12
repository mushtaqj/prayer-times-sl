import { useMemo, useCallback } from 'react'
import {
  districts,
  getDistrictById,
  getTodayPrayerTimes,
  getWeekPrayerTimes,
  getPrayerTimesForMonth,
  getCurrentAndNextPrayer,
} from '@/lib/data/prayerTimes'
import type { DailyPrayerTimes } from '@/lib/data/types'

export function usePrayerTimes(districtId: string) {
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

  const prayerInfo = useMemo(() => {
    return getCurrentAndNextPrayer(todayPrayers)
  }, [todayPrayers])

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
