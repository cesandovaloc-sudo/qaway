/**
 * Política de entrega automática de accesos a aplicaciones.
 *
 * false (estado actual):
 *   - Ninguna app se concede desde el onboarding / "completar perfil".
 *   - Ninguna app entra en prueba de 30 días por su cuenta.
 *   - El acceso se otorga de forma explícita (invitación por correo o acceso
 *     directo a la app por parte de quien administra la cuenta).
 *
 * true: restaura el comportamiento anterior (alta automática de apps y trial
 * de 30 días). La lógica se conserva para perfeccionarla más adelante.
 */
export const AUTO_APP_PROVISIONING_ENABLED = false

/** Días de prueba que aplica el onboarding cuando el alta automática está activa. */
export const TRIAL_DAYS = 30
