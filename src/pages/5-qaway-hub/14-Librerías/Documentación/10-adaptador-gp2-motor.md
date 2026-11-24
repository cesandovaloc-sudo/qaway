# 10-adaptador-gp2-motor.md

## Escalón 1: adaptador de solo lectura GP2 → motor compartido

**Estado:** implementado y probado (Escalón 1 de 2).
**Fecha:** 2026-11-24.
**Alcance:** `src/pages/5-qaway-hub/14-Librerías/services/adapters/gp2Adapter.js`.

---

## 1. Qué resuelve este escalón

El Gestor de Proyectos 2 tiene hoy su propia campanita, su propio almacenamiento
(`qaway-gp-notifications-v1`) y su propio evento (`qaway-gp-notifications-updated`).
El motor del Hub tiene bandeja, prioridades, canales, perfiles y auditoría, pero no
recibía ninguna alerta real de GP2.

Este escalón **proyecta** las alertas de GP2 en el motor sin tocar GP2. No reemplaza
todavía la persistencia de GP2: eso es el Escalón 2, cuando la identidad real esté
resuelta contra Supabase.

### Qué sí hace

- Lee la clave local de GP2 de forma tolerante (storage ausente, JSON corrupto o
  formato inesperado devuelven lista vacía).
- Traduce prioridad, categoría, descripción y estado de lectura al modelo del motor.
- Inserta las alertas en el motor con ids deterministas (`gp2-<id original>`).
- Es idempotente: una sincronización repetida no duplica nada.
- Conserva el estado de lectura del motor: una alerta ya importada no se sobrescribe.
- Expone un `watch` que sincroniza al arrancar y en cada evento de GP2.

### Qué no hace (por diseño)

- **No escribe en GP2.** Su campanita y su `localStorage` siguen siendo suyos.
- **No toca el diseño ni los componentes de GP2.**
- **No envía correo, WhatsApp ni push**: las alertas importadas entran con
  `channels: ['internal']` y sin auditoría de entrega, porque no hubo envío.
- **No inventa destinatarios.** GP2 no expone usuarios en su capa de notificaciones;
  por eso la identidad se inyecta desde el consumidor (ver sección 4).

---

## 2. Archivos

| Archivo | Rol |
|---|---|
| `services/adapters/gp2Adapter.js` | Adaptador completo: lectura, mapeo, sincronización y observación del evento de GP2. |
| `services/adapters/gp2Adapter.test.ts` | Pruebas de mapeo, idempotencia, lectura tolerante y perfil por defecto. |
| `services/notificationEngine.js` | Nueva API `importNotifications(items)`: puerta de entrada de los adaptadores. |
| `Documentación/10-adaptador-gp2-motor.md` | Este contrato. |

---

## 3. Contrato del adaptador

### Constantes

| Constante | Valor | Uso |
|---|---|---|
| `GP2_STORAGE_KEY` | `qaway-gp-notifications-v1` | Clave de GP2 que se lee. |
| `GP2_UPDATED_EVENT` | `qaway-gp-notifications-updated` | Evento que GP2 emite al cambiar su campanita. |
| `GP2_APP_SLUG` | `gestor_proyectos` | Slug del motor que reciben las alertas. |
| `GP2_ID_PREFIX` | `gp2-` | Prefijo que evita colisiones con ids del motor. |

### Funciones

| Función | Firma | Efecto |
|---|---|---|
| `readGp2Notifications(storage?)` | `→ AppNotification[]` | Lectura pura y tolerante. |
| `mapGp2Notification(item, options?)` | `→ notificación del motor \| null` | Traducción sin efectos secundarios. |
| `syncGp2Notifications(options?)` | `→ { added, skipped, total, mapped }` | Inserta en el motor lo que falte. |
| `watchGp2Notifications(onSync, options?)` | `→ () => void` | Sincroniza al montar y en cada evento; devuelve el `unsubscribe`. |

### Opciones

| Opción | Tipo | Por defecto | Para qué |
|---|---|---|---|
| `recipientId` | `string` | perfil activo del motor | Destinatario real; se inyecta desde el consumidor. |
| `tenantId` | `string` | tenant de `getSettings()` | Aísla las alertas por organización. |
| `resolveLink` | `(item) => string` | sin enlace | Solo GP2 conoce sus rutas; el consumidor las resuelve. |
| `storage` | objeto tipo `localStorage` | `localStorage` del navegador | Pruebas o entornos sin storage. |

### API nueva del motor: `importNotifications(items)`

```js
import { importNotifications } from '../notificationEngine'

const result = importNotifications([/* notificaciones ya normalizadas */])
// { ok: true, added: 2, skipped: 0, notifications: [...] }
```

Reglas:

1. Solo inserta; **nunca** sobrescribe un id existente (protege el estado de lectura).
2. Descarta entradas sin `id`, `title`, `recipient_id` o `app_slug`
   (reutiliza `validateNotificationInput`).
3. No ejecuta transportes ni genera `delivery`/`emailData`/`whatsappData`.
4. Emite un único `qaway-notification-hub:changed` por lote.
5. Devuelve cuántas entraron y cuántas se omitieron.

---

## 4. Identidad: el límite real de este escalón

GP2 **no expone destinatarios** en su capa de notificaciones: sus alertas no llevan
usuario, solo `id`, `title`, `priority`, `category`, `targetModule` y `read`. El motor,
en cambio, exige `recipient_id` y `tenant_id`.

Decisión aplicada, sin inventar datos:

1. `mapGp2Notification` recibe `recipientId` por parámetro.
2. Si el consumidor no lo entrega, se usa `getActiveProfile()` del motor
   (`usr-ana` en los datos de demostración).
3. El `mapGp2Notification` devuelve `null` si no hay ningún perfil disponible: no se
   fabrica un usuario.

Esto deja el adaptador listo para que el Escalón 2 solo tenga que sustituir esa
inyección por la identidad de Supabase, sin reescribir el mapeo.

### Por qué no se conecta todavía en la UI

Conectar la campanita de GP2 a un destinatario de demostración sería mostrar
notificaciones de una persona a otra. Por eso este escalón entrega el adaptador
probado y documentado, pero **no se monta** hasta que exista la resolución de
identidad del Escalón 2. Montarlo antes sería un parche, no una solución.

---

## 5. Mapeo de campos

| GP2 (`AppNotification`) | Motor | Regla |
|---|---|---|
| `id` | `id` | `gp2-<id>` (determinista, evita duplicados). |
| — | `app_slug` | `gestor_proyectos`. |
| `recipientUserId` (no usado hoy) / opción | `recipient_id` | Inyección del consumidor o perfil activo. |
| — | `tenant_id` | Opción o tenant de la configuración del motor. |
| `category` | `type` | `hito_vencido`, `prorroga`, `asignacion` → `task`; `nudo_critico` → `system`; `mencion` → `custom`; resto → `custom`. |
| `priority` | `priority` | `CRITICAL` → `HIGH`; `PREVENTIVE` → `MEDIUM`; `INFO` → `LOW`. |
| `title` | `title` | Recortado. |
| `description` | `message` | Texto tal cual; vacío si no existe. |
| `createdAt` | `created_at` | ISO de GP2; si falta, ahora. |
| `read` | `is_read` | Booleano. |
| `targetModule` + opción | `link` | Solo si el consumidor pasa `resolveLink`. |
| — | `source` | `GP2`. |
| — | `channels` | `['internal']`: no hubo envío externo. |
| `targetModule`, `targetEntityId` | `origin` | `{ adapter: 'gp2', ref, targetModule, targetEntityId }`. |

Las prioridades y tipos se conservan también en `origin` para el Escalón 2, sin
añadir campos sueltos al modelo canónico.

---

## 6. Uso previsto (Escalón 2)

El shell que ya tenga la identidad resuelta solo necesita:

```js
import { watchGp2Notifications } from '.../services/adapters/gp2Adapter'

const stop = watchGp2Notifications(
  (result) => {
    /* refrescar campanita con getUnreadCount({ recipient_id: userId }) */
  },
  { recipientId: userId, tenantId, resolveLink: (item) => rutaDelModulo(item.targetModule) }
)

// al desmontar
stop()
```

Allí se retira la lectura directa de `qaway-gp-notifications-v1` en GP2 y el motor
pasa a ser la única persistencia.

---

## 7. Verificación

- `services/adapters/gp2Adapter.test.ts` cubre:
  - traducción de prioridad, tipo, lectura, tenant y `origin`;
  - `task`/`custom`/`LOW` y `resolveLink`;
  - perfil activo como destinatario por defecto;
  - sincronización idempotente y conservación de `is_read`;
  - storage vacío, JSON corrupto y entradas sin id.
- El adaptador no añade dependencias, no importa código de GP2 y no modifica CSS.

---

## 8. Siguiente escalón

1. Resolver la identidad real del usuario en GP2 (sesión + perfil de Supabase) y
   pasarla como `recipientId`.
2. Montar `watchGp2Notifications` en el shell de GP2 y hacer que su campanita lea del
   motor (`listNotifications`, `markRead`, `markAllRead`).
3. Retirar la clave local de GP2 como fuente de verdad y migrar sus 3 alertas semilla
   al esquema del motor.
4. Solo entonces declarar GP2 como adoptado en `adoptionMatrix.js`; hoy la matriz dice
   `ready: true` por la promesa del framework, no por el consumo real.
