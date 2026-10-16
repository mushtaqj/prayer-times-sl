// Vercel Serverless Function - Confirm Hijri ACJU Sync (OTP step 2)
// POST /api/confirm-sync-acju
//
// Body: { email, code, token }
// Validates the signed token issued by /api/request-sync-acju, then dispatches
// the sync-hijri-acju GitHub workflow. The workflow makes one ACJU request and
// applies at most one month transition, the same one /api/preview-sync-acju
// showed.

import { validateSyncToken } from './_lib/syncAcjuToken.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const auth = validateSyncToken(req.body || {})
  if (!auth.ok) {
    return res.status(auth.status).json({ error: auth.error })
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
        body: JSON.stringify({ ref: 'main' }),
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
