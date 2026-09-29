# INIT — QawayLab Agenda

Punto de entrada documental de la aplicación. Si acabas de llegar al proyecto, empieza por aquí.
Documento técnico del módulo. Su función es la de *readme* operativo: qué es la app, qué hace, cómo está construida, qué reglas rigen el trabajo aquí y qué está pendiente.

---

## Qué es

`8-qawaylab-agenda` es una **agenda de citas white-label y multi-tenant**. Un negocio configura sus servicios y disponibilidad; sus clientes reservan un horario público sin crear cuenta. El negocio administra desde un panel. El branding (logo, colores, nombre) se configura por tenant, así que la misma app sirve a negocios distintos sin forks.

**Contexto comercial:** opera en Perú. **No hay pagos integrados** — es una decisión de diseño deliberada, el flujo público es siempre gratuito. Existe una guardia explícita en la base de datos que rechaza bookings de pago sin coordinación previa.

---

## Stack

| | |
|---|---|
| Frontend | React + TypeScript + Vite, enrutado por HashRouter |
| Datos | Supabase — Postgres, Auth, RLS, Realtime, RPC |
| Estilo | Tailwind con variables CSS |
| Backend | Ninguno propio. La lógica vive en la base de datos vía RPC |
| Despliegue | Hosting estático. El único control de caché es una regla de servidor |

**Consecuencia de arquitectura que hay que tener siempre presente:** no hay backend. **La seguridad de esta app es exactamente la seguridad de sus políticas RLS y de sus funciones.** Cualquier endpoint es público; lo único que separa a un tenant de otro es el `auth.uid()` y el scope de cada policy.

---

## Módulos

Lo que existe son **4 páginas**. Cualquier otro módulo es diseño, no código.

| Módulo | Estado | Qué resuelve |
|---|---|---|
| **Página de entrada** | Implementado | `HomePage`: presentación y enlace de reserva |
| **Agenda pública y reserva** | Implementado | `PublicBookingPage`: catálogo, horarios disponibles, reserva sin cuenta |
| **Gestión de la cita** | Implementado | `ManageBookingPage`: ver, reprogramar o cancelar con `cancel_token` |
| **Panel de administración** | Implementado | `AdminPanelPage`: servicios, horarios, excepciones, reservas |
| **Identidad visual** | Parcial | Color y marca por negocio. **No** hay `theming.tsx` ni `lib/`; el tema vive en las páginas |
| **Equipo y profesionales** | **No existe** | Sin tabla de personal, sin `staff_id` en `bookings`. El "filtro de personal" del panel no puede existir |
| **CRM de clientes** | **No existe** | Los datos de cliente viven dentro de cada `booking`, sin entidad propia |
| **Notificaciones** | **Parcial** | Tabla `reminders` y trigger de servidor. Sin envío real verificado |
| **Reportes** | **No existe** | Sin módulo analítico |

---

## Estructura de `src/agenda/`

El módulo es **muy pequeño: 8 archivos**. No hay carpeta `components/`, ni `lib/`, ni barrel files.

```
types.ts                      Interfaces de dominio
adapters/agendaAdapter.ts     Única capa que habla con Supabase
context/AgendaContext.tsx     Estado global: sesión, disponibilidad, generador de slots, create/cancel
pages/HomePage.tsx            Página de entrada del módulo
pages/PublicBookingPage.tsx   Agenda pública y reserva sin cuenta
pages/ManageBookingPage.tsx   Gestión de la cita mediante cancel_token
pages/AdminPanelPage.tsx      Panel de administración
utils/calendarLinks.ts        Enlaces ICS y Google Calendar
```

**Por qué importa:** `agendaAdapter.ts` es el único archivo que debe conocer la forma de la base de datos. Si una regla de negocio aparece en un componente, está en el lugar equivocado.

**El modelo de datos son 6 tablas:** `businesses`, `event_types`, `schedules`, `availability_exceptions`, `bookings`, `reminders`. No existe tabla de personal ni de recursos, y `bookings` no tiene `staff_id` ni `resource_id`. La asignación de profesionales **no está construida**.

---

## Comandos

