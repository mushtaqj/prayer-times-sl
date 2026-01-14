# Refactoring Plan

## Executive Summary

This document outlines a balanced refactoring plan focused on **performance improvements** and **code quality enhancements** for the Prayer Times PWA. The plan prioritizes route-based code splitting and DRY principles through nested routes.

**Current State:**
- Build succeeds with no TypeScript or ESLint errors
- 419 tests passing
- Bundle size: 1,275 KB (exceeds 500 KB warning threshold)
- Some code duplication in route layouts

**Target State:**
- Reduced initial bundle size by ~30-40%
- DRY route layouts using React Router's nested routes
- Improved type safety
- Cleaner, more maintainable codebase

---

## Phase 1: Route-Based Code Splitting

**Goal:** Reduce initial bundle size by lazy loading route components.

**Priority:** High  
**Estimated Effort:** Medium  
**Risk:** Low (straightforward React pattern)

### 1.1 Create Loading Component

Create a reusable loading spinner for Suspense fallbacks.

**File:** `src/components/common/LoadingSpinner.tsx`

```tsx
export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  )
}
```

### 1.2 Implement Lazy Loading in App.tsx

Convert static imports to dynamic imports for route components:

**Before:**
```tsx
import { LandingPage } from '@/components/LandingPage'
import { DailyView } from '@/components/DailyView'
import { WeekView } from '@/components/WeekView'
import { MonthView } from '@/components/MonthView'
import { HijriCalendarView } from '@/components/HijriCalendarView'
import { AdminPage } from '@/components/AdminPage'
```

**After:**
```tsx
import { lazy, Suspense } from 'react'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

const LandingPage = lazy(() => import('@/components/LandingPage').then(m => ({ default: m.LandingPage })))
const DailyView = lazy(() => import('@/components/DailyView').then(m => ({ default: m.DailyView })))
const WeekView = lazy(() => import('@/components/WeekView').then(m => ({ default: m.WeekView })))
const MonthView = lazy(() => import('@/components/MonthView').then(m => ({ default: m.MonthView })))
const HijriCalendarView = lazy(() => import('@/components/HijriCalendarView').then(m => ({ default: m.HijriCalendarView })))
const AdminPage = lazy(() => import('@/components/AdminPage').then(m => ({ default: m.AdminPage })))
```

### 1.3 Wrap Routes with Suspense

```tsx
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    {/* ... routes ... */}
  </Routes>
</Suspense>
```

### 1.4 Verification

After implementation:
1. Run `npm run build` and verify chunk splitting in output
2. Check that each route loads its own chunk
3. Verify initial bundle is smaller
4. Test navigation between routes works correctly

---

## Phase 2: Nested Routes for Prayer Views

**Goal:** Eliminate duplicated layout code in `/prayer/*` routes using React Router's outlet pattern.

**Priority:** Medium  
**Estimated Effort:** Medium  
**Risk:** Low

### 2.1 Create PrayerLayout Component

**File:** `src/components/layouts/PrayerLayout.tsx`

```tsx
import { Outlet } from 'react-router-dom'
import { ViewSwitcher } from '@/components/ViewSwitcher'
import { ActionBanner } from '@/components/ActionBanner'
import { Bell } from 'lucide-react'

interface PrayerLayoutProps {
  hasPermission: boolean
  onEnableNotifications: () => void
}

export function PrayerLayout({ hasPermission, onEnableNotifications }: PrayerLayoutProps) {
  return (
    <>
      {/* Sticky View Switcher */}
      <div className="sticky top-[calc(48px+env(safe-area-inset-top))] sm:top-[60px] z-30 mt-[calc(48px+env(safe-area-inset-top))] sm:mt-0 bg-background/95 backdrop-blur-md px-4 py-3 border-b border-border/50 supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <ViewSwitcher />
      </div>

      <div className="p-4 pb-20 sm:pb-4 space-y-6 flex-1">
        {/* Notification Banner */}
        {!hasPermission && (
          <ActionBanner
            icon={Bell}
            message="Enable notifications for prayer alerts"
            actionLabel="Enable"
            onAction={onEnableNotifications}
          />
        )}

        {/* Child Route Content */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Outlet />
        </div>
      </div>
    </>
  )
}
```

