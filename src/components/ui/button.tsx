import * as React from "react"
import { cn } from "@/lib/utils"

type Variant = "primary" | "secondary" | "ghost" | "light"
type Size = "sm" | "md" | "lg"

const variants: Record<Variant, string> = {
  primary: "bg-lime text-night font-display tracking-wide shadow-[0_4px_0_#160a2e] ring-2 ring-[#160a2e] hover:bg-[#d8ff5c] active:translate-y-[2px] active:shadow-[0_2px_0_#160a2e]",
  secondary: "bg-mist text-ink ring-1 ring-inset ring-line hover:bg-[#261a4d] active:scale-[0.98]",
  ghost: "text-lime hover:underline underline-offset-4",
  light: "bg-lime text-night hover:bg-[#d8ff5c] active:scale-[0.98]",
}
const sizes: Record<Size, string> = {
  sm: "h-8 px-4 text-[13px]",
  md: "h-11 px-6 text-[15px]",
  lg: "h-14 px-8 text-[17px]",
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-2 focus-visible:ring-offset-night disabled:pointer-events-none disabled:opacity-40",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
)
Button.displayName = "Button"

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-2 focus-visible:ring-offset-night",
    variants[variant],
    sizes[size],
    className,
  )
}
