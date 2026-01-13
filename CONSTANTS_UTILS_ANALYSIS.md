# Constants & Utils Analysis

## Summary

Analysis of constants and utility files for dead code, overlapping definitions, and maintenance concerns.

**Status: COMPLETED** - All identified issues have been addressed.

---

## Changes Made

### Dead Code Removed

| Item | File | Action |
|------|------|--------|
| `MONTH_ABBREV_LENGTH` | `appConstants.ts` | Removed (was unused) |
| `SUNNAH_FASTING_DAYS` | `hijriConstants.ts` | Removed (redundant with DAY_INDEX.MONDAY/THURSDAY) |
| `startOfDay` | `date.ts` | Removed (only used in tests) |
| DAY_INDEX import | `hijriConstants.ts` | Removed (was only used by SUNNAH_FASTING_DAYS) |

### Constants Fixed

| Item | File | Change |
|------|------|--------|
| `REMINDER_BEFORE_MS` | `alarmConstants.ts` | Now derived from `REMINDER_BEFORE_MINUTES` |
| Script-only constants | `hijriConstants.ts` | Added comment noting usage by scripts/update-hijri.js |

### Cognitive Complexity Improvements

#### eventMatching.ts - `getAllEventsForDay` refactored

**Before:** Single 70+ line function with nested logic

**After:** Extracted into 4 focused helper functions:
- `processFixedEvents()` - Processes fixed events and returns fasting forbidden status
- `getAyyamAlBeedEvent()` - Returns Ayyam al-Beed event if applicable
- `getAnnualRecurringEvents()` - Gets annual recurring events for a day
- `getWeeklyFastEvents()` - Gets Monday/Thursday fast events

Main function now orchestrates these helpers clearly.

#### dayContent.ts - `generateDayContent` refactored

**Before:** Single function with multiple nested if-else branches

**After:** Extracted into focused helper functions:
- `generateEventsContent()` - Generates content for day events
- `generateFridayContent()` - Generates Friday blessings content
- `getFastingDetails()` - Gets fasting details based on fast type (switch statement)
- `generateFastingContent()` - Generates fasting content section
- `DEFAULT_FRIDAY_BLESSINGS` - Extracted constant for default Friday content

Main function now builds sections array and joins them.

---

## Remaining Considerations (Low Priority)

### 3.1 Event Type Definitions (No Change Required)

Two separate places define event types with different structures:

**`hijriConstants.ts`:**
```typescript
export const EVENT_TYPE = {
  EID: 'eid',
  HOLY: 'holy',
  FAST: 'fast',
  RECOMMENDED: 'recommended',
  SUNNAH: 'sunnah',
  HISTORICAL: 'historical',
} as const
```

**`calendarConstants.ts`:**
```typescript
export const EVENT_STYLES = {
  eid: { bg: '...', indicator: '...', ... },
  holy: { ... },
  fast: { ... },
  ayyamAlBeed: { ... },  // Not in EVENT_TYPE!
  sunnah: { ... },
  recommended: { ... },
} as const
```

**Note:** `ayyamAlBeed` is a special styling case, not a core event type. This is acceptable.

### 3.2 Sunnah/Recommended Overlap (Documented)

Both `FASTING_TYPE` and `EVENT_TYPE` define `sunnah` and `recommended`. These serve different purposes:
- `FASTING_TYPE` - Classification of fasting obligation
- `EVENT_TYPE` - Classification of calendar events

This overlap is acceptable and documented.

### Trivial Constants (Kept)

These constants provide semantic meaning and were kept:
- `FIRST_GREGORIAN_MONTH`, `LAST_GREGORIAN_MONTH`
- `FIRST_HIJRI_MONTH`, `LAST_HIJRI_MONTH`
- `NEW_MOON_DAY`, `FULL_MOON_DAY`
- `MIN_PROGRESS`, `MAX_PROGRESS`

---

## File Status Summary

### Constants Files

| File | Lines | Status |
|------|-------|--------|
| `appConstants.ts` | 10 | Clean |
| `alarmConstants.ts` | 39 | Clean |
| `themeConstants.ts` | 23 | Clean |
| `countdownConstants.ts` | 23 | Clean |
| `dateConstants.ts` | 29 | Clean |
| `hijriConstants.ts` | 110 | Clean |
| `prayerConstants.ts` | 65 | Clean |

### Utils Files

| File | Lines | Status |
|------|-------|--------|
| `date.ts` | 110 | Clean (removed startOfDay) |
| `time.ts` | 48 | Clean |
| `storage.ts` | 67 | Clean |
| `geo.ts` | 86 | Clean |
| `audio.ts` | 107 | Clean |
| `eventMatching.ts` | ~290 | Clean (refactored for readability) |
| `dayContent.ts` | ~115 | Clean (refactored for readability) |
| `prayerIcons.tsx` | 19 | Clean |

---

## Verification

All 319 tests pass after changes.
