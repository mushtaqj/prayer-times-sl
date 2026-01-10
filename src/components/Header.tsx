import { Moon, Sun, MapPin, Loader2, Clock, Calendar } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useLocation } from '@/hooks/useLocation'
import type { District } from '@/hooks/usePrayerTimes'

export type MainSection = 'prayer' | 'hijri'

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

  const handleDetectLocation = async () => {
    const district = await detectLocation()
    if (district) {
      onDistrictChange(district)
    }
  }

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-20">
      {/* Top row: Section toggle + controls */}
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        {/* Section Toggle - Compact segmented control */}
        <div className="flex items-center bg-muted rounded-lg p-0.5">
          <button
            onClick={() => onSectionChange('prayer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              mainSection === 'prayer'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Prayer</span>
          </button>
          <button
            onClick={() => onSectionChange('hijri')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              mainSection === 'hijri'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Hijri</span>
          </button>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDetectLocation}
            disabled={isDetecting}
            className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
            title="Detect location"
          >
            {isDetecting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MapPin className="w-4 h-4" />
            )}
          </Button>

          <Select value={selectedDistrict} onValueChange={onDistrictChange}>
            <SelectTrigger className="w-28 h-8 text-xs border-muted bg-card/50 backdrop-blur-sm">
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
            className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </header>
  )
}
