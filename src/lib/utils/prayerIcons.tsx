import { Moon, Sun, Sunrise, Sunset, CloudSun } from 'lucide-react'
import { PRAYER_NAME } from '@/lib/constants/prayerConstants'

export function getPrayerIcon(prayerName: string, className = 'w-8 h-8 sm:w-12 sm:h-12 drop-shadow-lg') {
  switch (prayerName.toLowerCase()) {
    case PRAYER_NAME.FAJR:
    case PRAYER_NAME.SUNRISE:
      return <Sunrise className={className} />
    case PRAYER_NAME.DHUHR:
      return <Sun className={className} />
    case PRAYER_NAME.ASR:
      return <CloudSun className={className} />
    case PRAYER_NAME.MAGHRIB:
      return <Sunset className={className} />
    case PRAYER_NAME.ISHA:
    default:
      return <Moon className={className} />
  }
}
