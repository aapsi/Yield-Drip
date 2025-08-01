"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface YieldDripStrategyCreatorProps {
  onCreateStrategy: () => void
}

export function YieldDripStrategyCreator({ onCreateStrategy }: YieldDripStrategyCreatorProps) {
  const [strategyType, setStrategyType] = useState<"yield" | "dca">("yield")
  const [riskLevel, setRiskLevel] = useState<"low" | "medium" | "high">("medium")
  const [totalAmount, setTotalAmount] = useState(1000)
  const [weeklyAmount, setWeeklyAmount] = useState(100)
  const [duration, setDuration] = useState([10])

  const idleFunds = totalAmount - weeklyAmount
  
  // Fixed yield rates based on risk level
  const yieldRates = {
    low: 0.03,    // 3% APY - Conservative
    medium: 0.05,  // 5% APY - Balanced
    high: 0.08     // 8% APY - Aggressive
  }
  
  const expectedYield = (idleFunds * yieldRates[riskLevel] * duration[0]) / 52

  return (
    <div className="bg-gray-900/50 backdrop-blur-md border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Create Strategy</h2>
        <Button
          onClick={onCreateStrategy}
          className="bg-gradient-to-r from-gray-700 to-gray-900 border border-gray-600 hover:from-gray-600 hover:to-gray-800 hover:border-gray-500 text-white"
        >
          New Strategy
        </Button>
      </div>

      {/* Strategy Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card 
          className={`cursor-pointer transition-all ${
            strategyType === "yield" 
              ? "border-[#00FFB2] bg-[#00FFB2]/10" 
              : "border-gray-700 bg-gray-800/50"
          }`}
          onClick={() => setStrategyType("yield")}
        >
          <CardHeader>
            <CardTitle className="text-white">💰 Yield Strategy</CardTitle>
            <CardDescription className="text-gray-400">DAI → sDAI (Fixed Risk Levels)</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-300">Earn yield on idle funds with predefined risk levels</p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all ${
            strategyType === "dca" 
              ? "border-[#00D1FF] bg-[#00D1FF]/10" 
              : "border-gray-700 bg-gray-800/50"
          }`}
          onClick={() => setStrategyType("dca")}
        >
          <CardHeader>
            <CardTitle className="text-white">📈 DCA Strategy</CardTitle>
            <CardDescription className="text-gray-400">DAI → ETH</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-300">Dollar-cost average into Ethereum</p>
          </CardContent>
        </Card>
      </div>

      {strategyType === "yield" && (
        <>
          {/* Risk Level Selection for Yield Strategy */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-3">Risk Level</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Card 
                className={`cursor-pointer transition-all ${
                  riskLevel === "low" 
                    ? "border-green-500 bg-green-500/10" 
                    : "border-gray-700 bg-gray-800/50"
                }`}
                onClick={() => setRiskLevel("low")}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-sm">🛡️ Conservative</CardTitle>
                  <CardDescription className="text-gray-400">3% APY</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Badge variant="outline" className="text-green-400 border-green-400">Low Risk</Badge>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all ${
                  riskLevel === "medium" 
                    ? "border-yellow-500 bg-yellow-500/10" 
                    : "border-gray-700 bg-gray-800/50"
                }`}
                onClick={() => setRiskLevel("medium")}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-sm">⚖️ Balanced</CardTitle>
                  <CardDescription className="text-gray-400">5% APY</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Badge variant="outline" className="text-yellow-400 border-yellow-400">Medium Risk</Badge>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all ${
                  riskLevel === "high" 
                    ? "border-red-500 bg-red-500/10" 
                    : "border-gray-700 bg-gray-800/50"
                }`}
                onClick={() => setRiskLevel("high")}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-sm">🚀 Aggressive</CardTitle>
                  <CardDescription className="text-gray-400">8% APY</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Badge variant="outline" className="text-red-400 border-red-400">High Risk</Badge>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Total Amount</label>
              <div className="relative">
                <Input
                  type="number"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(Number(e.target.value))}
                  className="bg-gray-800/50 border-gray-600 text-white pr-16"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">DAI</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Weekly Amount</label>
              <div className="relative">
                <Input
                  type="number"
                  value={weeklyAmount}
                  onChange={(e) => setWeeklyAmount(Number(e.target.value))}
                  className="bg-gray-800/50 border-gray-600 text-white pr-16"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">DAI</span>
              </div>
            </div>
          </div>
        </>
      )}

      {strategyType === "dca" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Total Amount</label>
            <div className="relative">
              <Input
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(Number(e.target.value))}
                className="bg-gray-800/50 border-gray-600 text-white pr-16"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">DAI</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Weekly Amount</label>
            <div className="relative">
              <Input
                type="number"
                value={weeklyAmount}
                onChange={(e) => setWeeklyAmount(Number(e.target.value))}
                className="bg-gray-800/50 border-gray-600 text-white pr-16"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">DAI</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Duration: {duration[0]} weeks</label>
            <Slider value={duration} onValueChange={setDuration} max={52} min={1} step={1} className="w-full mt-2" />
          </div>
        </div>
      )}

      {/* Strategy-specific info */}
      {strategyType === "yield" && (
        <div className="mt-6 p-4 bg-[#00FFB2]/10 border border-[#00FFB2]/30 rounded-lg">
          <p className="text-[#00FFB2] text-sm font-medium">💰 Yield Strategy: DAI → sDAI</p>
          <p className="text-[#00FFB2] text-sm">Risk Level: {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} ({yieldRates[riskLevel] * 100}% APY)</p>
          <p className="text-[#00FFB2] text-sm">Expected yield: ${expectedYield.toFixed(2)}</p>
          <p className="text-gray-400 text-sm mt-1">Idle funds: ${idleFunds} DAI earning yield</p>
        </div>
      )}

      {strategyType === "dca" && (
        <div className="mt-6 p-4 bg-[#00D1FF]/10 border border-[#00D1FF]/30 rounded-lg">
          <p className="text-[#00D1FF] text-sm font-medium">📈 DCA Strategy: DAI → ETH</p>
          <p className="text-[#00D1FF] text-sm">Weekly DCA: ${weeklyAmount} DAI → ETH</p>
          <p className="text-gray-400 text-sm mt-1">Total investment: ${totalAmount} DAI over {duration[0]} weeks</p>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <Button
          onClick={onCreateStrategy}
          className="bg-gradient-to-r from-gray-700 to-gray-900 border border-gray-600 hover:from-gray-600 hover:to-gray-800 hover:border-gray-500 text-white px-6"
        >
          Create {strategyType === "yield" ? "Yield" : "DCA"} Strategy
        </Button>
      </div>
    </div>
  )
}
