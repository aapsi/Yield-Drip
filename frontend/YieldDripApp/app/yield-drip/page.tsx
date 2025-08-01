"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Canvas } from "@react-three/fiber"
import { Environment, Float, Text } from "@react-three/drei"
import { YieldDripHeader } from "@/components/yield-drip/header"
import { YieldDripHero } from "@/components/yield-drip/hero-section"
import { YieldDripModal } from "@/components/yield-drip/create-strategy-modal"


export default function YieldDripPage() {
  const router = useRouter()

  const [showCreateModal, setShowCreateModal] = useState(false)

  return (
    <main className="relative w-full min-h-screen bg-[#0B0B0F]">
      {/* 3D Background - Fixed */}
      <div className="fixed inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
          <color attach="background" args={["#0B0B0F"]} />
          <Environment preset="city" />

          <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5} position={[0, 3, 0]}>
            <Text
              fontSize={1.2}
              color="#f8f8f8"
              anchorX="center"
              anchorY="middle"
            >
              Yield Drip
            </Text>
          </Float>
        </Canvas>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <YieldDripHeader />

        {/* Hero Section - Full Height */}
        <section className="min-h-screen flex items-center justify-center">
          <YieldDripHero onCreateStrategy={() => setShowCreateModal(true)} />
        </section>

        {/* Modal */}
        <YieldDripModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            router.push("/yield-drip/strategies")
          }}
        />
      </div>
    </main>
  )
}
