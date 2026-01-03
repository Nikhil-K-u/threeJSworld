import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { 
  EffectComposer, 
  Bloom, 
  ChromaticAberration,
  Vignette 
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'

export default function Effects({ scrollRef }) {
  const chromaticRef = useRef()
  const { size } = useThree()
  
  // Animate chromatic aberration based on scroll
  useFrame(() => {
    if (chromaticRef.current) {
      // Increase chromatic aberration on edges during scroll
      const scrollProgress = scrollRef?.current || 0
      const baseOffset = 0.001
      const scrollOffset = Math.sin(scrollProgress * Math.PI) * 0.002
      
      chromaticRef.current.offset.set(
        baseOffset + scrollOffset,
        baseOffset + scrollOffset
      )
    }
  })

  return (
    <EffectComposer>
      {/* Bloom for glow effect */}
      <Bloom
        intensity={0.8}
        luminanceThreshold={0.6}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      
      {/* Chromatic aberration on viewport edges */}
      <ChromaticAberration
        ref={chromaticRef}
        blendFunction={BlendFunction.NORMAL}
        offset={new THREE.Vector2(0.001, 0.001)}
        radialModulation
        modulationOffset={0.3}
      />
      
      {/* Subtle vignette to focus attention */}
      <Vignette
        offset={0.3}
        darkness={0.5}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  )
}
