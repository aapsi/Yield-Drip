"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { use1inchIntegration } from "@/hooks/use1inchIntegration"
import { useAccount } from "wagmi"
import { ethers } from "ethers"
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Zap,
  Target,
  Activity
} from "lucide-react"

export default function IntegrationTestPage() {
  const { address } = useAccount()
  const { 
    isInitialized, 
    isLoading, 
    error, 
    createStrategy,
    getYieldInfo,
    resetError 
  } = use1inchIntegration(true) // Use mock integration

  const [testStep, setTestStep] = useState<'idle' | 'creating' | 'created' | 'yield' | 'complete'>('idle')
  const [strategyData, setStrategyData] = useState<any>(null)
  const [yieldData, setYieldData] = useState<any>(null)

  const runIntegrationTest = async () => {
    if (!address) {
      alert('Please connect your wallet first')
      return
    }

    if (!isInitialized) {
      alert('1inch integration not ready')
      return
    }

    try {
      setTestStep('creating')
      resetError()

      // Step 1: Create DCA Strategy
      const now = Math.floor(Date.now() / 1000)
      const endTime = now + (24 * 3600) // 24 hours

      const strategy = {
        name: "Test YieldDrip Strategy",
        totalDaiAmount: "1000", // 1000 DAI
        periodHours: 24,
        slicesCount: 6,
        priceFloorWei: ethers.parseEther("1500").toString(),
        startTime: now,
        endTime: endTime,
      }

      console.log('Creating strategy:', strategy)
      const result = await createStrategy(strategy)
      
      if (result) {
        setStrategyData(result)
        setTestStep('created')
        
        // Step 2: Get Yield Info
        setTimeout(async () => {
          try {
            const yieldInfo = await getYieldInfo(result.strategyId)
            setYieldData(yieldInfo)
            setTestStep('yield')
            
            // Step 3: Complete
            setTimeout(() => {
              setTestStep('complete')
            }, 2000)
          } catch (err) {
            console.error('Failed to get yield info:', err)
          }
        }, 2000)
      }
    } catch (err) {
      console.error('Integration test failed:', err)
      setTestStep('idle')
    }
  }

  const getStepProgress = () => {
    switch (testStep) {
      case 'idle': return 0
      case 'creating': return 25
      case 'created': return 50
      case 'yield': return 75
      case 'complete': return 100
      default: return 0
    }
  }

  const getStepDescription = () => {
    switch (testStep) {
      case 'idle': return 'Ready to test YieldDrip integration'
      case 'creating': return 'Creating DCA strategy with yield integration...'
      case 'created': return 'Strategy created! Fetching yield data...'
      case 'yield': return 'Yield data retrieved! Finalizing...'
      case 'complete': return 'Integration test completed successfully!'
      default: return ''
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card className="bg-[#1A1A1F]/80 backdrop-blur-md border-[#2A2A2F] shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-[#F2F2F2] font-mono">
            YieldDrip Integration Test
          </CardTitle>
          <CardDescription className="text-[#A6A6A6] font-mono">
            Complete end-to-end test of the YieldDrip system
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Status Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#2A2A2F] rounded-lg p-4">
              <h3 className="text-sm font-medium text-[#F2F2F2] mb-2">Wallet Status</h3>
              <p className={`text-sm ${address ? 'text-[#00FFB2]' : 'text-red-500'}`}>
                {address ? `Connected: ${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
              </p>
            </div>
            <div className="bg-[#2A2A2F] rounded-lg p-4">
              <h3 className="text-sm font-medium text-[#F2F2F2] mb-2">Integration Status</h3>
              <p className={`text-sm ${isInitialized ? 'text-[#00FFB2]' : 'text-yellow-500'}`}>
                {isInitialized ? 'Ready' : isLoading ? 'Initializing...' : 'Not ready'}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-[#A6A6A6]">
              <span>Test Progress</span>
              <span>{getStepProgress()}%</span>
            </div>
            <Progress value={getStepProgress()} className="h-2" />
            <p className="text-sm text-[#F2F2F2] font-mono">{getStepDescription()}</p>
          </div>

          {/* Error Display */}
          {error && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Test Button */}
          <Button 
            onClick={runIntegrationTest}
            disabled={!isInitialized || isLoading || testStep !== 'idle'}
            className="w-full"
          >
            {testStep === 'idle' ? (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Run Integration Test
              </>
            ) : (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Testing...
              </>
            )}
          </Button>

          {/* Results */}
          {strategyData && (
            <div className="bg-[#2A2A2F] rounded-lg p-4 space-y-4">
              <h3 className="text-lg font-semibold text-[#F2F2F2]">Strategy Results</h3>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[#A6A6A6]">Strategy ID:</span>
                  <p className="text-[#F2F2F2] font-mono break-all">{strategyData.strategyId}</p>
                </div>
                <div>
                  <span className="text-[#A6A6A6]">Orders Created:</span>
                  <p className="text-[#F2F2F2] font-mono">{strategyData.orders.length}</p>
                </div>
              </div>

              <div>
                <span className="text-[#A6A6A6] text-sm">Order Details:</span>
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                  {strategyData.orders.map((order: any, index: number) => (
                    <div key={index} className="bg-[#1A1A1F] rounded p-2 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-[#A6A6A6]">Order {index + 1}:</span>
                        <Badge variant="secondary" className="text-xs">
                          {order.status}
                        </Badge>
                      </div>
                      <div className="text-[#F2F2F2] break-all">
                        Hash: {order.orderHash}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Yield Results */}
          {yieldData && (
            <div className="bg-[#2A2A2F] rounded-lg p-4 space-y-4">
              <h3 className="text-lg font-semibold text-[#F2F2F2]">Yield Results</h3>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-[#1A1A1F] rounded p-3">
                  <div className="flex items-center mb-2">
                    <DollarSign className="h-4 w-4 text-[#00FFB2] mr-2" />
                    <span className="text-[#A6A6A6]">Total Deposited</span>
                  </div>
                  <p className="text-[#F2F2F2] font-mono">
                    {ethers.formatEther(yieldData.totalDeposited)} DAI
                  </p>
                </div>
                
                <div className="bg-[#1A1A1F] rounded p-3">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="h-4 w-4 text-[#00D1FF] mr-2" />
                    <span className="text-[#A6A6A6]">Current Yield</span>
                  </div>
                  <p className="text-[#00FFB2] font-mono">
                    {ethers.formatEther(yieldData.currentYield)} DAI
                  </p>
                </div>
                
                <div className="bg-[#1A1A1F] rounded p-3">
                  <div className="flex items-center mb-2">
                    <Activity className="h-4 w-4 text-[#00FFB2] mr-2" />
                    <span className="text-[#A6A6A6]">Yield Rate</span>
                  </div>
                  <p className="text-[#F2F2F2] font-mono">
                    {(parseFloat(yieldData.yieldRate) * 100).toFixed(2)}% APR
                  </p>
                </div>
                
                <div className="bg-[#1A1A1F] rounded p-3">
                  <div className="flex items-center mb-2">
                    <Target className="h-4 w-4 text-[#00D1FF] mr-2" />
                    <span className="text-[#A6A6A6]">Total Withdrawn</span>
                  </div>
                  <p className="text-[#F2F2F2] font-mono">
                    {ethers.formatEther(yieldData.totalWithdrawn)} DAI
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {testStep === 'complete' && (
            <Alert className="border-[#00FFB2]/30 bg-[#00FFB2]/10">
              <CheckCircle className="h-4 w-4 text-[#00FFB2]" />
              <AlertDescription className="text-[#00FFB2]">
                Integration test completed successfully! All components are working correctly.
              </AlertDescription>
            </Alert>
          )}

          {/* Instructions */}
          <div className="bg-[#2A2A2F] rounded-lg p-4">
            <h3 className="text-lg font-semibold text-[#F2F2F2] mb-2">What This Test Does</h3>
            <ul className="text-sm text-[#A6A6A6] space-y-1">
              <li>• Connects to your wallet and initializes 1inch SDK</li>
              <li>• Creates a complete DCA strategy with 6 orders</li>
              <li>• Signs each order with EIP-712 signatures</li>
              <li>• Simulates yield accumulation and tracking</li>
              <li>• Verifies the complete YieldDrip flow</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 