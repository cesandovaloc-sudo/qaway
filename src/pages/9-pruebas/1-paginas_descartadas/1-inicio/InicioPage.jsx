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

import { HeroSection } from './components/HeroSection'
import { StatsBar } from './components/StatsBar'
import { SystemRoadmapSection } from './components/SystemRoadmapSection'
import { EcosystemQuickNav } from './components/EcosystemQuickNav'
import { ServicesArchitectureSection } from './components/ServicesArchitectureSection'
import { useCountUpOnView } from './components/useCountUpOnView'
import { LandingsSection } from './components/LandingsSection'
import { CTASection } from './components/CTASection'
import { UseCasesBentoSection } from './components/UseCasesBentoSection'
import { MainAreasSection } from './components/MainAreasSection'

export default function InicioPage() {
  useCountUpOnView()

  const OCULTO = {
    quickNav: true,
    services: true,
  }

  return (
    <>
      {/* ■ DARK 1 — Hero */}
      <HeroSection />

      {/* Black stats bar + testimonial */}
      <StatsBar />

      {/* ▢ LIGHT — Roadmap (image recreation) */}
      <SystemRoadmapSection />

      {/* ■ DARK — Main areas */}
      <MainAreasSection />

      {/* ▢ LIGHT — Use cases */}
      <UseCasesBentoSection />

      {/* ■ DARK — CTA */}
      <CTASection />

      {/* ▢ LIGHT — Featured products */}
      <LandingsSection />

      {!OCULTO.quickNav && <EcosystemQuickNav />}
      {!OCULTO.services && <ServicesArchitectureSection />}
    </>
  )
}
