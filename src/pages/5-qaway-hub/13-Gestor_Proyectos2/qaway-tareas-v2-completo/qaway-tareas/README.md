# Qaway Gestor de Proyectos — Módulo Tareas v2

Módulo independiente de tareas preparado para acoplarse al módulo Reuniones de Qaway. Sigue el stack Qaway v4: React 19, TypeScript, Vite, Tailwind CSS 4 y Lucide React.

## Incluye
- Separador interno: Todas las tareas, Tablero Kanban, Mis tareas, Por hito y Consultas.
- Indicadores de tareas registradas, en curso, vencidas y en consulta.
- Búsqueda, filtros y exportación CSV.
- Alta de tareas con origen, tipo, responsable, prioridad, vencimiento y hito opcional.
- Ficha de trabajo con pestañas: Resumen, Checklist, Actividad y Archivos y vínculos.
- Solicitante, asignador, entregable esperado, causa de bloqueo, comentarios e historial de cambios.
- Referencia de reunión/acta para futura integración con el módulo Reuniones.
- Checklist, cambio de estado, trazabilidad local y persistencia en el navegador.
- Tareas operativas independientes sin obligarlas a pertenecer a un hito.
- Diseño responsive y componentes con Lucide React.

## Ejecutar
```bash
npm install
npm run dev
```

## Validación
```bash
npm run typecheck
npm run lint
npm run build
```

## Límites de esta entrega
- Incluye datos demostrativos; la persistencia actual usa localStorage del navegador.
- No está conectado a Supabase ni a una API compartida.
- La referencia de reunión/acta es un campo de enlace futuro, no una relación activa con el módulo Reuniones.
- Los nombres de solicitante y asignador son campos de registro; no implementan todavía permisos ni jerarquía de coordinadores.
- En Archivos se registran referencias textuales; la carga real de archivos requiere integrar almacenamiento.
- La integración real de hitos, cronograma, dependencias y aprobaciones se hará al conectarlo con el proyecto anfitrión.
