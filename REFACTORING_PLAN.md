# Refactoring Plan

This document tracks the ongoing refactoring efforts to improve code organization, eliminate code smells, and establish proper separation of concerns.

## Architecture Principles

### Separation of Concerns

```
src/
├── lib/
│   ├── data/           # Data layer - domain-specific data modules
│   │   ├── types.ts    # Shared TypeScript types
│   │   ├── prayerTimes.ts
│   │   ├── hijriCalendar.ts
│   │   ├── islamicEvents.ts
│   │   └── virtues.ts
│   ├── utils/          # Pure utility functions
│   │   ├── date.ts
│   │   ├── time.ts
│   │   ├── storage.ts
│   │   ├── audio.ts
│   │   ├── geo.ts
│   │   ├── eventMatching.ts
│   │   ├── hijriConstants.ts
│   │   ├── alarmConstants.ts
│   │   ├── themeConstants.ts
│   │   └── countdownConstants.ts
│   └── tailwind.ts     # Tailwind utilities (cn function)
├── hooks/              # React hooks - state management only
└── components/         # React components - presentation only
```

### Guidelines

1. **Hooks** should only manage React state, delegating logic to data layer
2. **Data layer** contains domain data, constants, and pure functions
3. **Utils** contain reusable pure functions with no domain knowledge
4. **Components** should be presentational, using hooks for state
5. **No magic strings/numbers** - use named constants
6. **No type exports from hooks** - types belong in `@/lib/data/types`
7. **No duplicated data** - single source of truth in data layer

---

## Completed Refactoring

### Hooks

| Hook | Status | Changes Made |
|------|--------|--------------|
| `useHijriCalendar` | ✅ Done | Extracted calendar logic to `lib/data/hijriCalendar.ts` |
| `useIslamicEvents` | ✅ Done | Moved data to `lib/data/islamicEvents.ts` and `lib/data/virtues.ts` |
| `usePrayerTimes` | ✅ Done | Created `prayerMetadata`, `prayerNames`, `getCurrentAndNextPrayer` in data layer. Reduced 122 → 43 lines (65%) |
| `useLocation` | ✅ Done | Created `lib/utils/geo.ts`, moved `districtCoordinates`, `findNearestDistrict` to data layer. Reduced 140 → 69 lines (51%) |
| `useAlarms` | ✅ Done | Created `lib/utils/audio.ts` and `lib/utils/alarmConstants.ts`. Reduced 219 → 157 lines (~28%) |
| `useTheme` | ✅ Done | Created `lib/utils/themeConstants.ts`, added `useCallback` to `toggleTheme` |
| `useCountdown` | ✅ Done | Created `lib/utils/countdownConstants.ts` for timing constants |

### Utility Modules Created

| Module | Purpose |
|--------|---------|
| `lib/utils/date.ts` | Date formatting and manipulation |
| `lib/utils/time.ts` | Time parsing and countdown formatting |
| `lib/utils/storage.ts` | LocalStorage wrapper functions |
| `lib/utils/audio.ts` | Notification sound playback |
| `lib/utils/geo.ts` | Geolocation utilities (`calculateDistance`, `findNearest`) |
| `lib/utils/eventMatching.ts` | Event type matching utilities |
| `lib/utils/hijriConstants.ts` | Hijri calendar constants |
| `lib/utils/alarmConstants.ts` | Alarm/notification constants |
| `lib/utils/themeConstants.ts` | Theme constants (`THEME_DARK`, `THEME_LIGHT`, etc.) |
| `lib/utils/countdownConstants.ts` | Countdown timing constants |

### Data Layer Modules

| Module | Contents |
|--------|----------|
| `lib/data/prayerTimes.ts` | `prayerNames`, `prayerMetadata`, `districtCoordinates`, `getCurrentAndNextPrayer`, `findNearestDistrict` |
| `lib/data/hijriCalendar.ts` | `gregorianToHijri`, `formatHijriDate`, `getMoonPhase`, Hijri month data |
| `lib/data/islamicEvents.ts` | Islamic events data, recurring fasts, month information |
| `lib/data/virtues.ts` | Virtue content for Islamic events |
| `lib/data/types.ts` | All shared TypeScript types |

---

## Completed Refactoring (Components)

### High Priority - Data Duplication ✅

| File | Issue | Solution | Status |
|------|-------|----------|--------|
| `MonthView.tsx` | `monthNames` array hardcoded | Import `GREGORIAN_MONTHS` from `dateConstants.ts` | ✅ Done |
| `MonthView.tsx` | `prayerKeys` duplicated | Import `prayerNames` from `prayerTimes.ts` | ✅ Done |
| `WeekView.tsx` | `prayerKeys` duplicated | Import `prayerNames` from `prayerTimes.ts` | ✅ Done |

