import * as React from "react"
import { cn } from "@/lib/utils"

type Variant = "primary" | "secondary" | "ghost" | "light"
type Size = "sm" | "md" | "lg"

const variants: Record<Variant, string> = {
  primary: "bg-ink text-white hover:bg-black active:scale-[0.98]",
  secondary: "bg-white text-ink ring-1 ring-inset ring-line hover:bg-mist active:scale-[0.98]",
  ghost: "text-[#0066cc] hover:underline underline-offset-4",
  light: "bg-white text-ink hover:bg-white/90 active:scale-[0.98]",
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
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40",
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
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2",
    variants[variant],
    sizes[size],
    className,
  )
}
