import { MapPin } from 'lucide-react'

interface LocationBadgeProps {
  location: string
  showIcon?: boolean
}

export function LocationBadge({ location, showIcon = false }: LocationBadgeProps) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-primary bg-primary/10 px-2 py-0.5 rounded-full">
      {showIcon && <MapPin className="w-3 h-3" />}
      <span className="font-medium">{location}</span>
    </div>
  )
}
