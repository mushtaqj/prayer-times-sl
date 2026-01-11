import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ThemeToggleButtonProps {
  isDark: boolean
  onToggle: () => void
  /** Button size variant */
  size?: 'sm' | 'default'
  /** Show text label (for mobile menu) */
  showLabel?: boolean
  className?: string
}

/**
 * Theme toggle button that switches between light and dark mode
 */
export function ThemeToggleButton({
  isDark,
  onToggle,
  size = 'default',
  showLabel = false,
  className = '',
}: ThemeToggleButtonProps) {
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'

  if (showLabel) {
    return (
      <Button
        variant="outline"
        onClick={onToggle}
        className={`w-full justify-start gap-2 ${className}`}
      >
        {isDark ? (
          <>
            <Sun className="w-4 h-4" />
            Switch to Light Mode
          </>
        ) : (
          <>
            <Moon className="w-4 h-4" />
            Switch to Dark Mode
          </>
        )}
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onToggle}
      className={`text-muted-foreground hover:text-primary transition-colors ${
        size === 'sm' ? 'h-7 w-7' : 'h-8 w-8'
      } ${className}`}
    >
      {isDark ? (
        <Sun className={iconSize} />
      ) : (
        <Moon className={iconSize} />
      )}
    </Button>
  )
}
