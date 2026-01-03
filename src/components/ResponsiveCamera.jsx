import { useRef, useEffect } from 'react'
import { useThree } from '@react-three/fiber'

export default function ResponsiveCamera() {
  const { camera, size } = useThree()
  const initialSetup = useRef(false)

  useEffect(() => {
    if (!initialSetup.current) {
      // Set initial camera position
      camera.position.set(0, 0, 5)
      camera.lookAt(0, 0, 0)
      initialSetup.current = true
    }

    // Adjust camera FOV based on screen size
    const handleResize = () => {
      const aspect = size.width / size.height
      
      if (camera.isPerspectiveCamera) {
        if (aspect < 1) {
          // Mobile portrait
          camera.fov = 75
        } else if (aspect < 1.5) {
          // Tablet or narrow desktop
          camera.fov = 65
        } else {
          // Wide desktop
          camera.fov = 50
        }
        camera.updateProjectionMatrix()
      }
    }

    handleResize()
  }, [camera, size])

  return null
}