### 2.2 Refactor App.tsx Routes

**Before (current - duplicated layout):**
```tsx
<Route path="/prayer" element={<>...<ViewSwitcher/>...<DailyView/></>} />
<Route path="/prayer/week" element={<>...<ViewSwitcher/>...<WeekView/></>} />
<Route path="/prayer/month" element={<>...<ViewSwitcher/>...<MonthView/></>} />
```

**After (nested routes):**
```tsx
<Route path="/prayer" element={<PrayerLayout hasPermission={hasPermission} onEnableNotifications={handleEnableNotifications} />}>
  <Route index element={<DailyView prayers={todayPrayers} nextPrayer={nextPrayer} currentPrayer={currentPrayer} alarms={alarms} onToggleAlarm={toggleAlarm} location={locationName} />} />
  <Route path="week" element={<WeekView prayers={weekPrayers} location={locationName} />} />
  <Route path="month" element={<MonthView getMonthPrayers={getMonthPrayers} location={locationName} />} />
</Route>
```

### 2.3 Lines of Code Removed

This refactoring will remove approximately **40 lines** of duplicated code from `App.tsx`.

### 2.4 Verification

1. Run `npm run test` - all tests should pass
2. Manually test all prayer routes (`/prayer`, `/prayer/week`, `/prayer/month`)
3. Verify ViewSwitcher works correctly on all views
4. Verify notification banner appears/disappears correctly

---

## Phase 3: Type Safety Improvements

**Goal:** Improve type safety and remove dead code.

**Priority:** Low  
**Estimated Effort:** Low  
**Risk:** Very Low

### 3.1 Fix AlarmSettings Type

**File:** `src/hooks/useAlarms.ts:15-17`

**Before:**
```tsx
interface AlarmSettings {
  [key: string]: boolean
}
```

**After:**
```tsx
import type { PrayerName } from '@/lib/data/types'

type AlarmSettings = Record<PrayerName, boolean>
```

### 3.2 Remove Dead Admin Route

**File:** `src/App.tsx:202`

The admin route at line 202 is unreachable because of the early return at line 90. Remove the dead route.

**Before:**
```tsx
// Line 90-92: Early return for admin
if (isAdminPage) {
  return <AdminPage />
}

// ... later in Routes ...

// Line 202: Dead code - never reached
<Route path="/admin" element={<AdminPage />} />
```

**After:**
```tsx
// Keep only the early return at line 90-92
if (isAdminPage) {
  return <AdminPage />
}

// Remove line 202 entirely
```

### 3.3 Address ESLint Suppression (Optional)

**File:** `src/hooks/usePrayerTimes.ts:52-53`

The current code suppresses exhaustive-deps because `currentMinute` is used as a trigger without being directly used in the calculation. This is intentional behavior.

**Options:**
1. **Keep as-is** - The comment explains the intent
2. **Refactor** - Extract the time-based recalculation logic to be more explicit

**Recommendation:** Keep as-is with an improved comment:

```tsx
// Re-calculate when time changes (currentMinute triggers recalc without being used in calculation)
// eslint-disable-next-line react-hooks/exhaustive-deps
```

---

## Phase 4: Optional Cleanups

**Goal:** Additional improvements that are nice-to-have but not critical.

**Priority:** Low  
**Estimated Effort:** Medium  
**Risk:** Low

### 4.1 Fix Stale Date in LandingPage

**File:** `src/components/LandingPage.tsx:61`

**Issue:** `today` is memoized with `[]` which means it never updates if the component stays mounted past midnight.

**Before:**
```tsx
const today = useMemo(() => new Date(), [])
```

**After (Option A - Simple fix):**
```tsx
// Remove memoization - Date creation is cheap
const today = new Date()
```

**After (Option B - Refresh at midnight):**
Create a `useTodayDate` hook that refreshes at midnight. Only implement if midnight rollover is a real use case.

### 4.2 Centralize Date Handling (Future)

