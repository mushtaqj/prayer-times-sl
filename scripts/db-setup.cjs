const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'data', 'prayer-times.db');
const DATA_DIR = path.join(__dirname, '..', 'src', 'data');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, '..', 'data'))) {
  fs.mkdirSync(path.join(__dirname, '..', 'data'), { recursive: true });
}

const db = new Database(DB_PATH);

// Enable foreign keys
db.pragma('foreign_keys = ON');

console.log('Setting up database schema...\n');

// Create tables
db.exec(`
  -- Master table for the 12 Hijri months (index/reference)
  CREATE TABLE IF NOT EXISTS hijri_months_master (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    name_arabic TEXT NOT NULL,
    meaning TEXT
  );

  -- Hijri calendar entries (references master months)
  -- Note: gregorianEnd is calculated from gregorianStart + days - 1
  CREATE TABLE IF NOT EXISTS hijri_calendar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hijri_year INTEGER NOT NULL,
    hijri_month_id INTEGER NOT NULL,
    gregorian_start DATE NOT NULL,
    days INTEGER,
    status TEXT DEFAULT 'completed' CHECK(status IN ('completed', 'ongoing', 'upcoming')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hijri_month_id) REFERENCES hijri_months_master(id),
    UNIQUE(hijri_year, hijri_month_id)
  );

  -- Districts
  CREATE TABLE IF NOT EXISTS districts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    zone_id TEXT NOT NULL
  );

  -- Prayer times by zone, month, day
  CREATE TABLE IF NOT EXISTS prayer_times (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    zone_id TEXT NOT NULL,
    month INTEGER NOT NULL CHECK(month >= 1 AND month <= 12),
    day INTEGER NOT NULL CHECK(day >= 1 AND day <= 31),
    fajr TEXT NOT NULL,
    sunrise TEXT NOT NULL,
    dhuhr TEXT NOT NULL,
    asr TEXT NOT NULL,
    maghrib TEXT NOT NULL,
    isha TEXT NOT NULL,
    UNIQUE(zone_id, month, day)
  );

  -- Islamic events
  CREATE TABLE IF NOT EXISTS islamic_events (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_arabic TEXT NOT NULL,
    hijri_month_id INTEGER NOT NULL,
    hijri_day INTEGER NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('holy', 'eid', 'fast', 'recommended', 'sunnah')),
    is_fasting_day INTEGER DEFAULT 0,
    fasting_type TEXT CHECK(fasting_type IN ('obligatory', 'recommended', 'sunnah')),
    fasting_forbidden INTEGER DEFAULT 0,
    description TEXT,
    FOREIGN KEY (hijri_month_id) REFERENCES hijri_months_master(id)
  );

  -- Recurring fasts (weekly)
  CREATE TABLE IF NOT EXISTS recurring_fasts_weekly (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_arabic TEXT NOT NULL,
    day_of_week INTEGER NOT NULL CHECK(day_of_week >= 0 AND day_of_week <= 6),
    type TEXT NOT NULL,
    description TEXT
  );

  -- Recurring fasts (monthly)
  CREATE TABLE IF NOT EXISTS recurring_fasts_monthly (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_arabic TEXT NOT NULL,
    days TEXT NOT NULL, -- JSON array of days
    type TEXT NOT NULL,
    description TEXT
  );

  -- Recurring fasts (annual)
  CREATE TABLE IF NOT EXISTS recurring_fasts_annual (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_arabic TEXT NOT NULL,
    hijri_month_id INTEGER NOT NULL,
    start_day INTEGER NOT NULL,
    end_day INTEGER,
    duration INTEGER,
    type TEXT NOT NULL,
    description TEXT,
    FOREIGN KEY (hijri_month_id) REFERENCES hijri_months_master(id)
  );

  -- Create indexes for performance
  CREATE INDEX IF NOT EXISTS idx_hijri_calendar_year_month ON hijri_calendar(hijri_year, hijri_month_id);
  CREATE INDEX IF NOT EXISTS idx_hijri_calendar_status ON hijri_calendar(status);
  CREATE INDEX IF NOT EXISTS idx_prayer_times_zone_month ON prayer_times(zone_id, month);
  CREATE INDEX IF NOT EXISTS idx_islamic_events_month ON islamic_events(hijri_month_id);
`);

