import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu } from 'lucide-react'
import { WHATSAPP_LINK, navItems } from '@/data/navigation'
import { getNavbarLinks } from '@/config/siteVisibility'

const NavbarVariantContext = createContext('light')
const NavbarSetVariantContext = createContext(() => { })

export function NavbarProvider({ children }) {
  const [variant, setVariant] = useState('light')
  return (
    <NavbarVariantContext.Provider value={variant}>
      <NavbarSetVariantContext.Provider value={setVariant}>
        {children}
      </NavbarSetVariantContext.Provider>
    </NavbarVariantContext.Provider>
  )
}

export function useSetNavbarVariant(variant) {
  const setVariant = useContext(NavbarSetVariantContext)
  useEffect(() => {
    setVariant(variant)
    return () => setVariant('light')
  }, [variant, setVariant])
}

const variantStyles = {
  light: {
    headerScrolled: 'bg-white/95 border-[#20201f]/10 backdrop-blur-md',
    headerInitial: 'bg-white border-transparent',
    link: 'text-[#292927]/80 hover:text-[#292927]',
    linkActive: 'text-[#fe6612]',
    logo: 'text-[#20201f]',
    cta: 'bg-[#fe6612] text-white shadow-[0_14px_36px_rgba(254,102,18,0.22)] hover:bg-[#e05508] rounded-[10px]',
    menuBtn: 'text-[#292927]',
    mobileBg: 'bg-white border-[#20201f]/10',
    mobileLink: 'text-[#292927]',
  },
  dark: {
    headerScrolled: 'bg-[#111]/95 border-white/10 backdrop-blur-md',
    headerInitial: 'bg-[#111] border-transparent',
    link: 'text-gray-300 hover:text-white',
    linkActive: 'text-[#fe6612]',
    logo: 'text-white',
    cta: 'bg-white text-black shadow-[0_14px_36px_rgba(0,0,0,0.2)] hover:bg-[#fe6612] hover:text-white rounded-[10px]',
    menuBtn: 'text-white',
    mobileBg: 'bg-[#111] border-white/10',
    mobileLink: 'text-white/72',
  },
  transparent: {
    headerScrolled: 'bg-white/95 border-[#20201f]/10 backdrop-blur-md',
    headerInitial: 'bg-transparent border-transparent',
    link: 'text-[#292927]/80 hover:text-[#292927]',
    linkActive: 'text-[#fe6612]',
    logo: 'text-[#20201f]',
    cta: 'bg-[#fe6612] text-white shadow-[0_14px_36px_rgba(254,102,18,0.22)] hover:bg-[#e05508] rounded-[10px]',
    menuBtn: 'text-[#292927]',
    mobileBg: 'bg-white border-[#20201f]/10',
    mobileLink: 'text-[#292927]',
  },
  brand: {
    headerScrolled: 'bg-white/95 border-[#20201f]/10 backdrop-blur-md',
    headerInitial: 'bg-white border-[#20201f]/10',
    link: 'text-[#292927]/80 hover:text-[#292927]',
    linkActive: 'text-[#fe6612]',
    logo: 'text-[#20201f]',
    cta: 'bg-[#fe6612] text-white shadow-[0_14px_36px_rgba(254,102,18,0.22)] hover:bg-[#e05508] rounded-[10px]',
    menuBtn: 'text-[#292927]',
    mobileBg: 'bg-white border-[#20201f]/10',
    mobileLink: 'text-[#292927]',
  },
}

