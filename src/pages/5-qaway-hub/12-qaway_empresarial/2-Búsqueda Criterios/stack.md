# 🛠️ STACK: Arquitectura Técnica y Estrategia de Desacoplamiento

## 1. Filosofía Arquitectónica: Acoplamiento Nativo y Desacoplamiento Limpio
La aplicación está diseñada bajo el principio de **Módulo Autónomo Embebible** (Self-Contained Embeddable Component).
* **En el Host (`1-qawaylab-web`):** Se renderiza como un componente React nativo dentro de la ruta `/hub/criterios`, con soporte para lazy loading, error boundaries y suspensión de carga. **Sin iframes, sin hacks de CSS, sin scripts inyectados en runtime.**
* **Para Despliegue en Cloudflare Pages:** La totalidad de la lógica, componentes, estilos encapsulados y mocks residen exclusivamente dentro de esta carpeta (`2-Búsqueda Criterios/`). Para extraerla a Cloudflare, solo se clona o mueve la carpeta y se compila directamente con Vite.

---

## 2. Tecnologías y Librerías Core

| Capa | Tecnología | Justificación y Reglas |
| :--- | :--- | :--- |
| **Framework UI** | React 18/19 + TypeScript | Compatibilidad nativa con el host y tipado estricto sin tipos `any`. |
| **Bundler / Build** | Vite | Desarrollo ultra-rápido y compilación estática idéntica para host y Cloudflare. |
| **Estilos** | Tailwind CSS (Scoped) + CSS Variables | Uso de variables CSS semánticas para White-Label y diseño "Paper & Ink". Cero colisión con estilos globales de Qaway. |
| **Iconografía** | `lucide-react` | Íconos canónicos con envoltorio tipado `HubIcon` (tamaños normalizados: 14, 16, 18, 20, 24px). |
| **Manejo de Estado** | React Hooks (`useState`, `useMemo`, `useCallback`) | Estado 100% autocontenido sin acoplarse a Redux ni a Stores globales del host. |
| **Aislamiento de Sesión** | LocalStorage Prefijado | Claves de persistencia locales aisladas (ej. `qaway_criterios_theme`) para evitar contaminación con otras apps. |

---

## 3. Estructura de Directorios Desacoplada

```text
2-Búsqueda Criterios/
├── spect.md                      # Especificación funcional de requerimientos (SDD)
├── stack.md                      # Definición arquitectónica y stack técnico (SDD)
├── task.md                       # Plan de tareas atómicas e incrementales (SDD)
├── qa.md                         # Criterios de aceptación, pruebas y accesibilidad (SDD)
├── agents.md                     # Reglas de orquestación, jerarquías y candado visual
├── CriteriosAppPage.jsx          # Integrador Host (Montaje para Qaway Web)
├── index.html                    # Entry point para desarrollo local autónomo / Cloudflare
├── package.json                  # Dependencias y scripts standalone
└── src/
    ├── CriteriosApp.tsx          # Componente Raíz Desacoplado (Standalone Engine)
    ├── index.css                 # Variables Paper & Ink y reseteos locales
    ├── types/
    │   └── criterios.ts          # Contratos TypeScript e interfaces de datos
    ├── data/
    │   └── scenarios.ts          # Semillas de escenarios RAG (Laboral, EBITDA, MINEDU)
    └── components/
        ├── ui/
        │   └── HubIcon.tsx       # Wrapper tipado y seguro de Lucide Icons
        ├── header/
        │   └── CriteriosHeader.tsx # Barra superior, selector de temas y modal trigger
        ├── search/
        │   ├── SearchBar.tsx     # Barra de búsqueda con badges y atajos
        │   └── CollectionFilter.tsx # Filtros rápidos (Leyes, Excel, Directivas)
        ├── results/
        │   ├── RagAnswerCard.tsx # Síntesis generada con badges interactivos [1] [2] [3]
        │   └── StructuredComparisonTable.tsx # Matriz comparativa de fuentes
        ├── inspector/
        │   ├── PolymorphicInspector.tsx # Controlador de visores laterales
        │   ├── LegalInspector.tsx       # Visor de artículos normativos
        │   ├── ExcelInspector.tsx       # Grilla interactiva estilo Excel con barra fx
        │   └── DocumentInspector.tsx    # Visor de manuales y directivas
        └── modals/
            └── SqlArchitectureModal.tsx # Visor de código Supabase pgvector + Edge Function
```

---

## 4. Matriz de Compatibilidad: Host vs. Cloudflare Pages

| Característica | En Qaway Web (`1-qawaylab-web`) | En Cloudflare Pages (Standalone) |
| :--- | :--- | :--- |
| **Enrutamiento** | Sub-ruta `/hub/criterios` montada en `AppRouter.jsx` | Ruta raíz `/` servida como SPA por Cloudflare CDN. |
| **Shell / Layout** | Envuelto en `HubAccessGuard` y `ErrorBoundary` | Shell de pantalla completa autónomo (`index.html`). |
| **Backend / Datos** | Inicialmente semillas y simulador RAG local; preparado para Supabase Edge Function | Directo a Supabase Edge Function o Cloudflare Worker `pgvector`. |
| **Estilos** | Prefijados en contenedor `.qaway-criterios-root` | Carga de Tailwind CSS en el bundle de Cloudflare. |

---

## 5. Prevención de Riesgos de Acoplamiento (Skill `acoplamiento-web`)
* **Sin iframes:** Se renderiza directamente en el DOM para mantener velocidad de carga instantánea, SEO y responsividad fluida.
* **Failsafe de Carga:** Si en el futuro se conecta a Supabase Edge Functions, se incluye un timeout de seguridad (máximo 2.0s) con fallback a datos locales.
* **Cero Alias Rotos:** No se emplean alias absolutos que puedan romperse al mover la carpeta a otro repo; todos los imports internos usan rutas relativas `./` y `../`.
