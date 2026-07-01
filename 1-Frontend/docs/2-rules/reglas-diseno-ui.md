# Sistema de Diseño UI — Qaway Lab

## Identidad Visual

- **Marca**: Qaway LAB — Strategic Digital Systems
- **Estilo**: Minimalista, alto impacto, sobrio con acentos en amarillo
- **Enfoque**: Marketing, claridad, estructura visual fuerte, conversión

## Paleta de Colores

| Token | Color | Hex | Uso |
|-------|-------|-----|-----|
| `qaway-accent` | Amarillo | `#FFD200` | CTAs, hover states, acentos, iconos |
| `qaway-accent-dark` | Amarillo oscuro | `#E5B800` | Hover de CTA |
| `qaway-accent-light` | Amarillo claro | `#FFE066` | Glows, backgrounds suaves |
| `qaway-dark` | Casi negro | `#0a0a0a` | Fondo principal |
| `qaway-dark-2` | Gris muy oscuro | `#121212` | Fondo secundario |
| `qaway-dark-3` | Gris oscuro | `#1a1a1a` | Cards, superficies |
| `qaway-dark-4` | Gris medio oscuro | `#222222` | Bordes, separadores |
| `qaway-muted` | Gris | `#71717a` | Texto secundario |
| `qaway-muted-light` | Gris claro | `#a1a1aa` | Texto terciario |

## Tipografía

- **Fuente principal**: Inter (300-900 weights)
- **Fuente mono**: JetBrains Mono (para datos técnicos, código)
- **Escala**: 
  - Display: 4.5rem (72px) — Hero titles
  - Display-md: 3.5rem (56px) — Section headers
  - Display-sm: 2.5rem (40px) — Sub-section headers
  - h2: 1.875rem (30px)
  - h3: 1.5rem (24px)
  - Body: 0.9375rem (15px)
  - Small: 0.8125rem (13px)
  - Tiny: 0.75rem (12px) — Meta, badges

## Espaciado

- **Base**: 4px
- **Escala**: 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128
- **Section padding**: py-24 (96px) o py-32 (128px)
- **Card padding**: p-6 (24px) o p-8 (32px)

## Componentes Base

### Botones
- **Primary**: bg-qaway-accent, text-black, px-8 py-3.5, rounded-xl, uppercase tracking-wider
- **Secondary**: border border-white/10, text-zinc-400, px-8 py-3.5, rounded-xl
- **Ghost**: text-zinc-400 hover:text-white, sin fondo
- **Tamaños**: sm (py-2 px-4), default (py-3.5 px-8), lg (py-4 px-10)

### Cards
- **Dark**: bg-[#1a1a1a], border border-white/5, rounded-2xl, hover:border-white/10
- **Elevated**: bg-black/40 backdrop-blur-xl, border border-white/10, rounded-2xl
- **Gradient**: bg-gradient-to-br from-white/5 to-white/[0.02], border border-white/10

### Secciones
- **Container**: max-w-7xl mx-auto px-6
- **Section gap**: gap-8 o gap-12 en grids
- **Section padding**: py-24 md:py-32

## Animaciones (Framer Motion)

- **Fade up**: initial opacity:0 y:20, animate opacity:1 y:0, duration 0.6
- **Stagger children**: staggerChildren 0.1
- **Scale on hover**: whileHover scale:1.02-1.05
- **Page transitions**: fade + slight slide
- **Navbar**: backdrop-blur-md on scroll, transition 0.5s

## Reglas de Layout

- **Header**: fixed top-0 w-full z-50, transparent → bg-black/90 on scroll
- **Hero**: min-h-screen, relative con overlay gradient
- **Grids**: responsive (1 col móvil → 2 col tablet → 3/4 col desktop)
- **Footer**: border-t white/5, grid 4 columnas

## Modo Oscuro / Claro

- **Default**: dark mode (bg-[#0a0a0a])
- **Sections alternadas**: bg-white para secciones de contraste (testimonios, stats)
- **Transiciones suaves** entre secciones oscuras y claras

## Responsive Breakpoints

- **sm**: 640px — Móvil landscape
- **md**: 768px — Tablet
- **lg**: 1024px — Desktop
- **xl**: 1280px — Desktop wide
- **2xl**: 1536px — Desktop ultra-wide
