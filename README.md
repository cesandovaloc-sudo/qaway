# QA-WAY-LAB-WORKSPACE

Estructura unificada del ecosistema digital de Qaway Lab.

## Estructura

- 🟦 **1-Web-Qaway-React/** — Aplicación React principal (src/ + docs/ + .opencode/)
- 🟧 **2-Marketing-y-Contenido/** — Marketing, campañas, assets y sistema IA
- 🟨 **3-Documentos-Estrategicos/** — Documentación de negocio y procesos

## Notas de migracion (rama tree)
- Stack: React 19.2 - Vite 8 - Tailwind CSS 4 (CSS-first, sin tailwind.config.js; tema en @theme de src/index.css).
- lucide-react fijado en ^0.475.0: la web usa iconos de marca (Instagram, WhatsApp, LinkedIn, Facebook, TikTok...) que lucide elimina en 1.x. NO subir a 1.x sin reemplazar esos ~150 usos.
- Puerto 4000, configurable con PORT.
