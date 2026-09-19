# app_implementación — Hub Shared (compatibilidad)

## 1. Norma (como debe ser)
- Canónicos v4: `src/components/ui/icons/` + `src/styles/hub/`.
- Este `_shared` solo re-exporta. Prohibida lógica duplicada aquí.

## 2. Alcance
- Cero toques a páginas CRM/Gestor/Creador/web. Migración página por página pendiente.
- `6-qawaylab-theme` dormida como fábrica.

## 3. Uso
```tsx
import { HubIcon } from '@/components/ui/icons'
import { Search } from '@/components/ui/icons/hubIcons'
<HubIcon icon={Search} size={18} />
```
Compat temporal: `@/pages/5-qaway-hub/_shared/icons` sigue válido por re-export.