### Medium Priority - Magic Numbers/Strings ✅

| File | Issue | Solution | Status |
|------|-------|----------|--------|
| `LandingPage.tsx` | `dayOfWeek === 5` for Friday | Use `DAY_INDEX.FRIDAY` | ✅ Done |
| `LandingPage.tsx` | `[13, 14, 15]` Ayyam al-Beed days | Use `AYYAM_AL_BEED_DAYS` | ✅ Done |
| `CalendarDay.tsx` | `day.hijriDay === 1 \|\| day.hijriDay === 15` | Use `MOON_PHASE_DISPLAY_DAYS` | ✅ Done |
| `CalendarDay.tsx` | `'Ramadan'` magic string | Use `RAMADAN_NAME` | ✅ Done |
| `HijriCalendarView.tsx` | `'Ramadan'` magic string | Use `RAMADAN_NAME` | ✅ Done |
| `HijriCalendarView.tsx` | `'monday-fast'`, `'thursday-fast'` IDs | Use `RECURRING_FAST_IDS` | ✅ Done |

### Low Priority - Labels/Strings (Pending)

| File | Issue | Solution | Status |
|------|-------|----------|--------|
| `HijriDateDisplay.tsx` | Fasting type labels inline | Create fasting label constants | Optional |
| `PrayerRow.tsx` | `'Upcoming'` label | Consider constant | Optional |

---

## Proposed New Constants

### `lib/utils/dateConstants.ts` (new file)

```typescript
/** Gregorian month names */
export const GREGORIAN_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
] as const

/** Day of week indices */
export const DAY_INDEX = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
} as const
```

### `lib/utils/hijriConstants.ts` (additions)

```typescript
/** Ayyam al-Beed (White Days) - 13th, 14th, 15th of lunar month */
export const AYYAM_AL_BEED_DAYS = [13, 14, 15] as const

/** Days to display moon phase icon (new moon, full moon) */
export const MOON_PHASE_DISPLAY_DAYS = [1, 15] as const

/** Ramadan month name for comparisons */
export const RAMADAN_NAME = 'Ramadan'
```

### `lib/data/islamicEvents.ts` (additions)

```typescript
/** Recurring fast IDs for lookups */
export const RECURRING_FAST_IDS = {
  MONDAY: 'monday-fast',
  THURSDAY: 'thursday-fast',
  AYYAM_AL_BEED: 'ayyam-al-beed',
} as const
```

---

## Refactoring Checklist

### Phase 1: Create New Constants ✅
- [x] Create `lib/utils/dateConstants.ts` with `GREGORIAN_MONTHS` and `DAY_INDEX`
- [x] Add `MOON_PHASE_DISPLAY_DAYS` to `hijriConstants.ts` (AYYAM_AL_BEED_DAYS already existed)
- [x] Add `RAMADAN_NAME` to `hijriConstants.ts`
- [x] Add `RECURRING_FAST_IDS` to `islamicEvents.ts`

### Phase 2: Update Components ✅
- [x] `MonthView.tsx` - Use `GREGORIAN_MONTHS` and `prayerNames`
- [x] `WeekView.tsx` - Use `prayerNames`
- [x] `LandingPage.tsx` - Use `DAY_INDEX.FRIDAY` and `AYYAM_AL_BEED_DAYS`
- [x] `CalendarDay.tsx` - Use `MOON_PHASE_DISPLAY_DAYS` and `RAMADAN_NAME`
- [x] `HijriCalendarView.tsx` - Use `RAMADAN_NAME` and `RECURRING_FAST_IDS`

### Phase 3: Verify & Test ✅
- [x] Run all tests (`npm test`) - 322 passing
- [x] Run build (`npm run build`) - Success

---

## Test Coverage

Current test status: **322 tests passing**

| Test File | Tests |
|-----------|-------|
| `lib/utils/storage.test.ts` | 14 |
| `lib/utils/time.test.ts` | 20 |
| `lib/utils/date.test.ts` | 34 |
| `lib/utils/geo.test.ts` | 21 |
| `lib/utils/eventMatching.test.ts` | 48 |
| `lib/data/hijriCalendar.test.ts` | 37 |
| `hooks/useTheme.test.ts` | 15 |
| `hooks/useCountdown.test.ts` | 19 |
| `hooks/usePrayerTimes.test.ts` | 19 |
| `hooks/useLocation.test.ts` | 15 |
| `hooks/useAlarms.test.ts` | 18 |
| `hooks/useIslamicEvents.test.ts` | 31 |
| `hooks/useHijriCalendar.test.ts` | 31 |

