# Repositorio Oficial de Diagramas y Flujos del Sistema — 1-qawayLab-CRM

**Módulo:** 1-qawayLab-CRM  
**Ubicación:** `src/pages/5-qaway-hub/1-qawayLab-CRM/diagramas_flujos_arquitectura.md`  
**Última actualización:** 2026-09-17  

Este documento recopila de forma estructurada, con nombres y casos de uso, todos los diagramas arquitectónicos y de flujo creados para el ecosistema de comercio conversacional y CRM de Qaway Lab Digital.

---

## 📌 Flujo 01: Handover Protocol & Detección de Asesor Humano (Traspaso Inteligente)

### Propósito:
Garantizar que ningún cliente quede atrapado en un bucle con la IA. El sistema evalúa continuamente si la conversación debe ser atendida por un humano según 4 disparadores específicos.

```mermaid
flowchart TD
    Msg[Mensaje del Cliente por WhatsApp] --> Check{¿Cumple disparador de Humano?}
    Check -->|Palabra clave: 'asesor', 'humano', 'queja'| Handoff[Activar Handover Protocol]
    Check -->|Botón rápido: 'Hablar con asesor'| Handoff
    Check -->|Detección IA: Duda compleja o enojo| Handoff
    Check -->|Límite de fallos: 2 respuestas no entendidas| Handoff
    Check -->|Consulta estándar FAQ / Catálogo| AI[IA responde automáticamente]
    
    Handoff --> API[Llamada a Meta API: pass_thread_control]
    API --> CRM[Alerta en CRM: ⚠️ Asesor Requerido]
    CRM --> Standby[IA entra en Standby y Asesor toma el control en vivo]
```

### Casos de uso:
- Un prospecto solicita cotización corporativa personalizada.
- Un usuario escribe "quiero hablar con una persona".
- El cliente expresa inconformidad o duda técnica fuera del alcance del bot.

---

## 📌 Flujo 02: Coexistencia Híbrida App Móvil + Cloud API (Message Echoes)

### Propósito:
Permitir que el dueño del negocio o asesor responda con total comodidad desde la **aplicación móvil nativa de WhatsApp Business en su celular**, mientras el **CRM en la computadora** se mantiene 100% sincronizado en tiempo real sin perder datos ni chats.

```mermaid
sequenceDiagram
    autonumber
    actor Cliente as 📱 Cliente (WhatsApp)
    actor Asesor as 📲 Asesor Móvil (App WAB en Celular)
    participant Meta as 🌐 Meta Cloud API (WABA)
    participant Webhook as ⚡ Edge Function (whatsapp-webhook)
    participant DB as 🗄️ Supabase DB (leads)
    participant CRM as 💻 Panel CRM Web (Escritorio)

    Cliente->>Meta: Envía mensaje con duda o consulta
    Meta->>Asesor: Entrega el chat en la App del Celular
    Meta->>Webhook: Dispara Webhook 'messages' (Inbound)
    Webhook->>DB: Registra el lead y mensaje en Supabase
    DB-->>CRM: Actualiza el Inbox y Kanban en la pantalla

    Asesor->>Cliente: Responde directamente desde la App del Celular
    Meta->>Cliente: Entrega la respuesta al cliente
    Meta->>Webhook: Dispara Webhook 'message_echoes' (Eco saliente)
    Webhook->>DB: Guarda la respuesta del asesor (sender: 'agent')
    DB-->>CRM: Refleja el chat actualizado en el CRM de escritorio
```

### Casos de uso:
- El asesor está fuera de la oficina y responde desde la calle con su celular.
- El equipo en la oficina ve en el CRM todo lo que el asesor habló sin retrasos.

---

## 📌 Flujo 03: Ciclo de Vida de Mensajería Saliente & Despacho (WABA Outbound & IA)

### Propósito:
Visualizar el recorrido de un mensaje cuando se envía desde el panel del CRM hacia los servidores de Meta y al teléfono del cliente, controlando la ventana de 24 horas y el uso de plantillas HSM.

