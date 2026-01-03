import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import LiquidMesh from './LiquidMesh'
import Loader from './Loader'
import ResponsiveCamera from './ResponsiveCamera'

export default function Scene({ scrollProgress, meshRef }) {
  return (
    <Canvas
      className="canvas-container"
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
        <LiquidMesh scrollProgress={scrollProgress} ref={meshRef} />
      </Suspense>
      
      {/* Optional: Orbit controls for development (can be removed for production) */}
      {/* <OrbitControls enableZoom={false} enablePan={false} /> */}
    </Canvas>
  )
}
