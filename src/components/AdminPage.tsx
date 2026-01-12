import { useState, useMemo } from 'react'
import { Moon, AlertCircle, Shield } from 'lucide-react'
import { months, hijriMonths } from '@/lib/data/hijriCalendar'
import { addDays, formatDate, parseDate } from '@/lib/utils/date'
import { LAST_HIJRI_MONTH, FIRST_HIJRI_MONTH } from '@/lib/constants/hijriConstants'
import {
  AdminForm,
  AdminSuccessState,
  MonthTransitionCard,
  RecentChangesHistory,
  SecurityNote,
} from '@/components/admin'

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error'
type ActionMode = 'update' | 'rollback'

export function AdminPage() {
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [days, setDays] = useState<29 | 30>(30)
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [message, setMessage] = useState('')
  const [actionMode, setActionMode] = useState<ActionMode>('update')

  // Find current ongoing month
  const currentMonth = useMemo(() => {
    return months.find((m) => m.status === 'ongoing')
  }, [])

  // Calculate what the next month will be
  const nextMonth = useMemo(() => {
    if (!currentMonth) return null
    const isLastMonth = currentMonth.hijriMonth === LAST_HIJRI_MONTH
    const nextHijriMonth = isLastMonth
      ? FIRST_HIJRI_MONTH
      : currentMonth.hijriMonth + 1
    const nextHijriYear = isLastMonth
      ? currentMonth.hijriYear + 1
      : currentMonth.hijriYear
    const monthInfo = hijriMonths.find((m) => m.number === nextHijriMonth)
    return {
      hijriMonth: nextHijriMonth,
      hijriYear: nextHijriYear,
      monthName: monthInfo?.name ?? `Month ${nextHijriMonth}`,
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
      day: 'numeric',
    })
  }, [currentMonth, days])

  // Get recently completed months (last 5)
  const recentMonths = useMemo(() => {
    return months
      .filter((m) => m.status === 'completed')
      .slice(-5)
      .reverse()
  }, [])

  // Previous month (for rollback info)
  const previousMonth = useMemo(() => {
    const ongoingIndex = months.findIndex((m) => m.status === 'ongoing')
    if (ongoingIndex > 0) {
      return months[ongoingIndex - 1]
    }
    return null
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    const endpoint =
      actionMode === 'rollback' ? '/api/request-rollback' : '/api/request-update'
    const body =
      actionMode === 'rollback' ? { password, email } : { password, email, days }

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
        if (data.error === 'Email service not configured') {
          setMessage(
            'Email service not configured. Please contact the administrator to set up RESEND_API_KEY in environment variables.'
          )
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
        <MonthTransitionCard
          currentMonth={{
            monthName: currentMonth.monthName,
            hijriYear: currentMonth.hijriYear,
            gregorianStart: currentMonth.gregorianStart,
          }}
          nextMonth={{
            monthName: nextMonth.monthName,
            hijriYear: nextMonth.hijriYear,
          }}
          nextStartDate={nextStartDate ?? ''}
        />

        {status === 'success' ? (
          <AdminSuccessState
            actionMode={actionMode}
            message={message}
            onReset={resetForm}
          />
        ) : (
          <AdminForm
            email={email}
            password={password}
            days={days}
            actionMode={actionMode}
            status={status}
            message={message}
            currentMonth={{
              monthName: currentMonth.monthName,
              hijriYear: currentMonth.hijriYear,
            }}
            previousMonth={
              previousMonth
                ? {
                    monthName: previousMonth.monthName,
                    hijriYear: previousMonth.hijriYear,
                    days: previousMonth.days,
                  }
                : null
            }
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onDaysChange={setDays}
            onActionModeChange={setActionMode}
            onSubmit={handleSubmit}
          />
        )}

        <SecurityNote />
        <RecentChangesHistory recentMonths={recentMonths} />
      </div>
    </div>
  )
}
