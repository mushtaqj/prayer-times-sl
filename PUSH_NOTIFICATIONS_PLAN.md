# Push Notifications Implementation Plan

## Goal

Deliver prayer time notifications even when the app is fully closed, on both Android and iOS.

---

## Platform: Firebase Cloud Messaging (FCM)

**Why Firebase?**
- No Google login required for users (just notification permission)
- Topics feature = no database needed for subscriptions
- FCM handles fan-out (1 API call delivers to all subscribers)
- Free tier covers our usage (0.5% of limit)
- Works on Android PWA and iOS PWA (16.4+)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  USER DEVICE (PWA)                    FIREBASE                       │
│  ┌─────────────────────┐              ┌─────────────────────┐       │
│  │                     │   Subscribe  │                     │       │
│  │  1. User selects    │ ──────────►  │  FCM stores the     │       │
│  │     district        │   to topic   │  subscription       │       │
│  │                     │  "zone-01"   │                     │       │
│  │  2. User enables    │              │                     │       │
│  │     notifications   │              │                     │       │
│  │                     │              └──────────┬──────────┘       │
│  │  3. No login needed │                         │                  │
│  │                     │              ┌──────────▼──────────┐       │
│  └─────────────────────┘              │                     │       │
│                                       │  Cloud Function     │       │
│                                       │  (Scheduled Cron)   │       │
│  ┌─────────────────────┐              │                     │       │
│  │                     │              │  Checks: "Is it     │       │
│  │  Service Worker     │   Push       │  prayer time for    │       │
│  │  receives push      │ ◄─────────── │  any zone?"         │       │
│  │                     │              │                     │       │
│  │  Shows notification │              │  If yes, sends to   │       │
│  │  (even if closed)   │              │  topic "zone-XX"    │       │
│  │                     │              │                     │       │
│  └─────────────────────┘              └─────────────────────┘       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Topics Structure: 13 Zones

Users subscribe to their zone's topic. All prayers are sent to everyone in the zone.

```
┌─────────────────────────────────────────────────────────────────────┐
│  TOPICS (13 total - one per zone)                                    │
│                                                                      │
│  zone-01: Colombo, Gampaha, Kalutara                                │
│  zone-02: Jaffna, Nallur                                            │
│  zone-03: Kilinochchi, Mullaitivu, Vavuniya                         │
│  zone-04: Mannar, Puttalam                                          │
│  zone-05: Anuradhapura, Polonnaruwa                                 │
│  zone-06: Kurunegala                                                │
│  zone-07: Kandy, Matale, Nuwara Eliya                               │
│  zone-08: Ampara, Batticaloa                                        │
│  zone-09: Trincomalee                                               │
│  zone-10: Badulla, Monaragala                                       │
│  zone-11: Kegalle, Ratnapura                                        │
│  zone-12: Galle, Matara                                             │
│  zone-13: Hambantota                                                │
│                                                                      │
│  Total: 26 districts → 13 zones → 13 topics                         │
└─────────────────────────────────────────────────────────────────────┘
```

**User Flow:**
1. Select district → App maps to zone → Subscribe to `zone-XX` topic
2. Change district → Unsubscribe old zone, subscribe new zone
3. Disable notifications → Unsubscribe from topic

---

## Prayer Time Ranges (Verified from Data)

**Source:** `src/data/prayerTimes.json` (analyzed all 13 zones, 12 months, 365 days)

| Prayer   | Earliest | Latest   | Where Earliest Occurs | Where Latest Occurs |
|----------|----------|----------|----------------------|---------------------|
| Fajr     | 4:21 AM  | 5:13 AM  | Zone 08, May 25      | Zone 02, Jan 29     |
| Sunrise  | 5:45 AM  | 6:33 AM  | Zone 08, May 15      | Zone 02, Jan 20     |
| Dhuhr    | 11:48 AM | 12:27 PM | Zone 08, Oct 27      | Zone 04, Feb 5      |
| Asr      | 3:06 PM  | 3:48 PM  | Zone 08, Sep 3       | Zone 01, Feb 3      |
| Maghrib  | 5:43 PM  | 6:37 PM  | Zone 08, Nov 3       | Zone 02, Jul 4      |
| Isha     | 6:54 PM  | 7:53 PM  | Zone 08, Oct 30      | Zone 02, Jun 28     |

---

## Cron Windows (With 10min Reminder + 1min Buffer)

