import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D1FF] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:pointer-events-none disabled:opacity-50 backdrop-blur-sm border font-mono",
  {
    variants: {
      variant: {
        default:
          "bg-[#1A1A1F]/40 text-[#F2F2F2] border-[#2A2A2F] hover:bg-[#1A1A1F]/60 hover:border-[#00D1FF]/30 shadow-lg shadow-[#0B0B0F]/50",
        destructive:
          "bg-[#FF4C4C]/20 text-[#FF4C4C] border-[#FF4C4C]/40 hover:bg-[#FF4C4C]/30 hover:border-[#FF4C4C]/60 shadow-lg shadow-[#FF4C4C]/20",
        outline: "border-[#2A2A2F] bg-transparent text-[#F2F2F2] hover:bg-[#1A1A1F]/50 hover:border-[#00D1FF]/30 shadow-sm",
        secondary:
          "bg-[#00FFB2]/20 text-[#00FFB2] border-[#00FFB2]/40 hover:bg-[#00FFB2]/30 hover:border-[#00FFB2]/60 shadow-lg shadow-[#00FFB2]/10",
        ghost: "border-transparent text-[#A6A6A6] hover:bg-[#1A1A1F]/50 hover:text-[#F2F2F2]",
        link: "text-[#A6A6A6] underline-offset-4 hover:underline border-transparent bg-transparent hover:text-[#F2F2F2]",
        primary:
          "bg-[#1A1A1F]/40 text-[#00D1FF] border-[#00D1FF]/30 hover:bg-[#00D1FF]/10 hover:border-[#00D1FF]/50 shadow-lg shadow-[#0B0B0F]/50",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
