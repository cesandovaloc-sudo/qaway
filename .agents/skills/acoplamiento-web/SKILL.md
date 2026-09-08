---
name: acoplamiento-web
description: Protocolo oficial para integrar y acoplar aplicaciones y módulos independientes (SaaS, microservicios, dashboards, SDKs) dentro de la Web principal de Qaway Lab. Incluye reglas de enrutamiento relativo, aislamiento de sesiones Supabase, consistencia de tokens visuales, y registro obligatorio de fallas y soluciones.
license: Qaway Lab Proprietary
---

# Qaway Lab Web Coupling Skill (Acoplamiento Web Oficial)

Este skill define el **protocolo técnico y metodológico obligatorio** para acoplar cualquier aplicación independiente, micro-frontend o módulo SaaS dentro del ecosistema central de Qaway Lab (`1-qawaylab-web`).

---

## 1. Principios Obligatorios de Acoplamiento

1. **Aislamiento de Rutas (Subrouting Relativo)**:
   - Toda app acoplada debe montarse bajo una ruta prefijada (ej. `/academy/app/*`, `/hub/pagos/*`, `/hub/agenda/*`).
   - El enrutador interno de la app debe usar rutas relativas o soportar base path sin colisionar con el `AppRouter.jsx` principal.

2. **Aislamiento de Almacenamiento & Sesiones**:
   - Cada aplicación con cliente Supabase propio debe usar un `storageKey` independiente (ej. `qaway_pagos_auth_token`, `qaway_academy_auth_token`) para evitar que el cierre o inicio de sesión en un módulo desconecte o bloquee a los demás.

3. **Compatibilidad de Tokens y CSS**:
   - Los estilos globales de la app hija deben encapsularse o alinearse con Tailwind CSS 4 y `@theme` para evitar contaminación cruzada de fuentes, márgenes o reseteos de formulario.

4. **Failsafe & Timeouts de Carga**:
   - Todo contexto o hook de datos (`useAuth`, `useData`) debe implementar un temporizador de seguridad (máximo 1.2s - 2.5s) que fuerce `loading: false` para evitar pantallas en blanco infinitas ante retardos de red.

---

## 2. Metodología de Registro de Fallas y Soluciones (Log de Acoplamiento)

Cada vez que se acople un módulo, el agente debe auditar y documentar en la bitácora del proyecto:
1. **Falla detectada**: Causa raíz (puerto hardcodeado, timeout, colisión de rutas, etc.).
2. **Impacto**: Qué fallaba en la experiencia de usuario.
3. **Solución técnica aplicada**: Código exacto modificado.
4. **Validación**: Test de compilación y verificación de ruta activa.

---

## 3. Registro Histórico de Fallas y Soluciones de Acoplamiento

| ID | Módulo | Falla Detectada | Causa Raíz | Solución Aplicada |
| :--- | :--- | :--- | :--- | :--- |
| **AC-01** | Academy | `ERR_CONNECTION_REFUSED` | Puerto `:7000` hardcodeado en `navigation.js`, `.env` y botones de la landing. | Reemplazo por rutas internas relativas `/academy/app/acceder` y `/academy/app/registro`. |
| **AC-02** | Academy | Pantalla blanca infinita en carga inicial | `getSession()` y `fetchProfile` de Supabase bloqueaban el render ante latencia de red. | Inyección de temporizador de seguridad (1.2s timeout) y `storageKey: 'qaway_academy_auth_token'`. |
| **AC-03** | Academy | Super Administrador no reconocido | `profiles.role` devolvía `null` y `AdminLayout` expulsaba al admin maestro. | Integración de `isSuperAdmin(email)` con bypass automático a `/admin`. |
| **AC-04** | Pagos | Módulo desacoplado / standalone | Componentes en `3-qawaylab-pagos` sin wrapper de página ni ruta en `AppRouter.jsx`. | Creación de página contenedora `PagosHubPage.jsx` y montaje en `/hub/pagos`. |

---

## 4. Checklist Paso a Paso para Acoplar una Nueva App

- [ ] **Paso 1: Exploración del Módulo**: Auditar dependencias, `package.json`, exports y estado de `src/`.
- [ ] **Paso 2: Creación de Componente de Entrada**: Crear la vista integradora (ej. `[Nombre]HubPage.jsx`) con `lazy loading`.
- [ ] **Paso 3: Registro en `AppRouter.jsx`**: Añadir la ruta correspondiente con `renderPublicPathRoute` o `ProtectedRoute`.
- [ ] **Paso 4: Auditoría de Tokens y Estilos**: Verificar que no existan conflictos de CSS ni desbordamientos horizontales.
- [ ] **Paso 5: Compilación**: Ejecutar `npm run build` y verificar 0 errores.
- [ ] **Paso 6: Commit con Formato Oficial**: Registrar con `YYYY-MM-DD_HH:MM_A22@@@_motivo`.
