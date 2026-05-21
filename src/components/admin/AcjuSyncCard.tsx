import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2, Loader2, Mail, RefreshCw } from 'lucide-react'

type SyncStatus = 'idle' | 'sending' | 'awaiting-code' | 'confirming' | 'success' | 'error'

export function AcjuSyncCard() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [token, setToken] = useState<string | null>(null)
  const [status, setStatus] = useState<SyncStatus>('idle')
  const [message, setMessage] = useState('')

  async function handleRequestCode(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
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

  async function handleConfirmCode(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    setStatus('confirming')
    setMessage('')

    try {
      const res = await fetch('/api/confirm-sync-acju', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, token }),
      })
      const data = await res.json()

      if (!res.ok) {
        setStatus('awaiting-code')
        setMessage(data.error || 'Invalid code')
        return
      }

      setStatus('success')
      setMessage(data.message || 'Sync workflow triggered.')
      setCode('')
      setToken(null)
    } catch (err) {
      console.error(err)
      setStatus('awaiting-code')
      setMessage('Network error. Please try again.')
    }
  }

  function reset() {
    setStatus('idle')
    setMessage('')
    setCode('')
    setToken(null)
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

      {status === 'success' ? (
        <div className="space-y-3">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{message}</span>
          </div>
          <Button type="button" variant="outline" className="w-full" onClick={reset}>
            Done
          </Button>
        </div>
      ) : status !== 'awaiting-code' && status !== 'confirming' ? (
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

          <Button type="submit" disabled={status === 'sending'} className="w-full">
            {status === 'sending' ? (
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
      ) : (
        <form onSubmit={handleConfirmCode} className="space-y-3">
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
            <Button type="submit" disabled={status === 'confirming' || code.length !== 6}>
              {status === 'confirming' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Syncing…
                </>
              ) : (
                'Confirm & sync'
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
