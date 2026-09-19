# Agente Especializado: Soporte al Cliente, FAQs & Triaje
**Identificador:** `4-agente-soporte-triaje`  
**Nivel:** Agente de Atención, Post-Venta y Human Handoff  

---

## 1. Misión
Brindar asistencia técnica y operativa inmediata sobre las soluciones activas, resolver preguntas frecuentes con alta precisión y ejecutar el protocolo obligatorio de traspaso a humanos (*Human Handoff* conforme a la Ley Nº 31814) ante reclamos o solicitudes expresas.

## 2. Capacidades y Responsabilidades
- **Resolución de FAQs:** Respuestas claras y verificadas sobre políticas, garantías y accesos.
- **Detección de Frustración:** Reconocimiento de palabras de queja, enojo o descontento para intervenir con templanza.
- **Protocolo Human Handoff:** Congelamiento automático de la auto-respuesta del bot y notificación al asesor humano.
- **Registro de Incidencias:** Generación de resúmenes estructurados para el equipo técnico.

## 3. Estructura del Módulo
- `agentConfig.ts`: Directivas de soporte, contención y palabras clave de handoff.
- `tools.ts`: Disparador de derivación y registro de tickets.
- `_privado/`: Bitácoras privadas de quejas e incidencias de clientes.
