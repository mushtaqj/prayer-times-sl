import { RECURRING_FAST_IDS } from '@/lib/data/islamicEvents'
import { RAMADAN_NAME } from '@/lib/constants/hijriConstants'
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
  let content = `# ${dayName}, ${monthName} ${hijriDay}\n\n`

  // Add events with their full details
  if (dayEvents.length > 0) {
    dayEvents.forEach((e) => {
      if (e.details) {
        content += e.details + `\n\n`
      } else {
        content += `## ${e.name}\n`
        content += `*${e.type}*\n\n`
      }
    })
  }

  // Add Friday info
  if (isFriday) {
    const fridayVirtues = recurringFasts.friday?.details
    if (fridayVirtues) {
      content += fridayVirtues + `\n\n`
    } else {
      content += `## Friday Blessings\n`
      content += `- **Surah Kahf**: Recite for light until next Friday\n`
      content += `- **Salawat**: Send abundant blessings upon the Prophet ﷺ\n`
      content += `- **Best Dua Time**: Between Asr and Maghrib\n`
      content += `- **Jumu'ah Prayer**: Obligatory for men\n\n`
    }
  }

  // Add fasting info with details
  if (fastingInfo.isFasting && fastingInfo.reason !== RAMADAN_NAME) {
    if (fastingInfo.reason === 'Monday Fast') {
      const mondayDetails = recurringFasts.weekly.find(
        (f) => f.id === RECURRING_FAST_IDS.MONDAY
      )?.details
      if (mondayDetails) {
        content += mondayDetails + `\n\n`
      }
    } else if (fastingInfo.reason === 'Thursday Fast') {
      const thursdayDetails = recurringFasts.weekly.find(
        (f) => f.id === RECURRING_FAST_IDS.THURSDAY
      )?.details
      if (thursdayDetails) {
        content += thursdayDetails + `\n\n`
      }
    } else if (fastingInfo.reason === 'Ayyam al-Beed (White Days)') {
      const ayyamDetails = recurringFasts.monthly.ayyamAlBeed.details
      if (ayyamDetails) {
        content += ayyamDetails + `\n\n`
      }
    } else {
      content += `## Fasting\n`
      content += `- **${fastingInfo.reason}** (${fastingInfo.type})\n\n`
    }
  } else if (fastingInfo.type === 'forbidden') {
    content += `## Fasting Forbidden\n`
    content += `- **${fastingInfo.reason}**: Fasting is prohibited on this day\n\n`
  }

  return content
}
