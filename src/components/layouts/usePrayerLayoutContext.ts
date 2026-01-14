/**
 * Hook for child routes to access prayer layout context
 */
import { useOutletContext } from 'react-router-dom'
import type { PrayerLayoutContext } from './PrayerLayout'

export function usePrayerLayoutContext() {
  return useOutletContext<PrayerLayoutContext>()
}
