// ============================================
// CENTRALIZED DATA TYPES
// All data contracts for the Prayer Times app
// ============================================

// ============================================
// PRAYER TIMES
// ============================================

export interface District {
  id: string
  name: string
  zone: string
}

export interface DailyPrayerTimes {
  day: number
  fajr: string
  sunrise: string
  dhuhr: string
  asr: string
  maghrib: string
  isha: string
}

export type PrayerName = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'

export interface PrayerInfo {
  name: string
  time: string
  displayName: string
  arabicName: string
}

// ============================================
// HIJRI CALENDAR
// ============================================

export interface HijriMonthInfo {
  number: number
  name: string
  nameArabic: string
  meaning: string
  details?: string
}

export interface HijriMonth {
  hijriYear: number
  hijriMonth: number
  monthName: string
  gregorianStart: string
  days: number
  status: 'completed' | 'ongoing' | 'upcoming'
}

export interface HijriDate {
  day: number
  month: number
  monthName: string
  year: number
  gregorianDate: Date
}

export interface CalendarDay {
  hijriDay: number
  gregorianDate: Date
  isCurrentMonth: boolean
  isToday: boolean
}

export interface MoonPhase {
  phase: string
  icon: string
}

// ============================================
// ISLAMIC EVENTS
// ============================================

export type EventType = 'holy' | 'eid' | 'fast' | 'recommended' | 'historical'
export type FastingType = 'obligatory' | 'recommended' | 'sunnah'

export interface IslamicEvent {
  id: string
  name: string
  nameArabic: string
  hijriMonth: number
  hijriDay: number
  type: EventType
  isFastingDay: boolean
  fastingType?: FastingType
  fastingForbidden?: boolean
  description: string
  details?: string
  isRecurring?: boolean
}

export interface WeeklyFast {
  id: string
  name: string
  nameArabic: string
  dayOfWeek: number
  type: string
  description: string
  details?: string
}

export interface AnnualFast {
  id: string
  name: string
  nameArabic: string
  hijriMonth: number
  startDay?: number
  endDay?: number
  duration?: number
  type: string
  description: string
  timing?: 'fixed' | 'flexible'
  details?: string
}

export interface MonthlyFast {
  ayyamAlBeed: {
    name: string
    nameArabic: string
    days: number[]
    type: string
    description: string
    details?: string
  }
}

export interface RecurringFasts {
  weekly: WeeklyFast[]
  monthly: MonthlyFast
  annual: AnnualFast[]
  friday?: {
    id: string
    name: string
    nameArabic: string
    details?: string
  }
}

export interface FastingInfo {
  isFasting: boolean
  type?: string
  reason?: string
}

export interface DayEvent {
  name: string
  type: string
  isRecurring: boolean
  details?: string
}

export interface UpcomingEvent {
  event: IslamicEvent
  gregorianDate: Date
  hijriDate: HijriDate
}

// ============================================
// VIRTUES (Markdown content)
// ============================================

export interface VirtuesData {
  months: Record<string, string>
  events: Record<string, string>
  recurring: Record<string, string>
}

// ============================================
// DATA FILE STRUCTURES
// ============================================

export interface PrayerTimesData {
  districts: District[]
  zones: Record<string, Record<string, DailyPrayerTimes[]>>
}

export interface HijriCalendarData {
  metadata: {
    source: string
    description: string
    lastUpdated: string
    generatedFrom: string
  }
  hijriMonths: HijriMonthInfo[]
  months: HijriMonth[]
}

export interface IslamicEventsData {
  metadata: {
    description: string
    source: string
    lastUpdated: string
  }
  events: IslamicEvent[]
  recurringFasts: {
    weekly: WeeklyFast[]
    monthly: MonthlyFast
    annual: AnnualFast[]
  }
}