---

## Pending: React Best Practices Refactoring

### 1. Large Components to Split

#### AdminPage.tsx (407 lines) - HIGH PRIORITY
| Extract To | Responsibility |
|------------|----------------|
| `<AdminForm>` | Form fields (email, password, days selection) |
| `<MonthTransitionCard>` | Current → Next month info display |
| `<RecentChangesHistory>` | Collapsible history section |
| `<SubmitStatus>` | Success/error state rendering |
| `useAdminForm()` hook | Form state, validation, submission |

#### LandingPage.tsx (369 lines) - HIGH PRIORITY
| Extract To | Responsibility |
|------------|----------------|
| `<NextPrayerCard>` | Hero section with countdown circle |
| `<TodayBlessingsCard>` | Fasting/Friday pills and blessings |
| `<NavigationButtons>` | Three navigation buttons grid |
| `<MonthPickerModal>` | Month picker overlay |
| `useRecommendedPills()` hook | Compute recommended Ibadah pills |
| `getPrayerIcon()` utility | Prayer name → icon mapping |

#### HijriCalendarView.tsx (375 lines) - HIGH PRIORITY
| Extract To | Responsibility |
|------------|----------------|
| `<CalendarHeader>` | Month name, navigation, Gregorian range |
| `<CalendarQuickActions>` | Today button, legend toggle, jump to date |
| `useCalendarGrid()` hook | Grid generation with empty cell padding |
| `useDayClickHandler()` hook | Day click content generation |

#### MonthView.tsx (195 lines) - MEDIUM PRIORITY
| Extract To | Responsibility |
|------------|----------------|
| `<DesktopMonthTable>` | Full table view for desktop |
| `<MobileMonthList>` | Simplified list for mobile |
| `<DayDetailsSheet>` | Bottom sheet with prayer times |

---

### 2. Code Duplication to Extract

#### Theme Toggle Button
- **Files:** `LandingPage.tsx:150-157`, `Header.tsx:108`
- **Issue:** Inline button instead of using existing `ThemeToggleButton`
- **Solution:** Use `<ThemeToggleButton>` component

#### Location Badge
- **Files:** `DailyView.tsx:66-69`, `MonthView.tsx:61-65`, `WeekView.tsx:30-33`
- **Issue:** Same MapPin + location display pattern repeated
- **Solution:** Create `<LocationBadge location={string} />` component

#### Date Header Display
- **Files:** `DailyView.tsx:41-47`, `MonthView.tsx:41-46`, `WeekView.tsx:19-24`
- **Issue:** Same date formatting with `toLocaleDateString` options
- **Solution:** Create `useDateDisplay(date)` hook or utility

#### Section Toggle
- **Files:** `Header.tsx:60-81`, `MobileNav.tsx:157-186`
- **Issue:** Nearly identical toggle button styling
- **Solution:** Create `<SectionToggle>` component

---

### 3. Prop Drilling - Context Needed

#### ThemeContext
- **Props drilled:** `isDark`, `onThemeToggle`
- **Through:** `App` → `Header` → `ThemeToggleButton`, `App` → `LandingPage`
- **Solution:** Create `ThemeContext` with `useTheme()` hook access

#### LocationContext
- **Props drilled:** `districts`, `selectedDistrict`, `onDistrictChange`, `location`
- **Through:** `App` → `Header` → `MobileNav`, `App` → various views
- **Solution:** Create `LocationContext` with `useLocation()` hook access

---

### 4. Missing Memoization

| File | Line(s) | Issue | Solution |
|------|---------|-------|----------|
| `LandingPage.tsx` | 67-104 | `getRecommendedPills()` recalculated every render | Wrap in `useMemo` |
| `LandingPage.tsx` | 109-125 | `getPrayerIcon()` not memoized | Extract to utility or `useCallback` |
| `HijriCalendarView.tsx` | 94-161 | `handleDayClick` creates new content each render | Wrap in `useCallback` |
| `HijriCalendarView.tsx` | 178-189 | Gregorian range formatting recalculated | Wrap in `useMemo` |
| `MonthView.tsx` | 48-49 | `prevMonth`/`nextMonth` handlers | Wrap in `useCallback` |
| `MonthView.tsx` | 51-54 | `handleDayClick` not memoized | Wrap in `useCallback` |
| `WeekView.tsx` | 36-85 | Map creates new objects each render | Memoize row component |

---

### 5. Remaining Hardcoded Values

