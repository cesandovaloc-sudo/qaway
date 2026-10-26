# Qaway · Módulo Reuniones

Prototipo funcional del módulo **Reuniones** para Qaway Gestor de Proyectos. Implementado con el stack Qaway v4: React, TypeScript, Vite, Tailwind CSS 4, React Router, Lucide y Oxlint.

## Incluye

- Vistas internas: Agenda mensual, Lista, Mapa esquemático, Itinerario y Actas.
- Alta y edición de reuniones presenciales o Google Meet ya existente.
- Validación de horario, filtros por búsqueda, estado, modalidad y región.
- Panel lateral de detalle con participantes, agenda, enlace y logística.
- Estimación manual de traslado y margen entre visitas.
- Borrador editable de acta, lista de archivos adjuntos y marcado manual de aprobación.
- Exportación CSV del listado filtrado.
- Persistencia local en `localStorage` para probar la interacción en un navegador.
- Diseño adaptable a escritorio, tablet y móvil; iconografía exclusivamente de `lucide-react`.

## Ejecutar

```bash
npm install
npm run dev
```

Validar build:

```bash
npm run build
npm run lint
```

## Antes de producción

Este prototipo **no** está conectado a Supabase, Google Calendar, Google Meet, almacenamiento de archivos ni a un proveedor de IA. Los datos de demostración y nuevos registros se guardan en el navegador donde se ejecuta; no se sincronizan entre usuarios. Las ubicaciones del mapa son esquemáticas, y los tiempos de traslado son manuales, no calculados por GPS.

Para producción, conectar el módulo a las tablas y políticas multi-tenant existentes de Qaway, almacenamiento protegido para evidencias, Google OAuth/Calendar/Meet APIs y el flujo de generación de actas desde una transcripción o notas autorizadas. Verificar RLS, permisos, consentimiento, retención y pruebas de extremo a extremo antes de publicar.
