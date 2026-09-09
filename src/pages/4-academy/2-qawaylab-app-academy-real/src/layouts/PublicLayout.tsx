import { createContext, useContext, useEffect, useRef, useState, Suspense, type Dispatch, type SetStateAction } from 'react'
import { createPortal } from 'react-dom'
import RouteFallback from '@/components/common/RouteFallback'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Logo from '@/components/common/Logo'
import UserMenu from '@/components/common/UserMenu'

const NavbarVariantContext = createContext('light')
const NavbarSetVariantContext = createContext<Dispatch<SetStateAction<string>>>(() => {})

function NavbarProvider({ children }: { children: React.ReactNode }) {
  const [variant, setVariant] = useState('light')
  return (
    <NavbarVariantContext.Provider value={variant}>
      <NavbarSetVariantContext.Provider value={setVariant}>
        {children}
      </NavbarSetVariantContext.Provider>
    </NavbarVariantContext.Provider>
  )
}

// URL base de la web principal — se configura en .env como VITE_MAIN_WEB_URL
const MAIN_WEB_URL = import.meta.env.VITE_MAIN_WEB_URL || 'https://www.qawaylab.com'

// Links del navbar — primero los de la web principal (externos), luego el de Academy (interno)
const mainWebLinks = [
  { key: 'estudio',           label: 'Estudio',           href: `${MAIN_WEB_URL}/estudio` },
  { key: 'sistemasDigitales', label: 'Sistemas digitales', href: `${MAIN_WEB_URL}/sistemas-digitales` },
  { key: 'academy',           label: 'Academy',            href: `${MAIN_WEB_URL}/academy`, isActive: true },
  { key: 'hub',               label: 'Qaway Hub',          href: `${MAIN_WEB_URL}/hub` },
  { key: 'recursos',          label: 'Recursos',           href: `${MAIN_WEB_URL}/recursos` },
  { key: 'blog',              label: 'Blog',               href: `${MAIN_WEB_URL}/blog` },
  { key: 'proyectos',         label: 'Proyectos',          href: `${MAIN_WEB_URL}/proyectos` },
]

// Links internos de Academy — se muestran en el menú móvil como sección adicional
const academyLinks = [
  { key: 'cursos', path: '/cursos', label: 'Cursos' },
]

const WHATSAPP_LINK = 'https://wa.me/message/3WAEIWEXAKA2C1'

const socialLinks = [
  { label: 'TikTok',           url: 'https://www.tiktok.com/@qawaymyc?_t=8nTVeDelatx&_r=1' },
  { label: 'Instagram',        url: 'https://www.instagram.com/qaway.lab/' },
  { label: 'Facebook',         url: 'https://www.facebook.com/profile.php?id=61578412930686' },
  { label: 'YouTube',          url: 'https://youtube.com/@qawaymyc?si=V1E5A54vbxPbDmIF' },
  { label: 'WhatsApp Channel', url: 'https://whatsapp.com/channel/0029VbCT1zMADTODXkhWML39' },
]

const variantStyles = {
  light: {
    headerScrolled: 'bg-[#f8f7f4]/95 border-[#20201f]/10',
    headerInitial:  'bg-transparent border-transparent',
    link:           'text-[#292927]/80 hover:text-[#292927]',
    linkActive:     'text-[#ff4b0b]',
    logo:           'text-[#20201f]',
    cta:            'bg-[#ff4b0b] text-white shadow-[0_14px_36px_rgba(168,53,8,0.16)] hover:bg-[#df3900]',
    menuBtn:        'text-[#292927]',
    mobileBg:       'bg-[#f8f7f4] border-[#20201f]/10',
    mobileLink:     'text-[#292927]',
  },
}

