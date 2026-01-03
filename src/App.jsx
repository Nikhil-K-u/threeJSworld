import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import Scene from './components/Scene'
import CustomCursor from './components/CustomCursor'

gsap.registerPlugin(ScrollTrigger)

// Non-breaking space character for text splitting
const NON_BREAKING_SPACE = '\u00A0'

// Helper function to split text into characters for animation
function splitTextIntoChars(element) {
  const text = element.textContent
  element.innerHTML = ''
  const chars = text.split('')
  
  return chars.map((char, i) => {
    const span = document.createElement('span')
    span.textContent = char === ' ' ? NON_BREAKING_SPACE : char
    span.style.display = 'inline-block'
    span.style.opacity = '0'
    span.className = 'split-char'
    element.appendChild(span)
    return span
  })
}

// Helper function to split text into words for animation
function splitTextIntoWords(element) {
  const text = element.textContent
  element.innerHTML = ''
  const words = text.split(' ')
  
  return words.map((word, i) => {
    const span = document.createElement('span')
    span.textContent = word
    span.style.display = 'inline-block'
    span.style.opacity = '0'
    span.className = 'split-word'
    if (i < words.length - 1) {
      const space = document.createElement('span')
      space.innerHTML = '&nbsp;'
      space.style.display = 'inline-block'
      element.appendChild(span)
      element.appendChild(space)
    } else {
      element.appendChild(span)
    }
    return span
  })
}

