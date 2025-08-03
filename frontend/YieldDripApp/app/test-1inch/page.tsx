"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { use1inchIntegration } from "@/hooks/use1inchIntegration"
import { useAccount } from "wagmi"
import { ethers } from "ethers"

export default function Test1inchPage() {
  const { address } = useAccount()
  const { 
    isInitialized, 
    isLoading, 
    error, 
    createStrategy, 
    resetError 
  } = use1inchIntegration(true) // Use mock integration for testing

  const [testResult, setTestResult] = useState<any>(null)
  const [isTesting, setIsTesting] = useState(false)

  const runTest = async () => {
    if (!address) {
      alert('Please connect your wallet first')
      return
    }

    if (!isInitialized) {
      alert('1inch integration not ready')
      return
    }

    try {
      setIsTesting(true)
      resetError()

      const now = Math.floor(Date.now() / 1000)
      const endTime = now + (24 * 3600) // 24 hours

      const strategy = {
        name: "Test Strategy",
        totalDaiAmount: "100", // 100 DAI
        periodHours: 24,
        slicesCount: 6,
        priceFloorWei: ethers.parseEther("1500").toString(),
        startTime: now,
        endTime: endTime,
      }

      const result = await createStrategy(strategy)
      setTestResult(result)
    } catch (err) {
      console.error('Test failed:', err)
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card className="bg-[#1A1A1F]/80 backdrop-blur-md border-[#2A2A2F] shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-[#F2F2F2] font-mono">
            1inch Integration Test (Mock Mode)
          </CardTitle>
          <CardDescription className="text-[#A6A6A6] font-mono">
            Test the 1inch SDK integration for YieldDrip using mock data
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#2A2A2F] rounded-lg p-4">
              <h3 className="text-sm font-medium text-[#F2F2F2] mb-2">Wallet Status</h3>
              <p className={`text-sm ${address ? 'text-[#00FFB2]' : 'text-red-500'}`}>
                {address ? `Connected: ${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
              </p>
            </div>
            <div className="bg-[#2A2A2F] rounded-lg p-4">
              <h3 className="text-sm font-medium text-[#F2F2F2] mb-2">1inch Integration</h3>
              <p className={`text-sm ${isInitialized ? 'text-[#00FFB2]' : 'text-yellow-500'}`}>
                {isInitialized ? 'Ready' : isLoading ? 'Initializing...' : 'Not ready'}
              </p>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Test Button */}
          <Button 
            onClick={runTest}
            disabled={!isInitialized || isLoading || isTesting}
            className="w-full"
          >
            {isTesting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Testing 1inch Integration...
              </>
            ) : (
              'Run 1inch Integration Test'
            )}
          </Button>

          {/* Test Results */}
          {testResult && (
            <div className="bg-[#2A2A2F] rounded-lg p-4 space-y-4">
              <h3 className="text-lg font-semibold text-[#F2F2F2]">Test Results</h3>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[#A6A6A6]">Strategy ID:</span>
                  <p className="text-[#F2F2F2] font-mono break-all">{testResult.strategyId}</p>
                </div>
                <div>
                  <span className="text-[#A6A6A6]">Orders Created:</span>
                  <p className="text-[#F2F2F2] font-mono">{testResult.orders.length}</p>
                </div>
              </div>

              <div>
                <span className="text-[#A6A6A6] text-sm">Order Details:</span>
                <div className="mt-2 space-y-2">
                  {testResult.orders.map((order: any, index: number) => (
                    <div key={index} className="bg-[#1A1A1F] rounded p-2 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-[#A6A6A6]">Order {index + 1}:</span>
                        <span className="text-[#00FFB2]">{order.status}</span>
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

          {/* Instructions */}
          <div className="bg-[#2A2A2F] rounded-lg p-4">
            <h3 className="text-lg font-semibold text-[#F2F2F2] mb-2">What This Test Does</h3>
            <ul className="text-sm text-[#A6A6A6] space-y-1">
              <li>• Connects to your wallet and initializes 1inch SDK</li>
              <li>• Creates a test DCA strategy with 6 orders</li>
              <li>• Signs each order with EIP-712</li>
              <li>• Returns strategy ID and order hashes</li>
              <li>• Verifies the integration is working correctly</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 