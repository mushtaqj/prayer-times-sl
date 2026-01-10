import { useState, useEffect, useCallback, useRef } from 'react'
import { parseTime } from '@/lib/timeUtils'
import { getStorageItem, setStorageItem } from '@/lib/storage'

export type PrayerName = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'

interface AlarmSettings {
  [key: string]: boolean
}

interface UseAlarmsReturn {
  alarms: AlarmSettings
  toggleAlarm: (prayer: PrayerName) => void
  requestNotificationPermission: () => Promise<boolean>
  hasPermission: boolean
  scheduleNotifications: (prayerTimes: Record<PrayerName, string>) => () => void
}

const prayerNames: Record<PrayerName, string> = {
  fajr: 'Fajr',
  sunrise: 'Sunrise',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
}

const defaultAlarms: AlarmSettings = {
  fajr: false,
  sunrise: false,
  dhuhr: false,
  asr: false,
  maghrib: false,
  isha: false,
}

export function useAlarms(): UseAlarmsReturn {
  const [alarms, setAlarms] = useState<AlarmSettings>(() => {
    return getStorageItem('prayerAlarms', defaultAlarms)
  })

  const [hasPermission, setHasPermission] = useState(() => {
    // Initialize synchronously to avoid effect-based setState
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission === 'granted'
    }
    return false
  })
  const scheduledTimeouts = useRef<Map<PrayerName, ReturnType<typeof setTimeout>>>(new Map())

  useEffect(() => {
    setStorageItem('prayerAlarms', alarms)
  }, [alarms])

  const toggleAlarm = useCallback((prayer: PrayerName) => {
    setAlarms(prev => ({
      ...prev,
      [prayer]: !prev[prayer],
    }))
  }, [])

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported')
      return false
    }

    if (Notification.permission === 'granted') {
      setHasPermission(true)
      return true
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      const granted = permission === 'granted'
      setHasPermission(granted)
      return granted
    }

    return false
  }

  const scheduleNotifications = useCallback((prayerTimes: Record<PrayerName, string>) => {
    // Clear any existing scheduled notifications
    scheduledTimeouts.current.forEach((timeout) => {
      clearTimeout(timeout)
    })
    scheduledTimeouts.current.clear()

    if (!hasPermission) {
      return () => {}
    }

    const now = new Date()
    const prayers: PrayerName[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']

    prayers.forEach((prayer) => {
      if (!alarms[prayer]) return

      const time = prayerTimes[prayer]
      if (!time) return

      const targetTime = parseTime(time)
      const diff = targetTime.getTime() - now.getTime()

      // Only schedule if the prayer time is in the future (within the next 24 hours)
      if (diff > 0) {
        const timeout = setTimeout(() => {
          new Notification(`${prayerNames[prayer]} Prayer Time`, {
            body: `It's time for ${prayerNames[prayer]} prayer (${time})`,
            icon: '/pwa-192x192.png',
            tag: prayer,
          })
          scheduledTimeouts.current.delete(prayer)
        }, diff)

        scheduledTimeouts.current.set(prayer, timeout)
      }
    })

    // Return cleanup function
    return () => {
      scheduledTimeouts.current.forEach((timeout) => {
        clearTimeout(timeout)
      })
      scheduledTimeouts.current.clear()
    }
  }, [hasPermission, alarms])

  // Cleanup on unmount
  useEffect(() => {
    const timeoutsRef = scheduledTimeouts.current
    return () => {
      timeoutsRef.forEach((timeout) => {
        clearTimeout(timeout)
      })
    }
  }, [])

  return {
    alarms,
    toggleAlarm,
    requestNotificationPermission,
    hasPermission,
    scheduleNotifications,
  }
}
