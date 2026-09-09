import { useState, useEffect, useRef, useCallback, type KeyboardEvent } from 'react'

interface HighlightRecord {
  parent: HTMLElement
  original: string
  mark: HTMLElement
  beforeNode: Text | null
  afterNode: Text | null
}

// Almacena los nodos de texto originales para restaurarlos después
let originalNodes: HighlightRecord[] = []

function restoreHighlights() {
  originalNodes.forEach(({ parent, original, mark, beforeNode, afterNode }) => {
    if (!parent || !mark || !parent.isConnected) return
    try {
      // El nodo original se dividió en [antes, mark, después]: restaurar el texto
      // completo y eliminar SOLO los fragmentos que creamos (referencias exactas),
      // para no duplicar, no hacer crecer el contenido ni borrar nodos vecinos
      const textNode = document.createTextNode(original)
      parent.replaceChild(textNode, mark)
      if (beforeNode && beforeNode.parentNode === parent) parent.removeChild(beforeNode)
      if (afterNode && afterNode.parentNode === parent) parent.removeChild(afterNode)
    } catch {}
  })
  originalNodes = []
}

function highlightInContainer(container: HTMLElement, query: string) {
  if (!container || !query) return 0

  restoreHighlights()

  const lowerQuery = query.toLowerCase()
  const textNodes: Text[] = []

  // Walk all text nodes in the container, excluding script/style tags and the search UI itself
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      // Skip script, style, and the search component itself
      if (node.parentElement?.closest('[data-search-root]')) return NodeFilter.FILTER_REJECT
      if (['SCRIPT', 'STYLE', 'MARK'].includes(node.parentElement?.tagName || '')) return NodeFilter.FILTER_REJECT
      return NodeFilter.FILTER_ACCEPT
    },
  })

  let node: Node | null
  while ((node = walker.nextNode())) {
    const text = node.textContent || ''
    if (text.toLowerCase().includes(lowerQuery)) {
      textNodes.push(node as Text)
    }
  }

  let matchCount = 0

  textNodes.forEach((textNode) => {
    const text = textNode.textContent || ''
    const parent = textNode.parentElement
    if (!parent) return

    const lower = text.toLowerCase()
    let idx = lower.indexOf(lowerQuery)
    if (idx === -1) return

    const before = text.slice(0, idx)
    const match = text.slice(idx, idx + query.length)
    const after = text.slice(idx + query.length)

    const fragment = document.createDocumentFragment()
    const beforeNode = before ? document.createTextNode(before) : null
    if (beforeNode) fragment.appendChild(beforeNode)

    const mark = document.createElement('mark')
    mark.setAttribute('data-search-highlight', 'true')
    mark.className = 'bg-yellow-300/80 text-surface-900 rounded-none px-0.5'
    mark.textContent = match
    fragment.appendChild(mark)

    const afterNode = after ? document.createTextNode(after) : null
    if (afterNode) fragment.appendChild(afterNode)

    // Guardar referencias exactas para restaurar sin duplicar ni borrar nodos vecinos
    originalNodes.push({ parent, original: text, mark, beforeNode, afterNode })

    parent.replaceChild(fragment, textNode)
    matchCount++
  })

  return matchCount
}

function scrollToFirstHighlight(container: HTMLElement) {
  if (!container) return
  const first = container.querySelector('mark[data-search-highlight]')
  if (first) {
    first.scrollIntoView({ behavior: 'smooth', block: 'center' })
    // Pulse animation
    first.classList.add('ring-2', 'ring-primary-500', 'ring-offset-1')
    setTimeout(() => {
      first.classList.remove('ring-2', 'ring-primary-500', 'ring-offset-1')
    }, 2000)
  }
}

export default function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [matchCount, setMatchCount] = useState(0)
  const [currentMatch, setCurrentMatch] = useState(0)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)

  // Cleanup highlights al desmontar el componente (navegación a otra página)
  useEffect(() => {
    return () => {
      restoreHighlights()
      originalNodes = []
    }
  }, [])

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
    if (!open) {
      restoreHighlights()
      setQuery('')
      setMatchCount(0)
      setCurrentMatch(0)
    }
  }, [open])

  // Cerrar con Escape en toda la página mientras el buscador está abierto
  useEffect(() => {
    if (!open) return
    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [open])

  const doSearch = useCallback(() => {
    const q = query.trim()
    if (!q) {
      restoreHighlights()
      setMatchCount(0)
      setCurrentMatch(0)
      return
    }

    const main = (document.querySelector('main') as HTMLElement | null) || document.body
    const count = highlightInContainer(main, q)
    setMatchCount(count)
    setCurrentMatch(count > 0 ? 1 : 0)

    if (count > 0) {
      scrollToFirstHighlight(main)
    }
  }, [query])

  const navigateMatch = useCallback((direction: 'next' | 'prev') => {
    const marks = Array.from(document.querySelectorAll<HTMLElement>('mark[data-search-highlight]'))
    if (marks.length === 0) return

    // Remove pulse from all
    marks.forEach(m => (m as HTMLElement).classList.remove('ring-2', 'ring-primary-500', 'ring-offset-1'))

    const nextIndex = direction === 'next'
      ? (currentMatch % marks.length)
      : ((currentMatch - 2 + marks.length) % marks.length)

    const target = marks[nextIndex]
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' })
      target.classList.add('ring-2', 'ring-primary-500', 'ring-offset-1')
      setTimeout(() => {
        target.classList.remove('ring-2', 'ring-primary-500', 'ring-offset-1')
      }, 2000)
      setCurrentMatch(nextIndex + 1)
    }
  }, [currentMatch])

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setOpen(false)
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      doSearch()
    }
    if (e.key === 'F3' || (e.ctrlKey && e.key === 'g')) {
      e.preventDefault()
      navigateMatch('next')
    }
    if (e.ctrlKey && e.key === 'G') {
      e.preventDefault()
      navigateMatch('prev')
    }
  }

  return (
    <div className="relative flex items-center" ref={rootRef} data-search-root>
      <div className={`flex items-center overflow-hidden transition-all duration-300 ${open ? 'w-72 mr-2' : 'w-0 mr-0'}`}>
        <div className="w-full flex items-center gap-1">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar en esta página..."
            className="input-field h-9 text-sm px-3 py-1.5 flex-1"
          />
          {matchCount > 0 && (
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-xs text-surface-500 tabular-nums whitespace-nowrap">
                {currentMatch} de {matchCount}
              </span>
              <button
                type="button"
                onClick={() => navigateMatch('prev')}
                className="flex h-7 w-7 items-center justify-center rounded text-surface-500 hover:bg-surface-100 hover:text-surface-700 transition-colors"
                title="Anterior (Ctrl+Shift+G)"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => navigateMatch('next')}
                className="flex h-7 w-7 items-center justify-center rounded text-surface-500 hover:bg-surface-100 hover:text-surface-700 transition-colors"
                title="Siguiente (Enter o F3)"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className={`flex h-10 w-10 items-center justify-center rounded-none transition-colors ${open ? 'bg-primary-50 text-primary-600' : 'text-surface-400 hover:bg-surface-50 hover:text-surface-700'}`}
        title={open ? 'Cerrar buscador (Escape)' : 'Buscar en página (Ctrl+F)'}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </div>
  )
}
