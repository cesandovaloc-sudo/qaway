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

export function WhatIsQawaySection() {
  return (
    <section className="pt-10 pb-10 bg-white">
      <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-4xl md:text-5xl font-display font-medium text-black mb-6 tracking-[-0.02em] leading-[1.05]">
            Un ecosistema para convertir ideas, marcas y procesos en{' '}
            <span className="italic text-black/60">estructuras claras.</span>
          </h2>
          <p className="text-lg text-black/80 leading-relaxed mb-8">
            Integramos estrategia digital, IA aplicada, diseno visual, automatizacion y formacion para ayudar a proyectos,
            profesionales y emprendimientos a construir una presencia digital solida y una operacion mas inteligente.
          </p>
          <div className="w-full h-px bg-black/10 mb-8" />
          <ul className="space-y-4">
            {[
              'Construye y fortalece marcas, profesionales y proyectos.',
              'Automatiza procesos, organiza tu operacion y aplica IA de forma practica.',
              'Aprende y ejecuta con herramientas, sistemas y formacion estructurada.',
            ].map((text) => (
              <li key={text} className="flex items-start">
                <CheckCircle size={20} className="text-qaway-accent mt-1 mr-3 shrink-0" />
                <span className="text-black font-semibold">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative h-[400px] w-full bg-white border border-black/10 rounded-3xl p-8 shadow-xs flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:24px_24px]" />

          <div className="relative w-full h-full">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black text-white px-6 py-3 rounded-xl font-display font-medium shadow-2xl z-20 border border-qaway-accent/50">
              Ecosistema Digital
            </div>

            <svg
              className="absolute inset-0 w-full h-full z-10 pointer-events-none stroke-black/20"
              style={{ strokeWidth: 2, fill: 'none', strokeDasharray: '4 4' }}
            >
              <path d="M 50% 50% L 20% 20%" />
              <path d="M 50% 50% L 80% 20%" />
              <path d="M 50% 50% L 80% 80%" />
              <path d="M 50% 50% L 20% 80%" />
            </svg>

            <div className="absolute top-[10%] left-[5%] bg-white border border-black/10 px-4 py-2 rounded-lg shadow-md font-bold text-sm flex items-center z-20 text-black/90">
              <PenTool size={16} className="mr-2 text-[#A855F7]" /> Estudio
            </div>
            <div className="absolute top-[10%] right-[5%] bg-white border border-black/10 px-4 py-2 rounded-lg shadow-md font-bold text-sm flex items-center z-20 text-black/90">
              <Cpu size={16} className="mr-2 text-qaway-accent" /> Sistemas Digitales
            </div>
            <div className="absolute bottom-[10%] right-[5%] bg-white border border-black/10 px-4 py-2 rounded-lg shadow-md font-bold text-sm flex items-center z-20 text-black/90">
              <GraduationCap size={16} className="mr-2 text-[#F43FB9]" /> Academy
            </div>
            <div className="absolute bottom-[10%] left-[5%] bg-white border border-black/10 px-4 py-2 rounded-lg shadow-md font-bold text-sm flex items-center z-20 text-black/90">
              <Target size={16} className="mr-2 text-blue-600" /> Estrategia
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

