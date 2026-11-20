/* ==============================================================
   QAWAY SHARED PROFILES - PUBLIC API
   ==============================================================

   Punto de entrada para importar funcionalidades de perfiles y preferencias.
   Las aplicaciones pueden importar solo lo que necesiten.

   Ejemplos de importación:
   - import { UserProfile, areUserNotificationsEnabled } from '@/shared/profiles'
   - import { getPreferredTheme, getUserRole } from '@/shared/profiles'
   - import { normalizeUserProfile, validateUpdateProfileOptions } from '@/shared/profiles'
   ------------------------------------------------------------------ */

export {
  // Tipos principales
  UserProfile,
  UserPreferences,
  TenantPreferences,
  ThemePreference,
  LanguagePreference,

  // Helpers de perfil
  normalizeUserProfile,
  getUserRole,
  getTenantId,
  belongsToTenant,
  getProfileCreatedAtFormatted,
  getProfileAgeInDays,
  isProfileRecent,
  isUserAdmin,
  isUserViewer,

  // Helpers de preferencias
  getPreferredTheme,
  getPreferredLanguage,
  userNotificationsEnabled,
  isUserOnlyUrgentNotifications,
  getActiveNotificationChannels,
  isUserNotificationChannelEnabled,
  getUserAutoLogoutMinutes,
  shouldAutoLogout,
  getCompleteUserPreferences,

  // Helpers de tenant
  areTenantPreferencesEnabled,
  getTenantDefaultTheme,
  getTenantDefaultLanguage,
  areTenantDefaultNotificationsEnabled,
  getTenantDefaultNotificationSettings,
  isWithinMaintenanceHours,

  // Validación y configuración
  validateUpdateProfileOptions,
  createProfileConfiguration,

  // Servicio helpers
  getUserTheme,
  getUserLanguage,
  getProfileCssClass,

  // Exportación de tipos para re-exportar en otras apps
  ThemePreference,
  LanguagePreference,
}