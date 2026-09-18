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

---

## 📌 Ronda 03: Coexistencia Híbrida (App WAB + Cloud API), Message Echoes & Catálogo (Septiembre 2026)

### 1. El Dilema Operativo del Usuario:
- **Situación:** El negocio ya tiene configurada su aplicación móvil de WhatsApp Business (WAB) con respuestas rápidas, etiquetas y catálogo manual. La preocupación era perder la comodidad de la app en el celular al conectarse a una API de CRM.
- **Respuesta Oficial de Meta:** Con las actualizaciones de Septiembre de 2026, **ya no es obligatorio que el número sea exclusivo de la API** ni se pierde la aplicación en el celular gracias a la **Coexistencia (Co-existence)**.

---

### 2. Arquitectura de Coexistencia (App Móvil + Cloud API)
- **Operación Dual:** El número oficial puede seguir funcionando en la aplicación móvil de WhatsApp Business para que el asesor o dueño chatee cómodamente desde su celular, mientras el CRM en Supabase opera en segundo plano registrando los datos y calculando el ROAS.
- **Registro Híbrido:** Al conectar la Cloud API, se selecciona la opción de registro que mantiene activo el cliente móvil.
- **Sincronización Bidireccional:** Todo lo que se habla en el celular se refleja en el CRM, y lo que se envía desde el CRM llega al cliente.

---

### 3. Sincronización en Tiempo Real vía Message Echoes (`message_echoes`)
- **Funcionamiento:** Cuando el asesor escribe una respuesta desde la app móvil de WhatsApp Business en su celular, la API de Meta genera un evento webhook de tipo `message_echoes`.
- **Efecto en el CRM:** La Edge Function `whatsapp-webhook` recibe este eco y lo guarda en Supabase con `sender: 'agent'`. Como resultado, el historial del CRM de escritorio se mantiene 100% sincronizado con la conversación manual del celular en tiempo real.

---

### 4. Sincronización del Catálogo con Meta Commerce Manager
- **Evolución:** En lugar de mantener un catálogo manual aislado en el celular, se vincula con el **Catálogo de Meta (Commerce Manager)**.
- **Ventajas:**
  1. El CRM puede consultar productos, precios y existencias vía API.
  2. Los anuncios de Meta Ads (ej. campañas de venta de servicios o productos) pueden mostrar esos productos dinámicamente con atribución directa.
  3. Si se adquiere el Módulo de Inventario de Qaway Lab, el catálogo se actualiza automáticamente.

---

### 5. Enlaces Oficiales de Documentación de Meta (Septiembre 2026)

1. **Coexistencia de Aplicación y API (Co-existence):**
   - [Guía de Coexistencia WABA](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started/coexistence)
   - [Conceptos de Registro Híbrido](https://developers.facebook.com/docs/whatsapp/on-premises/get-started/coexistence)
2. **Sincronización vía Message Echoes:**
   - [Configuración de Webhooks para Ecos de Mensajes](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/components#messages)
   - [Referencia del campo message_echoes](https://developers.facebook.com/docs/messenger-platform/webhooks/reference/message-echo)
3. **Sincronización de Catálogo (Commerce Manager):**
   - [Centro de Ayuda de Catálogos de Meta](https://www.facebook.com/business/help/1275400645914358)
   - [API de Catálogos para Desarrolladores](https://developers.facebook.com/docs/marketing-api/catalog)
4. **Políticas de Ventana de Servicio y Precios:**
   - [Políticas de Ventana de Servicio de 24 Horas](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-messages#service-window)
   - [Modelo de Precios por Conversación de WhatsApp](https://developers.facebook.com/docs/whatsapp/pricing)


