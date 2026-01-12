import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { MapPin, Loader2, Clock, Calendar, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AppInfoModal } from './AppInfoModal'
import { ThemeToggleButton, DistrictSelector } from '@/components/common'
import { useLocation as useGeoLocation } from '@/hooks/useLocation'
import { COUNTRY_NAME } from '@/lib/constants/appConstants'
import type { District } from '@/lib/data/types'

interface HeaderProps {
  districts: District[]
  selectedDistrict: string
  onDistrictChange: (value: string) => void
  isDark: boolean
  onThemeToggle: () => void
}

export function Header({
  districts,
  selectedDistrict,
  onDistrictChange,
  isDark,
  onThemeToggle,
}: HeaderProps) {
  const { detectLocation, isDetecting } = useGeoLocation()
  const [showInfo, setShowInfo] = useState(false)
  const location = useLocation()

  const handleDetectLocation = async () => {
    const district = await detectLocation()
    if (district) {
      onDistrictChange(district)
    }
  }

  const isPrayerSection = location.pathname.startsWith('/prayer')
  const isHijriSection = location.pathname === '/hijri'

  return (
    <header className="hidden sm:block border-b border-border bg-background/95 backdrop-blur-xl sticky top-0 z-40 shadow-sm supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between gap-2 px-2 sm:px-4 py-2 sm:py-3">
        {/* Branding & Title */}
        <Link
          to="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0"
        >
          <img
            src="/icon-192x192.png"
            alt="Prayer Times"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl shadow-sm"
          />
          <div className="hidden sm:flex flex-col text-left">
            <h1 className="text-base font-bold leading-none tracking-tight">Prayer Times</h1>
            <span className="text-[10px] text-muted-foreground font-medium">{COUNTRY_NAME}</span>
          </div>
        </Link>

        {/* Section Toggle */}
        <div className="flex items-center bg-muted/50 rounded-lg p-0.5 sm:p-1 border border-border/50">
          <Link
            to="/prayer"
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-[11px] sm:text-xs font-medium transition-all ${
              isPrayerSection
                ? 'bg-background text-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Prayer</span>
          </Link>
          <Link
            to="/hijri"
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-[11px] sm:text-xs font-medium transition-all ${
              isHijriSection
                ? 'bg-background text-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Hijri</span>
          </Link>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDetectLocation}
            disabled={isDetecting}
            className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-primary transition-colors"
            title="Detect location"
          >
            {isDetecting ? (
              <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
            ) : (
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </Button>

          <DistrictSelector
            districts={districts}
            value={selectedDistrict}
            onChange={onDistrictChange}
            size="default"
          />

          <ThemeToggleButton isDark={isDark} onToggle={onThemeToggle} />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowInfo(true)}
            className="hidden sm:flex h-8 w-8 text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
            title="App Info & Sources"
          >
            <HelpCircle className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <AppInfoModal isOpen={showInfo} onClose={() => setShowInfo(false)} />
    </header>
  )
}
