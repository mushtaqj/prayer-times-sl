/**
 * API Route: Subscribe to push notifications
 * POST /api/notifications/subscribe
 */

import admin from 'firebase-admin'

// Initialize Firebase Admin SDK (singleton)
function getFirebaseAdmin() {
  if (admin.apps.length === 0) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}')

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    })
  }
  return admin
}

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { token, topic } = req.body

    // Validate input
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'Invalid token' })
    }
    if (!topic || typeof topic !== 'string' || !topic.startsWith('zone-')) {
      return res.status(400).json({ error: 'Invalid topic' })
    }

    // Subscribe to topic
    const firebaseAdmin = getFirebaseAdmin()
    const response = await firebaseAdmin.messaging().subscribeToTopic(token, topic)

    console.log(`Subscribed to ${topic}:`, response)

    return res.status(200).json({
      success: true,
      topic,
      successCount: response.successCount,
      failureCount: response.failureCount,
    })
  } catch (error) {
    console.error('Subscribe error:', error)
    return res.status(500).json({
      error: 'Failed to subscribe',
      message: error.message,
    })
  }
}
