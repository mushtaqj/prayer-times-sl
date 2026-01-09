# Hijri Calendar Integration Plan

## Project Overview

Integrate a comprehensive Islamic Hijri calendar system into the existing Prayer Times Sri Lanka app, featuring historical moon sighting data from Sri Lanka's official sources.

---

## 1. Feature Scope

### 1.1 Core Features

| Feature | Description | Priority |
|---------|-------------|----------|
| **Today's Hijri Date** | Display current Hijri date alongside Gregorian date in the app header/daily view | High |
| **Monthly Calendar View** | Full calendar grid showing Hijri months with corresponding Gregorian dates | High |
| **Historical Data** | Moon sighting records from 1433 AH onwards (~2011 CE to present) | High |
| **Important Islamic Dates** | Highlight and notify users of significant Islamic events | Medium |
| **Fasting Days** | Mark recommended and obligatory fasting days | Medium |
| **Moon Phase Visualization** | Show moon phase icons for each day | Low |

### 1.2 Out of Scope (v1)

- Prayer time adjustments based on Hijri calendar
- Push notifications for events (future enhancement)
- Hijri date converter tool
- Multiple moon sighting methodologies

---

## 2. Data Structure

### 2.1 Hijri Month Data Schema

```typescript
interface HijriMonth {
  hijriYear: number;        // e.g., 1446
  hijriMonth: number;       // 1-12
  hijriMonthName: string;   // e.g., "Muharram"
  gregorianStart: string;   // e.g., "2024-07-08" (ISO format)
  gregorianEnd: string;     // e.g., "2024-08-05"
  totalDays: 29 | 30;       // Determined by moon sighting
  moonSightingDate: string; // Date moon was sighted
  source: string;           // "ACJU" or "SLHub"
}
```

### 2.2 Important Dates Schema

```typescript
interface IslamicEvent {
  name: string;
  nameArabic: string;
  hijriMonth: number;
  hijriDay: number;
  type: 'eid' | 'fast' | 'holy' | 'recommended';
  description: string;
  isFastingDay: boolean;
}
```

### 2.3 Data File Structure

```
src/data/
├── prayerTimes.json          # Existing
├── hijriCalendar.json        # New - Historical moon sighting data
└── islamicEvents.json        # New - Important dates and events
```

---

## 3. Data Collection Strategy

### 3.1 Source: SLHub Hilaal Calendar

**URL Pattern:** `https://www.slhub.com/hilaal-calendar/{month-name}-{hijri-year}-{gregorian-months}-{gregorian-year}`

**Available Range:** 1433 AH (2011 CE) to 1446 AH (2025 CE)

### 3.2 Data Extraction Approach

For each Hijri year (1433-1446), extract:

| Field | How to Determine |
|-------|------------------|
| Month Start Date | First day shown in calendar |
| Month End Date | Last day (29th or 30th) |
| Total Days | If next month starts on day 30, previous month = 29 days |

**Key Insight:** When a calendar shows "29/30" uncertainty, the next month's first day reveals the actual length:
- If next month starts on the expected 30th day → previous month was 29 days
- If next month starts one day later → previous month was 30 days

### 3.3 Data Collection Table

| Hijri Year | Gregorian Range | Status |
|------------|-----------------|--------|
| 1433 | Nov 2011 - Nov 2012 | Pending |
| 1434 | Nov 2012 - Nov 2013 | Pending |
| 1435 | Nov 2013 - Oct 2014 | Pending |
| 1436 | Oct 2014 - Oct 2015 | Pending |
| 1437 | Oct 2015 - Oct 2016 | Pending |
| 1438 | Oct 2016 - Sep 2017 | Pending |
| 1439 | Sep 2017 - Sep 2018 | Pending |
| 1440 | Sep 2018 - Aug 2019 | Pending |
| 1441 | Sep 2019 - Aug 2020 | Pending |
| 1442 | Aug 2020 - Aug 2021 | Pending |
| 1443 | Aug 2021 - Jul 2022 | Pending |
| 1444 | Jul 2022 - Jul 2023 | Pending |
| 1445 | Jul 2023 - Jul 2024 | Pending |
| 1446 | Jul 2024 - Jul 2025 | Pending |

---

## 4. UI/UX Components

### 4.1 New Components to Create