function App() {
  const meshRef = useRef()
  const scrollRef = useRef(0)
  const lenisRef = useRef(null)
  const rafFunctionRef = useRef(null)
  const [particleMode, setParticleMode] = useState(0)

  useEffect(() => {
    // Create GSAP context for proper cleanup
    const ctx = gsap.context(() => {
      // Initialize Lenis smooth scroll
      lenisRef.current = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
        smoothTouch: false
      })

      // Update ScrollTrigger on every Lenis tick
      lenisRef.current.on('scroll', ScrollTrigger.update)

      // Sync Lenis with GSAP ticker
      rafFunctionRef.current = (time) => {
        lenisRef.current.raf(time * 1000)
      }
      gsap.ticker.add(rafFunctionRef.current)

      // Disable lag smoothing for more accurate sync
      gsap.ticker.lagSmoothing(0)

      // Advanced scroll animations for sections with "coming and going" flow
      const sections = document.querySelectorAll('.content section')

      sections.forEach((section, index) => {
        const sectionContent = section.querySelector('.section-content')
        const heading = section.querySelector('h1, h2')
        const paragraphs = section.querySelectorAll('p')
        const listItems = section.querySelectorAll('li')
        const cards = section.querySelectorAll('.experience-item, .stat-card')
        const isProjectSection = section.querySelector('.project')

        // Create timeline for entry animation
        const entryTl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            end: 'top 20%',
            toggleActions: 'play none none none',
            onEnter: () => {
              // Activate particle mode for projects section
              if (isProjectSection) {
                setParticleMode(1)
              }
            },
            onEnterBack: () => {
              if (isProjectSection) {
                setParticleMode(1)
              }
            }
          }
        })

        // Entry: Flow in from below (slide up with stagger)
        entryTl.fromTo(
          sectionContent,
          { 
            opacity: 0,
            y: 80,
            scale: 0.95
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1,
            ease: 'power3.out'
          },
          0
        )

        // Heading character reveal animation
        if (heading) {
          const chars = splitTextIntoChars(heading)
          entryTl.fromTo(
            chars,
            {
              opacity: 0,
              y: 40,
              rotateX: -90
            },
            {
              opacity: 1,
              y: 0,
              rotateX: 0,
              duration: 0.8,
              stagger: 0.03,
              ease: 'back.out(1.7)'
            },
            0.2
          )
        }

        // Paragraphs word reveal
        paragraphs.forEach((p, pIndex) => {
          const words = splitTextIntoWords(p)
          entryTl.fromTo(
            words,
            {
              opacity: 0,
              y: 30,
              filter: 'blur(6px)'
            },
            {
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              duration: 0.6,
              stagger: 0.04,
              ease: 'power2.out'
            },
            0.4 + pIndex * 0.15
          )
        })

        // List items stagger
        if (listItems.length > 0) {
          entryTl.fromTo(
            listItems,
            {
              opacity: 0,
              x: -40,
              filter: 'blur(4px)'
            },
            {
              opacity: 1,
              x: 0,
              filter: 'blur(0px)',
              duration: 0.6,
              stagger: 0.08,
              ease: 'power2.out'
            },
            0.5
          )
        }

        // Cards stagger
        if (cards.length > 0) {
          entryTl.fromTo(
            cards,
            {
              opacity: 0,
              y: 50,
              scale: 0.9
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.7,
              stagger: 0.12,
              ease: 'power3.out'
            },
            0.4
          )
        }

        // Exit animation - flow out (accelerate away upward)
        const exitTl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'bottom 60%',
            end: 'bottom top',
            scrub: 1.5,
            onLeave: () => {
              if (isProjectSection) {
                setParticleMode(0)
              }
            },
            onLeaveBack: () => {
              if (isProjectSection) {
                setParticleMode(0)
              }
            }
          }
        })

        // Exit: Accelerate upward and fade with blur
        exitTl.to(sectionContent, {
          y: -100,
          opacity: 0,
          scale: 0.92,
          filter: 'blur(8px)',
          ease: 'power2.in'
        })
      })

      // Create high-performance setters for mesh animation
      // Using gsap.quickSetter for optimal performance in scroll updates
      let setMeshRotationY, setMeshRotationX, setMeshPositionY, setMeshPositionZ
      
      // Initialize quick setters once mesh is available
      const initQuickSetters = () => {
        if (meshRef.current) {
          setMeshRotationY = gsap.quickSetter(meshRef.current.rotation, 'y', 'number')
          setMeshRotationX = gsap.quickSetter(meshRef.current.rotation, 'x', 'number')
          setMeshPositionY = gsap.quickSetter(meshRef.current.position, 'y', 'number')
          setMeshPositionZ = gsap.quickSetter(meshRef.current.position, 'z', 'number')
        }
      }

      // Animate mesh rotation and position based on scroll
      ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress
          
          // Update scroll ref for shader
          scrollRef.current = progress
          
          // Calculate target values
          const rotationY = progress * Math.PI * 2
          const rotationX = Math.sin(progress * Math.PI) * 0.3
          const positionY = Math.sin(progress * Math.PI * 2) * 0.5
          const positionZ = progress * 2
          
          // Apply to mesh using quick setters (no gsap.to needed!)
          if (meshRef.current) {
            // Initialize setters on first frame if not done
            if (!setMeshRotationY) {
              initQuickSetters()
            }
            
            if (setMeshRotationY) {
              setMeshRotationY(rotationY)
              setMeshRotationX(rotationX)
              setMeshPositionY(positionY)
              setMeshPositionZ(positionZ)
            }
          }
        }
      })

      // Pills animation
      const pills = document.querySelectorAll('.pill')
      pills.forEach((pill, i) => {
        gsap.fromTo(
          pill,
          { opacity: 0, scale: 0.8, y: 20 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.5,
            delay: 0.5 + i * 0.1,
            ease: 'back.out(1.7)'
          }
        )
      })

      // Contact chips animation
      const chips = document.querySelectorAll('.chip')
      chips.forEach((chip, i) => {
        gsap.fromTo(
          chip,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            delay: 0.8 + i * 0.08,
            ease: 'power2.out'
          }
        )
      })
    }) // End of gsap.context

    return () => {
      // Clean up GSAP context (removes all animations created within it)
      ctx.revert()
      
      // Clean up Lenis
      if (lenisRef.current) {
        lenisRef.current.destroy()
      }
      
      // Clean up GSAP ticker
      if (rafFunctionRef.current) {
        gsap.ticker.remove(rafFunctionRef.current)
      }
    }
  }, [])

  return (
    <div className="App">
      {/* Custom cursor */}
      <CustomCursor />
      
      {/* Fixed 3D Canvas */}
      <Scene scrollRef={scrollRef} meshRef={meshRef} particleMode={particleMode} />

      {/* Scrollable HTML content overlay */}
      <div className="content">
        <section className="hero">
          <div className="section-content">
            <div className="pill-row">
              <span className="pill">Full Stack / Backend</span>
              <span className="pill">BFF and System Design</span>
              <span className="pill">Next.js · Java · MongoDB</span>
            </div>
            <h1>Nikhil Kumar</h1>
            <p className="location">Hyderabad, India</p>
            <div className="contact-links">
              <a className="chip" href="mailto:nk605326@gmail.com">Email</a>
              <span className="chip muted">+91 7327883029</span>
              <a className="chip" href="https://www.linkedin.com/in/nkupa/" target="_blank" rel="noreferrer">LinkedIn</a>
              <a className="chip" href="https://github.com/Nikhil-K-u" target="_blank" rel="noreferrer">GitHub</a>
              <a className="chip" href="https://nikhil-k-u.github.io/" target="_blank" rel="noreferrer">Portfolio</a>
            </div>
            <div className="hero-highlights">
              <div className="stat-card">
                <span className="stat-value">70%</span>
                <span className="stat-label">Throughput boost via multithreading</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">300k+</span>
                <span className="stat-label">Redundant API calls removed per batch</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">200k+</span>
                <span className="stat-label">Records optimized in aggregation pipelines</span>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="section-content card">
            <h2>Technical Skills</h2>
            <ul className="bullet-list">
              <li><strong>Languages:</strong> Java, Python, SQL, JavaScript (Next.js)</li>
              <li><strong>Core Concepts:</strong> Backend-for-Frontend (BFF), System Design, Multithreading, REST APIs, Geo-fencing</li>
              <li><strong>Databases:</strong> MongoDB (Aggregation Framework), MySQL, Vector Databases (Qdrant)</li>
              <li><strong>Tools &amp; Cloud:</strong> Docker, Git, Linux, Postman, AWS S3, Azure AI</li>
              <li><strong>Libraries:</strong> LangChain, Selenium, Scrapy, OpenAI API, Sharp (Image Processing)</li>
            </ul>
          </div>
        </section>

        <section>
          <div className="section-content card">
            <h2>Experience</h2>
            <div className="experience-item">
              <div className="item-header">
                <span className="item-title">KloudGin Inc. — Software Engineer (Trainee/Intern)</span>
                <span className="item-meta">Hyderabad, India · Aug 2024 — Present</span>
              </div>
              <ul className="bullet-list">
                <li><strong>Strategic R&amp;D:</strong> Solely architected the 311 Portal Proof-of-Concept validating the Next.js/BFF architecture, now deployed as the demo asset for enterprise clients.</li>
                <li><strong>Performance Optimization:</strong> Designed a multithreaded ingestion strategy, increasing throughput by 70% and resolving critical race conditions in the legacy Java backend.</li>
                <li><strong>API Architecture:</strong> Implemented LRU caching eliminating 300,000+ redundant API requests per cycle and shrinking batch execution time from hours to minutes.</li>
                <li><strong>Cloud-Native Development:</strong> Engineered scalable SaaS modules with Java and MongoDB, optimizing complex aggregation queries for 200K+ records.</li>
              </ul>
            </div>

            <div className="experience-item">
              <div className="item-header">
                <span className="item-title">PwC Acceleration Centers — Cloud &amp; Digital Trainee</span>
                <span className="item-meta">Remote · Feb 2024 — Jul 2024</span>
              </div>
              <ul className="bullet-list">
                <li><strong>Digital Transformation Training:</strong> Completed intensive curriculum focused on Cloud Architecture and Enterprise Security.</li>
                <li><strong>Industry Mentorship:</strong> Collaborated with global experts to solve simulated enterprise challenges, strengthening technical problem-solving.</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <div className="section-content card">
            <h2>Projects</h2>

            <div className="experience-item project">
              <div className="item-header">
                <span className="item-title">311 Service Portal | Next.js, AWS (S3, SNS, SES), OpenAI, Leaflet</span>
              </div>
              <ul className="bullet-list">
                <li>Built a Next.js BFF to securely proxy Auth tokens and bypass legacy ERP CORS limits.</li>
                <li>Architected AWS S3 pipelines with presigned URLs and Sharp-based server compression.</li>
                <li>Integrated Amazon SNS/SES for real-time SMS/Email updates with dynamic tracking links.</li>
                <li>Implemented Turf.js geofencing with Leaflet/MapQuest for accurate reverse geocoding.</li>
                <li>Engineered an OpenAI-powered chatbot to convert natural language complaints into structured JSON.</li>
              </ul>
            </div>

            <div className="experience-item project">
              <div className="item-header">
                <span className="item-title">JalDristi — Multi-Modal AI Analytics | Python, Azure CV, OpenAI, Selenium</span>
              </div>
              <ul className="bullet-list">
                <li>Automated social listening with Selenium pipelines aggregating crisis data by priority keywords.</li>
                <li>Used Azure Computer Vision to extract dense captions and OpenAI to craft context-aware summaries.</li>
                <li>Designed a weighted risk scoring system in Pandas to prioritize actionable alerts.</li>
              </ul>
            </div>

            <div className="experience-item project">
              <div className="item-header">
                <span className="item-title">PDFSol — RAG Document Search | Python, LangChain, Qdrant, Streamlit</span>
              </div>
              <ul className="bullet-list">
                <li>Built a Retrieval-Augmented Generation pipeline for Q&amp;A over complex PDFs.</li>
                <li>Implemented vector embeddings with Qdrant for high-accuracy semantic search.</li>
                <li>Optimized chunking strategies in LangChain to improve relevance and reduce token usage.</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <div className="section-content card">
            <h2>Education</h2>
            <div className="experience-item">
              <div className="item-header">
                <span className="item-title">Siksha 'O' Anusandhan University — B.Tech in Computer Science Engineering</span>
                <span className="item-meta">Bhubaneswar, India · CGPA: 8.5 · 2021 — 2025</span>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="section-content card">
            <h2>Licenses and Certifications</h2>

            <div className="experience-item cert">
              <div className="item-header">
                <a href="https://www.credly.com/badges/0abbe0db-40a7-4a04-bc3a-c2db873c16d0/public_url" target="_blank" rel="noreferrer" className="item-title">Google Cybersecurity Specialization — Google</a>
              </div>
              <p>Completed the 8-course professional certificate with hands-on Linux, SQL, Threat Detection, Incident Response, Network Security, Risk Management, and Python automation.</p>
            </div>

            <div className="experience-item cert">
              <div className="item-header">
                <a href="https://www.credly.com/badges/f715bdc3-af16-4e83-b84f-68dc9bbf9025/public_url" target="_blank" rel="noreferrer" className="item-title">Microsoft Certified: AI Fundamentals — Microsoft</a>
              </div>
              <p>Learned core AI/ML concepts, responsible AI, and Azure-based implementation strategies.</p>
            </div>

            <div className="experience-item cert">
              <div className="item-header">
                <a href="https://learn.microsoft.com/api/credentials/share/en-us/Nkupa/4A04ABBB658E66C2?sharingId=7B5F822BEF56BFF8" target="_blank" rel="noreferrer" className="item-title">Microsoft Certified: Security, Compliance, and Identity Fundamentals — Microsoft</a>
              </div>
              <p>Understood SCI principles and identity protection using Microsoft 365 and Azure environments.</p>
            </div>
          </div>
        </section>

        <section>
          <div className="section-content card">
            <h2>Let's Build</h2>
            <p>Open to collaborating on high-impact backend, cloud-native, and AI-driven products.</p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default App
