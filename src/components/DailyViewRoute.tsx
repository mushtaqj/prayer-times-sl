/**
 * Route wrapper for DailyView that gets data from PrayerLayout context
 */
import { DailyView } from './DailyView'
import { usePrayerLayoutContext } from './layouts'

export function DailyViewRoute() {
  const { todayPrayers, nextPrayer, currentPrayer, alarms, onToggleAlarm, location } = usePrayerLayoutContext()
  
  return (
    <DailyView
      prayers={todayPrayers}
      nextPrayer={nextPrayer}
      currentPrayer={currentPrayer}
      alarms={alarms}
      onToggleAlarm={onToggleAlarm}
      location={location}
    />
  )
}
