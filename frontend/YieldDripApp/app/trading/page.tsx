"use client"

import { useRouter } from "next/navigation"
import { Canvas } from "@react-three/fiber"
import { Environment, Float, Text } from "@react-three/drei"
import { Navigation } from "@/components/navigation"
import { TradingDashboard } from "@/components/trading-dashboard"

export default function TradingPage() {
  const router = useRouter()

  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#0B0B0F]">
      <div className="absolute inset-0 z-10">
        <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
          <color attach="background" args={["#0B0B0F"]} />
          <Environment preset="city" />

          <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5} position={[0, 3, 0]}>
            <Text
              fontSize={1.2}
              color="#14b8a6"
              anchorX="center"
              anchorY="middle"
            >
              Trading Dashboard
            </Text>
          </Float>
        </Canvas>
      </div>

      <Navigation />

      <div className="absolute inset-0 z-20 flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-6xl pointer-events-auto">
          <TradingDashboard />
        </div>
      </div>
    </main>
  )
}
