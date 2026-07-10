import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, Bot, GraduationCap,
  Puzzle, BookOpen, Cpu, ChevronRight, CheckCircle,
  Palette, Target, TrendingUp,
  MessageSquare,
  Camera, Pen, Share2, BrainCircuit, Rocket,
  Layers, ShoppingCart, Zap, Package, Settings,
  Play, BarChart3, LayoutTemplate, Workflow, Network, Box, PenTool,
} from 'lucide-react'
import { SectionTitle } from '@/components/ui'
import { WHATSAPP_LINK } from '@/data/navigation'

// ═══════════════════════════════════════════════════════════
// ■ DARK BLOCK 1 — HERO
// ═══════════════════════════════════════════════════════════

export function useCountUpOnView() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('[data-qaway-count="true"]'))
    if (els.length === 0) return

    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    const reduce = Boolean(prefersReduced)

    const animate = (el) => {
      const toRaw = el.getAttribute('data-qaway-to') || ''

      // Handle non-numeric targets like 24/7
      if (!/\d/.test(toRaw)) {
        el.textContent = toRaw
        return
      }

      const numMatch = toRaw.match(/\d+(?:[\.,]\d+)?/)
      const target = numMatch ? Number(numMatch[0].replace(',', '.')) : 0
      const prefix = toRaw.split(numMatch?.[0] || '')[0] || ''
      const suffix = (toRaw.split(numMatch?.[0] || '')[1] || '').trimEnd()
      if (reduce) {
        el.textContent = `${prefix}${numMatch?.[0] || target}${suffix}`
        return
      }

      const start = performance.now()
      const duration = 900

      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration)
        const eased = 1 - Math.pow(1 - t, 3)
        const value = Math.round(target * eased)
        el.textContent = `${prefix}${value}${suffix}`
        if (t < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            animate(e.target)
            io.unobserve(e.target)
          }
        }
      },
      { threshold: 0.4 }
    )

    for (const el of els) io.observe(el)
    return () => io.disconnect()
  }, [])
}


// ▢ LIGHT BLOCK 1 — STATS
// ═══════════════════════════════════════════════════════════