console.log('Database schema created successfully!\n');

// Insert master months data
const hijriMonths = [
  { id: 1, name: 'Muharram', name_arabic: 'محرم', meaning: 'Forbidden' },
  { id: 2, name: 'Safar', name_arabic: 'صفر', meaning: 'Void' },
  { id: 3, name: 'Rabi al-Awwal', name_arabic: 'ربيع الأول', meaning: 'First Spring' },
  { id: 4, name: 'Rabi al-Thani', name_arabic: 'ربيع الثاني', meaning: 'Second Spring' },
  { id: 5, name: 'Jumada al-Awwal', name_arabic: 'جمادى الأولى', meaning: 'First of Parched Land' },
  { id: 6, name: 'Jumada al-Akhirah', name_arabic: 'جمادى الآخرة', meaning: 'Last of Parched Land' },
  { id: 7, name: 'Rajab', name_arabic: 'رجب', meaning: 'Respect' },
  { id: 8, name: 'Shaban', name_arabic: 'شعبان', meaning: 'Scattered' },
  { id: 9, name: 'Ramadan', name_arabic: 'رمضان', meaning: 'Burning Heat' },
  { id: 10, name: 'Shawwal', name_arabic: 'شوال', meaning: 'Raised' },
  { id: 11, name: 'Dhul Qadah', name_arabic: 'ذو القعدة', meaning: 'The One of Truce' },
  { id: 12, name: 'Dhul Hijjah', name_arabic: 'ذو الحجة', meaning: 'The One of Pilgrimage' },
];

const insertMonth = db.prepare(`
  INSERT OR REPLACE INTO hijri_months_master (id, name, name_arabic, meaning)
  VALUES (?, ?, ?, ?)
`);

for (const month of hijriMonths) {
  insertMonth.run(month.id, month.name, month.name_arabic, month.meaning);
}
console.log('Inserted 12 Hijri months into master table.\n');

// Migrate Hijri calendar data
console.log('Migrating Hijri calendar data...');
const hijriCalendarPath = path.join(DATA_DIR, 'hijriCalendar.json');
const hijriCalendarData = JSON.parse(fs.readFileSync(hijriCalendarPath, 'utf8'));

const monthNameToId = {};
hijriMonths.forEach(m => monthNameToId[m.name] = m.id);

const insertCalendar = db.prepare(`
  INSERT OR REPLACE INTO hijri_calendar (hijri_year, hijri_month_id, gregorian_start, days, status)
  VALUES (?, ?, ?, ?, ?)
`);

// Determine current date to mark ongoing month
const today = new Date();

for (const entry of hijriCalendarData.months) {
  const monthId = entry.hijriMonth || monthNameToId[entry.monthName];
  if (!monthId) {
    console.warn(`Unknown month: ${entry.monthName}`);
    continue;
  }

  // Determine status based on dates
  const startDate = new Date(entry.gregorianStart);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + (entry.days || 30) - 1);

  let status = 'completed';
  if (today >= startDate && today <= endDate) {
    status = 'ongoing';
  } else if (today < startDate) {
    status = 'upcoming';
  }

  insertCalendar.run(
    entry.hijriYear,
    monthId,
    entry.gregorianStart,
    entry.days || null,
    status
  );
}
console.log(`Migrated ${hijriCalendarData.months.length} calendar entries.\n`);

// Migrate prayer times data
console.log('Migrating prayer times data...');
const prayerTimesPath = path.join(DATA_DIR, 'prayerTimes.json');
const prayerTimesData = JSON.parse(fs.readFileSync(prayerTimesPath, 'utf8'));

// Insert districts
const insertDistrict = db.prepare(`
  INSERT OR REPLACE INTO districts (id, name, zone_id)
  VALUES (?, ?, ?)
`);

for (const district of prayerTimesData.districts) {
  insertDistrict.run(district.id, district.name, district.zone);
}
console.log(`Migrated ${prayerTimesData.districts.length} districts.\n`);

// Insert prayer times
const insertPrayerTime = db.prepare(`
  INSERT OR REPLACE INTO prayer_times (zone_id, month, day, fajr, sunrise, dhuhr, asr, maghrib, isha)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

let prayerTimeCount = 0;
const insertPrayerTimes = db.transaction(() => {
  for (const [zoneId, months] of Object.entries(prayerTimesData.zones)) {
    for (const [monthStr, days] of Object.entries(months)) {
      const month = parseInt(monthStr);
      for (const dayData of days) {
        insertPrayerTime.run(
          zoneId,
          month,
          dayData.day,
          dayData.fajr,
          dayData.sunrise,
          dayData.dhuhr,
          dayData.asr,
          dayData.maghrib,
          dayData.isha
        );
        prayerTimeCount++;
      }
    }
  }
});
insertPrayerTimes();
console.log(`Migrated ${prayerTimeCount} prayer time entries.\n`);

// Migrate Islamic events data
console.log('Migrating Islamic events data...');
const eventsPath = path.join(DATA_DIR, 'islamicEvents.json');
const eventsData = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));

const insertEvent = db.prepare(`
  INSERT OR REPLACE INTO islamic_events (id, name, name_arabic, hijri_month_id, hijri_day, type, is_fasting_day, fasting_type, fasting_forbidden, description)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const event of eventsData.events) {
  insertEvent.run(
    event.id,
    event.name,
    event.nameArabic,
    event.hijriMonth,
    event.hijriDay,
    event.type,
    event.isFastingDay ? 1 : 0,
    event.fastingType || null,
    event.fastingForbidden ? 1 : 0,
    event.description
  );
}
console.log(`Migrated ${eventsData.events.length} Islamic events.\n`);

// Migrate recurring fasts
const insertWeeklyFast = db.prepare(`
  INSERT OR REPLACE INTO recurring_fasts_weekly (id, name, name_arabic, day_of_week, type, description)
  VALUES (?, ?, ?, ?, ?, ?)
`);

for (const fast of eventsData.recurringFasts.weekly) {
  insertWeeklyFast.run(fast.id, fast.name, fast.nameArabic, fast.dayOfWeek, fast.type, fast.description);
}

const insertMonthlyFast = db.prepare(`
  INSERT OR REPLACE INTO recurring_fasts_monthly (id, name, name_arabic, days, type, description)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const ayyamAlBeed = eventsData.recurringFasts.monthly.ayyamAlBeed;
insertMonthlyFast.run(
  'ayyam-al-beed',
  ayyamAlBeed.name,
  ayyamAlBeed.nameArabic,
  JSON.stringify(ayyamAlBeed.days),
  ayyamAlBeed.type,
  ayyamAlBeed.description
);

const insertAnnualFast = db.prepare(`
  INSERT OR REPLACE INTO recurring_fasts_annual (id, name, name_arabic, hijri_month_id, start_day, end_day, duration, type, description)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const fast of eventsData.recurringFasts.annual) {
  insertAnnualFast.run(
    fast.id,
    fast.name,
    fast.nameArabic,
    fast.hijriMonth,
    fast.startDay,
    fast.endDay || null,
    fast.duration || null,
    fast.type,
    fast.description
  );
}
console.log('Migrated recurring fasts.\n');

// Close database
db.close();

console.log('='.repeat(50));
console.log('Database setup complete!');
console.log(`Database location: ${DB_PATH}`);
console.log('='.repeat(50));
