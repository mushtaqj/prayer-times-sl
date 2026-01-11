import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Lock, Moon, CheckCircle, AlertCircle, Loader2, Calendar, ArrowRight } from 'lucide-react'
import hijriData from '@/data/hijriCalendar.json'

const MONTH_NAMES = [
  'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
  'Jumada al-Awwal', 'Jumada al-Akhirah', 'Rajab', 'Shaban',
  'Ramadan', 'Shawwal', 'Dhul Qadah', 'Dhul Hijjah'
]

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error'

export function AdminPage() {
  const [adminSecret, setAdminSecret] = useState('')
  const [days, setDays] = useState<29 | 30>(30)
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [message, setMessage] = useState('')

  // Find current ongoing month
  const currentMonth = useMemo(() => {
    return hijriData.months.find(m => m.status === 'ongoing')
  }, [])

  // Calculate what the next month will be
  const nextMonth = useMemo(() => {
    if (!currentMonth) return null
    const nextHijriMonth = currentMonth.hijriMonth === 12 ? 1 : currentMonth.hijriMonth + 1
    const nextHijriYear = currentMonth.hijriMonth === 12 ? currentMonth.hijriYear + 1 : currentMonth.hijriYear
    return {
      hijriMonth: nextHijriMonth,
      hijriYear: nextHijriYear,
      monthName: MONTH_NAMES[nextHijriMonth - 1]
    }
  }, [currentMonth])

  // Calculate next month's start date based on selected days
  const nextStartDate = useMemo(() => {
    if (!currentMonth) return null
    const start = new Date(currentMonth.gregorianStart)
    start.setDate(start.getDate() + days)
    return start.toLocaleDateString('en-US', {
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
      const response = await fetch('/api/trigger-hijri-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Secret': adminSecret,
        },
        body: JSON.stringify({ days }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(data.message || 'Update triggered successfully!')
      } else {
        setStatus('error')
        setMessage(data.error || 'Failed to trigger update')
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
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Moon className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            Complete Hijri Month
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Mark the current month as complete and start the next
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
            <ArrowRight className="w-6 h-6 text-muted-foreground" />
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Next Month</p>
              <p className="text-lg font-semibold text-primary">
                {nextMonth.monthName} {nextMonth.hijriYear}
              </p>
              <p className="text-sm text-muted-foreground">
                Will start {nextStartDate}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Admin Secret */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Lock className="w-4 h-4" />
              Admin Password
            </label>
            <input
              type="password"
              value={adminSecret}
              onChange={(e) => setAdminSecret(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Enter admin password"
            />
          </div>

          {/* Days Selection */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Calendar className="w-4 h-4" />
              How many days was {currentMonth.monthName}?
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

          {/* Status Message */}
          {message && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg ${
                status === 'success'
                  ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                  : 'bg-red-500/10 text-red-600 dark:text-red-400'
              }`}
            >
              {status === 'success' ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
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
                Updating...
              </>
            ) : (
              <>
                Complete {currentMonth.monthName} & Start {nextMonth.monthName}
              </>
            )}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-6">
          This will trigger an update and redeploy the app automatically.
          Changes will be live in approximately 2 minutes.
        </p>
      </div>
    </div>
  )
}
