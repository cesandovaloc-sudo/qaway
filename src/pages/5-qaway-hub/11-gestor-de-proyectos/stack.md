# 🛠️ stack.md — Arquitectura & Tecnologías: Gestor de Proyectos Universal

**Módulo:** `src/pages/5-qaway-hub/11-gestor-de-proyectos`  
**Referencia Arquitectónica:** Estándar Maestro de [`10-qawaylab-inventario`](file:///C:/LEO/EMPRESAS/QAWAY%20LAB/1-QawayLab-Digital/1-qawaylab-web/src/pages/5-qaway-hub/10-qawaylab-inventario)

---

## 1. Stack Tecnológico Aprobado

- **Framework & Runtime:** React 19 / TypeScript / Vite 8.
- **Enrutamiento:** React Router Dom (subenrutador modular con rutas relativas).
- **Estilos:** Tailwind CSS 4 con `@theme` en `src/index.css`.
- **Iconografía:** Lucide React (`lucide-react`).
- **Animaciones & Microinteracciones:** CSS Transitions nativas + Motion/GSAP.
- **Persistencia de Datos:** Mock Store reactivo en memoria con auto-guardado en `localStorage` (`qaway_projects_v1`).

---

## 2. Arquitectura de Shell (Chasis Unificado del Hub)

Siguiendo la arquitectura probada de `10-inventario`, el Gestor de Proyectos adopta el **Shell Oficial de Qaway Hub**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        HUB SHELL (`h-dvh overflow-hidden`)             │
├─────────────────┬──────────────────────────────────────────────────────┤
│                 │ TOPBAR / HEADER (shrink-0, fuera del scroller)       │
│ SIDEBAR         │ • Toggle menú lateral (hamburguesa)                  │
│ COLAPSABLE      │ • Waffle de Apps (AppSwitcherDropdown)               │
│ • 256px abierto │ • Selector de 4 temas (blanco, grises, contraste, ...)│
│ • 72px cerrado  ├──────────────────────────────────────────────────────┤
│                 │ MAIN CONTENT (`flex-1 min-h-0 overflow-y-auto`)      │
│                 │ • Vistas del enrutador interno (<Outlet />)          │
│                 │ • Scroll independiente sin saltos de topbar          │
└─────────────────┴──────────────────────────────────────────────────────┘
```

### Componentes Estructurales Replicados:
1. `src/app/layouts/AppLayout.tsx`: Chasis principal gobernado por el estado `collapsed` y `themeMode`.
2. `src/components/header/Header.tsx`: Cabecera con selector de proyectos, buscador global y alternador de tema.
3. `src/components/sidebar/Sidebar.tsx`: Menú lateral jerárquico con navegación por módulos.
4. `GestorProyectosAppPage.jsx`: Vista contenedora de entrada con `ErrorBoundary`, `Suspense` y contenedor scoped `.qaway-gestor-proyectos-root`.

---

## 3. Protocolo de Acoplamiento Web Oficial

En cumplimiento de [`acoplamiento-web`](file:///C:/LEO/EMPRESAS/QAWAY%20LAB/1-QawayLab-Digital/1-qawaylab-web/.agents/skills/acoplamiento-web/SKILL.md):

1. **Aislamiento de Rutas:** Montaje en `src/router/AppRouter.jsx` bajo `/hub/gestor-proyectos/*`.
2. **Resolución de Alias `@/`:** Inclusión en `vite.config.js` (`resolve.alias.customResolver`):
   ```javascript
   if (importer && importer.replace(/\\/g, '/').includes('11-gestor-de-proyectos')) {
     const target = path.resolve(__dirname, 'src/pages/5-qaway-hub/11-gestor-de-proyectos/src', source);
     return this.resolve(target, importer, { skipSelf: true, ...options });
   }
   ```
3. **Aislamiento de Storage:** Llave propia `qaway_gestor_proyectos_state` para evitar conflictos con otros módulos.