Crons only run during these windows, not 24/7.

| Prayer   | Cron Start | Cron End  | Duration | Cron Expression |
|----------|------------|-----------|----------|-----------------|
| Fajr     | 4:10 AM    | 5:14 AM   | 64 min   | `10-59 4 * * *` + `0-14 5 * * *` |
| Sunrise  | 5:34 AM    | 6:34 AM   | 60 min   | `34-59 5 * * *` + `0-34 6 * * *` |
| Dhuhr    | 11:37 AM   | 12:28 PM  | 51 min   | `37-59 11 * * *` + `0-28 12 * * *` |
| Asr      | 2:55 PM    | 3:49 PM   | 54 min   | `55-59 14 * * *` + `0-49 15 * * *` |
| Maghrib  | 5:32 PM    | 6:38 PM   | 66 min   | `32-59 17 * * *` + `0-38 18 * * *` |
| Isha     | 6:43 PM    | 7:54 PM   | 71 min   | `43-59 18 * * *` + `0-54 19 * * *` |

**Total: 366 cron runs/day** (vs 1440 if running every minute 24/7)

---

## Cost Analysis

```
┌─────────────────────────────────────────────────────────────────────┐
│  FIREBASE FREE TIER USAGE                                            │
│                                                                      │
│  Cloud Functions Invocations:                                        │
│    - Daily runs: 366                                                 │
│    - Monthly runs: ~11,000                                           │
│    - Free tier limit: 2,000,000/month                                │
│    - Usage: 0.55% of free tier ✅                                    │
│                                                                      │
│  FCM Messages:                                                       │
│    - Unlimited (no cost) ✅                                          │
│                                                                      │
│  Cloud Scheduler:                                                    │
│    - Free tier: 3 jobs                                               │
│    - We need: 1 job (or 6 for separate prayers)                      │
│    - Usage: Within free tier ✅                                      │
│                                                                      │
│  TOTAL COST: $0/month                                                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Details

### 1. Client-Side (PWA)

**Subscribe to notifications:**
```typescript
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

async function subscribeToNotifications(zoneId: string) {
  const messaging = getMessaging()

  // Get permission
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    throw new Error('Notification permission denied')
  }

  // Get FCM token
  const token = await getToken(messaging, {
    vapidKey: 'YOUR_VAPID_PUBLIC_KEY'
  })

  // Subscribe to zone topic via Cloud Function
  await fetch('/api/subscribe', {
    method: 'POST',
    body: JSON.stringify({ token, topic: `zone-${zoneId}` })
  })
}

async function unsubscribeFromNotifications(zoneId: string) {
  const messaging = getMessaging()
  const token = await getToken(messaging)

  await fetch('/api/unsubscribe', {
    method: 'POST',
    body: JSON.stringify({ token, topic: `zone-${zoneId}` })
  })
}
```

**Service Worker (push handler):**
```typescript
// sw.js or via vite-plugin-pwa
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {}

  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: `prayer-${data.prayer}`,      // Prevents duplicate notifications
    renotify: true,
    requireInteraction: true,
    vibrate: [200, 100, 200],
    data: { url: '/' }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  )
})
```

### 2. Cloud Functions (Backend)

**Subscribe/Unsubscribe endpoints:**
```typescript
import * as admin from 'firebase-admin'

// POST /api/subscribe
export async function subscribe(req, res) {
  const { token, topic } = req.body
  await admin.messaging().subscribeToTopic(token, topic)
  res.json({ success: true })
}

// POST /api/unsubscribe
export async function unsubscribe(req, res) {
  const { token, topic } = req.body
  await admin.messaging().unsubscribeFromTopic(token, topic)
  res.json({ success: true })
}
```

**Scheduled notification sender:**
```typescript
import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

// Prayer times data (imported from your existing data)
import prayerTimesData from './prayerTimes.json'

const ZONES = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13']
const REMINDER_MINUTES = 10

// Runs every minute during prayer windows
export const checkPrayerTimes = functions.pubsub
  .schedule('every 1 minutes')
  .timeZone('Asia/Colombo')
  .onRun(async (context) => {
    const now = new Date()
    const currentHHMM = formatTime(now) // e.g., "05:23"
    const month = now.getMonth() + 1
    const day = now.getDate()

    for (const zone of ZONES) {
      const todayTimes = getPrayerTimesForZone(zone, month, day)

      for (const [prayer, time] of Object.entries(todayTimes)) {
        if (prayer === 'day') continue // Skip the 'day' field

        const reminderTime = subtractMinutes(time, REMINDER_MINUTES)

        if (reminderTime === currentHHMM) {
          await sendNotification(zone, prayer, REMINDER_MINUTES)
        }
      }
    }
  })

