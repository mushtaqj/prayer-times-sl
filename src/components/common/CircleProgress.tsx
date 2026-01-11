interface CircleProgressProps {
  /** Progress value (0-100) */
  progress: number
  /** Size of the circle in pixels */
  size: number
  /** Stroke width in pixels (default: 6) */
  strokeWidth?: number
  /** Additional CSS classes */
  className?: string
  /** Content to render in the center */
  children?: React.ReactNode
}

/**
 * Circular progress indicator with customizable size and center content
 */
export function CircleProgress({
  progress,
  size,
  strokeWidth = 6,
  className = '',
  children,
}: CircleProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className={`relative ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="opacity-20"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="opacity-90 transition-all duration-1000"
        />
      </svg>

      {/* Center content */}
      {children && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {children}
        </div>
      )}
    </div>
  )
}
