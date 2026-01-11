import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { LucideIcon } from 'lucide-react'

interface ActionBannerProps {
  icon: LucideIcon
  message: string
  actionLabel: string
  onAction: () => void
  secondaryLabel?: string
  onSecondary?: () => void
}

export function ActionBanner({
  icon: Icon,
  message,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary
}: ActionBannerProps) {
  return (
    <Card className="bg-secondary/50 border-accent/20 backdrop-blur-sm">
      <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <span className="text-sm font-medium">{message}</span>
        </div>
        <div className="flex gap-2">
          {secondaryLabel && onSecondary && (
            <Button size="sm" variant="ghost" onClick={onSecondary}>
              {secondaryLabel}
            </Button>
          )}
          <Button size="sm" onClick={onAction} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {actionLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