```mermaid
flowchart TD
    subgraph META["1. Meta Business Suite & Developers"]
        WABA[Número Oficial WABA]
        Token[System User Token Permanente]
        WebhookURL[Pegar URL del Webhook de Supabase]
    end

    subgraph SUPABASE["2. Supabase Cloud"]
        Deploy[Desplegar Edge Function: whatsapp-webhook]
        Secrets[Configurar Secrets: APP_SECRET, VERIFY_TOKEN]
        DB[(Tabla leads & messages)]
    end

    subgraph ENGINE["3. Despacho Saliente & IA"]
        Outbound[Función de Envío Saliente: whatsapp-mensaje-enviar]
        Brain[Motor de IA Gemini / Meta Agent]
    end

    WABA --> WebhookURL
    WebhookURL --> Deploy
    Deploy --> DB
    DB --> CRM[CRM Qaway Lab en Producción]
    CRM --> Outbound
    Brain --> Outbound
    Outbound --> WABA
```

---

## 📌 Flujo 04: Secuencia de Auto-Respuesta Autónoma con Gemini 2.0 y Cloud API

### Propósito:
Explicar cómo la Edge Function `whatsapp-webhook` recibe el mensaje del prospecto, consulta a Gemini con el System Prompt oficial de Qaway Lab y despacha la respuesta al cliente en menos de 2 segundos.

```mermaid
sequenceDiagram
    autonumber
    actor Cliente as 📱 Cliente en WhatsApp
    participant Webhook as ⚡ Edge Function (whatsapp-webhook)
    participant Gemini as 🧠 Gemini AI Engine
    participant Meta as 🌐 Meta Cloud API
    participant DB as 🗄️ Supabase DB (leads)
    actor Asesor as 💻 Asesor en CRM

    Cliente->>Webhook: Mensaje entrante ("¿Tienen plantilla de Notion?")
    Webhook->>Webhook: Valida firma criptográfica x-hub-signature-256
    Webhook->>DB: Registra mensaje del cliente con wamid único

    alt ¿Solicitó Humano o Intención Compleja?
        Webhook->>DB: is_human_requested = true
        Webhook-->>Asesor: Alerta en CRM: '⚠️ Asesor Requerido' (IA en Standby)
    else Consulta Estándar de Servicios / Catálogo
        Webhook->>Gemini: Evalúa historial + System Prompt Oficial
        Gemini-->>Webhook: Retorna respuesta ejecutiva y concisa
        Webhook->>Meta: POST /messages (Despacha respuesta oficial)
        Meta-->>Cliente: Entrega respuesta en el WhatsApp del cliente (< 2s)
        Webhook->>DB: Guarda respuesta del agente (sender: 'agent') en tiempo real
    end
```

---

## 📌 Flujo 05: Arquitectura SaaS Composable por Planes Modulares

### Propósito:
Representar cómo el CRM se comercializa y activa de forma desacoplada según el plan del cliente (Starter, Pro, Enterprise y Add-on de Inventario).

```mermaid
graph TD
    subgraph PLAN1["Plan 1: CRM Starter WABA"]
        P1_1[Inbox WhatsApp WABA Oficial]
        P1_2[Pipeline Kanban Básico]
        P1_3[Métricas y Gráficos Esenciales]
    end

    subgraph PLAN2["Plan 2: CRM Pro Multi-Usuario"]
        P2_1[Multi-usuarios y Roles: Sales, Marketing, Management]
        P2_2[Constructor de Métricas Personalizadas: MetricBuilderModal]
        P2_3[Atribución Publicitaria CTWA y ROAS de Campañas]
    end

    subgraph PLAN3["Plan 3: CRM Enterprise AI"]
        P3_1[Agentes de IA Autónomos: Auto-respuesta inteligente]
        P3_2[Handover Protocol: Detección semántica de humano y traspaso]
        P3_3[WhatsApp Flows 3.0: Formularios dinámicos nativos]
    end

    subgraph ADDON["Módulo Acoplable: Inventario & Catálogo con Pagos"]
        A1[Conexión en tiempo real con Base de Datos de Inventario]
        A2[Consulta de existencias y precios por el Agente de IA]
        A3[Fichas interactivas de catálogo con checkout en chat]
        A4[Descuento automático de stock al confirmar el pago]
    end

    PLAN1 --> PLAN2
    PLAN2 --> PLAN3
    PLAN3 -.->|Add-on Opcional| ADDON
```


