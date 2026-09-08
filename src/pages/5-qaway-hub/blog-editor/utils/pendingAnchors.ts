export interface PendingAnchorItem {
  id: string
  text: string
  topic: string
  note: string
  isHiddenDraft: boolean
}

/**
 * Extrae todas las anclas de enlaces pendientes y textos marcados en el HTML del post.
 */
export function extractPendingAnchors(html: string): PendingAnchorItem[] {
  if (!html || (!html.includes('data-pending-link') && !html.includes('data-hidden-draft'))) {
    return []
  }

  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const items: PendingAnchorItem[] = []

    // 1. Anclas de enlaces pendientes
    doc.querySelectorAll('[data-pending-link="true"]').forEach((el, idx) => {
      const text = el.textContent?.trim() || ''
      if (text) {
        items.push({
          id: `anchor-${idx}-${text.slice(0, 15)}`,
          text,
          topic: el.getAttribute('data-topic') || '',
          note: el.getAttribute('data-note') || '',
          isHiddenDraft: el.getAttribute('data-hidden-draft') === 'true',
        })
      }
    })

    return items
  } catch (err) {
    console.error('Error extrayendo anclas pendientes:', err)
    return []
  }
}

/**
 * Extrae todos los fragmentos marcados como borradores privados / texto oculto al público.
 */
export function extractHiddenDrafts(html: string): { id: string; text: string }[] {
  if (!html || !html.includes('data-hidden-draft')) {
    return []
  }

  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const items: { id: string; text: string }[] = []

    doc.querySelectorAll('[data-hidden-draft="true"]').forEach((el, idx) => {
      // Si no es ya un pending-link (para evitar duplicidad en la lista de borradores)
      if (!el.hasAttribute('data-pending-link')) {
        const text = el.textContent?.trim() || ''
        if (text) {
          items.push({
            id: `hidden-${idx}-${text.slice(0, 15)}`,
            text,
          })
        }
      }
    })

    return items
  } catch (err) {
    console.error('Error extrayendo borradores ocultos:', err)
    return []
  }
}

/**
 * Limpia el HTML para la vista pública:
 * - Elimina por completo elementos con data-hidden-draft="true".
 * - Desenvuelve los spans data-pending-link="true", dejando únicamente su texto plano.
 */
export function stripPendingAnchorsForPublic(html: string): string {
  if (!html) return ''
  if (!html.includes('data-pending-link') && !html.includes('data-hidden-draft')) {
    return html
  }

  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    // 1. Eliminar completamente elementos marcados como borrador oculto
    doc.querySelectorAll('[data-hidden-draft="true"]').forEach(el => {
      el.remove()
    })

    // 2. Desenvolver las anclas de enlaces pendientes (texto queda limpio, sin marcas ni estilos)
    doc.querySelectorAll('[data-pending-link="true"]').forEach(el => {
      const parent = el.parentNode
      while (el.firstChild) {
        parent?.insertBefore(el.firstChild, el)
      }
      el.remove()
    })

    return doc.body.innerHTML
  } catch (err) {
    console.error('Error limpiando anclas para vista pública:', err)
    return html
  }
}

/**
 * Convierte un ancla pendiente específica en un enlace formal <a href="..."> dentro del HTML.
 */
export function convertAnchorToLinkInHtml(
  html: string,
  targetText: string,
  url: string
): string {
  if (!html || !targetText) return html

  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    let converted = false

    doc.querySelectorAll('[data-pending-link="true"]').forEach(el => {
      if (!converted && el.textContent?.trim() === targetText.trim()) {
        const a = doc.createElement('a')
        a.href = url
        a.textContent = el.textContent || targetText
        a.className = 'text-accent font-semibold underline underline-offset-2 hover:text-accent-dark'
        el.replaceWith(a)
        converted = true
      }
    })

    return converted ? doc.body.innerHTML : html
  } catch {
    return html
  }
}

/**
 * Quita la marca de ancla pendiente dejando el texto normal en el HTML.
 */
export function removeAnchorFromHtml(html: string, targetText: string): string {
  if (!html || !targetText) return html

  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    let removed = false

    doc.querySelectorAll('[data-pending-link="true"]').forEach(el => {
      if (!removed && el.textContent?.trim() === targetText.trim()) {
        const parent = el.parentNode
        while (el.firstChild) {
          parent?.insertBefore(el.firstChild, el)
        }
        el.remove()
        removed = true
      }
    })

    return removed ? doc.body.innerHTML : html
  } catch {
    return html
  }
}

/**
 * Alterna el estado oculto/público de un fragmento de borrador en el HTML.
 */
export function toggleHiddenDraftInHtml(html: string, targetText: string): string {
  if (!html || !targetText) return html

  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    let toggled = false

    doc.querySelectorAll('[data-hidden-draft="true"]').forEach(el => {
      if (!toggled && el.textContent?.trim() === targetText.trim()) {
        const parent = el.parentNode
        while (el.firstChild) {
          parent?.insertBefore(el.firstChild, el)
        }
        el.remove()
        toggled = true
      }
    })

    return toggled ? doc.body.innerHTML : html
  } catch {
    return html
  }
}
