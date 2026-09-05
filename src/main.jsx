import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.jsx'
import './index.css'

class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('RootErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
          <h1 style={{ color: '#dc2626', marginBottom: '1rem' }}>Algo salió mal</h1>
          <p style={{ color: '#52525b', marginBottom: '1rem' }}>No se pudo cargar la aplicación.</p>
          {this.state.error && (
            <p style={{ color: '#b91c1c', fontSize: '13px', margin: '0 auto 1.5rem', maxWidth: '600px', background: '#fef2f2', padding: '0.75rem 1rem', borderRadius: '6px', textAlign: 'left', wordBreak: 'break-word' }}>
              {this.state.error.message || this.state.error.toString()}
            </p>
          )}
          {import.meta.env.DEV && this.state.error?.stack && (
            <pre style={{ textAlign: 'left', background: '#f4f4f5', padding: '1rem', borderRadius: '8px', color: '#b91c1c', fontSize: '12px', overflowX: 'auto', maxWidth: '800px', margin: '0 auto 1.5rem' }}>
              {this.state.error.stack}
            </pre>
          )}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                localStorage.removeItem('qaway_gestor_projects');
                window.location.reload();
              }}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#ff4b0b',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Recargar página
            </button>
            <a
              href="/proyectos"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.75rem 1.5rem',
                background: '#27272a',
                color: 'white',
                borderRadius: '0.5rem',
                fontWeight: 600,
                textDecoration: 'none',
                fontSize: '14px'
              }}
            >
              Volver a Proyectos
            </a>
            <a
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.75rem 1.5rem',
                background: '#f4f4f5',
                color: '#18181b',
                borderRadius: '0.5rem',
                fontWeight: 600,
                textDecoration: 'none',
                fontSize: '14px',
                border: '1px solid #e4e4e7'
              }}
            >
              Ir al Inicio
            </a>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <RootErrorBoundary>
          <App />
        </RootErrorBoundary>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
)
