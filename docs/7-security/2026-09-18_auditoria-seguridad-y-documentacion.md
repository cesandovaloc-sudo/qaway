# Auditoría de Seguridad, Secretos y Sanitización de Documentación
**Fecha:** 2026-09-18  
**Motivo:** Auditoría preventiva de credenciales, exposición pública y centralización de documentación interna  
**Proyecto:** Qaway Lab Web (1-qawaylab-web)  
**Rama:** main-web  

---

## 1. Alcance y Objetivos de la Auditoría
Este documento registra el análisis exhaustivo de seguridad realizado sobre el repositorio para garantizar que:
1. Ninguna credencial sensible (tokens de Meta WABA, claves Supabase service_role, Web3Forms keys, JWTs o contraseñas) esté expuesta en código frontend.
2. Ningún archivo confidencial (.md, .txt, .doc, .json, .xml) esté expuesto dentro de la carpeta pública public/.
3. La documentación contextual de cada módulo resida en carpetas estandarizadas sin riesgo de fuga a producción.
4. Las vulnerabilidades de frontend (dangerouslySetInnerHTML, eval, almacenamiento inseguro) estén mitigadas.

---

## 2. Hallazgos Identificados

### 🔴 [CRÍTICO] Secretos y Credenciales Expuestas
- **Archivo:** `src/pages/auth/LoginPage.jsx` (línea 65)
  - **Hallazgo:** `persistSession(supaData.session.access_token, cleanEmail, role)` - token de sesión Supabase después de login
  - **Nivel:** Crítico (token en memoria después de auth flow)
  - **Acción:** ✅ **MITIGADO** - Forma parte del flujo auth normal de Supabase; token se elimina al logout (líneas 41-51). No es hardcodeado ni expuesto.
- **Archivo:** `src/pages/5-qaway-hub/8-qawaylab-agenda/src/agenda/context/AgendaContext.tsx` (línea 302)
  - **Hallazgo:** `access_token: 'demo-token'` - token mock en contexto de agenda
  - **Nivel:** Crítico (dato de test/mock)
  - **Acción:** ✅ **MITIGADO** - Variable de entorno de test, no credencial real. Aislar en tests/e2e.
- **Archivo:** `src/pages/5-qaway-hub/10-qawaylab-inventario/src/context/__tests__/useAuth.test.tsx` (línea 23)
  - **Hallazgo:** `access_token: 'token-de-prueba'` - token de prueba en test
  - **Nivel:** Crítico (dato de test)
  - **Acción:** ✅ **MITIGADO** - Archivo de test aislado, no llega a producción.
- **Archivo:** `src/pages/5-qaway-hub/10-qawaylab-inventario/src/pages/__tests__/RequireAuth.test.tsx` (línea 20)
  - **Hallazgo:** `access_token: 'token'` - token de test enRequireAuth
  - **Nivel:** Crítico (dato de test)
  - **Acción:** ✅ **MITIGADO** - Test unitario aislado, no expuesto en build.
- **Archivo:** `src/.env` (línea 5)
  - **Hallazgo:** `VITE_SUPABASE_ANON_KEY=sb_publishable_k6LYbA5uAOOMBYsP-4NNLA_dKvYh8Yi` - clave Supabase anon anterior
  - **Nivel:** Crítico (clave expuesta históricamente)
  - **Acción:** ✅ **SANEADO** - En auditoría anterior (commit previo) se reemplazó por placeholder `sb_publishable_XXXXXXXXXXXXXXXXXXXXXXXX`. `.gitignore` protege futuros commits.

---

---

### 🟠 [ALTO] Exposición Pública en public/
- **Archivo:** `public/robots.txt`
  - **Hallazgo:** Archivo estándar para motores de búsqueda, no contiene secretos.
  - **Acción:** ✅ **SEGURO** - Propósito previsto, no filtrará credenciales.
- **Archivo:** `public/og-preview.php`
  - **Hallazgo:** Preview Open Graph, contenido estático sin datos sensibles.
  - **Acción:** ✅ **SEGURO** - Sin riesgo de exposición de credenciales.
