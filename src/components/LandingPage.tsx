import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { VirtuesSheet } from '@/components/VirtuesSheet'
import { gregorianToHijri, getMoonPhase } from '@/lib/data/hijriCalendar'
import { useIslamicEvents } from '@/hooks/useIslamicEvents'
import { DAY_INDEX } from '@/lib/constants/dateConstants'
import { AYYAM_AL_BEED_DAYS } from '@/lib/constants/hijriConstants'
import { LOCATION_SUFFIX } from '@/lib/constants/appConstants'
import { useCountdown } from '@/hooks/useCountdown'
import { Moon, Sun } from 'lucide-react'
import {
  NextPrayerCard,
  TodayBlessingsCard,
  NavigationButtons,
  MonthPickerModal,
} from '@/components/landing'

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
  const [virtuesSheet, setVirtuesSheet] = useState<{
    isOpen: boolean
    title: string
    content: string
  }>({
    isOpen: false,
    title: '',
    content: '',
  })
  const [showMonthPicker, setShowMonthPicker] = useState(false)

  const { countdown, progress } = useCountdown({
    targetTime: nextPrayer?.time || '00:00',
    currentPrayerTime: currentPrayer?.time,
  })

  const today = useMemo(() => new Date(), [])
  const hijriDate = useMemo(() => gregorianToHijri(today), [today])
  const moonPhase = hijriDate ? getMoonPhase(hijriDate.day) : null
  const dayOfWeek = today.getDay()
  const isFriday = dayOfWeek === DAY_INDEX.FRIDAY

  const { isFastingDay, recurringFasts, getMonthName, hijriMonths } =
    useIslamicEvents()
  const fastingInfo = useMemo(
    () => (hijriDate ? isFastingDay(hijriDate) : { isFasting: false }),
    [hijriDate, isFastingDay]
  )
  const monthInfo = hijriDate ? getMonthName(hijriDate.month) ?? null : null

  const openVirtuesSheet = useCallback((title: string, content: string) => {
    setVirtuesSheet({ isOpen: true, title, content })
  }, [])

  const recommendedPills = useMemo(() => {
    const pills: { label: string; content: string; type: string }[] = []

    if (isFriday) {
      pills.push({
        label: 'Surat al-Kahf',
        content:
          recurringFasts.friday?.details ||
          '# Friday\n\nRecite Surah Al-Kahf for blessings.',
        type: 'recommended',
      })
      pills.push({
        label: 'Durud',
        content:
          recurringFasts.friday?.details ||
          '# Friday\n\nSend abundant blessings upon the Prophet (ﷺ).',
        type: 'recommended',
      })
    }

    if (fastingInfo.isFasting && fastingInfo.reason) {
      pills.push({
        label: 'Fast Today',
        content: `# ${fastingInfo.reason}\n\nToday is a recommended day for fasting (${fastingInfo.type}).`,
        type: 'fast',
      })
    }

    if (hijriDate && AYYAM_AL_BEED_DAYS.includes(hijriDate.day)) {
      const existingFast = pills.find((p) => p.label === 'Fast Today')
      if (!existingFast) {
        pills.push({
          label: 'Ayyam al-Beed',
          content:
            recurringFasts.monthly?.ayyamAlBeed?.details ||
            '# Ayyam al-Beed\n\nThe White Days - 13th, 14th, 15th of the lunar month.',
          type: 'fast',
        })
      }
    }

    return pills
  }, [isFriday, fastingInfo, hijriDate, recurringFasts])
  const isAyyamAlBeed = hijriDate
    ? AYYAM_AL_BEED_DAYS.includes(hijriDate.day)
    : false

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
            <h1 className="text-base font-bold text-foreground leading-tight">
              Prayer Times
            </h1>
            <p className="text-[10px] text-muted-foreground">
              {location}{LOCATION_SUFFIX}
            </p>
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
              {today.toLocaleDateString('en-US', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
          <div className="text-3xl sm:text-4xl">{moonPhase?.icon}</div>
        </div>

        <NextPrayerCard
          nextPrayer={nextPrayer}
          currentPrayer={currentPrayer}
          countdown={countdown}
          progress={progress}
        />

        <TodayBlessingsCard
          isFriday={isFriday}
          isFasting={fastingInfo.isFasting}
          fastingReason={fastingInfo.reason}
          isAyyamAlBeed={isAyyamAlBeed}
          recommendedPills={recommendedPills}
          monthInfo={monthInfo}
          onPillClick={openVirtuesSheet}
        />

        <NavigationButtons
          onPrayerTimesClick={() => navigate('/prayer')}
          onHijriCalendarClick={() => navigate('/hijri')}
          onJumpToMonthClick={() => setShowMonthPicker(true)}
        />

        {installBanner}
      </div>

      <MonthPickerModal
        isOpen={showMonthPicker}
        currentMonth={hijriDate?.month ?? null}
        hijriMonths={hijriMonths}
        onMonthSelect={() => {
          setShowMonthPicker(false)
          navigate('/hijri')
        }}
        onClose={() => setShowMonthPicker(false)}
      />

      <VirtuesSheet
        isOpen={virtuesSheet.isOpen}
        onClose={() => setVirtuesSheet((prev) => ({ ...prev, isOpen: false }))}
        title={virtuesSheet.title}
        content={virtuesSheet.content}
      />
    </div>
  )
}
