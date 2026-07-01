# Arquitectura General — Qaway Lab Web

## Tech Stack

- **Framework**: React 18 + Vite 5
- **Styling**: Tailwind CSS 3
- **Routing**: React Router 6
- **Animations**: Framer Motion 11
- **Icons**: Lucide React
- **Deploy**: Hostinger (static via FTP)

## Estructura del Proyecto

```
src/
├── main.jsx                    # Entry point
├── App.jsx                     # Root component
├── index.css                   # Tailwind + estilos globales
├── router/
│   └── AppRouter.jsx           # React Router config
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx          # Navigation global
│   │   ├── Footer.jsx          # Footer completo
│   │   └── Layout.jsx          # Wrapper (Navbar + children + Footer)
│   └── ui/
│       ├── Button.jsx          # Botón reusable
│       ├── SectionTitle.jsx    # Título de sección con badge
│       ├── Card.jsx            # Card genérica
│       └── index.js            # Export unificado
├── pages/
│   ├── 1-inicio/InicioPage.jsx
│   ├── 2-estudio/EstudioPage.jsx
│   ├── 3-sistemas-digitales/OpsIAPage.jsx
│   ├── 4-academy/AcademyPage.jsx
│   ├── 5-qaway-hub/HubPage.jsx
│   ├── 6-recursos/RecursosPage.jsx
│   ├── 7-blog/BlogPage.jsx
│   ├── 8-landings/LandingsPage.jsx
│   └── NotFoundPage.jsx
└── data/
    └── navigation.js           # Estructura del menú
```

## Patrón de Routing

- **/**: Inicio
- **/estudio**: Estudio (Visual Lab, Branding, etc.)
- **/sistemas-digitales**: Sistemas Digitales
- **/academy**: Academy
- **/hub**: Qaway Hub
- **/recursos**: Recursos
- **/blog**: Blog
- **/landings**: Landings
