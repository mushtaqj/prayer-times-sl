import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-2 border-[var(--foreground)] rounded-xl",
  {
    variants: {
      variant: {
        default: "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[4px_4px_0px_0px_var(--foreground)] hover:shadow-none hover:translate-x-1 hover:translate-y-1",
        secondary: "bg-[var(--secondary)] text-[var(--secondary-foreground)] shadow-[4px_4px_0px_0px_var(--foreground)] hover:shadow-none hover:translate-x-1 hover:translate-y-1",
        outline: "bg-transparent text-[var(--foreground)] shadow-[4px_4px_0px_0px_var(--foreground)] hover:bg-[var(--muted)] hover:shadow-none hover:translate-x-1 hover:translate-y-1",
        ghost: "border-transparent shadow-none hover:bg-[var(--muted)]",
        link: "border-transparent shadow-none underline-offset-4 hover:underline text-[var(--primary)]",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-base",
        lg: "h-12 px-6 text-lg",
        icon: "h-10 w-10 p-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
