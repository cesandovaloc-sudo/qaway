
import React from "react";
import { createRoot } from "react-dom/client";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, CircleDot, Compass, Database, Eye, Layout, MapPin, MessageCircle, MousePointer2, Palette, Smartphone, Sparkles, Target, Users, Workflow } from "lucide-react";
import { motion } from "motion/react";
import { project } from "./data/project";
import "./styles/global.css";

const fade = { initial:{opacity:0,y:24}, whileInView:{opacity:1,y:0}, viewport:{once:true,amount:.2}, transition:{duration:.6} };

function Mockup({type="desktop", label="Horizonte"}:{type?: "desktop"|"phone"|"tablet"; label?:string}) {
  const cls = type==="phone" ? "w-[180px] mx-auto" : type==="tablet" ? "w-[68%] mx-auto" : "w-full";
  return <div className={`mockup ${cls}`}>
    <div className="mockup-screen p-5 md:p-7">
      <div className="flex items-center justify-between text-[8px] text-white/70 mb-10">
        <b className="tracking-[.12em]">HORIZONTE</b><span>PROYECTOS · BENEFICIOS · CONTACTO</span>
      </div>
      <div className="max-w-[70%]">
        <div className="eyebrow mb-3">PROYECTO WEB</div>
        <div className="serif text-3xl md:text-5xl leading-[.95]">Vive en la mejor zona de la ciudad.</div>
        <p className="text-xs text-white/60 mt-4">Departamentos diseñados para vivir, invertir y crecer.</p>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#c9a35a] px-4 py-2 text-[9px] font-semibold text-[#071914]">AGENDAR VISITA <ArrowUpRight size={12}/></div>
      </div>
      <div className="absolute bottom-5 left-5 right-5 grid grid-cols-3 gap-2">
        {["Entrega","Ubicación","Amenidades"].map(x=><div key={x} className="rounded-md border border-white/10 bg-black/20 p-2 text-[8px] text-white/60">{x}<br/><b className="text-white">Disponible</b></div>)}
      </div>
    </div>
  </div>
}

function SectionLabel({n,title}:{n:string;title:string}) {
  return <div className="eyebrow flex items-center gap-3"><span>{n}</span><span className="h-px w-10 bg-current opacity-40"/><span>{title}</span></div>
}

