import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 backdrop-blur-sm",
  {
    variants: {
      variant: {
        default: "border-transparent bg-gray-700/80 text-gray-200 hover:bg-gray-600/80",
        secondary: "border-transparent bg-[#00FFB2]/20 text-[#00FFB2] hover:bg-[#00FFB2]/30",
        destructive: "border-transparent bg-red-900/80 text-red-200 hover:bg-red-800/80",
        outline: "border-gray-500 text-gray-300 hover:bg-gray-800/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
