import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Route, Briefcase, FlaskConical,
  Wrench, BarChart3, Zap, ArrowRight, MessageSquare, Calendar,
  Sparkles, TrendingUp, Layers, PenSquare
} from 'lucide-react'
import { useSetNavbarVariant } from '@/components/layout/Navbar'

const iconColors = {
  cyan: { bg: 'rgba(6,182,212,0.12)', color: '#06b6d4' },
  green: { bg: 'rgba(34,197,94,0.12)', color: '#22c55e' },
  yellow: { bg: 'rgba(255,210,0,0.12)', color: '#ffd200' },
  blue: { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6' },
  purple: { bg: 'rgba(168,85,247,0.12)', color: '#a855f7' },
  amber: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
}

const routes = [
  {
    icon: PenSquare,
    title: 'Editor Interno de Blog',
    description: 'Herramienta interna para crear articulos con categoria real, portada, bloques y snippet listo para integracion.',
    path: '/hub/blog-editor',
    palette: iconColors.amber,
    badge: 'Beta',
    category: 'herramientas',
  },
  {
    icon: Calendar,
    title: 'Consola WABA + CRM',
    description: 'Panel ejecutivo para campana: integracion WhatsApp API, payloads, checklist y pruebas E2E en un solo lugar.',
    path: '/hub/waba-crm',
    palette: iconColors.cyan,
    badge: 'Destacado',
    category: 'herramientas',
  },
  {
    icon: MessageSquare,
    title: 'Consola CRM Comercial',
    description: 'Bandeja multiagente de WhatsApp, atribucion en tiempo real de Meta Ads y analiticas estilo Power BI.',
    path: '/hub/crm',
    palette: iconColors.green,
    badge: 'Nuevo',
    category: 'herramientas',
  },
  {
    icon: Route,
    title: 'Ruta Marca / Emprendimiento',
    description: 'Desde la idea hasta tu estructura digital basica. Naming, logo, identidad, redes, landing y captacion.',
    path: '/hub/ruta-marca',
    palette: iconColors.yellow,
    badge: null,
    category: 'marcas',
  },
  {
    icon: Briefcase,
    title: 'Ruta Profesional / Oficina',
    description: 'Organizacion, reportes, dashboards, automatizacion y productividad para equipos y oficinas.',
    path: '/hub/ruta-profesional',
    palette: iconColors.blue,
    badge: null,
    category: 'profesional',
  },
  {
    icon: FlaskConical,
    title: 'Ruta Incubadora',
    description: 'Acompanamiento para validar ideas, proyectos o negocios con herramientas y modulos progresivos.',
    path: '/hub/ruta-incubadora',
    palette: iconColors.green,
    badge: null,
    category: 'marcas',
  },
  {
    icon: Wrench,
    title: 'Herramientas Guiadas',
    description: 'Soluciones modulares paso a paso para construir, organizar y mejorar tu operacion digital.',
    path: '/hub/herramientas',
    palette: iconColors.purple,
    badge: null,
    category: 'herramientas',
  },
  {
    icon: BarChart3,
    title: 'Dashboards',
    description: 'Paneles de control para medir, analizar y optimizar tu presencia y operacion digital.',
    path: '/hub/dashboards',
    palette: iconColors.cyan,
    badge: null,
    category: 'herramientas',
  },
  {
    icon: Zap,
    title: 'Automatizaciones',
    description: 'Flujos automaticos y conectores para optimizar procesos repetitivos y ganar productividad.',
    path: '/hub/automatizaciones',
    palette: iconColors.amber,
    badge: null,
    category: 'herramientas',
  },
]

const categories = [
  { key: 'marcas', title: 'Rutas de Marca', description: 'Construye y lanza tu presencia digital desde cero' },
  { key: 'profesional', title: 'Ruta Profesional', description: 'Organiza y optimiza tu operacion diaria' },
  { key: 'herramientas', title: 'Herramientas y Paneles', description: 'Soluciones modulares y dashboards de control' },
]

const styles = {
  heroSection: {
    position: 'relative',
    paddingTop: '120px',
    paddingBottom: '64px',
    background: 'linear-gradient(135deg, #0a0a0a 0%, #111 100%)',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    overflow: 'hidden',
    color: '#fff',
    zIndex: 20,
  },
  heroGlow: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(ellipse at top left, rgba(255,210,0,0.06), transparent 50%)',
    pointerEvents: 'none',
  },
  heroInner: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 32px',
    position: 'relative',
    zIndex: 10,
    textAlign: 'center',
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    background: 'rgba(255,210,0,0.1)',
    color: '#ffd200',
    border: '1px solid rgba(255,210,0,0.15)',
    marginBottom: '20px',
  },
  heroTitle: {
    fontSize: 'clamp(2rem, 5vw, 3.2rem)',
    fontWeight: 800,
    letterSpacing: '-0.02em',
    lineHeight: 1.1,
    color: '#fff',
    margin: 0,
  },
  heroSub: {
    marginTop: '14px',
    fontSize: '1rem',
    color: '#a1a1aa',
    fontWeight: 300,
    maxWidth: '640px',
    marginLeft: 'auto',
    marginRight: 'auto',
    lineHeight: 1.6,
  },
  body: {
    paddingTop: '48px',
    paddingBottom: '96px',
    background: '#fafafa',
    minHeight: '100vh',
  },
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 32px',
  },
  featuredRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))',
    gap: '24px',
    marginBottom: '56px',
  },
  featuredCard: (bg) => ({
    borderRadius: '24px',
    padding: '40px 36px',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    minHeight: '300px',
    background: bg,
    cursor: 'pointer',
    transition: 'transform 0.35s cubic-bezier(.22,1,.36,1), box-shadow 0.35s ease',
  }),
  featuredBadge: (bg, color) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '5px 14px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    background: bg,
    color: color,
    width: 'fit-content',
    marginBottom: '12px',
  }),
  featuredType: {
    fontSize: '13px',
    fontWeight: 500,
    opacity: 0.7,
    marginBottom: '4px',
  },
  featuredTitle: {
    fontSize: 'clamp(1.4rem, 3vw, 1.8rem)',
    fontWeight: 800,
    lineHeight: 1.15,
    margin: 0,
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '1.3rem',
    fontWeight: 800,
    color: '#18181b',
    letterSpacing: '-0.01em',
  },
  sectionLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    fontWeight: 600,
    color: '#71717a',
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
  catGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '16px',
    marginBottom: '56px',
  },
  catCard: {
    background: '#fff',
    border: '1px solid #e4e4e7',
    borderRadius: '16px',
    padding: '28px 16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s',
    textDecoration: 'none',
    color: 'inherit',
    textAlign: 'center',
  },
  catIcon: {
    width: '36px',
    height: '36px',
    color: '#06b6d4',
  },
  catLabel: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#18181b',
  },
  cardContainer: {
    background: '#f4f4f5',
    border: '1px solid #e4e4e7',
    borderRadius: '20px',
    padding: '24px',
    marginBottom: '56px',
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
    gap: '20px',
  },
  card: {
    background: '#fff',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid #e4e4e7',
    cursor: 'pointer',
    transition: 'transform 0.3s cubic-bezier(.22,1,.36,1), box-shadow 0.3s ease, border-color 0.3s',
    textDecoration: 'none',
    color: 'inherit',
    display: 'block',
    padding: '20px',
  },
  cardTop: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  cardIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardBadge: {
    display: 'inline-block',
    fontSize: '10px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    padding: '3px 10px',
    borderRadius: '12px',
    background: '#fef3c7',
    color: '#92400e',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#18181b',
    lineHeight: 1.35,
    margin: 0,
    marginBottom: '8px',
  },
  cardDesc: {
    fontSize: '13px',
    color: '#71717a',
    lineHeight: 1.55,
    margin: 0,
    marginBottom: '16px',
  },
  cardLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: '#18181b',
    transition: 'gap 0.2s',
  },
  academyBanner: {
    borderRadius: '28px',
    padding: '48px 40px',
    display: 'flex',
    alignItems: 'center',
    gap: '40px',
    flexWrap: 'wrap',
    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%)',
    border: '1px solid #bae6fd',
    marginBottom: '24px',
  },
  academyText: {
    flex: '1 1 400px',
  },
  academyTitle: {
    fontSize: 'clamp(1.4rem, 3vw, 2rem)',
    fontWeight: 800,
    color: '#0c4a6e',
    lineHeight: 1.15,
    marginBottom: '12px',
  },
  academyDesc: {
    fontSize: '15px',
    color: '#334155',
    lineHeight: 1.6,
    marginBottom: '24px',
  },
  academyBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 28px',
    borderRadius: '14px',
    border: '2px solid #0284c7',
    background: 'transparent',
    color: '#0284c7',
    fontWeight: 700,
    fontSize: '14px',
    letterSpacing: '0.02em',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    textDecoration: 'none',
  },
  academyImage: {
    flex: '0 0 320px',
    maxWidth: '360px',
    borderRadius: '16px',
    objectFit: 'contain',
  },
}

