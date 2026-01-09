import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

export type ViewType = 'today' | 'week' | 'month'

interface ViewSwitcherProps {
  value: ViewType
  onChange: (value: ViewType) => void
}

export function ViewSwitcher({ value, onChange }: ViewSwitcherProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(val) => val && onChange(val as ViewType)}
      variant="outline"
      className="w-full grid grid-cols-3"
    >
      <ToggleGroupItem
        value="today"
        className="flex-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
      >
        Today
      </ToggleGroupItem>
      <ToggleGroupItem
        value="week"
        className="flex-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
      >
        Week
      </ToggleGroupItem>
      <ToggleGroupItem
        value="month"
        className="flex-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
      >
        Month
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
