"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Canvas } from "@react-three/fiber"
import { Environment } from "@react-three/drei"
import { CreateStrategyModal } from "@/components/create-strategy-form"
import { RotatingDots } from "@/components/rotating-dots"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function CreateStrategyPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSuccess = () => {
    setIsSubmitting(true)
    // Simulate strategy creation
    setTimeout(() => {
      router.push("/yield-drip/strategies")
    }, 2000)
  }

  return (
    <main className="relative w-full min-h-screen bg-[#0B0B0F] overflow-hidden">
      {/* 3D Background with Rotating Dots */}
      <div className="fixed inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
          <color attach="background" args={["#0B0B0F"]} />
          <Environment preset="city" />
          <RotatingDots />
        </Canvas>
      </div>

      {/* Back Button */}
      <Button
        variant="ghost"
        className="absolute top-6 left-6 z-20 text-[#F2F2F2] hover:text-[#00D1FF] font-mono"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {/* Strategy Creation Modal */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <CreateStrategyModal onSuccess={handleSuccess} isSubmitting={isSubmitting} />
      </div>
    </main>
  )
}
