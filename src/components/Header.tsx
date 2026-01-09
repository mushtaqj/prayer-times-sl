import { Moon, Sun, MapPin, Loader2 } from 'lucide-react'
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

interface HeaderProps {
  districts: District[]
  selectedDistrict: string
  onDistrictChange: (value: string) => void
  isDark: boolean
  onThemeToggle: () => void
}

export function Header({ districts, selectedDistrict, onDistrictChange, isDark, onThemeToggle }: HeaderProps) {
  const { detectLocation, isDetecting } = useLocation()

  const handleDetectLocation = async () => {
    const district = await detectLocation()
    if (district) {
      onDistrictChange(district)
    }
  }

  return (
    <header className="flex items-center justify-between gap-4 p-4 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-20">
      <h1 className="text-2xl font-bold text-primary font-heading tracking-wide">Prayer Times</h1>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDetectLocation}
          disabled={isDetecting}
          className="h-9 w-9 text-muted-foreground hover:text-primary transition-colors"
          title="Detect location"
        >
          {isDetecting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <MapPin className="w-5 h-5" />
          )}
        </Button>

        <Select value={selectedDistrict} onValueChange={onDistrictChange}>
          <SelectTrigger className="w-32 h-9 border-muted bg-card/50 backdrop-blur-sm">
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

        <Button variant="ghost" size="icon" onClick={onThemeToggle} className="h-9 w-9 text-muted-foreground hover:text-primary transition-colors">
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </div>
    </header>
  )
}
