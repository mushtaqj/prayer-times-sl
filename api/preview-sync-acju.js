// Vercel Serverless Function - Preview Hijri ACJU Sync (dry-run)
// POST /api/preview-sync-acju
//
// Body: { email, code, token }
// Validates the OTP token, fetches the current hijriCalendar.json from the
// repo, runs the ACJU sync loop in memory, and returns the list of planned
// transitions without committing anything.

import { validateSyncToken } from './lib/syncAcjuToken.js'
import { syncFromAcju } from '../scripts/lib/acjuSync.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const auth = validateSyncToken(req.body || {})
  if (!auth.ok) {
    return res.status(auth.status).json({ error: auth.error })
  }

  const { GITHUB_REPO } = process.env
  if (!GITHUB_REPO) {
    return res.status(500).json({ error: 'Server configuration error' })
  }

  const rawUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/src/data/hijriCalendar.json`

  let calendar
  try {
    const response = await fetch(rawUrl, { cache: 'no-store' })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    calendar = await response.json()
  } catch (err) {
    console.error('Failed to fetch calendar:', err)
    return res.status(502).json({ error: 'Failed to fetch calendar data' })
  }

  try {
    const transitions = await syncFromAcju(calendar)
    return res.status(200).json({
      success: true,
      transitions,
      message:
        transitions.length === 0
          ? 'Calendar is already in sync with ACJU.'
          : `ACJU has ${transitions.length} new month(s) to apply.`,
    })
  } catch (err) {
    console.error('Preview sync error:', err)
    return res.status(500).json({ error: err.message || 'Preview failed' })
  }
}
