/**
 * Route wrapper for WeekView that gets data from PrayerLayout context
 */
import { WeekView } from './WeekView'
import { usePrayerLayoutContext } from './layouts'

export function WeekViewRoute() {
  const { weekPrayers, location } = usePrayerLayoutContext()
  
  return <WeekView prayers={weekPrayers} location={location} />
}
