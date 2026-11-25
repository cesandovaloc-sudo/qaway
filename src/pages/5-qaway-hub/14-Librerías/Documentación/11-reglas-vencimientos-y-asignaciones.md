# 11-reglas-vencimientos-y-asignaciones.md

## Reglas compartidas: cortes por vencer y tareas asignadas

**Estado:** implementado y probado.
**Fecha:** 2026-11-24.
**Alcance del framework:** `14-Librerías/services/notificationRules.js`.
**Aplicación en GP2:** `13-Gestor_Proyectos2/src/services/gpNotificacionesService.ts`.

---

## 1. Qué se resolvió

El motor sabía guardar, entregar y leer notificaciones, pero no decidía **cuándo
nace una**. Quedaban dos huecos operativos:

1. **Cortes:** el Gantt ya emitía alertas de cronograma (`por_vencer` y
   `desvio_critico`, trabajo en curso en `syncScheduleAlertNotifications`), pero
   no existía una regla compartida ni las tareas operativas avisaban al vencer.
2. **Asignación:** el panel «Asignar tarea» tenía la casilla
   `notificarAssignee`, pero no emitía ninguna notificación.

Ahora el framework define las dos reglas y GP2 las aplica con su campanita. El
motor sigue siendo la fuente para el Escalón 2 del adaptador.

---

## 2. Regla de vencimientos (cortes)

### Configuración por tenant

Vive en la configuración del motor, `settings.rules.deadlines`:

| Campo | Tipo | Por defecto | Significado |
|---|---|---|---|
| `daysAhead` | número (0–60) | `5` | Días **hábiles** de aviso previo. |
| `includeOverdue` | booleano | `true` | Seguir avisando después del vencimiento. |
| `workingDays` | número[] (0=dom) | `[1,2,3,4,5]` | Días laborables para el conteo. |

```js
import { updateDeadlineRule, resolveDeadlineRule } from '../services/notificationRules'

updateDeadlineRule({ daysAhead: 3 })   // guarda en settings del tenant
resolveDeadlineRule()                  // { daysAhead: 3, includeOverdue: true, workingDays: [...] }
```

`updateSettings` del motor fusiona `rules.deadlines` sin borrar el resto de la
configuración (`tenant`, perfiles, etc.).

### Estados

| Estado | Condición | Prioridad del aviso |
|---|---|---|
| `vencido` | `due < hoy` y `includeOverdue` | `HIGH` |
| `proximo_vencer` | `0 ≤ días hábiles restantes ≤ daysAhead` | `MEDIUM` |
| *(sin aviso)* | cumplido, sin fecha, o aún lejos | — |

Un registro **cumplido** (`done: true`) no avisa nunca. El conteo usa días
hábiles, no calendario: un viernes con `daysAhead = 1` avisa el lunes, no el
sábado.

### Idempotencia y escalamiento

El id es determinista:

```
deadline:<adapter>:<ref>:<due>:<estado>:<recipientId>
```

Consecuencias deliberadas:

- Repetir el barrido **no duplica** y **no pisa** `is_read`.
- Reprogramar la fecha (`due`) genera un id nuevo: es un aviso nuevo.
- El paso de `proximo_vencer` a `vencido` genera un id nuevo: es la escalada,
  no un duplicado.
- Un aviso por destinatario, no uno compartido: cada usuario puede leerlo o
  marcarlo sin afectar a los demás.

### Destinatarios

```js
syncDeadlineNotifications({
  items: [{ ref: 'pt-1.6', code: '1.6', name: 'Paquete 1.6', due: '2026-11-27' }],
  today: '2026-11-24',
  appSlug: 'gestor_proyectos',
  adapter: 'gp2',
  tenantId,
  resolveRecipients: (item) => responsablesReales(item), // ids del directorio
  resolveLink: (item) => `/hub/proyectos/${item.ref}`,
})
```

- **Sin destinatario no hay aviso.** La regla no inventa usuarios ni usa el
  perfil activo como sustituto.
- La app resuelve el directorio real (en GP2, `usePerfilVisible().contactos`).
- `tenant_id` aísla el aviso por empresa; `listNotifications({ tenant_id })` lo
  filtra en el motor.

---

## 3. Regla de asignación

```js
notifyAssignment({
  ref: 'task-1732500000000',
  title: 'Validar expediente',
  assigneeId: 'usr-luis',
  appSlug: 'gestor_proyectos',
  tenantId,
  due: '2026-11-30',
  assignerId: 'usr-ana',
  assignerName: 'Ana Quispe',
  assignedAt: '2026-11-24T09:00:00.000Z',
})
```

Produce una notificación `type: 'task'` con:

| Campo | Valor |
|---|---|
| `priority` | `HIGH` por defecto (la app puede enviar otra). |
| `taskResponseStatus` | `sin_notificar` (el motor ya sabe seguir la respuesta). |
| `taskOrigin` | `asignacion` por defecto. |
| `origin` | `{ adapter, rule: 'assignment', ref, assigneeId, assignedBy, due }`. |
| `channels` | `['internal']`. |

Id determinista:

```
assignment:<adapter>:<ref>:<assigneeId>:<assignedAt>
```

La misma asignación no se duplica; una reasignación posterior (nuevo
`assignedAt`) sí genera un aviso nuevo. Sin `assigneeId` la función devuelve
`ok: false` y no escribe nada.

---

## 4. Aplicación en GP2

### Archivos

| Archivo | Rol |
|---|---|
| `services/gpNotificacionesService.ts` | Resuelve destinatarios y deposita los avisos en la campanita de GP2. |
| `modules/tareas-2/Tareas2View.tsx` | Barrido diario de cortes y aviso al asignar desde el panel. |
| `components/NotificationPopover.tsx` | Presenta los avisos y filtra por `tenantId` sin borrar los de otras empresas. |
| `types.ts` | `AppNotification.tenantId` opcional. |

### Barrido de cortes

Al abrir Tareas (con las tareas ya cargadas) se ejecuta una vez por día y
empresa:

- fuentes: tareas operativas (`due`, no cumplidas);
- el cronograma **no** se barre aquí: el Gantt ya emite sus alertas desde
  `syncScheduleAlertNotifications` (incluye desvío crítico y respeta los
  parámetros del cronograma). Duplicarlas en Tareas sería ruido, no cobertura.
  La regla del framework sí acepta `items` y queda lista para unificar ambos
  caminos cuando se retire esa función;
- umbral: `diasAvisoPrevio` y semana laboral de
  `gpCronogramaConfigService` (parámetros ya existentes del cronograma, no un
  valor nuevo);
- un aviso por responsable; si el nombre no existe en el directorio, el aviso se
  emite igual para la empresa **sin** `recipientUserId` (no se inventa usuario);
- prioridad `CRITICAL` si venció, `PREVENTIVE` si está por vencer;
- `targetModule` apunta al módulo del registro (`cronograma` o `tareas2`).

La clave del barrido incluye día + cantidad de tareas: si los datos terminan
de cargar después, vuelve a correr; los ids evitan duplicados.

### Asignación

En `onAssign` del panel se emite el aviso si la casilla «Notificar al
asignado» está activa (`notifyAssignee !== false`). El destinatario se resuelve
por nombre contra el directorio real de la empresa; si no hay coincidencia, el
aviso se muestra igual para el tenant sin `recipientUserId`.

### Aislamiento por tenant en la campanita

`NotificationPopover` recibe `tenantId` desde el Topbar y **solo filtra la
presentación**. El estado conserva todos los avisos: filtrar al cargar y volver
a guardar habría borrado los de otras empresas. Los avisos legados sin
`tenantId` se siguen mostrando.

---

## 5. Verificación

`services/notificationRules.test.ts` cubre:

- conteo de días hábiles (incluye fin de semana y signo);
- estados próximo / vencido / cumplido / fecha inválida;
- un aviso por destinatario con id determinista y `origin` correcto;
- ausencia de destinatarios ⇒ cero avisos;
- sincronización idempotente conservando `is_read`;
- umbral leído de `settings.rules.deadlines` y su edición con `updateDeadlineRule`;
- asignación: campos, `origin`, no duplicación y rechazo sin destinatario.

Comandos:

```
npx vitest run src/pages/5-qaway-hub/14-Librerías/services/notificationRules.test.ts
npm run typecheck
```

---

## 6. Límites conocidos y siguiente paso

- El barrido corre cuando el usuario abre Tareas. Un aviso que deba llegar sin
  abrir la app exige un job programado (Supabase cron / Edge Function) que
  ejecute la misma regla. No se simuló con `setInterval` en el navegador.
- Los avisos de GP2 todavía viven en `qaway-gp-notifications-v1`. El Escalón 2
  del adaptador (`doc 10`) los proyecta al motor con la identidad real; solo
  entonces la campanita de GP2 podrá leer del motor y retirar su clave local.
- GP2 mantiene dos caminos de vencimiento: el Gantt (alerta de cronograma con
  desvío crítico) y esta regla (tareas operativas). Unificarlos en una sola
  llamada a `syncDeadlineNotifications` es el siguiente paso; hoy se evita el
  duplicado separando las fuentes.
- El motor no entrega correo/WhatsApp/push para estas reglas: entran como
  `internal`. Habilitar canales externos es una decisión de transporte y
  preferencias, no de la regla.
