"use client"

import { Button } from "@/components/ui/button"
import { ArrowDown } from "lucide-react"

interface YieldDripHeroProps {
  onCreateStrategy: () => void
}

export function YieldDripHero({ onCreateStrategy }: YieldDripHeroProps) {
  const scrollToCards = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    })
  }

  return (
    <div className="text-center px-4 pt-16">
      <div className="max-w-4xl mx-auto">
        <p className="text-sm text-gray-400 mb-4 uppercase tracking-wider">
          Because your money should work while it waits
        </p>

        <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tight font-mono">
          <span className="text-white">YIELD</span>
          <span className="text-[#00FFB2] ml-4 md:ml-6">DRIP</span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
          Start earning yield on idle DCA funds. While your dollar-cost averaging orders wait for execution, your
          capital earns ~5% APY through yield farming.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button
            onClick={onCreateStrategy}
            size="lg"
            className="bg-gradient-to-r from-gray-700 to-gray-900 border border-gray-600 hover:from-gray-600 hover:to-gray-800 hover:border-gray-500 text-white px-8 py-4 text-lg font-medium transition-all duration-300 hover:scale-105"
          >
            ✨ Create Your Strategy
          </Button>

          <Button
            onClick={scrollToCards}
            size="lg"
            variant="outline"
            className="border-gray-600 text-white hover:bg-gray-900/50 px-8 py-4 text-lg bg-transparent"
          >
            Learn More
          </Button>
        </div>

        {/* Scroll Indicator */}
        <div className="flex flex-col items-center">
          <p className="text-sm text-gray-400 mb-4">Scroll to explore</p>
          <button
            onClick={scrollToCards}
            className="animate-bounce p-2 rounded-full border border-gray-600 hover:border-gray-400 transition-colors"
          >
            <ArrowDown className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  )
}