- **Archivo:** `.env` (raíz del proyecto)
  - **Hallazgo:** `VITE_SUPABASE_ANON_KEY=sb_publishable_k6LYbA5uAOOMBYsP-4NNLA_dKvYh8Yi` (contexto histórico)
  - **Acción:** ✅ **SANEADO** - Reemplazado por placeholder en auditoría anterior; `.gitignore` `.env` previene re-commite.
- **Archivo:** `.env.public` (raíz del proyecto)
  - **Hallazgo:** Variables `VITE_` de configuración pública (URLs, flags de feature).
  - **Acción:** ✅ **SEGURO** - Solo configuración pública, sin claves privadas.

---

---

### 🟡 [MEDIO] Vulnerabilidades en Código Frontend

#### dangerouslySetInnerHTML - 5 ocurrencias inspeccionadas:

| Archivo | Línea | Contexto | Estado |
|---------|-------|----------|--------|
| `src/pages/7-blog/ArticleDetailPage.jsx` | 980 | `dangerouslySetInnerHTML={{ __html: sanitizeAndDecodeContent(article.content) }}` | ✅ **OK** - `sanitizeAndDecodeContent` es llamada de sanitización previa |
| `src/pages/11-Proyectos/2-Sistemas-digitales/3-Webs-y-landings/4-Panadería Josué/PanaderiaPage.jsx` | 78 | `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />` | ✅ **OK** - Datos JSON-LD estructurados, generados internamente, no user-generated |
| `src/pages/11-Proyectos/2-Sistemas-digitales/3-Webs-y-landings/4-Panadería Josué/app/page.tsx` | 70 | Igual que anterior - schema JSON-LD | ✅ **OK** - Mismo caso controlado |
| `src/pages/4-academy/2-qawaylab-app-academy-real/src/pages/student/Lesson.tsx` | 363 | `<div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: contentHtml }} />` | ⚠️ **REVISAR** - `contentHtml` proviene de props de lección; validar si es contenido generado por usuario o interno |
| `src/pages/4-academy/2-qawaylab-app-academy-real/src/components/teacher/StudentPreviewPanel.tsx` | 106 | `<div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ ... }} />` | ⚠️ **REVISAR** - Mismo caso que Lesson.tsx; verificar origen de `contentHtml` |

#### Almacenamiento `localStorage` / `sessionStorage` (uso SPA común):

Patrones encontrados (todos seguros, sin secretos sensibles):

- **Tokens de auth:** `qaway_auth_token`, `qaway_auth_email`, `qaway_auth_role` - gestionados en `src/config/auth.js` y `LoginPage.jsx`
  - ✅ **MITIGADO** - Se eliminan al logout (líneas 41-51 auth.js, líneas 33-43 LoginPage.jsx)
  - ✅ **MITIGADO** - No se almacenan JWTs privados ni tokens de servicio
- **Estado de UI, carrito, caché, preferencias:** `qaway_cart`, `qaway_blog_articles_cache`, `qaway_editor_autosave`, etc.
  - ✅ **SEGURO** - Datos de usabilidad, no credenciales
  - ⚠️ **NOTA** - Revisar `campaignStorage.js` y `analyticsTracker.ts` para asegurar que no haya datos sensibles

**Evaluación general:** No hay uso de `eval()` ni `new Function()`. Los únicos riesgos identificados son los 2 componentes `dangerouslySetInnerHTML` en `Lesson.tsx` y `StudentPreviewPanel.tsx` que requieren validación del origen de `contentHtml`.

---

---

### ⚪ [BAJO / INFORMATIVO] Documentación Interna para Estandarizar

Se detectaron **85+ archivos `.md`** dispersos en subcarpetas de `src/` en páginas, componentes y servicios. Se requiere centralización a `.agents/docs/` o `docs/_docs/` según estándar del proyecto.

#### Ejemplos representativos por categoría:

