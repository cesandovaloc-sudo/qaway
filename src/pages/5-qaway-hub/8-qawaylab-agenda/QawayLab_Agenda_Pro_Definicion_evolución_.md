# Qaway Lab Agenda Pro
## Definición del producto, módulos y arquitectura funcional

**Versión:** 1.0  
**Fecha:** 28 de septiembre de 2026  
**Estado:** Documento de definición funcional y estructural

---

## 1. Qué es Qaway Lab Agenda Pro

Qaway Lab Agenda Pro es el módulo de gestión de agendas y atención por citas del ecosistema Qaway Lab. Permite que un negocio configure sus servicios, organice sus horarios y administre la atención de sus clientes desde un espacio de trabajo integrado al Hub.

Agenda Pro está orientada a negocios cuya operación se organiza mediante **servicios con horario y duración definidos**: consultorios, veterinarias, centros de estética, peluquerías, asesorías, estudios profesionales y otros negocios de atención programada.

La aplicación forma parte del Hub de Qaway Lab. No administra un sistema de cuentas independiente: utiliza la identidad, los tenants, los permisos y la estructura comercial central del ecosistema.

### Propósito

Centralizar la operación de agenda de cada negocio en un sistema conectado: desde la configuración del negocio y sus servicios hasta la organización de horarios, la atención al cliente y el seguimiento de la actividad.

---

## 2. Para quién es

### Usuarios principales

- **Propietario o administrador del negocio:** configura la operación, los servicios, los horarios y el equipo; supervisa la actividad.
- **Personal de atención o recepción:** consulta y gestiona la agenda operativa según los permisos asignados.
- **Profesionales que atienden clientes:** consultan su agenda y la información necesaria para organizar su jornada.
- **Clientes del negocio:** acceden al canal público del negocio para consultar servicios y gestionar sus citas mediante las funciones habilitadas.

### Tipos de negocio

Agenda Pro se dirige a negocios que trabajan con atención programada, por ejemplo:

- Veterinarias y consultorios.
- Centros de estética, peluquerías y servicios de cuidado personal.
- Consultorías y servicios profesionales.
- Estudios y centros de atención especializada.
- Otros negocios que asignan una duración y un horario a cada servicio.

La aplicación se especializa en **agendas de atención**. La administración de hospedajes, habitaciones o estadías por noche corresponde a una aplicación especializada del Hub, no al núcleo de Agenda Pro.

---

## 3. Estado actual y dirección del producto

La base existente ya incluye:

- Gestión de negocios y su configuración básica.
- Catálogo de servicios (`event_types`), con duración, buffer, precio, moneda, color y estado.
- Horarios (`schedules`) y excepciones de disponibilidad (`availability_exceptions`).
- Flujo público de consulta y reserva.
- Gestión de citas mediante enlaces de administración.
- Panel de administración.
- Estructuras de reservas, estados y mecanismos de gestión mediante token.
- Vista de disponibilidad y mecanismos de seguridad en evolución.
- Integración con Supabase, PostgreSQL, RLS y funciones RPC.

La base actual **no equivale todavía a una plataforma completa de gestión de agendas de equipos**. En particular, el modelo descrito no incluye una estructura de profesionales o recursos asignables a cada servicio y cita.

La dirección de Agenda Pro es consolidar lo existente y organizarlo como un producto operativo integrado al Hub, incorporando módulos de gestión profesional, permisos y seguimiento donde corresponda. La definición y construcción de la lógica de reservas queda fuera del alcance de este documento; las funciones existentes se conservan y no se rediseñan aquí.

---

## 4. Referentes y criterios de producto

Los referentes se utilizan como fuentes de patrones funcionales, no como modelos que deban copiarse íntegramente.

