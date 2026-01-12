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

## Pending Refactoring

### Components

#### High Priority - Data Duplication

| File | Line(s) | Issue | Solution |
|------|---------|-------|----------|
| `MonthView.tsx` | 30-33 | `monthNames` array hardcoded | Create `GREGORIAN_MONTHS` in `lib/utils/dateConstants.ts` |
| `MonthView.tsx` | 35 | `prayerKeys` duplicated | Import `prayerNames` from `@/lib/data/prayerTimes` |
| `WeekView.tsx` | 14 | `prayerKeys` duplicated | Import `prayerNames` from `@/lib/data/prayerTimes` |

#### Medium Priority - Magic Numbers/Strings

| File | Line(s) | Issue | Solution |
|------|---------|-------|----------|
| `LandingPage.tsx` | 54 | `dayOfWeek === 5` for Friday | Create `FRIDAY_INDEX = 5` constant |
| `LandingPage.tsx` | 90, 216, 229 | `[13, 14, 15]` Ayyam al-Beed days (3x) | Create `AYYAM_AL_BEED_DAYS` constant |
| `CalendarDay.tsx` | 31 | `day.hijriDay === 1 \|\| day.hijriDay === 15` | Create `MOON_PHASE_DISPLAY_DAYS` constant |
| `CalendarDay.tsx` | 74 | `'Ramadan'` magic string | Import from hijri constants |
| `HijriCalendarView.tsx` | 133, 144 | `'Ramadan'` magic string | Import from hijri constants |
| `HijriCalendarView.tsx` | 135, 140 | `'monday-fast'`, `'thursday-fast'` IDs | Create `RECURRING_FAST_IDS` constant |

#### Low Priority - Labels/Strings

| File | Line(s) | Issue | Solution |
|------|---------|-------|----------|
| `HijriDateDisplay.tsx` | 84-86 | Fasting type labels inline | Create fasting label constants (optional) |
| `PrayerRow.tsx` | 39 | `'Upcoming'` label | Consider constant (optional) |

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

### Phase 1: Create New Constants
- [ ] Create `lib/utils/dateConstants.ts` with `GREGORIAN_MONTHS` and `DAY_INDEX`
- [ ] Add `AYYAM_AL_BEED_DAYS` and `MOON_PHASE_DISPLAY_DAYS` to `hijriConstants.ts`
- [ ] Add `RAMADAN_NAME` to `hijriConstants.ts`
- [ ] Add `RECURRING_FAST_IDS` to `islamicEvents.ts`
- [ ] Update `lib/utils/index.ts` to export new constants

### Phase 2: Update Components
- [ ] `MonthView.tsx` - Use `GREGORIAN_MONTHS` and `prayerNames`
- [ ] `WeekView.tsx` - Use `prayerNames`
- [ ] `LandingPage.tsx` - Use `DAY_INDEX.FRIDAY` and `AYYAM_AL_BEED_DAYS`
- [ ] `CalendarDay.tsx` - Use `MOON_PHASE_DISPLAY_DAYS` and `RAMADAN_NAME`
- [ ] `HijriCalendarView.tsx` - Use `RAMADAN_NAME` and `RECURRING_FAST_IDS`

### Phase 3: Verify & Test
- [ ] Run all tests (`npm test`)
- [ ] Run build (`npm run build`)
- [ ] Manual smoke test of affected views

---

## Test Coverage

Current test status: **188 tests passing**

| Test File | Tests |
|-----------|-------|
| `lib/utils/storage.test.ts` | 14 |
| `lib/utils/time.test.ts` | 20 |
| `lib/data/hijriCalendar.test.ts` | 37 |
| `hooks/useTheme.test.ts` | 15 |
| `hooks/useCountdown.test.ts` | 19 |
| `hooks/usePrayerTimes.test.ts` | 19 |
| `hooks/useLocation.test.ts` | 15 |
| `hooks/useAlarms.test.ts` | 18 |
| `hooks/useIslamicEvents.test.ts` | 31 |

---

## Notes

- All refactoring maintains backward compatibility
- No breaking changes to component APIs
- Tests should continue passing after each change
- Commit after each logical group of changes
