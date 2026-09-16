# Asesoría y Respuestas del Agente Meta - WhatsApp Business Platform (WABA)

**Módulo:** 1-qawayLab-CRM  
**Archivo de Registro:** `src/pages/5-qaway-hub/1-qawayLab-CRM/meta_ai_consultoria_waba.md`  
**Última actualización:** 2026-09-16  

---

## 📌 Ronda 01: Diagnóstico de Vanguardia & Brechas Críticas (Septiembre 2026)

### Diagnóstico General:
La arquitectura actual con React y Supabase es sólida, pero para evitar la obsolescencia en septiembre de 2026, el CRM debe evolucionar de un **"inbox de chat"** a una plataforma de **"comercio conversacional"**. La brecha más crítica en el stack actual es la falta de soporte para flujos estructurados y la integración profunda de señales de marketing.

---

### 1. Brechas de Funcionalidad (Gap Analysis)
Para estar a la vanguardia, el CRM debe incorporar estas capacidades nativas que Meta ha priorizado:
- **WhatsApp Flows:** Actualización más importante. Permite crear formularios dinámicos (citas, encuestas, registros) que se abren dentro de WhatsApp sin salir al navegador. Sustituye enlaces externos y aumenta radicalmente la conversión.
- **Catálogos y Multi-Product Messages (MPM):** Sincronización con el catálogo de Meta para enviar fichas de producto interactivas. Permite que el cliente agregue al carrito directamente dentro del chat.
- **Pagos nativos:** Integrar la API de pagos para que el cierre de la venta (checkout) ocurra directamente en la conversación, reduciendo la fricción del pipeline.

---

### 2. Atribución Enriquecida y CTWA (Click-to-WhatsApp Ads)
Para aprovechar la ventana gratuita de 72 horas de los anuncios Click-to-WhatsApp (CTWA), el Webhook debe procesar el objeto `referral`:
- **Estructura del Webhook:** Al recibir un mensaje, buscar el campo `messages[].referral` (contiene `ad_id`, `source_url` y `headline`).
- **Vínculo Automático:** El backend debe mapear ese `ad_id` con los datos de la cuenta publicitaria (como la campaña *Qaway Lab_Ventas_Individuales*) para calcular el Retorno de la Inversión Publicitaria (ROAS).

---

### 3. Gestión de Ventanas y Costos (Time-Awareness)
La arquitectura debe ser consciente del tiempo para evitar cargos inesperados:
- **Categorización y Bloqueo de 24 horas:** Implementar validador visual y lógico que bloquee el envío de texto libre si han pasado más de 24 horas desde el último mensaje entrante del cliente. Solo permitir el uso de plantillas aprobadas de Marketing o Utilidad.
- **Estado de Plantillas en Tiempo Real:** Consumir el Webhook de `message_template_status_update` para saber instantáneamente si una plantilla fue aprobada, rechazada o pausada por baja calidad.

---

### 4. Escalabilidad y Cuellos de Botella
Para soportar hasta 100,000 conversaciones mensuales:
- **Idempotencia con `wamid`:** WhatsApp puede reintentar y enviar el mismo webhook varias veces. Usar el `wamid` (ID único del mensaje) como clave primaria o clave única en Supabase para descartar duplicados.
- **Rate Limits y Manejo de Ráfagas:** Implementar cola o buffer de procesamiento para evitar saturar el throughput de Meta y prevenir errores 429 (Too Many Requests).

---

## 📌 Próximas Solicitudes Pendientes para la IA de Meta:
1. Estructura técnica exacta del payload JSON del objeto `referral` para Click-to-WhatsApp Ads.
2. Especificación de JSON schema para WhatsApp Flows 3.0 dentro del CRM.