```
src/components/
├── HijriDate.tsx           # Today's Hijri date display
├── HijriCalendar/
│   ├── CalendarView.tsx    # Monthly grid calendar
│   ├── CalendarHeader.tsx  # Month/year navigation
│   ├── CalendarDay.tsx     # Individual day cell
│   └── MoonPhase.tsx       # Moon phase indicator
├── IslamicEvents/
│   ├── EventList.tsx       # Upcoming events list
│   ├── EventCard.tsx       # Individual event card
│   └── FastingDays.tsx     # Fasting days indicator
```

### 4.2 UI Integration Points

| Location | Integration |
|----------|-------------|
| **Header** | Show today's Hijri date below Gregorian date |
| **Daily View** | Add Hijri date next to Gregorian date for each prayer time |
| **View Switcher** | Add "Calendar" tab for Hijri calendar view |
| **Month View** | Overlay Hijri dates on existing month view or create separate view |

### 4.3 Mockup - Daily View Enhancement

```
┌─────────────────────────────────────────┐
│  Prayer Times - Colombo                 │
│  Friday, January 10, 2025               │
│  10 Rajab 1446 AH                       │ ← NEW
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐    │
│  │ ☀️ Fajr         5:45 AM  🔔     │    │
│  │ 🌅 Sunrise      6:32 AM        │    │
│  │ ☀️ Dhuhr        12:15 PM 🔔    │    │
│  │ ☀️ Asr          3:45 PM  🔔    │    │
│  │ 🌅 Maghrib      6:05 PM  🔔    │    │
│  │ 🌙 Isha         7:15 PM  🔔    │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

### 4.4 Mockup - Hijri Calendar View

```
┌─────────────────────────────────────────┐
│     ◀  Rajab 1446  ▶                    │
│        Jul - Aug 2024                   │
├─────────────────────────────────────────┤
│  Sat  Sun  Mon  Tue  Wed  Thu  Fri      │
├─────────────────────────────────────────┤
│       1    2    3    4    5    6        │
│      🌑  (Jul 7, 8, 9, 10, 11, 12)      │
│                                          │
│   7    8    9   10   11   12   13       │
│       🌓                                 │
│                                          │
│  14   15   16   17   18   19   20       │
│       🌕                    ★            │
│                         (Isra Mi'raj)    │
│                                          │
│  21   22   23   24   25   26   27       │
│       🌗                                 │
│                                          │
│  28   29   30                            │
│       🌑                                 │
└─────────────────────────────────────────┘

Legend: ★ Important Date  🌑🌓🌕🌗 Moon Phases
```

---

## 5. Important Islamic Dates

### 5.1 Fixed Dates (by Hijri calendar)

| Event | Hijri Date | Type | Fasting |
|-------|------------|------|---------|
| Islamic New Year | 1 Muharram | Holy | No |
| Ashura | 10 Muharram | Holy | Recommended |
| Mawlid al-Nabi | 12 Rabi al-Awwal | Holy | No |
| Isra and Mi'raj | 27 Rajab | Holy | Recommended |
| Shab e Barat | 15 Shaban | Holy | Recommended |
| Ramadan Begins | 1 Ramadan | Holy | Obligatory |
| Laylat al-Qadr | 27 Ramadan | Holy | - |
| Eid al-Fitr | 1 Shawwal | Eid | Forbidden |
| Day of Arafah | 9 Dhul Hijjah | Holy | Recommended |
| Eid al-Adha | 10 Dhul Hijjah | Eid | Forbidden |
| Days of Tashreeq | 11-13 Dhul Hijjah | Holy | Forbidden |

### 5.2 Regular Fasting Days

| Day | Frequency | Type |
|-----|-----------|------|
| Monday | Weekly | Sunnah |
| Thursday | Weekly | Sunnah |
| 13th, 14th, 15th of each month | Monthly | Sunnah (Ayyam al-Beed) |
| 6 days of Shawwal | Annual | Sunnah |
| 9th Dhul Hijjah (Arafah) | Annual | Sunnah |
| 9th & 10th Muharram | Annual | Sunnah |

---

## 6. Hooks and Utilities

### 6.1 New Hooks

```typescript
// src/hooks/useHijriCalendar.ts
interface UseHijriCalendarReturn {
  todayHijri: HijriDate;
  currentMonth: HijriMonth;
  getMonthData: (year: number, month: number) => HijriMonth;
  navigateMonth: (direction: 'prev' | 'next') => void;
  gregorianToHijri: (date: Date) => HijriDate;
  hijriToGregorian: (hijri: HijriDate) => Date;
}

// src/hooks/useIslamicEvents.ts
interface UseIslamicEventsReturn {
  upcomingEvents: IslamicEvent[];
  todayEvents: IslamicEvent[];
  isFastingDay: (date: HijriDate) => boolean;
  getEventsForMonth: (year: number, month: number) => IslamicEvent[];
}

// src/hooks/useMoonPhase.ts
interface UseMoonPhaseReturn {
  getMoonPhase: (date: Date) => MoonPhase;
  getMoonPhaseIcon: (phase: MoonPhase) => string;
}
```

---

## 7. Implementation Phases

### Phase 1: Data Collection (Manual)
- [ ] Scrape SLHub calendars from 1433-1446
- [ ] Create `hijriCalendar.json` with month start/end dates
- [ ] Create `islamicEvents.json` with important dates
- [ ] Verify data accuracy by cross-referencing sources

### Phase 2: Core Implementation
- [ ] Create `useHijriCalendar` hook
- [ ] Create `HijriDate` component for today's date display
- [ ] Integrate Hijri date into Daily View header
- [ ] Add Hijri date to prayer times display

### Phase 3: Calendar View
- [ ] Create `CalendarView` component with navigation
- [ ] Add to ViewSwitcher (new "Calendar" tab)
- [ ] Implement month navigation
- [ ] Add important date highlighting

### Phase 4: Events & Fasting
- [ ] Create `useIslamicEvents` hook
- [ ] Create `EventList` and `EventCard` components
- [ ] Add fasting day indicators
- [ ] Show upcoming events section

### Phase 5: Moon Phases (Enhancement)
- [ ] Calculate moon phases algorithmically
- [ ] Create `MoonPhase` component
- [ ] Add moon phase icons to calendar view

---

## 8. Technical Considerations

### 8.1 Date Conversion Algorithm

Since we have historical moon sighting data, we don't need to rely on astronomical calculations. The approach:

1. Store actual month start dates from ACJU/SLHub data
2. Calculate any date by counting days from known month boundaries
3. For future dates beyond our data, use astronomical approximation with disclaimer

### 8.2 Performance

- Hijri calendar data (~14 years × 12 months = 168 records) is small
- Load data lazily or include in bundle (< 10KB estimated)
- Use memoization for date conversions

### 8.3 Offline Support

- Include hijri data in PWA cache
- All calculations done client-side
- No API calls required

---

## 9. File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/data/hijriCalendar.json` | Create | Historical moon sighting data |
| `src/data/islamicEvents.json` | Create | Important dates and events |
| `src/hooks/useHijriCalendar.ts` | Create | Hijri date calculations |
| `src/hooks/useIslamicEvents.ts` | Create | Events and fasting days |
| `src/components/HijriDate.tsx` | Create | Display Hijri date |
| `src/components/HijriCalendar/*.tsx` | Create | Calendar view components |
| `src/components/ViewSwitcher.tsx` | Modify | Add "Calendar" option |
| `src/components/DailyView.tsx` | Modify | Add Hijri date display |
| `src/App.tsx` | Modify | Integrate calendar view |

---

## 10. Questions for Review

Before proceeding with implementation:

1. **Data Range:** Should we go all the way back to 1433 (2011), or start from a more recent year like 1440 (2018)?

2. **Calendar Tab:** Should the Hijri calendar be a separate tab in ViewSwitcher, or accessible via a button/icon in the header?

3. **Events Notifications:** Do you want in-app notifications for upcoming events, or just visual indicators?

4. **Moon Phases:** Should moon phases be calculated algorithmically (approximate) or only shown when we have exact sighting data?

5. **Fasting Days:** Should we highlight recommended fasting days (Monday/Thursday) on the calendar?

---

## Approval Checklist

- [ ] Feature scope approved
- [ ] Data structure approved
- [ ] UI/UX mockups approved
- [ ] Implementation phases approved
- [ ] Questions answered

---

*Last Updated: January 10, 2026*