| Referente | Patrón útil para Agenda Pro | Aplicación en el producto |
|---|---|---|
| **Cal.com** | Experiencia de agenda, configuración de tipos de evento y organización de disponibilidad. | Mantener una experiencia clara para configurar servicios y horarios, con una interfaz consistente entre administración y acceso público. |
| **Easy!Appointments** | Flujo directo de citas y configuración de servicios, proveedores y horarios. | Priorizar una operación sencilla para negocios que necesitan organizar la atención sin complejidad innecesaria. |
| **Payload Reserve** | Separación conceptual entre servicios, recursos, horarios, clientes y reservas. | Mantener módulos con responsabilidades diferenciadas y relaciones explícitas entre los datos. |
| **LibreBooking** | Administración de recursos, calendarios, permisos y reglas de uso. | Tomar como referencia la organización de calendarios y permisos cuando se incorpore la gestión de profesionales o recursos. |
| **VoxelBooking** | Configuración de franjas horarias, recursos y capacidad. | Considerar sus patrones de configuración cuando un caso de uso requiera asignación de recursos o atención con capacidad limitada. |
| **OpenVPM** | Orientación a procesos de gestión veterinaria. | Tener presente el contexto operativo veterinario sin convertir Agenda Pro en un sistema clínico veterinario. |
| **QloApps** | Gestión de hospedajes mediante unidades, períodos, tarifas y ocupación. | Mantener hospedajes fuera del núcleo de Agenda Pro y dentro de un módulo especializado del Hub. |

### Criterios que se adoptan

1. **Configuración clara:** los servicios y horarios deben poder administrarse sin recorrer múltiples pantallas desconectadas.
2. **Separación de responsabilidades:** negocio, servicios, disponibilidad, equipo, clientes y actividad deben tener funciones identificables.
3. **Operación por permisos:** cada usuario debe acceder únicamente a las funciones y datos que le corresponden.
4. **Experiencia coherente:** el panel, la agenda operativa y la experiencia pública deben compartir identidad visual y reglas de negocio.
5. **Especialización por tipo de operación:** Agenda Pro administra atención por citas; el hospedaje utiliza un módulo distinto.
6. **Crecimiento justificado:** la gestión de profesionales y recursos se incorpora como capacidad estructural cuando el producto la requiera, sin crear desde ahora un modelo universal de recursos.

---

## 5. Módulos de Agenda Pro

Los módulos se organizan alrededor de una misma cuenta de negocio y comparten el contexto del tenant, los permisos y la configuración.

### Módulo 1. Centro de control

**Función:** ofrecer una vista resumida de la operación del negocio.

Debe reunir accesos y datos operativos relevantes, como:

- Estado general de la agenda.
- Actividad reciente.
- Accesos a servicios, horarios, equipo y configuración.
- Indicadores operativos disponibles según las capacidades habilitadas.

**Estado:** existe un panel de administración; la consolidación de una vista de control integral forma parte de la evolución del producto.

### Módulo 2. Negocio y perfil público

**Función:** administrar la identidad y los datos operativos del negocio.

Incluye:

- Nombre y datos del negocio.
- Identificador público o slug.
- Zona horaria.
- Datos de contacto, incluido WhatsApp cuando corresponda.
- Identidad visual y configuración pública.

**Base existente:** la tabla `businesses` contempla slug, propietario, zona horaria, WhatsApp y configuración de marca.

### Módulo 3. Catálogo de servicios

**Función:** definir qué servicios ofrece el negocio y bajo qué condiciones operativas.

Incluye:

- Nombre y descripción del servicio.
- Duración.
- Buffer configurado.
- Precio y moneda, cuando corresponda.
- Color e indicador de actividad.
- Relación del servicio con el negocio.

**Base existente:** `event_types` ya contempla duración, buffer, precio, moneda, color y estado activo.

### Módulo 4. Horarios y disponibilidad

**Función:** configurar los períodos en los que el negocio puede atender.

Incluye:

- Horarios regulares.
- Excepciones de disponibilidad.
- Configuración de zona horaria.
- Reglas de disponibilidad vinculadas al negocio y a sus servicios.

