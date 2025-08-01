"use client"

import { Button } from "@/components/ui/button"

interface Strategy {
  id: number
  name: string
  token: string
  weeklyAmount: number
  totalWeeks: number
  currentWeek: number
  progress: number
  yieldEarned: number
  nextExecution?: string
  status: "active" | "paused"
  pauseReason?: string
}

interface YieldDripActiveStrategiesProps {
  strategies: Strategy[]
}

export function YieldDripActiveStrategies({ strategies }: YieldDripActiveStrategiesProps) {
  return (
    <div className="bg-gray-900/50 backdrop-blur-md border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Active Strategies</h2>
        <Button
          variant="outline"
          className="border-gray-600 text-gray-400 hover:text-white hover:border-gray-500 bg-transparent"
        >
          Filter
        </Button>
      </div>

      <div className="space-y-6">
        {strategies.map((strategy) => (
          <StrategyCard key={strategy.id} strategy={strategy} />
        ))}
      </div>
    </div>
  )
}

function StrategyCard({ strategy }: { strategy: Strategy }) {
  const isActive = strategy.status === "active"

  return (
    <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-white">{strategy.name}</h3>
          <p className="text-sm text-gray-400">
            ${strategy.weeklyAmount} weekly for {strategy.totalWeeks} weeks
          </p>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            isActive
              ? "bg-[#00FFB2]/20 text-[#00FFB2] border border-[#00FFB2]/30"
              : "bg-[#2A2A2F]/20 text-[#A6A6A6] border border-[#2A2A2F]/30"
          }`}
        >
          {isActive ? "Active" : "Paused"}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-400">Progress</span>
          <span className="text-white">
            {strategy.currentWeek} of {strategy.totalWeeks} weeks
          </span>
        </div>
        <div className="w-full bg-[#2A2A2F] rounded-full h-2">
          <div
            className="bg-gradient-to-r from-[#00D1FF] to-[#00FFB2] h-2 rounded-full transition-all duration-300"
            style={{ width: `${strategy.progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-gray-400">Yield Earned</span>
          <p className="text-white font-medium">${strategy.yieldEarned}</p>
        </div>
        {isActive && strategy.nextExecution ? (
          <div>
            <span className="text-gray-400">Next Execution</span>
            <p className="text-white font-medium">{strategy.nextExecution}</p>
          </div>
        ) : (
          <div>
            <span className="text-gray-400">Status</span>
            <p className="text-white font-medium">{strategy.pauseReason}</p>
          </div>
        )}
      </div>

      <div className="flex space-x-3">
        <Button
          size="sm"
          variant="outline"
          className="border-gray-600 text-gray-400 hover:text-white hover:border-gray-500 bg-transparent"
        >
          {isActive ? "Pause" : "Resume"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-gray-600 text-gray-400 hover:text-white hover:border-gray-500 bg-transparent"
        >
          Details
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-gray-600 text-gray-400 hover:text-white hover:border-gray-500 bg-transparent"
        >
          Settings
        </Button>
      </div>
    </div>
  )
}
