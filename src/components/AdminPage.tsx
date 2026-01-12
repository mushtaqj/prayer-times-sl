import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Lock, Moon, AlertCircle, Loader2, Calendar, ArrowRight, Mail, Shield, RotateCcw, ChevronDown, ChevronUp, History } from 'lucide-react'
import { months, hijriMonths } from '@/lib/data/hijriCalendar'
import { addDays, formatDate, parseDate } from '@/lib/utils/date'
import { LAST_HIJRI_MONTH, FIRST_HIJRI_MONTH } from '@/lib/utils/hijriConstants'

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error'
type ActionMode = 'update' | 'rollback'

export function AdminPage() {
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [days, setDays] = useState<29 | 30>(30)
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [message, setMessage] = useState('')
  const [actionMode, setActionMode] = useState<ActionMode>('update')
  const [showHistory, setShowHistory] = useState(false)

  // Find current ongoing month
  const currentMonth = useMemo(() => {
    return months.find(m => m.status === 'ongoing')
  }, [])

  // Calculate what the next month will be
  const nextMonth = useMemo(() => {
    if (!currentMonth) return null
    const isLastMonth = currentMonth.hijriMonth === LAST_HIJRI_MONTH
    const nextHijriMonth = isLastMonth ? FIRST_HIJRI_MONTH : currentMonth.hijriMonth + 1
    const nextHijriYear = isLastMonth ? currentMonth.hijriYear + 1 : currentMonth.hijriYear
    const monthInfo = hijriMonths.find(m => m.number === nextHijriMonth)
    return {
      hijriMonth: nextHijriMonth,
      hijriYear: nextHijriYear,
      monthName: monthInfo?.name ?? `Month ${nextHijriMonth}`
    }
  }, [currentMonth])

  // Calculate next month's start date based on selected days
  const nextStartDate = useMemo(() => {
    if (!currentMonth) return null
    const start = parseDate(currentMonth.gregorianStart)
    const nextStart = addDays(start, days)
    return formatDate(nextStart, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }, [currentMonth, days])

  // Get recently completed months (last 5)
  const recentMonths = useMemo(() => {
    return months
      .filter(m => m.status === 'completed')
      .slice(-5)
      .reverse()
  }, [])

  // Previous month (for rollback info)
  const previousMonth = useMemo(() => {
    const ongoingIndex = months.findIndex(m => m.status === 'ongoing')
    if (ongoingIndex > 0) {
      return months[ongoingIndex - 1]
    }
    return null
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    const endpoint = actionMode === 'rollback' ? '/api/request-rollback' : '/api/request-update'
    const body = actionMode === 'rollback'
      ? { password, email }
      : { password, email, days }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(data.message || 'Confirmation email sent!')
      } else {
        setStatus('error')
        // Provide more helpful error messages
        if (data.error === 'Email service not configured') {
          setMessage('Email service not configured. Please contact the administrator to set up RESEND_API_KEY in environment variables.')
        } else {
          setMessage(data.error || 'Request failed')
        }
      }
    } catch (error) {
      setStatus('error')
      setMessage('Network error. Please try again.')
      console.error('Submit error:', error)
    }
  }

  const resetForm = () => {
    setStatus('idle')
    setMessage('')
    setActionMode('update')
  }

  if (!currentMonth || !nextMonth) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <p>No ongoing month found in the calendar data.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <div className="max-w-md mx-auto pt-8">
        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm mb-6">
          <Shield className="w-4 h-4" />
          <span>Secure Admin Portal</span>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4 border border-primary/20">
            <Moon className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            Complete Hijri Month
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Two-factor verification required
          </p>
        </div>

        {/* Current Month Info */}
        <div className="bg-card border border-border rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Current Month</p>
              <p className="text-lg font-semibold text-foreground">
                {currentMonth.monthName} {currentMonth.hijriYear}
              </p>
              <p className="text-sm text-muted-foreground">
                Started {new Date(currentMonth.gregorianStart).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
            <ArrowRight className="w-6 h-6 text-muted-foreground/50" />
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Next Month</p>
              <p className="text-lg font-semibold text-primary">
                {nextMonth.monthName} {nextMonth.hijriYear}
              </p>
              <p className="text-sm text-muted-foreground">
                Starts {nextStartDate}
              </p>
            </div>
          </div>
        </div>

        {status === 'success' ? (
          /* Success State - Email Sent */
          <div className={`${actionMode === 'rollback' ? 'bg-amber-500/5 border-amber-500/20' : 'bg-primary/5 border-primary/20'} border rounded-xl p-6 text-center`}>
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${actionMode === 'rollback' ? 'bg-amber-500/10' : 'bg-primary/10'} mb-4`}>
              {actionMode === 'rollback' ? (
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
              onClick={resetForm}
            >
              Send Another Request
            </Button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Action Mode Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-muted/50 rounded-lg border border-border/50">
              <button
                type="button"
                onClick={() => setActionMode('update')}
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
                onClick={() => setActionMode('rollback')}
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
                  <strong>Rollback will:</strong> Remove {currentMonth.monthName} {currentMonth.hijriYear} and restore{' '}
                  {previousMonth.monthName} {previousMonth.hijriYear} ({previousMonth.days} days) to ongoing status.
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
                onChange={(e) => setEmail(e.target.value)}
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
                onChange={(e) => setPassword(e.target.value)}
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
                    onClick={() => setDays(29)}
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
                    onClick={() => setDays(30)}
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
        )}

        {/* Security Note */}
        <div className="mt-8 p-4 bg-card/50 rounded-lg border border-border">
          <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Two-Factor Verification
          </h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>1. Enter your authorized email and password</li>
            <li>2. Receive confirmation link via email</li>
            <li>3. Click link to confirm the update</li>
            <li>4. Changes deploy automatically</li>
          </ul>
        </div>

        {/* Recent History */}
        <div className="mt-6">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border hover:bg-card/80 transition-colors"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-foreground">
              <History className="w-4 h-4" />
              Recent Changes
            </span>
            {showHistory ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>

          {showHistory && recentMonths.length > 0 && (
            <div className="mt-2 border border-border rounded-lg overflow-hidden">
              {recentMonths.map((month, index) => (
                <div
                  key={`${month.hijriYear}-${month.hijriMonth}`}
                  className={`flex items-center justify-between p-3 text-sm ${
                    index !== recentMonths.length - 1 ? 'border-b border-border' : ''
                  } ${index === 0 ? 'bg-muted/30' : ''}`}
                >
                  <div>
                    <span className="font-medium text-foreground">
                      {month.monthName} {month.hijriYear}
                    </span>
                    <span className="text-muted-foreground ml-2">
                      ({month.days} days)
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(month.gregorianStart).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
