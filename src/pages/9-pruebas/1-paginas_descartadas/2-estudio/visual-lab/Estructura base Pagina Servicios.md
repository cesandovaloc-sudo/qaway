# Estructura Base — Página de Servicios (Visual Lab)

## Arquitectura de Componentes

```
App (Layout Root)
├── Navbar
│   ├── Logo (Visual Lab.)
│   ├── Nav Links (El Estudio, Sistemas, Cinematografía, Branding AI, Contacto)
│   └── CTA Button (Agendar Sesión)
│
├── Hero
│   ├── Background (parallax fijo + overlay cinematográfico)
│   ├── Tagline ("The Architecture of New Media")
│   ├── Headline principal + subtítulo
│   ├── CTA (Explorar El Lab)
│   └── Trust signal (Top Studios)
│
├── VisualSectors
│   ├── Header (Capabilities / 01)
│   ├── Grid de 4 bloques:
│   │   ├── Identity Lab (col-span-8 — imagen editorial)
│   │   ├── Campaign Synthesis (col-span-4 — producto)
│   │   ├── Narrativa Líquida (col-span-5 — video/motion)
│   │   └── Refinamiento (col-span-7 — enhancement + upscaling)
│   └── Galería de capacidades visuales
│
├── CinematicStatement
│   ├── Background cinematográfico con parallax
│   ├── Philosophy statement
│   └── Línea divisoria + tagline
│
├── StrategySection
│   ├── Sidebar sticky (Metodología Experimental)
│   │   ├── Headline + descripción
│   │   └── Feature list (Curaduría Estética, Coherencia de Marca)
│   └── Timeline de 4 fases:
│       ├── PHASE_01 — Visual Ingestion
│       ├── PHASE_02 — Neural Synthesis
│       ├── PHASE_03 — Artistic Refinement
│       └── PHASE_04 — Hybrid Delivery
│
├── DiagnosticForm
│   ├── Sidebar informativo
│   │   ├── Headline
│   │   ├── Value props (Despliegue Internacional, Soberanía de Datos)
│   │   └── Trust signals
│   └── Formulario
│       ├── Select: Tipo de estudio
│       ├── Select: Área de interés
│       ├── Input: Objetivo de diseño
│       ├── Input: Contacto corporativo
│       ├── Textarea: Resumen del desafío
│       └── Submit: Solicitar Consulta Privada
│
└── Footer
    ├── Brand info + descripción
    ├── Social links
    ├── Nav columns (Estudio, Servicios, Legal)
    └── Copyright + System Status
```

## Sistema de Diseño (Tokens)

| Token | Valor | Uso |
|-------|-------|-----|
| `UI.radius` | `rounded-[10px]` | Cards, contenedores principales |
| `UI.radiusSm` | `rounded-[6px]` | Botones, inputs |
| `accent` | `#FFD200` | Amarillo QAWA — acentos, hover states |
| `accentHover` | `#FFDE21` | Hover de elementos accent |
| `border` | `border-white/10` | Bordes en fondo oscuro |
| `borderLight` | `border-zinc-200` | Bordes en fondo claro |

## Layout

- **Max width**: `max-w-[1400px]`
- **Padding horizontal**: `px-10`
- **Grid**: CSS Grid de 12 columnas (`grid-cols-12`)
- **Breakpoints**: `md:` (768px), `lg:` (1024px)

## Convenciones Visuales

- **Tipografía**: Inter (font-sans), uppercase + tracking-widest en labels
- **Estados hover**: Transformaciones suaves (translate, opacity, scale)
- **Animaciones**: Framer Motion — entradas con `opacity + y`, hover con `whileHover`
- **Background**: Imágenes Unsplash en escala de grises con overlays
- **Glows**: Blur-3xl con colores accent a baja opacidad
- **Cinematic look**: background-attachment: fixed, gradientes multiple capa

## Flujo del Usuario

1. **Navbar** → navegación primaria + CTA sticky
2. **Hero** → impacto visual + CTA principal
3. **VisualSectors** → showroom de capacidades (persuade)
4. **CinematicStatement** → pausa reflexiva (brand philosophy)
5. **StrategySection** → metodología (educate)
6. **DiagnosticForm** → conversión (lead capture)
7. **Footer** → cierre + navegación secundaria
