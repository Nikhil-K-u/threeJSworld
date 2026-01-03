import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import LiquidMesh from './LiquidMesh'
import Loader from './Loader'
import ResponsiveCamera from './ResponsiveCamera'
import Effects from './Effects'

export default function Scene({ scrollRef, meshRef, particleMode }) {
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
      
      {/* Main 3D content with Suspense loader */}
      <Suspense fallback={<Loader />}>
        <LiquidMesh scrollRef={scrollRef} ref={meshRef} particleMode={particleMode} />
      </Suspense>
      
      {/* Post-processing effects */}
      <Effects scrollRef={scrollRef} />
    </Canvas>
  )
}
