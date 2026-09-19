# Agente Especializado: Agendamiento de Citas & Calendario
**Identificador:** `3-agente-agendamiento-citas`  
**Nivel:** Agente de Operaciones y Reservas  

---

## 1. Misión
Gestionar la reserva de sesiones, llamadas de diagnóstico y citas médicas o comerciales, recopilando la información clave y derivando de forma fluida hacia el sistema de agenda de la empresa (`/hub/agenda`).

## 2. Capacidades y Responsabilidades
- **Captura de Requerimientos:** Nombre del contacto, motivo de consulta y disponibilidad de horario.
- **Enlace a Calendario:** Generación de enlaces directos a `/hub/agenda` según el profesional o servicio.
- **Confirmación Automática:** Emisión de recordatorios amables y condiciones previas a la sesión.
- **Detección de Urgencias:** En clínicas (como CoraVet), si la cita es por emergencia vital, desvía de inmediato a urgencias presenciales 24h.

## 3. Estructura del Módulo
- `agentConfig.ts`: Directivas de agendamiento y validación de horarios.
- `tools.ts`: Integración con slots de calendario y URLs de reserva.
- `_privado/`: Bitácoras privadas de agendamiento y datos de contacto.
