## VisualLabPage - Archived from /estudio/visual-lab

### Original Location
- File: src/pages/2-estudio/VisualLabPage.jsx
- Route: /estudio/visual-lab (inside EstudioLayout)
- Navbar variant: dark (useSetNavbarVariant('dark'))

### Structure (6 sections)
1. **Hero** - Interactive spotlight hero with mouse-tracking mask reveal on background image
   - Background: /assets/pages/2-estudio/estudio_portada_identidad_ejecutiva.webp
   - CTA: 'Explorar el lab' (link to same page) + 'Ver portafolio' (button)

2. **VisualSectors** - Grid of 4 visual pillars (12-col grid)
   - Editorial: Identidad Ejecutiva (portrait)
   - Studio: Productos y Entornos Digitales (product)
   - Motion: Ecosistemas Sociales (video autoplay loop)
   - Modern Depth: Arquitectura de Marca (brand systems)

3. **CinematicStatement** - Quote section with yellow accent
   - "La Inteligencia artificial Crea, con Estrategia la Diriges"

4. **StrategySection** - 4-step methodology on black bg
   - 01 Inmersión Visual → 02 Generación Asistida → 03 Post-Producción → 04 Entrega Multiplataforma
   - Sticky sidebar with art direction + brand coherence principles

5. **DiagnosticForm** - Multi-step form with conditional selects
   - Fields: project, area (7 options), solution (dynamic per area), objective, email, message
   - Submits to WhatsApp with formatted message
   - solutionMap contains all service options per area

6. **Page wrapper** - bg-black, dark navbar, selection yellow

### Assets Referenced
- /assets/pages/2-estudio/estudio_portada_identidad_ejecutiva.webp
- /assets/pages/2-estudio/estudio_portada_producto_digital.webp
- /assets/pages/2-estudio/estudio_portada_social_media.mp4
- /assets/pages/2-estudio/estudio_portada_arquitectura_marca.webp

### Dependencies
- framer-motion (motion, useInView)
- lucide-react (Play, ArrowRight, Globe, Database, Camera, Film, Sparkles)
- react-router-dom (Link)
- Navbar context (useSetNavbarVariant)
- WHATSAPP_LINK from navigation data

### Key Features
- Mouse-tracking spotlight mask on hero background
- Grayscale-to-color reveal on hover
- Video autoplay loop in Motion section
- Conditional form selects (area → solution)
- Dark navbar variant
- Yellow (#FFD200) accent throughout
