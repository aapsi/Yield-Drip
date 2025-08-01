"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface YieldDripModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function YieldDripModal({ isOpen, onClose, onSuccess }: YieldDripModalProps) {
  const [step, setStep] = useState(1)
  const [strategyType, setStrategyType] = useState<"yield" | "dca">("yield")
  const [riskLevel, setRiskLevel] = useState<"low" | "medium" | "high">("medium")
  const [formData, setFormData] = useState({
    totalAmount: 1000,
    weeklyAmount: 100,
    duration: 10,
  })

  if (!isOpen) return null

  const handleSubmit = () => {
    // Simulate strategy creation
    setTimeout(() => {
      onSuccess()
    }, 1000)
  }

  const idleFunds = formData.totalAmount - formData.weeklyAmount
  
  // Fixed yield rates based on risk level
  const yieldRates = {
    low: 0.03,    // 3% APY - Conservative
    medium: 0.05,  // 5% APY - Balanced
    high: 0.08     // 8% APY - Aggressive
  }
  
  const estimatedYield = (idleFunds * yieldRates[riskLevel] * formData.duration) / 52

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-gray-900/95 backdrop-blur-md border border-gray-700 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Make Your Money Work</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Step {step} of 3: Strategy Setup</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-[#00D1FF] to-[#00FFB2] h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-3">Choose Your Strategy</label>
              <div className="grid grid-cols-1 gap-3">
                <Card 
                  className={`cursor-pointer transition-all ${
                    strategyType === "yield" 
                      ? "border-[#00FFB2] bg-[#00FFB2]/10" 
                      : "border-gray-700 bg-gray-800/50"
                  }`}
                  onClick={() => setStrategyType("yield")}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-base">💰 Yield Strategy</CardTitle>
                    <CardDescription className="text-gray-400">DAI → sDAI (Fixed Risk Levels)</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
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
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-base">📈 DCA Strategy</CardTitle>
                    <CardDescription className="text-gray-400">DAI → ETH</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-300">Dollar-cost average into Ethereum</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {step === 2 && strategyType === "yield" && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-3">Risk Level</label>
              <div className="grid grid-cols-1 gap-3">
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

            <div>
              <label className="block text-sm font-medium text-white mb-2">How much should work for you?</label>
              <div className="relative">
                <Input
                  type="number"
                  value={formData.totalAmount}
                  onChange={(e) => setFormData({ ...formData, totalAmount: Number(e.target.value) })}
                  className="bg-gray-800/50 border-gray-600 text-white pr-16"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">DAI</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Weekly DCA Amount</label>
              <div className="relative">
                <Input
                  type="number"
                  value={formData.weeklyAmount}
                  onChange={(e) => setFormData({ ...formData, weeklyAmount: Number(e.target.value) })}
                  className="bg-gray-800/50 border-gray-600 text-white pr-16"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">DAI</span>
              </div>
            </div>

            <div className="bg-[#00FFB2]/10 border border-[#00FFB2]/30 rounded-lg p-4 space-y-2">
              <p className="text-[#00FFB2] text-sm font-medium">💰 Yield Strategy: DAI → sDAI</p>
              <p className="text-[#00FFB2] text-sm">Risk Level: {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} ({yieldRates[riskLevel] * 100}% APY)</p>
              <p className="text-[#00FFB2] text-sm">Expected yield: ${estimatedYield.toFixed(2)}</p>
              <p className="text-gray-400 text-sm">Idle funds: ${idleFunds} DAI earning yield</p>
            </div>
          </div>
        )}

        {step === 2 && strategyType === "dca" && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">How much should work for you?</label>
              <div className="relative">
                <Input
                  type="number"
                  value={formData.totalAmount}
                  onChange={(e) => setFormData({ ...formData, totalAmount: Number(e.target.value) })}
                  className="bg-gray-800/50 border-gray-600 text-white pr-16"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">DAI</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Weekly DCA Amount</label>
              <div className="relative">
                <Input
                  type="number"
                  value={formData.weeklyAmount}
                  onChange={(e) => setFormData({ ...formData, weeklyAmount: Number(e.target.value) })}
                  className="bg-gray-800/50 border-gray-600 text-white pr-16"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">DAI</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Duration: {formData.duration} weeks</label>
              <Slider
                value={[formData.duration]}
                onValueChange={(value) => setFormData({ ...formData, duration: value[0] })}
                max={52}
                min={1}
                step={1}
                className="w-full"
              />
            </div>

            <div className="bg-[#00D1FF]/10 border border-[#00D1FF]/30 rounded-lg p-4 space-y-2">
              <p className="text-[#00D1FF] text-sm font-medium">📈 DCA Strategy: DAI → ETH</p>
              <p className="text-[#00D1FF] text-sm">Weekly DCA: ${formData.weeklyAmount} DAI → ETH</p>
              <p className="text-gray-400 text-sm">Total investment: ${formData.totalAmount} DAI over {formData.duration} weeks</p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-2">Strategy Summary</h3>
              <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Strategy Type:</span>
                  <span className="text-white">{strategyType === "yield" ? "💰 Yield (DAI→sDAI)" : "📈 DCA (DAI→ETH)"}</span>
                </div>
                {strategyType === "yield" && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Risk Level:</span>
                    <span className="text-white">{riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} ({yieldRates[riskLevel] * 100}% APY)</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Amount:</span>
                  <span className="text-white">${formData.totalAmount} DAI</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Weekly Amount:</span>
                  <span className="text-white">${formData.weeklyAmount} DAI</span>
                </div>
                {strategyType === "dca" && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration:</span>
                    <span className="text-white">{formData.duration} weeks</span>
                  </div>
                )}
                {strategyType === "yield" && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Expected Yield:</span>
                    <span className="text-[#00FFB2]">${estimatedYield.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => (step > 1 ? setStep(step - 1) : onClose())}
            className="border-gray-600 text-gray-400 hover:border-gray-500 hover:text-white"
          >
            {step > 1 ? "Back" : "Cancel"}
          </Button>
          <Button
            onClick={() => (step < 3 ? setStep(step + 1) : handleSubmit())}
            className="bg-gradient-to-r from-gray-700 to-gray-900 border border-gray-600 hover:from-gray-600 hover:to-gray-800 hover:border-gray-500 text-white"
          >
            {step < 3 ? "Continue" : "Create Strategy"}
          </Button>
        </div>
      </div>
    </div>
  )
}
