"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { YieldDripHeader } from "@/components/yield-drip/header"
import { Button } from "@/components/ui/button"

export default function YieldDripActivity() {
  const router = useRouter()

  const activities = [
    {
      type: "DCA Executed",
      description: "Bought 0.041 ETH for $100 USDC",
      strategy: "ETH Strategy",
      time: "2 hours ago",
      amount: "$100.00",
      status: "success",
    },
    {
      type: "Yield Earned",
      description: "Daily sDAI yield earned",
      time: "6 hours ago",
      amount: "$0.38",
      status: "success",
    },
    {
      type: "Strategy Created",
      description: "LINK DCA: $75 weekly for 12 weeks",
      strategy: "LINK Strategy",
      time: "1 day ago",
      amount: "$900.00",
      status: "success",
    },
    {
      type: "Yield Compounded",
      description: "Weekly yield automatically compounded",
      time: "2 days ago",
      amount: "$2.45",
      status: "success",
    },
    {
      type: "DCA Executed",
      description: "Bought 0.0012 BTC for $50 USDC",
      strategy: "BTC Strategy",
      time: "3 days ago",
      amount: "$50.00",
      status: "success",
    },
    {
      type: "Strategy Paused",
      description: "LINK Strategy paused by user",
      strategy: "LINK Strategy",
      time: "4 days ago",
      status: "warning",
    },
    {
      type: "Yield Earned",
      description: "Daily sDAI yield earned",
      time: "1 week ago",
      amount: "$0.35",
      status: "success",
    },
  ]

  return (
    <main className="min-h-screen bg-black">
      {/* Header */}
      <YieldDripHeader currentPage="activity" />

      {/* Activity Content */}
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Recent Activity</h1>
            <p className="text-gray-400">Track all your DCA executions, yield earnings, and strategy changes</p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-md border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Activity Feed</h2>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-400 hover:text-white hover:border-gray-500 bg-transparent"
                >
                  Filter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-400 hover:text-white hover:border-gray-500 bg-transparent"
                >
                  Export
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between p-4 rounded-lg hover:bg-gray-800/50 transition-colors border border-gray-700/50"
                >
                  <div className="flex items-start space-x-4">
                    <div
                      className={`w-3 h-3 rounded-full mt-2 ${
                        activity.status === "success"
                          ? "bg-[#00FFB2]"
                          : activity.status === "warning"
                            ? "bg-[#FFB000]"
                            : "bg-[#2A2A2F]"
                      }`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-white">{activity.type}</h3>
                        {activity.strategy && <span className="text-gray-300 text-sm">• {activity.strategy}</span>}
                        <span className="text-gray-400 text-sm">• {activity.time}</span>
                      </div>
                      <p className="text-gray-400 text-sm">{activity.description}</p>
                    </div>
                  </div>
                  {activity.amount && (
                    <div className="text-right">
                      <p
                        className={`font-medium ${
                          activity.type.includes("Yield") || activity.type.includes("Compound")
                            ? "text-[#00FFB2]"
                            : "text-white"
                        }`}
                      >
                        {activity.amount}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <Button
                variant="outline"
                className="border-gray-600 text-gray-400 hover:text-white hover:border-gray-500 bg-transparent"
              >
                Load More Activity
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
