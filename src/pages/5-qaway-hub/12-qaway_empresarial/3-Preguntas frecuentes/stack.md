# 🛠️ STACK: Arquitectura Técnica y Acoplamiento Nativo

## 1. Filosofía Arquitectónica: 100% Nativo en Qaway Web
La aplicación se integra como un módulo React 19 nativo dentro del ecosistema de Qaway Lab:
- **Cero Iframes**: Integrado en el árbol de componentes de React Router 7.
- **Sin contaminación global**: Clases de Tailwind CSS 4 limpias, estilos semánticos y tokens de color que respetan la identidad institucional MINEDU (`#b91c1c`, `#dc2626`, slate-50/900).
- **Aislamiento de Almacenamiento**: Claves locales `qaway_minedu_casuisticas_v1`, `qaway_minedu_supabase_url_v1` para evitar colisiones con la sesión de Qaway Lab o el Hub.

---

## 2. Tecnologías y Librerías

| Capa | Tecnología | Justificación y Reglas |
| :--- | :--- | :--- |
| **Framework UI** | React 19 + TypeScript | Rendimiento óptimo, tipado estricto y compatibilidad directa con el host. |
| **Enrutamiento** | React Router 7 | Montaje en `/hub/preguntas-frecuentes` con wrapper `PreguntasFrecuentesAppPage.jsx`. |
| **Estilos** | Tailwind CSS 4 + Scoped CSS | Clases utilitarias modernas, flexbox/grid responsive, microinteracciones suaves. |
| **Iconos** | `lucide-react` | Íconos canónicos con trazado SVG coherente (`stroke-width: 1.75`). |
| **Estado Local** | React Hooks (`useState`, `useMemo`, `useCallback`) | Estado 100% desacoplado y autónomo. |
| **Persistencia** | LocalStorage + Supabase JS v2 | Fallback sin conexión y sincronización en la nube opcional. |

---

## 3. Estructura de Directorios

```text
3-Preguntas frecuentes/
├── spec.md                       # Especificación funcional SDD
├── stack.md                      # Stack y arquitectura técnica SDD
├── task.md                       # Plan de tareas atómicas SDD
├── qa.md                         # Criterios de aceptación y QA SDD
├── agents.md                     # Reglas de desarrollo y candado visual
├── PreguntasFrecuentesAppPage.jsx# Wrapper para el host (AppRouter)
└── src/
    ├── PreguntasFrecuentesApp.tsx# Componente raíz desacoplado
    ├── types/
    │   └── casuistica.ts         # Contratos e interfaces TypeScript
    ├── data/
    │   └── defaultCasuisticas.ts # Banco de 14 casuísticas canónicas
    └── components/
        ├── HeaderBanner.tsx      # Cabecera roja con ondas y botón admin
        ├── DirectionsGrid.tsx    # Cuadrícula de 6 Direcciones pedagógicas
        ├── SearchBar.tsx         # Barra de búsqueda difusa, atajos y filtros
        ├── CasesList.tsx         # Contenedor de casuísticas y estados vacíos
        ├── CaseAccordion.tsx     # Tarjeta colapsable con 4 secciones semánticas
        ├── ManagementModal.tsx   # Modal de administración multitab (Form, List, Cloud)
        └── Toast.tsx             # Notificaciones no intrusivas
```