**Base existente:** `schedules` y `availability_exceptions`.

La disponibilidad debe ser coherente con la zona horaria del negocio y con las reglas centrales de seguridad. Este módulo no define aquí la lógica interna de reservas.

### Módulo 5. Agenda operativa

**Función:** ofrecer al equipo una vista organizada de la actividad programada.

Debe integrarse con los servicios, horarios, datos del negocio y permisos del usuario. La experiencia operativa debe permitir identificar la actividad correspondiente al negocio y, cuando exista la capacidad de asignación, al profesional responsable.

**Base existente:** hay páginas de administración y gestión de citas. La agenda individual por profesional no está respaldada por un modelo de asignación en el esquema descrito.

### Módulo 6. Equipo y profesionales

**Función:** organizar a las personas que participan en la atención del negocio.

La estructura funcional debe contemplar, cuando se implemente:

- Registro de profesionales o miembros del equipo.
- Relación con el negocio.
- Servicios que puede atender cada profesional.
- Horarios individuales.
- Permisos de acceso.
- Asociación de la actividad con el profesional responsable.

**Brecha actual:** no se ha identificado un modelo de profesionales ni campos de asignación como `staff_id` en `bookings`.

Este módulo es una capacidad estructural pendiente para que Agenda Pro pueda gestionar agendas individuales de equipos. No se presenta como una funcionalidad ya disponible.

### Módulo 7. Clientes

**Función:** centralizar la información necesaria para la atención y la continuidad de la relación con el cliente.

Debe distinguir la información del cliente de los datos operativos de cada cita y respetar los permisos de acceso.

**Base existente:** las reservas almacenan datos del cliente, pero no se ha confirmado un módulo CRM o una ficha de cliente independiente. Por tanto, una gestión integral de clientes no se considera existente.

### Módulo 8. Gestión de citas

**Función:** conservar el flujo actual de administración de citas y las acciones ya disponibles para el negocio y el cliente.

**Base existente:** existen páginas de reserva pública y gestión de citas, además de mecanismos de administración mediante token.

Este documento no rediseña ni amplía la lógica de reservas. Se conserva como parte de la aplicación actual y se deja fuera del análisis funcional solicitado.

### Módulo 9. Comunicación y recordatorios

**Función:** concentrar las comunicaciones relacionadas con la operación de la agenda.

Debe contemplar la configuración y el seguimiento de recordatorios y avisos, con canales habilitados por el sistema.

**Base existente:** existe una tabla `reminders`, pero el contexto técnico indica que las notificaciones no están operativas de extremo a extremo. No se considera que el módulo esté completo.

### Módulo 10. Reportes e indicadores

**Función:** presentar información de actividad que ayude al negocio a comprender el uso de su agenda.

La evolución del módulo debe distinguir entre cantidades, promedios y tasas, e indicar el período y la base de cálculo de cada indicador.

**Estado:** no se ha confirmado un módulo analítico completo en la base actual. Se considera parte de la estructura funcional de Agenda Pro, no una capacidad ya terminada.

### Módulo 11. Configuración y permisos

**Función:** administrar las preferencias del negocio y aplicar los permisos que habilitan las funciones de Agenda Pro.

La configuración de negocio debe mantenerse separada de la administración global del Hub.

**Regla central:** Agenda Pro consume el contexto de identidad, tenant, aplicación, plan y permisos definido por Qaway Lab. No crea un sistema paralelo de usuarios y tenants.

---

## 6. Cómo se conectan los módulos

La aplicación debe funcionar como un sistema integrado, no como un conjunto de pantallas independientes.

