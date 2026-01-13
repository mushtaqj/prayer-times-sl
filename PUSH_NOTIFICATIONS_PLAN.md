# Push Notifications Implementation Plan

## Goal

Deliver prayer time notifications even when the app is fully closed, on both Android and iOS.

---

## Platform: Firebase Cloud Messaging (FCM)

**Why Firebase?**
- No Google login required for users (just notification permission)
- Topics feature = no database needed for subscriptions
- FCM handles fan-out (1 API call delivers to all subscribers)
- Free tier covers our usage
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

## Cron Strategy

**Single Cloud Scheduler job** running every minute from 4 AM to 8 PM:

```
Schedule: "* 4-20 * * *" (every minute, 4:00 AM - 8:59 PM)
Timezone: Asia/Colombo
Runs: 1,020 times/day
```

The function checks if current time matches any prayer for any zone. If not within a prayer window, it exits immediately (minimal cost).

**Why this approach:**
- Uses only 1 Cloud Scheduler job (free tier allows 3)
- Simple cron expression
- Function handles the prayer window logic internally

---

## Cost Analysis

```
┌─────────────────────────────────────────────────────────────────────┐
│  FIREBASE FREE TIER USAGE                                            │
│                                                                      │
│  Cloud Functions Invocations:                                        │
│    - Daily runs: 1,020                                              │
│    - Monthly runs: ~31,000                                          │
│    - Free tier limit: 2,000,000/month                               │
│    - Usage: 1.5% of free tier ✅                                     │
│                                                                      │
│  FCM Messages:                                                       │
│    - Unlimited (no cost) ✅                                          │
│                                                                      │
│  Cloud Scheduler:                                                    │
│    - Free tier: 3 jobs                                              │
│    - We need: 1 job                                                 │
│    - Usage: Within free tier ✅                                      │
│                                                                      │
│  TOTAL COST: $0/month                                                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## User Experience Flow

### Key Concepts

```
┌─────────────────────────────────────────────────────────────────────┐
│  TWO DIFFERENT CONCEPTS                                              │
│                                                                      │
│  1. VIEWING DISTRICT (can change freely)                            │
│     - User browses prayer times for any district                    │
│     - Stored in localStorage                                        │
│     - NO subscription changes                                       │
│                                                                      │
│  2. NOTIFICATION DISTRICT (rarely changes)                          │
│     - User's "home" district for push notifications                 │
│     - Only changes when user explicitly confirms                    │
│     - Triggers subscribe/unsubscribe                                │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### localStorage Structure

```typescript
{
  "viewingDistrict": "kandy",        // Can change anytime (no API call)
  "notificationDistrict": "colombo", // Only changes on user confirmation
  "notificationZone": "01",          // The subscribed FCM topic
  "pushEnabled": true
}
```

---

### Flow 1: First-Time Notification Enable

When user taps the notification bell icon for the first time:

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                                                             │   │
│   │   🔔 Enable Prayer Notifications                           │   │
│   │                                                             │   │
│   │   You'll receive reminders 10 minutes before each prayer.  │   │
│   │                                                             │   │
│   │   Notification Location:                                    │   │
│   │   ┌─────────────────────────────────────┐                  │   │
│   │   │  Colombo (Zone 01)              ▼   │                  │   │
│   │   └─────────────────────────────────────┘                  │   │
│   │                                                             │   │
│   │   You can change this anytime.                             │   │
│   │                                                             │   │
│   │   ┌──────────────┐    ┌──────────────┐                     │   │
│   │   │    Cancel    │    │    Enable    │                     │   │
│   │   └──────────────┘    └──────────────┘                     │   │
│   │                                                             │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Logic:**
1. Show modal with district selector (defaults to currently viewing district)
2. User confirms → Request browser notification permission
3. If granted → Subscribe to zone topic, save to localStorage
4. Show success toast

---

### Flow 2: Browsing Different District (Subtle Prompt)

When user changes to a district in a **different zone** while notifications are enabled:

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    Prayer Times - Kandy                     │    │
│  │  ─────────────────────────────────────────────────────────  │    │
│  │                                                             │    │
│  │  Fajr      4:52 AM                                         │    │
│  │  Sunrise   6:10 AM                                         │    │
│  │  Dhuhr     12:15 PM                                        │    │
│  │  ...                                                        │    │
│  │                                                             │    │
│  │  ┌─────────────────────────────────────────────────────┐   │    │
│  │  │                                                     │   │    │
│  │  │  📍 Update notification location to Kandy?         │   │    │
│  │  │                                                     │   │    │
│  │  │  ┌─────────┐  ┌─────────────┐           ┌─────┐    │   │    │
│  │  │  │   Yes   │  │  Not now    │           │  ✕  │    │   │    │
│  │  │  └─────────┘  └─────────────┘           └─────┘    │   │    │
│  │  │                                                     │   │    │
│  │  └─────────────────────────────────────────────────────┘   │    │
│  │                                                             │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**When to show this prompt:**
- Notifications are enabled AND
- User navigates to a district in a DIFFERENT zone than their notification zone

**When NOT to show:**
- Notifications disabled
- Same zone (e.g., Colombo → Gampaha, both zone-01)
- User already dismissed for this session

**User actions:**
- **Yes** → Unsubscribe old zone, subscribe new zone, update localStorage, show toast
- **Not now** → Dismiss banner, continue browsing (no subscription change)
- **✕** → Dismiss and don't show again this session

---

### Flow 3: Complete User Scenarios

