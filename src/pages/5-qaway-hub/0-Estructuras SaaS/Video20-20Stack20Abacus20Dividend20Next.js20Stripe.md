# Video 2 — Fast Stack / Fazt Code — Abacus AI Dividend + Next.js + Prisma + Stripe

## 1. Identificación y enfoque

El video muestra el uso de **Abacus AI Dividend** como agente inteligente para construir una aplicación SaaS completa mediante instrucciones de texto.

El proyecto mostrado es un **CRM SaaS**.

La propuesta no se centra solamente en el stack de programación: una parte fundamental del referente es el entorno de desarrollo proporcionado por Abacus, que integra:

- agente de IA;
- entorno de ejecución;
- código;
- base de datos;
- almacenamiento;
- secrets;
- preview;
- producción;
- logs;
- despliegue;
- descarga del proyecto.

---

## 2. Stack mencionado

### Framework / frontend

**Next.js**

El proyecto generado utiliza Next.js.

### ORM / acceso a datos

**Prisma**

Se menciona como parte del stack del CRM.

### Pagos

**Stripe**

Se utiliza para:

- productos/precios;
- suscripciones;
- planes;
- checkout;
- webhooks.

### Base de datos

El proyecto dispone de una base de datos integrada en el entorno de Abacus.

El video muestra tablas relacionadas con:

- accounts;
- subscriptions;
- opportunities;
- users.

### Almacenamiento

Abacus incluye almacenamiento de archivos y una sección de Storage administrable desde el proyecto.

### Secretos

La plataforma dispone de una sección `Secrets` para variables de entorno.

El video muestra allí valores relacionados con:

- Stripe;
- Stripe webhook secret;
- claves de precios;
- otras variables del proyecto.

---

## 3. Qué aporta Abacus AI Dividend

El referente presenta Abacus como un agente capaz de desarrollar aplicaciones complejas mediante instrucciones en lenguaje natural.

El flujo mostrado incluye:

```text
Idea / instrucciones
↓
Planificación
↓
Construcción
↓
Prueba
↓
Corrección
↓
Desarrollo por fases
↓
Deploy
```

La IA puede modificar el proyecto mientras existe una versión de desarrollo y una versión de producción.

---

## 4. Planificación por fases

Una de las ideas más importantes del video es que no conviene darle a la IA una tarea gigantesca de una sola vez.

El sistema puede detectar que una solicitud tiene una complejidad alta y sugerir una **construcción interactiva por fases**.

La propuesta incluye empezar con un MVP:

```text
MVP funcional
↓
probar
↓
corregir
↓
añadir funcionalidades
↓
evolucionar
```

Esto reduce el riesgo de intentar construir todo el SaaS en una sola instrucción.

---

## 5. Desarrollo y entorno

El proyecto cuenta con distintas vistas del entorno.

### Code

Permite:

- navegar por los archivos;
- revisar código;
- editar archivos;
- realizar modificaciones menores manualmente.

### Preview

Permite visualizar la aplicación mientras se desarrolla.

### Producción

Existe una versión desplegada del proyecto.

### Desarrollo

La IA puede continuar realizando modificaciones sobre una versión de desarrollo.

### Service Log

Permite revisar la salida de ejecución del backend.

Si ocurre un error, el desarrollador puede revisar la consola correspondiente.

---

## 6. Base de datos y administración

La sección `Manage` permite consultar información del proyecto.

El video muestra:

- tablas;
- usuarios;
- suscripciones;
- oportunidades;
- almacenamiento;
- secrets.

Esto significa que el entorno no funciona solamente como un editor de código: proporciona una capa de administración del proyecto.

---

## 7. Stripe y suscripciones

El CRM utiliza Stripe para gestionar planes y pagos.

El video muestra planes como:

- básico;
- pro.

Los productos/precios pueden configurarse mediante IDs de Stripe.

También se menciona la posibilidad de que la IA cree productos programáticamente mediante la API de Stripe.

El autor recomienda que, cuando el desarrollador ya sabe cómo resolver algo manualmente, hacerlo directamente puede ser más rápido que esperar a que la IA complete el proceso.

---

## 8. Webhooks de Stripe

Una parte importante del flujo es la integración mediante webhook.

Se configura una URL semejante a:

```text
/api/webhook/stripe
```

Stripe envía eventos a esa URL.

El video identifica como evento relevante:

```text
checkout.session.completed
```

El proyecto utiliza un secreto de firma del webhook para validar la comunicación.

El proceso mostrado es:

```text
Usuario
↓
Checkout de Stripe
↓
Pago
↓
Stripe
↓
Webhook
↓
Backend
↓
actualización del plan / suscripción
```

El video destaca que este tipo de flujo debe probarse en una URL desplegada porque los webhooks necesitan alcanzar un endpoint público.

