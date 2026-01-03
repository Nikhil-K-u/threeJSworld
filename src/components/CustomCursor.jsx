import { useEffect, useRef, useState } from 'react'

export default function CustomCursor() {
  const cursorRef = useRef(null)
  const cursorTrailRef = useRef(null)
  const cursorDotRef = useRef(null)
  const [isHoveringCard, setIsHoveringCard] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  
  // Mouse position with spring physics
  const mousePos = useRef({ x: 0, y: 0 })
  const cursorPos = useRef({ x: 0, y: 0 })
  const trailPos = useRef({ x: 0, y: 0 })
  const velocity = useRef({ x: 0, y: 0 })
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY }
    }
    
    const handleMouseDown = () => setIsClicking(true)
    const handleMouseUp = () => setIsClicking(false)
    
    // Check for hovering over project cards
    const handleElementHover = (e) => {
      const target = e.target
      const isCard = target.closest('.project') || 
                     target.closest('.stat-card') || 
                     target.closest('.experience-item') ||
                     target.closest('.chip') ||
                     target.closest('a')
      setIsHoveringCard(!!isCard)
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseover', handleElementHover)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    
    // Animation loop
    let animationId
    const animate = () => {
      // Spring physics for main cursor
      const springStiffness = 0.15
      const dampening = 0.75
      
      // Calculate velocity
      velocity.current.x += (mousePos.current.x - cursorPos.current.x) * springStiffness
      velocity.current.y += (mousePos.current.y - cursorPos.current.y) * springStiffness
      
      // Apply dampening
      velocity.current.x *= dampening
      velocity.current.y *= dampening
      
      // Update position
      cursorPos.current.x += velocity.current.x
      cursorPos.current.y += velocity.current.y
      
      // Trail follows with more lag
      const trailLag = 0.08
      trailPos.current.x += (cursorPos.current.x - trailPos.current.x) * trailLag
      trailPos.current.y += (cursorPos.current.y - trailPos.current.y) * trailLag
      
      // Apply to DOM
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${cursorPos.current.x}px, ${cursorPos.current.y}px)`
      }
      if (cursorTrailRef.current) {
        cursorTrailRef.current.style.transform = `translate(${trailPos.current.x}px, ${trailPos.current.y}px)`
      }
      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate(${mousePos.current.x}px, ${mousePos.current.y}px)`
      }
      
      animationId = requestAnimationFrame(animate)
    }
    
    animate()
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseover', handleElementHover)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      cancelAnimationFrame(animationId)
    }
  }, [])
  
  // Calculate cursor size based on state
  const cursorSize = isHoveringCard ? 60 : isClicking ? 20 : 40
  const trailSize = isHoveringCard ? 80 : isClicking ? 30 : 50
  const dotSize = isHoveringCard ? 8 : 6
  
  return (
    <>
      {/* Main cursor ring */}
      <div
        ref={cursorRef}
        className="custom-cursor"
        style={{
          width: cursorSize,
          height: cursorSize,
          borderColor: isHoveringCard ? '#f093fb' : '#667eea',
          mixBlendMode: isHoveringCard ? 'difference' : 'normal'
        }}
      />
      
      {/* Trail cursor */}
      <div
        ref={cursorTrailRef}
        className="custom-cursor-trail"
        style={{
          width: trailSize,
          height: trailSize,
          background: isHoveringCard 
            ? 'radial-gradient(circle, rgba(240, 147, 251, 0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%)'
        }}
      />
      
      {/* Center dot */}
      <div
        ref={cursorDotRef}
        className="custom-cursor-dot"
        style={{
          width: dotSize,
          height: dotSize,
          background: isHoveringCard ? '#f093fb' : '#667eea'
        }}
      />
    </>
  )
}
