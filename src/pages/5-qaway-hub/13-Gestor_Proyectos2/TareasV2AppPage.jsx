import { Component } from 'react'
// Módulo Tareas v2 (qaway-tareas-v2-completo/qaway-tareas): acoplado tal cual,
// sin modificar su código. El CSS se sirve desde tareas-v2.scoped.css (copia con
// scope .qt-v2 generada a partir del styles.css original) para evitar colisiones
// de nombres de clase con el resto del Hub (.sidebar, .topbar, .avatar, ...).
import App from './qaway-tareas-v2-completo/qaway-tareas/src/App'
import './tareas-v2.scoped.css'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Tareas V2 App ErrorBoundary]:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', background: '#f3f5f8', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#19283b', marginBottom: '12px' }}>
            Hubo un problema al cargar el módulo de Tareas
          </h2>
          <p style={{ color: '#778496', fontSize: '14px', marginBottom: '20px' }}>
            {this.state.error?.message || 'Error de conexión o componente.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '10px 20px', background: '#3c519e', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
          >
            Recargar
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default function TareasV2AppPage() {
  return (
    <div className="qaway-tareas-v2-root hub-shell qt-v2" style={{ minHeight: '100vh' }}>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </div>
  )
}
