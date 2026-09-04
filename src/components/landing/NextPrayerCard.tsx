import { Card, CardContent } from '@/components/ui/card'
import { CircleProgress } from '@/components/common/CircleProgress'
import { getPrayerIcon } from '@/lib/utils/prayerIcons'

/**
 * Warm glow only while the sky is actually changing: the window before
 * sunrise (next prayer is Sunrise) and before sunset (next prayer is Maghrib).
 * Every other time of day the card is plain primary, matching the prayer banner.
 */
function getSkyTint(nextPrayerName: string): 'dawn' | 'dusk' | null {
  const key = nextPrayerName.toLowerCase()
  if (key === 'sunrise') return 'dawn'
  if (key === 'maghrib') return 'dusk'
  return null
}

interface PrayerInfo {
  name: string
  time: string
  displayName: string
  arabicName: string
}

interface NextPrayerCardProps {
  nextPrayer: PrayerInfo
  currentPrayer: PrayerInfo
  countdown: string
  progress: number
}

export function NextPrayerCard({
  nextPrayer,
  currentPrayer,
  countdown,
  progress,
}: NextPrayerCardProps) {
  const skyTint = getSkyTint(nextPrayer.name)

  return (
    <Card
      className="relative overflow-hidden border-none shadow-lg bg-primary text-primary-foreground"
      data-sky={skyTint ?? 'none'}
    >
      {/* Same subtle highlight as the prayer page banner */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent scale-150" />

      {/* Dawn: warmth rising from the bottom edge. Dusk: warmth settling into the lower corner. */}
      {skyTint === 'dawn' && (
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[28rem] h-48 rounded-full bg-amber-200/35 blur-3xl pointer-events-none" />
      )}
      {skyTint === 'dusk' && (
        <div className="absolute -bottom-20 -right-16 w-72 h-72 rounded-full bg-orange-300/35 blur-3xl pointer-events-none" />
      )}

      <CardContent className="relative z-10 p-3 sm:p-4 flex flex-col items-center">
        <div className="mb-1 sm:mb-2 text-white/90">
          {getPrayerIcon(nextPrayer.displayName)}
        </div>

        <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] opacity-70">
          Next Prayer
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold font-heading">
          {nextPrayer.displayName}
        </h1>
        <p className="text-sm opacity-80 font-arabic">{nextPrayer.arabicName}</p>

        {/* Circular Progress Timer - Responsive */}
        <div className="my-2 sm:my-3">
          {/* Mobile size */}
          <CircleProgress progress={progress} size={140} className="sm:hidden">
            <span className="text-2xl font-bold">{nextPrayer.time}</span>
            <span className="text-xs opacity-80">in {countdown}</span>
          </CircleProgress>
          {/* Desktop size */}
          <CircleProgress
            progress={progress}
            size={180}
            className="hidden sm:block"
          >
            <span className="text-3xl font-bold">{nextPrayer.time}</span>
            <span className="text-sm opacity-80">in {countdown}</span>
          </CircleProgress>
        </div>

        {/* Current Prayer indicator */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
          <span className="text-[10px] sm:text-xs text-white/70">Current:</span>
          <span className="font-semibold text-white text-sm">
            {currentPrayer.displayName}
          </span>
          <span className="text-[10px] sm:text-xs text-white/70">
            ({currentPrayer.time})
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
