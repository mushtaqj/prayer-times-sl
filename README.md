# Prayer Times Sri Lanka

A modern, mobile-first Progressive Web App (PWA) for Islamic prayer times and Hijri calendar across all districts in Sri Lanka.

## Features

### Prayer Times
- **All 26 Districts**: Complete coverage of Sri Lanka across 13 prayer time zones
- **Daily, Weekly & Monthly Views**: Multiple ways to view prayer schedules
- **Auto Location Detection**: Automatically detects your nearest district using GPS
- **Prayer Alarms**: Set notifications for any prayer time (with 10-minute reminders)
- **Next Prayer Countdown**: Visual countdown timer with progress indicator

### Hijri Calendar
- **Full Hijri Calendar**: Monthly calendar view with Hijri and Gregorian dates
- **Moon Phases**: Visual moon phase indicators for each day
- **Islamic Events**: Highlighted important dates (Ramadan, Eid, etc.)
- **Special Day Indicators**: Fasting days, holy nights, and recommended practices
- **Event Details**: Tap any event for detailed information and virtues

### App Features
- **Dark/Light Mode**: Theme toggle for comfortable viewing
- **Offline Support**: Works without internet after first load (PWA)
- **Installable**: Add to home screen for native app experience
- **URL Routing**: Deep links to specific sections (`/prayer`, `/prayer/week`, `/hijri`)
- **Mobile-First Design**: Optimized for mobile with bottom navigation

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page with next prayer countdown |
| `/prayer` | Today's prayer times |
| `/prayer/week` | Weekly prayer schedule |
| `/prayer/month` | Monthly prayer schedule |
| `/hijri` | Hijri calendar view |

## Districts Covered

| Zone | Districts |
|------|-----------|
| 01 | Colombo, Gampaha, Kalutara |
| 02 | Jaffna, Nallur |
| 03 | Mullaitivu, Kilinochchi, Vavuniya |
| 04 | Mannar, Puttalam |
| 05 | Anuradhapura, Polonnaruwa |
| 06 | Kurunegala |
| 07 | Kandy, Matale, Nuwara Eliya |
| 08 | Batticaloa, Ampara |
| 09 | Trincomalee |
| 10 | Badulla, Monaragala |
| 11 | Ratnapura, Kegalle |
| 12 | Galle, Matara |
| 13 | Hambantota |

## Tech Stack

- **React 19** with TypeScript
- **React Router** for client-side routing
- **Vite** for fast development and builds
- **Tailwind CSS v4** with shadcn/ui components
- **PWA** with Workbox service worker for offline support
- **Local Storage** for persisting user preferences

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## PWA Features & Limitations

### What Works
- Installable on home screen (Android, iOS, Desktop)
- Offline access to all prayer times and calendar data
- Standalone mode (no browser UI)
- Theme and district preferences persist

### Current Limitations

**Notifications require the app to be open.**

The current notification system uses browser `setTimeout` which only works while the app is running. When you close the app:
- Scheduled notifications are lost
- No alerts will fire

**Why?** True background notifications require:
- A backend server with Web Push (FCM/VAPID)
- Or wrapping in a native app container (Capacitor)

**Workaround**: Keep the app open in a background tab for notifications to work.

### Future Improvements
- Web Push notifications with backend service
- Better iOS PWA support detection
- Periodic sync for background updates

## Islamic Months

| # | Arabic Name | Transliteration |
|---|-------------|-----------------|
| 1 | محرم | Muharram |
| 2 | صفر | Safar |
| 3 | ربيع الأول | Rabi al-Awwal |
| 4 | ربيع الثاني | Rabi al-Thani |
| 5 | جمادى الأولى | Jumada al-Awwal |
| 6 | جمادى الآخرة | Jumada al-Akhirah |
| 7 | رجب | Rajab |
| 8 | شعبان | Shaban |
| 9 | رمضان | Ramadan |
| 10 | شوال | Shawwal |
| 11 | ذو القعدة | Dhul Qadah |
| 12 | ذو الحجة | Dhul Hijjah |

## Important Islamic Events

| Event | Date (Hijri) | Significance |
|-------|--------------|--------------|
| Islamic New Year | 1 Muharram | Beginning of new Hijri year |
| Ashura | 10 Muharram | Day of fasting |
| Mawlid al-Nabi | 12 Rabi al-Awwal | Prophet Muhammad's (PBUH) birthday |
| Isra and Mi'raj | 27 Rajab | Night journey of Prophet Muhammad (PBUH) |
| Shab e Barat | 15 Shaban | Night of forgiveness |
| Ramadan Begins | 1 Ramadan | Start of fasting month |
| Laylat al-Qadr | 27 Ramadan | Night of Power |
| Eid al-Fitr | 1 Shawwal | Festival marking end of Ramadan |
| Day of Arafah | 9 Dhul Hijjah | Day before Eid al-Adha |
| Eid al-Adha | 10 Dhul Hijjah | Festival of Sacrifice |

## Data Sources

- [ACJU (All Ceylon Jamiyyathul Ulama)](https://www.acju.lk/prayer-times/) - Prayer times data
- [ACJU Calendars](https://www.acju.lk/calenders-en/) - Official moon sighting announcements
- [SLHub Hilaal Calendar](https://www.slhub.com/downloads/hilaal-calendar) - Monthly Hijri calendars

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── LandingPage.tsx # Home page with countdown
│   ├── DailyView.tsx   # Today's prayer times
│   ├── WeekView.tsx    # Weekly schedule
│   ├── MonthView.tsx   # Monthly schedule
│   └── HijriCalendarView.tsx
├── hooks/              # Custom React hooks
│   ├── useAlarms.ts    # Notification scheduling
│   ├── usePrayerTimes.ts
│   ├── useHijriCalendar.ts
│   └── useIslamicEvents.ts
├── data/               # Static JSON data
│   ├── prayerTimes.json
│   ├── hijriCalendar.json
│   └── islamicEvents.json
└── lib/                # Utilities
```

## License

MIT

## Acknowledgments

- [ACJU](https://www.acju.lk/) for prayer times and Islamic calendar data
- [shadcn/ui](https://ui.shadcn.com/) for UI components
- [Lucide](https://lucide.dev/) for icons
