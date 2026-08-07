import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Cpu, 
  Layers, 
  Maximize2, 
  Share2, 
  PenTool,
  ArrowRight,
  Zap,
  Globe,
  Database,
  Camera,
  Film,
  Sparkles
} from 'lucide-react';

// --- Configuración del Sistema de Diseño ---
const UI = {
  radius: 'rounded-[10px]',
  radiusSm: 'rounded-[6px]',
  accent: '#FFD200',
  accentHover: '#FFDE21',
  border: 'border-white/10',
  borderLight: 'border-zinc-200',
  fontEditorial: 'font-serif',
};

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-700 ${isScrolled ? 'bg-black/90 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-10'}`}>
      <div className="max-w-[1400px] mx-auto px-10 flex justify-between items-center">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="w-6 h-6 bg-[#FFD200] flex items-center justify-center transition-transform group-hover:rotate-90 duration-500">
            <span className="text-black font-black text-[10px]">QL</span>
          </div>
          <span className="text-white font-bold tracking-tighter text-xl">Visual Lab.</span>
        </div>
        
        <div className="hidden lg:flex items-center gap-12 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          {['El Estudio', 'Sistemas', 'Cinematografía', 'Branding AI', 'Contacto'].map((item) => (
            <a key={item} href="#" className="hover:text-[#FFD200] transition-colors relative group">
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#FFD200] transition-all group-hover:w-full"></span>
            </a>
          ))}
        </div>

        <button className={`bg-white text-black px-7 py-2.5 ${UI.radiusSm} text-[10px] font-black uppercase tracking-widest hover:bg-[#FFD200] transition-all shadow-xl shadow-white/5`}>
          Agendar Sesión
        </button>
      </div>
    </nav>
  );
};

