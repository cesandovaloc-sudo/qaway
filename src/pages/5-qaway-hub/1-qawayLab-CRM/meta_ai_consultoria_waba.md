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

## 📌 Ronda 02: Especificaciones Oficiales de Meta & Credenciales WABA (Septiembre 2026)

### 1. Activos Oficiales de Meta Business Suite (Qaway Lab)
- **URL de Administración:** [Meta Business Suite - Qaway Lab](https://business.facebook.com/latest/home?nav_ref=bm_home_redirect&business_id=860625207070053&asset_id=1065820593280322)
- **Business ID:** `860625207070053`
- **Asset ID (WhatsApp Business Account):** `1065820593280322`

---

### 2. Aprovisionamiento de Meta Business Agent & Permisos
- **Ruta de Configuración:** Meta Business Suite > Configuración del negocio > Cuentas de WhatsApp > Configuración > Agentes de IA.
- **Usuario del Sistema (System User):** Crear con rol **Admin**.
- **Token de Acceso Permanente (System User Access Token):** Generar con los permisos:
  - `whatsapp_business_messaging`
  - `whatsapp_business_management`
- **Suscripción de Webhooks:** Configurar a nivel de App en el portal de desarrolladores para los campos `messages` y `message_echoes`.
- **Referencias Oficiales:**
  - [Guía de Configuración WhatsApp Business Platform (Get Started)](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)
  - [Business Messaging WhatsApp Docs](https://developers.facebook.com/documentation/business-messaging/whatsapp/get-started)

---

### 3. Protocolo de Traspaso a Humano (Human Handoff / Handover Protocol)
- **Rol del CRM:** Actúa como el **Primary Receiver**.
- **Traspaso Automático (`pass_thread_control`):** Cuando la IA detecta una intención compleja, el backend dispara la llamada a la API de Meta para transferir el hilo al asesor comercial humano.
- **Modo Standby:** Mientras el humano conversa en el chat en vivo del CRM, el bot de IA permanece en modo "Standby" para continuar registrando analítica y métricas sin interrumpir.
- **Referencias Oficiales:**
  - [Documentación del Handover Protocol](https://developers.facebook.com/docs/messenger-platform/handover-protocol)
  - [Control de Hilos (Pass Thread Control)](https://developers.facebook.com/docs/messenger-platform/handover-protocol/pass-thread-control)

---

### 4. Seguridad de Webhooks & Validación Criptográfica
Para proteger la Edge Function receptora en Supabase frente a spoofing y ataques Man-in-the-Middle:
- **Validación de Firma (`x-hub-signature-256`):**
  Calcular HMAC con SHA-256 utilizando el `APP_SECRET` de Meta y el `raw body` de la petición HTTP, comparándolo de manera segura con `crypto.timingSafeEqual` (o `crypto.subtle` en Deno/Web Crypto API).
- **Idempotencia y Anti-Duplicados (`wamid`):**
  Almacenar y verificar el `message.id` (`wamid`) como clave única antes de insertar en Supabase para evitar mensajes duplicados ante reintentos automáticos de Meta.
- **Referencia Oficial:**
  - [Seguridad de Webhooks y Verificación de Solicitudes](https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests)

---

### 5. Estructura Oficial del Objeto Referral (Click-to-WhatsApp Ads)
Estructura del payload recibido en el webhook cuando el lead ingresa por un anuncio publicitario:
```json
{
  "referral": {
    "source_url": "https://fb.me/...",
    "source_id": "ID_DEL_ANUNCIO",
    "source_type": "ad",
    "headline": "Título del anuncio",
    "body": "Cuerpo del anuncio",
    "image_url": "URL_DE_LA_IMAGEN"
  }
}
```
- **Uso en Qaway Lab:** Permite vincular de inmediato el lead con la campaña activa (ej. `Qaway Lab_Ventas_Individuales`) y activar la ventana de 72 horas de mensajería gratuita.
- **Referencia Oficial:**
  - [Componentes del Webhook - Referral Object](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/components#referral-object)

---

### 6. WhatsApp Flows 3.0 & Intercambio de Datos Seguro (Data API)
- **Cifrado RSA Asimétrico:** Para formularios con intercambio dinámico de datos (ej. cotizaciones y reservas), el endpoint del webhook debe descifrar los paquetes con una clave privada RSA y cifrar las respuestas con la clave efímera AES provista en el handshake.
- **Esquema de Datos:** Formato estandarizado `flow_token` y `data` para actualizar la vista de la app nativa de WhatsApp en el celular del cliente.
- **Referencias Oficiales:**
  - [WhatsApp Flows Data API](https://developers.facebook.com/docs/whatsapp/flows/reference/data-api)
  - [WhatsApp Flows JSON Schema](https://developers.facebook.com/docs/whatsapp/flows/reference/flow-json-schema)