async function sendNotification(zone: string, prayer: string, minutesBefore: number) {
  const prayerName = capitalize(prayer)

  await admin.messaging().sendToTopic(`zone-${zone}`, {
    notification: {
      title: `${prayerName} Prayer`,
      body: `${prayerName} is in ${minutesBefore} minutes`
    },
    data: {
      prayer: prayer,
      zone: zone
    }
  })

  console.log(`Sent ${prayer} notification to zone-${zone}`)
}
```

---

## iOS-Specific Requirements

```
┌─────────────────────────────────────────────────────────────────────┐
│  iOS PUSH NOTIFICATION REQUIREMENTS                                  │
│                                                                      │
│  1. iOS 16.4+ required (Safari 16.4+)                               │
│                                                                      │
│  2. PWA MUST be installed to home screen                            │
│     - Push does NOT work in Safari browser tab                      │
│     - Only works when opened from home screen icon                  │
│                                                                      │
│  3. User must manually enable notifications                         │
│     - Settings > [App Name] > Notifications > Allow                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**iOS Detection & User Guidance:**
```typescript
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
const isStandalone = window.matchMedia('(display-mode: standalone)').matches
                     || (navigator as any).standalone === true

function getIOSInstallStatus() {
  if (!isIOS) return 'not-ios'
  if (isStandalone) return 'installed'
  return 'not-installed'
}

// Show appropriate UI based on status
const status = getIOSInstallStatus()
if (status === 'not-installed') {
  showIOSInstallInstructions()
  // "To receive notifications:
  //  1. Tap the Share button (square with arrow)
  //  2. Scroll down and tap 'Add to Home Screen'
  //  3. Open the app from your home screen
  //  4. Enable notifications when prompted
  //  5. If needed, go to Settings > Prayer Times > Notifications"
}
```

---

## Implementation Phases

### Phase 1: Firebase Setup
```
□ 1.1 Create Firebase project
□ 1.2 Enable Cloud Messaging (FCM)
□ 1.3 Generate VAPID keys
□ 1.4 Set up Cloud Functions
□ 1.5 Configure Cloud Scheduler for cron jobs
```

### Phase 2: Backend (Cloud Functions)
```
□ 2.1 Create subscribe/unsubscribe endpoints
□ 2.2 Import prayer times data
□ 2.3 Implement scheduled notification function
□ 2.4 Deploy and test with single zone
□ 2.5 Test all 13 zones
```

### Phase 3: Frontend Integration
```
□ 3.1 Add Firebase SDK to PWA
□ 3.2 Configure service worker for push
□ 3.3 Create notification permission UI
□ 3.4 Implement subscribe on zone selection
□ 3.5 Handle zone changes (unsubscribe/subscribe)
□ 3.6 Add iOS installation detection & guide
```

### Phase 4: Testing
```
□ 4.1 Test on Android Chrome (installed PWA)
□ 4.2 Test on Android Chrome (browser tab)
□ 4.3 Test on iOS Safari (installed PWA)
□ 4.4 Test notification timing accuracy
□ 4.5 Test zone switching
```

---

## Data Bug Found

During analysis, found 2 incorrect entries in `prayerTimes.json`:

```
Zone 07, Month 9, Day 28: dhuhr = "11:59 PM" (should be "11:59 AM")
Zone 07, Month 9, Day 29: dhuhr = "11:59 PM" (should be "11:59 AM")
```

**Action:** Fix these entries in the data file.

---

## Summary

| Aspect | Decision |
|--------|----------|
| Platform | Firebase (FCM + Cloud Functions) |
| Topics | 13 (one per zone, all prayers included) |
| Cron Strategy | Window-based (366 runs/day, not 1440) |
| Cost | $0 (within free tier) |
| User Login | Not required |
| iOS Support | Yes (requires PWA install + iOS 16.4+) |
| Android Support | Yes (PWA or browser) |

---

## Next Steps

1. **Fix data bug** - Correct the 2 Dhuhr entries
2. **Create Firebase project** - Set up FCM and Cloud Functions
3. **Start Phase 1** - Firebase setup and configuration

Ready to begin implementation?
