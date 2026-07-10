import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Play,
  ArrowRight,
  Globe,
  Database,
  Camera,
  Film,
  Sparkles
} from 'lucide-react'

import { useState } from 'react'
import { WHATSAPP_LINK } from '../../data/navigation'

const Hero = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
  }

  return (
    <section 
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-black px-8 pt-32 pb-20"
    >
      {/* Base Layer: Anti-scroll (bg-fixed), Grayscale and Dimmed */}
      <div 
        className="absolute inset-0 w-full h-full bg-fixed bg-cover bg-center bg-no-repeat grayscale opacity-25 brightness-[60%] pointer-events-none"
        style={{ backgroundImage: "url('/assets/pages/2-estudio/estudio_portada_identidad_ejecutiva.webp')" }}
      />
      
      {/* Interactive Spotlight Layer: Reveals full color and brightness dynamically */}
      <div 
        className="absolute inset-0 w-full h-full bg-fixed bg-cover bg-center bg-no-repeat brightness-[60%] pointer-events-none transition-opacity duration-500"
        style={{ 
          backgroundImage: "url('/assets/pages/2-estudio/estudio_portada_identidad_ejecutiva.webp')",
          opacity: isHovered ? 0.75 : 0,
          maskImage: `radial-gradient(circle 220px at ${mousePos.x}px ${mousePos.y}px, black 30%, transparent 100%)`,
          WebkitMaskImage: `radial-gradient(circle 220px at ${mousePos.x}px ${mousePos.y}px, black 30%, transparent 100%)`
        }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/40 to-black pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 text-center max-w-5xl flex flex-col items-center"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-12 backdrop-blur-md">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#FFD200]">ESTUDIO / LABORATORIO HÍBRIDO</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: 'easeOut' }}
        >
          <h1 className="text-5xl md:text-8xl font-bold text-white tracking-tighter leading-[0.9] mb-12 text-balance">
            Sistemas Visuales <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-300 via-white to-zinc-500 font-light">
              impulsados
            </span>
            <span className="text-[#FFD200] font-medium"> por IA</span>
          </h1>

          <div className="h-px w-24 bg-[#FFD200] mx-auto mb-10" />

          <p className="text-zinc-400 text-sm sm:text-base md:text-xl font-normal max-w-3xl mx-auto leading-relaxed text-balance mb-12">
            Fusionamos la Estética de Impacto con IA Aplicada para Optimizar Contenido Visual y crear Identidades Modernas para Proyectos, Marcas y Profesionales
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
          className="flex flex-wrap justify-center gap-6"
        >
          <Link to="/estudio/visual-lab" className="group flex items-center gap-4 bg-[#FFD200] text-black px-10 py-5 rounded-[6px] text-[11px] font-black uppercase tracking-[0.25em] hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(255,210,0,0.5)] transition-all duration-300">
            Explorar el lab <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
          </Link>

          <button className="px-10 py-5 rounded-[6px] font-black text-white border border-white/20 hover:bg-white/10 transition-all text-[11px] tracking-[0.25em] uppercase backdrop-blur-sm hover:-translate-y-1 duration-300">
            Ver portafolio
          </button>
        </motion.div>
      </motion.div>
    </section>
  )
}

