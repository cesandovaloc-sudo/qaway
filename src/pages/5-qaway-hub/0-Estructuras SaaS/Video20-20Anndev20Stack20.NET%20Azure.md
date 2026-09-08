# Video 1 — Pepito Sanchez — Stack Angular + .NET + Azure

## 1. Identificación y enfoque

El video propone una arquitectura para construir un SaaS desde cero evitando comenzar con microservicios. La tesis central es **empezar simple, con límites claros, y separar componentes únicamente cuando aparezca una necesidad real de escala**.

La propuesta combina:

- Angular como frontend.
- .NET como backend.
- PostgreSQL como base de datos.
- Azure como infraestructura.
- API Management como puerta de entrada.
- App Service para ejecutar el backend.
- Static Web Apps para el frontend.
- Un enfoque de monolito modular.
- Multi-tenancy mediante un esquema de PostgreSQL por cliente.
- JWT con access token y refresh token.
- Servicios de Azure para identidad, eventos y almacenamiento.

> Fuente: transcripción aportada del video. Se conserva la terminología y las decisiones técnicas del referente.

---

## 2. Stack completo mencionado

### Frontend

**Angular**

El video lo elige frente a React porque considera que Angular es más opinado: establece una forma más definida de trabajar y, según el autor, eso puede beneficiar a equipos pequeños al reducir decisiones diferentes entre desarrolladores.

Se plantea como una **Single Page Application (SPA)**.

### Hosting del frontend

**Azure Static Web Apps**

El navegador recibe HTML, CSS y JavaScript como archivos estáticos distribuidos mediante CDN.

El frontend no contiene el backend ni conoce directamente su ubicación interna.

### API Gateway

**Azure API Management**

Toda comunicación del frontend con el backend pasa por esta puerta de entrada.

El gateway:

1. valida el JSON Web Token;
2. aplica rate limiting;
3. enruta la solicitud hacia el backend correspondiente.

La idea es que el frontend conozca solamente el punto de entrada y no la ubicación de los servicios internos.

### Backend

**.NET**

El backend se plantea como un **monolito modular** desplegado en Azure App Service.

El video menciona que puede utilizarse una versión moderna de .NET, citando como ejemplo .NET 9 o .NET 10.

### Base de datos

**PostgreSQL**

El video la prefiere porque:

- es open source;
- es madura;
- está disponible como servicio en Azure;
- evita licencias de SQL Server;
- permite implementar el modelo multi-tenant propuesto.

### Infraestructura

**Microsoft Azure**

El video concentra allí la infraestructura para mantener una integración nativa entre los distintos servicios.

Menciona:

- Azure Static Web Apps;
- Azure API Management;
- Azure App Service;
- PostgreSQL / Azure Database for PostgreSQL Flexible Server;
- servicios de identidad;
- Service Bus;
- almacenamiento de archivos.

---

## 3. Arquitectura propuesta

```text
Usuario
   ↓
Angular SPA
   ↓ HTTPS
Azure API Management
   ↓
.NET Monolito Modular
   ├── Auth
   ├── Billing
   ├── Tenant
   ├── Core
   └── Notifications
   ↓
PostgreSQL
   ├── public
   ├── tenant_ABC
   ├── tenant_XYZ
   └── ...
```

El backend es un solo proceso y un solo despliegue, pero internamente está dividido en módulos.

Los módulos no deben llamarse directamente entre sí. El referente plantea interfaces o eventos internos y un mediador interno para reducir el acoplamiento.

---

## 4. Monolito modular

Esta es una de las ideas más importantes del video.

El autor rechaza comenzar directamente con microservicios porque considera que un equipo pequeño normalmente no necesita esa complejidad desde el inicio.

El monolito modular permite:

- un único proceso;
- un único despliegue;
- módulos claramente separados;
- carpetas y servicios propios;
- endpoints definidos;
- interfaces o eventos internos;
- posibilidad de separar posteriormente un módulo.

Ejemplo:

```text
.NET App
├── Auth
├── Billing
├── Tenant
├── Core
└── Notifications
```

Si Billing necesita escalar de manera independiente posteriormente, se puede separar porque su límite ya estaba definido.

### Principio del referente

> No empezar con microservicios. Empezar con límites claros.

---

## 5. Multi-tenancy

