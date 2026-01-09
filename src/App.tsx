import { useState, useEffect } from 'react'
import { Header } from '@/components/Header'
import { DailyView } from '@/components/DailyView'
import { WeekView } from '@/components/WeekView'
import { MonthView } from '@/components/MonthView'
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
  const [view, setView] = useState<ViewType>('today')
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
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto">
        <Header
          districts={districts}
          selectedDistrict={selectedDistrict}
          onDistrictChange={setSelectedDistrict}
          isDark={isDark}
          onThemeToggle={toggleTheme}
        />

        {/* Sticky View Switcher */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm px-4 py-3 border-b border-border">
          <ViewSwitcher value={view} onChange={setView} />
        </div>

        <main className="px-4 pb-8 space-y-4 pt-4">
          {/* Notification Banner */}
          {!hasPermission && (
            <Card className="bg-secondary border-none">
              <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">Enable notifications for prayer alerts</span>
                </div>
                <Button size="sm" onClick={handleEnableNotifications}>
                  Enable
                </Button>
              </CardContent>
            </Card>
          )}

          {/* PWA Install Banner */}
          {showInstallBanner && (
            <Card className="bg-secondary border-none">
              <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">Install app for offline access</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setShowInstallBanner(false)}>
                    Later
                  </Button>
                  <Button size="sm" onClick={handleInstall}>
                    Install
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Conditional View Rendering */}
          {view === 'today' && (
            <DailyView
              prayers={todayPrayers}
              nextPrayer={nextPrayer}
              alarms={alarms}
              onToggleAlarm={toggleAlarm}
              location={locationName}
            />
          )}

          {view === 'week' && (
            <WeekView prayers={weekPrayers} location={locationName} />
          )}

          {view === 'month' && (
            <MonthView getMonthPrayers={getMonthPrayers} location={locationName} />
          )}

          {/* Footer */}
          <footer className="text-center text-sm text-muted-foreground py-4">
            <p>Prayer times for Colombo, Gampaha & Kalutara Districts</p>
            <p className="mt-1">Zone 01 - Sri Lanka</p>
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
