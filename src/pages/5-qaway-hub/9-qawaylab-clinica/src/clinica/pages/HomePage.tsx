import React from 'react'
import { Link } from 'react-router-dom'
import { HeartPulse, ShieldCheck, Bell, PawPrint, Stethoscope, ArrowRight } from 'lucide-react'

const APP_NAME = import.meta.env.VITE_APP_NAME || 'Expedientes'

// Vista previa de expediente (ficha real, no fake screenshot)
function RecordPreview() {
  return (
    <div className="bg-ink-2 border border-line rounded-2xl p-5 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_20px_50px_rgba(0,0,0,0.45)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-xl bg-accent-soft border border-accent-line flex items-center justify-center font-display font-bold text-accent">L</span>
          <div>
            <p className="font-display font-bold text-sm">Luna · Paciente #2481</p>
            <p className="text-[10px] font-mono text-muted">Canina · 3 años · 12.4 kg</p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-success/15 text-success">Al día</span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { k: 'Temp', v: '38.4°' },
          { k: 'FC', v: '92' },
          { k: 'FR', v: '24' },
        ].map(m => (
          <div key={m.k} className="bg-white/[0.04] border border-line rounded-lg p-2.5 text-center">
            <p className="text-[9px] font-bold uppercase text-muted">{m.k}</p>
            <p className="font-mono text-sm text-white mt-0.5">{m.v}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between bg-white/[0.03] border border-line rounded-lg px-3 py-2 text-[11px]">
          <span className="text-muted">Vacuna DHPPL</span>
          <span className="font-mono text-white">12 mar 2026</span>
        </div>
        <div className="flex items-center justify-between bg-white/[0.03] border border-line rounded-lg px-3 py-2 text-[11px]">
          <span className="text-muted">Desparasitación</span>
          <span className="font-mono text-white">28 feb 2026</span>
        </div>
        <div className="flex items-center justify-between bg-warning/10 border border-warning/25 rounded-lg px-3 py-2 text-[11px]">
          <span className="text-warning">Próxima: refuerzo</span>
          <span className="font-mono text-warning">30 may 2026</span>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-[100dvh] bg-ink text-white">
      <header className="border-b border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center font-display font-bold text-sm">
              {APP_NAME.charAt(0)}
            </span>
            <span className="font-display font-bold tracking-tight">{APP_NAME}</span>
          </div>
          <Link to="/panel" className="text-xs bg-white/[0.04] hover:bg-white/[0.08] border border-line rounded-xl px-4 py-2 font-bold transition-colors">
            Entrar al panel
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Hero split asimetrico */}
        <section className="pt-14 sm:pt-20 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-center">
            <div>
              <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-accent bg-accent-soft border border-accent-line rounded-full px-4 py-1.5 mb-6">
                <PawPrint className="w-3.5 h-3.5" />
                Historial clínico · humanos y veterinaria
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight leading-[1.02] mb-6">
                Todo el historial clínico
                <br />
                <span className="text-accent">en un solo lugar.</span>
              </h1>
              <p className="text-muted-bright max-w-xl text-base sm:text-lg mb-10 leading-relaxed">
                Fichas de pacientes, notas SOAP, vacunas, alergias, recetas y alertas automáticas.
                Para clínicas humanas y veterinarias. Tus pacientes acceden con un link seguro, sin login.
              </p>
              <Link
                to="/panel"
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover active:scale-[0.98] text-white font-display font-bold px-8 py-4 rounded-xl transition-all"
              >
                Crear mi clínica <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="lg:pl-4">
              <RecordPreview />
            </div>
          </div>
        </section>

        {/* Features: grilla editorial, no 3 cards iguales */}
        <section className="pb-16 border-t border-line pt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-line overflow-hidden rounded-2xl border border-line">
            {[
              {
                icon: Stethoscope,
                n: '01',
                title: 'Expediente completo',
                desc: 'Notas SOAP, signos vitales, diagnósticos y recetas en cada consulta. Todo el historial ordenado.',
              },
              {
                icon: Bell,
                n: '02',
                title: 'Alertas automáticas',
                desc: 'Vacunas por vencer, seguimientos y recordatorios por email y WhatsApp sin que nadie los programe.',
              },
              {
                icon: ShieldCheck,
                n: '03',
                title: 'Datos protegidos',
                desc: 'Cada clínica aislada con RLS. El dueño ve su expediente por link seguro, sin tocar datos ajenos.',
              },
            ].map(f => (
              <div key={f.n} className="bg-ink-2 p-6 sm:p-7 flex flex-col">
                <span className="font-mono text-[11px] text-muted mb-8">{f.n}</span>
                <f.icon className="w-6 h-6 text-accent mb-4" />
                <h3 className="font-display font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Cierre */}
        <section className="pb-20">
          <div className="bg-ink-2 border border-line rounded-2xl p-10 sm:p-12 flex flex-col items-center text-center gap-4">
            <HeartPulse className="w-8 h-8 text-accent" />
            <h2 className="text-2xl md:text-3xl font-display font-bold max-w-xl">
              Humano o mascota, el mismo expediente digital.
            </h2>
            <p className="text-muted max-w-lg text-sm">
              Un solo sistema para clínicas de salud y veterinarias. Véndelo a cualquier negocio de atención médica.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
