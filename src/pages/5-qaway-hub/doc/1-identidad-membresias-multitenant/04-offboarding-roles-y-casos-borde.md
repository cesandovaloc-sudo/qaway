# 04 - Offboarding, roles y casos borde

## Offboarding (salida, despido, renuncia)

### Regla principal

El tenant debe poder retirar el acceso de un usuario desde front **sin eliminar su avance**.

### Qué debe pasar al retirar acceso

- Desactivar o eliminar la **membresía/rol** del usuario en ese tenant (según diseño final).
- Revocar acceso a apps del tenant.
- Invalidar o forzar actualización de contexto/sesión activa para ese tenant.
- Mantener historial de auditoría: quién retiró el acceso, cuándo y motivo opcional.

### Qué NO debe pasar

- No borrar proyectos, tareas, comentarios, archivos, pedidos, movimientos o registros creados.
- No borrar la identidad global si la persona sigue perteneciendo a otro tenant.
- No mezclar ni transferir datos a otro tenant.

## Data creada por el usuario que sale

La data debe conservarse con autoría original. Se debe definir política por tipo de registro:

| Tipo de data | Comportamiento recomendado |
|---|---|
| Autoría/historial | Se conserva: “creado por”, “editado por”, logs, auditoría. |
| Responsables asignados | Reasignar a otro usuario/rol antes o durante el offboarding. |
| Tareas/proyectos en curso | Mantienen estado y avance; cambia responsable. |
| Aprobaciones pendientes | Reasignar a admin o responsable suplente. |
| Archivos/adjuntos | Se conservan en el tenant; propiedad operativa del tenant. |
| Accesos compartidos/links internos | Revocar los asociados a la membresía retirada. |

### Flujo front recomendado

1. Admin selecciona usuario.
2. Sistema muestra impacto: elementos asignados, pendientes, roles/apps.
3. Admin reasigna responsables donde sea necesario.
4. Admin confirma retiro de acceso.
5. UI muestra resultado: acceso retirado, data preservada, reasignaciones completas.

## Casos borde

### Mismo correo, varios tenants

- Pierde acceso en DIGERE, pero mantiene acceso en Caballeros del Zodiaco: permitido.
- Cierra sesión global: vuelve a ver solo los tenants donde aún tiene membresía activa.

### Crear tenant adicional con mismo correo

- Por defecto bloqueado.
- Requiere regla/aprobación de plataforma admin.
- Debe quedar auditado: quién solicitó, quién aprobó, cuándo, qué tenant se creó.

### Usuario sin membresías activas

- Puede autenticarse, pero no debe ver datos de tenants; solo estado vacío/controlado o flujo de alta/invitación.

### Invitación a tenant

- Invitar por correo no debe crear identidad duplicada.
- Si la identidad existe, se agrega membresía.
- Si no existe, se crea invitación/alta según flujo definido.

### Plataforma admin

- Plataforma admin no es lo mismo que admin de tenant.
- Su capacidad de aprobar creación de tenants adicionales debe ser explícita y auditada.

## Controles mínimos de seguridad

- RLS/políticas por `usuario + tenant activo + app`.
- Validar membresía activa en cada cambio de contexto.
- Revocación efectiva en siguiente request/sesión.
- Auditoría de cambios de membresía, rol, acceso y aprobaciones de plataforma.