```
┌─────────────────────────────────────────────────────────────────────┐
│  SCENARIO 1: First-time user                                         │
│                                                                      │
│  1. Opens app → Sees Colombo times (default)                        │
│  2. Taps bell icon → Modal: "Enable notifications for Colombo?"     │
│  3. Confirms → Browser permission prompt → Subscribed to zone-01    │
│  4. Gets notifications for Colombo prayers                          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  SCENARIO 2: User browses another district (SAME zone)              │
│                                                                      │
│  1. User (Colombo/zone-01 notifications) taps "Gampaha"             │
│  2. Sees Gampaha prayer times                                       │
│  3. NO prompt shown (Gampaha is also zone-01)                       │
│  4. Notifications unchanged - same zone, same times                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  SCENARIO 3: User browses another district (DIFFERENT zone)         │
│                                                                      │
│  1. User (Colombo/zone-01 notifications) taps "Kandy"               │
│  2. Sees Kandy prayer times                                         │
│  3. Subtle banner: "Update notification location to Kandy?"         │
│                                                                      │
│  4a. User taps "Yes":                                               │
│      → Unsubscribe from zone-01                                     │
│      → Subscribe to zone-07                                         │
│      → Toast: "Notifications updated to Kandy"                      │
│                                                                      │
│  4b. User taps "Not now":                                           │
│      → Banner dismissed                                             │
│      → Still viewing Kandy times                                    │
│      → Still getting Colombo notifications                          │
│                                                                      │
│  4c. User taps "✕":                                                 │
│      → Banner dismissed                                             │
│      → Don't show again this session                                │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  SCENARIO 4: User disables notifications                             │
│                                                                      │
│  1. User taps bell icon (currently enabled)                         │
│  2. Confirmation: "Disable notifications?"                          │
│  3. Confirms → Unsubscribe from topic                               │
│  4. No more prompts when browsing different districts               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Flow Logic Implementation

```typescript
// Check if location change prompt should be shown
function shouldShowLocationChangePrompt(
  newDistrict: string,
  notificationZone: string | null,
  pushEnabled: boolean,
  dismissedThisSession: boolean
): boolean {
  if (!pushEnabled) return false
  if (!notificationZone) return false
  if (dismissedThisSession) return false

  const newZone = getZoneForDistrict(newDistrict)
  return newZone !== notificationZone
}

// Handle district change (viewing)
function handleDistrictChange(newDistrict: string) {
  // Always update viewing district
  localStorage.setItem('viewingDistrict', newDistrict)

  // Check if we should prompt for notification location change
  const notificationZone = localStorage.getItem('notificationZone')
  const pushEnabled = localStorage.getItem('pushEnabled') === 'true'

  if (shouldShowLocationChangePrompt(newDistrict, notificationZone, pushEnabled, dismissedThisSession)) {
    showLocationChangePrompt(newDistrict)
  }
}

// User confirms location change
async function confirmLocationChange(newDistrict: string) {
  const oldZone = localStorage.getItem('notificationZone')
  const newZone = getZoneForDistrict(newDistrict)

  try {
    // Update FCM subscription
    if (oldZone) {
      await unsubscribeFromTopic(`zone-${oldZone}`)
    }
    await subscribeToTopic(`zone-${newZone}`)

    // Update localStorage
    localStorage.setItem('notificationDistrict', newDistrict)
    localStorage.setItem('notificationZone', newZone)

    showToast(`Notifications updated to ${newDistrict}`)
  } catch (error) {
    showToast('Failed to update notifications', 'error')
  }
}
```

---

## Implementation Details

### 1. Client-Side (PWA)

**Subscribe to notifications:**
```typescript
import { getMessaging, getToken } from 'firebase/messaging'

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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, topic: `zone-${zoneId}` })
  })
}

async function unsubscribeFromNotifications(zoneId: string) {
  const messaging = getMessaging()
  const token = await getToken(messaging)

  await fetch('/api/unsubscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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

// Single cron: runs every minute from 4 AM to 8 PM
export const checkPrayerTimes = functions.pubsub
  .schedule('* 4-20 * * *')
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

// Show appropriate guidance based on status
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
□ 1.5 Configure Cloud Scheduler (single job: "* 4-20 * * *")
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
□ 3.3 Create notification enable modal (with district selector)
□ 3.4 Create location change prompt banner
□ 3.5 Implement subscribe/unsubscribe logic
□ 3.6 Handle zone changes on user confirmation
□ 3.7 Add iOS installation detection & guide
```

### Phase 4: Testing
```
□ 4.1 Test on Android Chrome (installed PWA)
□ 4.2 Test on Android Chrome (browser tab)
□ 4.3 Test on iOS Safari (installed PWA)
□ 4.4 Test notification timing accuracy
□ 4.5 Test zone switching flow
□ 4.6 Test "Not now" and dismiss behaviors
```

---

## Summary

| Aspect | Decision |
|--------|----------|
| Platform | Firebase (FCM + Cloud Functions) |
| Topics | 13 (one per zone, all prayers included) |
| Cron Strategy | Single job "* 4-20 * * *" (1,020 runs/day) |
| Cost | $0 (within free tier) |
| User Login | Not required |
| iOS Support | Yes (requires PWA install + iOS 16.4+) |
| Android Support | Yes (PWA or browser) |
| Location UX | Subtle prompt when browsing different zone |

---

## Next Steps

1. **Create Firebase project** - Set up FCM and Cloud Functions
2. **Start Phase 1** - Firebase setup and configuration
3. **Design UI components** - Enable modal, location change banner

Ready to begin implementation?
