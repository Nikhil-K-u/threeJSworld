import { useRef, useMemo, forwardRef, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import vertexShader from '../shaders/liquidVertex.glsl?raw'
import fragmentShader from '../shaders/liquidFragment.glsl?raw'

const LiquidMesh = forwardRef(({ scrollRef, particleMode = 0 }, ref) => {
  const meshRef = ref || useRef()
  const materialRef = useRef()
  const mouseGroupRef = useRef()
  const pointsRef = useRef()
  const pointsMaterialRef = useRef()
  
  // Spring physics state for mouse
  const mouseTarget = useRef(new THREE.Vector3(0, 0, 0))
  const mousePosition = useRef(new THREE.Vector3(0, 0, 0))
  const mouseVelocity = useRef(new THREE.Vector3(0, 0, 0))
  const [currentParticleMode, setCurrentParticleMode] = useState(0)
  
  const { camera, raycaster, pointer } = useThree()

  // Mouse interaction constants
  const MOUSE_ROTATION_SENSITIVITY = 0.5
  const MOUSE_LERP_FACTOR = 0.1 // Heavy magnetic parallax effect
  const SPRING_STIFFNESS = 0.08
  const SPRING_DAMPING = 0.85
  const MOUSE_INFLUENCE_MULTIPLIER = 10

  // Shader uniforms
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScrollProgress: { value: 0 },
      uColor1: { value: new THREE.Color('#667eea') },
      uColor2: { value: new THREE.Color('#764ba2') },
      uColor3: { value: new THREE.Color('#f093fb') },
      uMousePosition: { value: new THREE.Vector3(0, 0, 0) },
      uMouseInfluence: { value: 0 },
      uParticleMode: { value: 0 }
    }),
    []
  )

  // Generate particles from icosahedron geometry
  const particlesGeometry = useMemo(() => {
    const ico = new THREE.IcosahedronGeometry(1, 32)
    const positions = ico.attributes.position.array
    const particleCount = positions.length / 3
    
    // Create a buffer geometry for points
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    
    // Add random offsets for particle scatter effect
    const offsets = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)
    
    for (let i = 0; i < particleCount; i++) {
      offsets[i * 3] = (Math.random() - 0.5) * 0.5
      offsets[i * 3 + 1] = (Math.random() - 0.5) * 0.5
      offsets[i * 3 + 2] = (Math.random() - 0.5) * 0.5
      sizes[i] = Math.random() * 2 + 1
    }
    
    geometry.setAttribute('offset', new THREE.Float32BufferAttribute(offsets, 3))
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1))
    
    return geometry
  }, [])

  // Particle shader material
  const particlesMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uScrollProgress: { value: 0 },
        uParticleMode: { value: 0 },
        uColor1: { value: new THREE.Color('#667eea') },
        uColor2: { value: new THREE.Color('#764ba2') },
        uColor3: { value: new THREE.Color('#f093fb') }
      },
      vertexShader: `
        attribute vec3 offset;
        attribute float size;
        uniform float uTime;
        uniform float uParticleMode;
        uniform float uScrollProgress;
        varying vec3 vColor;
        varying float vAlpha;
        
        void main() {
          vec3 pos = position;
          
          // Scatter particles based on particle mode
          float scatter = uParticleMode;
          pos += offset * scatter * 2.0;
          
          // Add floating animation
          pos.y += sin(uTime + position.x * 5.0) * 0.1 * scatter;
          pos.x += cos(uTime * 0.7 + position.y * 3.0) * 0.1 * scatter;
          
          // Calculate color based on position
          float colorMix = (pos.y + 1.5) / 3.0;
          vColor = mix(vec3(0.4, 0.49, 0.92), vec3(0.94, 0.58, 0.98), colorMix);
          
          // Alpha based on scatter
          vAlpha = mix(0.0, 1.0, scatter);
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          
          // Size attenuation
          gl_PointSize = size * (300.0 / -mvPosition.z) * (0.5 + scatter * 0.5);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        
        void main() {
          // Create circular particle
          vec2 center = gl_PointCoord - 0.5;
          float dist = length(center);
          if (dist > 0.5) discard;
          
          // Soft edge
          float alpha = smoothstep(0.5, 0.2, dist) * vAlpha;
          
          // Add glow
          vec3 finalColor = vColor + vec3(0.2) * (1.0 - dist * 2.0);
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  }, [])

  // Smooth particle mode transition
  useEffect(() => {
    setCurrentParticleMode(particleMode)
  }, [particleMode])

  // Animation loop
  useFrame((state) => {
    const time = state.clock.elapsedTime
    
    // Update raycaster for 3D mouse position
    raycaster.setFromCamera(pointer, camera)
    const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
    const intersectPoint = new THREE.Vector3()
    raycaster.ray.intersectPlane(planeZ, intersectPoint)
    
    if (intersectPoint) {
      mouseTarget.current.copy(intersectPoint)
    }
    
    // Spring physics for smooth mouse following
    const dx = mouseTarget.current.x - mousePosition.current.x
    const dy = mouseTarget.current.y - mousePosition.current.y
    const dz = mouseTarget.current.z - mousePosition.current.z
    
    mouseVelocity.current.x += dx * SPRING_STIFFNESS
    mouseVelocity.current.y += dy * SPRING_STIFFNESS
    mouseVelocity.current.z += dz * SPRING_STIFFNESS
    
    mouseVelocity.current.multiplyScalar(SPRING_DAMPING)
    mousePosition.current.add(mouseVelocity.current)
    
    // Calculate mouse influence based on velocity
    const mouseSpeed = mouseVelocity.current.length()
    const targetInfluence = Math.min(mouseSpeed * MOUSE_INFLUENCE_MULTIPLIER, 1)

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = time
      materialRef.current.uniforms.uScrollProgress.value = scrollRef.current
      materialRef.current.uniforms.uMousePosition.value.copy(mousePosition.current)
      materialRef.current.uniforms.uMouseInfluence.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uMouseInfluence.value,
        targetInfluence,
        0.1
      )
      materialRef.current.uniforms.uParticleMode.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uParticleMode.value,
        currentParticleMode,
        0.05
      )
    }

    // Update particles material
    if (particlesMaterial) {
      particlesMaterial.uniforms.uTime.value = time
      particlesMaterial.uniforms.uScrollProgress.value = scrollRef.current
      particlesMaterial.uniforms.uParticleMode.value = THREE.MathUtils.lerp(
        particlesMaterial.uniforms.uParticleMode.value,
        currentParticleMode,
        0.05
      )
    }

    // Mouse-follow effect with heavy lag using lerp (factor 0.1 for magnetic parallax)
    if (mouseGroupRef.current) {
      const mouseX = state.mouse.x
      const mouseY = state.mouse.y

      const targetRotationY = mouseX * MOUSE_ROTATION_SENSITIVITY
      const targetRotationX = -mouseY * MOUSE_ROTATION_SENSITIVITY

      mouseGroupRef.current.rotation.x = THREE.MathUtils.lerp(
        mouseGroupRef.current.rotation.x,
        targetRotationX,
        MOUSE_LERP_FACTOR
      )
      mouseGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        mouseGroupRef.current.rotation.y,
        targetRotationY,
        MOUSE_LERP_FACTOR
      )
    }
  })

  // Calculate mesh opacity based on particle mode
  const meshOpacity = 1 - currentParticleMode

  return (
    <group ref={mouseGroupRef}>
      {/* Main mesh - fades out when in particle mode */}
      <mesh ref={meshRef} scale={1.5} visible={meshOpacity > 0.01}>
        <icosahedronGeometry args={[1, 32]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          wireframe={false}
          side={THREE.DoubleSide}
          transparent
          opacity={meshOpacity}
        />
      </mesh>
      
      {/* Particle cloud - fades in when in particle mode */}
      <points 
        ref={pointsRef} 
        scale={1.5} 
        geometry={particlesGeometry}
        material={particlesMaterial}
        visible={currentParticleMode > 0.01}
      />
    </group>
  )
})

LiquidMesh.displayName = 'LiquidMesh'

export default LiquidMesh