```text
QAWAY LAB HUB
│
├── Identidad, tenants y permisos centrales
│
├── Agenda Pro
│   │
│   ├── Centro de control
│   │
│   ├── Negocio y perfil público
│   │   ├── Catálogo de servicios
│   │   ├── Horarios y disponibilidad
│   │   └── Configuración del negocio
│   │
│   ├── Agenda operativa
│   │   ├── Gestión de citas existente
│   │   ├── Equipo y profesionales [capacidad pendiente]
│   │   └── Clientes
│   │
│   ├── Comunicación y recordatorios
│   ├── Reportes e indicadores
│   └── Configuración y permisos
│
└── Otros módulos del Hub
    ├── CRM
    ├── Inventario
    ├── Blog y canales digitales
    └── Aplicaciones especializadas, como hospedaje
```

### Relaciones funcionales

- El **negocio** define el contexto al que pertenecen servicios, horarios y actividad.
- Los **servicios** determinan las condiciones generales de atención.
- Los **horarios y excepciones** establecen la disponibilidad operativa del negocio.
- El **equipo** se vincula al negocio y, cuando se implemente la asignación, a los servicios y a la agenda individual.
- Los **clientes** se relacionan con la actividad de atención, respetando la separación de datos y permisos.
- La **comunicación** utiliza la información operativa necesaria para los avisos habilitados.
- Los **reportes** se alimentan de datos autorizados de la operación.
- El **Hub** determina qué usuario puede acceder al negocio y a las funciones de Agenda Pro.

---

## 7. Integración con el Hub Qaway Lab

Agenda Pro es una aplicación interna del ecosistema Qaway Lab. La integración debe respetar una separación clara entre la plataforma central y la lógica propia de la agenda.

### Responsabilidades del Hub

- Identidad y autenticación central.
- Gestión de tenants y negocios dentro del ecosistema.
- Usuarios, membresías y permisos.
- Asignación de aplicaciones y planes.
- Navegación común entre aplicaciones.
- Contexto de marca y cuenta.
- Administración global y control de acceso a los módulos.

### Responsabilidades de Agenda Pro

- Perfil operativo del negocio para la agenda.
- Catálogo de servicios.
- Horarios y excepciones.
- Organización de la actividad de atención.
- Datos específicos de Agenda Pro.
- Configuración y funciones propias de la agenda.

### Regla de propiedad

El tenant central de Qaway Lab es la autoridad del contexto comercial y de acceso. Agenda Pro mantiene sus tablas operativas vinculadas a ese contexto.

La relación entre `businesses.owner_id` y `businesses.tenant_id` debe quedar definida de forma inequívoca: el propietario identifica una responsabilidad o relación de usuario; el tenant determina el ámbito de pertenencia y aislamiento. Las políticas de acceso no deben depender de relaciones ambiguas ni dejar negocios sin una propiedad válida.

### Experiencia dentro del Hub

Desde el Hub, el usuario accede a Agenda Pro según su membresía y permisos. Una vez dentro, trabaja en el contexto del negocio autorizado y utiliza los módulos de Agenda Pro sin tener que crear una cuenta independiente.

La experiencia pública del negocio se conecta con Agenda Pro, pero no debe exponer información interna, datos de otros tenants ni detalles que no sean necesarios para la operación pública.

---

## 8. Base técnica y principios de implementación

La implementación actual se apoya en:

- **Frontend:** React, TypeScript, Vite y Tailwind CSS.
- **Backend y datos:** Supabase, PostgreSQL, PostgREST, RLS y funciones RPC.
- **Acceso a datos:** `agendaAdapter.ts` como capa de acceso a datos.
- **Estado de aplicación:** React Context.
- **Integración:** montaje dentro de `AgendaAppPage.jsx` en el Hub.

### Principios técnicos

1. Mantener Agenda Pro integrada en el montaje del Hub; no tratar su `index.html` local como una aplicación autónoma.
2. Mantener una capa de acceso a datos identificable y evitar consultas dispersas por los componentes.
3. Aplicar aislamiento por tenant en la base de datos, no únicamente en la interfaz.
4. Definir permisos y acceso de acuerdo con el modelo central de Qaway Lab.
5. Mantener las funciones públicas limitadas a la información estrictamente necesaria.
6. Validar las reglas importantes en el servidor y en la base de datos.
7. Incorporar pruebas automatizadas para las rutas críticas y las reglas de aislamiento.
8. Documentar las dependencias con el Hub y mantener una cadena de migraciones clara.

