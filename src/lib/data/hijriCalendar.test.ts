import { describe, it, expect } from 'vitest'
import {
  gregorianToHijri,
  hijriToGregorian,
  getMoonPhase,
  formatHijriDate,
} from '@/lib/data/hijriCalendar'

describe('gregorianToHijri', () => {
  it('converts first day of a known month correctly', () => {
    // Muharram 1424 starts on 2003-03-04
    const result = gregorianToHijri(new Date(2003, 2, 4)) // March 4, 2003
    expect(result).not.toBeNull()
    expect(result?.day).toBe(1)
    expect(result?.month).toBe(1)
    expect(result?.year).toBe(1424)
    expect(result?.monthName).toBe('Muharram')
  })

  it('converts middle of month correctly', () => {
    // Muharram 1424 starts on 2003-03-04, so day 15 is 2003-03-18
    const result = gregorianToHijri(new Date(2003, 2, 18))
    expect(result).not.toBeNull()
    expect(result?.day).toBe(15)
    expect(result?.month).toBe(1)
    expect(result?.year).toBe(1424)
  })

  it('converts last day of a 30-day month correctly', () => {
    // Muharram 1424 has 30 days, starts 2003-03-04, so day 30 is 2003-04-02
    const result = gregorianToHijri(new Date(2003, 3, 2)) // April 2, 2003
    expect(result).not.toBeNull()
    expect(result?.day).toBe(30)
    expect(result?.month).toBe(1)
    expect(result?.year).toBe(1424)
  })

  it('converts first day of next month correctly', () => {
    // Safar 1424 starts on 2003-04-03
    const result = gregorianToHijri(new Date(2003, 3, 3)) // April 3, 2003
    expect(result).not.toBeNull()
    expect(result?.day).toBe(1)
    expect(result?.month).toBe(2)
    expect(result?.monthName).toBe('Safar')
  })

  it('converts last day of a 29-day month correctly', () => {
    // Rabi al-Awwal 1424 has 29 days, starts 2003-05-03, so day 29 is 2003-05-31
    const result = gregorianToHijri(new Date(2003, 4, 31)) // May 31, 2003
    expect(result).not.toBeNull()
    expect(result?.day).toBe(29)
    expect(result?.month).toBe(3)
    expect(result?.monthName).toBe('Rabi al-Awwal')
  })

  it('returns null for date before available data', () => {
    const result = gregorianToHijri(new Date(2000, 0, 1)) // Jan 1, 2000
    expect(result).toBeNull()
  })

  it('returns null for date after available data', () => {
    const result = gregorianToHijri(new Date(2030, 0, 1)) // Jan 1, 2030
    expect(result).toBeNull()
  })

  it('handles year boundary correctly', () => {
    // Dhul Hijjah 1424 (month 12) ends, then Muharram 1425 begins
    // Need to find a year boundary in the data
    // Muharram 1425 starts on 2004-02-21
    const result = gregorianToHijri(new Date(2004, 1, 21)) // Feb 21, 2004
    expect(result).not.toBeNull()
    expect(result?.day).toBe(1)
    expect(result?.month).toBe(1)
    expect(result?.year).toBe(1425)
  })

  it('includes gregorianDate in result', () => {
    const inputDate = new Date(2003, 2, 4)
    const result = gregorianToHijri(inputDate)
    expect(result?.gregorianDate).toEqual(inputDate)
  })

  it('converts Ramadan dates correctly', () => {
    // Ramadan 1424 starts on 2003-10-26
    const result = gregorianToHijri(new Date(2003, 9, 26)) // Oct 26, 2003
    expect(result).not.toBeNull()
    expect(result?.day).toBe(1)
    expect(result?.month).toBe(9)
    expect(result?.monthName).toBe('Ramadan')
  })
})

