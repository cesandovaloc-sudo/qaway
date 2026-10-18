import React, { Component, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import NotFoundPage from '@/pages/NotFoundPage';
import PreguntasFrecuentesApp from './src/PreguntasFrecuentesApp';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[PreguntasFrecuentesAppPage ErrorBoundary]:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111', marginBottom: '12px' }}>
            Hubo un problema al cargar el módulo de Casuísticas y Preguntas Frecuentes
          </h2>
          <p style={{ color: '#71717a', fontSize: '14px', marginBottom: '20px' }}>
            {this.state.error?.message || 'Error de conexión o componente.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '10px 20px', background: '#b91c1c', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
          >
            Recargar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function PreguntasFrecuentesAppPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  // Si la URL pública trae parámetros no autorizados como admin, redirige estrictamente a la pantalla oficial 404
  if (searchParams.has('admin')) {
    return <NotFoundPage />;
  }

  return (
    <div className="qaway-casuisticas-app-page hub-shell" style={{ minHeight: '100vh', position: 'relative' }}>
      <ErrorBoundary>
        <Suspense
          fallback={
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
              <span style={{ fontSize: '14px', color: '#71717a' }}>Cargando Banco de Casuísticas MINEDU...</span>
            </div>
          }
        >
          <PreguntasFrecuentesApp />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

