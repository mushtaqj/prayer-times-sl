import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { VirtuesSheet } from '@/components/VirtuesSheet'
import { CircleProgress } from '@/components/common/CircleProgress'
import { gregorianToHijri, getMoonPhase } from '@/lib/data/hijriCalendar'
import { useIslamicEvents } from '@/hooks/useIslamicEvents'
import { useCountdown } from '@/hooks/useCountdown'
import { Clock, Calendar, CalendarSearch, Moon, Sun, Sunrise, Sunset, CloudSun } from 'lucide-react'

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
  isDark: boolean
  onThemeToggle: () => void
  installBanner?: React.ReactNode
}

export function LandingPage({
  currentPrayer,
  nextPrayer,
  location,
  isDark,
  onThemeToggle,
  installBanner,
}: LandingPageProps) {
  const navigate = useNavigate()
  const [virtuesSheet, setVirtuesSheet] = useState<{ isOpen: boolean; title: string; content: string }>({
    isOpen: false,
    title: '',
    content: ''
  })
  const [showMonthPicker, setShowMonthPicker] = useState(false)

  // Use the countdown hook
  const { countdown, progress } = useCountdown({
    targetTime: nextPrayer?.time || '00:00',
    currentPrayerTime: currentPrayer?.time,
  })

  const today = new Date()
  const hijriDate = gregorianToHijri(today)
  const moonPhase = hijriDate ? getMoonPhase(hijriDate.day) : null
  const dayOfWeek = today.getDay()
  const isFriday = dayOfWeek === 5

  const { isFastingDay, recurringFasts, getMonthName, hijriMonths } = useIslamicEvents()
  const fastingInfo = hijriDate ? isFastingDay(hijriDate) : { isFasting: false }
  const monthInfo = hijriDate ? getMonthName(hijriDate.month) : null

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
    const iconClass = "w-8 h-8 sm:w-12 sm:h-12 drop-shadow-lg"
    switch (prayerName.toLowerCase()) {
      case 'fajr':
      case 'sunrise':
        return <Sunrise className={iconClass} />
      case 'dhuhr':
        return <Sun className={iconClass} />
      case 'asr':
        return <CloudSun className={iconClass} />
      case 'maghrib':
        return <Sunset className={iconClass} />
      case 'isha':
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

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden">
      {/* Mini Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-background/80 backdrop-blur-sm border-b border-border/30 shrink-0">
        <div className="flex items-center gap-2">
          <img
            src="/icon-192x192.png"
            alt="Prayer Times"
            className="w-8 h-8 rounded-lg shadow-md"
          />
          <div>
            <h1 className="text-base font-bold text-foreground leading-tight">Prayer Times</h1>
            <p className="text-[10px] text-muted-foreground">{location}, Sri Lanka</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onThemeToggle}
          className="h-8 w-8 rounded-full bg-muted/50"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
      </div>

      <div className="flex-1 px-3 py-2 space-y-2 sm:space-y-3 overflow-y-auto">
        {/* Date Header - Compact */}
        <div className="flex items-center justify-between">
          <div>
            {hijriDate && (
              <h2 className="text-xl sm:text-2xl font-bold text-primary leading-tight">
                {hijriDate.day} {hijriDate.monthName} {hijriDate.year}
              </h2>
            )}
            <p className="text-xs sm:text-sm text-muted-foreground">
              {today.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <div className="text-3xl sm:text-4xl">{moonPhase?.icon}</div>
        </div>

        {/* Hero Section - Next Prayer */}
        <Card className="relative overflow-hidden border-none shadow-lg bg-gradient-to-br from-primary via-primary to-accent text-primary-foreground">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          </div>

          <CardContent className="relative z-10 p-3 sm:p-4 flex flex-col items-center">
            <div className="mb-1 sm:mb-2 text-white/90">
              {getPrayerIcon(nextPrayer.displayName)}
            </div>

            <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] opacity-70">Next Prayer</p>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading">{nextPrayer.displayName}</h1>
            <p className="text-sm opacity-80 font-arabic">{nextPrayer.arabicName}</p>

            {/* Circular Progress Timer - Responsive */}
            <div className="my-2 sm:my-3">
              {/* Mobile size */}
              <CircleProgress progress={progress} size={140} className="sm:hidden">
                <span className="text-2xl font-bold">{nextPrayer.time}</span>
                <span className="text-xs opacity-80">in {countdown}</span>
              </CircleProgress>
              {/* Desktop size */}
              <CircleProgress progress={progress} size={180} className="hidden sm:block">
                <span className="text-3xl font-bold">{nextPrayer.time}</span>
                <span className="text-sm opacity-80">in {countdown}</span>
              </CircleProgress>
            </div>

            {/* Current Prayer indicator */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
              <span className="text-[10px] sm:text-xs text-white/70">Current:</span>
              <span className="font-semibold text-white text-sm">{currentPrayer.displayName}</span>
              <span className="text-[10px] sm:text-xs text-white/70">({currentPrayer.time})</span>
            </div>
          </CardContent>
        </Card>

        {/* Today's Blessings Card - Compact */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden">
          <CardContent className="p-3">
            {(isFriday || fastingInfo.isFasting || (hijriDate && [13, 14, 15].includes(hijriDate.day))) ? (
              <>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {isFriday && (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      Jumu'ah
                    </span>
                  )}
                  {fastingInfo.isFasting && (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                      {fastingInfo.reason}
                    </span>
                  )}
                  {hijriDate && [13, 14, 15].includes(hijriDate.day) && !fastingInfo.isFasting && (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-sky-500/20 to-blue-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30">
                      Ayyam al-Beed
                    </span>
                  )}
                </div>

                {recommendedPills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {recommendedPills.map((pill, index) => (
                      <button
                        key={index}
                        onClick={() => openVirtuesSheet(pill.label, pill.content)}
                        className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all active:scale-[0.98] border border-primary/20"
                      >
                        {pill.label}
                      </button>
                    ))}
                    {monthInfo?.details && (
                      <button
                        onClick={() => openVirtuesSheet(monthInfo.name, monthInfo.details || '')}
                        className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-muted/50 text-muted-foreground hover:bg-muted transition-all"
                      >
                        About {monthInfo.name} →
                      </button>
                    )}
                  </div>
                )}
              </>
            ) : (
              monthInfo?.details && (
                <button
                  onClick={() => openVirtuesSheet(monthInfo.name, monthInfo.details || '')}
                  className="w-full text-left group"
                >
                  <div className="p-2.5 rounded-lg bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 border border-primary/10 hover:border-primary/20 transition-all">
                    <h3 className="text-xs font-semibold text-primary mb-1">
                      The Month of {monthInfo.name}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {monthInfo.details
                        .split('\n')
                        .filter(line => line.trim() && !line.startsWith('#') && !line.startsWith('>'))
                        .join(' ')
                        .replace(/\*\*/g, '')
                        .substring(0, 120)}...
                    </p>
                  </div>
                </button>
              )
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons - Compact */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => navigate('/prayer')}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20 hover:shadow-lg hover:scale-[1.02] transition-all active:scale-[0.98]"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[10px] sm:text-xs font-semibold">Prayer Times</span>
          </button>

          <button
            onClick={() => navigate('/hijri')}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20 hover:shadow-lg hover:scale-[1.02] transition-all active:scale-[0.98]"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-[10px] sm:text-xs font-semibold">Hijri Calendar</span>
          </button>

          <button
            onClick={() => setShowMonthPicker(true)}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20 hover:shadow-lg hover:scale-[1.02] transition-all active:scale-[0.98]"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <CalendarSearch className="w-5 h-5" />
            </div>
            <span className="text-[10px] sm:text-xs font-semibold">Jump to Month</span>
          </button>
        </div>

        {installBanner}
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
                    navigate('/hijri')
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

      <VirtuesSheet
        isOpen={virtuesSheet.isOpen}
        onClose={() => setVirtuesSheet(prev => ({ ...prev, isOpen: false }))}
        title={virtuesSheet.title}
        content={virtuesSheet.content}
      />
    </div>
  )
}
