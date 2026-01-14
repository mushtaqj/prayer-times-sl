# Architecture Documentation

## Project Overview

**Prayer Times Sri Lanka** is a Progressive Web App (PWA) providing Islamic prayer times and Hijri calendar for all 26 districts across Sri Lanka's 13 prayer time zones.

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend Framework | React 19 |
| Language | TypeScript 5.9 |
| Build Tool | Vite 7 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Routing | React Router 7 |
| PWA | vite-plugin-pwa + Workbox |
| Push Notifications | Firebase Cloud Messaging |
| API (Serverless) | Vercel Functions |
| Scheduled Jobs | Firebase Cloud Functions |

---

## Directory Structure

```
prayer-times-app/
├── src/                              # Frontend source code
│   ├── components/                   # React components
│   │   ├── ui/                       # shadcn/ui primitives (14 components)
│   │   ├── admin/                    # Admin panel components
│   │   ├── calendar/                 # Hijri calendar components
│   │   ├── common/                   # Shared components
│   │   ├── landing/                  # Landing page sub-components
│   │   └── notifications/            # Push notification UI
│   ├── contexts/                     # React Context providers
│   │   ├── LocationContext.tsx       # Selected district state
│   │   ├── ThemeContext.tsx          # Dark/light mode
│   │   └── PushNotificationContext.tsx
│   ├── hooks/                        # Custom React hooks
│   │   ├── useAlarms.ts              # Local notification scheduling
│   │   ├── useCountdown.ts           # Next prayer countdown
│   │   ├── useHijriCalendar.ts       # Calendar navigation
│   │   ├── useIslamicEvents.ts       # Events and fasting days
│   │   ├── useLocation.ts            # Geolocation
│   │   ├── usePrayerTimes.ts         # Prayer data access
│   │   ├── usePushNotifications.ts   # FCM integration
│   │   └── useTheme.ts               # Theme management
│   ├── lib/                          # Utilities and data layer
│   │   ├── constants/                # App constants (8 files)
│   │   ├── data/                     # Data access layer
│   │   ├── firebase/                 # Firebase SDK setup
│   │   └── utils/                    # Pure utility functions
│   ├── data/                         # Static JSON data
│   │   ├── prayerTimes.json          # Prayer times (13 zones x 12 months)
│   │   ├── hijriCalendar.json        # Hijri-Gregorian mapping
│   │   ├── islamicEvents.json        # Events and fasting rules
│   │   └── virtues.json              # Markdown content
│   ├── test/                         # Test setup
│   ├── App.tsx                       # Main app with routing
│   └── main.tsx                      # Entry point with providers
├── api/                              # Vercel Serverless Functions
│   ├── notifications/
│   │   ├── subscribe.js              # FCM topic subscription
│   │   └── unsubscribe.js            # FCM topic unsubscription
│   ├── templates/                    # Email/page templates
│   ├── request-update.js             # Admin: Hijri update request
│   ├── confirm-update.js             # Admin: Confirm update
│   ├── request-rollback.js           # Admin: Rollback request
│   └── confirm-rollback.js           # Admin: Confirm rollback
├── functions/                        # Firebase Cloud Functions
│   ├── index.js                      # Scheduled notification sender
│   ├── data/                         # Copied prayer times data
│   └── package.json                  # Node.js 20 runtime
├── public/                           # Static assets
│   ├── firebase-messaging-sw.js      # FCM service worker
│   └── icon-192x192.png              # PWA icon
├── scripts/                          # Automation scripts
│   ├── update-hijri.js               # GitHub Actions: Update calendar
│   └── rollback-hijri.js             # GitHub Actions: Rollback
└── .github/workflows/                # CI/CD pipelines
    ├── ci.yml                        # Test and lint
    ├── update-hijri.yml              # Hijri update workflow
    └── rollback-hijri.yml            # Hijri rollback workflow
```

---