describe('hijriToGregorian', () => {
  it('converts first day of month correctly', () => {
    // Muharram 1, 1424 = March 4, 2003
    const result = hijriToGregorian(1424, 1, 1)
    expect(result).not.toBeNull()
    expect(result?.getFullYear()).toBe(2003)
    expect(result?.getMonth()).toBe(2) // March (0-indexed)
    expect(result?.getDate()).toBe(4)
  })

  it('converts middle of month correctly', () => {
    // Muharram 15, 1424 = March 18, 2003
    const result = hijriToGregorian(1424, 1, 15)
    expect(result).not.toBeNull()
    expect(result?.getFullYear()).toBe(2003)
    expect(result?.getMonth()).toBe(2)
    expect(result?.getDate()).toBe(18)
  })

  it('converts last day of 30-day month correctly', () => {
    // Muharram 30, 1424 = April 2, 2003
    const result = hijriToGregorian(1424, 1, 30)
    expect(result).not.toBeNull()
    expect(result?.getFullYear()).toBe(2003)
    expect(result?.getMonth()).toBe(3) // April
    expect(result?.getDate()).toBe(2)
  })

  it('converts last day of 29-day month correctly', () => {
    // Rabi al-Awwal 29, 1424 = May 31, 2003
    const result = hijriToGregorian(1424, 3, 29)
    expect(result).not.toBeNull()
    expect(result?.getFullYear()).toBe(2003)
    expect(result?.getMonth()).toBe(4) // May
    expect(result?.getDate()).toBe(31)
  })

  it('returns null for non-existent year', () => {
    const result = hijriToGregorian(1400, 1, 1) // Year not in data
    expect(result).toBeNull()
  })

  it('returns null for invalid month', () => {
    const result = hijriToGregorian(1424, 13, 1) // Month 13 doesn't exist
    expect(result).toBeNull()
  })

  it('returns null for day 0', () => {
    const result = hijriToGregorian(1424, 1, 0)
    expect(result).toBeNull()
  })

  it('returns null for negative day', () => {
    const result = hijriToGregorian(1424, 1, -1)
    expect(result).toBeNull()
  })

  it('returns null for day exceeding month length', () => {
    // Rabi al-Awwal 1424 has 29 days, day 30 should be null
    const result = hijriToGregorian(1424, 3, 30)
    expect(result).toBeNull()
  })

  it('returns null for day 31 in any month', () => {
    // No Hijri month has 31 days
    const result = hijriToGregorian(1424, 1, 31)
    expect(result).toBeNull()
  })

  it('round-trips with gregorianToHijri', () => {
    // Convert Hijri to Gregorian, then back to Hijri
    const gregorian = hijriToGregorian(1424, 5, 15)
    expect(gregorian).not.toBeNull()

    const hijri = gregorianToHijri(gregorian!)
    expect(hijri).not.toBeNull()
    expect(hijri?.year).toBe(1424)
    expect(hijri?.month).toBe(5)
    expect(hijri?.day).toBe(15)
  })
})

describe('getMoonPhase', () => {
  it('returns New Moon for day 1', () => {
    const result = getMoonPhase(1)
    expect(result.phase).toBe('New Moon')
    expect(result.icon).toBe('🌑')
  })

  it('returns Waxing Crescent for days 2-6', () => {
    expect(getMoonPhase(2).phase).toBe('Waxing Crescent')
    expect(getMoonPhase(4).phase).toBe('Waxing Crescent')
    expect(getMoonPhase(6).phase).toBe('Waxing Crescent')
    expect(getMoonPhase(2).icon).toBe('🌒')
  })

  it('returns First Quarter for days 7-9', () => {
    expect(getMoonPhase(7).phase).toBe('First Quarter')
    expect(getMoonPhase(8).phase).toBe('First Quarter')
    expect(getMoonPhase(9).phase).toBe('First Quarter')
    expect(getMoonPhase(7).icon).toBe('🌓')
  })

  it('returns Waxing Gibbous for days 10-13', () => {
    expect(getMoonPhase(10).phase).toBe('Waxing Gibbous')
    expect(getMoonPhase(13).phase).toBe('Waxing Gibbous')
    expect(getMoonPhase(10).icon).toBe('🌔')
  })

  it('returns Full Moon for days 14-16', () => {
    expect(getMoonPhase(14).phase).toBe('Full Moon')
    expect(getMoonPhase(15).phase).toBe('Full Moon')
    expect(getMoonPhase(16).phase).toBe('Full Moon')
    expect(getMoonPhase(15).icon).toBe('🌕')
  })

  it('returns Waning Gibbous for days 17-20', () => {
    expect(getMoonPhase(17).phase).toBe('Waning Gibbous')
    expect(getMoonPhase(20).phase).toBe('Waning Gibbous')
    expect(getMoonPhase(17).icon).toBe('🌖')
  })

  it('returns Last Quarter for days 21-24', () => {
    expect(getMoonPhase(21).phase).toBe('Last Quarter')
    expect(getMoonPhase(24).phase).toBe('Last Quarter')
    expect(getMoonPhase(21).icon).toBe('🌗')
  })

  it('returns Waning Crescent for days 25-30', () => {
    expect(getMoonPhase(25).phase).toBe('Waning Crescent')
    expect(getMoonPhase(29).phase).toBe('Waning Crescent')
    expect(getMoonPhase(30).phase).toBe('Waning Crescent')
    expect(getMoonPhase(25).icon).toBe('🌘')
  })
})

