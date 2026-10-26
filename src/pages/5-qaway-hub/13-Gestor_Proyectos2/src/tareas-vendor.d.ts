import type { ComponentType } from 'react'

// Stub de tipos para el módulo Tareas v2 (qaway-tareas-v2-completo), vendido tal
// cual y con su propio tsconfig menos estricto. El import '@tareas-v2/app' se
// resuelve AQUÍ para tsc (que así no revisa el .tsx del módulo, cuyo código
// permanece 100% intacto), mientras que Vite lo resuelve al archivo real mediante
// el alias definido en vite.config.ts.
declare const TareasApp: ComponentType
export default TareasApp