## Application Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              REACT APPLICATION                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         PROVIDER LAYER                              │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────────┐    │    │
│  │  │   Theme     │  │  Location   │  │   Push Notification      │    │    │
│  │  │  Provider   │  │  Provider   │  │      Provider            │    │    │
│  │  └─────────────┘  └─────────────┘  └──────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                          ROUTING LAYER                              │    │
│  │                                                                     │    │
│  │   /           → LandingPage (countdown, today's blessings)          │    │
│  │   /prayer     → DailyView (today's prayer times + alarms)           │    │
│  │   /prayer/week → WeekView (7-day schedule)                          │    │
│  │   /prayer/month → MonthView (monthly table)                         │    │
│  │   /hijri      → HijriCalendarView (full calendar)                   │    │
│  │   /admin      → AdminPage (hidden, Hijri updates)                   │    │
│  │                                                                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                           HOOKS LAYER                               │    │
│  │                                                                     │    │
│  │   usePrayerTimes ──────► Prayer data for selected district          │    │
│  │   useHijriCalendar ────► Calendar navigation and date conversion    │    │
│  │   useIslamicEvents ────► Events, fasting days, recurring fasts      │    │
│  │   useAlarms ───────────► Local notification scheduling              │    │
│  │   useCountdown ────────► Next prayer countdown timer                │    │
│  │   usePushNotifications → FCM token and subscription management      │    │
│  │                                                                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         DATA ACCESS LAYER                           │    │
│  │                                                                     │    │
│  │   lib/data/prayerTimes.ts ────► getPrayerTimesForDay()              │    │
│  │                               ► getCurrentAndNextPrayer()           │    │
│  │                               ► findNearestDistrict()               │    │
│  │                                                                     │    │
│  │   lib/data/hijriCalendar.ts ──► gregorianToHijri()                  │    │
│  │                               ► hijriToGregorian()                  │    │
│  │                               ► getMoonPhase()                      │    │
│  │                                                                     │    │
│  │   lib/data/islamicEvents.ts ──► getEventsForDate()                  │    │
│  │                               ► getFastingInfo()                    │    │
│  │                               ► getUpcomingEvents()                 │    │
│  │                                                                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         STATIC DATA (JSON)                          │    │
│  │                                                                     │    │
│  │   prayerTimes.json ─────► 13 zones × 12 months × ~30 days           │    │
│  │   hijriCalendar.json ───► Hijri months from 1424 AH onwards         │    │
│  │   islamicEvents.json ───► Events, fasting rules, recurring fasts    │    │
│  │   virtues.json ─────────► Markdown content for details              │    │
│  │                                                                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### Prayer Times Flow

```
User selects district (LocationContext)
         │
         ▼
usePrayerTimes(districtId)
         │
         ├──► getDistrictById() → Get zone from district
         │
         ├──► getTodayPrayerTimes() → Query JSON data
         │
         ├──► getCurrentAndNextPrayer() → Calculate based on current time
         │
         └──► Returns: { todayPrayers, weekPrayers, currentPrayer, nextPrayer }
                    │
                    ▼
         Components render prayer times
                    │
                    ▼
         useAlarms schedules local notifications
```

### Push Notification Flow

```
User enables notifications
         │
         ▼
usePushNotifications.enable(districtId)
         │
         ├──► Request browser notification permission
         │
         ├──► Get FCM token from Firebase
         │
         ├──► POST /api/notifications/subscribe
         │         │
         │         ▼
         │    Firebase Admin SDK subscribes token to topic
         │
         └──► Store in localStorage: { notificationDistrict, notificationZone, fcmToken }

                    ┌──────────────────────────────────┐
                    │                                  │
                    ▼                                  │
         Firebase Cloud Function (scheduled)           │
                    │                                  │
                    ├──► Runs every minute 4AM-8PM    │
                    │                                  │
                    ├──► Check if current time matches │
                    │    any prayer - 10 minutes       │
                    │                                  │
                    └──► Send FCM message to topic ────┘
                              │
                              ▼
                    Service Worker receives push
                              │
                              ▼
                    Shows native notification
```

### Hijri Calendar Flow

```
User navigates calendar (useHijriCalendar)
         │
         ├──► previousMonth() / nextMonth()
         │
         ├──► goToMonth(year, month)
         │
         └──► Returns: { currentMonthData, calendarDays, ... }
                    │
                    ▼
HijriCalendarView renders grid
                    │
                    ├──► For each day:
                    │         │
                    │         ├──► getAllEventsForDay()
                    │         │
                    │         └──► isFastingDay()
                    │
                    └──► Render CalendarDay with indicators
```

---

## Component Hierarchy

```
App
├── Header (hidden on landing page)
├── MobileNav (bottom tabs + hamburger menu)
└── Routes
    ├── / → LandingPage
    │       ├── NextPrayerCard
    │       ├── TodayBlessingsCard
    │       ├── NavigationButtons
    │       ├── MonthPickerModal
    │       └── VirtuesSheet
    │
    ├── /prayer → DailyView
    │       ├── NextPrayerBanner
    │       ├── HijriDateDisplay
    │       └── PrayerRow (×6)
    │
    ├── /prayer/week → WeekView
    │       └── (7 day sections with PrayerRow)
    │
    ├── /prayer/month → MonthView
    │       ├── Table (desktop)
    │       ├── List (mobile)
    │       └── Sheet (day details)
    │
    ├── /hijri → HijriCalendarView
    │       ├── CalendarHeader
    │       ├── CalendarDay (×29-30)
    │       ├── MonthEventsCard
    │       ├── CalendarLegend
    │       └── VirtuesSheet
    │
    └── /admin → AdminPage (standalone, no header/nav)
```

---

## State Management

### Context Providers

| Context | Purpose | Persisted |
|---------|---------|-----------|
| `ThemeContext` | Dark/light mode toggle | localStorage |
| `LocationContext` | Selected district | localStorage |
| `PushNotificationContext` | FCM state and actions | localStorage |

### Local State (useState)

Most component state is local:
- Calendar month navigation
- Modal open/close states
- Form inputs

### Derived State (useMemo)

Expensive computations are memoized:
- Prayer time calculations
- Calendar day arrays
- Event lookups

---

## API Routes

### Vercel Serverless Functions

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/notifications/subscribe` | POST | Subscribe FCM token to zone topic |
| `/api/notifications/unsubscribe` | POST | Unsubscribe from zone topic |
| `/api/request-update` | POST | Request Hijri calendar update (admin) |
| `/api/confirm-update` | GET | Confirm update via email token |
| `/api/request-rollback` | POST | Request calendar rollback (admin) |
| `/api/confirm-rollback` | GET | Confirm rollback via email token |

### Firebase Cloud Functions

| Function | Trigger | Schedule |
|----------|---------|----------|
| `sendPrayerNotifications` | Pub/Sub | `* 4-20 * * *` (Asia/Colombo) |

---

## Build Output

```
dist/
├── index.html                     # Entry HTML
├── manifest.webmanifest           # PWA manifest
├── registerSW.js                  # Service worker registration
├── sw.js                          # Generated service worker
├── workbox-*.js                   # Workbox runtime
└── assets/
    ├── index-*.css                # Tailwind CSS (~82 KB)
    └── index-*.js                 # App bundle (~1,275 KB)
```

**Note:** Bundle size exceeds recommended limit. See REFACTORING_PLAN.md for code splitting plan.

---

## Key Files Reference

### Entry Points

| File | Purpose |
|------|---------|
| `index.html` | HTML entry, loads main.tsx |
| `src/main.tsx` | React bootstrap with providers |
| `src/App.tsx` | Main component with routing |

### Data Files

| File | Contents |
|------|----------|
| `src/data/prayerTimes.json` | 13 zones × 12 months of prayer times |
| `src/data/hijriCalendar.json` | Hijri month mappings (1424 AH+) |
| `src/data/islamicEvents.json` | Events, fasting rules |
| `src/data/virtues.json` | Markdown content for virtues |

### Configuration

| File | Purpose |
|------|---------|
| `vite.config.ts` | Vite build configuration |
| `vitest.config.ts` | Test runner configuration |
| `tsconfig.json` | TypeScript configuration |
| `eslint.config.js` | ESLint rules |
| `firebase.json` | Firebase project config |

---

## Deployment

### Frontend (Vercel)

- Automatic deployment from `main` branch
- API routes deployed as serverless functions
- Environment variables set in Vercel dashboard

### Firebase Cloud Functions

```bash
# Deploy functions
firebase deploy --only functions
```

- Separate deployment from frontend
- `functions/data/` populated by predeploy script

### GitHub Actions

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `ci.yml` | Push/PR | Run tests and linting |
| `update-hijri.yml` | Workflow dispatch | Update Hijri calendar data |
| `rollback-hijri.yml` | Workflow dispatch | Rollback calendar changes |

---

## Related Documents

- [REFACTORING_PLAN.md](./REFACTORING_PLAN.md) - Planned code improvements
- [CODE_ANALYSIS.md](./CODE_ANALYSIS.md) - Detailed issue analysis
- [PUSH_NOTIFICATIONS_PLAN.md](./PUSH_NOTIFICATIONS_PLAN.md) - Push notification implementation