function App() {
  return <main className="page">
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/35 backdrop-blur-xl">
      <div className="shell flex h-16 items-center justify-between">
        <div className="font-semibold tracking-tight">QAWAY<span className="text-[8px] ml-1 align-top opacity-60">LAB</span></div>
        <div className="hidden md:block text-[9px] uppercase tracking-[.2em] text-white/55">Sistemas digitales que conectan, organizan y convierten.</div>
        <div className="eyebrow">Página de proyecto / Case study</div>
      </div>
    </header>

    <section className="hero-photo noise min-h-[92vh] flex items-end section-pad pt-32">
      <div className="shell w-full">
        <div className="grid-12 items-end">
          <motion.div {...fade} className="col-span-7">
            <div className="eyebrow mb-5">Proyecto web / 01</div>
            <h1 className="display serif max-w-5xl">Horizonte<br/>Inmobiliaria</h1>
            <p className="copy mt-7 text-base md:text-lg max-w-xl">Una experiencia digital diseñada para presentar proyectos inmobiliarios, generar confianza y convertir visitas en consultas.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={project.liveUrl} className="inline-flex items-center gap-2 rounded-full bg-[#c9a35a] px-5 py-3 text-xs font-semibold text-[#071914]">VER SITIO EN VIVO <ArrowUpRight size={15}/></a>
              <a href="#experiencia" className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-3 text-xs">EXPLORAR PROYECTO <ArrowDown size={15}/></a>
            </div>
          </motion.div>
          <motion.div {...fade} className="col-span-5">
            <div className="grid grid-cols-2 gap-3 text-xs text-white/75">
              {[["Cliente",project.client],["Servicio",project.service],["Año",project.year],["Tecnologías",project.technologies]].map(([k,v])=><div key={k} className="border-t border-white/20 pt-3"><div className="eyebrow mb-2">{k}</div><div>{v}</div></div>)}
            </div>
          </motion.div>
        </div>
        <div className="mt-12 flex items-center gap-3 text-[10px] text-white/50"><CircleDot size={13}/> VIDEO DEL PROYECTO · 00:45 <div className="h-px flex-1 bg-white/20"/></div>
      </div>
    </section>

    <section id="experiencia" className="paper-surface section-pad">
      <div className="shell">
        <SectionLabel n="02" title="EL PROYECTO"/>
        <motion.div {...fade} className="mt-8 grid-12 items-start">
          <div className="col-span-7">
            <h2 className="section-title serif">Diseñar una web inmobiliaria no era mostrar propiedades. Era construir una decisión.</h2>
          </div>
          <div className="col-span-5">
            <p className="light-copy">La experiencia se organiza para que cada visitante pueda entender el proyecto, explorar, comparar y contactar sin perder contexto.</p>
          </div>
        </motion.div>
        <div className="mt-14 icon-flow text-[#071914]">
          {[
            [Users,"Usuario"],[Target,"Confianza"],[Eye,"Exploración"],[MousePointer2,"Conversión"]
          ].map(([Icon,label],i)=><React.Fragment key={String(label)}>
            <div className="flex items-center gap-3"><span><Icon size={18}/></span><b className="text-sm">{String(label)}</b></div>
            {i<3 && <div className="arrow"/>}
          </React.Fragment>)}
        </div>
      </div>
    </section>

    <section className="sticky-photo noise min-h-[78vh] flex items-end bg-[url('/assets/interior-visual.svg')] bg-cover bg-center section-pad">
      <div className="shell">
        <motion.div {...fade} className="max-w-3xl">
          <SectionLabel n="03" title="PAUSA VISUAL"/>
          <h2 className="display serif mt-6">La marca también se siente antes de leer.</h2>
        </motion.div>
      </div>
    </section>

    <section className="brand-surface section-pad">
      <div className="shell">
        <SectionLabel n="04" title="IDENTIDAD VISUAL"/>
        <div className="mt-10 grid-12 items-center">
          <div className="col-span-5">
            <h2 className="section-title serif">Elegancia, confianza y valor inmobiliario.</h2>
            <p className="copy mt-6">La identidad del proyecto se construye alrededor de tonos profundos, crema y dorado: una paleta pensada para transmitir patrimonio sin caer en el código inmobiliario genérico.</p>
          </div>
          <div className="col-span-7">
            <div className="grid grid-cols-5 gap-3">
              {[project.brand.forest,project.brand.forest2,project.brand.gold,project.brand.cream,project.brand.paper].map((c)=><div key={c}><div className="aspect-square rounded-2xl border border-white/10" style={{background:c}}/><div className="mt-2 font-mono text-[9px] text-white/50">{c}</div></div>)}
            </div>
            <div className="mt-10 grid grid-cols-2 gap-5">
              <div className="card bg-white/5 border-white/10"><div className="eyebrow">TIPOGRAFÍA</div><div className="serif text-4xl mt-5">Playfair Display</div><div className="mt-2 text-white/50">Inter / DM Sans para interfaz.</div></div>
              <div className="card bg-white/5 border-white/10"><div className="eyebrow">LOGOTIPO</div><div className="serif text-4xl mt-5">HORIZONTE</div><div className="mt-2 text-white/50">Sistema adaptable a digital y aplicaciones.</div></div>
            </div>
          </div>
        </div>
        <div className="mt-14 visual-frame bg-[#10231d] p-5 md:p-10">
          <div className="grid md:grid-cols-4 gap-5">
            {["Papelería","Tarjetas","Carpeta","Señalética"].map((x,i)=><div key={x} className="aspect-[4/3] rounded-xl bg-[#f2eee5] text-[#071914] p-5 flex flex-col justify-between"><div className="font-mono text-[9px] opacity-50">HORIZONTE / 0{i+1}</div><div className="serif text-2xl">{x}</div><div className="h-2 w-16 bg-[#c9a35a] rounded-full"/></div>)}
          </div>
        </div>
      </div>
    </section>

    <section className="paper-surface section-pad">
      <div className="shell">
        <SectionLabel n="05" title="DISEÑO Y EXPERIENCIA WEB"/>
        <div className="mt-10 grid-12 items-center">
          <div className="col-span-4">
            <h2 className="section-title serif">Una interfaz que deja hablar al proyecto.</h2>
            <p className="light-copy mt-5">Mockups y composición editorial para mostrar la experiencia sin convertir la página de caso en otra web.</p>
          </div>
          <div className="col-span-8">
            <Mockup />
          </div>
        </div>
        <div className="mt-16 grid md:grid-cols-2 gap-8 items-end">
          <Mockup type="tablet"/>
          <Mockup type="phone"/>
        </div>
      </div>
    </section>

    <section className="muted-surface section-pad">
      <div className="shell">
        <SectionLabel n="06" title="PÁGINAS PRINCIPALES"/>
        <div className="mt-8 grid md:grid-cols-5 gap-4">
          {project.pages.map((page,i)=><div key={page} className="rounded-2xl bg-white p-3 shadow-xl"><div className="aspect-[3/5] rounded-xl bg-[#0d241d] p-3 text-white"><div className="text-[6px] uppercase tracking-widest text-[#c9a35a]">0{i+1}</div><div className="serif text-lg mt-8">{page}</div><div className="mt-5 space-y-2">{Array.from({length:5}).map((_,j)=><div key={j} className="h-2 rounded bg-white/10"/>)}</div></div><div className="px-2 py-3 text-[10px] font-semibold">{page}</div></div>)}
        </div>
      </div>
    </section>

    <section className="brand-surface section-pad">
      <div className="shell">
        <SectionLabel n="07" title="DETALLES QUE MARCAN LA EXPERIENCIA"/>
        <div className="mt-10 grid md:grid-cols-4 gap-4">
          {[
            [Layout,"Navegación","Estructura clara y fácil de usar."],
            [MousePointer2,"Llamadas a la acción","Botones que orientan la conversión."],
            [MessageCircle,"WhatsApp","Contacto directo y contextual."],
            [MapPin,"Mapa interactivo","Ubicación como argumento de decisión."],
            [Database,"Formularios","Datos preparados para seguimiento."],
            [Smartphone,"Responsive","La experiencia se adapta."],
            [Compass,"Iconografía","Lenguaje visual propio."],
            [Palette,"Sistema visual","Color, tipografía y ritmo consistentes."]
          ].map(([Icon,title,desc])=><div key={String(title)} className="rounded-2xl border border-white/10 bg-white/[.035] p-6"><Icon size={20} className="text-[#c9a35a]"/><h3 className="mt-7 font-semibold">{String(title)}</h3><p className="mt-2 text-sm leading-6 text-white/55">{String(desc)}</p></div>)}
        </div>
      </div>
    </section>

    <section className="sticky-photo noise min-h-[80vh] flex items-center bg-[url('/assets/interaction-visual.svg')] bg-cover bg-center">
      <div className="shell">
        <div className="grid-12 items-center">
          <div className="col-span-5"><SectionLabel n="08" title="VIDEO / RECORRIDO"/><h2 className="section-title serif mt-6">La experiencia también se explica en movimiento.</h2><p className="copy mt-5">Segundo espacio de video para mostrar navegación, microinteracciones, flujo de contacto o recorrido del sitio.</p></div>
          <div className="col-span-7"><div className="visual-frame aspect-video bg-black/70 flex items-center justify-center"><div className="text-center"><div className="mx-auto h-16 w-16 rounded-full border border-[#c9a35a] grid place-items-center"><ArrowRight/></div><div className="eyebrow mt-5">REPRODUCIR VIDEO · 01:06</div></div></div></div>
        </div>
      </div>
    </section>

    <section className="paper-surface section-pad">
      <div className="shell">
        <SectionLabel n="09" title="APLICACIONES DE MARCA"/>
        <div className="mt-10 grid md:grid-cols-2 gap-8 items-center">
          <div><h2 className="section-title serif">La identidad sale de la pantalla.</h2><p className="light-copy mt-5">Una sección predominantemente visual para mostrar cómo el sistema gráfico se extiende a piezas físicas y puntos de contacto.</p></div>
          <div className="grid grid-cols-2 gap-4">
            {["stationery.svg","cards.svg","folder.svg","signage.svg"].map((f,i)=><img key={f} src={`/assets/${f}`} alt={`Aplicación de marca ${i+1}`} className="rounded-2xl w-full shadow-xl"/></div>
          </div>
        </div>
      </div>
    </section>

    <section className="gold-surface section-pad">
      <div className="shell">
        <SectionLabel n="10" title="MOBILE / MICROINTERACCIONES"/>
        <div className="mt-10 grid md:grid-cols-3 gap-8 items-end">
          <Mockup type="phone"/>
          <Mockup type="phone"/>
          <div><h2 className="section-title serif">Pequeños movimientos. Una experiencia más clara.</h2><ul className="mt-6 space-y-3 text-sm">{["Transiciones entre páginas","CTA persistente en móvil","Formulario contextual","Galería y mapa adaptados"].map(x=><li key={x} className="flex items-center gap-2"><Check size={16}/>{x}</li>)}</ul></div>
        </div>
      </div>
    </section>

    <section className="brand-surface section-pad">
      <div className="shell">
        <SectionLabel n="11" title="RESULTADOS / APORTE DEL PROYECTO"/>
        <h2 className="section-title serif mt-8 max-w-4xl">Una experiencia digital construida para convertir.</h2>
        <div className="mt-12 grid md:grid-cols-4 gap-5">
          {[
            ["01","Presentación más clara","Información organizada para facilitar la decisión."],
            ["02","Mayor capacidad de captación","Formularios y canales conectados."],
            ["03","Mejor experiencia","Diseño adaptable a todos los dispositivos."],
            ["04","Operación conectada","WhatsApp, formulario y CRM preparados para seguimiento."]
          ].map(([n,t,d])=><div key={n} className="border-t border-white/15 pt-5"><div className="eyebrow">{n}</div><h3 className="mt-4 font-semibold">{t}</h3><p className="mt-2 text-sm leading-6 text-white/55">{d}</p></div>)}
        </div>
      </div>
    </section>

    <section className="sticky-photo noise min-h-[65vh] flex items-end bg-[url('/assets/closing-visual.svg')] bg-cover bg-center section-pad">
      <div className="shell w-full">
        <div className="max-w-3xl">
          <SectionLabel n="12" title="CIERRE / CTA"/>
          <h2 className="display serif mt-6">¿Tienes un proyecto similar en mente?</h2>
          <a href="#contacto" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#c9a35a] px-6 py-3 text-sm font-semibold text-[#071914]">HABLEMOS DE TU PROYECTO <ArrowUpRight size={17}/></a>
        </div>
      </div>
    </section>

    <footer id="contacto" className="bg-black text-white section-pad">
      <div className="shell">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-10">
          <div><div className="eyebrow">13 / NAVEGACIÓN ENTRE PROYECTOS</div><div className="mt-6 text-3xl serif">El siguiente caso puede empezar aquí.</div></div>
          <div className="flex gap-3"><button aria-label="Proyecto anterior" className="h-12 w-12 border border-white/15 rounded-full grid place-items-center"><ArrowLeft size={17}/></button><button aria-label="Todos los proyectos" className="h-12 px-5 border border-white/15 rounded-full text-xs">TODOS LOS PROYECTOS</button><button aria-label="Siguiente proyecto" className="h-12 w-12 border border-white/15 rounded-full grid place-items-center"><ArrowRight size={17}/></button></div>
        </div>
        <div className="mt-20 pt-6 border-t border-white/10 flex justify-between text-[9px] uppercase tracking-[.18em] text-white/40"><span>Qaway Lab</span><span>Case Study · Horizonte Inmobiliaria</span></div>
      </div>
    </footer>
  </main>
}
createRoot(document.getElementById("root")!).render(<App />);
