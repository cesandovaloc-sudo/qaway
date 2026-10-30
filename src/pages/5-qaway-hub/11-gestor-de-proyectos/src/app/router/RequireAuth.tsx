import { Outlet } from 'react-router-dom'

// Auth deshabilitado para acceso directo libre a monitoreo y proyectos
export default function RequireAuth() {
  return <Outlet />
}
