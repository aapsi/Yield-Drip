"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { YieldDripHeader } from "@/components/yield-drip/header"
import { YieldDripYieldFarming } from "@/components/yield-drip/yield-farming"


export default function YieldDripYieldFarmingPage() {
  const router = useRouter()


  return (
    <main className="min-h-screen bg-black">
      {/* Header */}
      <YieldDripHeader currentPage="yield-farming" />

      {/* Yield Farming Content */}
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Yield Farming</h1>
            <p className="text-gray-400">Monitor your yield farming performance and manage deposits</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Detailed Yield Farming Stats */}
              <div className="bg-gray-900/50 backdrop-blur-md border border-gray-700 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-white mb-6">Performance Overview</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
                    <h3 className="text-sm text-gray-400 mb-2">Total Deposited</h3>
                    <p className="text-2xl font-bold text-white">$2,847.32</p>
                    <p className="text-sm text-[#00FFB2]">+$247.89 this month</p>
                  </div>

                  <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
                    <h3 className="text-sm text-gray-400 mb-2">Current APY</h3>
                    <p className="text-2xl font-bold text-[#00FFB2]">4.85%</p>
                    <p className="text-sm text-gray-400">Updated 2 hours ago</p>
                  </div>

                  <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
                    <h3 className="text-sm text-gray-400 mb-2">Daily Yield</h3>
                    <p className="text-2xl font-bold text-white">$0.38</p>
                    <p className="text-sm text-gray-300">$2.67 weekly</p>
                  </div>

                  <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
                    <h3 className="text-sm text-gray-400 mb-2">This Week Progress</h3>
                    <p className="text-2xl font-bold text-white">$2.12</p>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                      <div className="bg-gradient-to-r from-[#00D1FF] to-[#00FFB2] h-2 rounded-full w-[79%]" />
                    </div>
                  </div>
                </div>

                            <div className="bg-[#00FFB2]/10 border border-[#00FFB2]/30 rounded-lg p-4">
              <p className="text-[#00FFB2] text-sm">💰 vs Idle Money: +$2.12 extra earnings this week</p>
                </div>
              </div>

              {/* Yield History */}
              <div className="bg-gray-900/50 backdrop-blur-md border border-gray-700 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Yield History</h2>

                <div className="space-y-4">
                  {[
                    { date: "Today", amount: "$0.38", type: "Daily Yield" },
                    { date: "Yesterday", amount: "$0.37", type: "Daily Yield" },
                    { date: "Jan 13", amount: "$0.39", type: "Daily Yield" },
                    { date: "Jan 12", amount: "$0.36", type: "Daily Yield" },
                    { date: "Jan 11", amount: "$2.45", type: "Weekly Compound" },
                  ].map((entry, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-3 border-b border-gray-700 last:border-b-0"
                    >
                      <div>
                        <p className="text-white font-medium">{entry.type}</p>
                        <p className="text-sm text-gray-400">{entry.date}</p>
                      </div>
                      <p className="text-[#00FFB2] font-medium">{entry.amount}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <YieldDripYieldFarming />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
