import { Card, CardContent } from '@/components/ui/card'

interface RecommendedPill {
  label: string
  content: string
  type: string
}

interface MonthInfo {
  name: string
  details?: string
}

interface TodayBlessingsCardProps {
  isFriday: boolean
  isFasting: boolean
  fastingReason?: string
  isAyyamAlBeed: boolean
  recommendedPills: RecommendedPill[]
  monthInfo: MonthInfo | null
  onPillClick: (title: string, content: string) => void
}

export function TodayBlessingsCard({
  isFriday,
  isFasting,
  fastingReason,
  isAyyamAlBeed,
  recommendedPills,
  monthInfo,
  onPillClick,
}: TodayBlessingsCardProps) {
  const hasSpecialDay = isFriday || isFasting || isAyyamAlBeed

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden">
      <CardContent className="p-3">
        {hasSpecialDay ? (
          <>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {isFriday && (
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Jumu'ah
                </span>
              )}
              {isFasting && fastingReason && (
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  {fastingReason}
                </span>
              )}
              {isAyyamAlBeed && !isFasting && (
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
                    onClick={() => onPillClick(pill.label, pill.content)}
                    className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all active:scale-[0.98] border border-primary/20"
                  >
                    {pill.label}
                  </button>
                ))}
                {monthInfo?.details && (
                  <button
                    onClick={() =>
                      onPillClick(monthInfo.name, monthInfo.details || '')
                    }
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
              onClick={() =>
                onPillClick(monthInfo.name, monthInfo.details || '')
              }
              className="w-full text-left group"
            >
              <div className="p-2.5 rounded-lg bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 border border-primary/10 hover:border-primary/20 transition-all">
                <h3 className="text-xs font-semibold text-primary mb-1">
                  The Month of {monthInfo.name}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {monthInfo.details
                    .split('\n')
                    .filter(
                      (line) =>
                        line.trim() &&
                        !line.startsWith('#') &&
                        !line.startsWith('>')
                    )
                    .join(' ')
                    .replace(/\*\*/g, '')
                    .substring(0, 120)}
                  ...
                </p>
              </div>
            </button>
          )
        )}
      </CardContent>
    </Card>
  )
}
