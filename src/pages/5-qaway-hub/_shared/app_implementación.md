# app_implementación — Hub Shared (iconos + themes)

## 1. Alcance
- Solo `src/pages/5-qaway-hub/_shared/`. No se toca web pública ni lógica de estado.
- `6-qawaylab-theme` queda dormida como fábrica (puerto 6100). Solo se consumen sus tokens exportados.

## 2. Decisión
- No copiar iconos CRM en Creador. Unificar API, no dibujo.
- `HubIcon` recibe componente (`icon={Search}`), no string, para preservar tree-shaking Vite.
- `hubIcons.js` barrel curado con re-exports explícitos. Prohibido `export *`.
- Temas por `data-theme`: `hub-crm` (dark/naranja), `hub-creator` (light/violeta). Apps usan `var(--hub-*)` + `currentColor`.

## 3. Contrato Fase Hub -> Fase Web
- Fase Hub: ` _shared/icons + _shared/themes` + `data-theme` en shell Hub.
- Fase Web: promover a `src/components/ui/icons` + `src/styles/tokens` con re-export fino desde `_shared`. Misma API.
- Migración: primero CRM + Gestor v2 (afines). Creador mantiene tema propio.

## 4. Uso
```jsx
import { HubIcon } from '@/pages/5-qaway-hub/_shared/icons'
import { Search } from '@/pages/5-qaway-hub/_shared/icons/hubIcons'
<HubIcon icon={Search} size={18} />
```

## 5. Pendiente (requiere aplica)
- Set `data-theme` en shell Hub por workspace/cliente.
- Migrar 1 vista CRM + 1 Gestor v2 como piloto cosmético.
- Sin commit aún.
