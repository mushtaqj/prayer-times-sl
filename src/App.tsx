import { useState, useEffect } from 'react'
import { Header, type MainSection } from '@/components/Header'
import { DailyView } from '@/components/DailyView'
import { WeekView } from '@/components/WeekView'
import { MonthView } from '@/components/MonthView'
import { HijriCalendarView } from '@/components/HijriCalendarView'
import { ViewSwitcher, type ViewType } from '@/components/ViewSwitcher'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useTheme } from '@/hooks/useTheme'
import { useAlarms } from '@/hooks/useAlarms'
import { usePrayerTimes } from '@/hooks/usePrayerTimes'
import { Bell, Download } from 'lucide-react'

function App() {
  const [selectedDistrict, setSelectedDistrict] = useState(() => {
    return localStorage.getItem('selectedDistrict') || 'colombo'
  })
  const [mainSection, setMainSection] = useState<MainSection>('prayer')
  const [prayerView, setPrayerView] = useState<ViewType>('today')
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)

  const { isDark, toggleTheme } = useTheme()
  const { alarms, toggleAlarm, requestNotificationPermission, hasPermission, scheduleNotifications } = useAlarms()
  const { districts, todayPrayers, weekPrayers, getMonthPrayers, nextPrayer } = usePrayerTimes(selectedDistrict)

  useEffect(() => {
    localStorage.setItem('selectedDistrict', selectedDistrict)
  }, [selectedDistrict])

  // PWA install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallBanner(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  // Schedule notifications for enabled alarms
  useEffect(() => {
    if (hasPermission && todayPrayers) {
      const cleanup = scheduleNotifications(todayPrayers)
      return cleanup
    }
  }, [hasPermission, todayPrayers, alarms, scheduleNotifications])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    const promptEvent = deferredPrompt as BeforeInstallPromptEvent
    promptEvent.prompt()

    await promptEvent.userChoice
    setDeferredPrompt(null)
    setShowInstallBanner(false)
  }

  const handleEnableNotifications = async () => {
    await requestNotificationPermission()
  }

  // Get location name from selected district
  const locationName = districts.find(d => d.id === selectedDistrict)?.name || 'Colombo'

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="max-w-md md:max-w-4xl mx-auto min-h-screen flex flex-col shadow-2xl shadow-black/5 bg-card/30 border-x border-border/50">
        <Header
          districts={districts}
          selectedDistrict={selectedDistrict}
          onDistrictChange={setSelectedDistrict}
          isDark={isDark}
          onThemeToggle={toggleTheme}
          mainSection={mainSection}
          onSectionChange={setMainSection}
        />

        <main className="flex-1 flex flex-col relative">
          {/* Prayer Times Section */}
          {mainSection === 'prayer' && (
            <>
              {/* Sticky View Switcher - Only for Prayer Times */}
              <div className="sticky top-[60px] z-30 bg-background/95 backdrop-blur-md px-4 py-3 border-b border-border/50 supports-[backdrop-filter]:bg-background/60 shadow-sm">
                <ViewSwitcher value={prayerView} onChange={setPrayerView} />
              </div>

              <div className="p-4 space-y-6 flex-1">
                {/* Notification Banner */}
                {!hasPermission && (
                  <Card className="bg-secondary/50 border-accent/20 backdrop-blur-sm">
                    <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary/10">
                          <Bell className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-sm font-medium">Enable notifications for prayer alerts</span>
                      </div>
                      <Button size="sm" onClick={handleEnableNotifications} className="bg-primary text-primary-foreground hover:bg-primary/90">
                        Enable
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* PWA Install Banner */}
                {showInstallBanner && (
                  <Card className="bg-secondary/50 border-accent/20 backdrop-blur-sm">
                    <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary/10">
                          <Download className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-sm font-medium">Install app for offline access</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setShowInstallBanner(false)}>
                          Later
                        </Button>
                        <Button size="sm" onClick={handleInstall} className="bg-primary text-primary-foreground hover:bg-primary/90">
                          Install
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Prayer Views */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {prayerView === 'today' && (
                    <DailyView
                      prayers={todayPrayers}
                      nextPrayer={nextPrayer}
                      alarms={alarms}
                      onToggleAlarm={toggleAlarm}
                      location={locationName}
                    />
                  )}

                  {prayerView === 'week' && (
                    <WeekView prayers={weekPrayers} location={locationName} />
                  )}

                  {prayerView === 'month' && (
                    <MonthView getMonthPrayers={getMonthPrayers} location={locationName} />
                  )}
                </div>
              </div>
            </>
          )}

          {/* Hijri Calendar Section */}
          {mainSection === 'hijri' && (
            <div className="p-4 flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <HijriCalendarView location={locationName} />
            </div>
          )}

          {/* Footer */}
          <footer className="text-center text-sm text-muted-foreground py-6 border-t border-border/50 bg-card/30">
            <p>Prayer times for {locationName} District</p>
            <p className="mt-1 font-heading text-primary/80">Sri Lanka</p>
          </footer>
        </main>
      </div>
    </div>
  )
}

// Type for PWA install prompt
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default App
