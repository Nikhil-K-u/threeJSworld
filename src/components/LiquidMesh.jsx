import { useRef, useMemo, forwardRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import vertexShader from '../shaders/liquidVertex.glsl?raw'
import fragmentShader from '../shaders/liquidFragment.glsl?raw'

const LiquidMesh = forwardRef(({ scrollProgress }, ref) => {
  const meshRef = ref || useRef()
  const materialRef = useRef()
  const mouseGroupRef = useRef()

  // Shader uniforms
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScrollProgress: { value: 0 },
      uColor1: { value: new THREE.Color('#667eea') },
      uColor2: { value: new THREE.Color('#764ba2') },
      uColor3: { value: new THREE.Color('#f093fb') }
    }),
    []
  )

  // Animation loop
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
      materialRef.current.uniforms.uScrollProgress.value = scrollProgress
    }

    // Mouse-follow effect with heavy lag using lerp (independent of scroll rotation)
    if (mouseGroupRef.current) {
      // Get mouse coordinates from state (-1 to 1)
      const mouseX = state.mouse.x
      const mouseY = state.mouse.y

      // Target rotation based on mouse position
      const targetRotationY = mouseX * 0.3
      const targetRotationX = -mouseY * 0.3

      // Apply heavy lag effect using lerp (0.02 = very slow, heavy lag)
      mouseGroupRef.current.rotation.x = THREE.MathUtils.lerp(
        mouseGroupRef.current.rotation.x,
        targetRotationX,
        0.02
      )
      mouseGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        mouseGroupRef.current.rotation.y,
        targetRotationY,
        0.02
      )
    }
  })

  return (
    <group ref={mouseGroupRef}>
      <mesh ref={meshRef} scale={1.5}>
        <icosahedronGeometry args={[1, 32]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          wireframe={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
})

LiquidMesh.displayName = 'LiquidMesh'

export default LiquidMesh
