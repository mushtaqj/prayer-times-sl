// Vercel Serverless Function - Confirm Hijri Update
// GET /api/confirm-update?token=xxx

import crypto from 'crypto'
import { successPage, errorPage } from './templates/pages.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { token } = req.query

  if (!token) {
    return sendError(res, 'Missing confirmation token')
  }

  // Parse and validate token
  const [payloadB64, signature] = token.split('.')

  if (!payloadB64 || !signature) {
    return sendError(res, 'Invalid token format')
  }

  // Verify signature
  const expectedSignature = crypto
    .createHmac('sha256', process.env.ADMIN_SECRET)
    .update(Buffer.from(payloadB64, 'base64url').toString())
    .digest('hex')

  if (signature !== expectedSignature) {
    return sendError(res, 'Invalid token signature')
  }

  // Parse payload
  let payload
  try {
    payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString())
  } catch {
    return sendError(res, 'Invalid token payload')
  }

  const { email, days, expiresAt } = payload

  // Check expiry
  if (Date.now() > expiresAt) {
    return sendError(res, 'This confirmation link has expired. Please request a new one.')
  }

  // Trigger GitHub workflow
  const { GITHUB_TOKEN, GITHUB_REPO } = process.env

  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    return sendError(res, 'Server configuration error')
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/update-hijri.yml/dispatches`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ref: 'main',
          inputs: { days: String(days) },
        }),
      }
    )

    if (response.status === 204) {
      return sendSuccess(res, { email, days })
    }

    const errorData = await response.text()
    console.error('GitHub API error:', response.status, errorData)
    return sendError(res, 'Failed to trigger update. Please try again.')
  } catch (error) {
    console.error('Error triggering workflow:', error)
    return sendError(res, 'Internal server error')
  }
}

function sendSuccess(res, data) {
  res.setHeader('Content-Type', 'text/html')
  res.status(200).send(successPage(data))
}

function sendError(res, message) {
  res.setHeader('Content-Type', 'text/html')
  res.status(400).send(errorPage({ message }))
}
