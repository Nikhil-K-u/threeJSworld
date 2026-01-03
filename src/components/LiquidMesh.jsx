import { useRef, useMemo, forwardRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import vertexShader from '../shaders/liquidVertex.glsl?raw'
import fragmentShader from '../shaders/liquidFragment.glsl?raw'

const LiquidMesh = forwardRef(({ scrollRef }, ref) => {
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
      // Read scrollRef.current to prevent re-renders
      materialRef.current.uniforms.uScrollProgress.value = scrollRef.current
    }

    // Mouse-follow effect with heavy lag using lerp (factor 0.1 for magnetic parallax)
    if (mouseGroupRef.current) {
      // Get mouse coordinates from state (-1 to 1)
      const mouseX = state.mouse.x
      const mouseY = state.mouse.y

      // Target rotation based on mouse position (magnetic effect)
      const targetRotationY = mouseX * 0.5
      const targetRotationX = -mouseY * 0.5

      // Apply heavy, satisfying lag using lerp (0.1 = heavy magnetic feel)
      mouseGroupRef.current.rotation.x = THREE.MathUtils.lerp(
        mouseGroupRef.current.rotation.x,
        targetRotationX,
        0.1
      )
      mouseGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        mouseGroupRef.current.rotation.y,
        targetRotationY,
        0.1
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
