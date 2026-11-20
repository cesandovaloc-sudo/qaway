import { Suspense } from 'react'

/**
 * Única vista de carga del Gestor de Proyectos 2.
 *
 * Antes esta ruta encadenaba hasta tres veces la rueda naranja global
 * (`RouteSuspense.jsx:10`, `HubAccessGuard.jsx:253` y el fallback del chunk en
 * `AppRouter.jsx:161`), y después cambiaba a las barras azules del shell: tres
 * o cuatro vistas distintas antes de mostrar la app.
 *
 * Este componente se usa en TODOS esos puntos para esta app. Es el mismo en el
 * router y en el shell, así que no hay cambio visual al entrar. Sin rueda, sin
 * color naranja y sin brillo neón: solo tres barras azules y el texto.
 * Estilos inline a propósito: el router lo muestra ANTES de cargar el CSS del
 * Gestor, así que no puede depender de `13-Gestor_Proyectos2/src/styles.css`.
 */

const BARRA = {
  display: 'block',
  width: '12px',
  borderRadius: '5px',
  background: '#2563eb',
  transformOrigin: 'bottom',
  animationName: 'qwBarraGestor',
  animationDuration: '1.1s',
  animationTimingFunction: 'cubic-bezier(0.45, 0.05, 0.55, 0.95)',
  animationIterationCount: 'infinite',
}

export function GestorRouteLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '18px',
        background: '#ffffff',
        userSelect: 'none',
      }}
    >
      <style>{`
        @keyframes qwBarraGestor {
          0%, 100% { transform: scaleY(0.35); opacity: 0.55; }
          50% { transform: scaleY(1); opacity: 1; }
        }
      `}</style>
      <div
        aria-hidden="true"
        style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '8px', height: '52px' }}
      >
        <span style={{ ...BARRA, height: '44px', animationDelay: '-0.30s' }} />
        <span style={{ ...BARRA, height: '34px', background: '#3b82f6', animationDelay: '-0.15s' }} />
        <span style={{ ...BARRA, height: '24px', background: '#60a5fa', animationDelay: '0s' }} />
      </div>
      <span
        style={{
          fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '0.28em',
          color: '#64748b',
          textTransform: 'uppercase',
        }}
      >
        QAWAY CARGANDO
      </span>
    </div>
  )
}

export function GestorRouteSuspense({ children }) {
  return <Suspense fallback={<GestorRouteLoading />}>{children}</Suspense>
}
