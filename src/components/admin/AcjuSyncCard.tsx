import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2, Loader2, Mail, RefreshCw } from 'lucide-react'

type Transition = {
  completed: { monthName: string; hijriYear: number; gregorianStart: string; days: number }
  newOngoing: { monthName: string; hijriYear: number; gregorianStart: string }
  newUpcoming: { monthName: string; hijriYear: number; gregorianStart: string }
}

type SyncStatus =
  | 'idle'
  | 'sending-code'
  | 'awaiting-code'
  | 'previewing'
  | 'reviewing'
  | 'applying'
  | 'success'
  | 'error'

export function AcjuSyncCard() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [token, setToken] = useState<string | null>(null)
  const [transitions, setTransitions] = useState<Transition[]>([])
  const [selectedCount, setSelectedCount] = useState(0)
  const [status, setStatus] = useState<SyncStatus>('idle')
  const [message, setMessage] = useState('')

  function reset() {
    setStatus('idle')
    setMessage('')
    setCode('')
    setToken(null)
    setTransitions([])
    setSelectedCount(0)
  }

  async function handleRequestCode(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending-code')
    setMessage('')

    try {
      const res = await fetch('/api/request-sync-acju', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStatus('error')
        setMessage(data.error || 'Failed to send sync code')
        return
      }
      setToken(data.token)
      setStatus('awaiting-code')
      setMessage(data.message || 'Check your email for a 6-digit code.')
    } catch (err) {
      console.error(err)
      setStatus('error')
      setMessage('Network error. Please try again.')
    }
  }

  async function handlePreview(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    setStatus('previewing')
    setMessage('')

    try {
      const res = await fetch('/api/preview-sync-acju', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, token }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStatus('awaiting-code')
        setMessage(data.error || 'Failed to fetch preview')
        return
      }
      setTransitions(data.transitions || [])
      setSelectedCount((data.transitions || []).length)
      setStatus('reviewing')
      setMessage(data.message || '')
    } catch (err) {
      console.error(err)
      setStatus('awaiting-code')
      setMessage('Network error. Please try again.')
    }
  }

  async function handleApply() {
    if (!token || selectedCount === 0) return
    setStatus('applying')
    setMessage('')

    try {
      const res = await fetch('/api/confirm-sync-acju', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, token, count: selectedCount }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStatus('reviewing')
        setMessage(data.error || 'Failed to apply sync')
        return
      }
      setStatus('success')
      setMessage(data.message || 'Sync workflow triggered.')
    } catch (err) {
      console.error(err)
      setStatus('reviewing')
      setMessage('Network error. Please try again.')
    }
  }

  function toggleRow(index: number) {
    // Cascading prefix selection: clicking row N selects rows 0..N.
    // Clicking row N when it's already the last selected unselects it (count = N).
    if (index + 1 === selectedCount) {
      setSelectedCount(index)
    } else {
      setSelectedCount(index + 1)
    }
  }

  return (
    <div className="mt-8 p-5 rounded-xl border border-border bg-card/60">
      <div className="flex items-center gap-2 mb-1">
        <RefreshCw className="w-4 h-4 text-blue-600" />
        <h3 className="text-base font-semibold text-foreground">Sync with ACJU</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Catch up the calendar by replaying ACJU's published month data. A one-time code will be emailed to the registered admin.
      </p>

      {status === 'success' && (
        <div className="space-y-3">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{message}</span>
          </div>
          <Button type="button" variant="outline" className="w-full" onClick={reset}>
            Done
          </Button>
        </div>
      )}

      {(status === 'idle' || status === 'sending-code' || status === 'error') && (
        <form onSubmit={handleRequestCode} className="space-y-3">
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

          {status === 'error' && message && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{message}</span>
            </div>
          )}

          <Button type="submit" disabled={status === 'sending-code'} className="w-full">
            {status === 'sending-code' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending code…
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Send sync code
              </>
            )}
          </Button>
        </form>
      )}

      {(status === 'awaiting-code' || status === 'previewing') && (
        <form onSubmit={handlePreview} className="space-y-3">
          <p className="text-xs text-muted-foreground">
            A 6-digit code was sent to <strong>{email}</strong>. It expires in 15 minutes.
          </p>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Sync code</label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              pattern="[0-9]{6}"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder-muted-foreground tracking-[0.4em] text-center text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              placeholder="000000"
            />
          </div>

          {message && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{message}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant="outline" onClick={reset}>
              Cancel
            </Button>
            <Button type="submit" disabled={status === 'previewing' || code.length !== 6}>
              {status === 'previewing' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading preview…
                </>
              ) : (
                'Preview sync'
              )}
            </Button>
          </div>
        </form>
      )}

      {(status === 'reviewing' || status === 'applying') && (
        <div className="space-y-3">
          {transitions.length === 0 ? (
            <>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Calendar is already in sync with ACJU.</span>
              </div>
              <Button type="button" variant="outline" className="w-full" onClick={reset}>
                Done
              </Button>
            </>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">
                {transitions.length} month{transitions.length === 1 ? '' : 's'} to sync. Tick a row to approve through that month (transitions apply in order).
              </p>
              <ul className="space-y-2">
                {transitions.map((t, i) => {
                  const checked = i < selectedCount
                  return (
                    <li
                      key={`${t.completed.hijriYear}-${t.completed.monthName}`}
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                        checked
                          ? 'border-primary/40 bg-primary/5'
                          : 'border-border bg-card hover:border-primary/30'
                      }`}
                      onClick={() => toggleRow(i)}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleRow(i)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1 h-4 w-4 accent-primary"
                      />
                      <div className="flex-1 text-sm">
                        <div className="font-medium text-foreground">
                          {t.completed.monthName} {t.completed.hijriYear} →{' '}
                          <span className="text-muted-foreground">{t.completed.days} days</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Started {t.completed.gregorianStart} · next ongoing {t.newOngoing.monthName} {t.newOngoing.hijriYear} ({t.newOngoing.gregorianStart})
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>

              {message && status === 'reviewing' && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{message}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant="outline" onClick={reset}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleApply}
                  disabled={status === 'applying' || selectedCount === 0}
                >
                  {status === 'applying' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Applying…
                    </>
                  ) : (
                    `Apply ${selectedCount} of ${transitions.length}`
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