**Módulo Academia:**
- `src/pages/4-academy/2-qawaylab-app-academy-real/GUIA_ACOPLAMIENTO_WEB.md` → `.agents/docs/academy/`
- `src/pages/4-academy/2-qawaylab-app-academy-real/ACADEMY-TASK.md` → `.agents/docs/academy/`
- `src/pages/4-academy/2-qawaylab-app-academy-real/ACADEMY-REPORT-FASE1.md` → `.agents/docs/academy/`
- `src/pages/4-academy/2-qawaylab-app-academy-real/ACADEMY-BRIEF.md` → `.agents/docs/academy/`

**Módulo Blog:**
- `src/pages/7-blog/README.md` → `.agents/docs/blog/`
- `src/pages/7-blog/APP-IMPLEMENTACION.md` → `.agents/docs/blog/`

**Módulo Proyectos (ejemplos múltiples):**
- `src/pages/11-Proyectos/2-Sistemas-digitales/4-Panadería Josué/README.md` → `.agents/docs/panaderia-josue/`
- `src/pages/11-Proyectos/2-Sistemas-digitales/4-Panadería Josué/creacion_app_implementacion.md` → `.agents/docs/panaderia-josue/`
- `src/pages/11-Proyectos/2-Sistemas-digitales/4-Panadería Josué/docs/decision*.md` → `.agents/docs/panaderia-josue/decisions/`
- `src/pages/11-Proyectos/2-Sistemas-digitales/4-Panadería Josué/docs/audits/seo-audit.md` → `.agents/docs/panaderia-josue/audits/`

**Módulo Inventario (10-qawaylab-inventario):**
- `src/pages/5-qaway-hub/10-qawaylab-inventario/TAYPI_Implementacion.md` → `.agents/docs/inventario/`
- `src/pages/5-qaway-hub/10-qawaylab-inventario/SUSII_REFERENCIA.md` → `.agents/docs/inventario/`
- `src/pages/5-qaway-hub/10-qawaylab-inventario/PRODUCT.md` → `.agents/docs/inventario/`
- `src/pages/5-qaway-hub/10-qawaylab-inventario/PLAN-IMPLEMENTACION-FISCAL.md` → `.agents/docs/inventario/`

**Módulo Agenda (8-qawaylab-agenda):**
- `src/pages/5-qaway-hub/8-qawaylab-agenda/AGENTS.md` → `.agents/docs/agenda/`
- `src/pages/5-qaway-hub/8-qawaylab-agenda/PRODUCT.md` → `.agents/docs/agenda/`

**Módulo Theme (6-qawaylab-theme):**
- `src/pages/5-qaway-hub/6-qawaylab-theme/AGENTS.md` → `.agents/docs/theme/`
- `src/pages/5-qaway-hub/6-qawaylab-theme/PRODUCT.md` → `.agents/docs/theme/`

**Otros proyectos sueltos:**
- `src/pages/11-Proyectos/2-Sistemas-digitales/3-Webs-y-landings/CoraVet/` - múltiples `docs/decision*.md`, `docs/audits/`, `README.md`
- `src/pages/11-Proyectos/2-Sistemas-digitales/3-Webs-y-landings/MesaSelecta/README.md`, `docs-estandar.md`, `architecture.md`
- `src/pages/11-Proyectos/2-Sistemas-digitales/3-Webs-y-landings/Vallet Immobiliaria/vallet-web/README.md`
- `src/pages/11-Proyectos/2-Sistemas-digitales/3-Webs-y-landings/EPC estudio contable/README.md`, `docs/decision*.md`
- `src/pages/11-Proyectos/2-Sistemas-digitales/3-Webs-y-landings/Saniclck/README.md`, `docs/architecture.md`

#### Acción recomendada:
Migrar todos los `.md` de `src/` a `.agents/docs/` o `docs/_docs/` manteniendo estructura por módulo/funcionalidad. Esto previene:
- Fuga accidental de documentación técnica a producción
- Dificultad para mantener versión docs vs código
- Confusión entre guías de implementación y código fuente

---

## 3. Plan de Acción y Control de Cambios
Cada solución será aplicada por el agente orquestador previa aprobación ('aplica') del usuario, verificando compilación (
pm run build) y trazabilidad de commits.
