import { lazy, Suspense, useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Header } from '@/components/Header'
import { MobileNav } from '@/components/MobileNav'
import { ActionBanner } from '@/components/ActionBanner'
import { LoadingSpinner } from '@/components/common'
import { PrayerLayout } from '@/components/layouts'
import { useLocationContext, useThemeContext } from '@/contexts'
import { useAlarms } from '@/hooks/useAlarms'
import { usePrayerTimes } from '@/hooks/usePrayerTimes'
import { COUNTRY_NAME } from '@/lib/constants/appConstants'
import { Download } from 'lucide-react'

// Lazy load route components for code splitting
const LandingPage = lazy(() => import('@/components/LandingPage').then(m => ({ default: m.LandingPage })))
const DailyViewRoute = lazy(() => import('@/components/DailyViewRoute').then(m => ({ default: m.DailyViewRoute })))
const WeekViewRoute = lazy(() => import('@/components/WeekViewRoute').then(m => ({ default: m.WeekViewRoute })))
const MonthViewRoute = lazy(() => import('@/components/MonthViewRoute').then(m => ({ default: m.MonthViewRoute })))
const HijriCalendarView = lazy(() => import('@/components/HijriCalendarView').then(m => ({ default: m.HijriCalendarView })))
const AdminPage = lazy(() => import('@/components/AdminPage').then(m => ({ default: m.AdminPage })))

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

  // Context data for prayer layout child routes
  const prayerLayoutContext = {
    todayPrayers,
    weekPrayers,
    getMonthPrayers,
    currentPrayer,
    nextPrayer,
    alarms,
    onToggleAlarm: toggleAlarm,
    location: locationName,
  }

  // Render admin page completely standalone (no header, no nav)
  if (isAdminPage) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <AdminPage />
      </Suspense>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="max-w-md md:max-w-4xl mx-auto min-h-screen flex flex-col shadow-2xl shadow-black/5 bg-card/30 border-x border-border/50">
        {/* Hide header on home page */}
        {!isHomePage && <Header />}

        {/* Mobile Navigation - bottom tabs + hamburger menu */}
        <MobileNav />

        <main className="flex-1 flex flex-col relative">
          <Suspense fallback={<LoadingSpinner />}>
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

              {/* Prayer Times Section - Nested Routes */}
              <Route
                path="/prayer"
                element={
                  <PrayerLayout
                    hasPermission={hasPermission}
                    onEnableNotifications={handleEnableNotifications}
                    context={prayerLayoutContext}
                  />
                }
              >
                <Route index element={<DailyViewRoute />} />
                <Route path="week" element={<WeekViewRoute />} />
                <Route path="month" element={<MonthViewRoute />} />
              </Route>

              {/* Hijri Calendar Section */}
              <Route
                path="/hijri"
                element={
                  <div className="p-4 mt-[calc(48px+env(safe-area-inset-top))] sm:mt-0 pb-20 sm:pb-4 flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <HijriCalendarView location={locationName} />
                  </div>
                }
              />

              {/* Redirect any unknown routes to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>

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
