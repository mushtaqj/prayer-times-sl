import { Link, useLocation } from 'react-router-dom'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

export function ViewSwitcher() {
  const location = useLocation()

  // Determine current view based on route
  const getCurrentView = () => {
    if (location.pathname === '/prayer/week') return 'week'
    if (location.pathname === '/prayer/month') return 'month'
    return 'today'
  }

  const currentView = getCurrentView()

  return (
    <ToggleGroup
      type="single"
      value={currentView}
      variant="outline"
      className="w-full grid grid-cols-3 p-1 bg-muted rounded-xl gap-1 border-none shadow-inner"
    >
      <ToggleGroupItem
        value="today"
        asChild
        className="flex-1 rounded-lg data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm transition-all duration-300 capitalize border-none hover:bg-background/50 data-[state=on]:font-semibold text-sm"
      >
        <Link to="/prayer">Today</Link>
      </ToggleGroupItem>
      <ToggleGroupItem
        value="week"
        asChild
        className="flex-1 rounded-lg data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm transition-all duration-300 capitalize border-none hover:bg-background/50 data-[state=on]:font-semibold text-sm"
      >
        <Link to="/prayer/week">Week</Link>
      </ToggleGroupItem>
      <ToggleGroupItem
        value="month"
        asChild
        className="flex-1 rounded-lg data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm transition-all duration-300 capitalize border-none hover:bg-background/50 data-[state=on]:font-semibold text-sm"
      >
        <Link to="/prayer/month">Month</Link>
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