const VisualSectors = () => (
  <section className="py-40 px-8 bg-white text-black overflow-hidden">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 gap-10">
        <div className="max-w-2xl">
          <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-6 block">Pilares Estratégicos / 01</span>
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight leading-none mb-8">Producción Visual <br /> de Alto Impacto.</h2>
          <p className="text-zinc-500 text-lg font-light leading-relaxed text-balance">
            Construimos ecosistemas visuales impulsados por Inteligencia Artificial. Somos tu laboratorio de diseño: aplicamos tecnología de vanguardia para escalar, optimizar y elevar el nivel visual de tu proyecto.
          </p>
        </div>
        <div className="h-px flex-1 bg-zinc-100 mx-10 hidden lg:block" />
        <div className="shrink-0">
          <Sparkles className="text-[#FFD200] mb-4" size={32} />
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-300">Dirección de Arte</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Editorial Block: Portraits */}
        <motion.a 
          href="#contacto"
          whileHover={{ y: -10 }}
          className="md:col-span-8 group border border-zinc-100 overflow-hidden relative h-[600px] rounded-[10px] block cursor-pointer"
        >
          <img 
            src="/assets/pages/2-estudio/estudio_portada_identidad_ejecutiva.webp" 
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100" 
            alt="Editorial Portrait"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
          <div className="absolute bottom-0 left-0 p-12 text-white">
            <span className="inline-block bg-[#FFD200] text-black text-[9px] font-black px-3 py-1 mb-6 rounded-sm uppercase tracking-widest">Nuevo Estándar</span>
            <h3 className="text-4xl font-bold mb-4 tracking-tighter">Identidad Ejecutiva</h3>
            <p className="text-zinc-300 text-sm max-w-sm font-light leading-relaxed">
              Construcción de imagen profesional. Generamos retratos corporativos y avatares fotorealistas de alta gama mediante IA, diseñados para proyectar absoluta autoridad en cualquier entorno digital.
            </p>
          </div>
          <div className="absolute bottom-12 right-12 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center gap-2 text-[#FFD200] text-[10px] font-black uppercase tracking-widest">
            Ver Detalles <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
          </div>
        </motion.a>

        {/* Studio Block: Product */}
        <motion.a 
          href="#contacto"
          whileHover={{ y: -10 }}
          className="md:col-span-4 bg-zinc-950 text-white overflow-hidden relative p-12 flex flex-col justify-between rounded-[10px] group cursor-pointer block"
        >
          <div className="relative z-10">
            <div className="w-12 h-12 border border-white/10 flex items-center justify-center mb-10 group-hover:border-[#FFD200] group-hover:text-[#FFD200] transition-colors">
              <Camera size={20} />
            </div>
            <h3 className="text-3xl font-bold tracking-tight mb-4 leading-none">Productos y <br /> Entornos Digitales.</h3>
            <p className="text-zinc-500 text-sm font-light leading-relaxed">Escenografías para e-commerce, publicidad y espacios comerciales. Creamos y optimizamos fotografías de tus productos o instalaciones con IA, logrando acabados de estudio internacional en tiempos récord.</p>
          </div>
          <div className="relative mt-12 -mx-6 overflow-hidden rounded-lg border border-white/5">
            <img 
              src="/assets/pages/2-estudio/estudio_portada_producto_digital.webp" 
              className="w-full h-52 object-cover opacity-60 group-hover:opacity-100 transition-opacity" 
              alt="Entornos y Producto Digital"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-[2px]">
              <div className="flex items-center gap-2 text-[#FFD200] text-[10px] font-black uppercase tracking-widest">
                Ver Detalles <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </div>
        </motion.a>

        {/* Video: Motion */}
        <motion.a 
          href="#contacto"
          whileHover={{ y: -10 }}
          className="md:col-span-5 bg-zinc-100 p-12 h-[520px] flex flex-col justify-between group rounded-[10px] cursor-pointer block"
        >
          <div>
            <span className="text-[10px] font-black uppercase text-zinc-400 mb-8 block tracking-[0.2em]">Motion Lab</span>
            <h3 className="text-3xl font-bold mb-6 tracking-tighter">Ecosistemas Sociales</h3>
            <p className="text-zinc-500 text-base font-light leading-relaxed">Producción escalable para plataformas digitales. Diseñamos el contenido visual diario de tu proyecto (imágenes, posts y formatos dinámicos) fusionando criterio estético y generación con IA.</p>
          </div>
          <div className="bg-black h-56 -mx-6 flex items-center justify-center relative overflow-hidden rounded-[6px]">
             <video 
               src="/assets/pages/2-estudio/estudio_portada_social_media.mp4"
               autoPlay
               loop
               muted
               playsInline
               className="absolute inset-0 w-full h-full object-cover group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" style={{ opacity: 0.45, filter: "grayscale(90%)" }}
             />
             <div className="relative z-10 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:bg-[#FFD200] group-hover:border-transparent">
                  <Play size={20} fill="white" className="text-white ml-1 group-hover:fill-black group-hover:text-black transition-colors" />
                </div>
                <span className="text-[#FFD200] text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-2 group-hover:translate-y-0">Ver Detalles</span>
             </div>
          </div>
        </motion.a>

        {/* Modern Depth: Enhancement */}
        <motion.a 
          href="#contacto"
          whileHover={{ y: -10 }}
          className="md:col-span-7 bg-white border border-zinc-100 p-12 flex flex-col md:flex-row gap-12 items-center relative overflow-hidden rounded-[10px] group cursor-pointer block"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD200]/5 blur-3xl" />
          <div className="md:w-1/2 relative w-full overflow-hidden rounded-[10px]">
            <img 
              src="/assets/pages/2-estudio/estudio_portada_arquitectura_marca.webp" 
              className="w-full h-96 object-cover rounded-[10px] shadow-2xl transition-all duration-700 scale-100 group-hover:scale-[1.03] saturate-[0.8] group-hover:saturate-100 brightness-80 group-hover:brightness-100" 
              alt="Arquitectura de Marca" 
            />
          </div>
          <div className="md:w-1/2 relative z-10">
            <div className="flex gap-2 mb-6">
               <span className="w-2 h-2 bg-[#FFD200] rounded-full animate-pulse" />
               <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest group-hover:text-black transition-colors">Sistemas de Diseño</span>
            </div>
            <h3 className="text-3xl font-bold mb-6 tracking-tight leading-none">Arquitectura de Marca.</h3>
            <p className="text-zinc-500 text-sm font-light leading-relaxed mb-10">
              Construcción y posicionamiento visual. Desarrollamos sistemas de diseño modernos, coherentes y memorables para negocios, alineando la estética con tus objetivos comerciales.
            </p>
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[#FFD200] group-hover:gap-5 transition-all">
              Ver Detalles <ArrowRight size={14} />
            </div>
          </div>
        </motion.a>

      </div>
    </div>
  </section>
)

