import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Lock, Moon, AlertCircle, Loader2, Calendar, ArrowRight, Mail, Shield } from 'lucide-react'
import { months, hijriMonths } from '@/lib/data/hijriCalendar'
import { addDays, formatDate, parseDate } from '@/lib/utils/date'
import { LAST_HIJRI_MONTH, FIRST_HIJRI_MONTH } from '@/lib/utils/hijriConstants'

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error'

export function AdminPage() {
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [days, setDays] = useState<29 | 30>(30)
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [message, setMessage] = useState('')

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    try {
      const response = await fetch('/api/request-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password, email, days }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(data.message || 'Confirmation email sent!')
      } else {
        setStatus('error')
        setMessage(data.error || 'Request failed')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Network error. Please try again.')
      console.error('Submit error:', error)
    }
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
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Check Your Email</h2>
            <p className="text-muted-foreground text-sm mb-4">{message}</p>
            <p className="text-muted-foreground/70 text-xs">
              The confirmation link expires in 15 minutes.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setStatus('idle')
                setMessage('')
              }}
            >
              Send Another Request
            </Button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="space-y-5">
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

            {/* Days Selection */}
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

            {/* Error Message */}
            {status === 'error' && message && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{message}</span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={status === 'loading'}
              className="w-full"
              size="lg"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending Confirmation...
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
      </div>
    </div>
  )
}