function Navbar() {
  const { user, profile, signOut } = useAuth()
  const contextVariant = useContext(NavbarVariantContext)
  const variant = contextVariant
  const styles = (variantStyles as Record<string, typeof variantStyles.light>)[variant] || variantStyles.light
  const location = useLocation()

  const [menuOpen, setMenuOpen] = useState(false)
  const [headerVisible, setHeaderVisible] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const menuContainerRef = useRef<HTMLElement | null>(null)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      setScrolled(currentY > 20)

      if (currentY > lastScrollY.current && currentY > 50) {
        setHeaderVisible(false)
      } else {
        setHeaderVisible(true)
      }

      lastScrollY.current = currentY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) return

    const handleOutsideClick = (event: PointerEvent) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', handleOutsideClick)
    return () => document.removeEventListener('pointerdown', handleOutsideClick)
  }, [menuOpen])

  const ctaClassName = `hidden min-h-12 rounded-none px-5 py-3 text-[0.84rem] font-semibold transition-colors active:translate-y-px sm:inline-flex ${styles.cta}`

  return (
    <>
      <header
        ref={menuContainerRef}
        className={`fixed inset-x-0 top-0 z-50 h-20 border-b transition-[transform] duration-300 ${headerVisible ? 'translate-y-0' : '-translate-y-full'} ${scrolled ? styles.headerScrolled : styles.headerInitial} ${scrolled ? 'backdrop-blur-md' : 'backdrop-blur-none'}`}
      >
        <div className="mx-auto flex h-full max-w-[96rem] items-center justify-between px-6 sm:px-10 lg:px-14">
          {/* Logo único de la app — apunta a la web principal (pestaña nueva para no salir de la Academy) */}
          <Logo href={MAIN_WEB_URL} target="_blank" rel="noopener noreferrer" className={styles.logo} />

          {/* Menú desktop — links externos a la web principal */}
          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 lg:flex xl:gap-10">
            {mainWebLinks.map((link) => (
              <a
                key={link.key}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`relative py-2 text-[10px] font-bold uppercase tracking-widest transition-colors after:absolute after:left-1/2 after:-bottom-[28px] after:h-[1.5px] after:w-[calc(100%-0.5rem)] after:-translate-x-1/2 after:origin-center after:scale-x-0 after:transition-transform after:duration-200 ${
                  link.isActive
                    ? `${styles.linkActive} after:scale-x-100 after:bg-[#ff4b0b]`
                    : `${styles.link} hover:after:scale-x-100 hover:after:bg-[#ff4b0b]`
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA derecha — Cuéntanos tu proyecto (web principal) + acceso a panel Academy */}
          <div className="flex items-center gap-4">
            {user ? (
              <UserMenu user={user} profile={profile} signOut={signOut} />
            ) : (
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className={ctaClassName}
              >
                Cuéntanos tu proyecto
              </a>
            )}

            <button
              type="button"
              aria-label={menuOpen ? 'Cerrar navegacion' : 'Abrir navegacion'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((current) => !current)}
              className={`lg:hidden ${styles.menuBtn}`}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={`relative z-30 border-b ${styles.mobileBg} px-6 py-5 lg:hidden`}
            >
              <div className="flex flex-col">
                {/* Links de la web principal (pestaña nueva para no salir de la Academy) */}
                {mainWebLinks.map((link) => (
                  <a
                    key={link.key}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMenuOpen(false)}
                    className={`border-b border-[#20201f]/10 py-3 text-xs font-bold uppercase tracking-[0.14em] ${styles.mobileLink} ${link.isActive ? 'text-[#ff4b0b]' : ''}`}
                  >
                    {link.label}
                  </a>
                ))}

                {/* Separador y links internos de Academy */}
                <p className="mt-4 mb-1 text-[9px] font-bold uppercase tracking-[0.22em] text-[#ff4b0b]">
                  Academy
                </p>
                {academyLinks.map((link) => (
                  <Link
                    key={link.key}
                    to={link.path}
                    onClick={() => setMenuOpen(false)}
                    className={`border-b border-[#20201f]/10 py-3 text-xs font-bold uppercase tracking-[0.14em] last:border-b-0 ${styles.mobileLink}`}
                  >
                    {link.label}
                  </Link>
                ))}

                {/* Botón de acceso / panel */}
                <Link
                  to={user ? '/panel' : '/acceder'}
                  onClick={() => setMenuOpen(false)}
                  className="mt-4 inline-flex justify-center rounded-none bg-[#ff4b0b] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white"
                >
                  {user ? 'Mi Panel' : 'Acceder'}
                </Link>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {menuOpen &&
        createPortal(
          <div
            onClick={() => setMenuOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 40,
              width: '100vw',
              height: '100vh',
              backdropFilter: 'blur(5px)',
              WebkitBackdropFilter: 'blur(5px)',
              backgroundColor: 'rgba(0, 0, 0, 0.25)',
            }}
            className="lg:hidden"
          />,
          document.body
        )}
    </>
  )
}