export default function Navbar({ variant: explicitVariant }) {
  const contextVariant = useContext(NavbarVariantContext)
  const location = useLocation()
  
  // Resolución síncrona inmediata en el primer render frame (evita destello blanco en /proyectos)
  const isProyectos = location.pathname === '/proyectos' || location.pathname === '/proyectos/'
  const variant = explicitVariant || (isProyectos ? 'transparent' : contextVariant)
  const isMarketingHub = location.pathname.startsWith('/hub/marketing')
  const isLogoOnly = variant === 'logo-only' || isMarketingHub

  // Visor / reader pages hide the global Navbar for immersive experience
  if (variant === 'hidden') return null

  const styles = variantStyles[variant] || variantStyles.light
  
  const visibleLinks = getNavbarLinks()
  const navLinks = visibleLinks.map(vLink => {
    const isAcademy = vLink.key === 'academy' || vLink.label === 'Academy'
    const sourceItem = isAcademy ? navItems.find(item => item.label === vLink.label || item.path === vLink.path) : null
    return {
      ...vLink,
      items: sourceItem?.items || []
    }
  })

  const [menuOpen, setMenuOpen] = useState(false)
  const [headerVisible, setHeaderVisible] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const menuContainerRef = useRef(null)
  const lastScrollY = useRef(0)

  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY
          setScrolled(currentY > 20)

          if (currentY > lastScrollY.current && currentY > 50) {
            setHeaderVisible(false) // Ocultar al bajar
          } else {
            setHeaderVisible(true)  // Mostrar al subir
          }

          lastScrollY.current = currentY
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  // Cerrar menú al hacer clic o toque en cualquier parte fuera del menú
  useEffect(() => {
    if (!menuOpen) return
    const handleOutsideClick = (event) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('pointerdown', handleOutsideClick)
    return () => document.removeEventListener('pointerdown', handleOutsideClick)
  }, [menuOpen])

  const isActive = (path) => {
    if (path === '/blog') return location.pathname.startsWith('/blog')
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const isTransparentInitial = variant === 'transparent' && !scrolled

  const logoClass = isTransparentInitial ? 'text-white' : styles.logo
  const logoAccentClass = isTransparentInitial ? 'text-white' : 'text-[#fe6612]'
  const linkClass = isTransparentInitial ? 'text-white/85 hover:text-white' : styles.link
  const linkActiveClass = isTransparentInitial ? 'text-white font-bold' : styles.linkActive
  const activeLineBg = isTransparentInitial ? 'after:bg-white' : 'after:bg-[#fe6612]'
  const ctaClass = isTransparentInitial ? 'bg-white text-[#fe6612] shadow-[0_12px_28px_rgba(0,0,0,0.14)] hover:bg-zinc-100' : styles.cta
  const menuBtnClass = isTransparentInitial ? 'text-white' : styles.menuBtn

  return (
    <>
      <header
        ref={menuContainerRef}
        className={`fixed inset-x-0 top-0 z-50 h-20 border-b transition-[transform,background-color,border-color] duration-300 ${headerVisible ? 'translate-y-0' : '-translate-y-full'
          } ${scrolled ? styles.headerScrolled : styles.headerInitial} ${scrolled ? 'backdrop-blur-md' : 'backdrop-blur-none'
          }`}
      >
        <div className="mx-auto flex h-full max-w-[96rem] items-center justify-between px-6 sm:px-10 lg:px-14">
          <Link to="/" className={`text-xl font-semibold tracking-[-0.055em] transition-colors duration-200 ${logoClass}`}>
            Qaway <span className={`transition-colors duration-200 ${logoAccentClass}`}>Lab</span>
          </Link>

          {!isLogoOnly && (
            <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 lg:flex xl:gap-10">
              {navLinks.map((link) => (
                <div key={link.key} className="group relative flex h-full items-center">
                  <Link
                    to={link.path}
                    className={`relative py-2 text-[10px] font-bold uppercase tracking-widest transition-colors duration-200 after:absolute after:left-1/2 after:-translate-x-1/2 after:w-[calc(100%-0.5rem)] after:-bottom-[28px] after:h-[1.5px] after:origin-center after:scale-x-0 after:transition-transform after:duration-200 ${isActive(link.path)
                        ? `${linkActiveClass} after:scale-x-100 ${activeLineBg}`
                        : `${linkClass} hover:after:scale-x-100 ${activeLineBg}`
                      }`}
                  >
                    {link.label}
                  </Link>
                  {link.items && link.items.length > 0 && (
                    <div className="absolute left-1/2 top-[calc(100%+12px)] -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className={`flex flex-col min-w-[200px] rounded-[10px] p-3 shadow-xl ${styles.mobileBg}`}>
                        {link.items.map(subItem => (
                          subItem.external ? (
                            <a
                              key={subItem.label}
                              href={subItem.path}
                              className={`block px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider rounded-[6px] transition-colors ${styles.link}`}
                            >
                              {subItem.label}
                            </a>
                          ) : (
                            <Link
                              key={subItem.label}
                              to={subItem.path}
                              className={`block px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider rounded-[6px] transition-colors ${isActive(subItem.path) ? styles.linkActive : styles.link}`}
                            >
                              {subItem.label}
                            </Link>
                          )
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>
          )}

          {!isLogoOnly && (
            <div className="flex items-center gap-4">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className={`hidden min-h-12 rounded-[10px] px-5 py-3 text-[0.84rem] font-semibold transition-all duration-200 active:translate-y-px sm:inline-flex ${ctaClass}`}
              >
                Cuéntanos tu proyecto
              </a>

              <button
                type="button"
                aria-label={menuOpen ? 'Cerrar navegacion' : 'Abrir navegacion'}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((current) => !current)}
                className={`lg:hidden transition-colors duration-200 ${menuBtnClass}`}
              >
                <Menu size={22} />
              </button>
            </div>
          )}
        </div>

        {!isLogoOnly && (
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
                  {navLinks.map((link) => (
                    <div key={link.key} className="border-b border-[#20201f]/10 last:border-b-0">
                      <Link
                        to={link.path}
                        onClick={() => {
                          if (!link.items || link.items.length === 0) setMenuOpen(false)
                        }}
                        className={`block py-3 text-xs font-bold uppercase tracking-[0.14em] ${styles.mobileLink}`}
                      >
                        {link.label}
                      </Link>
                      {link.items && link.items.length > 0 && (
                        <div className="flex flex-col pl-4 pb-2">
                          {link.items.map(subItem => (
                            subItem.external ? (
                              <a
                                key={subItem.label}
                                href={subItem.path}
                                onClick={() => setMenuOpen(false)}
                                className={`block py-2 text-[10px] font-bold uppercase tracking-wider opacity-60 hover:opacity-100 ${styles.mobileLink}`}
                              >
                                {subItem.label}
                              </a>
                            ) : (
                              <Link
                                key={subItem.label}
                                to={subItem.path}
                                onClick={() => setMenuOpen(false)}
                                className={`block py-2 text-[10px] font-bold uppercase tracking-wider ${isActive(subItem.path) ? styles.linkActive : `opacity-60 hover:opacity-100 ${styles.mobileLink}`}`}
                              >
                                {subItem.label}
                              </Link>
                            )
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  <a
                    href={WHATSAPP_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex justify-center rounded-[6px] bg-[#ff4b0b] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white"
                  >
                    Cuentanos tu proyecto
                  </a>
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        )}
      </header>

      {/* Backdrop blur independiente de pantalla completa vía Portal */}
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