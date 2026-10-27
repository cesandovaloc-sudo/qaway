# Gestor de Proyectos 2 · Qaway Lab

## Propósito y Alcance
Módulo integral de Gestión de Proyectos Regionales (MINEDU · Dotación 2027) para seguimiento y coordinación territorial.
Incluye arquitectura de shell maestro persistente con Sidebar unificado, Topbar institucional con roles (Coordinador General / Gestora Territorial) y Canvas keep-alive.

## Mapeo de Enrutamiento y Slugs Canónicos
Cada módulo del gestor cuenta con su propio slug en la URL bajo el prefijo `/hub/gestor_proyecto` para navegación directa e historial:
* `/hub/gestor_proyecto/resumen`: Resumen del proyecto y métricas clave.
* `/hub/gestor_proyecto/cronograma`: Cronograma (Gantt macro / vista territorial).
* `/hub/gestor_proyecto/tareas`: Bandeja de tareas y tableros operativos.
* `/hub/gestor_proyecto/hitos`: Hitos rectores y control de cumplimiento.
* `/hub/gestor_proyecto/reuniones`: Coordinación de reuniones, agenda, calendario y traslados.
* `/hub/gestor_proyecto/reportes`: Reporteador territorial y analítica.
* `/hub/gestor_proyecto/equipo`: Gestión de equipo técnico y usuarios regionales (alias: `/usuarios`).
* `/hub/gestor_proyecto/actas`: Registro de actas y acuerdos (alias: `/actas-acuerdos`).

## Arquitectura y Reglas Técnicas
* **Keep-Alive**: Los lienzos permanecen montados en el DOM (`qm-pane` / `qm-pane-active` con `display: none`) para evitar parpadeos y preservar el estado vivo de filtros y vistas secundarias.
* **React Router v7**: Enrutamiento relativo y sincronizado con `location.pathname` y `localStorage`.
* **Candado Visual**: Respeto absoluto a la paleta institucional Slate/Navy, tokens tipográficos y diseño ergonómico aprobado.