---

## 9. Pruebas

El autor prueba:

- registro;
- inicio de sesión;
- dashboard;
- suscripción;
- checkout;
- Stripe;
- actualización de plan;
- webhook.

También utiliza datos de prueba de Stripe.

Cuando el plan no se actualiza inmediatamente, se revisa el webhook como posible causa.

---

## 10. Uso de screenshots e imágenes

Una función interesante del agente es poder recibir un screenshot o imagen como referencia.

Esto permite pedir:

- correcciones visuales;
- modificaciones de interfaz;
- reproducción de una referencia;
- mejoras en características complejas.

El video indica que determinadas solicitudes de mayor calidad o complejidad consumen más créditos.

---

## 11. Desarrollo mediante voz

Abacus también permite dictar instrucciones mediante voz.

El flujo mostrado:

```text
permitir micrófono
↓
dictar instrucciones
↓
transcripción
↓
enviar al agente
↓
la IA modifica/desarrolla
```

El autor lo presenta como una forma alternativa de continuar el desarrollo mientras se realizan otras actividades.

---

## 12. Descarga del proyecto

El proyecto completo puede descargarse.

Esto incluye el CRM y los archivos correspondientes.

Este punto es importante porque el proyecto no queda limitado exclusivamente a visualizar la aplicación dentro del entorno.

---

## 13. Correcciones manuales

El video muestra que el desarrollador puede entrar al código y modificarlo directamente.

Esto permite combinar:

```text
IA
+
desarrollador
```

en lugar de obligar a que todas las modificaciones sean realizadas por el agente.

---

## 14. Filosofía de desarrollo

El referente promueve una forma de desarrollo muy orientada a IA:

1. describir el objetivo;
2. dejar que la IA planifique;
3. dividir proyectos complejos;
4. construir un MVP;
5. probar;
6. observar errores;
7. corregir;
8. continuar por fases;
9. desplegar;
10. intervenir manualmente cuando sea más rápido.

La velocidad de desarrollo es uno de los principales valores del enfoque.

---

## 15. Costos / créditos

El video menciona que determinadas operaciones de mayor complejidad consumen más créditos.

También señala que:

- solicitar una respuesta de mayor calidad puede gastar más créditos;
- características complicadas pueden requerir más esfuerzo;
- utilizar screenshots/referencias y determinadas mejoras puede aumentar el consumo.

La transcripción disponible **no proporciona una tarifa completa y verificable del servicio**. Por tanto, no se debe convertir el consumo de créditos mencionado en un costo mensual concreto.

---

## 16. Herramientas y capacidades importantes del referente

### Desarrollo

- agente de IA;
- generación de código;
- edición de código;
- desarrollo por instrucciones.

### Producto

- Next.js;
- Prisma;
- Stripe.

### Infraestructura

- base de datos integrada;
- storage;
- secrets;
- preview;
- producción;
- desarrollo;
- service logs.

### Interacción

- texto;
- screenshots;
- imágenes;
- voz.

### Deploy

- despliegue integrado;
- URL pública;
- producción;
- descarga del proyecto.

---

## 17. Qué hace importante a este referente

### Importancia: MUY ALTA para velocidad de desarrollo

El valor principal es el **método de desarrollo asistido por IA**.

No necesariamente hay que copiar Abacus como infraestructura definitiva.

Lo más interesante es:

**planificar → construir por fases → probar → corregir → desplegar.**

También es relevante la integración estrecha entre código, datos, secrets, preview, logs y producción.

---

## 18. Elementos que deben conservarse como referencia

1. Desarrollo por fases.
2. MVP antes de intentar construir todo.
3. Planificación antes de ejecutar.
4. Uso de IA como agente de desarrollo.
5. Pruebas continuas.
6. Revisión de logs.
7. Separación entre desarrollo y producción.
8. Uso de screenshots como referencia.
9. Posibilidad de edición manual.
10. Integración de Stripe mediante API y webhooks.
11. Variables secretas separadas del código.
12. Capacidad de descargar el proyecto.
13. Voz como mecanismo de interacción opcional.
14. Corrección iterativa basada en resultados.

---

## 19. Elementos que no necesariamente debemos copiar

No hay evidencia suficiente en el video para concluir que:

- la base de datos de Abacus deba ser nuestra base definitiva;
- Next.js deba sustituir React + Vite en todas nuestras aplicaciones;
- Prisma deba sustituir Supabase;
- Abacus deba ser el hosting definitivo;
- la arquitectura interna generada automáticamente sea suficiente para un SaaS comercial de largo plazo.

Su mayor valor está en el **método de construcción y la velocidad**, no necesariamente en adoptar toda la infraestructura del entorno.

