# Creative Technologist Portfolio

A high-end, interactive 3D portfolio built with React Three Fiber, Drei, and GSAP. Features a stunning liquid distortion shader effect with buttery-smooth scroll animations.

![Portfolio Preview](https://github.com/user-attachments/assets/267a3b4e-8325-4c4a-9003-2e4b129f8db1)

## ✨ Features

- **Custom GLSL Liquid Distortion Shader** - Organic, fluid 3D mesh with dynamic vertex displacement
- **GSAP ScrollTrigger Integration** - Smooth scroll-based animations that rotate and transform the 3D mesh
- **React Three Fiber** - Declarative 3D rendering with React
- **Drei Components** - Optimized utilities for Three.js in React
- **Suspense Loader** - Elegant loading state while 3D assets initialize
- **Responsive Camera** - Adapts FOV based on viewport size for optimal viewing
- **Minimal HTML Overlay** - Clean, modern UI with gradient text effects
- **60fps Performance** - Hardware-accelerated graphics with optimized shaders

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the portfolio.

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 🎨 Technology Stack

- **React 18** - Modern React with hooks
- **Vite** - Lightning-fast build tool and dev server
- **React Three Fiber** - React renderer for Three.js
- **Drei** - Helpers and abstractions for React Three Fiber
- **Three.js** - 3D graphics library
- **GSAP** - Professional-grade animation library
- **GLSL Shaders** - Custom vertex and fragment shaders for liquid distortion

## 📁 Project Structure

```
threeJSworld/
├── src/
│   ├── components/
│   │   ├── LiquidMesh.jsx      # Main 3D mesh with shader material
│   │   ├── Scene.jsx            # 3D canvas and scene setup
│   │   ├── Loader.jsx           # Suspense fallback loader
│   │   └── ResponsiveCamera.jsx # Adaptive camera configuration
│   ├── shaders/
│   │   ├── liquidVertex.glsl    # Vertex shader with noise distortion
│   │   └── liquidFragment.glsl  # Fragment shader with gradient colors
│   ├── App.jsx                  # Main app with scroll animations
│   ├── main.jsx                 # React entry point
│   └── index.css                # Global styles
├── index.html
├── package.json
└── vite.config.js
```

## 🎯 Key Components

### LiquidMesh
The centerpiece 3D object featuring:
- Custom GLSL shaders for organic distortion
- Simplex noise for smooth, natural movement
- Dynamic color gradients
- Fresnel effects for edge lighting

### Scene
Manages the 3D environment:
- Optimized rendering settings
- Ambient and directional lighting
- Suspense boundaries for loading states

### ScrollTrigger Integration
GSAP animations that respond to scroll:
- Mesh rotation (Y and X axes)
- Position transitions
- Smooth interpolation with scrubbing

## 🎨 Customization

### Shader Colors
Edit the gradient colors in `src/components/LiquidMesh.jsx`:
```javascript
uColor1: { value: new THREE.Color('#667eea') },
uColor2: { value: new THREE.Color('#764ba2') },
uColor3: { value: new THREE.Color('#f093fb') }
```

### Content Sections
Modify the HTML content in `src/App.jsx` to personalize your portfolio.

### Animation Timing
Adjust GSAP ScrollTrigger parameters in `src/App.jsx` for different scroll behaviors.

## 📸 Screenshots

### Hero Section
![Hero](https://github.com/user-attachments/assets/267a3b4e-8325-4c4a-9003-2e4b129f8db1)

### Scrolled View
![Scrolled](https://github.com/user-attachments/assets/c891d13d-0b18-4645-b7fc-d65059def631)

### Mid-Section
![Middle](https://github.com/user-attachments/assets/4cde23fa-a6ec-4153-a4d1-a10e884f1a1a)

## 🔧 Performance Optimization

- Hardware-accelerated rendering with WebGL
- Efficient shader calculations
- Dynamic device pixel ratio (DPR) adjustment
- Optimized geometry (icosahedron with 64 subdivisions)
- CSS-based smooth scrolling
- Passive scroll event listeners

## 📝 License

MIT

## 👨‍💻 Development

Built with modern web technologies for a Creative Technologist aesthetic. The project emphasizes:
- Clean, maintainable code
- Smooth 60fps animations
- Responsive design
- Professional shader programming
- Industry-standard tooling

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!