"use client"

import { Button } from "@/components/ui/button"

export function YieldDripYieldFarming() {
  return (
    <div className="bg-[#1A1A1F]/80 backdrop-blur-md border border-[#2A2A2F] rounded-lg p-6">
      <h2 className="text-xl font-semibold text-white mb-6">Yield Farming</h2>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between">
          <span className="text-gray-400">Current APY</span>
          <span className="text-white font-medium">4.85%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Total Deposited</span>
          <span className="text-white font-medium">$2,847</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Daily Yield</span>
          <span className="text-white font-medium">$0.38</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">This Week</span>
          <span className="text-white font-medium">$2.12 of $2.67 earned</span>
        </div>
      </div>

      <div className="w-full bg-gray-700 rounded-full h-2 mb-6">
        <div className="bg-gradient-to-r from-[#00D1FF] to-[#00FFB2] h-2 rounded-full w-[79%]" />
      </div>

      <div className="space-y-3">
        <Button className="w-full bg-[#1A1A1F]/40 backdrop-blur-md border border-[#00D1FF]/30 text-[#00D1FF] hover:bg-[#00D1FF]/10 hover:border-[#00D1FF]/50 transition-all duration-300 shadow-lg shadow-[#0B0B0F]/50">
          Compound
        </Button>
        <Button
          variant="outline"
          className="w-full border-[#00D1FF]/30 text-[#00D1FF] hover:bg-[#00D1FF]/10 hover:border-[#00D1FF]/50 bg-[#1A1A1F]/40 backdrop-blur-md transition-all duration-300 shadow-lg shadow-[#0B0B0F]/50"
        >
          Withdraw
        </Button>
        <Button
          variant="outline"
          className="w-full border-[#00D1FF]/30 text-[#00D1FF] hover:bg-[#00D1FF]/10 hover:border-[#00D1FF]/50 bg-[#1A1A1F]/40 backdrop-blur-md transition-all duration-300 shadow-lg shadow-[#0B0B0F]/50"
        >
          Learn More
        </Button>
      </div>
    </div>
  )
}
