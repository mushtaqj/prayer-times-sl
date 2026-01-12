import { Moon, Sun, Sunrise, Sunset, CloudSun } from 'lucide-react'

export function getPrayerIcon(prayerName: string, className = 'w-8 h-8 sm:w-12 sm:h-12 drop-shadow-lg') {
  switch (prayerName.toLowerCase()) {
    case 'fajr':
    case 'sunrise':
      return <Sunrise className={className} />
    case 'dhuhr':
      return <Sun className={className} />
    case 'asr':
      return <CloudSun className={className} />
    case 'maghrib':
      return <Sunset className={className} />
    case 'isha':
    default:
      return <Moon className={className} />
  }
}
