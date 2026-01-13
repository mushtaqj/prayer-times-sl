/**
 * Firebase Cloud Functions for Prayer Times Push Notifications
 *
 * This function is triggered by Cloud Scheduler via Pub/Sub (NOT HTTP).
 * No external endpoint is exposed - completely secure from abuse.
 *
 * Schedule: Every minute from 4 AM to 8 PM Sri Lanka time
 * Cron: "* 4-20 * * *" (Asia/Colombo timezone)
 */

import { onSchedule } from 'firebase-functions/v2/scheduler'
import { initializeApp } from 'firebase-admin/app'
import { getMessaging } from 'firebase-admin/messaging'
import { createRequire } from 'module'

// Initialize Firebase Admin
initializeApp()

// Load prayer times data (copied during deployment via predeploy script)
const require = createRequire(import.meta.url)
const prayerTimesData = require('./data/prayerTimes.json')

// Constants
const ZONES = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13']
const REMINDER_MINUTES = 10
const PRAYERS = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']
const PRAYER_DISPLAY_NAMES = {
  fajr: 'Fajr',
  sunrise: 'Sunrise',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
}

/**
 * Parse time string (e.g., "5:23 AM") to { hours, minutes } in 24-hour format
 */
function parseTime(timeStr) {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return null

  let hours = parseInt(match[1], 10)
  const minutes = parseInt(match[2], 10)
  const period = match[3].toUpperCase()

  if (period === 'PM' && hours !== 12) {
    hours += 12
  } else if (period === 'AM' && hours === 12) {
    hours = 0
  }

  return { hours, minutes }
}

/**
 * Subtract minutes from a time and return as HH:MM string
 */
function subtractMinutes(timeStr, minutesToSubtract) {
  const parsed = parseTime(timeStr)
  if (!parsed) return null

  let totalMinutes = parsed.hours * 60 + parsed.minutes - minutesToSubtract

  if (totalMinutes < 0) {
    totalMinutes += 24 * 60
  }

  const hours = Math.floor(totalMinutes / 60) % 24
  const minutes = totalMinutes % 60

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

/**
 * Get current time in Sri Lanka as HH:MM string
 */
function getCurrentTimeSriLanka() {
  const now = new Date()
  const sriLankaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Colombo' }))

  const hours = sriLankaTime.getHours()
  const minutes = sriLankaTime.getMinutes()

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

/**
 * Get current date parts in Sri Lanka timezone
 */
function getCurrentDateSriLanka() {
  const now = new Date()
  const sriLankaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Colombo' }))

  return {
    month: sriLankaTime.getMonth() + 1,
    day: sriLankaTime.getDate(),
  }
}

/**
 * Get prayer times for a zone on a specific day
 */
function getPrayerTimesForZone(zone, month, day) {
  const monthData = prayerTimesData.zones[zone]?.[String(month)]
  if (!monthData) return null

  const dayData = monthData.find((d) => d.day === day)
  return dayData || null
}

/**
 * Send notification to a zone topic
 */
async function sendNotification(zone, prayer, prayerTime) {
  const prayerName = PRAYER_DISPLAY_NAMES[prayer] || prayer
  const messaging = getMessaging()

  const message = {
    topic: `zone-${zone}`,
    notification: {
      title: `${prayerName} Prayer`,
      body: `${prayerName} is in ${REMINDER_MINUTES} minutes (${prayerTime})`,
    },
    data: {
      prayer: prayer,
      zone: zone,
      time: prayerTime,
    },
    android: {
      priority: 'high',
      notification: {
        sound: 'default',
        channelId: 'prayer_times',
      },
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
          badge: 1,
        },
      },
    },
  }

  try {
    const response = await messaging.send(message)
    console.log(`✓ Sent ${prayer} to zone-${zone}: ${response}`)
    return { success: true, zone, prayer, messageId: response }
  } catch (error) {
    console.error(`✗ Failed ${prayer} to zone-${zone}:`, error.message)
    return { success: false, zone, prayer, error: error.message }
  }
}

/**
 * Scheduled function - triggered by Cloud Scheduler via Pub/Sub
 * Runs every minute from 4 AM to 8 PM Sri Lanka time
 *
 * This is NOT an HTTP endpoint - it cannot be called externally
 */
export const sendPrayerNotifications = onSchedule(
  {
    schedule: '* 4-20 * * *',
    timeZone: 'Asia/Colombo',
    retryCount: 0, // Don't retry - we'll catch the next minute
  },
  async (event) => {
    const currentTime = getCurrentTimeSriLanka()
    const { month, day } = getCurrentDateSriLanka()

    console.log(`⏰ Checking prayers at ${currentTime} (${month}/${day})`)

    const results = []

    // Check each zone
    for (const zone of ZONES) {
      const todayTimes = getPrayerTimesForZone(zone, month, day)

      if (!todayTimes) {
        console.log(`No data for zone ${zone}, ${month}/${day}`)
        continue
      }

      // Check each prayer
      for (const prayer of PRAYERS) {
        const prayerTime = todayTimes[prayer]
        if (!prayerTime) continue

        // Calculate reminder time (10 minutes before prayer)
        const reminderTime = subtractMinutes(prayerTime, REMINDER_MINUTES)

        if (reminderTime === currentTime) {
          console.log(`🔔 Match! Zone ${zone} ${prayer} at ${prayerTime}`)
          const result = await sendNotification(zone, prayer, prayerTime)
          results.push(result)
        }
      }
    }

    // Log summary
    const sent = results.filter((r) => r.success).length
    const failed = results.filter((r) => !r.success).length

    if (results.length > 0) {
      console.log(`📊 Summary: ${sent} sent, ${failed} failed`)
    }

    return null
  }
)
