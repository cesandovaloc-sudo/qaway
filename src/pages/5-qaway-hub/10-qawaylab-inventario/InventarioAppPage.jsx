import { Component, Suspense } from 'react'
import { AuthProvider } from './src/context/AuthContext'
import AppRouter from './src/app/router/AppRouter'
import './src/index.css'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Inventario App ErrorBoundary]:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', background: '#f5f5f5', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111', marginBottom: '12px' }}>
            Hubo un problema al cargar el Inventario
          </h2>
          <p style={{ color: '#71717a', fontSize: '14px', marginBottom: '20px' }}>
            {this.state.error?.message || 'Error de conexión o componente.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '10px 20px', background: '#ff4b0b', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
          >
            Recargar
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default function InventarioAppPage() {
  return (
    <div className="qaway-inventario-root" style={{ minHeight: '100vh' }}>
      <AuthProvider>
        <ErrorBoundary>
          <Suspense fallback={
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
              <span style={{ fontSize: '14px', color: '#71717a' }}>Cargando Inventario...</span>
            </div>
          }>
            <AppRouter />
          </Suspense>
        </ErrorBoundary>
      </AuthProvider>
    </div>
  )
}
