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
            <pre style={{ textAlign: 'left', background: '#f4f4f5', padding: '1rem', borderRadius: '8px', color: '#b91c1c', fontSize: '13px', overflowX: 'auto', maxWidth: '800px', margin: '0 auto 1.5rem' }}>
              {this.state.error.toString()}
              {'\n'}
              {this.state.error.stack}
            </pre>
          )}
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