export default function PublicLayout() {
  return (
    <NavbarProvider>
      <div className="flex min-h-screen flex-col bg-white">
        <Navbar />

        <main className="flex-1 pt-20">
          <Suspense fallback={<RouteFallback />}>
            <Outlet />
          </Suspense>
        </main>

        {/* Footer sincronizado con 1-qawaylab-web — fondo oscuro #111111 */}
        <footer className="border-t border-white/10 bg-[#111111] px-6 py-10 text-white sm:px-10 lg:px-14 lg:py-16">
          <div className="mx-auto max-w-[94rem]">
            <div className="grid gap-10 lg:grid-cols-[1.5fr_.9fr_.9fr_.9fr] lg:gap-14">

              {/* Columna: Marca + redes sociales */}
              <div className="lg:pr-16">
                <Logo href={MAIN_WEB_URL} target="_blank" rel="noopener noreferrer" size="lg" variant="dark" />
                <p className="mt-4 max-w-md text-xs leading-relaxed text-white/56 sm:text-sm">
                  Un ecosistema para construir marca, ordenar operación y activar aprendizaje con IA.
                </p>
                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-white/50 transition-colors hover:text-white"
                    >
                      {social.label}
                    </a>
                  ))}
                </div>
              </div>

              {/* Columna: Áreas */}
              <div>
                <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-[#ff4b0b]">Áreas</p>
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/72 lg:grid lg:gap-3 lg:text-sm">
                  <a href={`${MAIN_WEB_URL}/estudio`} target="_blank" rel="noopener noreferrer" className="hover:text-white">Estudio</a>
                  <a href={`${MAIN_WEB_URL}/sistemas-digitales`} target="_blank" rel="noopener noreferrer" className="hover:text-white">Sistemas digitales</a>
                  <a href={`${MAIN_WEB_URL}/academy`} target="_blank" rel="noopener noreferrer" className="hover:text-white">Academy</a>
                  <a href={`${MAIN_WEB_URL}/hub`} target="_blank" rel="noopener noreferrer" className="hover:text-white">Qaway Hub</a>
                  <a href={`${MAIN_WEB_URL}/proyectos`} target="_blank" rel="noopener noreferrer" className="hover:text-white">Proyectos</a>
                </div>
              </div>

              {/* Columna: Plataforma Academy */}
              <div>
                <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-[#ff4b0b]">Academy</p>
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/72 lg:grid lg:gap-3 lg:text-sm">
                  <Link to="/cursos" className="hover:text-white">Catálogo de cursos</Link>
                  <Link to="/acceder" className="hover:text-white">Acceder</Link>
                  <Link to="/registro" className="hover:text-white">Registrarse</Link>
                  <a href={`${MAIN_WEB_URL}/blog`} target="_blank" rel="noopener noreferrer" className="hover:text-white">Blog</a>
                </div>
              </div>

              {/* Columna: Contacto */}
              <div>
                <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-[#ff4b0b]">Contacto</p>
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/72 lg:grid lg:gap-3 lg:text-sm">
                  <a
                    href={WHATSAPP_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white"
                  >
                    Escribir por WhatsApp
                  </a>
                </div>
              </div>

            </div>

            <div className="mt-10 border-t border-white/10 pt-6 text-center">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/50">
                &copy; {new Date().getFullYear()} Qaway Lab
              </span>
            </div>
          </div>
        </footer>
      </div>
    </NavbarProvider>
  )
}