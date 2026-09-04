// Vercel Serverless Function - Request Hijri Update
// POST /api/request-update

import crypto from 'crypto'
import { Resend } from 'resend'
import { confirmationEmail } from './_templates/emails.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { password, email, days } = req.body

  // Validate inputs
  if (!password || !email || !days) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  if (days !== 29 && days !== 30) {
    return res.status(400).json({ error: 'Days must be 29 or 30' })
  }

  // Verify password
  if (password !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Invalid password' })
  }

  // Verify email is in authorized list
  const authorizedEmails = (process.env.AUTHORIZED_EMAILS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())

  if (!authorizedEmails.includes(email.toLowerCase())) {
    return res.status(403).json({ error: 'Email not authorized' })
  }

  // Generate signed token (expires in 15 minutes)
  const expiresAt = Date.now() + 15 * 60 * 1000
  const payload = JSON.stringify({ email, days, expiresAt })
  const signature = crypto
    .createHmac('sha256', process.env.ADMIN_SECRET)
    .update(payload)
    .digest('hex')

  const token = Buffer.from(payload).toString('base64url') + '.' + signature

  // Build confirmation URL
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.BASE_URL || 'http://localhost:3000'
  const confirmUrl = `${baseUrl}/api/confirm-update?token=${token}`

  // Send email via Resend
  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'Email service not configured' })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const emailTemplate = confirmationEmail({ days, confirmUrl })

  try {
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Prayer Times <onboarding@resend.dev>',
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    })

    if (error) {
      console.error('Resend error:', error)
      return res.status(500).json({ error: 'Failed to send confirmation email' })
    }

    return res.status(200).json({
      success: true,
      message: `Confirmation email sent to ${email}. Please check your inbox.`
    })
  } catch (error) {
    console.error('Email error:', error)
    return res.status(500).json({ error: 'Failed to send email' })
  }
}
