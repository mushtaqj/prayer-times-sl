// Vercel Serverless Function - Request Hijri ACJU Sync (OTP step 1)
// POST /api/request-sync-acju
//
// Sends a one-time 6-digit code to a registered admin email. Returns a signed
// token that the client must round-trip to /api/confirm-sync-acju along with
// the code the user receives by email. The plain code is never stored
// server-side — only its SHA-256 hash inside the signed token.

import crypto from 'crypto'
import { Resend } from 'resend'
import { syncAcjuCodeEmail } from './templates/emails.js'

const CODE_TTL_MS = 15 * 60 * 1000

function sha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email } = req.body || {}
  if (!email) {
    return res.status(400).json({ error: 'Email is required' })
  }

  const authorizedEmails = (process.env.AUTHORIZED_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
  if (!authorizedEmails.includes(email.toLowerCase())) {
    return res.status(403).json({ error: 'Email not authorized' })
  }

  if (!process.env.ADMIN_SECRET) {
    return res.status(500).json({ error: 'Server configuration error' })
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'Email service not configured' })
  }

  // Generate a 6-digit zero-padded code (100000..999999)
  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0')
  const expiresAt = Date.now() + CODE_TTL_MS
  const payload = JSON.stringify({
    email: email.toLowerCase(),
    codeHash: sha256(code),
    expiresAt,
    purpose: 'sync-acju',
  })
  const signature = crypto
    .createHmac('sha256', process.env.ADMIN_SECRET)
    .update(payload)
    .digest('hex')
  const token = Buffer.from(payload).toString('base64url') + '.' + signature

  const resend = new Resend(process.env.RESEND_API_KEY)
  const emailTemplate = syncAcjuCodeEmail({ code })

  try {
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Prayer Times <onboarding@resend.dev>',
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    })

    if (error) {
      console.error('Resend error:', error)
      return res.status(500).json({ error: 'Failed to send sync code email' })
    }

    return res.status(200).json({
      success: true,
      token,
      message: `A 6-digit sync code has been emailed to ${email}.`,
    })
  } catch (error) {
    console.error('Email error:', error)
    return res.status(500).json({ error: 'Failed to send email' })
  }
}
