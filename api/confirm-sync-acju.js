// Vercel Serverless Function - Confirm Hijri ACJU Sync (OTP step 2)
// POST /api/confirm-sync-acju
//
// Body: { email, code, token, count }
// Validates the signed token issued by /api/request-sync-acju, then dispatches
// the sync-hijri-acju GitHub workflow. `count` (optional, integer >= 1) caps
// how many transitions the apply step will commit so the admin can approve a
// prefix of the previewed plan; omit it to apply everything ACJU has.

import { validateSyncToken } from './_lib/syncAcjuToken.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const auth = validateSyncToken(req.body || {})
  if (!auth.ok) {
    return res.status(auth.status).json({ error: auth.error })
  }

  const { count } = req.body || {}
  let countInput = ''
  if (count !== undefined && count !== null && count !== '') {
    const parsed = parseInt(count, 10)
    if (!Number.isFinite(parsed) || parsed < 1) {
      return res.status(400).json({ error: 'count must be a positive integer' })
    }
    countInput = String(parsed)
  }

  const { GITHUB_TOKEN, GITHUB_REPO } = process.env
  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    return res.status(500).json({ error: 'Server configuration error' })
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/sync-hijri-acju.yml/dispatches`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ref: 'main', inputs: { count: countInput } }),
      }
    )

    if (response.status === 204) {
      return res.status(200).json({
        success: true,
        message: 'Sync workflow triggered. The calendar will update shortly.',
      })
    }

    const errorData = await response.text()
    console.error('GitHub API error:', response.status, errorData)
    return res.status(500).json({ error: 'Failed to trigger sync. Please try again.' })
  } catch (error) {
    console.error('Error triggering sync workflow:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
