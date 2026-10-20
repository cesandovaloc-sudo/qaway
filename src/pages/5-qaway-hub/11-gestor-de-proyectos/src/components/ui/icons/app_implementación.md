# app_implementación — Icons + Themes Hub (canónico v4)

## 1. Norma (como debe ser)
- Canónicos: `src/components/ui/icons/*.tsx/.ts` + `src/styles/hub/*.css`.
- `HubIcon.tsx` tipado, recibe `icon: LucideIcon`. Prohibido mapa string masivo.
- Barrel con re-exports explícitos. Prohibido `export *`.
- Temas por `data-theme` con `var(--hub-*)`. Apps usan tokens, no hex.
- `6-qawaylab-theme` solo fábrica dormida.

## 2. Compatibilidad Hub (página por página)
- `src/pages/5-qaway-hub/_shared/` solo re-exporta canónicos. Sin lógica duplicada.
- Migración piloto: 1 vista CRM + 1 Gestor v2, solo cosmético.

## 3. Uso
```tsx
import { HubIcon } from '@/components/ui/icons'
import { Search } from '@/components/ui/icons/hubIcons'
<HubIcon icon={Search} size={18} />
```
