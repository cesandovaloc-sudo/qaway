/**
 * Avatar de usuario (foto de stock) determinístico por email.
 * Mismo email → misma foto; distinto email → foto distinta (hash estable).
 */

const POOL = [
  11, 12, 32, 33, 45, 47, 60, 5, 1, 20, 26, 27, 36, 39, 41, 49, 51, 56, 57, 59, 61, 65, 68, 3,
]

// Super administradores del ecosistema: avatar propio local (imagen del dueño),
// independiente del hash del pool. El archivo vive en public/assets/avatars/.
const SUPER_ADMIN_EMAILS = [
  'proyectos@qawaylab.com',
  'admin@qawaylab.com',
  'admin@qaway.test',
]
const SUPER_ADMIN_AVATAR = '/assets/avatars/super-admin.png'

function hashEmail(email) {
  let h = 0
  const s = String(email || '').trim().toLowerCase()
  if (!s) return 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

function avatarIndex(email) {
  return POOL[hashEmail(email) % POOL.length]
}

export function avatarFor(email) {
  const key = String(email || '').trim().toLowerCase()
  if (SUPER_ADMIN_EMAILS.includes(key)) return SUPER_ADMIN_AVATAR
  return `https://i.pravatar.cc/150?img=${avatarIndex(email)}`
}

export function avatarForSize(email, size = 150) {
  const key = String(email || '').trim().toLowerCase()
  if (SUPER_ADMIN_EMAILS.includes(key)) return SUPER_ADMIN_AVATAR
  return `https://i.pravatar.cc/${size}?img=${avatarIndex(email)}`
}