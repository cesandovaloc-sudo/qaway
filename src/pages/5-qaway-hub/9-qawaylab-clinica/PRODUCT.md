# Product

<!-- impeccable:product-schema 1 -->

## Platform

web (responsive móvil primero; candidata a PWA por uso frecuente desde el celular en consulta)

## Users

Dos perfiles:

- Profesionales de la salud: clínicas humanas y veterinarias (consultorios, policlínicos, centros de vacunación). Necesitan expediente digital sin papeles.
- Pacientes / tutores: acceden a su historial con un link seguro, sin login.

## Product Purpose

Que un centro de salud lleve el expediente completo de cada paciente (fichas, notas SOAP, signos vitales, vacunas, alergias, recetas, diagnósticos) con alertas automáticas, y que el paciente consulte su historial por enlace seguro. Éxito = cero historiales en papel y cero alertas olvidadas.

## Positioning

Sistema dual humano + veterinaria en una sola plataforma, multi-clínica con aislamiento real (RLS). Revendible a cualquier negocio de atención médica. Acceso del paciente por token seguro sin registro.

## Operating Context

Flujo público (link seguro del paciente): ver expediente, sin login. Flujo clínico (panel): login, dashboard de pacientes, ficha con historia completa (SOAP, vitales, vacunas, alergias, recetas), generación de documentos (PDF, DOCX, Excel).

## Capabilities and Constraints

- Constraint: datos de salud, seguridad crítica (RLS estricto, tokens de acceso, sin datos cruzados entre clínicas).
- Stack: React 19 + Vite 8 + TypeScript + Tailwind v4, Supabase (Auth + Postgres + RLS), generación de documentos (pdfkit, docx, exceljs), notificaciones por Edge Function (Resend + WhatsApp).
- Constraint de diseño: identidad white-label configurable (VITE_APP_NAME), lista para revender.
- Adaptadores (services/adapters) para no acoplar a Supabase.

## Brand Commitments

- El paciente es dueño de su historial: acceso por link seguro, sin login.
- Cada clínica aislada: RLS, cero fuga de datos entre organizaciones.
- Alertas automáticas que nadie programa a mano.
- Documentos exportables (PDF, DOCX, Excel) para entregar al paciente.
