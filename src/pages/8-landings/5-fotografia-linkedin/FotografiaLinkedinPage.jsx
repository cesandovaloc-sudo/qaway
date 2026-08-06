import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Aperture,
  ArrowRight,
  CalendarDays,
  Camera,
  Check,
  Download,
  Menu,
  ScanFace,
  Sparkles,
} from 'lucide-react'
import { WHATSAPP_LINK } from '@/data/navigation'
import FotografiaLinkedinSections from './FotografiaLinkedinSections'

const serviceSteps = [
  { label: 'Dirección', icon: ScanFace },
  { label: 'Retrato', icon: Camera },
  { label: 'Selección', icon: Check },
  { label: 'Entrega', icon: Download },
]

const displayFont = {
  fontFamily: "'Arial Narrow', 'Roboto Condensed', Impact, sans-serif",
  fontStretch: 'condensed',
}

function BookingButton({ compact = false }) {
  return (
    <a
      href={WHATSAPP_LINK}
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex items-center justify-center gap-2.5 bg-[#ff4b0b] text-white font-medium hover:bg-[#e63d00] active:translate-y-px transition-all ${
        compact ? 'px-5 py-3 text-xs' : 'px-6 py-3.5 text-sm'
      }`}
    >
      <CalendarDays size={compact ? 14 : 16} />
      Reservar sesión
      {!compact && <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />}
    </a>
  )
}

export default function FotografiaLinkedinHeroPage() {
  return (
    <main className="min-h-screen bg-[#171716] text-white">
      <section className="min-h-[100dvh] grid xl:grid-cols-[29.5%_42.5%_28%] overflow-hidden">
        <aside className="relative min-h-[46rem] xl:min-h-[100dvh] bg-[#efede8] text-[#171716] overflow-hidden">
          <Link
            to="/pruebas"
            className="absolute z-20 left-6 sm:left-9 top-6 sm:top-8 text-2xl sm:text-[2rem] font-semibold tracking-[-0.06em]"
          >
            Qaway Lab
          </Link>
          <motion.img
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            src="/assets/pages/8-landings/5-fotografia-linkedin/retrato-perfil-masculino.png"
            alt="Retrato profesional editorial en perfil"
            className="absolute inset-0 w-full h-full object-cover object-[48%_center] grayscale"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/10 via-transparent to-[#efede8]/10 pointer-events-none" />
        </aside>

        <section className="relative min-h-[52rem] xl:min-h-[100dvh] bg-[#191918] overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.16] pointer-events-none"
            style={{
              backgroundImage:
                'url("data:image/svg+xml,%3Csvg viewBox=%220 0 180 180%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.72%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%220.42%22/%3E%3C/svg%3E")',
            }}
          />

          <header className="relative z-20 h-24 px-7 lg:px-10 flex items-center justify-between" />

          <div className="relative z-10 min-h-[calc(100dvh-6rem)] px-7 sm:px-12 lg:px-[clamp(3rem,5vw,5.5rem)] pt-10 pb-7 flex flex-col">
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex-1 flex flex-col justify-center max-w-[39rem]"
            >
              <div className="absolute -left-8 sm:-left-14 top-[2%] bottom-[8%] w-16 sm:w-24 pointer-events-none">
                <span className="absolute top-0 left-0 w-full h-2 bg-[#ff4b0b]" />
                <span className="absolute top-0 left-0 w-2 h-[24%] bg-[#ff4b0b]" />
                <span className="absolute bottom-0 left-0 w-full h-2 bg-[#ff4b0b]" />
                <span className="absolute bottom-0 left-0 w-2 h-[24%] bg-[#ff4b0b]" />
              </div>

              <p className="text-[10px] uppercase tracking-[0.22em] text-[#ff4b0b] mb-6 ml-1">
                Retratos profesionales · LinkedIn
              </p>
              <h1
                className="text-[clamp(4.35rem,7vw,8.2rem)] leading-[0.84] tracking-[-0.035em] uppercase text-[#f1f0ec]"
                style={displayFont}
              >
                Tu perfil
                <span className="block">habla antes</span>
                <span className="block">que tú<span className="text-[#ff4b0b]">.</span></span>
              </h1>

              <div className="mt-6 h-[3px] w-8 bg-[#ff4b0b]" />
              <p className="mt-5 max-w-sm text-sm sm:text-[15px] leading-relaxed text-white/52">
                Retratos profesionales con dirección, intención y una imagen que se siente tuya.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-7">
                <BookingButton />
                <a
                  href="#proceso"
                  className="group inline-flex items-center gap-5 text-sm text-white/85 border-b border-[#ff4b0b] pb-2 hover:text-white transition-colors"
                >
                  Ver el proceso
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1.5" />
                </a>
              </div>
            </motion.div>

            <div id="proceso" className="grid grid-cols-2 sm:grid-cols-4 border-t border-white/18">
              {serviceSteps.map(({ label, icon: Icon }, index) => (
                <div
                  key={label}
                  className={`group min-h-24 flex flex-col items-center justify-center gap-2.5 ${
                    index > 0 ? 'border-l border-white/18' : ''
                  } ${index === 2 ? 'border-l-0 sm:border-l' : ''}`}
                >
                  <Icon size={22} strokeWidth={1.45} className="text-[#ff4b0b] transition-transform group-hover:-translate-y-1" />
                  <span className="text-[10px] text-white/62">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="grid min-h-[52rem] xl:min-h-[100dvh] grid-rows-[57%_43%]">
          <div className="relative bg-[#efede8] text-[#171716] px-8 lg:px-10 pt-7 pb-9 flex flex-col">
            <div className="flex justify-end">
              <BookingButton compact />
            </div>
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.75 }}
              className="mt-auto"
            >
              <h2
                className="text-[clamp(2.4rem,3vw,4rem)] leading-[0.94] tracking-[-0.02em] uppercase max-w-sm"
                style={displayFont}
              >
                Fotografías para LinkedIn que proyectan confianza<span className="text-[#ff4b0b]">.</span>
              </h2>
              <div className="mt-5 w-7 h-[2px] bg-[#ff4b0b]" />
              <p className="mt-5 text-[13px] leading-relaxed text-black/58 max-w-xs">
                Una sesión guiada para profesionales que quieren verse auténticos, seguros y alineados con lo que hacen.
              </p>

              <div className="mt-7 border border-black/14 px-5 py-4 flex items-center gap-4">
                <span className="w-12 h-12 shrink-0 bg-[#ff4b0b] text-white grid place-items-center">
                  <Aperture size={22} strokeWidth={1.7} />
                </span>
                <div>
                  <strong className="text-lg tracking-tight">+ Presencia</strong>
                  <p className="mt-1 text-[11px] text-black/48">Una imagen alineada con tu perfil profesional.</p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="relative overflow-hidden bg-[#121212]">
            <motion.img
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 1 }}
              src="/assets/pages/8-landings/5-fotografia-linkedin/retrato-profesional-femenino.png"
              alt="Retrato profesional en blanco y negro"
              className="absolute inset-0 w-full h-full object-cover object-[68%_center] grayscale"
            />
            <div className="absolute inset-0 bg-linear-to-r from-black/30 via-transparent to-transparent pointer-events-none" />
            <div className="absolute left-5 bottom-5 inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-white/55">
              <Sparkles size={12} className="text-[#ff4b0b]" />
              Imagen con intención
            </div>
          </div>
        </aside>
      </section>
      <FotografiaLinkedinSections />
    </main>
  )
}
