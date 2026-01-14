# Code Analysis Report

## Overview

**Analysis Date:** January 14, 2026  
**Codebase:** Prayer Times PWA  
**Framework:** React 19 + TypeScript + Vite 7

### Health Summary

| Metric | Status | Details |
|--------|--------|---------|
| TypeScript | Pass | No compilation errors |
| ESLint | Pass | No linting errors |
| Tests | Pass | 419/419 tests passing |
| Build | Pass | Production build succeeds |
| Bundle Size | Warning | 1,275 KB (exceeds 500 KB threshold) |

---

## Issues Found

### Issue 1: Large Bundle Size (High Priority)

**Severity:** High  
**Type:** Performance  
**Location:** Build output

**Description:**
The main JavaScript bundle exceeds Vite's recommended 500 KB limit:

```
dist/assets/index-WUT9dOVO.js   1,275.45 kB │ gzip: 251.72 kB

(!) Some chunks are larger than 500 kB after minification.
```

**Root Causes:**
1. All route components bundled together (no code splitting)
2. Large JSON data files imported statically:
   - `prayerTimes.json` - Prayer times for 13 zones x 12 months
   - `hijriCalendar.json` - Hijri calendar mappings
   - `islamicEvents.json` - Event data with markdown content
3. Heavy dependencies bundled together:
   - `firebase` (~200 KB)
   - `react-markdown` + dependencies (~150 KB)
   - `@radix-ui/*` components (~100 KB)

**Impact:**
- Slower initial page load
- Higher data usage for mobile users
- Worse Lighthouse performance score

**Recommendation:** Implement route-based code splitting (see REFACTORING_PLAN.md Phase 1)

---

### Issue 2: Duplicated Route Layout Code (Medium Priority)

**Severity:** Medium  
**Type:** Code Quality (DRY Violation)  
**Location:** `src/App.tsx:122-188`

**Description:**
The same layout wrapper (ViewSwitcher + notification banner + animation) is duplicated across 3 routes:

**Route 1 - `/prayer` (lines 123-148):**
```tsx
<Route
  path="/prayer"
  element={
    <>
      <div className="sticky top-[calc(48px+env(safe-area-inset-top))] sm:top-[60px] z-30 mt-[calc(48px+env(safe-area-inset-top))] sm:mt-0 bg-background/95 backdrop-blur-md px-4 py-3 border-b border-border/50 supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <ViewSwitcher />
      </div>
      <div className="p-4 pb-20 sm:pb-4 space-y-6 flex-1">
        {notificationBanner}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <DailyView ... />
        </div>
      </div>
    </>
  }
/>
```

**Route 2 - `/prayer/week` (lines 151-168):** Same layout wrapper  
**Route 3 - `/prayer/month` (lines 171-188):** Same layout wrapper

**Impact:**
- ~40 lines of duplicated code
- Risk of inconsistency if one route is updated but others are forgotten
- Harder to maintain

**Recommendation:** Use nested routes with shared layout (see REFACTORING_PLAN.md Phase 2)

---

### Issue 3: Dead Code - Unreachable Admin Route (Low Priority)

**Severity:** Low  
**Type:** Dead Code  
**Location:** `src/App.tsx:90-92` and `src/App.tsx:202`

**Description:**
The admin page is rendered via early return at line 90, making the route definition at line 202 unreachable:

```tsx
// Line 90-92: This handles /admin
if (isAdminPage) {
  return <AdminPage />
}

// ... 100+ lines later in Routes ...

// Line 202: DEAD CODE - never executed
<Route path="/admin" element={<AdminPage />} />
```

**Impact:**
- Confusing code structure
- Dead code adds to bundle size (minimal)

**Recommendation:** Remove line 202

---

### Issue 4: Loose Type Definition (Low Priority)

**Severity:** Low  
**Type:** Type Safety  
**Location:** `src/hooks/useAlarms.ts:15-17`

**Description:**
`AlarmSettings` uses an index signature which loses type safety:

```tsx
interface AlarmSettings {
  [key: string]: boolean  // Accepts any string key
}
```

This allows invalid prayer names to be used without TypeScript errors:
```tsx
alarms['invalid-prayer'] = true  // No error, but should fail
```

**Better Approach:**
```tsx
import type { PrayerName } from '@/lib/data/types'
type AlarmSettings = Record<PrayerName, boolean>
```

**Impact:**
- Reduced type safety
- Potential for runtime bugs with typos

**Recommendation:** Use `Record<PrayerName, boolean>` type

---

### Issue 5: ESLint Rule Suppression (Low Priority)

**Severity:** Low  
**Type:** Code Quality  
**Location:** `src/hooks/usePrayerTimes.ts:52-53`

**Description:**
ESLint's exhaustive-deps rule is suppressed:

```tsx
const prayerInfo = useMemo(() => {
  return getCurrentAndNextPrayer(todayPrayers)
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [todayPrayers, currentMinute])  // currentMinute intentionally triggers recalc
```

The `currentMinute` dependency is used as a trigger to force recalculation every minute, even though the value itself isn't used in the computation. This is intentional but not immediately obvious.

