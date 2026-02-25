"use client"

import { cn } from "@/lib/utils"

interface LogoProps {
  variant?: "primary" | "horizontal" | "nav" | "minimal"
  size?: "hero" | "header" | "nav" | "small" | "min"
  className?: string
  showBlink?: boolean
}

export function Logo({ variant = "horizontal", size = "header", className, showBlink = false }: LogoProps) {
  const sizeClasses = {
    hero: "text-5xl md:text-6xl",
    header: "text-2xl md:text-3xl",
    nav: "text-lg",
    small: "text-sm",
    min: "text-xs",
  }

  const baseClasses = "font-mono font-bold leading-none tracking-tight"

  if (variant === "primary") {
    return (
      <div className={cn("flex flex-col gap-0", className)}>
        <div className="text-[11px] font-mono font-normal text-muted tracking-wide mb-2.5 flex items-center gap-2">
          <span className="text-emerald-500 font-semibold">$</span>
          <span>init career --target senior</span>
        </div>
        <div className={cn(baseClasses, sizeClasses[size], "flex items-center gap-0")}>
          <span className="text-primary">growth</span>
          <span className={cn("text-emerald-500", showBlink && "animate-[blink_1.1s_step-end_infinite]")}>
            _
          </span>
          <span className="text-emerald-500">os</span>
        </div>
        <div className="text-[10px] font-mono font-normal text-muted tracking-widest uppercase mt-3.5 flex items-center gap-2">
          <span className="text-emerald-500 opacity-50">
            {"//"}
          </span>
          <span>career progression engine</span>
        </div>
      </div>
    )
  }

  if (variant === "horizontal") {
    return (
      <div className={cn("flex items-center gap-4", className)}>
        <div className="flex flex-col gap-1 flex-shrink-0">
          <div className="h-0.5 w-8 bg-emerald-500 rounded-sm" />
          <div className="h-0.5 w-[22px] bg-emerald-500/55 rounded-sm" />
          <div className="h-0.5 w-3 bg-emerald-500/28 rounded-sm" />
        </div>
        <div className="flex flex-col gap-1">
          <div className={cn(baseClasses, sizeClasses[size], "flex items-center gap-0")}>
            <span className="text-primary">growth</span>
            <span className={cn("text-emerald-500", showBlink && "animate-[blink_1.1s_step-end_infinite]")}>
              _
            </span>
            <span className="text-emerald-500">os</span>
          </div>
          <div className="text-[9px] font-normal text-muted tracking-widest uppercase">
            progression engine
          </div>
        </div>
      </div>
    )
  }

  if (variant === "nav") {
    return (
      <div className={cn("flex items-center gap-2.5", className)}>
        <span className="text-lg font-mono font-light text-emerald-500/50 leading-none">
          [
        </span>
        <span className={cn(baseClasses, sizeClasses[size], "flex items-center gap-0")}>
          growth<span className="text-emerald-500">_os</span>
        </span>
        <span className="text-lg font-mono font-light text-emerald-500/50 leading-none">
          ]
        </span>
      </div>
    )
  }

  // minimal
  return (
    <div className={cn(baseClasses, sizeClasses[size], "flex items-center gap-0", className)}>
      growth<span className="text-emerald-500">_os</span>
    </div>
  )
}
