import { useState, useEffect, useCallback, useRef } from 'react'

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

export function useAlarms(): UseAlarmsReturn {
  const [alarms, setAlarms] = useState<AlarmSettings>(() => {
    const saved = localStorage.getItem('prayerAlarms')
    return saved ? JSON.parse(saved) : {
      fajr: false,
      sunrise: false,
      dhuhr: false,
      asr: false,
      maghrib: false,
      isha: false,
    }
  })

  const [hasPermission, setHasPermission] = useState(false)
  const scheduledTimeouts = useRef<Map<PrayerName, ReturnType<typeof setTimeout>>>(new Map())

  useEffect(() => {
    if ('Notification' in window) {
      setHasPermission(Notification.permission === 'granted')
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('prayerAlarms', JSON.stringify(alarms))
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

  const parseTime = (time: string): Date => {
    const now = new Date()
    const [timePart, period] = time.split(' ')
    const [hours, minutes] = timePart.split(':').map(Number)

    let targetHours = hours
    if (period === 'PM' && hours !== 12) targetHours += 12
    if (period === 'AM' && hours === 12) targetHours = 0

    const targetTime = new Date(now)
    targetTime.setHours(targetHours, minutes, 0, 0)
    return targetTime
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
    return () => {
      scheduledTimeouts.current.forEach((timeout) => {
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
