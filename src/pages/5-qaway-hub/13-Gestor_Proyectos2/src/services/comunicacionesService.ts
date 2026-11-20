/**
 * comunicacionesService.ts — Helpers puros de comunicación ágil del Gestor.
 * =====================================================================
 * Fuente única del teléfono de una persona: `public.users.phone`, expuesto
 * por `perfilVisibleService` en `phone` (yo) y `contactos` (mi tenant).
 *
 * No envía nada: construye deep links `wa.me` y `tel:` con el número real.
 * Si no hay número, devuelve null para que la UI NO abra un número inventado.
 */

export type Contacto = {
  userId: string;
  nombre: string;
  email: string;
  rol: string;
  phone: string | null;
};

/** Dígitos E.164 (sin '+'). Acepta 8–15 dígitos; normaliza celulares peruanos. */
export function normalizarTelefono(raw: unknown): string {
  const digits = String(raw ?? '').replace(/\D/g, '');
  if (!digits || digits.length < 8 || digits.length > 15) return '';
  // Celular peruano de 9 dígitos: se escribe con indicativo 51.
  if (/^9\d{8}$/.test(digits)) return `51${digits}`;
  return digits;
}

export function esTelefonoValido(raw: unknown): boolean {
  return Boolean(normalizarTelefono(raw));
}

/** Formato de lectura para el campo de Mi Perfil. */
export function formatearTelefono(raw: unknown): string {
  const digits = normalizarTelefono(raw);
  if (!digits) return '';
  if (/^51\d{9}$/.test(digits)) {
    return `+51 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }
  return `+${digits}`;
}

/** Valor canónico guardado en users.phone. */
export function telefonoParaGuardar(raw: unknown): string | null {
  const digits = normalizarTelefono(raw);
  return digits ? `+${digits}` : null;
}

/** deep link de WhatsApp con texto prellenado, o null si no hay número real. */
export function linkWhatsApp(raw: unknown, texto?: string): string | null {
  const digits = normalizarTelefono(raw);
  if (!digits) return null;
  const query = texto?.trim() ? `?text=${encodeURIComponent(texto.trim())}` : '';
  return `https://wa.me/${digits}${query}`;
}

/** deep link de llamada, o null si no hay número real. */
export function linkLlamada(raw: unknown): string | null {
  const digits = normalizarTelefono(raw);
  return digits ? `tel:+${digits}` : null;
}

function normalizarNombre(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Busca el teléfono real del tenant por correo (exacto) o por nombre
 * (exacto o contenida). Nunca devuelve un número de relleno.
 */
export function telefonoDeContacto(
  contactos: Contacto[],
  pista: { email?: unknown; nombre?: unknown } = {}
): string | null {
  if (!Array.isArray(contactos) || contactos.length === 0) return null;

  const email = String(pista.email ?? '').trim().toLowerCase();
  if (email) {
    const porEmail = contactos.find((c) => String(c.email ?? '').trim().toLowerCase() === email);
    if (porEmail?.phone) return porEmail.phone;
  }

  const nombre = normalizarNombre(pista.nombre);
  if (nombre) {
    const exacto = contactos.find((c) => normalizarNombre(c.nombre) === nombre);
    if (exacto?.phone) return exacto.phone;
    const contenido = contactos.find((c) => {
      const cn = normalizarNombre(c.nombre);
      return cn && (cn.includes(nombre) || nombre.includes(cn));
    });
    if (contenido?.phone) return contenido.phone;
  }

  return null;
}
