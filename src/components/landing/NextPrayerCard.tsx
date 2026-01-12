import { Card, CardContent } from '@/components/ui/card'
import { CircleProgress } from '@/components/common/CircleProgress'
import { getPrayerIcon } from '@/lib/utils/prayerIcons'

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
  return (
    <Card className="relative overflow-hidden border-none shadow-lg bg-gradient-to-br from-primary via-primary to-accent text-primary-foreground">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </div>

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
