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
    <header className="flex items-center justify-between gap-4 p-4 border-b border-border">
      <h1 className="text-lg font-bold text-foreground">Prayer Times</h1>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDetectLocation}
          disabled={isDetecting}
          className="h-9 w-9"
          title="Detect location"
        >
          {isDetecting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <MapPin className="w-4 h-4" />
          )}
        </Button>

        <Select value={selectedDistrict} onValueChange={onDistrictChange}>
          <SelectTrigger className="w-32 h-9">
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

        <Button variant="ghost" size="icon" onClick={onThemeToggle} className="h-9 w-9">
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
      </div>
    </header>
  )
}
