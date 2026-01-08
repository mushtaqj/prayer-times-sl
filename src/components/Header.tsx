import { Moon, Sun, MapPin } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/retroui/Select'
import { Button } from '@/components/retroui/Button'
import type { District } from '@/hooks/usePrayerTimes'

interface HeaderProps {
  districts: District[]
  selectedDistrict: string
  onDistrictChange: (value: string) => void
  isDark: boolean
  onThemeToggle: () => void
}

export function Header({ districts, selectedDistrict, onDistrictChange, isDark, onThemeToggle }: HeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[var(--primary)] rounded-xl border-2 border-[var(--foreground)] flex items-center justify-center shadow-[2px_2px_0px_0px_var(--foreground)]">
          <span className="text-xl">🕌</span>
        </div>
        <h1 className="text-xl md:text-2xl font-bold">Prayer Times</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[var(--muted-foreground)]" />
          <Select value={selectedDistrict} onValueChange={onDistrictChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select district" />
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

        <Button variant="outline" size="icon" onClick={onThemeToggle}>
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </div>
    </header>
  )
}
