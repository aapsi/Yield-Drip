"use client"

import { useRouter } from "next/navigation"
import { MainScene } from "@/components/main-scene"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { ArrowDown } from "lucide-react"
import { DashboardNav } from "@/components/dashboard-nav"

export default function HomePage() {
  const router = useRouter()


  const handleLearnMore = () => {
    router.push("/learn-more")
  }

  return (
    <main className="relative w-full h-screen bg-[#0B0B0F] overflow-hidden">
      {/* 3D Background - Fixed */}
      <div className="fixed inset-0 z-0">
        <MainScene />
      </div>

      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-20">
        <Header />
      </div>

      {/* Fixed Hero Content */}
      <div className="fixed inset-0 z-10 flex flex-col justify-start items-center pt-48">
        <div className="text-center px-4 -mt-16">
          <div className="max-w-4xl mx-auto">
            <p className="text-sm text-[#A6A6A6] mb-8 uppercase tracking-wider font-mono">
              {/* Because your money should work while it waits */}
              
            </p>
          </div>
        </div>

        <div className="text-center px-4 mt-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <p className="text-base text-[#F2F2F2] max-w-2xl mx-auto font-mono font-medium">
                Turn your waiting DCA funds into earning assets. While your dollar-cost averaging orders queue up, your capital automatically earns yield through DeFi strategies.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Button */}
      <div className="fixed bottom-40 left-1/2 transform -translate-x-1/2 z-20">
                    <Button
              onClick={() => router.push("/create-strategy")}
              className="bg-[#1A1A1F]/40 backdrop-blur-md border border-[#00D1FF]/30 text-[#00D1FF] hover:bg-[#00D1FF]/10 hover:border-[#00D1FF]/50 px-8 py-4 text-lg rounded-2xl font-mono font-medium transition-all duration-300 hover:scale-105 shadow-2xl shadow-[#0B0B0F]/50"
            >
              Create Your Strategy
            </Button>
      </div>

      {/* Dashboard Navigation for Connected Users */}
      <DashboardNav />


    </main>
  )
}
