import { StrictMode, Component, ErrorInfo, ReactNode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
// @ts-ignore - CSS import side effect
import "./styles/index.css";

class RootErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("RootErrorBoundary caught:", error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "2rem", textAlign: "center", fontFamily: "system-ui, sans-serif" }}>
          <h1 style={{ color: "#dc2626", marginBottom: "1rem" }}>Algo salió mal</h1>
          <p style={{ color: "#52525b", marginBottom: "1.5rem" }}>No se pudo cargar la aplicación.</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "0.75rem 1.5rem",
              background: "#0aa8b6",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Recargar página
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </StrictMode>,
);
