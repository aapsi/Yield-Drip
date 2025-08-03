"use client"

import { Button } from "@/components/ui/button"

interface Strategy {
  id: number
  name: string
  token: string
  emoji: string
  amount: number
  frequency: string
  progress: number
  currentWeek: number
  totalWeeks: number
  yieldEarned: number
  nextDCA?: string
  dailyYield?: number
  status: "working" | "resting"
  missedYield?: number
}

interface ActiveStrategiesProps {
  strategies: Strategy[]
}

export function ActiveStrategies({ strategies }: ActiveStrategiesProps) {
  return (
    <div className="bg-[#1a1a2e]/80 backdrop-blur-md border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">💼</span>
          <h2 className="text-xl font-bold text-white">Your Money at Work</h2>
        </div>
        <Button
          variant="outline"
          className="border-white/20 text-[#94a3b8] hover:border-[#00d4ff]/30 hover:text-[#00d4ff] bg-transparent"
        >
          Filter ▼
        </Button>
      </div>

      <div className="space-y-4">
        {strategies.map((strategy) => (
          <StrategyCard key={strategy.id} strategy={strategy} />
        ))}
      </div>
    </div>
  )
}

function StrategyCard({ strategy }: { strategy: Strategy }) {
  const isWorking = strategy.status === "working"

  return (
    <div className="bg-[#0a0a0f]/50 border border-white/5 rounded-lg p-4 hover:border-[#00d4ff]/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-xl">{strategy.emoji}</span>
          <h3 className="font-medium text-white">{strategy.name}</h3>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            isWorking
              ? "bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/30"
              : "bg-[#ffaa00]/20 text-[#ffaa00] border border-[#ffaa00]/30"
          }`}
        >
          {isWorking ? "⚡ Working" : "💤 Resting"}
        </div>
      </div>

      <p className="text-[#94a3b8] text-sm mb-4">
        ${strategy.amount}/{strategy.frequency} DCA + yield on waiting funds
      </p>

      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-[#94a3b8]">Progress:</span>
          <span className="text-white">
            {strategy.currentWeek}/{strategy.totalWeeks} weeks ({strategy.progress}%)
          </span>
        </div>
        <div className="w-full bg-[#1a1a2e] rounded-full h-2">
          <div
            className="bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] h-2 rounded-full transition-all duration-300"
            style={{ width: `${strategy.progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-sm mb-4">
        <div className="flex items-center space-x-4">
          <span className="text-[#00ff88]">💰 Yield Earned: ${strategy.yieldEarned}</span>
          {strategy.nextDCA && <span className="text-[#94a3b8]">💎 DCA: {strategy.nextDCA}</span>}
        </div>
      </div>

      {isWorking && strategy.dailyYield && (
        <p className="text-[#00d4ff] text-sm mb-4">📊 While waiting: +${strategy.dailyYield}/day yield</p>
      )}

      {!isWorking && strategy.missedYield && (
        <p className="text-[#ffaa00] text-sm mb-4">📈 Missed yield: -${strategy.missedYield} (while paused)</p>
      )}

      <div className="flex space-x-2">
        <Button
          size="sm"
          variant="outline"
          className="border-white/20 text-[#94a3b8] hover:border-[#00d4ff]/30 hover:text-[#00d4ff] bg-transparent"
        >
          {isWorking ? "⏸ Pause" : "▶ Resume Work"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-white/20 text-[#94a3b8] hover:border-[#00d4ff]/30 hover:text-[#00d4ff] bg-transparent"
        >
          📊 Details
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-white/20 text-[#94a3b8] hover:border-[#00d4ff]/30 hover:text-[#00d4ff] bg-transparent"
        >
          ⚙️ Settings
        </Button>
      </div>
    </div>
  )
}
