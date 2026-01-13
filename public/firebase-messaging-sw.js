/**
 * Firebase Messaging Service Worker
 * Handles background push notifications
 */

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js')

// Firebase configuration (these values are public, safe to include)
firebase.initializeApp({
  apiKey: 'AIzaSyAdXmWAfHXxeCTy0P5jV_QgUQcUGZL5tcU',
  authDomain: 'acju-prayer-time-sl.firebaseapp.com',
  projectId: 'acju-prayer-time-sl',
  storageBucket: 'acju-prayer-time-sl.firebasestorage.app',
  messagingSenderId: '1029049301310',
  appId: '1:1029049301310:web:ef995a4020f3637a72d46f',
})

const messaging = firebase.messaging()

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload)

  const notificationTitle = payload.notification?.title || 'Prayer Time'
  const notificationOptions = {
    body: payload.notification?.body || 'Time for prayer',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: payload.data?.prayer ? `prayer-${payload.data.prayer}` : 'prayer-notification',
    renotify: true,
    requireInteraction: true,
    vibrate: [200, 100, 200],
    data: {
      url: '/',
      prayer: payload.data?.prayer,
      zone: payload.data?.zone,
    },
  }

  return self.registration.showNotification(notificationTitle, notificationOptions)
})

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event)

  event.notification.close()

  // Open or focus the app
  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already an open window
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus()
          }
        }
        // Open new window if none exists
        return clients.openWindow(event.notification.data?.url || '/')
      })
  )
})
