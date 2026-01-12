import { Button } from '@/components/ui/button'
import { Mail, RotateCcw } from 'lucide-react'

interface AdminSuccessStateProps {
  actionMode: 'update' | 'rollback'
  message: string
  onReset: () => void
}

export function AdminSuccessState({
  actionMode,
  message,
  onReset,
}: AdminSuccessStateProps) {
  const isRollback = actionMode === 'rollback'

  return (
    <div className={`${isRollback ? 'bg-amber-500/5 border-amber-500/20' : 'bg-primary/5 border-primary/20'} border rounded-xl p-6 text-center`}>
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${isRollback ? 'bg-amber-500/10' : 'bg-primary/10'} mb-4`}>
        {isRollback ? (
          <RotateCcw className="w-6 h-6 text-amber-600" />
        ) : (
          <Mail className="w-6 h-6 text-primary" />
        )}
      </div>
      <h2 className="text-lg font-semibold text-foreground mb-2">Check Your Email</h2>
      <p className="text-muted-foreground text-sm mb-4">{message}</p>
      <p className="text-muted-foreground/70 text-xs">
        The confirmation link expires in 15 minutes.
      </p>
      <Button
        variant="outline"
        className="mt-4"
        onClick={onReset}
      >
        Send Another Request
      </Button>
    </div>
  )
}
