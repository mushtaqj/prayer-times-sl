import { useState, useEffect, useCallback } from 'react'

export type PrayerName = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'

interface AlarmSettings {
  [key: string]: boolean
}

interface UseAlarmsReturn {
  alarms: AlarmSettings
  toggleAlarm: (prayer: PrayerName) => void
  requestNotificationPermission: () => Promise<boolean>
  hasPermission: boolean
  scheduleNotification: (prayer: PrayerName, time: string) => void
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

  useEffect(() => {
    if ('Notification' in window) {
      setHasPermission(Notification.permission === 'granted')
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('prayerAlarms', JSON.stringify(alarms))
  }, [alarms])

  const toggleAlarm = (prayer: PrayerName) => {
    setAlarms(prev => ({
      ...prev,
      [prayer]: !prev[prayer],
    }))
  }

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

  const scheduleNotification = useCallback((prayer: PrayerName, time: string) => {
    if (!hasPermission || !alarms[prayer]) return

    const prayerNames: Record<PrayerName, string> = {
      fajr: 'Fajr',
      sunrise: 'Sunrise',
      dhuhr: 'Dhuhr',
      asr: 'Asr',
      maghrib: 'Maghrib',
      isha: 'Isha',
    }

    const now = new Date()
    const [timePart, period] = time.split(' ')
    const [hours, minutes] = timePart.split(':').map(Number)

    let targetHours = hours
    if (period === 'PM' && hours !== 12) targetHours += 12
    if (period === 'AM' && hours === 12) targetHours = 0

    const targetTime = new Date(now)
    targetTime.setHours(targetHours, minutes, 0, 0)

    const diff = targetTime.getTime() - now.getTime()

    if (diff > 0 && diff < 24 * 60 * 60 * 1000) {
      setTimeout(() => {
        new Notification(`${prayerNames[prayer]} Prayer Time`, {
          body: `It's time for ${prayerNames[prayer]} prayer (${time})`,
          icon: '/pwa-192x192.png',
          tag: prayer,
        })
      }, diff)
    }
  }, [hasPermission, alarms])

  return {
    alarms,
    toggleAlarm,
    requestNotificationPermission,
    hasPermission,
    scheduleNotification,
  }
}
