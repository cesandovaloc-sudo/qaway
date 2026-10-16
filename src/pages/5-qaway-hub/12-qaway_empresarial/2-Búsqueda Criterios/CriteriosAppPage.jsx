import React, { Component, Suspense, useState } from 'react'
import CriteriosApp from './src/CriteriosApp'
import CriteriosOriginalApp from './src/CriteriosOriginalApp'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[CriteriosAppPage ErrorBoundary]:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', background: '#f5f5f5', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111', marginBottom: '12px' }}>
            Hubo un problema al cargar el módulo de Búsqueda de Criterios
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

export default function CriteriosAppPage() {
  const [view, setView] = useState('fase6')

  return (
    <div className="qaway-criterios-app-page hub-shell" style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Botón flotante para comparar ambas versiones en tiempo real */}
      <div style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999, display: 'flex', gap: 6, background: '#18181b', padding: '4px 6px', borderRadius: 9999, boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}>
        <button
          type="button"
          onClick={() => setView('fase6')}
          style={{
            padding: '5px 12px',
            fontSize: '12.5px',
            fontWeight: '600',
            borderRadius: 9999,
            border: 'none',
            cursor: 'pointer',
            background: view === 'fase6' ? '#2563eb' : 'transparent',
            color: '#ffffff',
          }}
        >
          Versión Actual (Fase 6)
        </button>
        <button
          type="button"
          onClick={() => setView('original')}
          style={{
            padding: '5px 12px',
            fontSize: '12.5px',
            fontWeight: '600',
            borderRadius: 9999,
            border: 'none',
            cursor: 'pointer',
            background: view === 'original' ? '#2563eb' : 'transparent',
            color: '#ffffff',
          }}
        >
          Versión Original (Propuesta)
        </button>
      </div>

      <ErrorBoundary>
        <Suspense fallback={
          <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fcfcfc' }}>
            <span style={{ fontSize: '14px', color: '#71717a' }}>Cargando Búsqueda de Criterios...</span>
          </div>
        }>
          {view === 'original' ? <CriteriosOriginalApp /> : <CriteriosApp />}
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
