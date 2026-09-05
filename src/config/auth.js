/**
 * Configuración de Autenticación y Control de Accesos - Qaway Lab
 */

export const ADMIN_EMAILS = [
  'proyectos@qawaylab.com',
  'admin@qawaylab.com',
]

/**
 * Verifica si un correo pertenece a la lista de Super Administradores
 */
export const isSuperAdmin = (email) => {
  if (!email || typeof email !== 'string') return false
  const clean = email.trim().toLowerCase()
  return ADMIN_EMAILS.some((admin) => admin.toLowerCase() === clean)
}

/**
 * Obtiene los datos del usuario autenticado actualmente en sesión
 */
export const getAuthUser = () => {
  try {
    const token = sessionStorage.getItem('qaway_auth_token') || localStorage.getItem('qaway_auth_token')
    const email = sessionStorage.getItem('qaway_auth_email') || localStorage.getItem('qaway_auth_email') || ''
    const role = sessionStorage.getItem('qaway_auth_role') || localStorage.getItem('qaway_auth_role') || (isSuperAdmin(email) ? 'admin' : 'user')

    if (!token) return null

    return {
      token,
      email,
      role,
      isAdmin: role === 'admin' || isSuperAdmin(email),
    }
  } catch (e) {
    return null
  }
}

/**
 * Cierra la sesión activa y limpia el almacenamiento
 */
export const logoutUser = () => {
  try {
    sessionStorage.removeItem('qaway_auth_token')
    sessionStorage.removeItem('qaway_auth_email')
    sessionStorage.removeItem('qaway_auth_role')
    localStorage.removeItem('qaway_auth_token')
    localStorage.removeItem('qaway_auth_email')
    localStorage.removeItem('qaway_auth_role')
  } catch (e) {}
}
