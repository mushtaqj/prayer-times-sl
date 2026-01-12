import { Button } from '@/components/ui/button'
import {
  Lock,
  Moon,
  AlertCircle,
  Loader2,
  Calendar,
  Mail,
  RotateCcw,
} from 'lucide-react'

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error'
type ActionMode = 'update' | 'rollback'

interface PreviousMonthInfo {
  monthName: string
  hijriYear: number
  days: number
}

interface CurrentMonthInfo {
  monthName: string
  hijriYear: number
}

interface AdminFormProps {
  email: string
  password: string
  days: 29 | 30
  actionMode: ActionMode
  status: SubmitStatus
  message: string
  currentMonth: CurrentMonthInfo
  previousMonth: PreviousMonthInfo | null
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onDaysChange: (value: 29 | 30) => void
  onActionModeChange: (mode: ActionMode) => void
  onSubmit: (e: React.FormEvent) => void
}

export function AdminForm({
  email,
  password,
  days,
  actionMode,
  status,
  message,
  currentMonth,
  previousMonth,
  onEmailChange,
  onPasswordChange,
  onDaysChange,
  onActionModeChange,
  onSubmit,
}: AdminFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Action Mode Toggle */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-muted/50 rounded-lg border border-border/50">
        <button
          type="button"
          onClick={() => onActionModeChange('update')}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
            actionMode === 'update'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Moon className="w-4 h-4" />
          Complete Month
        </button>
        <button
          type="button"
          onClick={() => onActionModeChange('rollback')}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
            actionMode === 'rollback'
              ? 'bg-amber-500/10 text-amber-600 shadow-sm border border-amber-500/20'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          Rollback
        </button>
      </div>

      {/* Rollback Warning */}
      {actionMode === 'rollback' && previousMonth && (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <p className="text-sm text-amber-700 dark:text-amber-400">
            <strong>Rollback will:</strong> Remove {currentMonth.monthName}{' '}
            {currentMonth.hijriYear} and restore {previousMonth.monthName}{' '}
            {previousMonth.hijriYear} ({previousMonth.days} days) to ongoing
            status.
          </p>
        </div>
      )}

      {/* Email */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Mail className="w-4 h-4" />
          Authorized Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          required
          className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          placeholder="your@email.com"
        />
      </div>

      {/* Password */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Lock className="w-4 h-4" />
          Admin Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          required
          className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          placeholder="Enter admin password"
        />
      </div>

      {/* Days Selection - Only show for update mode */}
      {actionMode === 'update' && (
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Calendar className="w-4 h-4" />
            Days in {currentMonth.monthName}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onDaysChange(29)}
              className={`p-4 rounded-xl border-2 transition-all ${
                days === 29
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card text-foreground hover:border-primary/50'
              }`}
            >
              <span className="text-2xl font-bold">29</span>
              <span className="block text-sm opacity-70">days</span>
            </button>
            <button
              type="button"
              onClick={() => onDaysChange(30)}
              className={`p-4 rounded-xl border-2 transition-all ${
                days === 30
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card text-foreground hover:border-primary/50'
              }`}
            >
              <span className="text-2xl font-bold">30</span>
              <span className="block text-sm opacity-70">days</span>
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {status === 'error' && message && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{message}</span>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={status === 'loading'}
        className={`w-full ${actionMode === 'rollback' ? 'bg-amber-600 hover:bg-amber-700' : ''}`}
        size="lg"
      >
        {status === 'loading' ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Sending Confirmation...
          </>
        ) : actionMode === 'rollback' ? (
          <>
            <RotateCcw className="w-4 h-4 mr-2" />
            Request Rollback
          </>
        ) : (
          <>
            <Mail className="w-4 h-4 mr-2" />
            Send Confirmation Email
          </>
        )}
      </Button>
    </form>
  )
}
