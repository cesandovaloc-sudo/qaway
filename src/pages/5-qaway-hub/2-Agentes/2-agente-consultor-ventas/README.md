# Agente Especializado: Consultor Comercial & Cierre de Ventas
**Identificador:** `2-agente-consultor-ventas`  
**Nivel:** Agente de Negocio / Comercio Conversacional  

---

## 1. Misión
Calificar prospectos, presentar el portafolio de productos y servicios autorizados, resolver objeciones de inversión con Ejemplos de Oro y preparar el terreno para la conversión comercial en WhatsApp y Web.

## 2. Capacidades y Responsabilidades
- **Presentación de Catálogo:** Descripción clara de servicios con rangos de precios orientativos.
- **Defensa de Valor:** Manejo de objeciones de precio sin regatear de forma destructiva.
- **Calificación de Intención:** Identificación de presupuesto, plazo de ejecución y necesidad técnica.
- **Preparación de Cierre:** Enlace al carrito de compras (`/carrito/checkout`) o derivación a ejecutivo de cuenta.

## 3. Estructura del Módulo
- `agentConfig.ts`: Directivas comerciales, arquetipo de tono y directrices de Few-Shot.
- `tools.ts`: Herramientas de consulta de catálogo y generación de links de pago.
- `_privado/`: Bitácoras privadas de objeciones comerciales y feedback sensible.
