// Vercel Serverless Function - Confirm Hijri ACJU Sync (OTP step 2)
// POST /api/confirm-sync-acju
//
// Body: { email, code, token }
// Validates the signed token issued by /api/request-sync-acju, matches the
// hashed code, and dispatches the sync-hijri-acju GitHub workflow.

import crypto from 'crypto'

function sha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex')
}

function timingSafeEqualHex(a, b) {
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'))
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, code, token } = req.body || {}
  if (!email || !code || !token) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  if (!process.env.ADMIN_SECRET) {
    return res.status(500).json({ error: 'Server configuration error' })
  }

  const [payloadB64, signature] = token.split('.')
  if (!payloadB64 || !signature) {
    return res.status(400).json({ error: 'Invalid token format' })
  }

  const payloadStr = Buffer.from(payloadB64, 'base64url').toString()
  const expectedSignature = crypto
    .createHmac('sha256', process.env.ADMIN_SECRET)
    .update(payloadStr)
    .digest('hex')

  if (!timingSafeEqualHex(signature, expectedSignature)) {
    return res.status(401).json({ error: 'Invalid token signature' })
  }

  let payload
  try {
    payload = JSON.parse(payloadStr)
  } catch {
    return res.status(400).json({ error: 'Invalid token payload' })
  }

  if (payload.purpose !== 'sync-acju') {
    return res.status(400).json({ error: 'Token is not for sync' })
  }

  if (Date.now() > payload.expiresAt) {
    return res.status(401).json({ error: 'Sync code has expired. Please request a new one.' })
  }

  if (payload.email !== String(email).toLowerCase()) {
    return res.status(401).json({ error: 'Email does not match' })
  }

  const submittedHash = sha256(String(code))
  if (!timingSafeEqualHex(submittedHash, payload.codeHash)) {
    return res.status(401).json({ error: 'Invalid sync code' })
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