export default function HubPage() {
  useSetNavbarVariant('light')
  const featured = routes.filter(r => r.badge)
  const remaining = routes.filter(r => !r.badge)

  const RouteCard = ({ route, idx, isFeatured }) => {
    const Icon = route.icon

    return (
      <Link
        to={route.path}
        style={isFeatured ? {} : styles.card}
        onMouseEnter={e => {
          if (!isFeatured) {
            e.currentTarget.style.transform = 'translateY(-6px)'
            e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.08)'
            e.currentTarget.style.borderColor = 'rgba(6,182,212,0.3)'
          }
        }}
        onMouseLeave={e => {
          if (!isFeatured) {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
            e.currentTarget.style.borderColor = '#e4e4e7'
          }
        }}
      >
        {isFeatured ? (
          <motion.div
            style={styles.featuredCard('linear-gradient(135deg, #ede9fe 0%, #ddd6fe 40%, #c4b5fd 100%)')}
            initial={{ opacity: 0, x: idx === 0 ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            whileHover={{ y: -6, boxShadow: '0 20px 50px rgba(139,92,246,0.15)' }}
          >
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ ...styles.featuredBadge('rgba(124,58,237,0.15)', '#5b21b6') }}>
                <TrendingUp style={{ width: '12px', height: '12px' }} /> {route.badge}
              </div>
              <div style={{
                width: '44px', height: '44px', borderRadius: '14px',
                background: 'rgba(124,58,237,0.15)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                marginBottom: '16px',
              }}>
                <Icon style={{ width: '22px', height: '22px', color: '#5b21b6' }} />
              </div>
              <p style={{ ...styles.featuredType, color: '#6d28d9' }}>{route.category === 'herramientas' ? 'Panel de Control' : 'Ruta Guiada'}</p>
              <h3 style={{ ...styles.featuredTitle, color: '#3b0764' }}>{route.title}</h3>
              <p style={{ fontSize: '13px', color: '#6d28d9', marginTop: '8px', maxWidth: '300px', lineHeight: 1.5 }}>{route.description}</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.45, delay: idx * 0.06 }}
          >
            <div style={styles.cardTop}>
              <div style={{
                ...styles.cardIcon,
                background: route.palette.bg,
              }}>
                <Icon style={{ width: '20px', height: '20px', color: route.palette.color }} />
              </div>
              {route.badge && <span style={styles.cardBadge}>{route.badge}</span>}
            </div>
            <p style={styles.cardTitle}>{route.title}</p>
            <p style={styles.cardDesc}>{route.description}</p>
            <div style={styles.cardLink}>
              Explorar <ArrowRight style={{ width: '14px', height: '14px' }} />
            </div>
          </motion.div>
        )}
      </Link>
    )
  }

  return (
    <>
      <section style={styles.heroSection}>
        <div style={styles.heroGlow} />
        <div style={styles.heroInner}>
          <motion.div
            style={styles.heroBadge}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Sparkles style={{ width: '14px', height: '14px' }} />
            Qaway Hub
          </motion.div>
          <motion.h1
            style={styles.heroTitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Plataforma modular de <em style={{ color: '#ffd200', fontStyle: 'normal' }}>crecimiento digital</em>
          </motion.h1>
          <motion.p
            style={styles.heroSub}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Herramientas guiadas, rutas progresivas y dashboards para construir, organizar y mejorar tu operacion digital paso a paso.
          </motion.p>
        </div>
      </section>

      <section style={styles.body}>
        <div style={styles.container}>

          <div style={styles.featuredRow}>
            {featured.map((route, idx) => (
              <RouteCard key={route.title} route={route} idx={idx} isFeatured />
            ))}
          </div>

          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Todas las rutas y herramientas</h2>
            <span style={styles.sectionLink}>
              {routes.length} modulos <ArrowRight style={{ width: '14px', height: '14px' }} />
            </span>
          </div>
          <div style={styles.cardContainer}>
            <div style={styles.cardGrid}>
              {remaining.map((route, idx) => (
                <RouteCard key={route.title} route={route} idx={idx} />
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ ...styles.sectionTitle, fontSize: '1.4rem' }}>Areas del Hub</h2>
          </div>
          <div style={styles.catGrid}>
            {categories.map((cat, i) => {
              const Icon = i === 0 ? Route : i === 1 ? Briefcase : Layers
              return (
                <div
                  key={i}
                  style={styles.catCard}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.06)'
                    e.currentTarget.style.borderColor = 'rgba(6,182,212,0.3)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.borderColor = '#e4e4e7'
                  }}
                >
                  <Icon style={styles.catIcon} />
                  <span style={styles.catLabel}>{cat.title}</span>
                  <span style={{ fontSize: '11px', color: '#71717a' }}>{cat.description}</span>
                </div>
              )
            })}
          </div>

          <motion.div
            style={styles.academyBanner}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <div style={styles.academyText}>
              <h2 style={styles.academyTitle}>Domina el Ecosistema Qaway Hub</h2>
              <p style={styles.academyDesc}>
                Aprende a usar cada herramienta, ruta y dashboard con nuestros tutoriales guiados. De basico a avanzado, paso a paso.
              </p>
              <Link to="/academy" style={styles.academyBtn}
                onMouseEnter={e => { e.currentTarget.style.background = '#0284c7'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#0284c7' }}
              >
                Ir a Academy
                <ArrowRight style={{ width: '16px', height: '16px' }} />
              </Link>
            </div>
          </motion.div>

        </div>
      </section>
    </>
  )
}
