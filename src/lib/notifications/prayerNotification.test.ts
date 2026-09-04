import { describe, it, expect } from 'vitest'
import {
  buildPrayerNotification,
  getPrayerDisplayName,
  NOTIFICATION_BADGE,
  NOTIFICATION_ICON,
  PRAYER_REMINDER_TAG,
} from './prayerNotification'

describe('getPrayerDisplayName', () => {
  it('maps known prayers to display names', () => {
    expect(getPrayerDisplayName('fajr')).toBe('Fajr')
    expect(getPrayerDisplayName('ISHA')).toBe('Isha')
  })

  it('capitalises unknown prayers and defaults when missing', () => {
    expect(getPrayerDisplayName('tahajjud')).toBe('Tahajjud')
    expect(getPrayerDisplayName()).toBe('Prayer')
  })
})

describe('buildPrayerNotification', () => {
  it('uses title and body from the push payload when present', () => {
    const { title, options } = buildPrayerNotification(
      { prayer: 'fajr', zone: '01', time: '5:02 AM', title: 'Fajr Prayer', body: 'Fajr is in 10 minutes (5:02 AM)' },
      1000
    )
    expect(title).toBe('Fajr Prayer')
    expect(options.body).toBe('Fajr is in 10 minutes (5:02 AM)')
    expect(options.timestamp).toBe(1000)
    expect(options.data).toEqual({ url: '/prayer', prayer: 'fajr', zone: '01', time: '5:02 AM' })
  })

  it('builds fallback text when the payload has no title or body', () => {
    const { title, options } = buildPrayerNotification({ prayer: 'asr', time: '3:30 PM' })
    expect(title).toBe('Asr Prayer')
    expect(options.body).toBe('Asr is in 10 minutes (3:30 PM)')
  })

  it('always uses the shared tag, icon and monochrome badge', () => {
    const { options } = buildPrayerNotification({ prayer: 'dhuhr' })
    expect(options.tag).toBe(PRAYER_REMINDER_TAG)
    expect(options.icon).toBe(NOTIFICATION_ICON)
    expect(options.badge).toBe(NOTIFICATION_BADGE)
    expect(options.renotify).toBe(true)
    expect(options.requireInteraction).toBe(false)
  })

  it('produces the same tag for every prayer so reminders replace each other', () => {
    const tags = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].map(
      (prayer) => buildPrayerNotification({ prayer }).options.tag
    )
    expect(new Set(tags).size).toBe(1)
  })
})
