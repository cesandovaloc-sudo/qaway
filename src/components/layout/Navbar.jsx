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
    headerScrolled: 'bg-[#f8f7f4]/95 border-[#20201f]/10',
    headerInitial: 'bg-[#f8f9f7] border-transparent',
    link: 'text-[#292927]/80 hover:text-[#292927]',
    linkActive: 'text-[#ff4b0b]',
    logo: 'text-[#20201f]',
    cta: 'bg-[#ff4b0b] text-white shadow-[0_14px_36px_rgba(168,53,8,0.16)] hover:bg-[#df3900]',
    menuBtn: 'text-[#292927]',
    mobileBg: 'bg-[#f8f7f4] border-[#20201f]/10',
    mobileLink: 'text-[#292927]',
  },
  dark: {
    headerScrolled: 'bg-[#111]/95 border-white/10',
    headerInitial: 'bg-[#f8f9f7] border-transparent',
    link: 'text-gray-300 hover:text-white',
    linkActive: 'text-[#ff4b0b]',
    logo: 'text-white',
    cta: 'bg-white text-black shadow-[0_14px_36px_rgba(0,0,0,0.2)] hover:bg-[#ff4b0b] hover:text-white',
    menuBtn: 'text-white',
    mobileBg: 'bg-[#111] border-white/10',
    mobileLink: 'text-white/72',
  },
  transparent: {
    headerScrolled: 'bg-[#111]/95 border-white/10',
    headerInitial: 'bg-transparent border-transparent',
    link: 'text-white/80 hover:text-white',
    linkActive: 'text-white',
    logo: 'text-white',
    cta: 'bg-white text-black shadow-[0_14px_36px_rgba(0,0,0,0.2)] hover:bg-[#ff4b0b] hover:text-white',
    menuBtn: 'text-white',
    mobileBg: 'bg-[#111] border-white/10',
    mobileLink: 'text-white/72',
  },
  brand: {
    headerScrolled: 'bg-[#f8f9f7] border-[#20201f]/10',
    headerInitial: 'bg-[#f8f9f7] border-[#20201f]/10',
    link: 'text-[#292927]/80 hover:text-[#292927]',
    linkActive: 'text-[#ff4b0b]',
    logo: 'text-[#20201f]',
    cta: 'bg-[#ff4b0b] text-white shadow-[0_14px_36px_rgba(168,53,8,0.16)] hover:bg-[#df3900]',
    menuBtn: 'text-[#292927]',
    mobileBg: 'bg-[#f8f9f7] border-[#20201f]/10',
    mobileLink: 'text-[#292927]',
  },
}

export default function Navbar({ variant: explicitVariant }) {
  const contextVariant = useContext(NavbarVariantContext)
  const variant = explicitVariant || contextVariant

  // Visor / reader pages hide the global Navbar for immersive experience
  if (variant === 'hidden') return null

  const styles = variantStyles[variant] || variantStyles.light
  const location = useLocation()
  
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
    const handleScroll = () => {
      const currentY = window.scrollY
      setScrolled(currentY > 20)

      if (currentY > lastScrollY.current && currentY > 50) {
        setHeaderVisible(false) // Ocultar al bajar
      } else {
        setHeaderVisible(true)  // Mostrar al subir
      }

      lastScrollY.current = currentY
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

  return (
    <>
      <header
        ref={menuContainerRef}
        className={`fixed inset-x-0 top-0 z-50 h-20 border-b transition-[transform] duration-300 ${headerVisible ? 'translate-y-0' : '-translate-y-full'
          } ${scrolled ? styles.headerScrolled : styles.headerInitial} ${scrolled ? 'backdrop-blur-md' : 'backdrop-blur-none'
          }`}
      >
        <div className="mx-auto flex h-full max-w-[96rem] items-center justify-between px-6 sm:px-10 lg:px-14">
          <Link to="/" className={`text-xl font-semibold tracking-[-0.055em] ${styles.logo}`}>
            Qaway <span className="text-[#ff4b0b]">Lab</span>
          </Link>

          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 lg:flex xl:gap-10">
            {navLinks.map((link) => (
              <div key={link.key} className="group relative flex h-full items-center">
                <Link
                  to={link.path}
                  className={`relative py-2 text-[10px] font-bold uppercase tracking-widest transition-colors after:absolute after:left-1/2 after:-translate-x-1/2 after:w-[calc(100%-0.5rem)] after:-bottom-[28px] after:h-[1.5px] after:origin-center after:scale-x-0 after:transition-transform after:duration-200 ${isActive(link.path)
                      ? `${styles.linkActive} after:scale-x-100 after:bg-[#ff4b0b]`
                      : `${styles.link} hover:after:scale-x-100 hover:after:bg-[#ff4b0b]`
                    }`}
                >
                  {link.label}
                </Link>
                {link.items && link.items.length > 0 && (
                  <div className="absolute left-1/2 top-[calc(100%+12px)] -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className={`flex flex-col min-w-[200px] rounded-[6px] p-3 shadow-xl ${styles.mobileBg}`}>
                      {link.items.map(subItem => (
                        subItem.external ? (
                          <a
                            key={subItem.label}
                            href={subItem.path}
                            className={`block px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider rounded-[4px] transition-colors ${styles.link}`}
                          >
                            {subItem.label}
                          </a>
                        ) : (
                          <Link
                            key={subItem.label}
                            to={subItem.path}
                            className={`block px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider rounded-[4px] transition-colors ${isActive(subItem.path) ? styles.linkActive : styles.link}`}
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

          <div className="flex items-center gap-4">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className={`hidden min-h-12 rounded-[6px] px-5 py-3 text-[0.84rem] font-semibold transition-colors active:translate-y-px sm:inline-flex ${styles.cta}`}
            >
              Cuentanos tu proyecto
            </a>

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