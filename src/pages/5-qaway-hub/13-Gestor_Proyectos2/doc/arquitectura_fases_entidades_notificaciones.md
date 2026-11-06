# Arquitectura Técnica por Fases: Entidades, Asignación de Usuarios y Sistema de Alertas Multicanal

**Módulo:** Gestor de Proyectos 2 · Qaway Lab  
**Fecha:** 2026-11-06  
**Estado:** Documento de Arquitectura y Especificación por Fases  

---

## 1. Alcance y Competencia del Agente

Este desarrollo pertenece directamente al **Gestor de Proyectos 2**. Incluye:
1. El modelo de **Entidades territoriales y de intervención** (DRE, UGEL, Sedes, Frentes de Obra).
2. La **asignación y guardado de usuarios** en cada entidad.
3. El **motor de alertas y notificaciones multicanal** (Campana Topbar en vivo, menciones de chat y despacho por correo/notificaciones).

---

## 2. Diagnóstico del Estado Actual en Código

### 2.1 Entidades
* **En Frontend (`src/modules/equipo/mockData.ts`)**: Se denominan `SedeFrente` (`sede-01` Sede Central, `sede-02` Frente Norte). Cada `Integrante` tiene un campo único `sedeId: string`, lo que restringe a 1 sola sede por persona.
* **En Base de Datos (`supabase/migrations/20261022131500_create_territory_ugel_monitoring.sql`)**: Existen 13 UGELs registradas con columnas `gestor_name`, `gestor_phone`, estado de fases y porcentajes.
* **Falla a resolver**: Falta una tabla relacional que permita asociar múltiples usuarios (Coordinador, Gestor, Enlace) a una entidad, y que un usuario pueda tener varias UGELs asignadas a la vez.

### 2.2 Notificaciones y Campana del Topbar
* **En `src/components/Topbar.tsx`**: Existe el botón con icono `Bell` y badge rojo `3` (reflejado en la captura de interfaz). Al hacer clic, actualmente solo ejecuta un toast temporal:
  ```typescript
  notify('Tienes 3 alertas preventivas de seguimiento territorial')
  ```
* **Falla a resolver**: Se requiere un panel emergente interactivo (Popover/Drawer) con bandeja de entrada de notificaciones, estados leído/no leído, filtrado por criticidad y disparo reactivo ante eventos reales (menciones, hitos vencidos, reasignación de entidades).

---

## 3. Plan de Arquitectura por Fases

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ FASE 1: Entidades & Usuarios                                                │
│ Guardado relacional N:M: Usuarios ◄──► Entidades (DRE / UGEL / Frentes)     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ FASE 2: Motor de Notificaciones In-App                                      │
│ Popover en Campana Topbar (Badge reactivo, listado, marcar leídas, enlaces) │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ FASE 3: Eventos de Coordinación y Menciones en Chat                         │
│ Comentarios @usuario, asignación de tareas, cambios de estado en entidades  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ FASE 4: Despacho Multicanal (Correo / Webhook)                              │
│ Alertas críticas despachadas a correo electrónico (Resend/Edge Function)    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Fase 1: Desacople y Guardado de Usuarios por Entidad

1. **Estructura de Entidad Unificada**:
   * Identificador, código, nombre institucional (ej. `DRE Junín`, `UGEL Huancayo`, `Frente Operativo Norte`).
   * Tipo de entidad: `'dre' | 'ugel' | 'sede_propia' | 'obra' | 'institucion_educativa'`.
   * Ubicación geográfica: Región, provincia, distrito.
2. **Tabla Relacional de Asignaciones (`entidad_usuarios`)**:
   * `entidad_id`: ID de la entidad.
   * `user_id`: ID del usuario/integrante.
   * `rol_en_entidad`: `'coordinador_responsable' | 'gestor_asignado' | 'enlace_local'`.
   * `fecha_asignacion`, `asignado_por`.
3. **Persistencia dual**:
   * Escritura inmediata en Supabase (`public.entidad_asignaciones`) con sincronización reactiva a `localStorage` para modo offline / pruebas rápidas.

---

### Fase 2: Motor de Notificaciones In-App (Campana Topbar)

1. **Componente `NotificationPopover`**:
   * Se abre al hacer clic en el botón de la campana (`Bell` en `Topbar.tsx`).
   * Cierra al hacer clic fuera o presionar `Escape`.
2. **Modelo de Notificación**:
   * `id`: string único.
   * `tipo`: `'mencion'` | `'alerta_territorial'` | `'hito_vencido'` | `'tarea_asignada'` | `'acta_acuerdo'`.
   * `titulo`: Resumen del evento (ej. *"Carlos Mendoza te asignó la UGEL Tarma"*).
   * `descripcion`: Detalle o fragmento del mensaje.
   * `emisor`: Nombre y avatar del usuario que originó el evento.
   * `destinatario_id`: ID del usuario que debe recibirla.
   * `entidad_id` / `tarea_id`: Enlace directo para navegar al ítem al hacer clic.
   * `leida`: boolean.
   * `created_at`: Fecha y hora legible (ej. *"Hace 10 min"*).
3. **Contador Reactivo (Badge Rojo)**:
   * Muestra el número exacto de notificaciones no leídas (`unreadCount`).
   * Se oculta automáticamente cuando `unreadCount === 0`.
   * Botón global: *"Marcar todas como leídas"*.

---

### Fase 3: Bus de Eventos y Menciones en Chat / Tareas

1. **Disparadores Automáticos**:
   * **Mención en Tareas/Chat**: Al escribir `@nombre` en los comentarios de tareas (`TareasView.tsx`) o en el chat, se crea automáticamente una notificación para el usuario mencionado.
   * **Alerta Territorial**: Si una UGEL o Frente presenta retraso en su fase MC SIGA, se genera una alerta preventiva para el Gestor asignado y el Coordinador Macro.
   * **Reasignación de Entidad**: Cuando el Coordinador General asigna o transfiere una UGEL a un gestor, ambos reciben la confirmación in-app.

---

### Fase 4: Despacho Multicanal (Correo / Webhooks)

1. **Configuración de Notificaciones por Usuario**:
   * Cada usuario puede activar/desactivar qué alertas recibir en su correo.
2. **Edge Function de Despacho**:
   * Servicio backend que procesa la cola de notificaciones y envía correos transaccionales con plantilla institucional limpia a través de Resend / SMTP para eventos de alta prioridad.
