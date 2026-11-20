/* ==============================================================
   QAWAY SHARED PROFILES - HELPERS (PUROS)
   ==============================================================

   Funciones Helper puras para transformaciones de datos de perfil.
   - No tienen efectos secundarios (no tocan localStorage, Supabase, etc.)
   - Son seguras para importar y usar inmediatamente
   - Cada app usa solo las que necesita
   ------------------------------------------------------------------ */

/**
 * Normaliza un perfil usuario asegurando valores por defecto
 */
export function normalizeUserProfile(
  data: Partial<UserProfile>
): UserProfile {
  const now = new Date().toISOString()

  return {
    id: data.id || `user-${Date.now()}`,
    display_name: data.display_name || 'Usuario',
    email: data.email || '',
    role: data.role || 'user',
    tenant_id: data.tenant_id || '',
    created_at: data.created_at || now,
    updated_at: now,
    avatar_url: data.avatar_url,
    full_name: data.full_name,
  }
}

/**
 * Obtiene el tema visual de un usuario
 */
export function getPreferredTheme(prefs: UserPreferences): ThemePreference {
  return prefs.theme || 'system'
}

/**
 * Obtiene el idioma de un usuario
 */
export function getPreferredLanguage(prefs: UserPreferences): LanguagePreference {
  return prefs.language || 'es'
}

/**
 * Verifica si las notificaciones están habilitadas para un usuario
 */
export function userNotificationsEnabled(prefs: UserPreferences): boolean {
  return prefNotificationsEnabled(prefs.notifications)
}

/**
 * Función interna para verificar notificaciones
 */
function prefNotificationsEnabled(notify: { enabled: boolean; only_urgent?: boolean }): boolean {
  return notify.enabled === true
}

/**
 * Verifica si el usuario quiere solo notificaciones urgentes
 */
export function userOnlyUrgentNotifications(prefs: UserPreferences): boolean {
  return prefs.notifications.only_urgent === true
}

/**
 * Obtiene los canales de notificación activados
 */
export function getActiveNotificationChannels(prefs: UserPreferences): {
  internal: boolean
  email: boolean
  push: boolean
} {
  return prefs.notifications.channels
}

/**
 * Formatea la fecha de creación de un perfil en formato humano
 */
export function formatProfileCreatedAt(createdAt: string): string {
  const date = new Date(createdAt)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffDays < 1) {
    return 'hoy'
  } else if (diffDays < 30) {
    return `hace ${diffDays} días`
  } else {
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${day}/${month}/${date.getFullYear()}`
  }
}

/**
 * Verifica si el tema es oscuro
 */
export function isThemeDark(theme: ThemePreference): boolean {
  return theme === 'dark'
}

/**
 * Verifica si el tema es claro
 */
export function isThemeLight(theme: ThemePreference): boolean {
  return theme === 'light'
}

/**
 * Verifica si el tema es del sistema
 */
export function isThemeSystem(theme: ThemePreference): boolean {
  return theme === 'system'
}

/**
 * Obtiene el color asociado a un tema (para CSS classes)
 */
export function getThemeCssClass(theme: ThemePreference): string {
  switch (theme) {
    case 'dark':
      return 'theme-dark'
    case 'light':
      return 'theme-light'
    case 'system':
      return 'theme-system'
    default:
      return 'theme-light'
  }
}

/**
 * Normaliza las preferencias de un tenant
 */
export function normalizeTenantPreferences(
  data: Partial<TenantPreferences>
): TenantPreferences {
  return {
    enabled: data.enabled !== false,
    default_theme: data.default_theme || 'system',
    default_language: data.default_language || 'es',
    default_notifications: {
      enabled: data.default_notifications?.enabled !== false,
      only_urgent: data.default_notifications?.only_urgent || false,
      channels: {
        internal: data.default_notifications?.channels?.internal ?? true,
        email: data.default_notifications?.channels?.email ?? false,
        push: data.default_notifications?.channels?.push ?? false,
      },
    },
    ...(data.maintenance_hours && {
      maintenance_hours: data.maintenance_hours,
    }),
  }
}