describe('formatHijriDate', () => {
  const sampleDate = {
    day: 15,
    month: 9,
    monthName: 'Ramadan',
    year: 1445,
    gregorianDate: new Date(2024, 2, 25),
  }

  it('formats in long style by default', () => {
    const result = formatHijriDate(sampleDate)
    expect(result).toBe('15 Ramadan 1445 AH')
  })

  it('formats in long style explicitly', () => {
    const result = formatHijriDate(sampleDate, 'long')
    expect(result).toBe('15 Ramadan 1445 AH')
  })

  it('formats in short style', () => {
    const result = formatHijriDate(sampleDate, 'short')
    expect(result).toBe('15 Ram 1445')
  })

  it('returns empty string for null input', () => {
    expect(formatHijriDate(null)).toBe('')
    expect(formatHijriDate(null, 'short')).toBe('')
    expect(formatHijriDate(null, 'long')).toBe('')
  })

  it('handles single-digit days correctly', () => {
    const date = { ...sampleDate, day: 1 }
    expect(formatHijriDate(date)).toBe('1 Ramadan 1445 AH')
    expect(formatHijriDate(date, 'short')).toBe('1 Ram 1445')
  })

  it('truncates month name to 3 characters in short style', () => {
    const muharramDate = { ...sampleDate, monthName: 'Muharram' }
    expect(formatHijriDate(muharramDate, 'short')).toBe('15 Muh 1445')

    const dhulHijjahDate = { ...sampleDate, monthName: 'Dhul Hijjah' }
    expect(formatHijriDate(dhulHijjahDate, 'short')).toBe('15 Dhu 1445')
  })
})

describe('gregorianToHijri and hijriToGregorian consistency', () => {
  it('maintains consistency across multiple dates', () => {
    // Test several known dates
    const testCases = [
      { hijri: { year: 1424, month: 1, day: 1 }, gregorian: new Date(2003, 2, 4) },
      { hijri: { year: 1424, month: 9, day: 1 }, gregorian: new Date(2003, 9, 26) }, // Oct 26, 2003
      { hijri: { year: 1425, month: 1, day: 1 }, gregorian: new Date(2004, 1, 21) },
    ]

    for (const { hijri, gregorian } of testCases) {
      // Gregorian to Hijri
      const toHijri = gregorianToHijri(gregorian)
      expect(toHijri?.year).toBe(hijri.year)
      expect(toHijri?.month).toBe(hijri.month)
      expect(toHijri?.day).toBe(hijri.day)

      // Hijri to Gregorian
      const toGregorian = hijriToGregorian(hijri.year, hijri.month, hijri.day)
      expect(toGregorian?.getFullYear()).toBe(gregorian.getFullYear())
      expect(toGregorian?.getMonth()).toBe(gregorian.getMonth())
      expect(toGregorian?.getDate()).toBe(gregorian.getDate())
    }
  })

  it('handles all days in a month correctly', () => {
    // Test all 30 days of Muharram 1424
    for (let day = 1; day <= 30; day++) {
      const gregorian = hijriToGregorian(1424, 1, day)
      expect(gregorian).not.toBeNull()

      const hijri = gregorianToHijri(gregorian!)
      expect(hijri?.day).toBe(day)
      expect(hijri?.month).toBe(1)
      expect(hijri?.year).toBe(1424)
    }
  })
})
