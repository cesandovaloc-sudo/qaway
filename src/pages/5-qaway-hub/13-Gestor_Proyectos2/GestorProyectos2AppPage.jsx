import { Component } from 'react'
import App from './src/App'
import './src/styles.css'

class GestorProyectos2ErrorBoundary extends Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Gestor Proyectos 2]:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 32, background: '#f4f6f8' }}>
          <section style={{ maxWidth: 560, textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
            <h1 style={{ color: '#19283b' }}>No se pudo cargar Gestor de Proyectos</h1>
            <p style={{ color: '#5b6777' }}>{this.state.error?.message || 'Intenta recargar la página.'}</p>
            <button type="button" onClick={() => window.location.reload()} style={{ padding: '10px 18px', border: 0, borderRadius: 8, background: '#3c519e', color: '#fff', cursor: 'pointer' }}>
              Recargar
            </button>
          </section>
        </main>
      )
    }
    return <App />
  }
}

export default function GestorProyectos2AppPage() {
  return <GestorProyectos2ErrorBoundary />
}
