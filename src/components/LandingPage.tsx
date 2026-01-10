import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { VirtuesSheet } from '@/components/VirtuesSheet'
import { gregorianToHijri, getMoonPhase } from '@/hooks/useHijriCalendar'
import { useIslamicEvents } from '@/hooks/useIslamicEvents'
import { Clock, Calendar, CalendarSearch, Moon, Sun, Sunrise, Sunset, CloudSun } from 'lucide-react'
import type { MainSection } from '@/components/Header'

interface PrayerInfo {
  name: string
  time: string
  displayName: string
  arabicName: string
}

interface LandingPageProps {
  currentPrayer: PrayerInfo | null
  nextPrayer: PrayerInfo | null
  location: string
  onNavigate: (section: MainSection) => void
  isDark: boolean
  onThemeToggle: () => void
}

function parseTime(time: string): Date {
  const now = new Date()
  const [timePart, period] = time.split(' ')
  const [hours, minutes] = timePart.split(':').map(Number)

  let targetHours = hours
  if (period === 'PM' && hours !== 12) targetHours += 12
  if (period === 'AM' && hours === 12) targetHours = 0

  const targetTime = new Date(now)
  targetTime.setHours(targetHours, minutes, 0, 0)
  return targetTime
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return 'Now'

  const totalMinutes = Math.floor(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

export function LandingPage({ currentPrayer, nextPrayer, location, onNavigate, isDark, onThemeToggle }: LandingPageProps) {
  const [countdown, setCountdown] = useState('')
  const [progress, setProgress] = useState(0)
  const [virtuesSheet, setVirtuesSheet] = useState<{ isOpen: boolean; title: string; content: string }>({
    isOpen: false,
    title: '',
    content: ''
  })
  const [showMonthPicker, setShowMonthPicker] = useState(false)

  const today = new Date()
  const hijriDate = gregorianToHijri(today)
  const moonPhase = hijriDate ? getMoonPhase(hijriDate.day) : null
  const dayOfWeek = today.getDay()
  const isFriday = dayOfWeek === 5

  const { isFastingDay, recurringFasts, getMonthName, hijriMonths } = useIslamicEvents()
  const fastingInfo = hijriDate ? isFastingDay(hijriDate) : { isFasting: false }
  const monthInfo = hijriDate ? getMonthName(hijriDate.month) : null

  // Update countdown every minute
  useEffect(() => {
    if (!nextPrayer || !currentPrayer) return

    const updateCountdown = () => {
      const now = new Date()
      let targetTime = parseTime(nextPrayer.time)

      // If target time is in the past, it means next prayer is tomorrow (Fajr)
      if (targetTime <= now) {
        targetTime.setDate(targetTime.getDate() + 1)
      }

      const diff = targetTime.getTime() - now.getTime()
      setCountdown(formatCountdown(diff))

      // Calculate progress
      const currentPrayerTime = parseTime(currentPrayer.time)
      let totalDuration = targetTime.getTime() - currentPrayerTime.getTime()

      if (totalDuration < 0) {
        currentPrayerTime.setDate(currentPrayerTime.getDate() - 1)
        totalDuration = targetTime.getTime() - currentPrayerTime.getTime()
      }

      const elapsed = now.getTime() - currentPrayerTime.getTime()
      const progressPercent = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100))
      setProgress(progressPercent)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 60000)
    return () => clearInterval(interval)
  }, [nextPrayer, currentPrayer])

  const openVirtuesSheet = (title: string, content: string) => {
    setVirtuesSheet({ isOpen: true, title, content })
  }

  // Determine recommended Ibadah pills based on the day
  const getRecommendedPills = () => {
    const pills: { label: string; content: string; type: string }[] = []

    if (isFriday) {
      pills.push({
        label: 'Surat al-Kahf',
        content: recurringFasts.friday?.details || '# Friday\n\nRecite Surah Al-Kahf for blessings.',
        type: 'recommended'
      })
      pills.push({
        label: 'Durud',
        content: recurringFasts.friday?.details || '# Friday\n\nSend abundant blessings upon the Prophet (ﷺ).',
        type: 'recommended'
      })
    }

    if (fastingInfo.isFasting && fastingInfo.reason) {
      pills.push({
        label: 'Fast Today',
        content: `# ${fastingInfo.reason}\n\nToday is a recommended day for fasting (${fastingInfo.type}).`,
        type: 'fast'
      })
    }

    // Add Ayyam al-Beed if applicable
    if (hijriDate && [13, 14, 15].includes(hijriDate.day)) {
      const existingFast = pills.find(p => p.label === 'Fast Today')
      if (!existingFast) {
        pills.push({
          label: 'Ayyam al-Beed',
          content: recurringFasts.monthly?.ayyamAlBeed?.details || '# Ayyam al-Beed\n\nThe White Days - 13th, 14th, 15th of the lunar month.',
          type: 'fast'
        })
      }
    }

    return pills
  }

  const recommendedPills = getRecommendedPills()

  // Get prayer icon based on prayer name
  const getPrayerIcon = (prayerName: string) => {
    const iconClass = "w-14 h-14 drop-shadow-lg"
    switch (prayerName.toLowerCase()) {
      case 'fajr':
        return <Sunrise className={iconClass} /> // Dawn
      case 'sunrise':
        return <Sunrise className={iconClass} /> // Sun rising
      case 'dhuhr':
        return <Sun className={iconClass} /> // Midday sun
      case 'asr':
        return <CloudSun className={iconClass} /> // Afternoon
      case 'maghrib':
        return <Sunset className={iconClass} /> // Sunset
      case 'isha':
        return <Moon className={iconClass} /> // Night
      default:
        return <Moon className={iconClass} />
    }
  }

  if (!currentPrayer || !nextPrayer) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Loading prayer times...</p>
      </div>
    )
  }

  // SVG circle parameters
  const size = 200
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="flex flex-col min-h-screen">
      {/* Mini Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-sm border-b border-border/30">
        <div className="flex items-center gap-3">
          <img
            src="/icon-192x192.png"
            alt="Prayer Times"
            className="w-10 h-10 rounded-xl shadow-md"
          />
          <div>
            <h1 className="text-lg font-bold text-foreground">Prayer Times</h1>
            <p className="text-xs text-muted-foreground">{location}, Sri Lanka</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onThemeToggle}
          className="h-9 w-9 rounded-full bg-muted/50"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
      </div>

      <div className="flex-1 px-4 py-4 space-y-4">
        {/* Hero Section - Next Prayer */}
        <Card className="relative overflow-hidden border-none shadow-xl bg-gradient-to-br from-primary via-primary to-accent text-primary-foreground">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          </div>

          <CardContent className="relative z-10 p-5 flex flex-col items-center">
            {/* Prayer-based Icon (sun/moon/sunrise/sunset) */}
            <div className="mb-3 text-white/90">
              {getPrayerIcon(nextPrayer.displayName)}
            </div>

            {/* Prayer Name */}
            <p className="text-xs uppercase tracking-[0.25em] opacity-70 mb-1">Next Prayer</p>
            <h1 className="text-4xl font-bold font-heading mb-0.5">{nextPrayer.displayName}</h1>
            <p className="text-base opacity-80 font-arabic">{nextPrayer.arabicName}</p>

            {/* Circular Progress Timer */}
            <div className="relative my-3">
              <svg width={size} height={size} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  className="opacity-20"
                />
                {/* Progress circle */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="opacity-90 transition-all duration-1000"
                />
              </svg>

              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">{nextPrayer.time}</span>
                <span className="text-sm opacity-80 mt-0.5">Starts in {countdown}</span>
              </div>
            </div>

            {/* Current Prayer indicator */}
            <div className="flex items-center gap-2 bg-amber-400/20 backdrop-blur-sm rounded-full px-4 py-2 border border-amber-400/30">
              <span className="text-xs text-amber-200">Current:</span>
              <span className="font-semibold text-amber-300">{currentPrayer.displayName}</span>
              <span className="text-xs text-amber-200">({currentPrayer.time})</span>
            </div>
          </CardContent>
        </Card>

        {/* Today's Blessings Card */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Today's Blessings</h2>

            {/* Hijri Date */}
            {hijriDate && (
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-lg font-semibold text-foreground">
                    {hijriDate.day} {hijriDate.monthName} {hijriDate.year}
                  </p>
                  <p className="text-xs text-muted-foreground">{location}</p>
                </div>
                <div className="text-2xl">{moonPhase?.icon}</div>
              </div>
            )}

            {/* Day Badges */}
            <div className="flex flex-wrap gap-2 mb-3">
              {isFriday && (
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Friday
                </span>
              )}
              {fastingInfo.isFasting && (
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  {fastingInfo.reason}
                </span>
              )}
              {hijriDate && [13, 14, 15].includes(hijriDate.day) && (
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30">
                  Ayyam al-Beed
                </span>
              )}
            </div>

            {/* Recommended Ibadah Pills */}
            {recommendedPills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {recommendedPills.map((pill, index) => (
                  <button
                    key={index}
                    onClick={() => openVirtuesSheet(pill.label, pill.content)}
                    className="px-3 py-1.5 text-xs font-medium rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/20"
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            )}

            {/* Month Virtue Teaser */}
            {monthInfo?.details && (
              <button
                onClick={() => openVirtuesSheet(monthInfo.name, monthInfo.details || '')}
                className="w-full text-left p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
              >
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {monthInfo.details.split('\n').find(line => line.trim() && !line.startsWith('#'))?.substring(0, 100)}...
                </p>
                <span className="text-xs text-primary font-medium group-hover:underline">Read more</span>
              </button>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons - All Green with Gradient */}
        <div className="grid grid-cols-3 gap-3">
          {/* Prayer Times Button */}
          <button
            onClick={() => onNavigate('prayer')}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-[1.02] transition-all active:scale-[0.98]"
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold">Prayer Times</span>
          </button>

          {/* Hijri Calendar Button */}
          <button
            onClick={() => onNavigate('hijri')}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-[1.02] transition-all active:scale-[0.98]"
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold">Hijri Calendar</span>
          </button>

          {/* Jump to Month Button */}
          <button
            onClick={() => setShowMonthPicker(true)}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-[1.02] transition-all active:scale-[0.98]"
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <CalendarSearch className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold">Jump to Month</span>
          </button>
        </div>
      </div>

      {/* Month Picker Modal */}
      {showMonthPicker && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-card w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="text-lg font-semibold">Jump to Hijri Month</h3>
              <p className="text-xs text-muted-foreground">Select a month to view in the calendar</p>
            </div>
            <div className="p-4 grid grid-cols-3 gap-2 max-h-[50vh] overflow-y-auto">
              {hijriMonths.map((month) => (
                <button
                  key={month.number}
                  onClick={() => {
                    setShowMonthPicker(false)
                    // Navigate to hijri calendar with the selected month
                    // We'll pass this through navigation state
                    onNavigate('hijri')
                  }}
                  className={`p-3 rounded-xl text-center transition-all hover:scale-[1.02] active:scale-[0.98] ${
                    hijriDate?.month === month.number
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-muted/50 hover:bg-muted text-foreground'
                  }`}
                >
                  <span className="text-sm font-medium block">{month.name}</span>
                  <span className="text-[10px] opacity-70">{month.nameArabic}</span>
                </button>
              ))}
            </div>
            <div className="p-4 border-t border-border">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowMonthPicker(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Virtues Sheet */}
      <VirtuesSheet
        isOpen={virtuesSheet.isOpen}
        onClose={() => setVirtuesSheet(prev => ({ ...prev, isOpen: false }))}
        title={virtuesSheet.title}
        content={virtuesSheet.content}
      />
    </div>
  )
}
