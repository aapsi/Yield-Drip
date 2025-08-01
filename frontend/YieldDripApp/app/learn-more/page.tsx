"use client"

import { useRouter } from "next/navigation"
import { Canvas } from "@react-three/fiber"
import { Environment, Float, Text } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Shield, TrendingUp, Clock, Zap, Target, AlertTriangle, BarChart3, Lock, HelpCircle } from "lucide-react"

export default function LearnMorePage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-[#0B0B0F]">
      {/* 3D Background */}
      <div className="fixed inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
          <color attach="background" args={["#0B0B0F"]} />
          <Environment preset="city" />
        </Canvas>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-[#2A2A2F] backdrop-blur-md bg-[#0B0B0F]/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => router.push("/")}
                  variant="ghost"
                  className="text-[#A6A6A6] hover:text-[#00D1FF] hover:bg-[#00D1FF]/10"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">💧</span>
                  <div>
                    <h1 className="text-xl font-bold text-[#F2F2F2]">
                      Yield <span className="text-[#00FFB2]">Drip</span>
                    </h1>
                    <p className="text-xs text-[#A6A6A6] -mt-1 font-mono">Help & Documentation</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="bg-[#00FFB2]/10 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <HelpCircle className="h-10 w-10 text-[#00FFB2]" />
            </div>
            <h1 className="text-4xl font-bold text-[#F2F2F2] mb-4">
              Yield-Drip <span className="text-[#00FFB2]">Help Guide</span>
            </h1>
            <p className="text-lg text-[#A6A6A6] max-w-2xl mx-auto">
              Learn how to earn yield while dollar-cost averaging with our innovative TWAP strategy
            </p>
          </div>

          {/* What is Yield-Shielded TWAP */}
          <div className="mb-16">
            <div className="bg-[#1A1A1F]/80 backdrop-blur-md border border-[#2A2A2F] rounded-2xl p-8">
              <div className="flex items-center mb-6">
                <div className="bg-[#00FFB2]/10 p-3 rounded-full mr-4">
                  <Target className="h-6 w-6 text-[#00FFB2]" />
                </div>
                <h2 className="text-2xl font-bold text-[#F2F2F2]">🎯 What is Yield-Shielded TWAP?</h2>
              </div>
              <p className="text-[#A6A6A6] text-lg leading-relaxed">
                <span className="text-[#00FFB2] font-semibold">"Earn while you DCA"</span> - Your DAI earns sDAI yield while waiting for scheduled ETH purchases. 
                Instead of cash sitting idle, it generates returns until each buy executes.
              </p>
            </div>
          </div>

          {/* Key Concepts */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-[#F2F2F2] mb-8 text-center">💡 Key Concepts</h2>
            <div className="space-y-6">
              <div className="bg-[#1A1A1F]/80 backdrop-blur-md border border-[#2A2A2F] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-[#F2F2F2] mb-3">TWAP (Time-Weighted Average Price)</h3>
                <ul className="text-[#A6A6A6] text-sm space-y-2">
                  <li>• Splits your total purchase into smaller, time-distributed slices</li>
                  <li>• Example: $1000 over 10 days = $100 per day</li>
                  <li>• Reduces impact of price volatility vs. lump-sum buying</li>
                </ul>
              </div>
              
              <div className="bg-[#1A1A1F]/80 backdrop-blur-md border border-[#2A2A2F] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-[#F2F2F2] mb-3">Yield Shield</h3>
                <ul className="text-[#A6A6A6] text-sm space-y-2">
                  <li>• Unexecuted DAI automatically deposits into sDAI (Savings DAI)</li>
                  <li>• Earns ~5% APY while waiting for your scheduled buys</li>
                  <li>• Withdrawn just-in-time when each slice executes</li>
                </ul>
              </div>
              
              <div className="bg-[#1A1A1F]/80 backdrop-blur-md border border-[#2A2A2F] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-[#F2F2F2] mb-3">Atomic Execution</h3>
                <ul className="text-[#A6A6A6] text-sm space-y-2">
                  <li>• Each slice is guaranteed: deposit → buy → withdraw in one transaction</li>
                  <li>• No risk of funds getting stuck between steps</li>
                  <li>• Either the full slice succeeds or nothing happens</li>
                </ul>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-[#F2F2F2] mb-8 text-center">🔧 How It Works</h2>
            <div className="bg-[#1A1A1F]/80 backdrop-blur-md border border-[#2A2A2F] rounded-2xl p-8">
              <div className="space-y-6">
                {[
                  "Set Strategy: Choose total amount, duration, and target asset",
                  "Auto-Deposit: Your DAI immediately starts earning sDAI yield", 
                  "Scheduled Buys: Each slice executes at predetermined times",
                  "Just-in-Time: DAI withdrawn from sDAI exactly when needed",
                  "Receive Assets: Get your target tokens + earned yield on remaining balance"
                ].map((step, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="bg-[#00FFB2] text-[#0B0B0F] rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <p className="text-[#A6A6A6] flex-1">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Setup Parameters */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-[#F2F2F2] mb-8 text-center">⚙️ Setup Parameters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: "Total Amount",
                  description: "Amount of DAI to dollar-cost-average (e.g., 1000 DAI)"
                },
                {
                  title: "Duration", 
                  description: "Time period to spread purchases (e.g., 30 days)"
                },
                {
                  title: "Slices",
                  description: "Number of individual purchases (e.g., 10 slices = 100 DAI every 3 days)"
                },
                {
                  title: "Target Asset",
                  description: "What you're buying (ETH, WBTC, etc.)"
                }
              ].map((param, index) => (
                <div key={index} className="bg-[#1A1A1F]/80 backdrop-blur-md border border-[#2A2A2F] rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-[#F2F2F2] mb-3">{param.title}</h3>
                  <p className="text-[#A6A6A6] text-sm leading-relaxed">{param.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-[#F2F2F2] mb-8 text-center">💰 Benefits</h2>
            <div className="space-y-6">
              <div className="bg-[#1A1A1F]/80 backdrop-blur-md border border-[#2A2A2F] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-[#F2F2F2] mb-3">Earn Extra Yield</h3>
                <ul className="text-[#A6A6A6] text-sm space-y-2">
                  <li>• Traditional DCA: 0% on idle cash</li>
                  <li>• Yield-Shielded: ~5% APY on unexecuted portions</li>
                </ul>
              </div>
              
              <div className="bg-[#1A1A1F]/80 backdrop-blur-md border border-[#2A2A2F] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-[#F2F2F2] mb-3">Reduce Volatility</h3>
                <ul className="text-[#A6A6A6] text-sm space-y-2">
                  <li>• Time-distribution smooths price impact</li>
                  <li>• Better average entry price vs. lump-sum</li>
                </ul>
              </div>
              
              <div className="bg-[#1A1A1F]/80 backdrop-blur-md border border-[#2A2A2F] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-[#F2F2F2] mb-3">No Downside</h3>
                <ul className="text-[#A6A6A6] text-sm space-y-2">
                  <li>• Same DCA execution as normal</li>
                  <li>• Plus extra yield on waiting funds</li>
                  <li>• Zero additional risk</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Safety Features */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-[#F2F2F2] mb-8 text-center">🛡️ Safety Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  icon: <Lock className="h-5 w-5" />,
                  title: "Non-Custodial",
                  description: "You maintain full control of funds through smart contracts"
                },
                {
                  icon: <Shield className="h-5 w-5" />,
                  title: "Immutable Orders",
                  description: "Each slice is a cryptographically signed limit order"
                },
                {
                  icon: <Zap className="h-5 w-5" />,
                  title: "Atomic Execution",
                  description: "Impossible for funds to get stuck between deposit/withdraw"
                },
                {
                  icon: <BarChart3 className="h-5 w-5" />,
                  title: "Open Source",
                  description: "All contract code is publicly verifiable"
                }
              ].map((feature, index) => (
                <div key={index} className="bg-[#1A1A1F]/80 backdrop-blur-md border border-[#2A2A2F] rounded-xl p-6">
                  <div className="text-[#00FFB2] mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-semibold text-[#F2F2F2] mb-3">{feature.title}</h3>
                  <p className="text-[#A6A6A6] text-sm leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Important Notes */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-[#F2F2F2] mb-8 text-center">⚠️ Important Notes</h2>
            <div className="bg-[#1A1A1F]/80 backdrop-blur-md border border-[#FFB000]/30 rounded-2xl p-8">
              <div className="space-y-6">
                {[
                  {
                    title: "Gas Costs",
                    description: "Each slice is a separate transaction with gas fees. Factor this into smaller strategies."
                  },
                  {
                    title: "Partial Fills", 
                    description: "Individual slices may not fill if market conditions change dramatically. Remaining funds stay yield-earning."
                  },
                  {
                    title: "Timing",
                    description: "Slices execute based on blockchain time, not calendar time. Expect some variation."
                  },
                  {
                    title: "Yield Fluctuation",
                    description: "sDAI yield rates can change. Current rates shown are estimates."
                  }
                ].map((note, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <AlertTriangle className="h-5 w-5 text-[#FFB000] mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-[#F2F2F2] mb-1">{note.title}</h4>
                      <p className="text-[#A6A6A6] text-sm">{note.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Monitoring */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-[#F2F2F2] mb-8 text-center">📊 Monitoring Your Strategy</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: "Active Slices",
                  description: "Shows pending orders and their execution times"
                },
                {
                  title: "Yield Earned",
                  description: "Real-time tracking of sDAI returns on unexecuted portions"
                },
                {
                  title: "Execution History",
                  description: "Completed purchases with prices and amounts"
                },
                {
                  title: "Remaining Balance",
                  description: "DAI still earning yield awaiting future slices"
                }
              ].map((item, index) => (
                <div key={index} className="bg-[#1A1A1F]/80 backdrop-blur-md border border-[#2A2A2F] rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-[#F2F2F2] mb-3">{item.title}</h3>
                  <p className="text-[#A6A6A6] text-sm leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button
              onClick={() => router.push("/create-strategy")}
              className="bg-[#00FFB2] text-[#0B0B0F] hover:bg-[#00FFB2]/90 px-8 py-4 text-lg rounded-2xl font-semibold transition-all duration-300 hover:scale-105"
            >
              Start Your First Strategy
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
