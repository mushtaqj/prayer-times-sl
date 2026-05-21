// Shared helpers for validating the OTP token issued by /api/request-sync-acju.
//
// The token is a base64url-encoded JSON payload joined to an HMAC-SHA256
// signature by a `.`. Payload shape:
//   { email, codeHash, expiresAt, purpose: 'sync-acju' }

import crypto from 'crypto'

export function sha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex')
}

function timingSafeEqualHex(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) {
    return false
  }
  return crypto.timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'))
}

/**
 * Validate { email, code, token } against the signed OTP token. Returns an
 * { ok: true, payload } shape on success, or { ok: false, status, error } on
 * any validation failure suitable for direct response forwarding.
 */
export function validateSyncToken({ email, code, token }) {
  if (!email || !code || !token) {
    return { ok: false, status: 400, error: 'Missing required fields' }
  }
  if (!process.env.ADMIN_SECRET) {
    return { ok: false, status: 500, error: 'Server configuration error' }
  }

  const [payloadB64, signature] = token.split('.')
  if (!payloadB64 || !signature) {
    return { ok: false, status: 400, error: 'Invalid token format' }
  }

  const payloadStr = Buffer.from(payloadB64, 'base64url').toString()
  const expectedSignature = crypto
    .createHmac('sha256', process.env.ADMIN_SECRET)
    .update(payloadStr)
    .digest('hex')

  if (!timingSafeEqualHex(signature, expectedSignature)) {
    return { ok: false, status: 401, error: 'Invalid token signature' }
  }

  let payload
  try {
    payload = JSON.parse(payloadStr)
  } catch {
    return { ok: false, status: 400, error: 'Invalid token payload' }
  }

  if (payload.purpose !== 'sync-acju') {
    return { ok: false, status: 400, error: 'Token is not for sync' }
  }
  if (Date.now() > payload.expiresAt) {
    return { ok: false, status: 401, error: 'Sync code has expired. Please request a new one.' }
  }
  if (payload.email !== String(email).toLowerCase()) {
    return { ok: false, status: 401, error: 'Email does not match' }
  }

  const submittedHash = sha256(String(code))
  if (!timingSafeEqualHex(submittedHash, payload.codeHash)) {
    return { ok: false, status: 401, error: 'Invalid sync code' }
  }

  return { ok: true, payload }
}
