/**
 * Route wrapper for MonthView that gets data from PrayerLayout context
 */
import { MonthView } from './MonthView'
import { usePrayerLayoutContext } from './layouts'

export function MonthViewRoute() {
  const { getMonthPrayers, location } = usePrayerLayoutContext()
  
  return <MonthView getMonthPrayers={getMonthPrayers} location={location} />
}
