export const navItems = [
  {
    label: 'Inicio',
    path: '/',
  },
  {
    label: 'Estudio',
    items: [
    ],
  },
  {
    label: 'Sistemas Digitales',
    items: [
      { label: 'Automatizaciones', path: '/sistemas-digitales/automatizacion' },
    ],
  },
  {
    label: 'Academy',
    items: [
      { label: 'Acceder', path: `${import.meta.env.VITE_ACADEMY_URL || 'http://localhost:7000'}/acceder`, external: true },
      { label: 'Registrarse', path: `${import.meta.env.VITE_ACADEMY_URL || 'http://localhost:7000'}/registro`, external: true },
      { label: 'Cursos', path: `${import.meta.env.VITE_ACADEMY_URL || 'http://localhost:7000'}/cursos`, external: true },
    ],
  },
  {
    label: 'Qaway Hub',
    path: '/hub',
    items: [
      { label: 'Ruta Marca', path: '/hub/ruta-marca' },
      { label: 'Ruta Profesional', path: '/hub/ruta-profesional' },
      { label: 'Ruta Incubadora', path: '/hub/ruta-incubadora' },
      { label: 'Herramientas', path: '/hub/herramientas' },
      { label: 'Dashboards', path: '/hub/dashboards' },
    ],
  },
  {
    label: 'Recursos',
    path: '/recursos',
  },
  {
    label: 'Blog',
    path: '/blog',
    items: [
      { label: 'Artificial', path: '/blog/artificial' },
      { label: 'Productividad', path: '/blog/productividad' },
      { label: 'Marketing', path: '/blog/marketing' },
      { label: 'Diseño', path: '/blog/diseno' },
      { label: 'Automatización', path: '/blog/automatizacion' },
    ],
  },
  {
    label: 'Landings',
    path: '/landings',
    isHidden: true,
    items: [
      { label: 'Landing de Servicio', path: '/landings/servicio' },
      { label: 'Landing de Campaña', path: '/landings/campana' },
      { label: 'Landing de Curso', path: '/landings/curso' },
      { label: 'Landing de Incubadora', path: '/landings/incubadora' },
      { label: 'Landing de Captación', path: '/landings/captacion' },
    ],
  },
]

export const socialLinks = [
  { label: 'TikTok', url: 'https://www.tiktok.com/@qawaymyc?_t=8nTVeDelatx&_r=1' },
  { label: 'Instagram', url: 'https://www.instagram.com/qaway.lab/' },
  { label: 'Facebook', url: 'https://www.facebook.com/profile.php?id=61578412930686' },
  { label: 'YouTube', url: 'https://youtube.com/@qawaymyc?si=V1E5A54vbxPbDmIF' },
  { label: 'WhatsApp Channel', url: 'https://whatsapp.com/channel/0029VbCT1zMADTODXkhWML39' },
]

export const WHATSAPP_LINK = 'https://wa.me/message/3WAEIWEXAKA2C1'
export const WHATSAPP_PHONE_LINK = 'https://wa.me/51930756781'
