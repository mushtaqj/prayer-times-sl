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

// Play notification sound
function playNotificationSound() {
  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()

    // Create a pleasant notification sound
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // Use a pleasant frequency pattern (like a doorbell)
    oscillator.frequency.setValueAtTime(830, audioContext.currentTime) // G#5
    oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.15) // E5

    oscillator.type = 'sine'

    // Fade in and out
    gainNode.gain.setValueAtTime(0, audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05)
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.2)
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.4)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.4)

    // Play second tone
    setTimeout(() => {
      const osc2 = audioContext.createOscillator()
      const gain2 = audioContext.createGain()

      osc2.connect(gain2)
      gain2.connect(audioContext.destination)

      osc2.frequency.setValueAtTime(830, audioContext.currentTime)
      osc2.frequency.setValueAtTime(988, audioContext.currentTime + 0.15) // B5

      osc2.type = 'sine'

      gain2.gain.setValueAtTime(0, audioContext.currentTime)
      gain2.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05)
      gain2.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.2)
      gain2.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.4)

      osc2.start(audioContext.currentTime)
      osc2.stop(audioContext.currentTime + 0.4)
    }, 400)
  } catch (e) {
    console.warn('Could not play notification sound:', e)
  }
}

export function useAlarms(): UseAlarmsReturn {
  const [alarms, setAlarms] = useState<AlarmSettings>(() => {
    return getStorageItem('prayerAlarms', defaultAlarms)
  })

  const [hasPermission, setHasPermission] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission === 'granted'
    }
    return false
  })
  const scheduledTimeouts = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

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

      // Schedule 10-minute reminder
      const reminderDiff = diff - (10 * 60 * 1000) // 10 minutes before
      if (reminderDiff > 0) {
        const reminderTimeout = setTimeout(() => {
          playNotificationSound()
          new Notification(`${prayerNames[prayer]} in 10 minutes`, {
            body: `${prayerNames[prayer]} prayer will begin at ${time}`,
            icon: '/icon-192x192.png',
            tag: `${prayer}-reminder`,
            requireInteraction: false,
          })
          scheduledTimeouts.current.delete(`${prayer}-reminder`)
        }, reminderDiff)

        scheduledTimeouts.current.set(`${prayer}-reminder`, reminderTimeout)
      }

      // Schedule notification at prayer time
      if (diff > 0) {
        const timeout = setTimeout(() => {
          playNotificationSound()
          new Notification(`${prayerNames[prayer]} Prayer Time`, {
            body: `It's time for ${prayerNames[prayer]} prayer (${time})`,
            icon: '/icon-192x192.png',
            tag: prayer,
            requireInteraction: true,
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
