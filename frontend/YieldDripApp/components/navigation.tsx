"use client"

import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BarChart2, Home, Layers, Network, TrendingUp } from "lucide-react"

export function Navigation() {
  const router = useRouter()
  const pathname = usePathname()

  // Don't show the floating navigation on yield-drip page since it has its own header
  if (pathname === "/yield-drip") {
    return null
  }

  return (
    <>
      <Button
        variant="ghost"
        className="absolute top-4 left-4 z-20 text-[#F2F2F2] hover:text-[#00D1FF] hover:bg-transparent"
        onClick={() => router.push("/")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Button>

      <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center">
        <div className="bg-[#1A1A1F]/50 backdrop-blur-md border border-[#2A2A2F] rounded-full px-2 py-1">
          <div className="flex space-x-1">
            <NavButton
              icon={<Home className="h-5 w-5" />}
              label="Home"
              onClick={() => router.push("/")}
              active={pathname === "/"}
            />
            <NavButton
              icon={<Layers className="h-5 w-5" />}
              label="Strategy"
              onClick={() => router.push("/strategy")}
              active={pathname === "/strategy"}
            />
            <NavButton
              icon={<TrendingUp className="h-5 w-5" />}
              label="Yield Drip"
              onClick={() => router.push("/yield-drip")}
              active={pathname === "/yield-drip"}
            />
            <NavButton
              icon={<Network className="h-5 w-5" />}
              label="Studio"
              onClick={() => router.push("/studio")}
              active={pathname === "/studio"}
            />
          </div>
        </div>
      </div>
    </>
  )
}

function NavButton({ icon, label, onClick, active }) {
  return (
    <Button
      variant="ghost"
      className={`flex flex-col items-center justify-center px-4 py-2 space-y-1 rounded-full ${
        active ? "bg-[#00D1FF]/20 text-[#00D1FF]" : "text-[#A6A6A6] hover:text-[#00D1FF] hover:bg-transparent"
      }`}
      onClick={onClick}
    >
      {icon}
      <span className="text-xs">{label}</span>
    </Button>
  )
}
