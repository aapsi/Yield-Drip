"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import type { Group } from "three"

export function RotatingDots() {
  const groupRef = useRef<Group>(null)
  const innerGroupRef = useRef<Group>(null)
  const outerGroupRef = useRef<Group>(null)

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.1
    }
    if (innerGroupRef.current) {
      innerGroupRef.current.rotation.y = clock.getElapsedTime() * 0.15
      innerGroupRef.current.rotation.x = clock.getElapsedTime() * 0.05
    }
    if (outerGroupRef.current) {
      outerGroupRef.current.rotation.y = -clock.getElapsedTime() * 0.08
      outerGroupRef.current.rotation.z = clock.getElapsedTime() * 0.03
    }
  })

  // Create inner ring of dots
  const innerDots = []
  const innerRadius = 4
  const innerCount = 12
  for (let i = 0; i < innerCount; i++) {
    const angle = (i / innerCount) * Math.PI * 2
    const x = Math.cos(angle) * innerRadius
    const z = Math.sin(angle) * innerRadius
    const y = Math.sin(angle * 3) * 0.5

    innerDots.push(
      <mesh key={`inner-${i}`} position={[x, y, z]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#f8f8f8" emissive="#f8f8f8" emissiveIntensity={0.3} transparent opacity={0.8} />
      </mesh>,
    )
  }

  // Create outer ring of dots
  const outerDots = []
  const outerRadius = 8
  const outerCount = 20
  for (let i = 0; i < outerCount; i++) {
    const angle = (i / outerCount) * Math.PI * 2
    const x = Math.cos(angle) * outerRadius
    const z = Math.sin(angle) * outerRadius
    const y = Math.cos(angle * 2) * 1

    outerDots.push(
      <mesh key={`outer-${i}`} position={[x, y, z]}>
        <sphereGeometry args={[0.08, 16, 16]} />
                  <meshStandardMaterial color="#00D1FF" emissive="#00D1FF" emissiveIntensity={0.2} transparent opacity={0.6} />
      </mesh>,
    )
  }

  // Create floating particles
  const particles = []
  for (let i = 0; i < 50; i++) {
    const x = (Math.random() - 0.5) * 20
    const y = (Math.random() - 0.5) * 15
    const z = (Math.random() - 0.5) * 20

    particles.push(
      <mesh key={`particle-${i}`} position={[x, y, z]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial
          color={Math.random() > 0.5 ? "#888888" : "#cccccc"}
          emissive={Math.random() > 0.5 ? "#888888" : "#cccccc"}
          emissiveIntensity={0.4}
          transparent
          opacity={0.7}
        />
      </mesh>,
    )
  }

  return (
    <group ref={groupRef}>
      <group ref={innerGroupRef}>{innerDots}</group>
      <group ref={outerGroupRef}>{outerDots}</group>
      <group>{particles}</group>
    </group>
  )
}
