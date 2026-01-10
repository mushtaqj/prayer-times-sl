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
      className="w-full grid grid-cols-3 p-1 bg-muted rounded-xl gap-1 border-none shadow-inner"
    >
      <ToggleGroupItem
        value="today"
        className="flex-1 rounded-lg data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm transition-all duration-300 capitalize border-none hover:bg-background/50 data-[state=on]:font-semibold text-sm"
      >
        Today
      </ToggleGroupItem>
      <ToggleGroupItem
        value="week"
        className="flex-1 rounded-lg data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm transition-all duration-300 capitalize border-none hover:bg-background/50 data-[state=on]:font-semibold text-sm"
      >
        Week
      </ToggleGroupItem>
      <ToggleGroupItem
        value="month"
        className="flex-1 rounded-lg data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm transition-all duration-300 capitalize border-none hover:bg-background/50 data-[state=on]:font-semibold text-sm"
      >
        Month
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