---

## 9. Diferencia entre lo existente y lo que debe consolidarse

| Área | Situación de la base actual | Dirección de Agenda Pro |
|---|---|---|
| Integración con el Hub | La app está montada dentro del Hub. | Mantenerla como módulo gobernado por el modelo central. |
| Negocio | Existe `businesses` con datos de negocio y tenant. | Formalizar propiedad, aislamiento y ciclo de vida del negocio. |
| Servicios | Existe `event_types`. | Consolidar su administración y relación con la operación. |
| Horarios | Existen `schedules` y `availability_exceptions`. | Unificar reglas y tratamiento de zona horaria. |
| Agenda operativa | Existen panel y páginas de gestión. | Organizar la experiencia por negocio y preparar la vista de equipo. |
| Profesionales | No se ha identificado modelo de personal ni asignación. | Incorporar una estructura de equipo y agenda individual cuando corresponda al alcance del producto. |
| Clientes | Hay datos de cliente asociados a reservas. | Definir una gestión de clientes propia si la operación lo requiere. |
| Recordatorios | Existe tabla `reminders`; el flujo no está completo. | Completar la comunicación operativa con permisos y ejecución verificables. |
| Reportes | No se ha confirmado un módulo analítico completo. | Definir indicadores con métricas y períodos explícitos. |
| Seguridad | Se utilizan RLS y RPC; hay aspectos de disponibilidad por consolidar. | Mantener el aislamiento por tenant y reducir la exposición pública a lo estrictamente necesario. |
| Hospedaje | No forma parte del modelo actual de citas. | Gestionarlo en una aplicación especializada conectada al Hub. |

---

## 10. Alcance de producto

Agenda Pro se define como **la aplicación del Hub para administrar negocios que atienden mediante citas y horarios**.

Su estructura reúne:

1. Centro de control.
2. Negocio y perfil público.
3. Catálogo de servicios.
4. Horarios y disponibilidad.
5. Agenda operativa.
6. Equipo y profesionales.
7. Clientes.
8. Gestión de citas existente.
9. Comunicación y recordatorios.
10. Reportes e indicadores.
11. Configuración y permisos.

Los módulos no tienen el mismo grado de implementación. La base actual cubre parte de la configuración, los servicios, los horarios y la gestión de citas. La gestión de profesionales, clientes como módulo independiente, comunicación operativa completa y analítica deben tratarse como capacidades por consolidar, no como funcionalidades terminadas.

La aplicación queda subordinada al modelo central de tenants, identidad y permisos de Qaway Lab. El hospedaje se mantiene separado como una aplicación especializada del mismo ecosistema.

---

## 11. De app independiente a módulo del Hub

**Estado:** consumado. Este apartado documenta un cambio ya ejecutado para que no se revierta por inercia.

### 11.1 Qué cambió

Hasta el 28 de septiembre de 2026 la agenda se documentaba y se configuraba como una aplicación autónoma. Ese modelo queda **derogado**. La agenda es un módulo del Hub, gobernado por Qaway Lab.

| Antes | Ahora |
|---|---|
| App independiente, portátil y vendible por separado | Módulo interno del Hub |
| Proyecto Supabase propio | Comparte la base central del Hub |
| Conexión con otras apps solo por enlaces | Composición dentro del Hub |
| Autonomía sobre tenants y permisos | Consume identidad, tenant, plan y permisos del Hub |

### 11.2 Los cuatro artefactos del modelo derogado

