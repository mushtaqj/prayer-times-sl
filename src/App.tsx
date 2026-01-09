import { useState, useEffect } from 'react'
import { Header } from '@/components/Header'
import { TodayCard } from '@/components/TodayCard'
import { WeekView } from '@/components/WeekView'
import { MonthView } from '@/components/MonthView'
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
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)

  const { isDark, toggleTheme } = useTheme()
  const { alarms, toggleAlarm, requestNotificationPermission, hasPermission, scheduleNotification } = useAlarms()
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
      const prayers = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as const
      prayers.forEach(prayer => {
        if (alarms[prayer]) {
          scheduleNotification(prayer, todayPrayers[prayer])
        }
      })
    }
  }, [hasPermission, todayPrayers, alarms, scheduleNotification])

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto">
        <Header
          districts={districts}
          selectedDistrict={selectedDistrict}
          onDistrictChange={setSelectedDistrict}
          isDark={isDark}
          onThemeToggle={toggleTheme}
        />

        <main className="px-4 md:px-6 pb-8 space-y-6 pt-6">
          {/* Notification Banner */}
          {!hasPermission && (
            <Card className="bg-secondary">
              <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5" />
                  <span className="text-sm font-medium">Enable notifications to get prayer time alerts</span>
                </div>
                <Button size="sm" onClick={handleEnableNotifications}>
                  Enable Notifications
                </Button>
              </CardContent>
            </Card>
          )}

          {/* PWA Install Banner */}
          {showInstallBanner && (
            <Card className="bg-accent">
              <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5" />
                  <span className="text-sm font-medium">Install this app for the best experience</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setShowInstallBanner(false)}>
                    Later
                  </Button>
                  <Button size="sm" onClick={handleInstall}>
                    Install App
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Today's Prayer Times */}
          <TodayCard
            prayers={todayPrayers}
            nextPrayer={nextPrayer}
            alarms={alarms}
            onToggleAlarm={toggleAlarm}
          />

          {/* Weekly View */}
          <WeekView prayers={weekPrayers} />

          {/* Monthly View */}
          <MonthView getMonthPrayers={getMonthPrayers} />

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
