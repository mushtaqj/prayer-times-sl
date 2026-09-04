import { useState, useEffect, useCallback, useRef } from 'react'
import { parseTime } from '@/lib/utils/time'
import { getStorageItem, setStorageItem } from '@/lib/utils/storage'
import { playNotificationSound } from '@/lib/utils/audio'
import {
  ALARM_STORAGE_KEY,
  REMINDER_BEFORE_MS,
  REMINDER_BEFORE_MINUTES,
  NOTIFICATION_ICON,
  DEFAULT_ALARMS,
} from '@/lib/constants/alarmConstants'
import {
  NOTIFICATION_BADGE,
  PRAYER_REMINDER_TAG,
  PRAYER_TIME_TAG,
} from '@/lib/notifications/prayerNotification'
import { showNotificationFromPage } from '@/lib/notifications/showNotification'
import { isPushEnabled } from '@/lib/notifications/pushSettings'
import { prayerNames, prayerMetadata } from '@/lib/data/prayerTimes'
import type { PrayerName } from '@/lib/data/types'

/** Alarm settings for each prayer - typed for safety */
type AlarmSettings = Record<PrayerName, boolean>

interface UseAlarmsReturn {
  alarms: AlarmSettings
  toggleAlarm: (prayer: PrayerName) => void
  requestNotificationPermission: () => Promise<boolean>
  hasPermission: boolean
  scheduleNotifications: (prayerTimes: Record<PrayerName, string>) => () => void
}

export function useAlarms(): UseAlarmsReturn {
  const [alarms, setAlarms] = useState<AlarmSettings>(() => {
    return getStorageItem(ALARM_STORAGE_KEY, DEFAULT_ALARMS)
  })

  const [hasPermission, setHasPermission] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission === 'granted'
    }
    return false
  })

  const scheduledTimeouts = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  useEffect(() => {
    setStorageItem(ALARM_STORAGE_KEY, alarms)
  }, [alarms])

  const toggleAlarm = useCallback((prayer: PrayerName) => {
    setAlarms(prev => ({
      ...prev,
      [prayer]: !prev[prayer],
    }))
  }, [])

  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
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
  }, [])

  const scheduleNotifications = useCallback((prayerTimes: Record<PrayerName, string>) => {
    // Clear any existing scheduled notifications
    scheduledTimeouts.current.forEach((timeout) => {
      clearTimeout(timeout)
    })
    scheduledTimeouts.current.clear()

    if (!hasPermission) {
      return () => {}
    }

    // Server push already delivers the 10-minute reminder for this device.
    // Scheduling it locally as well produced a duplicate at the same minute.
    const reminderHandledByPush = isPushEnabled()

    const now = new Date()

    prayerNames.forEach((prayer) => {
      if (!alarms[prayer]) return

      const time = prayerTimes[prayer]
      if (!time) return

      const displayName = prayerMetadata[prayer].displayName
      const targetTime = parseTime(time)
      const diff = targetTime.getTime() - now.getTime()

      // Schedule reminder before prayer
      const reminderDiff = diff - REMINDER_BEFORE_MS
      if (reminderDiff > 0 && !reminderHandledByPush) {
        const reminderTimeout = setTimeout(() => {
          playNotificationSound()
          void showNotificationFromPage(`${displayName} in ${REMINDER_BEFORE_MINUTES} minutes`, {
            body: `${displayName} prayer will begin at ${time}`,
            icon: NOTIFICATION_ICON,
            badge: NOTIFICATION_BADGE,
            tag: PRAYER_REMINDER_TAG,
            renotify: true,
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
          void showNotificationFromPage(`${displayName} Prayer Time`, {
            body: `It's time for ${displayName} prayer (${time})`,
            icon: NOTIFICATION_ICON,
            badge: NOTIFICATION_BADGE,
            tag: PRAYER_TIME_TAG,
            renotify: true,
            requireInteraction: false,
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