If midnight rollover becomes important, create a `DateProvider` context:

```tsx
// src/contexts/DateContext.tsx
const DateContext = createContext<Date>(new Date())

export function DateProvider({ children }) {
  const [today, setToday] = useState(new Date())
  
  useEffect(() => {
    // Calculate ms until midnight
    const now = new Date()
    const midnight = new Date(now)
    midnight.setHours(24, 0, 0, 0)
    const msUntilMidnight = midnight.getTime() - now.getTime()
    
    const timeout = setTimeout(() => {
      setToday(new Date())
    }, msUntilMidnight)
    
    return () => clearTimeout(timeout)
  }, [today])
  
  return <DateContext.Provider value={today}>{children}</DateContext.Provider>
}
```

**Recommendation:** Skip for now. Users typically close/reopen the app daily.

---

## Implementation Order

| Step | Phase | Task | Est. Time |
|------|-------|------|-----------|
| 1 | 1.1 | Create LoadingSpinner component | 5 min |
| 2 | 1.2 | Implement lazy loading in App.tsx | 15 min |
| 3 | 1.3 | Add Suspense boundaries | 5 min |
| 4 | 1.4 | Test and verify bundle splitting | 10 min |
| 5 | 2.1 | Create PrayerLayout component | 15 min |
| 6 | 2.2 | Refactor routes to nested pattern | 20 min |
| 7 | 2.3 | Test all prayer routes | 10 min |
| 8 | 3.1 | Fix AlarmSettings type | 5 min |
| 9 | 3.2 | Remove dead admin route | 2 min |
| 10 | 3.3 | Update ESLint comment | 2 min |

**Total Estimated Time:** ~90 minutes

---

## Testing Strategy

### Automated Tests
```bash
# Run full test suite after each phase
npm run test

# Run build to verify no TypeScript errors
npm run build

# Run linting
npm run lint
```

### Manual Testing Checklist

**After Phase 1 (Code Splitting):**
- [ ] App loads without errors
- [ ] Navigate to each route and verify it loads
- [ ] Check Network tab - routes should load separate chunks
- [ ] Verify build output shows multiple JS chunks

**After Phase 2 (Nested Routes):**
- [ ] `/prayer` shows daily view with ViewSwitcher
- [ ] `/prayer/week` shows week view with ViewSwitcher
- [ ] `/prayer/month` shows month view with ViewSwitcher
- [ ] ViewSwitcher navigation works correctly
- [ ] Notification banner shows/hides correctly
- [ ] Back/forward browser navigation works

**After Phase 3 (Type Safety):**
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] Admin page still accessible at `/admin`

---

## Rollback Plan

Each phase is independent and can be rolled back separately:

1. **Phase 1 Rollback:** Revert lazy imports to static imports, remove Suspense
2. **Phase 2 Rollback:** Revert to flat routes with duplicated layout
3. **Phase 3 Rollback:** Revert type changes (low risk, unlikely needed)

Git strategy:
```bash
# Create a branch for refactoring
git checkout -b refactor/code-splitting-and-nested-routes

# Commit after each phase
git commit -m "feat: implement route-based code splitting"
git commit -m "refactor: use nested routes for prayer views"
git commit -m "fix: improve type safety in useAlarms"

# If issues arise, revert specific commits
git revert <commit-hash>
```

---

## Success Metrics

| Metric | Current | Target | How to Measure |
|--------|---------|--------|----------------|
| Initial JS Bundle | 1,275 KB | < 900 KB | `npm run build` output |
| Duplicated Layout Code | ~40 lines x 3 | 0 | Manual review |
| Type Safety Issues | 2 | 0 | TypeScript strict mode |
| Test Coverage | 419 tests | 419+ tests | `npm run test` |

---

## Related Documents

- [CODE_ANALYSIS.md](./CODE_ANALYSIS.md) - Detailed analysis of issues found
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Current codebase architecture
- [PUSH_NOTIFICATIONS_PLAN.md](./PUSH_NOTIFICATIONS_PLAN.md) - Push notification implementation

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-14 | 1.0 | Initial plan created |
