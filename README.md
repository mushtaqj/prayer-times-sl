# Prayer Times Sri Lanka

A modern, mobile-first Progressive Web App (PWA) for Islamic prayer times across all districts in Sri Lanka.

## Features

- **All 26 Districts**: Complete coverage of Sri Lanka across 13 prayer time zones
- **Daily, Weekly & Monthly Views**: Multiple ways to view prayer schedules
- **Auto Location Detection**: Automatically detects your nearest district using GPS
- **Prayer Alarms**: Set notifications for any prayer time
- **Dark/Light Mode**: Theme toggle for comfortable viewing
- **Offline Support**: Works without internet after first load (PWA)
- **Mobile-First Design**: Optimized for mobile devices

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
- **Vite** for fast development and builds
- **Tailwind CSS** with shadcn/ui components
- **PWA** with service worker for offline support
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

## Data Source

Prayer times data sourced from [ACJU (All Ceylon Jamiyyathul Ulama)](https://www.acju.lk/prayer-times/).

---

# Hijri Calendar App (Planned)

A companion app for the Islamic Hijri calendar with moon sighting data for Sri Lanka.

## Planned Features

- **Hijri-Gregorian Date Conversion**: Convert between Islamic and Gregorian calendars
- **Monthly Calendar View**: Visual calendar showing both Hijri and Gregorian dates
- **Important Islamic Dates**: Highlighted events and holidays
- **Moon Sighting Updates**: Integration with ACJU Hilaal Committee announcements
- **Offline Support**: PWA for offline access

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
| Ashura | 10 Muharram | Day of fasting, commemorating various events |
| Mawlid al-Nabi | 12 Rabi al-Awwal | Prophet Muhammad's (PBUH) birthday |
| Isra and Mi'raj | 27 Rajab | Night journey of Prophet Muhammad (PBUH) |
| Shab e Barat | 15 Shaban | Night of forgiveness |
| Ramadan Begins | 1 Ramadan | Start of fasting month |
| Laylat al-Qadr | 27 Ramadan | Night of Power |
| Eid al-Fitr | 1 Shawwal | Festival marking end of Ramadan |
| Day of Arafah | 9 Dhul Hijjah | Day before Eid al-Adha, day of Hajj |
| Eid al-Adha | 10 Dhul Hijjah | Festival of Sacrifice |

## Data Sources

- [ACJU Calendars](https://www.acju.lk/calenders-en/) - Official moon sighting announcements
- [SLHub Hilaal Calendar](https://www.slhub.com/downloads/hilaal-calendar) - Monthly Hijri calendars
- [IslamicFinder](https://www.islamicfinder.org/islamic-calendar/) - Islamic calendar reference

## Implementation Notes

The Hijri calendar is a lunar calendar with 354-355 days per year. Each month begins with the sighting of the new crescent moon. In Sri Lanka, the ACJU Hilaal Committee is responsible for official moon sighting announcements.

Key considerations:
- Months can be 29 or 30 days based on moon sighting
- Dates may vary by 1-2 days from calculated dates
- Official dates for Ramadan, Eid, etc. depend on local moon sighting announcements

---

## License

MIT

## Acknowledgments

- [ACJU](https://www.acju.lk/) for prayer times and Islamic calendar data
- [shadcn/ui](https://ui.shadcn.com/) for UI components
