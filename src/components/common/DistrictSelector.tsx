import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { District } from '@/lib/data/types'

interface DistrictSelectorProps {
  districts: District[]
  value: string
  onChange: (value: string) => void
  /** Size variant */
  size?: 'sm' | 'default' | 'full'
  className?: string
}

/**
 * District selection dropdown
 */
export function DistrictSelector({
  districts,
  value,
  onChange,
  size = 'default',
  className = '',
}: DistrictSelectorProps) {
  const sizeClasses = {
    sm: 'w-20 h-7 text-[10px]',
    default: 'w-28 h-8 text-xs',
    full: 'w-full h-10',
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={`${sizeClasses[size]} border-muted bg-card/50 backdrop-blur-sm ${className}`}
      >
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
  )
}
