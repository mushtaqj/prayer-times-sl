import { useState } from 'react'
import { Menu, X, Clock, Calendar, MapPin, Loader2, Moon, Sun, HelpCircle } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { AppInfoModal } from './AppInfoModal'
import { useLocation } from '@/hooks/useLocation'
import type { District } from '@/hooks/usePrayerTimes'
import type { MainSection } from './Header'

interface MobileNavProps {
  districts: District[]
  selectedDistrict: string
  onDistrictChange: (value: string) => void
  isDark: boolean
  onThemeToggle: () => void
  mainSection: MainSection
  onSectionChange: (section: MainSection) => void
}

export function MobileNav({
  districts,
  selectedDistrict,
  onDistrictChange,
  isDark,
  onThemeToggle,
  mainSection,
  onSectionChange,
}: MobileNavProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const { detectLocation, isDetecting } = useLocation()

  const handleDetectLocation = async () => {
    const district = await detectLocation()
    if (district) {
      onDistrictChange(district)
      setMenuOpen(false)
    }
  }

  // Don't render anything on home page
  if (mainSection === 'home') {
    return null
  }

  return (
    <div className="sm:hidden">
      {/* Mobile Header with Hamburger */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border shadow-sm">
        <div className="flex items-center justify-between px-3 py-2">
          {/* Logo - tap to go home */}
          <button
            onClick={() => onSectionChange('home')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img
              src="/icon-192x192.png"
              alt="Prayer Times"
              className="w-8 h-8 rounded-xl shadow-sm"
            />
            <span className="text-sm font-bold text-foreground">Prayer Times</span>
          </button>

          {/* Hamburger Button */}
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

      {/* Slide-out Menu Drawer */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-background border-l border-border shadow-xl animate-in slide-in-from-right duration-300">
            {/* Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold">Settings</h2>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Content */}
            <div className="p-4 space-y-6">
              {/* Location Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Location</h3>

                <Button
                  variant="outline"
                  onClick={handleDetectLocation}
                  disabled={isDetecting}
                  className="w-full justify-start gap-2"
                >
                  {isDetecting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MapPin className="w-4 h-4" />
                  )}
                  Detect My Location
                </Button>

                <Select value={selectedDistrict} onValueChange={(value) => {
                  onDistrictChange(value)
                  setMenuOpen(false)
                }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select District" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map(district => (
                      <SelectItem key={district.id} value={district.id}>
                        {district.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Appearance Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Appearance</h3>

                <Button
                  variant="outline"
                  onClick={() => {
                    onThemeToggle()
                  }}
                  className="w-full justify-start gap-2"
                >
                  {isDark ? (
                    <>
                      <Sun className="w-4 h-4" />
                      Switch to Light Mode
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4" />
                      Switch to Dark Mode
                    </>
                  )}
                </Button>
              </div>

              {/* Help Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">About</h3>

                <Button
                  variant="outline"
                  onClick={() => {
                    setShowInfo(true)
                    setMenuOpen(false)
                  }}
                  className="w-full justify-start gap-2"
                >
                  <HelpCircle className="w-4 h-4" />
                  App Info & Sources
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border shadow-lg">
        <div className="flex items-stretch h-14">
          {/* Prayer Tab */}
          <button
            onClick={() => onSectionChange('prayer')}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors relative ${
              mainSection === 'prayer'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {mainSection === 'prayer' && (
              <div className="absolute top-0 left-4 right-4 h-0.5 bg-primary rounded-full" />
            )}
            <Clock className="w-5 h-5" />
            <span className="text-xs font-medium">Prayer</span>
          </button>

          {/* Hijri Tab */}
          <button
            onClick={() => onSectionChange('hijri')}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors relative ${
              mainSection === 'hijri'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {mainSection === 'hijri' && (
              <div className="absolute top-0 left-4 right-4 h-0.5 bg-primary rounded-full" />
            )}
            <Calendar className="w-5 h-5" />
            <span className="text-xs font-medium">Hijri</span>
          </button>
        </div>
        {/* Safe area padding for notched phones */}
        <div className="h-safe-area-inset-bottom bg-background" />
      </nav>

      {/* App Info Modal */}
      <AppInfoModal isOpen={showInfo} onClose={() => setShowInfo(false)} />
    </div>
  )
}
