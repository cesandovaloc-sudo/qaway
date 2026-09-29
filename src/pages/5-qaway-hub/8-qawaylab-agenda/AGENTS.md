# AGENTS.md — Agenda (Qaway Lab)

Módulo del Hub Qaway Lab. La agenda **no es una app independiente**: consume la identidad, el tenant, el plan y los permisos del Hub, y su esquema vive en la cadena central de migraciones del monorepo.

> **Nota de lineage.** Hasta 2026-09-28 este archivo declaraba la agenda como *app independiente, portátil y vendible por separado*, con proyecto Supabase propio. Ese modelo **quedó derogado**. Queda aquí la doctrina vigente; el detalle del cambio está en `QawayLab_Agenda_Pro_Definicion_evolución_.md`, sección «De app independiente a módulo del Hub».

## Stack
- React 19 · Vite 8 · Tailwind v4 (CSS-first, `@theme` en `src/index.css`) · TypeScript 7
- Supabase (Postgres + RLS + funciones RPC). **No hay Edge Functions**: la lógica de servidor vive en Postgres, no en `supabase/functions`
- framer-motion · lucide-react · oxlint

## Dónde vive el esquema
- La agenda **no tiene proyecto Supabase propio** ni `.env` propio. Comparte base de datos con el resto del Hub.
- El esquema de la agenda está en la cadena central: `supabase/migrations/20260920102000_agenda_coupled_central.sql` y `20260928160000_fix_agenda_security_hardening.sql`.
- `businesses.tenant_id` referencia la tabla central `tenants`. **El aislamiento entre negocios se resuelve con `owner_id` + `tenant_id`; ambos deben quedar definidos sin ambigüedad.**
- Los archivos `supabase/migrations/0001_agenda_schema.sql` y `0002_booking_free_only.sql` de este directorio son **legado**. No aplicarlos a ninguna base. Verificar antes de tocar el esquema cuál es la cadena canónica.

## Integración
- Se monta dentro del Hub mediante `AgendaAppPage.jsx`. Ese es el punto de entrada real.
- Existe un `index.html` local **por residuo del diseño anterior**. No lo trates como una aplicación autónoma ni lo sirvas por separado.
- La conexión con otras apps es por composición dentro del Hub, no por enlaces externos.

## Comandos
- `npm run dev` (puerto 8500) · `npm run build` (`tsc --noEmit && vite build`) · `npm run lint` · `npm run typecheck`

## Reglas
- Estilos únicamente con tokens del `@theme`; nada de colores hardcodeados.
- **Validar en Postgres, no solo en React.** No hay backend propio: RLS y las funciones RPC son la única frontera de seguridad. Un chequeo que importa va en la base de datos.
- Las funciones públicas devuelven **lo mínimo**. Una función `SECURITY DEFINER` que retorna el tipo de la tabla se considera defecto hasta demostrar lo contrario.
- Planificar y pedir aprobación antes de aplicar cambios grandes.
- No hacer push, deploy ni cambios de esquema sin que el usuario lo pida explícitamente.
