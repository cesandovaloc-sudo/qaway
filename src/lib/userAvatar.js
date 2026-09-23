/**
 * Avatar de usuario (foto de stock) determinístico por email.
 * Mismo email → misma foto; distinto email → foto distinta (hash estable).
 */

const POOL = [
  11, 12, 32, 33, 45, 47, 60, 5, 1, 20, 26, 27, 36, 39, 41, 49, 51, 56, 57, 59, 61, 65, 68, 3,
]

function hashEmail(email) {
  let h = 0
  const s = String(email || '').trim().toLowerCase()
  if (!s) return 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

export function avatarFor(email) {
  const idx = POOL[hashEmail(email) % POOL.length]
  return `https://i.pravatar.cc/150?img=${idx}`
}

export function avatarForSize(email, size = 150) {
  const idx = POOL[hashEmail(email) % POOL.length]
  return `https://i.pravatar.cc/${size}?img=${idx}`
}