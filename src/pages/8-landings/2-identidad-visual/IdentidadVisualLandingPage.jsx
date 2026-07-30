import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { WHATSAPP_LINK, WHATSAPP_PHONE_LINK } from '@/data/navigation';
import { supabase } from '@/config/supabase';
import { 
  Sparkles, 
  ArrowRight, 
  Play, 
  Palette, 
  CheckCircle2,
  Star,
  Send,
  Menu,
  X,
  Type,
  Image,
  Layout,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WA_COURSE_URL = `${WHATSAPP_PHONE_LINK}?text=${encodeURIComponent('Hola Qaway, quiero comenzar el curso de Identidad Visual con IA.')}`;
const goToCart = () => window.open(WA_COURSE_URL, '_blank', 'noopener,noreferrer');

/**
 * LANDING PRODUCTION AGENT
 * Colores actualizados: Purple → Pink (según código proporcionado)
 */

// Navbar
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-100 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-semibold tracking-[-0.055em] text-gray-900 hover:opacity-80 transition-opacity">
          Qaway <span className="text-gray-500">Lab</span>
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#metodo" className="text-gray-600 hover:text-purple-600 transition-colors font-medium">Método</a>
          <a href="#contenido" className="text-gray-600 hover:text-purple-600 transition-colors font-medium">Qué aprenderás</a>
          <a href="#proyectos-estudiantes" className="text-gray-600 hover:text-purple-600 transition-colors font-medium">Resultados</a>
          <a href="#precio" className="text-purple-600 font-bold">Ver precio</a>
        </div>
        
        {/* Mobile Toggle */}
        <button 
          className="md:hidden p-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-4">
          <a href="#metodo" className="block text-gray-600 font-medium">Método</a>
          <a href="#contenido" className="block text-gray-600 font-medium">Qué aprenderás</a>
          <a href="#proyectos-estudiantes" className="block text-gray-600 font-medium">Resultados</a>
          <a href="#precio" className="block text-purple-600 font-bold">Ver precio</a>
        </div>
      )}
    </nav>
  );
};

// Primary Button
const PrimaryButton = ({ children, onClick, className = "" }) => (
  <button 
    onClick={onClick}
    className={`btn-primary ${className}`}
  >
    {children}
  </button>
);

