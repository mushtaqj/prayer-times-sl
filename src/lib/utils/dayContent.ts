import { RECURRING_FAST_IDS } from '@/lib/data/islamicEvents'
import { RAMADAN_NAME, FAST_NAMES, FASTING_TYPE } from '@/lib/constants/hijriConstants'
import { formatWeekday } from '@/lib/utils/date'

interface DayEvent {
  name: string
  type: string
  details?: string
}

interface FastingInfo {
  isFasting: boolean
  reason?: string
  type?: string
}

interface RecurringFasts {
  friday?: { details?: string }
  weekly: { id: string; details?: string }[]
  monthly: { ayyamAlBeed: { details?: string } }
}

interface GenerateDayContentParams {
  monthName: string
  hijriDay: number
  gregorianDate: Date
  dayEvents: DayEvent[]
  fastingInfo: FastingInfo
  isFriday: boolean
  recurringFasts: RecurringFasts
}

const DEFAULT_FRIDAY_BLESSINGS = `## Friday Blessings
- **Surah Kahf**: Recite for light until next Friday
- **Salawat**: Send abundant blessings upon the Prophet ﷺ
- **Best Dua Time**: Between Asr and Maghrib
- **Jumu'ah Prayer**: Obligatory for men`

/**
 * Generate content for day events
 */
function generateEventsContent(dayEvents: DayEvent[]): string {
  return dayEvents
    .map(e => e.details ? e.details : `## ${e.name}\n*${e.type}*`)
    .join('\n\n')
}

/**
 * Generate Friday blessings content
 */
function generateFridayContent(recurringFasts: RecurringFasts): string {
  return recurringFasts.friday?.details ?? DEFAULT_FRIDAY_BLESSINGS
}

/**
 * Get fasting details based on fast type
 */
function getFastingDetails(
  fastingInfo: FastingInfo,
  recurringFasts: RecurringFasts
): string | null {
  if (!fastingInfo.isFasting || fastingInfo.reason === RAMADAN_NAME) {
    return null
  }

  switch (fastingInfo.reason) {
    case FAST_NAMES.MONDAY_FAST:
      return recurringFasts.weekly.find(f => f.id === RECURRING_FAST_IDS.MONDAY)?.details ?? null

    case FAST_NAMES.THURSDAY_FAST:
      return recurringFasts.weekly.find(f => f.id === RECURRING_FAST_IDS.THURSDAY)?.details ?? null

    case FAST_NAMES.AYYAM_AL_BEED_FULL:
      return recurringFasts.monthly.ayyamAlBeed.details ?? null

    default:
      return `## Fasting\n- **${fastingInfo.reason}** (${fastingInfo.type})`
  }
}

/**
 * Generate fasting content section
 */
function generateFastingContent(
  fastingInfo: FastingInfo,
  recurringFasts: RecurringFasts
): string | null {
  if (fastingInfo.type === FASTING_TYPE.FORBIDDEN) {
    return `## Fasting Forbidden\n- **${fastingInfo.reason}**: Fasting is prohibited on this day`
  }

  return getFastingDetails(fastingInfo, recurringFasts)
}

export function generateDayContent({
  monthName,
  hijriDay,
  gregorianDate,
  dayEvents,
  fastingInfo,
  isFriday,
  recurringFasts,
}: GenerateDayContentParams): string {
  const dayName = formatWeekday(gregorianDate)
  const sections: string[] = [`# ${dayName}, ${monthName} ${hijriDay}`]

  if (dayEvents.length > 0) {
    sections.push(generateEventsContent(dayEvents))
  }

  if (isFriday) {
    sections.push(generateFridayContent(recurringFasts))
  }

  const fastingContent = generateFastingContent(fastingInfo, recurringFasts)
  if (fastingContent) {
    sections.push(fastingContent)
  }

  return sections.join('\n\n') + '\n\n'
}
