/**
 * Centralized Data Access Layer
 * Re-exports from domain-specific data modules
 */

// ============================================================================
// PRAYER TIMES
// ============================================================================
export {
  districts,
  getDistricts,
  getDistrictById,
  getDistrictsByZone,
  getPrayerTimesForDay,
  getPrayerTimesForMonth,
  getTodayPrayerTimes,
} from './prayerTimes'

// ============================================================================
// HIJRI CALENDAR
// ============================================================================
export {
  months,
  hijriMonths,
  enrichedHijriMonths,
  availableYears,
  metadata as hijriMetadata,
  getMoonPhase,
  gregorianToHijri,
  hijriToGregorian,
  formatHijriDate,
  getTodayHijri,
  getHijriMonthInfo,
  getEnrichedHijriMonthInfo,
  getOngoingHijriMonth,
  getHijriMonth,
  todayHijri,
} from './hijriCalendar'

// ============================================================================
// ISLAMIC EVENTS
// ============================================================================
export {
  events,
  hijriMonths as eventHijriMonths,
  recurringFasts,
  weeklyFastDetails,
  getEventsForDate,
  getEventsForMonth,
  getFastingInfo,
  hasEvent,
  getAllEventsForDay,
  getMonthByNumber,
  getTodayEvents,
  getUpcomingEvents,
  getEventTypeColor,
} from './islamicEvents'

// ============================================================================
// VIRTUES
// ============================================================================
export {
  monthVirtues,
  eventVirtues,
  recurringVirtues,
  getMonthVirtue,
  getEventVirtue,
  getRecurringVirtue,
} from './virtues'

// ============================================================================
// TYPES
// ============================================================================
export * from './types'
