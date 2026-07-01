# Qaway Academy - Supabase Playbook

## Objetivo

Construir la Academia de Qaway con esta base:

- `React` para toda la experiencia visual
- `Supabase` como backend principal
- `PostgreSQL` como base de datos
- `Storage` de Supabase para archivos si aplica
- `Auth` de Supabase para usuarios si aplica

La prioridad es:

1. avanzar por partes
2. no bloquearse por querer resolver todo a la vez
3. dejar una base escalable para Qaway y para futuros clientes

## Regla principal

No construir un LMS gigantesco de una sola vez.

Primero construir una academia funcional, limpia y vendible por etapas.

## Forma de trabajo

Trabajar en fases cortas y cerradas.

Cada fase debe entregar:

- una meta clara
- un alcance limitado
- una salida visible
- una verificacion simple

Si una fase necesita mas de 1 dia de trabajo mental, dividirla.

## Enfoque de arquitectura

### Capa visual

- Landing publica
- catalogo de cursos
- pagina de detalle de curso
- login / registro visual
- area del alumno
- panel admin basico

### Capa de negocio

- cursos
- modulos
- lecciones
- progreso
- inscripcion
- certificados
- pagos o estado de acceso
- roles

### Capa de datos

- usuarios
- perfiles
- cursos
- matriculas
- progreso
- certificados
- archivos
- logs basicos

## Inspiracion visual

Antes de construir, revisar referencias de:

- academias de cursos premium
- escuelas online modernas
- plataformas tipo Domestika
- plataformas tipo Platzi
- plataformas tipo Crehana

Objetivo visual:

- limpio
- premium
- claro
- escalable
- con jerarquia fuerte
- sin look generico de plantilla

## Fases sugeridas

### Fase 1 - Base de producto

Objetivo:
- dejar clara la estructura general de Academy

Entregables:
- mapa de paginas
- mapa de secciones
- decisiones de stack
- modelo de datos inicial

### Fase 2 - UI publica

Objetivo:
- construir la experiencia visible principal

Entregables:
- home
- catalogo
- detalle de curso
- CTA de acceso
- estilo visual consistente

### Fase 3 - Auth y perfil

Objetivo:
- permitir entrada de usuarios

Entregables:
- login
- registro
- recuperar acceso
- perfil basico

### Fase 4 - Academia funcional

Objetivo:
- que el alumno pueda avanzar dentro del sistema

Entregables:
- matricula
- progreso
- visualizacion de lecciones
- estados de avance

### Fase 5 - Certificados y cierres

Objetivo:
- validar el valor academico

Entregables:
- certificados
- completado
- descarga o verificacion

### Fase 6 - Escalabilidad

Objetivo:
- dejar base reusable para otros clientes

Entregables:
- configuracion por tenant o marca
- componentes reutilizables
- esquema de datos extensible

## Subagentes recomendados

### Subagente 1 - Arquitectura

Responsabilidad:
- definir la estructura tecnica
- decidir tablas
- decidir flujos
- proponer componentes base

### Subagente 2 - UX/UI

Responsabilidad:
- definir la apariencia
- revisar referencias
- crear sistema visual
- evitar soluciones genericas

### Subagente 3 - Data / Supabase

Responsabilidad:
- definir tablas
- relaciones
- reglas
- auth
- storage

### Subagente 4 - Frontend

Responsabilidad:
- construir pantallas
- conectar componentes
- manejar estados
- dejar la experiencia lista para usar

### Subagente 5 - QA / Revision

Responsabilidad:
- revisar errores
- detectar huecos
- validar consistencia
- confirmar que nada roto se entrega

## Instrucciones para cualquier subagente

1. Leer primero el contexto general.
2. Trabajar solo en su responsabilidad.
3. No tocar otras partes por iniciativa propia.
4. Si falta informacion, asumir lo minimo necesario y declararlo.
5. Entregar resultados concretos, no teoria larga.
6. Si algo depende de otra fase, dejarlo documentado y seguir.

## Reglas de calidad

- No usar plantillas obvias.
- No repetir cards iguales por inercia.
- No llenar todo de bloques.
- No meter complejidad si no agrega valor.
- No inventar features que no ayuden a vender o operar.
- No cerrar decisiones sin dejar justificacion corta.

## Entregables esperados de cada tarea

Cada tarea debe terminar con al menos uno de estos resultados:

- archivo creado o actualizado
- decision documentada
- flujo aclarado
- prototipo visible
- riesgo identificado
- siguiente paso definido

## Checklist antes de avanzar

- La fase tiene un objetivo unico
- El alcance es pequeno
- El resultado se puede revisar visualmente o por estructura
- No depende de una reconstruccion gigante
- Se puede retomar luego sin perder contexto

## Prompts de control

### Prompt base para un agente

Trabaja solo en la responsabilidad asignada. No toques otras areas. Antes de proponer cambios, resume brevemente el contexto que entiendes. Luego entrega una solucion concreta, dividida por pasos pequeños, y deja claro que parte queda lista para revisar.

### Prompt base para un subagente visual

Analiza la referencia visual, extrae el sistema de composicion y luego propone una version propia para Qaway. No hagas una plantilla generica. Prioriza jerarquia, aire, contraste y sensacion premium.

### Prompt base para un subagente tecnico

Define la base minima para que el sistema funcione de forma realista con Supabase. No sobreingenierices. Prioriza tablas, relaciones, auth, storage y rutas criticas. Si falta algo, dejalo como pendiente documentado.

## Resultado esperado

Cuando este playbook se use bien, la IA deberia:

- avanzar por partes
- no repetir preguntas
- no mezclar frentes
- dejar la base lista para crecer
- permitir revision humana sin caos

