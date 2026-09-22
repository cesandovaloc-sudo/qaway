import { Navigate } from 'react-router-dom'

// 30.X: las funciones administrativas viven dentro del shell del Hub Panel.
// La ruta libre /hub/empresas redirige a la seccion Empresas del panel (/hub/panel/empresas).
export default function EmpresasPage() {
  return <Navigate to="/hub/panel/empresas" replace />
}