import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import Scene from './components/Scene'

gsap.registerPlugin(ScrollTrigger)

function App() {
  const meshRef = useRef()
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
      smoothTouch: false
    })

    // Update ScrollTrigger on every Lenis tick
    lenis.on('scroll', ScrollTrigger.update)

    // Sync Lenis with GSAP ticker
    const rafFunction = (time) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(rafFunction)

    // Disable lag smoothing for more accurate sync
    gsap.ticker.lagSmoothing(0)

    // Track scroll progress
    const handleScroll = () => {
      const scrolled = window.scrollY
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const progress = Math.min(scrolled / maxScroll, 1)
      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    // GSAP ScrollTrigger animations
    const sections = document.querySelectorAll('.content section')

    sections.forEach((section, index) => {
      // Fade in sections
      gsap.fromTo(
        section,
        { 
          opacity: 0,
          y: 50
        },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            end: 'top 20%',
            toggleActions: 'play none none reverse'
          }
        }
      )
    })

    // Create a proxy object for 3D mesh animation
    const proxy = { rotationY: 0, rotationX: 0, positionY: 0, positionZ: 5 }

    // Animate mesh rotation and position based on scroll
    ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress
        
        // Smooth rotation
        proxy.rotationY = progress * Math.PI * 2
        proxy.rotationX = Math.sin(progress * Math.PI) * 0.3
        
        // Smooth position changes
        proxy.positionY = Math.sin(progress * Math.PI * 2) * 0.5
        proxy.positionZ = 5 - progress * 1
        
        // Apply to mesh if available
        if (meshRef.current) {
          gsap.to(meshRef.current.rotation, {
            y: proxy.rotationY,
            x: proxy.rotationX,
            duration: 0.1,
            ease: 'none'
          })
          
          gsap.to(meshRef.current.position, {
            y: proxy.positionY,
            z: proxy.positionZ,
            duration: 0.1,
            ease: 'none'
          })
        }
      }
    })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
      lenis.destroy()
      gsap.ticker.remove(rafFunction)
    }
  }, [])

  return (
    <div className="App">
      {/* Fixed 3D Canvas */}
      <Scene scrollProgress={scrollProgress} meshRef={meshRef} />

      {/* Scrollable HTML content overlay */}
      <div className="content">
        <section>
          <h1>Creative Technologist</h1>
          <p>
            Crafting immersive digital experiences at the intersection of art and technology
          </p>
        </section>

        <section>
          <h2>Interactive 3D</h2>
          <p>
            Building next-generation web experiences with cutting-edge technologies
            like React Three Fiber, WebGL, and advanced shader programming
          </p>
        </section>

        <section>
          <h2>Fluid Motion</h2>
          <p>
            Seamless animations powered by GSAP ScrollTrigger create buttery-smooth
            transitions that respond to every scroll interaction
          </p>
        </section>

        <section>
          <h2>Performance First</h2>
          <p>
            Optimized for 60fps rendering with efficient shaders, responsive design,
            and hardware-accelerated graphics
          </p>
        </section>

        <section>
          <h2>Let's Create</h2>
          <p>
            Ready to build something extraordinary together
          </p>
        </section>
      </div>
    </div>
  )
}

export default App