**Impact:**
- Code intent is unclear to future developers
- ESLint suppression could hide real issues

**Recommendation:** Keep suppression but improve the comment to explain intent clearly

---

### Issue 6: Potential Stale Data (Low Priority)

**Severity:** Low  
**Type:** Edge Case Bug  
**Location:** `src/hooks/useIslamicEvents.ts:55-56`

**Description:**
`todayEvents` and `upcomingEvents` are computed once at mount and never updated:

```tsx
const todayEvents = useMemo(() => getTodayEvents(), [])
const upcomingEvents = useMemo(() => getUpcomingEvents(), [])
```

If a user keeps the app open past midnight, these values become stale.

**Impact:**
- Edge case: Users who leave app open overnight see yesterday's events
- Low probability issue for most users

**Recommendation:** Not urgent. Could be fixed with a DateProvider context if needed.

---

### Issue 7: Memoization with Empty Dependencies (Low Priority)

**Severity:** Low  
**Type:** Code Quality  
**Location:** `src/components/LandingPage.tsx:61`

**Description:**
`today` is memoized with empty dependencies:

```tsx
const today = useMemo(() => new Date(), [])
```

This creates a Date object once and never updates it. While `new Date()` is cheap and memoization isn't necessary, the pattern could confuse developers who expect `today` to always be current.

**Impact:**
- Minimal - Date is only used for display
- Could cause confusion if component stays mounted across midnight

**Recommendation:** Either remove memoization (Date creation is cheap) or add a comment explaining the intent.

---

### Issue 8: Magic Strings in Cloud Functions (Low Priority)

**Severity:** Low  
**Type:** Maintainability  
**Location:** `functions/index.js:24-27`

**Description:**
Prayer names and zone IDs are hardcoded without sharing constants with the frontend:

```javascript
const ZONES = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13']
const PRAYERS = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']
const PRAYER_DISPLAY_NAMES = {
  fajr: 'Fajr',
  // ...
}
```

The frontend has these same values in `src/lib/constants/prayerConstants.ts`.

**Impact:**
- Risk of inconsistency between frontend and backend
- Duplicated definitions

**Recommendation:** Not urgent for refactoring. Could share a constants file in the future, but Firebase Functions have a separate deployment context.

---

## Non-Issues (Reviewed and Acceptable)

### Storage Utilities
`src/lib/utils/storage.ts` - Well-implemented with proper error handling and SSR safety checks. No issues found.

### Time Utilities
`src/lib/utils/time.ts` - Clean implementations for parsing and formatting. No issues found.

### Type Definitions
`src/lib/data/types.ts` - Comprehensive and well-organized. Re-exports types from constants correctly.

### Context Implementations
All three contexts (`LocationContext`, `ThemeContext`, `PushNotificationContext`) follow React best practices with proper error boundaries for missing providers.

---

## Test Coverage Summary

| Test File | Tests | Status |
|-----------|-------|--------|
| `useCountdown.test.ts` | 19 | Pass |
| `useTheme.test.ts` | 15 | Pass |
| `usePrayerTimes.test.ts` | 19 | Pass |
| `useAlarms.test.ts` | 18 | Pass |
| `useHijriCalendar.test.ts` | 31 | Pass |
| `useIslamicEvents.test.ts` | 31 | Pass |
| `useLocation.test.ts` | 15 | Pass |
| `usePushNotifications.test.ts` | 15 | Pass |
| `LocationContext.test.tsx` | 9 | Pass |
| `ThemeContext.test.tsx` | 5 | Pass |
| `PushNotificationContext.test.tsx` | 7 | Pass |
| `subscribe.test.js` | 10 | Pass |
| `unsubscribe.test.js` | 10 | Pass |
| `eventMatching.test.ts` | 48 | Pass |
| `date.test.ts` | 31 | Pass |
| `time.test.ts` | 20 | Pass |
| `storage.test.ts` | 14 | Pass |
| `geo.test.ts` | 21 | Pass |
| `hijriCalendar.test.ts` | 37 | Pass |
| `messaging.test.ts` | 17 | Pass |
| `LocationChangePrompt.test.tsx` | 11 | Pass |
| `NotificationEnableModal.test.tsx` | 16 | Pass |
| **Total** | **419** | **Pass** |

---

## Recommendations Summary

| Issue | Priority | Action | Effort |
|-------|----------|--------|--------|
| Bundle Size | High | Code splitting | Medium |
| Duplicated Layout | Medium | Nested routes | Medium |
| Dead Admin Route | Low | Remove line 202 | Trivial |
| Loose AlarmSettings Type | Low | Use Record type | Low |
| ESLint Suppression | Low | Improve comment | Trivial |
| Stale Events Data | Low | Future: DateProvider | Medium |
| LandingPage today memo | Low | Remove or document | Trivial |
| Cloud Function constants | Low | Future consideration | N/A |

---

## Related Documents

- [REFACTORING_PLAN.md](./REFACTORING_PLAN.md) - Implementation plan for fixes
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Codebase architecture documentation
