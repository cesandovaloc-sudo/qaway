import { Component } from 'react'
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react'
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
        <main
          role="alert"
          aria-live="assertive"
          style={{
            minHeight: '100vh',
            display: 'grid',
            placeItems: 'center',
            padding: '24px',
            background: '#f8fafc',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          }}
        >
          <section
            style={{
              width: '100%',
              maxWidth: '480px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '32px 28px',
              boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.06), 0 4px 10px -6px rgba(15, 23, 42, 0.04)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                margin: '0 auto 16px',
                borderRadius: '12px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#dc2626',
              }}
            >
              <AlertTriangle size={22} aria-hidden="true" />
            </div>

            <h1
              style={{
                margin: '0 0 8px',
                fontSize: '20px',
                fontWeight: 700,
                lineHeight: 1.3,
                color: '#0f172a',
              }}
            >
              Ocurrió un inconveniente al cargar el módulo
            </h1>

            <p
              style={{
                margin: '0 0 24px',
                fontSize: '15px',
                lineHeight: 1.55,
                color: '#475569',
              }}
            >
              No pudimos inicializar Gestor de Proyectos correctamente. Puedes recargar la vista o regresar al panel principal.
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                onClick={() => window.location.reload()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  border: 0,
                  borderRadius: '10px',
                  background: '#1e3a8a',
                  color: '#ffffff',
                  fontSize: '14.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <RefreshCw size={16} aria-hidden="true" />
                Recargar vista
              </button>

              <a
                href="/hub/panel"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  background: '#ffffff',
                  color: '#334155',
                  fontSize: '14.5px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'background-color 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <ArrowLeft size={16} aria-hidden="true" />
                Volver al Hub
              </a>
            </div>

            {this.state.error?.message && (
              <details
                style={{
                  marginTop: '24px',
                  paddingTop: '16px',
                  borderTop: '1px solid #f1f5f9',
                  textAlign: 'left',
                }}
              >
                <summary
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#64748b',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  Ver detalle técnico
                </summary>
                <pre
                  style={{
                    margin: '10px 0 0',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                    lineHeight: 1.45,
                    color: '#475569',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    overflowX: 'auto',
                  }}
                >
                  {this.state.error.message}
                </pre>
              </details>
            )}
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
