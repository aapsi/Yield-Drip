"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ethers } from "ethers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { 
  Loader2, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Target, 
  CheckCircle,
  AlertCircle,
  Clock,
  Zap
} from "lucide-react"
import { use1inchIntegration } from "@/hooks/use1inchIntegration"
import { useAccount } from "wagmi"

// Form validation schema
const strategySchema = z.object({
  name: z.string().min(1, "Strategy name is required"),
  totalDaiAmount: z.string().min(1, "Total amount is required"),
  periodHours: z.number().min(1, "Period must be at least 1 hour").max(168, "Period cannot exceed 1 week"),
  slicesCount: z.number().min(2, "Must have at least 2 slices").max(24, "Cannot exceed 24 slices"),
  priceFloorWei: z.string().min(1, "Price floor is required"),
})

type StrategyFormData = z.infer<typeof strategySchema>

interface StrategyCreatorEnhancedProps {
  onStrategyCreated: (strategyId: string, orders: any[]) => void
}

export function StrategyCreatorEnhanced({ onStrategyCreated }: StrategyCreatorEnhancedProps) {
  const { address } = useAccount()
  const { 
    isInitialized, 
    isLoading, 
    error, 
    createStrategy, 
    resetError 
  } = use1inchIntegration()

  const [isCreating, setIsCreating] = useState(false)
  const [creationStep, setCreationStep] = useState<'form' | 'creating' | 'success' | 'error'>('form')

  const form = useForm<StrategyFormData>({
    resolver: zodResolver(strategySchema),
    defaultValues: {
      name: "",
      totalDaiAmount: "1000",
      periodHours: 24,
      slicesCount: 6,
      priceFloorWei: ethers.parseEther("1500").toString(), // $1500 ETH price floor
    }
  })

  const onSubmit = async (data: StrategyFormData) => {
    if (!address) {
      form.setError("root", { message: "Please connect your wallet first" })
      return
    }

    if (!isInitialized) {
      form.setError("root", { message: "1inch integration not ready. Please try again." })
      return
    }

    try {
      setIsCreating(true)
      setCreationStep('creating')
      resetError()

      // Calculate timing
      const now = Math.floor(Date.now() / 1000)
      const endTime = now + (data.periodHours * 3600)

      const strategy = {
        name: data.name,
        totalDaiAmount: data.totalDaiAmount,
        periodHours: data.periodHours,
        slicesCount: data.slicesCount,
        priceFloorWei: data.priceFloorWei,
        startTime: now,
        endTime: endTime,
      }

      const result = await createStrategy(strategy)

      if (result) {
        setCreationStep('success')
        onStrategyCreated(result.strategyId, result.orders)
      } else {
        setCreationStep('error')
      }
    } catch (err) {
      console.error('Strategy creation failed:', err)
      setCreationStep('error')
    } finally {
      setIsCreating(false)
    }
  }

  const resetForm = () => {
    form.reset()
    setCreationStep('form')
    resetError()
  }

  // Calculate strategy preview
  const totalAmount = parseFloat(form.watch("totalDaiAmount") || "0")
  const periodHours = form.watch("periodHours") || 0
  const slicesCount = form.watch("slicesCount") || 0
  const priceFloorWei = form.watch("priceFloorWei") || "0"

  const daiPerSlice = totalAmount / slicesCount
  const timePerSlice = periodHours / slicesCount
  const estimatedYield = (totalAmount * 0.05 * periodHours) / (24 * 365) // 5% APR
  const priceFloorEth = ethers.formatEther(priceFloorWei)

  if (creationStep === 'creating') {
    return (
      <Card className="w-full max-w-2xl bg-[#1A1A1F]/80 backdrop-blur-md border-[#2A2A2F] shadow-2xl">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-[#00FFB2] mb-4" />
          <h3 className="text-xl font-semibold text-[#F2F2F2] mb-2 font-mono">Creating Your Strategy</h3>
          <p className="text-[#A6A6A6] text-center font-mono mb-6">
            Building {slicesCount} yield-earning DCA orders...
          </p>
          
          <div className="w-full max-w-md space-y-4">
            <div className="flex justify-between text-sm text-[#A6A6A6]">
              <span>Creating orders...</span>
              <span>{slicesCount} total</span>
            </div>
            <Progress value={50} className="h-2" />
            <p className="text-xs text-[#A6A6A6] text-center">
              This may take a few moments as we sign each order
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (creationStep === 'success') {
    return (
      <Card className="w-full max-w-2xl bg-[#1A1A1F]/80 backdrop-blur-md border-[#2A2A2F] shadow-2xl">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CheckCircle className="h-12 w-12 text-[#00FFB2] mb-4" />
          <h3 className="text-xl font-semibold text-[#F2F2F2] mb-2 font-mono">Strategy Created!</h3>
          <p className="text-[#A6A6A6] text-center font-mono mb-6">
            Your yield-earning DCA strategy is now active
          </p>
          
          <div className="w-full max-w-md space-y-4">
            <div className="bg-[#2A2A2F] rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-[#A6A6A6]">Strategy:</span>
                <span className="text-[#F2F2F2] font-mono">{form.getValues("name")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A6A6A6]">Total Amount:</span>
                <span className="text-[#F2F2F2] font-mono">{totalAmount} DAI</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A6A6A6]">Orders Created:</span>
                <span className="text-[#F2F2F2] font-mono">{slicesCount}</span>
              </div>
            </div>
            
            <Button onClick={resetForm} className="w-full">
              Create Another Strategy
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (creationStep === 'error') {
    return (
      <Card className="w-full max-w-2xl bg-[#1A1A1F]/80 backdrop-blur-md border-[#2A2A2F] shadow-2xl">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-xl font-semibold text-[#F2F2F2] mb-2 font-mono">Creation Failed</h3>
          <p className="text-[#A6A6A6] text-center font-mono mb-6">
            {error || "Failed to create strategy. Please try again."}
          </p>
          
          <div className="space-x-4">
            <Button onClick={resetForm} variant="outline">
              Try Again
            </Button>
            <Button onClick={() => setCreationStep('form')}>
              Edit Strategy
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl bg-[#1A1A1F]/80 backdrop-blur-md border-[#2A2A2F] shadow-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-[#F2F2F2] mb-2 font-mono">
          Create Yield-Earning DCA Strategy
        </CardTitle>
        <CardDescription className="text-[#A6A6A6] font-mono">
          Set up automated DCA with yield accumulation
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Strategy Name */}
          <div>
            <label className="block text-sm font-medium text-[#F2F2F2] mb-2 font-mono">
              Strategy Name
            </label>
            <Input
              placeholder="e.g., ETH Weekly Accumulator"
              {...form.register("name")}
              className="bg-[#2A2A2F] border-[#3A3A3F] text-[#F2F2F2]"
            />
            {form.formState.errors.name && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>

          {/* Total Amount */}
          <div>
            <label className="block text-sm font-medium text-[#F2F2F2] mb-2 font-mono">
              Total DAI Amount
            </label>
            <Input
              type="number"
              step="0.01"
              placeholder="1000"
              {...form.register("totalDaiAmount")}
              className="bg-[#2A2A2F] border-[#3A3A3F] text-[#F2F2F2]"
            />
            {form.formState.errors.totalDaiAmount && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.totalDaiAmount.message}</p>
            )}
          </div>

          {/* Period and Slices */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#F2F2F2] mb-2 font-mono">
                Period (Hours)
              </label>
              <Input
                type="number"
                min="1"
                max="168"
                {...form.register("periodHours", { valueAsNumber: true })}
                className="bg-[#2A2A2F] border-[#3A3A3F] text-[#F2F2F2]"
              />
              {form.formState.errors.periodHours && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.periodHours.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#F2F2F2] mb-2 font-mono">
                Number of Slices
              </label>
              <Input
                type="number"
                min="2"
                max="24"
                {...form.register("slicesCount", { valueAsNumber: true })}
                className="bg-[#2A2A2F] border-[#3A3A3F] text-[#F2F2F2]"
              />
              {form.formState.errors.slicesCount && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.slicesCount.message}</p>
              )}
            </div>
          </div>

          {/* Price Floor */}
          <div>
            <label className="block text-sm font-medium text-[#F2F2F2] mb-2 font-mono">
              ETH Price Floor (USD)
            </label>
            <Input
              type="number"
              step="0.01"
              placeholder="1500"
              value={priceFloorEth}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0
                form.setValue("priceFloorWei", ethers.parseEther(value.toString()).toString())
              }}
              className="bg-[#2A2A2F] border-[#3A3A3F] text-[#F2F2F2]"
            />
            <p className="text-xs text-[#A6A6A6] mt-1">
              Orders will only execute when ETH price is above this level
            </p>
          </div>

          {/* Strategy Preview */}
          <div className="bg-[#2A2A2F] rounded-lg p-4 space-y-3">
            <h4 className="text-sm font-medium text-[#F2F2F2] font-mono">Strategy Preview</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-[#A6A6A6]">DAI per slice:</span>
                <span className="text-[#F2F2F2] font-mono ml-2">{daiPerSlice.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[#A6A6A6]">Time per slice:</span>
                <span className="text-[#F2F2F2] font-mono ml-2">{timePerSlice.toFixed(1)}h</span>
              </div>
              <div>
                <span className="text-[#A6A6A6]">Estimated yield:</span>
                <span className="text-[#00FFB2] font-mono ml-2">+{estimatedYield.toFixed(2)} DAI</span>
              </div>
              <div>
                <span className="text-[#A6A6A6]">Price floor:</span>
                <span className="text-[#F2F2F2] font-mono ml-2">${priceFloorEth}</span>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={!isInitialized || isLoading || isCreating}
            className="w-full"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Strategy...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Create Strategy
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 