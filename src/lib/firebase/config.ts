/**
 * Firebase configuration
 */

import { initializeApp, getApps, getApp } from 'firebase/app'
import { getMessaging, isSupported } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Initialize Firebase (avoid re-initialization)
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

// Get messaging instance (only in browser and if supported)
export async function getMessagingInstance() {
  if (typeof window === 'undefined') return null

  const supported = await isSupported()
  if (!supported) return null

  return getMessaging(app)
}

// VAPID key for push notifications
export const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY
