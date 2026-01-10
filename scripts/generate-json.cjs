const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'data', 'prayer-times.db');
const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'data');

if (!fs.existsSync(DB_PATH)) {
  console.error('Database not found! Run db-setup.js first.');
  process.exit(1);
}

const db = new Database(DB_PATH, { readonly: true });

console.log('Generating JSON files from SQLite database...\n');

// Generate hijriCalendar.json
console.log('Generating hijriCalendar.json...');
const hijriMonthsMaster = db.prepare(`
  SELECT id, name, name_arabic, meaning FROM hijri_months_master ORDER BY id
`).all();

const hijriCalendar = db.prepare(`
  SELECT
    hc.hijri_year,
    hc.hijri_month_id,
    hm.name as month_name,
    hc.gregorian_start,
    hc.gregorian_end,
    hc.days,
    hc.status
  FROM hijri_calendar hc
  JOIN hijri_months_master hm ON hc.hijri_month_id = hm.id
  ORDER BY hc.gregorian_start
`).all();

const hijriCalendarJson = {
  metadata: {
    source: 'ACJU Sri Lanka (All Ceylon Jamiyyathul Ulama)',
    description: 'Historical Hijri calendar data based on official moon sighting in Sri Lanka',
    lastUpdated: new Date().toISOString().split('T')[0],
    generatedFrom: 'SQLite database'
  },
  hijriMonths: hijriMonthsMaster.map(m => ({
    number: m.id,
    name: m.name,
    nameArabic: m.name_arabic,
    meaning: m.meaning
  })),
  months: hijriCalendar.map(entry => ({
    hijriYear: entry.hijri_year,
    hijriMonth: entry.hijri_month_id,
    monthName: entry.month_name,
    gregorianStart: entry.gregorian_start,
    gregorianEnd: entry.gregorian_end,
    days: entry.days,
    status: entry.status
  }))
};

fs.writeFileSync(
  path.join(OUTPUT_DIR, 'hijriCalendar.json'),
  JSON.stringify(hijriCalendarJson, null, 2)
);
console.log(`  - Generated ${hijriCalendar.length} calendar entries\n`);

// Generate prayerTimes.json
console.log('Generating prayerTimes.json...');
const districts = db.prepare(`
  SELECT id, name, zone_id FROM districts ORDER BY zone_id, name
`).all();

const prayerTimes = db.prepare(`
  SELECT zone_id, month, day, fajr, sunrise, dhuhr, asr, maghrib, isha
  FROM prayer_times
  ORDER BY zone_id, month, day
`).all();

// Group prayer times by zone and month
const zones = {};
for (const pt of prayerTimes) {
  if (!zones[pt.zone_id]) zones[pt.zone_id] = {};
  if (!zones[pt.zone_id][pt.month]) zones[pt.zone_id][pt.month] = [];
  zones[pt.zone_id][pt.month].push({
    day: pt.day,
    fajr: pt.fajr,
    sunrise: pt.sunrise,
    dhuhr: pt.dhuhr,
    asr: pt.asr,
    maghrib: pt.maghrib,
    isha: pt.isha
  });
}

const prayerTimesJson = {
  districts: districts.map(d => ({ id: d.id, name: d.name, zone: d.zone_id })),
  zones
};

fs.writeFileSync(
  path.join(OUTPUT_DIR, 'prayerTimes.json'),
  JSON.stringify(prayerTimesJson)
);
console.log(`  - Generated ${districts.length} districts, ${prayerTimes.length} prayer times\n`);

// Generate islamicEvents.json
console.log('Generating islamicEvents.json...');
const events = db.prepare(`
  SELECT id, name, name_arabic, hijri_month_id, hijri_day, type, is_fasting_day, fasting_type, fasting_forbidden, description
  FROM islamic_events
  ORDER BY hijri_month_id, hijri_day
`).all();

const weeklyFasts = db.prepare(`
  SELECT id, name, name_arabic, day_of_week, type, description FROM recurring_fasts_weekly
`).all();

const monthlyFasts = db.prepare(`
  SELECT id, name, name_arabic, days, type, description FROM recurring_fasts_monthly
`).all();

const annualFasts = db.prepare(`
  SELECT id, name, name_arabic, hijri_month_id, start_day, end_day, duration, type, description
  FROM recurring_fasts_annual
`).all();

const islamicEventsJson = {
  metadata: {
    description: 'Important Islamic dates and events',
    source: 'Traditional Islamic calendar',
    lastUpdated: new Date().toISOString().split('T')[0]
  },
  events: events.map(e => ({
    id: e.id,
    name: e.name,
    nameArabic: e.name_arabic,
    hijriMonth: e.hijri_month_id,
    hijriDay: e.hijri_day,
    type: e.type,
    isFastingDay: e.is_fasting_day === 1,
    ...(e.fasting_type && { fastingType: e.fasting_type }),
    ...(e.fasting_forbidden === 1 && { fastingForbidden: true }),
    description: e.description
  })),
  recurringFasts: {
    weekly: weeklyFasts.map(f => ({
      id: f.id,
      name: f.name,
      nameArabic: f.name_arabic,
      dayOfWeek: f.day_of_week,
      type: f.type,
      description: f.description
    })),
    monthly: {
      ayyamAlBeed: monthlyFasts.length > 0 ? {
        name: monthlyFasts[0].name,
        nameArabic: monthlyFasts[0].name_arabic,
        days: JSON.parse(monthlyFasts[0].days),
        type: monthlyFasts[0].type,
        description: monthlyFasts[0].description
      } : null
    },
    annual: annualFasts.map(f => ({
      id: f.id,
      name: f.name,
      nameArabic: f.name_arabic,
      hijriMonth: f.hijri_month_id,
      startDay: f.start_day,
      ...(f.end_day && { endDay: f.end_day }),
      ...(f.duration && { duration: f.duration }),
      type: f.type,
      description: f.description
    }))
  },
  hijriMonths: hijriMonthsMaster.map(m => ({
    number: m.id,
    name: m.name,
    nameArabic: m.name_arabic,
    meaning: m.meaning
  }))
};

fs.writeFileSync(
  path.join(OUTPUT_DIR, 'islamicEvents.json'),
  JSON.stringify(islamicEventsJson, null, 2)
);
console.log(`  - Generated ${events.length} events\n`);

db.close();

console.log('='.repeat(50));
console.log('JSON generation complete!');
console.log('='.repeat(50));