| | |
|---|---|
| `npm install` | **No ejecutar sin aprobación.** Requiere red. No hay `node_modules` en el repo |
| `npm run dev` | Servidor local |
| `npm run build` | Build de producción |
| `npm run typecheck` | `tsc --noEmit`. **Nunca se ha ejecutado en este proyecto** |
| `supabase` CLI | **No conectar.** El acceso a la base va exclusivamente por un agente especializado |

No hay suite de tests. **Cero archivos de test en el módulo** (`*.test.*` / `*.spec.*`). Toda la remediación de la auditoría run-1 se validó por lectura y inspección, no por ejecución.

`npm run build` ejecuta `tsc --noEmit && vite build`: el typecheck va incluido, así que un build fallido es un typecheck fallido.

---

## Reglas de trabajo en este proyecto

Estas reglas vienen del usuario y **prevalecen sobre lo que diga cualquier skill o herramienta**.

**Primero el plan, después la pregunta.** Antes de cambiar código o estructura, escribe el plan y espera un **"aplica"** explícito. Una excepción: correcciones de error evidente, que van directas.

**Documentación bajo `doc/`.** Las decisiones, la bitácora y el estado se documentan aquí, no en un chat que se pierde. La convención de nombres de archivo es para `doc/`; los nombres que una skill exija en el interior de sus carpetas se respetan tal cual.

**El Scope es el repository actual.** No sales de él. No hay repos externos, no hay carpetas hermanas, no hay nada "por ahí".

**El `.env` no se lee.** Nunca. Ni para comprobar si existe. Su contenido es secreto y no es asunto tuyo.

**Un solo push, y no es tuyo.** NUNCA haces push. Quien lo hace es un agente específico. Los commits sí se hacen, siempre del alcance total del trabajo, nunca parciales.

**Nada de comandos destructivos.** Ni `reset`, ni `revert`, ni `clean`, ni `restore`, ni force. Si un archivo se rompió, se escribe el contenido correcto. Nada de `node_modules` inexistente, nada de build que no compila, nada de stubs que disimulen el hueco.

**Fuera del repo, solo si hay un motivo real.** En general, no. La carpeta de temporales del sistema es la excepción.

**Si el trabajo se sale de tu competencia, se avisa.** Un tema de Supabase, base de datos o despliegue no se improvisa: se señala y se deriva.

**Las tres preguntas obligatorias antes de construir algo:** ¿qué hace, para quién es y por qué? Una función sin esas tres no debería existir.

**Alcance del proyecto vs. alcance del repo.** Este módulo cuelga de una app de inventario mayor. Lo que se toca para arreglar la agenda se documenta, pero **no se cambia de más**. Un fix de agenda no modifica el sidebar del Hub.

---

## Estado de la auditoría de seguridad

La auditoría **run-1 está cerrada**. El detalle completo está en `doc/security-audit/run-1/`.

**Resultado:** 11 hallazgos canónicos. **3 confirmados por código y corregidos**, 8 bloqueados en validación del owner porque dependen de la configuración desplegada.

**Las 4 correcciones de cliente** están en `REMEDIATION-APPLIED.md` §1. Las **6 correcciones de backend** las aplicó un agente especializado en `2754cbd8` y están registradas en §7.

**Lo que sigue abierto y conviene mirar primero:** hay dos cadenas de migración para el mismo esquema de agenda, y la migración de hardening apunta a la central mientras nombra políticas que existen en la local. Si alguien aplica los archivos locales a una base nueva, reconstruye las políticas vulnerables que la auditoría eliminó. Detalle en `REMEDIATION-APPLIED.md` §7.

---

## Antes de tocar esta app

Tres cosas que van a morderte si no las tienes presentes:

1. **No hay backend.** Si una comprobación de seguridad o de negocio importa, va en una policy de Postgres, no en un componente de React. Valida en cliente, que es UX, y valida también en la base de datos, que es seguridad. Lo segundo es lo que importa.

2. **`cancel_token` es lo único que prueba que alguien es el dueño de una cita.** El portal público no tiene sesión. Ese token es de un solo uso, expira a los 30 días, y se rota al reprogramar. Trátalo como una credencial.

3. **`businesses.timezone` se guarda pero no se usa en los cálculos.** Las diferencias horarias se resuelven en el cliente. Es una fuente conocida de errores en la reserva de un cliente overseas. No está arreglado.
