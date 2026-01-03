import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom, Noise } from '@react-three/postprocessing'
import LiquidMesh from './LiquidMesh'
import Loader from './Loader'
import ResponsiveCamera from './ResponsiveCamera'

export default function Scene({ scrollRef, meshRef }) {
  return (
    <Canvas
      className="canvas-container"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 0
      }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      }}
      dpr={[1, 2]}
    >
      {/* Responsive camera setup */}
      <ResponsiveCamera />
      
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#764ba2" />
      
      {/* Main 3D content with Suspense loader and integrated post-processing effects */}
      <Suspense fallback={<Loader />}>
        <LiquidMesh scrollRef={scrollRef} ref={meshRef} />
      </Suspense>
      
      {/* Post-processing effects for cinematic look */}
      <EffectComposer>
        <Bloom
          intensity={1.2}
          luminanceThreshold={0.5}
          luminanceSmoothing={0.9}
        />
        <Noise opacity={0.03} />
      </EffectComposer>
    </Canvas>
  )
}
