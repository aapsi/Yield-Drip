"use client"

interface PortfolioData {
  totalValue: number
  totalValueChange: number
  yieldEarned: number
  yieldEarnedChange: number
  activeStrategies: number
  pendingStrategies: number
  weeklyRate: number
  weeklyRateChange: number
}

interface YieldDripPortfolioProps {
  data: PortfolioData
}

export function YieldDripPortfolio({ data }: YieldDripPortfolioProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Total Value"
        value={`$${data.totalValue.toLocaleString()}`}
        change={`+${data.totalValueChange}%`}
        positive={data.totalValueChange > 0}
      />
      <MetricCard
        title="Yield Earned"
        value={`$${data.yieldEarned.toFixed(2)}`}
        change={`+$${data.yieldEarnedChange}`}
        positive={data.yieldEarnedChange > 0}
      />
      <MetricCard
        title="Strategies"
        value={`${data.activeStrategies} Active`}
        change={`${data.pendingStrategies} Pending`}
        positive={true}
      />
      <MetricCard
        title="Weekly Rate"
        value={`$${data.weeklyRate}`}
        change={`+${data.weeklyRateChange}`}
        positive={data.weeklyRateChange > 0}
      />
    </div>
  )
}

function MetricCard({
  title,
  value,
  change,
  positive,
}: {
  title: string
  value: string
  change: string
  positive: boolean
}) {
  return (
    <div className="bg-gray-900/50 backdrop-blur-md border border-gray-700 rounded-lg p-6 hover:bg-gray-800/50 hover:border-gray-600 transition-all duration-300 hover:-translate-y-1">
      <h3 className="text-sm font-medium text-gray-400 mb-2">{title}</h3>
      <p className="text-2xl font-semibold text-white mb-1">{value}</p>
                      <p className={`text-sm ${positive ? "text-[#00FFB2]" : "text-[#A6A6A6]"}`}>{change}</p>
    </div>
  )
}
