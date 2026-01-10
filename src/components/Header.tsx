import { useState } from 'react'
import { Moon, Sun, MapPin, Loader2, Clock, Calendar, HelpCircle } from 'lucide-react'
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

export type MainSection = 'home' | 'prayer' | 'hijri'

interface HeaderProps {
  districts: District[]
  selectedDistrict: string
  onDistrictChange: (value: string) => void
  isDark: boolean
  onThemeToggle: () => void
  mainSection: MainSection
  onSectionChange: (section: MainSection) => void
}

export function Header({
  districts,
  selectedDistrict,
  onDistrictChange,
  isDark,
  onThemeToggle,
  mainSection,
  onSectionChange,
}: HeaderProps) {
  const { detectLocation, isDetecting } = useLocation()
  const [showInfo, setShowInfo] = useState(false)

  const handleDetectLocation = async () => {
    const district = await detectLocation()
    if (district) {
      onDistrictChange(district)
    }
  }

  return (
    <header className="hidden sm:block border-b border-border bg-background/95 backdrop-blur-xl sticky top-0 z-40 shadow-sm supports-[backdrop-filter]:bg-background/60">
      {/* Top row: Section toggle + controls */}
      <div className="flex items-center justify-between gap-2 px-2 sm:px-4 py-2 sm:py-3">

        {/* Branding & Title - Clickable to go home */}
        <button
          onClick={() => onSectionChange('home')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0"
        >
          <img
            src="/icon-192x192.png"
            alt="Prayer Times"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl shadow-sm"
          />
          <div className="hidden sm:flex flex-col text-left">
            <h1 className="text-base font-bold leading-none tracking-tight">Prayer Times</h1>
            <span className="text-[10px] text-muted-foreground font-medium">Sri Lanka</span>
          </div>
        </button>

        {/* Section Toggle - Prayer & Hijri only (no Home button) */}
        <div className="flex items-center bg-muted/50 rounded-lg p-0.5 sm:p-1 border border-border/50">
          <button
            onClick={() => onSectionChange('prayer')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-[11px] sm:text-xs font-medium transition-all ${mainSection === 'prayer'
              ? 'bg-background text-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/10'
              : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Prayer</span>
          </button>
          <button
            onClick={() => onSectionChange('hijri')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-[11px] sm:text-xs font-medium transition-all ${mainSection === 'hijri'
              ? 'bg-background text-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/10'
              : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Hijri</span>
          </button>
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

          <Select value={selectedDistrict} onValueChange={onDistrictChange}>
            <SelectTrigger className="w-20 sm:w-28 h-7 sm:h-8 text-[10px] sm:text-xs border-muted bg-card/50 backdrop-blur-sm">
              <SelectValue placeholder="District" />
            </SelectTrigger>
            <SelectContent>
              {districts.map(district => (
                <SelectItem key={district.id} value={district.id}>
                  {district.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="icon"
            onClick={onThemeToggle}
            className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-primary transition-colors"
          >
            {isDark ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </Button>

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
