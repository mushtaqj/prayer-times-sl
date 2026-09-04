import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { MaterialSymbol } from '@/components/icons/MaterialSymbol'
import { SettingsDrawer } from './SettingsDrawer'

export function MobileNav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  const isPrayerSection = location.pathname.startsWith('/prayer')
  const isHijriSection = location.pathname === '/hijri'
  const isHomePage = location.pathname === '/'

  // The landing page has its own header with the settings menu.
  if (isHomePage) {
    return null
  }

  return (
    <div className="sm:hidden">
      {/* Mobile Header with Hamburger */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border shadow-sm pt-[env(safe-area-inset-top)]">
        <div className="flex items-center justify-between px-3 py-2">
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img
              src="/icon-192x192.png"
              alt="Prayer Times"
              className="w-8 h-8 rounded-xl shadow-sm"
            />
            <span className="text-sm font-bold text-foreground">Prayer Times</span>
          </Link>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? (
              <X className="w-5 h-5 text-foreground" />
            ) : (
              <Menu className="w-5 h-5 text-foreground" />
            )}
          </button>
        </div>
      </header>

      <SettingsDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border shadow-lg pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-stretch h-14">
          <Link
            to="/prayer"
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors relative ${
              isPrayerSection
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {isPrayerSection && (
              <div className="absolute top-0 left-4 right-4 h-0.5 bg-primary rounded-full" />
            )}
            <MaterialSymbol name="prayer_times" className="w-6 h-6" />
            <span className="text-xs font-medium">Prayer</span>
          </Link>

          <Link
            to="/hijri"
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors relative ${
              isHijriSection
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {isHijriSection && (
              <div className="absolute top-0 left-4 right-4 h-0.5 bg-primary rounded-full" />
            )}
            <MaterialSymbol name="calendar_month" className="w-6 h-6" />
            <span className="text-xs font-medium">Hijri</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