El video utiliza un enfoque de **esquema PostgreSQL por tenant**.

No propone:

```text
una base de datos por cliente
```

ni:

```text
una única tabla con todos los clientes mezclados y tenant_id en cada consulta
```

Propone:

```text
Una misma base PostgreSQL

public
├── tenant_registry
├── plans
└── subscriptions

tenant_ABC
├── orders
├── users
├── settings
└── audit

tenant_XYZ
├── orders
├── users
├── settings
└── audit
```

Cada cliente tiene su propio esquema dentro de la misma base.

### Ventajas que destaca el video

- aislamiento estructural;
- mayor claridad;
- menor riesgo de mezclar datos;
- posibilidad de borrar el esquema completo de un cliente;
- misma estructura para cada tenant;
- facilidad para escalar posteriormente.

La arquitectura determina el esquema según el tenant identificado.

---

## 6. Tenant ID

El `tenant_id` aparece como concepto fundamental.

El backend obtiene el tenant desde el JWT y utiliza esa información para determinar dónde deben ejecutarse las consultas.

El video destaca que el aislamiento debe pensarse desde el primer día y no agregarse después.

---

## 7. Autenticación

Se propone autenticación mediante **JWT** con dos tokens:

- access token;
- refresh token.

Duraciones indicadas por el video:

```text
Access token  → 15 minutos
Refresh token → 7 días
```

El access token contiene:

- user ID;
- tenant ID;
- plan;
- roles.

Así el backend puede conocer:

- quién es el usuario;
- a qué empresa pertenece;
- qué plan tiene;
- qué puede hacer;
- en qué contexto de datos debe operar.

Cuando expira el access token, el cliente solicita uno nuevo utilizando el refresh token.

---

## 8. Escalabilidad

El enfoque del video es:

```text
empezar simple
↓
medir
↓
identificar qué duele
↓
escalar únicamente ese componente
```

Para aproximadamente 1.000 clientes, el referente plantea utilizar autoscaling de App Service.

Ejemplo mencionado:

```text
CPU > 70%
↓
crear otra instancia
```

También menciona PostgreSQL Flexible Server con posibilidad de escalar verticalmente.

Si un módulo específico necesita más recursos:

```text
Monolito modular
↓
aislar módulo
↓
convertirlo en servicio independiente
```

No se recomienda separar todo desde el comienzo.

---

## 9. Costos mencionados

El video indica que, para comenzar con tráfico bajo, el costo aproximado sería de:

**US$50–80 mensuales.**

También afirma que no sería necesario comenzar con una infraestructura de US$2.000 mensuales.

Este importe es una **estimación expresada por el autor del video**, no un presupuesto universal ni una cotización actual de Azure.

---

## 10. Filosofía de desarrollo

El video propone una arquitectura deliberadamente práctica:

- tecnología con soporte;
- infraestructura administrada;
- pocas piezas al inicio;
- monolito modular;
- separación clara de dominios;
- escalar solamente cuando exista una necesidad;
- evitar complejidad prematura.

El propio autor reconoce que no es necesariamente el stack más atractivo para redes sociales o tendencias, pero considera que resuelve necesidades reales de soporte, trabajo y escalabilidad.

---

## 11. Qué hace importante a este referente

### Importancia: ALTA

La parte más valiosa no es necesariamente Angular o Azure.

Es el principio arquitectónico:

**monolito modular + límites claros + evolución progresiva.**

También es muy importante el modelo de multi-tenancy estructural mediante esquemas separados.

---

## 12. Elementos que deben conservarse como referencia

1. Monolito modular.
2. Separación por dominios.
3. No comenzar con microservicios.
4. Multi-tenancy pensado desde la base de datos.
5. Aislamiento por tenant.
6. JWT con contexto de tenant y roles.
7. API Gateway como punto de entrada.
8. Escalabilidad progresiva.
9. Separar un módulo solo cuando exista una necesidad real.
10. Infraestructura administrada.
11. Control de costos iniciales.

---

## 13. Elementos que no necesariamente debemos copiar

El video no demuestra que Angular + .NET + Azure sea obligatorio para cualquier SaaS.

Su valor principal para nuestro análisis está en la **arquitectura y los principios**, no en sustituir automáticamente nuestro stack actual.

