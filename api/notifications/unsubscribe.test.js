import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock firebase-admin
vi.mock('firebase-admin', () => {
  const mockUnsubscribeFromTopic = vi.fn(() =>
    Promise.resolve({ successCount: 1, failureCount: 0 })
  )

  return {
    default: {
      apps: [],
      initializeApp: vi.fn(),
      credential: {
        cert: vi.fn(() => ({})),
      },
      messaging: vi.fn(() => ({
        unsubscribeFromTopic: mockUnsubscribeFromTopic,
      })),
    },
  }
})

import admin from 'firebase-admin'
import handler from './unsubscribe.js'

describe('POST /api/notifications/unsubscribe', () => {
  let mockReq
  let mockRes

  beforeEach(() => {
    vi.clearAllMocks()

    // Reset apps array for singleton check
    admin.apps.length = 0

    mockReq = {
      method: 'POST',
      body: {
        token: 'test-fcm-token',
        topic: 'zone-01',
      },
    }

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    }

    // Mock environment variable
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY = JSON.stringify({
      type: 'service_account',
      project_id: 'test-project',
    })
  })

  describe('method validation', () => {
    it('returns 405 for non-POST requests', async () => {
      mockReq.method = 'GET'

      await handler(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(405)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Method not allowed' })
    })

    it('accepts POST requests', async () => {
      await handler(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(200)
    })
  })

  describe('input validation', () => {
    it('returns 400 when token is missing', async () => {
      mockReq.body = { topic: 'zone-01' }

      await handler(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid token' })
    })

    it('returns 400 when token is not a string', async () => {
      mockReq.body = { token: 123, topic: 'zone-01' }

      await handler(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid token' })
    })

    it('returns 400 when topic is missing', async () => {
      mockReq.body = { token: 'test-token' }

      await handler(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid topic' })
    })

    it('returns 400 when topic does not start with zone-', async () => {
      mockReq.body = { token: 'test-token', topic: 'invalid-topic' }

      await handler(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid topic' })
    })
  })

  describe('successful unsubscription', () => {
    it('unsubscribes from topic and returns success', async () => {
      await handler(mockReq, mockRes)

      expect(admin.messaging().unsubscribeFromTopic).toHaveBeenCalledWith(
        'test-fcm-token',
        'zone-01'
      )
      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        topic: 'zone-01',
        successCount: 1,
        failureCount: 0,
      })
    })

    it('initializes Firebase Admin on first call', async () => {
      await handler(mockReq, mockRes)

      expect(admin.initializeApp).toHaveBeenCalled()
    })

    it('does not reinitialize Firebase Admin on subsequent calls', async () => {
      admin.apps.push({}) // Simulate already initialized

      await handler(mockReq, mockRes)

      expect(admin.initializeApp).not.toHaveBeenCalled()
    })
  })

  describe('error handling', () => {
    it('returns 500 when unsubscription fails', async () => {
      admin.messaging().unsubscribeFromTopic.mockRejectedValue(new Error('FCM error'))

      await handler(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(500)
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Failed to unsubscribe',
        message: 'FCM error',
      })
    })
  })
})
