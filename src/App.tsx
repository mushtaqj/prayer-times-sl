import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Header } from '@/components/Header'
import { MobileNav } from '@/components/MobileNav'
import { LandingPage } from '@/components/LandingPage'
import { DailyView } from '@/components/DailyView'
import { WeekView } from '@/components/WeekView'
import { MonthView } from '@/components/MonthView'
import { HijriCalendarView } from '@/components/HijriCalendarView'
import { AdminPage } from '@/components/AdminPage'
import { ViewSwitcher } from '@/components/ViewSwitcher'
import { ActionBanner } from '@/components/ActionBanner'
import { useLocationContext, useThemeContext } from '@/contexts'
import { useAlarms } from '@/hooks/useAlarms'
import { usePrayerTimes } from '@/hooks/usePrayerTimes'
import { COUNTRY_NAME } from '@/lib/constants/appConstants'
import { Bell, Download } from 'lucide-react'

function App() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)

  const location = useLocation()
  const { selectedDistrict, locationName } = useLocationContext()
  const { isDark, toggleTheme } = useThemeContext()
  const { alarms, toggleAlarm, requestNotificationPermission, hasPermission, scheduleNotifications } = useAlarms()
  const { todayPrayers, weekPrayers, getMonthPrayers, currentPrayer, nextPrayer } = usePrayerTimes(selectedDistrict)

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
      return scheduleNotifications(todayPrayers)
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

  // Determine if we're on the home page or admin page
  const isHomePage = location.pathname === '/'
  const isAdminPage = location.pathname === '/admin'

  // Notification banner component (for prayer pages)
  const notificationBanner = !hasPermission && (
    <ActionBanner
      icon={Bell}
      message="Enable notifications for prayer alerts"
      actionLabel="Enable"
      onAction={handleEnableNotifications}
    />
  )

  // Install banner component (for landing page)
  const installBanner = showInstallBanner && (
    <ActionBanner
      icon={Download}
      message="Install app for offline access"
      actionLabel="Install"
      onAction={handleInstall}
      secondaryLabel="Later"
      onSecondary={() => setShowInstallBanner(false)}
    />
  )

  // Render admin page completely standalone (no header, no nav)
  if (isAdminPage) {
    return <AdminPage />
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="max-w-md md:max-w-4xl mx-auto min-h-screen flex flex-col shadow-2xl shadow-black/5 bg-card/30 border-x border-border/50">
        {/* Hide header on home page */}
        {!isHomePage && <Header />}

        {/* Mobile Navigation - bottom tabs + hamburger menu */}
        <MobileNav />

        <main className="flex-1 flex flex-col relative">
          <Routes>
            {/* Home / Landing Page */}
            <Route
              path="/"
              element={
                <div className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <LandingPage
                    currentPrayer={currentPrayer}
                    nextPrayer={nextPrayer}
                    location={locationName}
                    isDark={isDark}
                    onThemeToggle={toggleTheme}
                    installBanner={installBanner}
                  />
                </div>
              }
            />

            {/* Prayer Times Section */}
            <Route
              path="/prayer"
              element={
                <>
                  {/* Sticky View Switcher */}
                  <div className="sticky top-[calc(48px+env(safe-area-inset-top))] sm:top-[60px] z-30 mt-[calc(48px+env(safe-area-inset-top))] sm:mt-0 bg-background/95 backdrop-blur-md px-4 py-3 border-b border-border/50 supports-[backdrop-filter]:bg-background/60 shadow-sm">
                    <ViewSwitcher />
                  </div>

                  <div className="p-4 pb-20 sm:pb-4 space-y-6 flex-1">
                    {notificationBanner}

                    {/* Daily Prayer View */}
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <DailyView
                        prayers={todayPrayers}
                        nextPrayer={nextPrayer}
                        currentPrayer={currentPrayer}
                        alarms={alarms}
                        onToggleAlarm={toggleAlarm}
                        location={locationName}
                      />
                    </div>
                  </div>
                </>
              }
            />

            {/* Prayer Week View */}
            <Route
              path="/prayer/week"
              element={
                <>
                  <div className="sticky top-[calc(48px+env(safe-area-inset-top))] sm:top-[60px] z-30 mt-[calc(48px+env(safe-area-inset-top))] sm:mt-0 bg-background/95 backdrop-blur-md px-4 py-3 border-b border-border/50 supports-[backdrop-filter]:bg-background/60 shadow-sm">
                    <ViewSwitcher />
                  </div>

                  <div className="p-4 pb-20 sm:pb-4 space-y-6 flex-1">
                    {notificationBanner}

                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <WeekView prayers={weekPrayers} location={locationName} />
                    </div>
                  </div>
                </>
              }
            />

            {/* Prayer Month View */}
            <Route
              path="/prayer/month"
              element={
                <>
                  <div className="sticky top-[calc(48px+env(safe-area-inset-top))] sm:top-[60px] z-30 mt-[calc(48px+env(safe-area-inset-top))] sm:mt-0 bg-background/95 backdrop-blur-md px-4 py-3 border-b border-border/50 supports-[backdrop-filter]:bg-background/60 shadow-sm">
                    <ViewSwitcher />
                  </div>

                  <div className="p-4 pb-20 sm:pb-4 space-y-6 flex-1">
                    {notificationBanner}

                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <MonthView getMonthPrayers={getMonthPrayers} location={locationName} />
                    </div>
                  </div>
                </>
              }
            />

            {/* Hijri Calendar Section */}
            <Route
              path="/hijri"
              element={
                <div className="p-4 mt-[calc(48px+env(safe-area-inset-top))] sm:mt-0 pb-20 sm:pb-4 flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <HijriCalendarView location={locationName} />
                </div>
              }
            />

            {/* Admin Page - hidden route */}
            <Route path="/admin" element={<AdminPage />} />

            {/* Redirect any unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Footer - hidden on mobile */}
          {!isHomePage && (
            <footer className="hidden sm:block text-center text-xs text-muted-foreground py-4 border-t border-border/50 bg-card/30">
              <p>Data provided by ACJU • {locationName} District, {COUNTRY_NAME}</p>
            </footer>
          )}
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
