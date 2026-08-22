import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "error" | "ai";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "motion-interactive inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
        {
          "border-transparent bg-foreground text-surface font-medium": variant === "default",
          "border-transparent bg-accent-soft text-text-secondary": variant === "secondary",
          "border-border text-foreground bg-transparent": variant === "outline",
          "border-transparent bg-success/10 text-success": variant === "success",
          "border-transparent bg-warning/10 text-warning": variant === "warning",
          "border-transparent bg-error/10 text-error": variant === "error",
          "border-transparent bg-accent-warm-soft text-accent-warm font-medium": variant === "ai",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
