/* ==============================================================
   QAWAY SHARED PROFILES - TYPES
   ==============================================================

   Tipos compartidos para perfiles y preferencias de usuario.
   Definiciones seguras para compartir - solo estructuras de datos,
   sin lógica de negocio ni efectos secundarios.
   ------------------------------------------------------------------ */

export type ThemePreference = 'light' | 'dark' | 'system'

export type LanguagePreference = 'es' | 'en' | 'fr' | 'de' | 'pt' | 'custom'

export type NotificationSetting = 'enabled' | 'disabled' | 'only_urgent'

export interface UserProfile {
  /** Identificador único del usuario */
  id: string
  /** Nombre de visualización */
  display_name: string
  /** Correo electrónico */
  email: string
  /** Rol del usuario en el sistema */
  role: 'admin' | 'user' | 'viewer' | 'customer'
  /** ID del tenant/empresa asociado */
  tenant_id: string
  /** Fecha de creación de la cuenta */
  created_at: string
  /** Fecha de última actualización */
  updated_at: string
  /** Foto de perfil (URL o ID) */
  avatar_url?: string
  /** Nombre completo */
  full_name?: string
}

export interface UserPreferences {
  /** Tema visual preferido */
  theme: ThemePreference
  /** Idioma preferido para la UI */
  language: LanguagePreference
  /** Configuración de notificaciones */
  notifications: {
    /** Si están habilitadas globalmente */
    enabled: boolean
    /** Solo notificaciones urgentes */
    only_urgent: boolean
    /** Canales activados */
    channels: {
      /** Notificaciones internas en la app */
      internal: boolean
      /** Correo electrónico */
      email: boolean
      /** Notificaciones push del navegador */
      push: boolean
    }
  }
  /** Preferencias de sesión */
  session: {
    /** Recordar sesión */
    remember_me: boolean
    /** Cerrar sesión después de inactividad (minutos) */
    auto_logout_minutes?: number
  }
}

export interface TenantPreferences {
  /** Si las preferencias por tenant están habilitadas */
  enabled: boolean
  /** Tema por defecto para este tenant */
  default_theme: ThemePreference
  /** Idioma por defecto */
  default_language: LanguagePreference
  /** Configuración de notificaciones por defecto */
  default_notifications: {
    enabled: boolean
    only_urgent: boolean
    channels: {
      internal: boolean
      email: boolean
      push: boolean
    }
  }
  /** Horario de mantenimiento */
  maintenance_hours?: {
    start: string // HH:MM
    end: string // HH:MM
  }
}

/** Configuración de perfil que una app puede aplicar */
export type ProfileConfiguration = UserProfile & UserPreferences & {
  tenant_id: string
  last_modified: string
}

/** Opciones para actualizar un perfil */
export interface UpdateProfileOptions {
  /** Datos del perfil para actualizar */
  profile: Partial<UserProfile>
  /** Preferencias a actualizar */
  preferences?: Partial<UserPreferences>
  /** Confirmación de cambios */
  confirm: boolean
}