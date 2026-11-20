/* ==============================================================
   QAWAY SHARED PROFILES - SERVICE
   ==============================================================

   Capa de servicio para operaciones de perfiles y preferencias.
   Define la interfaz que las aplicaciones implementarán según
   su arquitectura. Sin efectos secundarios en esta capa base.
   ------------------------------------------------------------------ */

import type {
  UserProfile,
  UserPreferences,
  TenantPreferences,
  ThemePreference,
  LanguagePreference,
  NotificationSetting,
  ProfileConfiguration,
  UpdateProfileOptions,
  UserPreferences,
} from './types'

// ==============================================================
// PERFIL DE USUARIO
// ==============================================================

/** Obtiene el rol de un perfil */
export function getUserRole(profile: UserProfile): 'admin' | 'user' | 'viewer' | 'customer' {
  return profile.role
}

/** Verifica si el usuario es administrador */
export function isUserAdmin(profile: UserProfile): boolean {
  return profile.role === 'admin'
}

/** Verifica si el usuario es viewer */
export function isUserViewer(profile: UserProfile): boolean {
  return profile.role === 'viewer'
}

/** Obtiene el ID del tenant de un perfil */
export function getTenantId(profile: UserProfile): string {
  return profile.tenant_id
}

/** Verifica si el perfil pertenece a un tenant específico */
export function belongsToTenant(profile: UserProfile, tenantId: string): boolean {
  return profile.tenant_id === tenantId
}

/** Obtiene la fecha de creación formateada */
export function getProfileCreatedAtFormatted(profile: UserProfile): string {
  return formatRelativeTime(profile.created_at)
}

/** Calcula los días desde que fue creado el perfil */
export function getProfileAgeInDays(profile: UserProfile): number {
  const created = new Date(profile.created_at).getTime()
  const now = new Date().getTime()
  return Math.floor((now - created) / 86400000)
}

/** Verifica si el perfil está reciente (menos de 30 días) */
export function isProfileRecent(profile: UserProfile): boolean {
  return getProfileAgeInDays(profile) < 30
}

// ==============================================================
// PREFERENCIAS DE USUARIO
// ==============================================================

/** Obtiene el tema preferido del usuario */
export function getUserTheme(userPrefs: UserPreferences): ThemePreference {
  return userPrefs.theme || 'system'
}

/** Obtiene el idioma preferido del usuario */
export function getUserLanguage(userPrefs: UserPreferences): LanguagePreference {
  return userPrefs.language || 'es'
}

/** Verifica si las notificaciones están habilitadas */
export function areUserNotificationsEnabled(userPrefs: UserPreferences): boolean {
  return userPrefs.notifications.enabled === true
}

/** Verifica si solo notificaciones urgentes */
export function isUserOnlyUrgentNotifications(userPrefs: UserPreferences): boolean {
  return userPrefs.notifications.only_urgent === true
}

/** Obtiene los canales de notificación activados */
export function getUserNotificationChannels(userPrefs: UserPreferences): {
  internal: boolean
  email: boolean
  push: boolean
} {
  return userPrefs.notifications.channels
}

/** Verifica si un canal de notificación está activado */
export function isUserNotificationChannelEnabled(
  userPrefs: UserPreferences,
  channel: 'internal' | 'email' | 'push'
): boolean {
  const channels = getUserNotificationChannels(userPrefs)
  return channels[channel] === true
}

/** Obtiene el tiempo de auto-logout configurado */
export function getUserAutoLogoutMinutes(userPrefs: UserPreferences): number | undefined {
  return userPrefs.session.auto_logout_minutes
}

/** Verifica si la sesión debe auto-cerrarse */
export function shouldAutoLogout(userPrefs: UserPreferences, minutesElapsed: number): boolean {
  const autoLogoutMinutes = getUserAutoLogoutMinutes(userPrefs)
  return autoLogoutMinutes !== undefined && minutesElapsed >= autoLogoutMinutes
}