const Hero = () => (
  <section className="relative h-screen flex flex-col justify-center px-10 overflow-hidden bg-black">
    <div 
      className="absolute inset-0 grayscale opacity-50 pointer-events-none scale-110"
      style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1600")',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
        backgroundSize: 'cover'
      }}
    />
    
    <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent" />
    <div className="absolute inset-0 bg-linear-to-r from-black via-transparent to-black/20" />
    
    <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-[#FFD200]/10 blur-[120px] rounded-full pointer-events-none" />

    <div className="max-w-[1400px] mx-auto w-full z-10">
      <div className="max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex items-center gap-4"
        >
          <span className="h-px w-12 bg-[#FFD200]" />
          <span className="text-[#FFD200] text-[11px] font-bold uppercase tracking-[0.3em]">
            The Architecture of New Media
          </span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-6xl md:text-[100px] font-bold text-white leading-[0.9] mb-12 tracking-tighter"
        >
          Sistemas <br />
          <span className="text-zinc-500 italic font-light">Visuales</span> de Elite.
        </motion.h1>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col md:flex-row items-start md:items-center gap-12"
        >
          <p className="max-w-md text-zinc-300 font-light text-lg leading-relaxed">
            Fusionamos la estética editorial con ingeniería de vanguardia para crear identidades que definen el futuro de las marcas globales.
          </p>
          
          <div className="flex flex-col gap-6">
            <button className={`group flex items-center gap-4 bg-[#FFD200] text-black px-10 py-5 ${UI.radiusSm} text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white transition-all`}>
              Explorar El Lab <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
            </button>
            <div className="flex gap-4 items-center px-2">
              <div className="flex -space-x-2">
                {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-black bg-zinc-800" />)}
              </div>
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Trust by Top Studios</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

const VisualSectors = () => (
  <section className="py-40 px-10 bg-white text-black overflow-hidden">
    <div className="max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 gap-10">
        <div className="max-w-2xl">
          <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-6 block">Capabilities / 01</span>
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight leading-none mb-8">Producción de Alto <br /> Contraste Emocional.</h2>
          <p className="text-zinc-500 text-lg font-light leading-relaxed">
            No generamos imágenes; construimos ecosistemas visuales diseñados para impactar, retener y convertir a través de la sofisticación.
          </p>
        </div>
        <div className="h-px flex-1 bg-zinc-100 mx-10 hidden lg:block" />
        <div className="shrink-0">
          <Sparkles className="text-[#FFD200] mb-4" size={32} />
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-300">Curated AI Excellence</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Editorial Block: Portraits */}
        <motion.div 
          whileHover={{ y: -10 }}
          className={`md:col-span-8 group border border-zinc-100 overflow-hidden relative h-[600px] ${UI.radius}`}
        >
          <img 
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1200" 
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100" 
            alt="Editorial Portrait"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent opacity-60" />
          <div className="absolute bottom-0 left-0 p-12 text-white">
            <span className="inline-block bg-[#FFD200] text-black text-[9px] font-black px-3 py-1 mb-6 rounded-xs uppercase tracking-widest">New Standard</span>
            <h3 className="text-4xl font-bold mb-4 tracking-tighter">Identity Lab</h3>
            <p className="text-zinc-300 text-sm max-w-sm font-light leading-relaxed">
              Retratos que capturan la esencia humana con una precisión que desafía la realidad. Estética cinematográfica aplicada a la marca personal corporativa.
            </p>
          </div>
        </motion.div>

        {/* Studio Block: Product */}
        <motion.div 
          whileHover={{ y: -10 }}
          className={`md:col-span-4 bg-zinc-950 text-white overflow-hidden relative p-12 flex flex-col justify-between ${UI.radius}`}
        >
          <div className="relative z-10">
            <div className="w-12 h-12 border border-white/10 flex items-center justify-center mb-10">
              <Camera size={20} className="text-[#FFD200]" />
            </div>
            <h3 className="text-3xl font-bold tracking-tight mb-4 leading-none">Campaing <br /> Synthesis.</h3>
            <p className="text-zinc-500 text-sm font-light leading-relaxed">Entornos de producto imposibles de distinguir de una sesión física de alto presupuesto.</p>
          </div>
          <div className="relative mt-12 overflow-hidden rounded-lg border border-white/5">
            <img 
              src="https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&q=80&w=600" 
              className="w-full h-48 object-cover opacity-60 hover:opacity-100 transition-opacity" 
              alt="Watch"
            />
          </div>
        </motion.div>

        {/* Video: Motion */}
        <div className={`md:col-span-5 bg-zinc-100 p-12 h-[450px] flex flex-col justify-between group ${UI.radius}`}>
          <div>
            <span className="text-[10px] font-black uppercase text-zinc-400 mb-8 block tracking-[0.2em]">Sora Motion Lab</span>
            <h3 className="text-3xl font-bold mb-6 tracking-tighter">Narrativa Líquida</h3>
            <p className="text-zinc-500 text-base font-light leading-relaxed">Sintetizamos historias en video que fluyen con la coherencia de un film de autor.</p>
          </div>
          <div className={`bg-black h-40 flex items-center justify-center relative overflow-hidden ${UI.radius}`}>
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800')] opacity-30 grayscale group-hover:scale-110 transition-transform duration-1000" />
             <div className="relative z-10 w-14 h-14 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-[#FFD200] group-hover:border-transparent transition-all">
                <Play size={20} fill="white" className="text-white ml-1 group-hover:fill-black group-hover:text-black" />
             </div>
          </div>
        </div>

        {/* Modern Depth: Enhancement */}
        <div className={`md:col-span-7 bg-white border border-zinc-100 p-12 flex flex-col md:flex-row gap-12 items-center relative overflow-hidden ${UI.radius}`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD200]/5 blur-3xl" />
          <div className="md:w-1/2 relative">
            <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800" className={`w-full h-72 object-cover ${UI.radius} shadow-2xl grayscale hover:grayscale-0 transition-all duration-700`} alt="Art" />
          </div>
          <div className="md:w-1/2">
            <div className="flex gap-2 mb-6">
               <span className="w-2 h-2 bg-[#FFD200] rounded-full animate-pulse" />
               <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Active Upscaling</span>
            </div>
            <h3 className="text-3xl font-bold mb-6 tracking-tight leading-none">Refinamiento de Grado Superior.</h3>
            <p className="text-zinc-500 text-sm font-light leading-relaxed mb-10">
              Transformamos la imperfección en detalle. Restauramos el legado visual de su marca con la resolución del mañana.
            </p>
            <button className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest border-b-2 border-[#FFD200] pb-2 hover:gap-5 transition-all">
              Ver el Proceso <ArrowRight size={14} />
            </button>
          </div>
        </div>

      </div>
    </div>
  </section>
);

const CinematicStatement = () => (
  <section className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-black px-10">
    <div 
      className="absolute inset-0 grayscale opacity-40"
      style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1600")',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
        backgroundSize: 'cover'
      }}
    />
    <div className="absolute inset-0 bg-linear-to-b from-black via-black/60 to-black" />
    
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="relative z-10 text-center max-w-5xl"
    >
      <span className="text-[#FFD200] text-[11px] font-bold uppercase tracking-[0.5em] mb-12 block">Philosophy of Light</span>
      <h2 className="text-5xl md:text-8xl font-bold text-white tracking-tighter leading-[0.9] mb-12">
        La Inteligencia Artificial es el pincel, <br />
        <span className="text-zinc-500 italic font-light">la estrategia es el lienzo.</span>
      </h2>
      <div className="h-px w-24 bg-[#FFD200] mx-auto mb-10" />
      <p className="text-zinc-400 text-lg font-light max-w-2xl mx-auto leading-relaxed uppercase tracking-widest text-[10px]">
        Redefiniendo la producción visual para el 1% de las marcas que buscan lo extraordinario.
      </p>
    </motion.div>
  </section>
);

const StrategySection = () => (
  <section className="py-40 px-10 bg-black text-white">
    <div className="max-w-[1400px] mx-auto">
      <div className="grid grid-cols-12 gap-16">
        <div className="col-span-12 lg:col-span-5">
          <div className="sticky top-40">
            <h2 className="text-5xl font-bold tracking-tight mb-10 leading-none">Metodología <br /> <span className="text-[#FFD200]">Experimental.</span></h2>
            <p className="text-zinc-500 font-light text-lg leading-relaxed mb-16 max-w-md">
              Nuestro flujo de trabajo combina la curaduría artística humana con la eficiencia exponencial de los modelos de difusión.
            </p>
            <div className="flex flex-col gap-8">
              {[
                { icon: <Sparkles size={18} />, title: "Curaduría Estética", desc: "Cada píxel es supervisado por directores de arte." },
                { icon: <Film size={18} />, title: "Coherencia de Marca", desc: "Modelos entrenados con su ADN visual único." }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-6 items-start">
                  <div className="w-12 h-12 bg-zinc-900 border border-white/5 flex items-center justify-center text-[#FFD200] rounded-xs">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-widest mb-1">{item.title}</h4>
                    <p className="text-zinc-500 text-xs font-light">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="col-span-12 lg:col-span-7 grid grid-cols-1 gap-12">
          {[
            { id: '01', title: 'Visual Ingestion', desc: 'Sumergimos nuestro sistema en el alma de su marca: colores, texturas y valores históricos.' },
            { id: '02', title: 'Neural Synthesis', desc: 'Desplegamos iteraciones masivas en entornos controlados para hallar la perfección visual.' },
            { id: '03', title: 'Artistic Refinement', desc: 'Intervención manual y retoque de alta gama para asegurar un acabado de lujo.' },
            { id: '04', title: 'Hybrid Delivery', desc: 'Entrega de activos optimizados para todos los puntos de contacto de la marca.' },
          ].map((step, idx) => (
            <motion.div 
              key={step.id} 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group border-b border-zinc-900 pb-12 flex justify-between items-center"
            >
              <div className="max-w-xl">
                <span className="text-[#FFD200] text-[10px] font-black mb-4 block tracking-[0.2em]">PHASE_{step.id}</span>
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
);

const DiagnosticForm = () => (
  <section className="py-40 px-10 bg-zinc-50 border-t border-zinc-200 relative overflow-hidden">
    <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-[#FFD200]/5 blur-[120px] rounded-full pointer-events-none" />
    
    <div className="max-w-[1400px] mx-auto grid grid-cols-12 gap-20">
      <div className="col-span-12 lg:col-span-5">
        <div className="sticky top-32">
          <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-6 block">Inicie la Evolución</span>
          <h2 className="text-5xl font-bold tracking-tight mb-10 leading-[1.1]">Diagnóstico <br /> Estratégico.</h2>
          <p className="text-zinc-500 text-lg font-light leading-relaxed mb-12">
            No somos un software, somos su laboratorio de diseño. Cuéntenos sobre su desafío visual y diseñaremos el sistema para resolverlo.
          </p>
          
          <div className="space-y-10">
            <div className="flex items-center gap-6 group">
              <div className="w-14 h-14 bg-white border border-zinc-200 flex items-center justify-center shrink-0 group-hover:border-[#FFD200] transition-colors">
                <Globe size={24} className="text-zinc-300 group-hover:text-black transition-colors" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest">Despliegue Internacional</p>
                <p className="text-zinc-400 text-xs">Capacidad de producción 24/7 global.</p>
              </div>
            </div>
            <div className="flex items-center gap-6 group">
              <div className="w-14 h-14 bg-white border border-zinc-200 flex items-center justify-center shrink-0 group-hover:border-[#FFD200] transition-colors">
                <Database size={24} className="text-zinc-300 group-hover:text-black transition-colors" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest">Soberanía de Datos</p>
                <p className="text-zinc-400 text-xs">Modelos privados y seguros para su marca.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-7">
        <div className={`bg-white border border-zinc-200 p-10 md:p-20 shadow-2xl shadow-zinc-200/50 ${UI.radius} relative z-10`}>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
            <div className="flex flex-col gap-4">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] ml-1">¿Qué tipo de estudio busca?</label>
              <select className="border-b-2 border-zinc-100 py-4 text-sm outline-none focus:border-[#FFD200] transition-colors bg-transparent appearance-none cursor-pointer font-medium">
                <option>Laboratorio de Branding AI</option>
                <option>Producción Publicitaria Masiva</option>
                <option>Consultoría de Procesos Creativos</option>
                <option>Cine & Motion Lab</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-4">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] ml-1">Área de Interés Principal</label>
              <select className="border-b-2 border-zinc-100 py-4 text-sm outline-none focus:border-[#FFD200] transition-colors bg-transparent appearance-none cursor-pointer font-medium">
                <option>Identidad de Personas (Portraits)</option>
                <option>Fotografía de Producto 3D</option>
                <option>Video Generativo SORA</option>
                <option>Estrategia de Automatización</option>
              </select>
            </div>

            <div className="flex flex-col gap-4">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] ml-1">Su Objetivo de Diseño</label>
              <input type="text" className="border-b-2 border-zinc-100 py-4 text-sm outline-none focus:border-[#FFD200] transition-colors bg-transparent font-medium" placeholder="Ej: Reducir costos de shooting 80%" />
            </div>

            <div className="flex flex-col gap-4">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] ml-1">Contacto Corporativo</label>
              <input type="email" className="border-b-2 border-zinc-100 py-4 text-sm outline-none focus:border-[#FFD200] transition-colors bg-transparent font-medium" placeholder="name@luxury-brand.com" />
            </div>

            <div className="md:col-span-2 flex flex-col gap-4">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] ml-1">Resumen del Desafío Visual</label>
              <textarea className="border-b-2 border-zinc-100 py-4 text-sm outline-none focus:border-[#FFD200] transition-colors bg-transparent resize-none h-24 font-medium" placeholder="Buscamos escalar nuestra estética visual a nivel global..." />
            </div>

            <div className="md:col-span-2 mt-12">
              <button className={`w-full bg-black text-white py-6 ${UI.radiusSm} text-[11px] font-black uppercase tracking-[0.3em] hover:bg-[#FFD200] hover:text-black transition-all flex items-center justify-center gap-6 group shadow-2xl shadow-black/10`}>
                Solicitar Consulta Privada <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
              </button>
              <div className="flex justify-between items-center mt-8">
                 <p className="text-zinc-300 text-[8px] font-bold uppercase tracking-[0.3em]">Confidencialidad Garantizada</p>
                 <p className="text-zinc-300 text-[8px] font-bold uppercase tracking-[0.3em]">EST. RESPONSE: 12H</p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-black text-zinc-600 py-32 px-10 border-t border-zinc-900">
    <div className="max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start gap-20 mb-32">
        <div className="max-w-sm">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-5 h-5 bg-[#FFD200] flex items-center justify-center">
              <span className="text-black font-black text-[8px]">QL</span>
            </div>
            <span className="text-white font-bold tracking-tight text-xl uppercase">Visual Lab.</span>
          </div>
          <p className="text-sm font-light leading-relaxed mb-10 text-zinc-500">
            Escalando la creatividad humana a través de la síntesis inteligente. Un estudio de diseño para la era de la IA.
          </p>
          <div className="flex gap-6">
            <Share2 size={18} className="hover:text-[#FFD200] cursor-pointer transition-colors" />
            <Globe size={18} className="hover:text-[#FFD200] cursor-pointer transition-colors" />
            <Maximize2 size={18} className="hover:text-[#FFD200] cursor-pointer transition-colors" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-20">
          <div>
            <h5 className="text-[10px] font-black text-white uppercase tracking-widest mb-8">Estudio</h5>
            <ul className="space-y-4 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
              <li><a href="#" className="hover:text-white transition-colors">Portafolio</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Sistemas</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Lab Report</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-[10px] font-black text-white uppercase tracking-widest mb-8">Servicios</h5>
            <ul className="space-y-4 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
              <li><a href="#" className="hover:text-white transition-colors">Enterprise</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Automation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Branding</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-[10px] font-black text-white uppercase tracking-widest mb-8">Legal</h5>
            <ul className="space-y-4 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
              <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Data Ethics</a></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="pt-12 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-8">
        <p className="text-[9px] uppercase font-bold tracking-[0.4em] opacity-30">
          © 2024 QAWAY STRATEGIC DESIGN SYSTEMS. THE NEW VISUAL STANDARD.
        </p>
        <div className="flex gap-4">
           <div className="w-2 h-2 rounded-full bg-[#FFD200] shadow-[0_0_10px_#FFD200]" />
           <span className="text-[9px] font-black uppercase tracking-widest text-white">System Status: Optimal</span>
        </div>
      </div>
    </div>
  </footer>
);

export default function App() {
  return (
    <div className="bg-black font-sans antialiased text-white selection:bg-[#FFD200] selection:text-black">
      <Navbar />
      <Hero />
      <VisualSectors />
      <CinematicStatement />
      <StrategySection />
      <DiagnosticForm />
      <Footer />
    </div>
  );
}
