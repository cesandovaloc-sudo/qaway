import type { ComponentType } from 'react'

// Stub de tipos para el módulo Cronograma (qaway-cronograma), vendido tal cual.
// El import '@cronograma/app' se resuelve AQUÍ para tsc (que así no revisa el
// .tsx del módulo, cuyo código permanece 100% intacto), mientras que Vite lo
// resuelve al archivo real mediante el alias definido en vite.config.ts.
declare const CronogramaApp: ComponentType
export default CronogramaApp