| Artefacto | Qué sostenía | Estado |
|---|---|---|
| `AGENTS.md` | Declaraba la app independiente, portátil, vendible por separado, con proyecto Supabase propio y sin depender de otras apps. | **Derogado.** Reescrito el 28-09-2026 con la doctrina del Hub. |
| `index.html` local | Residuo de poder servirse por separado. | **Pendiente.** No se usa. Debe eliminarse o anotarse como residuo. |
| `supabase/migrations/0001` y `0002` | Cadena de migraciones propia, paralela a la central. | **Pendiente.** Legado. No aplicarlos a ninguna base. |
| Patrón `2-qawaylab-academy` | Modelo a copiar para construir apps independientes. | **Derogado** como patrón de referencia para este módulo. |

### 11.3 Por qué esto no es cosmético

La doctrina derogada contenía **afirmaciones que el código contradecía**:

- Declaraba que la agenda tenía proyecto Supabase propio. **Falso**: su esquema vive en la cadena central y `businesses.tenant_id` referencia la tabla central `tenants`.
- Declaraba lógica server-side en Edge Functions. **Falso**: `supabase/functions` está vacío; la lógica vive en Postgres.
- Citar React Router 7 como dependencia. **Falso**: no figura en `package.json`.

Una instrucción falsa en un archivo de agente no es un error de redacción: es una instrucción que el siguiente agente obedece. Por eso este apartado se conserva como registro, y no solo como decisión.

### 11.4 Regla permanente

Ante cualquier duda sobre si algo es autónomo o gobernado por el Hub, **manda el esquema**: si una tabla de la agenda referencia `tenants`, referencia `saas_apps` o aparece en `supabase/migrations/` del monorepo, es del Hub. La documentación que diga lo contrario está desactualizada.

---

## 12. Anexo de hallazgos verificados en código

**Estado:** verificado por lectura directa del código el 28-09-2026. Estos puntos no pueden deducirse del diseño funcional y no aparecen en las secciones anteriores.

### 12.1 Exposición pública de la agenda de reservas — hallazgo prioritario

```sql
-- 20260920102000_agenda_coupled_central.sql:188
create or replace view public.booked_slots as
  select business_id, event_type_id, start_at, end_at
  from public.bookings
  where status in ('confirmed', 'pending_payment');
```

La vista **no declara `security_invoker`**. En PostgreSQL, una vista sin ese atributo se ejecuta con los permisos de su propietario, no de quien consulta. Consecuencia directa: el hardening hizo `revoke all on public.bookings from anon` y a la vez `grant select on public.booked_slots to anon`, de modo que **la revocación queda sorteada por la vista**.

No es una fuga de datos personales —no expone nombre, correo, teléfono ni `cancel_token`— pero **publica la agenda completa de todos los negocios de la plataforma, con `business_id` incluido**, sin autenticación ni límite de peticiones. Permite reconstruir por negocio las horas pico, el tipo de servicio contratado y la tasa de utilización.

Esto contradice el propósito declarado en la propia migración de hardening («la RPC es el único camino, defensa en profundidad»).

**Dirección de solución:** sustituir la vista por una función de consulta que responda a una pregunta concreta —«¿está libre el negocio X, el servicio Y, en la fecha Z?»— y devuelva un resultado acotado, en lugar de exponer la tabla. Es el mismo patrón que ya se aplicó correctamente a la reserva con `secure_create_booking`. La alternativa de añadir `security_invoker` haría que `anon` no viera filas y el portal perdería la consulta de disponibilidad.

### 12.2 Dos cadenas de migraciones — riesgo real, pero acotado

Existen dos ubicaciones de esquema para la agenda:

- **Local de la app:** `supabase/migrations/0001_agenda_schema.sql` y `0002_booking_free_only.sql` — **legado**.
- **Central del monorepo:** `supabase/migrations/`, 55 migraciones, incluida `20260920102000_agenda_coupled_central.sql` y el hardening `20260928160000_fix_agenda_security_hardening.sql`.

