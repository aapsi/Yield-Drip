"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, TrendingUp, DollarSign, Calendar, Target } from "lucide-react"

interface CreateStrategyModalProps {
  onSuccess: () => void
  isSubmitting: boolean
}

export function CreateStrategyModal({ onSuccess, isSubmitting }: CreateStrategyModalProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    strategyName: "",
    totalAmount: 1000,
    weeklyAmount: 100,
    targetAsset: "ETH",
    duration: 10,
    riskLevel: "moderate",
    yieldPreference: "balanced",
  })

  const totalSteps = 4
  const progress = (step / totalSteps) * 100

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      onSuccess()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const idleFunds = formData.totalAmount - formData.weeklyAmount
  const estimatedYield = (idleFunds * 0.05 * formData.duration) / 52
  const totalInvestment = formData.weeklyAmount * formData.duration

  if (isSubmitting) {
    return (
      <Card className="w-full max-w-md bg-[#1A1A1F]/80 backdrop-blur-md border-[#2A2A2F] shadow-2xl">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-[#00FFB2] mb-4" />
          <h3 className="text-xl font-semibold text-[#F2F2F2] mb-2 font-mono">Creating Your Strategy</h3>
          <p className="text-[#A6A6A6] text-center font-mono">Setting up your yield-earning DCA strategy...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl bg-[#1A1A1F]/80 backdrop-blur-md border-[#2A2A2F] shadow-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-[#F2F2F2] mb-2 font-mono">Create Your Strategy</CardTitle>
        <CardDescription className="text-[#A6A6A6] font-mono">
          Set up a DCA strategy that earns yield while your money waits
        </CardDescription>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-[#A6A6A6] mb-2 font-mono">
            <span>
              Step {step} of {totalSteps}
            </span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-[#2A2A2F] rounded-full h-2 backdrop-blur-sm">
            <div
              className="bg-gradient-to-r from-[#00D1FF] to-[#00FFB2] h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <TrendingUp className="h-12 w-12 text-[#00FFB2] mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-[#F2F2F2] mb-2 font-mono">Strategy Basics</h3>
              <p className="text-[#A6A6A6] font-mono">Let's start with the fundamentals</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#F2F2F2] mb-2 font-mono">Strategy Name</label>
              <Input
                placeholder="e.g., ETH Weekly Accumulator"
                value={formData.strategyName}
                onChange={(e) => setFormData({ ...formData, strategyName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#F2F2F2] mb-2 font-mono">Target Asset</label>
              <Select
                value={formData.targetAsset}
                onValueChange={(value) => setFormData({ ...formData, targetAsset: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ETH">🔷 Ethereum (ETH)</SelectItem>
                  <SelectItem value="BTC">₿ Bitcoin (BTC)</SelectItem>
                  <SelectItem value="LINK">🔗 Chainlink (LINK)</SelectItem>
                  <SelectItem value="SOL">☀️ Solana (SOL)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#F2F2F2] mb-2 font-mono">Risk Level</label>
              <div className="grid grid-cols-3 gap-3">
                {["conservative", "moderate", "aggressive"].map((level) => (
                  <button
                    key={level}
                    onClick={() => setFormData({ ...formData, riskLevel: level })}
                    className={`p-3 rounded-xl border transition-all duration-200 font-mono ${
                      formData.riskLevel === level
                        ? "border-[#00FFB2] bg-[#00FFB2]/10 text-[#00FFB2]"
                        : "border-[#2A2A2F] bg-[#1A1A1F]/50 text-[#A6A6A6] hover:border-[#00D1FF]"
                    }`}
                  >
                    <div className="text-sm font-medium capitalize">{level}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <DollarSign className="h-12 w-12 text-[#00FFB2] mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-[#F2F2F2] mb-2 font-mono">Investment Amounts</h3>
              <p className="text-[#A6A6A6] font-mono">How much should work for you?</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#F2F2F2] mb-2 font-mono">
                Total Working Capital: ${formData.totalAmount.toLocaleString()}
              </label>
              <Slider
                value={[formData.totalAmount]}
                onValueChange={(value) => setFormData({ ...formData, totalAmount: value[0] })}
                max={10000}
                min={100}
                step={100}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-[#A6A6A6] mt-1 font-mono">
                <span>$100</span>
                <span>$10,000</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#F2F2F2] mb-2 font-mono">
                Weekly DCA Amount: ${formData.weeklyAmount}
              </label>
              <Slider
                value={[formData.weeklyAmount]}
                onValueChange={(value) => setFormData({ ...formData, weeklyAmount: value[0] })}
                max={Math.min(500, formData.totalAmount)}
                min={10}
                step={10}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-[#A6A6A6] mt-1 font-mono">
                <span>$10</span>
                <span>${Math.min(500, formData.totalAmount)}</span>
              </div>
            </div>

            <div className="bg-[#1A1A1F]/50 border border-[#2A2A2F] rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-[#00FFB2]">💰</span>
                <span className="text-[#00FFB2] font-medium font-mono">Idle Funds Working</span>
              </div>
              <p className="text-[#F2F2F2] text-sm font-mono">
                ${idleFunds.toLocaleString()} will earn yield while waiting for DCA execution
              </p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Calendar className="h-12 w-12 text-[#00FFB2] mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-white mb-2">Timeline & Yield</h3>
              <p className="text-gray-400">Configure duration and yield preferences</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Duration: {formData.duration} weeks</label>
              <Slider
                value={[formData.duration]}
                onValueChange={(value) => setFormData({ ...formData, duration: value[0] })}
                max={52}
                min={4}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>4 weeks</span>
                <span>52 weeks</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#F2F2F2] mb-2 font-mono">Yield Preference</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: "conservative", label: "Conservative", desc: "3-4% APY" },
                  { key: "balanced", label: "Balanced", desc: "4-6% APY" },
                  { key: "aggressive", label: "Aggressive", desc: "6-8% APY" },
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() => setFormData({ ...formData, yieldPreference: option.key })}
                    className={`p-3 rounded-xl border transition-all duration-200 font-mono ${
                      formData.yieldPreference === option.key
                        ? "border-[#00FFB2] bg-[#00FFB2]/10 text-[#00FFB2]"
                        : "border-[#2A2A2F] bg-[#1A1A1F]/50 text-[#A6A6A6] hover:border-[#00D1FF]"
                    }`}
                  >
                    <div className="text-sm font-medium">{option.label}</div>
                    <div className="text-xs opacity-70">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#1A1A1F]/50 rounded-xl p-4 border border-[#2A2A2F]">
                <div className="text-[#A6A6A6] text-sm font-mono">Total Investment</div>
                <div className="text-[#F2F2F2] font-semibold font-mono">${totalInvestment.toLocaleString()}</div>
              </div>
              <div className="bg-[#1A1A1F]/50 rounded-xl p-4 border border-[#2A2A2F]">
                <div className="text-[#A6A6A6] text-sm font-mono">Expected Yield</div>
                <div className="text-[#00FFB2] font-semibold font-mono">~${estimatedYield.toFixed(2)}</div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Target className="h-12 w-12 text-[#00FFB2] mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-[#F2F2F2] mb-2 font-mono">Review & Confirm</h3>
              <p className="text-[#A6A6A6] font-mono">Double-check your strategy details</p>
            </div>

            <div className="bg-[#1A1A1F]/50 rounded-xl p-6 border border-[#2A2A2F] space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[#A6A6A6] font-mono">Strategy Name</span>
                <span className="text-[#F2F2F2] font-medium font-mono">{formData.strategyName || "Unnamed Strategy"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#A6A6A6] font-mono">Target Asset</span>
                <Badge variant="secondary">{formData.targetAsset}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#A6A6A6] font-mono">Working Capital</span>
                <span className="text-[#F2F2F2] font-medium font-mono">${formData.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#A6A6A6] font-mono">Weekly DCA</span>
                <span className="text-[#F2F2F2] font-medium font-mono">${formData.weeklyAmount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#A6A6A6] font-mono">Duration</span>
                <span className="text-[#F2F2F2] font-medium font-mono">{formData.duration} weeks</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#A6A6A6] font-mono">Risk Level</span>
                <Badge variant="outline" className="capitalize">
                  {formData.riskLevel}
                </Badge>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#1A1A1F]/50 to-[#00FFB2]/10 border border-[#2A2A2F] rounded-xl p-4">
              <div className="text-center">
                <div className="text-[#00FFB2] font-semibold text-lg mb-1 font-mono">
                  Expected Total Yield: ~${estimatedYield.toFixed(2)}
                </div>
                <div className="text-[#F2F2F2] text-sm font-mono">
                  vs Traditional DCA: +${estimatedYield.toFixed(2)} extra earnings
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={handleBack} disabled={step === 1} className="px-6 border-[#00D1FF]/30 text-[#00D1FF] hover:bg-[#00D1FF]/10 hover:border-[#00D1FF]/50 bg-[#1A1A1F]/40 backdrop-blur-md transition-all duration-300 shadow-lg shadow-[#0B0B0F]/50">
            Back
          </Button>
          <Button onClick={handleNext} variant="primary" className="px-6 bg-[#1A1A1F]/40 backdrop-blur-md border border-[#00D1FF]/30 text-[#00D1FF] hover:bg-[#00D1FF]/10 hover:border-[#00D1FF]/50 transition-all duration-300 shadow-lg shadow-[#0B0B0F]/50">
            {step === totalSteps ? "Create Strategy" : "Continue"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