| File | Line(s) | Value | Solution |
|------|---------|-------|----------|
| `LandingPage.tsx` | 147 | `", Sri Lanka"` suffix | Create `LOCATION_SUFFIX` constant |
| `LandingPage.tsx` | 221-235 | Badge gradient colors | Create `BADGE_STYLES` constant object |
| `LandingPage.tsx` | 289-315 | Navigation button gradients | Create `NAV_BUTTON_STYLES` constant |
| `AdminPage.tsx` | 15 | `29 \| 30` days type | Create `HIJRI_MONTH_DAYS` enum |
| `MonthView.tsx` | 112 | `.slice(0, 3)` month abbrev | Create `MONTH_ABBREV_LENGTH = 3` |

---

### 6. Repeated Tailwind Patterns

| Pattern | Files | Solution |
|---------|-------|----------|
| `border-border/50 bg-card/40 backdrop-blur-sm` | 8+ components | Create `cardStyles` utility |
| `bg-gradient-to-br from-primary via-primary to-accent` | LandingPage, buttons | Create gradient class in Tailwind config |
| `text-xs text-muted-foreground uppercase tracking-wide` | Multiple headers | Create `subheadingStyles` utility |
| `rounded-xl border border-border/50` | Multiple cards | Create `roundedCardStyles` utility |

---

### 7. Suggested New Utilities/Hooks

```typescript
// hooks/useFormattedDate.ts
export function useFormattedDate(date: Date, options?: Intl.DateTimeFormatOptions): string

// hooks/useRecommendedPills.ts
export function useRecommendedPills(hijriDate: HijriDate, fastingInfo: FastingInfo): Pill[]

// utils/prayerIcons.tsx
export function getPrayerIcon(prayerName: string, className?: string): ReactNode

// components/common/LocationBadge.tsx
export function LocationBadge({ location }: { location: string }): JSX.Element

// components/common/SectionToggle.tsx
export function SectionToggle({ items, selected, onChange }): JSX.Element
```

---

## Refactoring Priority Order

### Phase 4: Component Extraction (HIGH) ✅
- [x] Split `AdminPage.tsx` into smaller components (407 → 212 lines, 48% reduction)
  - Created `AdminForm.tsx`, `AdminSuccessState.tsx`, `MonthTransitionCard.tsx`, `RecentChangesHistory.tsx`, `SecurityNote.tsx`
- [x] Split `LandingPage.tsx` into smaller components (369 → 228 lines, 38% reduction)
  - Created `NextPrayerCard.tsx`, `TodayBlessingsCard.tsx`, `NavigationButtons.tsx`, `MonthPickerModal.tsx`
  - Created `lib/utils/prayerIcons.tsx` utility
- [x] Split `HijriCalendarView.tsx` into smaller components (375 → 307 lines, 18% reduction)
  - Created `CalendarHeader.tsx`
  - Created `lib/utils/dayContent.ts` utility
- [x] Create `ThemeContext` and `LocationContext` (in `src/contexts/`)

### Phase 5: Deduplication (MEDIUM) ✅
- [x] Create `<LocationBadge>` component (in `components/common/`)
  - Used in DailyView, WeekView, MonthView
- [x] Create `useDateDisplay()` hook (in `hooks/`)
- [x] SectionToggle - Skipped (too navigation-specific)
- [x] ThemeToggleButton already used where needed

### Phase 6: Performance (MEDIUM) ✅
- [x] Add `useMemo` to `getRecommendedPills` in LandingPage
- [x] Add `useCallback` to `openVirtuesSheet` in LandingPage
- [x] Add `useCallback` to handlers in MonthView (`prevMonth`, `nextMonth`, `handleDayClick`)
- [x] Add `useCallback` to `handleDayClick` in HijriCalendarView
- [x] Memoize `gregorianRange` calculation in HijriCalendarView
- [x] Memoize `showTodayButton` calculation in HijriCalendarView

### Phase 7: Constants & Cleanup (LOW) ✅
- [x] Create `lib/utils/appConstants.ts` with `COUNTRY_NAME`, `LOCATION_SUFFIX`, `MONTH_ABBREV_LENGTH`
- [x] Add `FIRST_GREGORIAN_MONTH` and `LAST_GREGORIAN_MONTH` to dateConstants.ts
- [x] Replace "Sri Lanka" hardcoded strings with `COUNTRY_NAME` constant
- [x] Replace month cycling magic numbers (1, 12) with constants
- [x] Extract `getPrayerIcon` utility function (moved to `lib/utils/prayerIcons.tsx`)

---

## Notes

- All refactoring maintains backward compatibility
- No breaking changes to component APIs
- Tests should continue passing after each change
- Commit after each logical group of changes
