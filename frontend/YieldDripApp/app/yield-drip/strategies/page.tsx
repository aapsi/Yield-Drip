"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { YieldDripHeader } from "@/components/yield-drip/header"
import { YieldDripPortfolio } from "@/components/yield-drip/portfolio-overview"
import { YieldDripActiveStrategies } from "@/components/yield-drip/active-strategies"
import { YieldDripYieldFarming } from "@/components/yield-drip/yield-farming"
import { YieldDripModal } from "@/components/yield-drip/create-strategy-modal"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function YieldDripStrategies() {
  const router = useRouter()

  const [showCreateModal, setShowCreateModal] = useState(false)

  // Mock data for demonstration
  const portfolioData = {
    totalValue: 12847.32,
    totalValueChange: 2.4,
    yieldEarned: 247.89,
    yieldEarnedChange: 1.23,
    activeStrategies: 5,
    pendingStrategies: 2,
    weeklyRate: 3.42,
    weeklyRateChange: 0.15,
  }

  const strategies = [
    {
      id: 1,
      name: "Yield Strategy - Balanced",
      token: "sDAI",
      weeklyAmount: 100,
      totalWeeks: 10,
      currentWeek: 8,
      progress: 80,
      yieldEarned: 8.42,
      nextExecution: "January 15, 2:00 PM",
      status: "active" as const,
    },
    {
      id: 3,
      name: "Yield Strategy - Conservative",
      token: "sDAI",
      weeklyAmount: 75,
      totalWeeks: 15,
      currentWeek: 5,
      progress: 33,
      yieldEarned: 3.15,
      status: "paused" as const,
      pauseReason: "Paused by user",
    },
  ]

  return (
    <main className="min-h-screen bg-black">
      {/* Header */}
      <YieldDripHeader currentPage="strategies" />

      {/* Strategies Content */}
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Your Strategies</h1>
                <p className="text-gray-400">Manage your DCA strategies and monitor their performance</p>
              </div>
              <Button
                onClick={() => router.push("/create-strategy")}
                className="bg-[#1A1A1F]/40 backdrop-blur-md border border-[#00D1FF]/30 text-[#00D1FF] hover:bg-[#00D1FF]/10 hover:border-[#00D1FF]/50 px-6 py-3 text-lg rounded-2xl font-mono font-medium transition-all duration-300 hover:scale-105 shadow-2xl shadow-[#0B0B0F]/50"
              >
                <Plus className="mr-2 h-5 w-5" />
                Create New Strategy
              </Button>
            </div>
          </div>

          {/* Portfolio Overview */}
          <YieldDripPortfolio data={portfolioData} />

          <div className="mt-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <YieldDripActiveStrategies strategies={strategies} />
              </div>
              <div>
                <YieldDripYieldFarming />
              </div>
            </div>
          </div>
        </div>

        {/* Modal */}
        <YieldDripModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => setShowCreateModal(false)}
        />
      </div>
    </main>
  )
}