// Hero Section - FONDO: gradient purple-50 → pink-50 → blue-50
const Hero = () => (
  <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5Q0EzQUYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2djRoNHYtNGgtNHptMCA4djRoNHYtNGgtNHptLTggOHY0aDR2LTRoLTR6bTggMHY0aDR2LTRoLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40"></div>

    <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
      {/* Left Content */}
      <div className="space-y-8">
        <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full">
          <Sparkles size={16} />
          <span className="text-sm font-medium">Curso Online con IA</span>
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
          Crea tu <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Identidad Visual</span> con Inteligencia Artificial
        </h1>

        <p className="text-xl text-gray-600 leading-relaxed">
          Aprende a diseñar logos profesionales, paletas de colores perfectas y tu Kit de Marca impactante usando las mejores herramientas de IA y diseño.
        </p>

        <div className="flex flex-wrap gap-4">
          <PrimaryButton onClick={goToCart}>
            Comenzar Ahora
            <ArrowRight size={20} />
          </PrimaryButton>
          <button 
            onClick={() => document.getElementById('contenido')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-secondary"
          >
            Ver Contenido
          </button>
        </div>
      </div>

      {/* Right Visual Mockup */}
      <div className="relative">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform">
              <img src="https://images.unsplash.com/photo-1763705857736-2b4f16a33758?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" alt="Brand identity" className="w-full h-full object-cover" />
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform">
              <img src="https://images.unsplash.com/photo-1633533451997-8b6079082e3d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" alt="Brand mockup" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="space-y-4 pt-8">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform">
              <img src="https://images.unsplash.com/photo-1614036634955-ae5e90f9b9eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" alt="Yellow brand" className="w-full h-full object-cover" />
            </div>
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform">
              <img src="https://images.unsplash.com/photo-1616205255812-c07c8102cc02?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" alt="Stationery" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// Video Section
const VideoSection = () => (
  <section className="max-w-5xl mx-auto px-6 py-12">
    <div className="text-center mb-8">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
        Mira el método en acción
      </h2>
      <p className="text-gray-600">
        Un fragmento de nuestro curso mostrando cómo crear tu marca en minutos
      </p>
    </div>
    <div className="relative rounded-2xl overflow-hidden aspect-video shadow-xl">
      <iframe
        width="100%"
        height="100%"
        src="https://www.youtube-nocookie.com/embed/BMfeM2jmggI?start=26&end=180&rel=0&modestbranding=1&showinfo=0&controls=1"
        title="Curso Identidad Visual"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; webkitallowfullscreen; mozallowfullscreen; allowfullscreen"
      ></iframe>
    </div>
  </section>
);

// Method Section
const methodSteps = [
  {
    step: '01',
    title: 'ADN Visual & Fundamentos',
    description: 'Definimos la base estratégica de tu marca. Aprendes a identificar si necesitas un Logotipo o Imagotipo, y seleccionas una paleta de colores express con psicología del color para generar confianza inmediata en tus clientes.',
    tools: ['Google Fonts', 'Adobe Color'],
    icon: Palette
  },
  {
    step: '02',
    title: 'Generación Estratégica con IA',
    description: 'Construimos tu "Prompt Maestro" uniendo rubro, tipografía, paleta de colores e instrucciones creativas. Usamos motores de Inteligencia Artificial Generativa para generar, refinar y exportar tu logotipo personalizado con fondo transparente.',
    tools: ['IA Generativa'],
    icon: Sparkles
  },
  {
    step: '03',
    title: 'Kit de Marca & Coherencia',
    description: 'Materializamos todo en Canva Pro. Aplicamos tus códigos HEX exactos, configuramos las tres variantes esenciales de tu logo (Color, Transparente y Blanco/Negro) y dejamos listo tu Kit de Marca para crear banners y publicidad en segundos.',
    tools: ['Canva Pro'],
    icon: Layout
  }
];

const MethodSection = () => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  return (
    <section id="metodo" className="py-24 bg-gradient-to-b from-gray-50 via-white to-gray-50 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <span className="text-purple-600 font-bold text-xs uppercase tracking-widest bg-purple-50 px-4 py-2 rounded-full border border-purple-100">
            Metodología del Curso
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mt-4 mb-6 tracking-tight">
            El Método Qaway de 3 Pasos
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Un flujo de trabajo estratégico e integral diseñado para crear una identidad de marca profesional. Haz clic en las tarjetas para ver los detalles de cada paso.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {methodSteps.map((stepItem, index) => {
            const Icon = stepItem.icon;
            const isExpanded = expandedIndex === index;
            return (
              <div
                key={index}
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
                className={`bg-white rounded-3xl p-8 border transition-all duration-300 relative overflow-hidden group flex flex-col justify-between cursor-pointer select-none ${
                  isExpanded
                    ? 'border-purple-300 shadow-xl ring-1 ring-purple-100'
                    : 'border-gray-100 hover:shadow-xl hover:border-purple-200'
                }`}
              >
                {/* Giant visually bleeding number cropped at card edges */}
                <div
                  style={{ fontFamily: '"Oswald", sans-serif' }}
                  className="absolute right-[-10px] top-[-20px] text-[9.5rem] font-black leading-none text-purple-100/15 group-hover:text-purple-200/25 group-hover:scale-105 transition-all duration-500 select-none z-0 pointer-events-none"
                >
                  {stepItem.step}
                </div>
                
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/10">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">
                    {stepItem.title}
                  </h3>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <p className="text-gray-600 leading-relaxed text-sm mt-3 mb-2">
                          {stepItem.description}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="text-xs font-bold text-purple-600 mt-2 mb-6 group-hover:text-purple-700 transition-colors">
                    {isExpanded ? 'Ver menos ↑' : 'Ver detalles ↓'}
                  </div>
                </div>

                <div className="relative z-10 border-t border-gray-100 pt-5 mt-auto">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3">
                    Herramientas Clave
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {stepItem.tools.map((t, idx) => (
                      <span
                        key={idx}
                        className="bg-purple-50 text-purple-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-purple-100/50"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// What You'll Learn - FONDO: gradient purple-50 to pink-50
const learningItems = [
  { icon: '🏗️', title: 'Fundamentos', desc: 'La base estratégica antes de diseñar' },
  { icon: '🎨', title: 'Logo con IA', desc: 'Crea tu logo con Inteligencia Artificial' },
  { icon: '🌈', title: 'Paletas de colores', desc: 'Diseña paletas armoniosas para tu marca' },
  { icon: '✒️', title: 'Tipografías', desc: 'Selecciona las fuentes perfectas para tu marca' },
  { icon: '📦', title: 'Kit de Marca', desc: 'Tu kit completo de marca listo para usar' },
  { icon: '🛠️', title: 'Herramientas', desc: 'Canva, IA, Google Fonts, Photoroom' },
];

const LearningSection = () => (
  <section id="contenido" className="py-16 bg-white">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          Lo que aprenderás
        </h2>
        <p className="text-lg text-gray-600">
          En 6 módulos prácticos
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {learningItems.map((item, index) => (
          <div 
            key={index} 
            className="group bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100 hover:shadow-lg hover:border-purple-200 transition-all cursor-pointer"
          >
            <div className="text-3xl mb-3">{item.icon}</div>
            <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
            <p className="text-sm text-gray-600">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// Portfolio Section
const portfolioItems = [
  { src: '/assets/pages/8-landings/2-identidad-visual/1.webp', alt: 'Proyecto de estudiante 1', type: 'Manual de marca' },
  { src: '/assets/pages/8-landings/2-identidad-visual/2.webp', alt: 'Proyecto de estudiante 2', type: 'Logo' },
  { src: '/assets/pages/8-landings/2-identidad-visual/3.webp', alt: 'Proyecto de estudiante 3', type: 'Tarjetas' },
  { src: '/assets/pages/8-landings/2-identidad-visual/4.webp', alt: 'Proyecto de estudiante 4', type: 'Paleta de colores' },
  { src: '/assets/pages/8-landings/2-identidad-visual/5.webp', alt: 'Proyecto de estudiante 5', type: 'Mockup' },
  { src: '/assets/pages/8-landings/2-identidad-visual/6.webp', alt: 'Proyecto de estudiante 6', type: 'Empaque' },
];

const PortfolioSection = () => (
  <section id="proyectos-estudiantes" className="py-16 bg-white">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          Proyectos de nuestros estudiantes
        </h2>
        <p className="text-lg text-gray-600">
          Así quedan las marcas después del curso
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolioItems.map((item, index) => (
          <div 
            key={index} 
            className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer"
          >
            <img 
              src={item.src} 
              alt={item.alt} 
              className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-4 left-4 right-4">
                <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full">
                  {item.type}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// Testimonials Section - Carrusel
const testimonials = [
  { name: "Ana Torres", text: "En 45 minutos tenía mi logo y mi kit de marca listo. Uso todo en Instagram y mis clientes me preguntan quién lo hizo.", result: "Negocio de coaching", highlight: true },
  { name: "Luis Vega", text: "Lancé mi marca de servicios de limpieza en una tarde. Mi primera impresión ahora es profesional y mis cotizaciones suben.", result: "Negocio de servicios", highlight: false },
  { name: "María González", text: "Pensé que necesitaría un diseñador. Ahora tengo una identidad coherente en WhatsApp Business, redes y tarjetas.", result: "Negocio de belleza", highlight: false },
  { name: "Carlos Ramírez", text: "El curso me cambió la perspectiva. Ahora mis posts tienen un aspecto mucho más profesional y mis seguidores lo notaron.", result: "Influencer", highlight: false },
  { name: "Laura Mendoza", text: "En menos de una hora tenía mi logo, paleta de colores y fuentes. Increíble lo rápido que se aprende.", result: "Freelancer", highlight: false },
];

const Testimonials = () => {
  const [current, setCurrent] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  
  const prev = () => setCurrent((current - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent((current + 1) % testimonials.length);

  return (
    <section id="testimonios" className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Lo que dicen</h2>
          <p className="text-xl text-gray-600">Nuestros estudiantes</p>
        </div>
        
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-3xl p-8 md:p-12 shadow-xl"
            >
              <div className="flex justify-center gap-1 mb-6 text-yellow-400">
                {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}
              </div>
              <p className="text-xl md:text-2xl text-gray-700 text-center mb-8 leading-relaxed">
                "{testimonials[current].text}"
              </p>
              <div className="text-center">
                <p className="font-bold text-gray-900 text-lg">{testimonials[current].name}</p>
                <p className="text-gray-500">{testimonials[current].result}</p>
              </div>
            </motion.div>
          </AnimatePresence>
          
          {/* Navigation */}
          <button 
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            <ChevronLeft size={24} className="text-gray-600" />
          </button>
          <button 
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            <ChevronRight size={24} className="text-gray-600" />
          </button>
          
          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-3 h-3 rounded-full transition-all ${i === current ? 'bg-purple-600 w-8' : 'bg-gray-300'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};



// Pricing Section - FONDO: white
const Pricing = () => (
  <section id="precio" className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
          Inversión accesible
        </h2>
        <p className="text-xl text-gray-600">Tu marca profesional por menos de un café al día</p>
      </div>
      
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-3xl p-10 border-2 border-purple-200 shadow-2xl relative overflow-hidden transform hover:scale-[1.02] transition-transform">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-b-2xl font-bold text-lg">
            🎉 OFERTA ESPECIAL
          </div>
          
          <div className="text-center mt-14 mb-8">
            <div className="flex items-center justify-center gap-4 mb-2">
              <span className="text-2xl text-gray-400 line-through">S/60.00</span>
              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-bold">
                -52% OFF
              </span>
            </div>
            <span className="text-7xl font-black text-gray-900">S/29.00</span>
            <p className="text-gray-500 mt-2 text-lg">Pago único, sin suscripciones</p>
          </div>
          
          <ul className="space-y-5 mb-10">
            {[
              "✅ Tu identidad visual lista para usar HOY",
              "✅ Guía de prompts que funcionan",
              "✅ Resultados que puedes aplicar inmediatamente",
              "✅ Acceso para siempre",
              "✅ Soporte si tienes dudas"
            ].map((item, i) => (
              <li key={i} className="text-lg text-gray-700 font-medium">
                {item}
              </li>
            ))}
          </ul>
          
          <button
            onClick={goToCart}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-6 rounded-2xl font-bold text-xl hover:shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
          >
            Inscribirse Ahora
            <ArrowRight size={24} />
          </button>
          
          <p className="text-center text-gray-400 text-sm mt-4">
            🔒 Pago seguro • 30 días de garantía
          </p>
        </div>
      </div>
    </div>
  </section>
);

// CTA Section - FONDO: gradient purple-600 to pink-600
const CTASection = () => (
  <section className="py-24 bg-gradient-to-r from-purple-600 to-pink-600">
    <div className="max-w-4xl mx-auto px-6 text-center">
      <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
        Transforma tu marca hoy mismo
      </h2>
      <p className="text-xl text-purple-100 mb-10">
        Únete a cientos de estudiantes que ya crearon su identidad visual profesional
      </p>
      <button
        onClick={goToCart}
        className="px-10 py-5 bg-white text-purple-600 rounded-xl font-bold text-lg hover:shadow-2xl transition-all inline-flex items-center gap-3 group"
      >
        Inscríbete al Curso
        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  </section>
);

// Contact Form Section
const ContactForm = () => {
  const [formData, setFormData] = useState({ nombre: '', email: '', mensaje: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const textoMensaje = `Hola Qaway, mi nombre es ${formData.nombre} (${formData.email}). Tengo la siguiente consulta sobre el Curso de Identidad Visual: ${formData.mensaje}`;
    const waUrl = `${WHATSAPP_PHONE_LINK}?text=${encodeURIComponent(textoMensaje)}`;

    try {
      await supabase.from('leads').insert([{
        client_name: formData.nombre,
        contact_info: formData.email,
        source: 'Landing Identidad Visual',
        stage: 'new',
        metadata: { mensaje: formData.mensaje }
      }]);
    } catch (err) {
      console.error('Error al guardar lead:', err);
    }

    window.open(waUrl, '_blank', 'noopener,noreferrer');
    setFormData({ nombre: '', email: '', mensaje: '' });
    setIsSubmitted(true);
  };

  return (
    <section className="max-w-3xl mx-auto px-6 py-20">
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-10 md:p-14 shadow-2xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
            ¿Tienes dudas?
          </h2>
          <p className="text-purple-100 text-lg">
            Te respondemos en menos de 24 horas
          </p>
        </div>
        
        {isSubmitted ? (
          <div className="bg-white/20 backdrop-blur-md text-white p-8 md:p-10 rounded-2xl text-center space-y-4">
            <div className="text-4xl">🎉</div>
            <h3 className="text-2xl font-bold">¡Consulta enviada con éxito!</h3>
            <p className="text-purple-100 text-sm max-w-md mx-auto leading-relaxed">
              Te estamos redirigiendo a WhatsApp y registramos tu consulta en nuestro sistema para responderte de inmediato.
            </p>
            <button 
              onClick={() => setIsSubmitted(false)}
              className="mt-4 inline-block bg-white text-purple-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-purple-50 transition-all shadow-md"
            >
              Enviar otra consulta
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <input 
                type="text" 
                placeholder="Tu nombre completo" 
                required
                className="w-full bg-white/90 backdrop-blur-sm px-6 py-5 rounded-2xl outline-none border-2 border-transparent focus:border-white/50 transition-all text-gray-900 placeholder-gray-500 text-lg"
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              />
              <input 
                type="email" 
                placeholder="Tu email" 
                required
                className="w-full bg-white/90 backdrop-blur-sm px-6 py-5 rounded-2xl outline-none border-2 border-transparent focus:border-white/50 transition-all text-gray-900 placeholder-gray-500 text-lg"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <textarea 
              placeholder="¿Cómo podemos ayudarte? Cuéntanos tu situación..." 
              required
              className="w-full bg-white/90 backdrop-blur-sm px-6 py-5 rounded-2xl outline-none border-2 border-transparent focus:border-white/50 transition-all text-gray-900 placeholder-gray-500 text-lg h-40 resize-none"
              value={formData.mensaje}
              onChange={(e) => setFormData({...formData, mensaje: e.target.value})}
            ></textarea>
            <button 
              type="submit" 
              className="w-full bg-white text-purple-600 py-6 rounded-2xl font-bold text-xl hover:bg-purple-50 transition-all flex items-center justify-center gap-3 shadow-xl"
            >
              Enviar mensaje <Send size={22} />
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

// Footer - FONDO: #111111
const Footer = () => (
  <footer className="border-t border-white/10 bg-[#111111] px-6 py-14 text-white sm:px-10 lg:px-14 lg:py-16">
    <div className="mx-auto max-w-[94rem]">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
        <div className="lg:pr-16">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-semibold tracking-[-0.05em]">
            Qaway <span className="text-[#ff4b0b]">Lab</span>
          </Link>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/56">
            Un ecosistema para construir marca, ordenar operación y activar aprendizaje con IA.
          </p>
        </div>
        <nav className="flex flex-wrap gap-8 text-[15px] font-semibold text-white/80">
          <a href="#metodo" className="hover:text-white transition-colors">Método</a>
          <a href="#contenido" className="hover:text-white transition-colors">Qué aprenderás</a>
          <a href="#proyectos-estudiantes" className="hover:text-white transition-colors">Resultados</a>
          <a href="#precio" className="text-[#ff4b0b] font-bold hover:text-[#df3900] transition-colors">Ver precio</a>
        </nav>
      </div>

      <div className="mt-10 border-t border-white/10 pt-6 text-center">
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/50">&copy; 2026 Qaway Lab</span>
      </div>
    </div>
  </footer>
);

/* ============================================
   APP PRINCIPAL
   ============================================ */

export default function IdentidadVisualLandingPage() {
  return (
    <div className="size-full bg-white">
      <Navbar />
      <Hero />
      <MethodSection />
      <VideoSection />
      <LearningSection />
      <PortfolioSection />
      <Testimonials />
      <Pricing />
      <CTASection />
      <ContactForm />
      <Footer />
      
      {/* Meta Pixel */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '985308637781961');
            fbq('track', 'PageView');
          `
        }}
      />
      <noscript>
        <img height="1" width="1" style={{ display: 'none' }} src="https://www.facebook.com/tr?id=985308637781961&ev=PageView&noscript=1" />
      </noscript>
    </div>
  );
}