**Matiz importante:** aplicada en orden de timestamp, la cadena central produce un estado final correcto, porque el hardening (28-09) se ejecuta después de la definición coupled (20-09). El peligro no está en un despliegue automatizado.

El peligro real es acotado y concreto: la migración de hardening nombra políticas que existen en la `0001` local (`anon_insert_booking`, `anon_read_own_booking`, `anon_update_own_booking`). Si alguien aplica los archivos locales a una base nueva, **reconstruye exactamente las políticas que el hardening eliminó**.

**Acción:** archivar o anotar los archivos locales como legados. No es una emergencia; es higiene que evita un incidente futuro.

### 12.3 Ciclo de vida del tenant — estado indefinido

```sql
-- 20260920102000_agenda_coupled_central.sql:14
tenant_id uuid references public.tenants (id) on delete set null
```

Con `on delete set null`, **eliminar un tenant deja los negocios vivos pero desasociados**. El negocio queda en un estado no definido: cualquier regla que dependa de `tenant_id` deja de aplicarse, y si esas reglas son de denegación, la ausencia del valor se resuelve de forma no obvia.

Esto debe resolverse antes de operar con múltiples negocios: o el negocio se elimina con su tenant, o queda explícitamente en un estado "sin tenant" con permisos definidos. Lo que no puede quedar es un estado ambiguo.

### 12.4 Verificación de hospedaje: no existe lógica de hospedaje

Se verificó exhaustivamente que **no existe lógica de hospedaje en este repositorio**. Alcance de la búsqueda: toda la app, las 26 aplicaciones del Hub y las 55 migraciones centrales.

| Búsqueda | Resultado |
|---|---|
| Tablas o vistas con `habitacion`, `room`, `unit_`, `nightly`, `hospedaje` | **0** |
| Frases de hospedaje en código (`tarifa por noche`, `ocupación de hab.`, `estancia`, `huésped`, `check_in/out`) | **11 coincidencias, ninguna funcional** |
| Nombres de archivo con terminología de hospedaje | Todos son `Checkout` de carrito de comercio, sin relación |

Las 11 coincidencias se descomponen así:

- **7** están en este mismo documento, corresponde a la decisión de mantener hospedaje fuera del núcleo.
- **2** son saludos («Buenas noches») en la app Academy.
- **1** es copy de marketing («Noches 8:00 PM»).
- **1** es la cadena `"Hospedaje"` en el array `RUBROS` de `HubOnboardingPage.jsx:26`, que es una **etiqueta de sector** del formulario de onboarding, no un módulo ni un modelo de datos.

**Consecuencia práctica:** no hay nada que desacoplar ni preservar. Lo que debe conservarse es la **decisión arquitectónica** de que hospedaje viva en otra aplicación del Hub, que es lo que este documento establece. El riesgo real es el inverso: que un documento futuro asuma que existe hospedaje aquí y lo reconstruya sobre `bookings`.

Observación de producto, no de código: el onboarding del Hub ofrece «Hospedaje» como sector seleccionable, lo que sugiere una cobertura que hoy no existe como aplicación. Conviene alinear esa promesa con el catálogo real.

---

## 13. Resumen ejecutivo

**Qaway Lab Agenda Pro** es el módulo de gestión de agendas de atención por citas del Hub Qaway Lab.

Está dirigido a negocios que necesitan organizar servicios, horarios y atención al cliente desde una plataforma integrada. Conserva la base funcional existente y la estructura en módulos conectados: negocio, servicios, disponibilidad, agenda operativa, equipo, clientes, comunicación, reportes y configuración.

Su arquitectura depende del sistema central de identidad, tenants, aplicaciones, planes y permisos del Hub. No mantiene un sistema de tenants independiente.

La prioridad de producto es consolidar el modelo de propiedad y seguridad, organizar la experiencia operativa y definir las capacidades que faltan —especialmente la gestión de profesionales— sin rediseñar en este documento la lógica de reservas ni incorporar hospedaje al núcleo de Agenda Pro.