/** Obtiene las preferencias completas del usuario */
export function getCompleteUserPreferences(userPrefs: UserPreferences): {
  theme: ThemePreference
  language: LanguagePreference
  notifications: {
    enabled: boolean
    onlyUrgent: boolean
    channels: {
      internal: boolean
      email: boolean
      push: boolean
    }
  }
  session: {
    autoLogoutMinutes: number | undefined
  }
} {
  return {
    theme: getUserTheme(userPrefs),
    language: getUserLanguage(userPrefs),
    notifications: {
      enabled: areUserNotificationsEnabled(userPrefs),
      onlyUrgent: isUserOnlyUrgentNotifications(userPrefs),
      channels: getUserNotificationChannels(userPrefs),
    },
    session: {
      autoLogoutMinutes: getUserAutoLogoutMinutes(userPrefs),
    },
  }
}

// ==============================================================
// PRESTENCIAS POR TENANT
// ==============================================================

/** Verifica si las preferencias por tenant están habilitadas */
export function areTenantPreferencesEnabled(prefs: TenantPreferences): boolean {
  return prefs.enabled === true
}

/** Obtiene el tema por defecto del tenant */
export function getTenantDefaultTheme(prefs: TenantPreferences): ThemePreference {
  return prefs.default_theme
}

/** Obtiene el idioma por defecto del tenant */
export function getTenantDefaultLanguage(prefs: TenantPreferences): LanguagePreference {
  return prefs.default_language
}

/** Verifica si las notificaciones por defecto están habilitadas */
export function areTenantDefaultNotificationsEnabled(prefs: TenantPreferences): boolean {
  return prefs.default_notifications.enabled === true
}

/** Obtiene las notificaciones por defecto del tenant */
export function getTenantDefaultNotificationSettings(prefs: TenantPreferences) {
  return {
    enabled: areTenantDefaultNotificationsEnabled(prefs),
    onlyUrgent: prefs.default_notifications.only_urgent === true,
    channels: prefs.default_notifications.channels,
  }
}

/** Verifica si está dentro del horario de mantenimiento */
export function isWithinMaintenanceHours(
  prefs: TenantPreferences,
  currentTime?: Date
): boolean {
  const time = currentTime || new Date()
  const hours = prefs.maintenance_hours
  if (!hours) return false

  const currentHour = time.getHours().toString().padStart(2, '0')
  const currentMinute = time.getMinutes().toString().padStart(2, '0')
  const currentTimeStr = `${currentHour}:${currentMinute}`

  const start = hours.start
  const end = hours.end

  // Mantenimiento que cruza la medianoche (ej. 22:00 - 06:00)
  if (start > end) {
    return currentTimeStr >= start || currentTimeStr <= end
  }

  // Mantenimiento dentro del mismo día (ej. 09:00 - 17:00)
  return currentTimeStr >= start && currentTimeStr <= end
}

// ==============================================================
// CONFIGURACIÓN DE PERFIL
// ==============================================================

/** Valida las opciones para actualizar un perfil */
export function validateUpdateProfileOptions(options: UpdateProfileOptions): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!options.confirm) {
    errors.push('Se requiere confirmación para actualizar el perfil')
  }

  if (!options.profile) {
    errors.push('Datos de perfil son requeridos')
  } else {
    if (!options.profile.display_name) {
      errors.push('El nombre de visualización es requerido')
    }

    if (!options.profile.email) {
      errors.push('El correo electrónico es requerido')
    }

    if (!options.profile.tenant_id) {
      errors.push('El ID del tenant es requerido')
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/** Crea una configuración de perfil completa a partir de datos parciales */
export function createProfileConfiguration(
  profile: Partial<UserProfile>,
  preferences: Partial<UserPreferences>,
  tenantId: string
): ProfileConfiguration {
  const now = new Date().toISOString()

  return {
    ...profile,
    tenant_id: tenantId,
    last_modified: now,
    ...preferences,
  }
}

// ==============================================================
// EXPORTACIÓN DE TIPOS
// ==============================================================

export type {
  UserProfile,
  UserPreferences,
  TenantPreferences,
  ThemePreference,
  LanguagePreference,
  NotificationSetting,
  ProfileConfiguration,
  UpdateProfileOptions,
}