const CinematicStatement = () => (
  <section className="py-12 px-8 bg-zinc-950 flex items-center justify-center relative overflow-hidden border-y border-white/5">
    <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black pointer-events-none" />
    <div className="max-w-4xl mx-auto text-center relative mt-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <span className="text-8xl text-zinc-800 absolute -top-10 left-1/2 -translate-x-1/2 font-serif opacity-30 select-none">"</span>
        <h2 className="text-3xl md:text-5xl font-light text-zinc-300 leading-tight relative z-10 text-balance">
          La Inteligencia artificial <span className="text-[#FFD200] font-medium">Crea</span>,<br />
          con Estrategia la <span className="text-[#FFD200] font-medium">Diriges</span>
        </h2>
        <div className="flex justify-center gap-4 mt-10">
          <div className="h-px w-16 bg-[#FFD200] rounded-full" />
          <div className="h-px w-16 bg-[#FFD200] rounded-full" />
        </div>
      </motion.div>
    </div>
  </section>
)

const StrategySection = () => (
  <section className="py-40 px-8 bg-black text-white">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-12 gap-16">
        <div className="col-span-12 lg:col-span-5">
          <div className="sticky top-40">
            <h2 className="text-5xl font-bold tracking-tight mb-10 leading-none">Metodología <br /> <span className="text-[#FFD200]">Validada.</span></h2>
            <p className="text-zinc-300 font-normal text-lg leading-relaxed mb-16 max-w-md">
              Nuestro flujo de trabajo combina la dirección de arte humana con la eficiencia exponencial de la inteligencia artificial.
            </p>
            <div className="flex flex-col gap-8">
              {[
                { icon: <Sparkles size={18} />, title: "Dirección de Arte", desc: "Cada píxel es supervisado estéticamente." },
                { icon: <Film size={18} />, title: "Coherencia de Marca", desc: "Modelos entrenados con tu ADN visual único." }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-6 items-start">
                  <div className="w-12 h-12 bg-zinc-900 border border-white/5 flex items-center justify-center text-[#FFD200] rounded-sm">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-widest mb-1">{item.title}</h4>
                    <p className="text-zinc-400 text-xs font-normal">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="col-span-12 lg:col-span-7 grid grid-cols-1 gap-12">
          {[
            { id: '01', title: 'Inmersión Visual', desc: 'Sumergimos nuestro sistema en el ADN de tu proyecto: colores, texturas y valores corporativos.' },
            { id: '02', title: 'Generación Asistida', desc: 'Desplegamos iteraciones de diseño en entornos controlados para hallar la estética ideal.' },
            { id: '03', title: 'Post-Producción', desc: 'Intervención técnica manual y retoque de alta gama para asegurar un acabado de lujo.' },
            { id: '04', title: 'Entrega Multiplataforma', desc: 'Provisión de activos visuales optimizados para todos tus canales y formatos digitales.' },
          ].map((step, idx) => (
            <motion.div 
              key={step.id} 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group border-b border-zinc-900 pb-12 flex justify-between items-center"
            >
              <div className="max-w-xl">
                <span className="text-[#FFD200] text-[10px] font-black mb-4 block tracking-[0.2em]">FASE_{step.id}</span>
                <h4 className="text-2xl font-bold mb-4 tracking-tight group-hover:translate-x-2 transition-transform duration-500">{step.title}</h4>
                <p className="text-zinc-500 text-sm font-light leading-relaxed">{step.desc}</p>
              </div>
              <div className="text-zinc-800 font-black text-6xl group-hover:text-zinc-700 transition-colors">
                {step.id}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
)

const DiagnosticForm = () => {
  const [formData, setFormData] = useState({
    project: '',
    area: 'Visual Lab con IA',
    solution: '',
    objective: '',
    email: '',
    message: ''
  });

  const solutionMap = {
    'Visual Lab con IA': [
      'Identidad ejecutiva con IA',
      'Retratos profesionales generados con IA',
      'Producción visual para productos',
      'Arquitectura visual de marca',
      'No estoy seguro, quiero un diagnóstico',
    ],
    'Identidad y Marca': [
      'Identidad visual',
      'Sistema de marca',
      'Logo y dirección gráfica',
      'Narrativa de marca',
      'No estoy seguro, quiero un diagnóstico',
    ],
    'Contenido y Redes': [
      'Piezas para redes sociales',
      'Reels y Shorts',
      'Carruseles estratégicos',
      'Contenido para captación',
      'No estoy seguro, quiero un diagnóstico',
    ],
    'Presencia Profesional': [
      'Imagen para LinkedIn',
      'Perfil profesional visual',
      'Fotos ejecutivas con IA',
      'Marca personal',
      'No estoy seguro, quiero un diagnóstico',
    ],
    'Dirección Creativa': [
      'Concepto visual de campaña',
      'Línea estética de marca',
      'Moodboard estratégico',
      'Dirección de arte con IA',
      'No estoy seguro, quiero un diagnóstico',
    ],
    'Estrategia Digital': [
      'Planificación de contenido',
      'Sistemas de contenido',
      'Funnels y rutas de captación',
      'Landing pages',
      'No estoy seguro, quiero un diagnóstico',
    ],
    'Consultoría Estratégica': [
      'Diagnóstico de marca',
      'Estrategia visual',
      'Plan de contenido',
      'Optimización de canales',
      'No estoy seguro, quiero un diagnóstico',
    ],
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      if (field === 'area') {
        newData.solution = ''; // Reset solution when area changes
      }
      return newData;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const message = `Hola Qaway! 👋%0A%0A*Nueva Solicitud de Análisis*%0A%0A*Proyecto:* ${formData.project}%0A*Área de apoyo:* ${formData.area}%0A*Servicio:* ${formData.solution}%0A*Resultado buscado:* ${formData.objective}%0A*Correo:* ${formData.email}%0A*Mensaje adicional:* ${formData.message}`;
    window.open(`${WHATSAPP_LINK.split('?text=')[0]}?text=${message}`, '_blank');
  };

  return (
  <section className="py-24 px-6 md:px-8 bg-zinc-50 border-t border-zinc-200 relative overflow-hidden">
    <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-[#FFD200]/5 blur-[120px] rounded-full pointer-events-none" />
    <div className="absolute top-0 left-0 w-1/4 h-1/3 bg-[#FFD200]/3 blur-[100px] rounded-full pointer-events-none" />
    
    <div className="max-w-6xl mx-auto grid grid-cols-12 gap-10 lg:gap-14 items-start">
      <motion.div 
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        viewport={{ once: true }}
        className="col-span-12 lg:col-span-4"
      >
        <div className="sticky top-28">
          <span className="text-[#8f7600] text-[10px] font-bold uppercase tracking-widest mb-4 block">Contáctanos</span>
           <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-[1.05] text-black">Hablemos de <br /> tu proyecto.</h2>
           <p className="text-zinc-600 text-base font-normal leading-relaxed mb-8">
             Cuéntanos qué necesita tu marca, negocio o proyecto personal. Nuestro equipo analizará tu proyecto y te propondrá una solución visual a medida.
           </p>
           
           <div className="space-y-4">
             <motion.div 
               initial={{ opacity: 0, y: 15 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3 }}
               viewport={{ once: true }}
               className="flex items-center gap-4 group cursor-default rounded-[8px] border border-zinc-200 bg-zinc-100/80 p-4"
             >
               <div className="w-11 h-11 bg-white border border-zinc-200 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:border-[#FFD200]/70 group-hover:scale-105">
                 <Globe size={20} className="text-[#8f7600] transition-colors duration-300 group-hover:text-[#FFD200]" />
               </div>
               <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-zinc-700">Alcance Internacional</p>
                 <p className="text-zinc-500 text-xs">Capacidad de producción 24/7 global.</p>
               </div>
             </motion.div>
             <motion.div 
               initial={{ opacity: 0, y: 15 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.45 }}
               viewport={{ once: true }}
               className="flex items-center gap-4 group cursor-default rounded-[8px] border border-zinc-200 bg-zinc-100/80 p-4"
             >
               <div className="w-11 h-11 bg-white border border-zinc-200 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:border-[#FFD200]/70 group-hover:scale-105">
                 <Database size={20} className="text-[#8f7600] transition-colors duration-300 group-hover:text-[#FFD200]" />
               </div>
               <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-zinc-700">Privacidad Total</p>
                 <p className="text-zinc-500 text-xs">Tus archivos e imágenes siempre protegidos.</p>
               </div>
             </motion.div>
           </div>
         </div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
        viewport={{ once: true }}
        className="col-span-12 lg:col-span-8"
      >
        <motion.div 
          whileHover={{ y: -2, boxShadow: '0 24px 60px -34px rgba(24,24,27,0.28)' }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="bg-white border border-zinc-200 p-7 md:p-10 shadow-[0_24px_80px_-44px_rgba(24,24,27,0.45)] rounded-[10px] relative z-10"
        >
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#FFD200] to-transparent opacity-60" />
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-7">
            <div className="md:col-span-2 flex flex-col gap-2.5">
              <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.16em] ml-1">Cuéntanos de qué va tu proyecto</label>
              <textarea
                value={formData.project}
                onChange={(e) => handleInputChange('project', e.target.value)}
                className="border border-zinc-200 rounded-[8px] px-4 py-3 text-sm leading-relaxed outline-none text-black placeholder:text-zinc-300 placeholder:font-normal focus:border-[#FFD200] focus:shadow-[0_12px_28px_-24px_rgba(255,210,0,0.7)] transition-all duration-300 bg-zinc-50/70 resize-none h-24 font-medium hover:border-zinc-300"
                placeholder="Ej: Tengo una clínica dental y quiero mejorar la imagen de mi marca, mis redes y la forma en que presento mis servicios."
              />
            </div>

            <div className="flex flex-col gap-2.5">
              <label className="min-h-[28px] flex items-end text-[10px] font-black uppercase text-zinc-500 tracking-[0.16em] ml-1">¿En qué área te gustaría que te ayudemos?</label>
              <select 
                value={formData.area}
                onChange={(e) => handleInputChange('area', e.target.value)}
                className="border border-zinc-200 rounded-[8px] px-4 py-3 text-sm outline-none focus:border-[#FFD200] focus:shadow-[0_12px_28px_-24px_rgba(255,210,0,0.7)] transition-all duration-300 bg-white text-black appearance-none cursor-pointer font-medium hover:border-zinc-300"
              >
                {Object.keys(solutionMap).map(area => (
                  <option key={area} value={area} className="text-black bg-white py-2">{area}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2.5">
              <label className="min-h-[28px] flex items-end text-[10px] font-black uppercase text-zinc-500 tracking-[0.16em] ml-1">Elige el servicio más cercano</label>
              <select 
                value={formData.solution}
                onChange={(e) => handleInputChange('solution', e.target.value)}
                disabled={!formData.area}
                className="border border-zinc-200 rounded-[8px] px-4 py-3 text-sm outline-none focus:border-[#FFD200] focus:shadow-[0_12px_28px_-24px_rgba(255,210,0,0.7)] transition-all duration-300 bg-white text-black appearance-none cursor-pointer font-medium hover:border-zinc-300 disabled:opacity-50"
              >
                <option value="">Selecciona un servicio</option>
                {formData.area && solutionMap[formData.area].map(sol => (
                  <option key={sol} value={sol} className="text-black bg-white py-2">{sol}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2.5">
              <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.16em] ml-1">¿Qué resultado te gustaría lograr?</label>
              <input 
                type="text" 
                value={formData.objective}
                onChange={(e) => handleInputChange('objective', e.target.value)}
                className="border border-zinc-200 rounded-[8px] px-4 py-3 text-sm outline-none text-black placeholder:text-zinc-300 placeholder:font-normal focus:border-[#FFD200] focus:shadow-[0_12px_28px_-24px_rgba(255,210,0,0.7)] transition-all duration-300 bg-white font-medium hover:border-zinc-300" 
                placeholder="Ej: Quiero verme más profesional, atraer más pacientes y que mi contenido se vea más ordenado." 
              />
            </div>

            <div className="flex flex-col gap-2.5">
              <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.16em] ml-1">Tu correo</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="border border-zinc-200 rounded-[8px] px-4 py-3 text-sm outline-none text-black placeholder:text-zinc-300 placeholder:font-normal focus:border-[#FFD200] focus:shadow-[0_12px_28px_-24px_rgba(255,210,0,0.7)] transition-all duration-300 bg-white font-medium hover:border-zinc-300" 
                placeholder="tu@correo.com" 
              />
            </div>

            <div className="md:col-span-2 flex flex-col gap-2.5">
              <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.16em] ml-1">Algo más que debamos saber</label>
              <textarea 
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                className="border border-zinc-200 rounded-[8px] px-4 py-3 text-sm leading-relaxed outline-none text-black placeholder:text-zinc-300 placeholder:font-normal focus:border-[#FFD200] focus:shadow-[0_12px_28px_-24px_rgba(255,210,0,0.7)] transition-all duration-300 bg-zinc-50/70 resize-none h-20 font-medium hover:border-zinc-300" 
                placeholder="Puedes contarnos si tienes web, redes, referencias, urgencia o material ya creado." 
              />
            </div>

            <div className="md:col-span-2 mt-3">
              <button type="submit" className="w-full bg-black text-white py-4 rounded-[8px] text-[11px] font-black uppercase tracking-[0.18em] hover:bg-[#FFD200] hover:text-black transition-all duration-300 flex items-center justify-center gap-4 group shadow-xl shadow-black/10 hover:-translate-y-0.5 hover:shadow-[0_18px_44px_-20px_rgba(255,210,0,0.65)] active:translate-y-0">
                Iniciar Conversación <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  </section>
  )
}

export default function VisualLabPage() {
  return (
    <div className="bg-black font-sans antialiased text-white selection:bg-[#FFD200] selection:text-black">
      <Hero />
      <VisualSectors />
      <CinematicStatement />
      <StrategySection />
      <DiagnosticForm />
    </div>
  )
}
