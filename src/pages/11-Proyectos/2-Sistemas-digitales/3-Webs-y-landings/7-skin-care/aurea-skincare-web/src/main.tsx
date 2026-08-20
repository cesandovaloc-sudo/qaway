import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { motion } from "motion/react";
import {
  ArrowDownRight, ArrowRight, Check, Leaf, Menu, ShieldCheck,
  Sparkles, Sun, Droplets, Heart, X, Instagram, Facebook, ShoppingBag
} from "lucide-react";
import "./index.css";

type Product = {
  name: string;
  subtitle: string;
  image: string;
  description: string;
};

const products: Product[] = [
  { name:"Sérum antioxidante", subtitle:"Vitamina C · Ácido ferúlico", image:"/images/serum_orange.jpg", description:"Ilumina y protege la piel frente al estrés oxidativo." },
  { name:"Gel limpiador purificante", subtitle:"Té verde · Hamamelis", image:"/images/hero_products.jpg", description:"Limpieza suave para comenzar el ritual sin resecar." },
  { name:"Crema hidratante", subtitle:"Ácido hialurónico · Escualano", image:"/images/ingredient_aloe.jpg", description:"Hidratación esencial y sensación de confort." },
  { name:"Tónico renovador", subtitle:"Rosa · Niacinamida", image:"/images/ingredient_rose.jpg", description:"Equilibra la piel y prepara el rostro para el siguiente paso." },
  { name:"Aceite regenerador", subtitle:"Rosa mosqueta · Jojoba", image:"/images/ingredient_pomegranate.jpg", description:"Nutrición concentrada para una piel más flexible." },
  { name:"Mascarilla detox", subtitle:"Arcilla verde · Espirulina", image:"/images/ingredient_green.jpg", description:"Un ritual semanal para limpiar y devolver frescura." },
];

const formulas = [
  { label:"Botanical Glow", title:"Sérum antioxidante", text:"Vitamina C estabilizada, ácido ferúlico y niacinamida para iluminar, proteger y devolver vitalidad.", chips:["Vitamina C","Ácido ferúlico","Niacinamida"], price:"S/ 129.00", image:"/images/serum_orange.jpg" },
  { label:"Calm Ritual", title:"Sérum calmante", text:"Una fórmula ligera con aloe y pantenol para acompañar pieles sensibles con un gesto esencial.", chips:["Aloe vera","Pantenol","Betaína"], price:"S/ 119.00", image:"/images/ingredient_aloe.jpg" },
  { label:"Renew Balance", title:"Aceite regenerador", text:"Rosa mosqueta, jojoba y extractos botánicos para nutrir sin sobrecargar la rutina.", chips:["Rosa mosqueta","Jojoba","Vitamina E"], price:"S/ 139.00", image:"/images/ingredient_pomegranate.jpg" },
];

function Reveal({ children, className="", delay=0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity:0, y:28 }}
      whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true, amount:.16 }}
      transition={{ duration:.72, delay, ease:[.2,.75,.25,1] }}
    >
      {children}
    </motion.div>
  );
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [formula, setFormula] = useState(0);
  const [subscribed, setSubscribed] = useState(false);
  const active = formulas[formula] ?? formulas[0]!;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive:true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const nodes = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      });
    }, { threshold:.14 });
    nodes.forEach(n => observer.observe(n));
    return () => observer.disconnect();
  }, []);

  const navItems = useMemo(() => [
    ["Colección","#coleccion"],["Filosofía","#filosofia"],["Ingredientes","#ingredientes"],["Rituales","#rituales"],["Beneficios","#beneficios"]
  ], []);

  return (
    <div>
      <header className={`nav ${scrolled ? "scrolled" : ""}`}>
        <div className="container nav-inner">
          <a className="brand" href="#inicio" aria-label="Auréa inicio">
            <span className="brand-mark"><Leaf strokeWidth={1.4}/></span>
            <span className="brand-copy"><strong>AURÉA</strong><small>Skincare botánico</small></span>
          </a>

          <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
            {navItems.map(([label, href]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>
            ))}
          </nav>

          <div className="nav-actions">
            <a className="signin" href="#contacto">Iniciar sesión</a>
            <a className="btn btn-primary" href="#coleccion">Regístrate</a>
            <button className="mobile-toggle" onClick={() => setMenuOpen(v => !v)} aria-label="Abrir menú">
              {menuOpen ? <X size={20}/> : <Menu size={20}/>}
            </button>
          </div>
        </div>
      </header>

      <main id="inicio">
        <section className="hero">
          <div className="container">
            <Reveal>
              <div className="hero-top">
                <div>
                  <span className="eyebrow"><span className="eyebrow-dot"/> Ciencia botánica · belleza real</span>
                  <h1>Cuida tu piel.<br/><em>De forma consciente.</em></h1>
                </div>
                <div className="hero-copy">
                  <div className="hero-pill"><img src="/images/hero_products.jpg" alt="Colección de productos Auréa"/></div>
                  <p>Fórmulas botánicas de alta eficacia, creadas para equilibrar, proteger y acompañar tu piel en cada etapa.</p>
                  <div className="hero-actions">
                    <a className="btn btn-primary" href="#coleccion">Descubre la colección <ArrowRight size={16}/></a>
                    <a className="btn btn-secondary" href="#filosofia">Nuestra filosofía</a>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={.08}>
              <motion.div className="hero-visual" whileHover={{ scale:1.003 }} transition={{ duration:.5 }}>
                <img src="/images/hero_photo.jpg" alt="Sérum antioxidante Auréa junto a cítricos y botánicos"/>
                <motion.div className="hero-overlay" initial={{opacity:0,x:-18}} animate={{opacity:1,x:0}} transition={{delay:.35,duration:.7}}>
                  <div className="icon-wrap"><Leaf size={18} strokeWidth={1.4}/></div>
                  <h3>Ingredientes reales.<br/>Resultados visibles.</h3>
                  <p>Fórmulas limpias, sin ingredientes innecesarios, pensadas para una piel saludable y luminosa.</p>
                  <a href="#ingredientes">Conoce más <ArrowRight size={14}/></a>
                </motion.div>
                <motion.div className="hero-badge" initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{delay:.65,duration:.65}}>
                  <img className="mini-bottle" src="/images/serum_orange.jpg" alt="" />
                  <div><strong>Botánica consciente</strong><span>Sin parabenos · Sin fragancias sintéticas · Cruelty free</span></div>
                </motion.div>
              </motion.div>
            </Reveal>
          </div>
        </section>

        <section id="filosofia" className="section">
          <div className="container split">
            <Reveal>
              <div className="media-card"><img src="/images/woman_story.jpg" alt="Mujer disfrutando de una rutina de cuidado consciente"/></div>
            </Reveal>
            <Reveal delay={.1}>
              <div className="copy-block">
                <span className="eyebrow">Filosofía Auréa</span>
                <h2>Belleza real.<br/>Cuidado esencial.</h2>
                <p>Creemos en el poder de la naturaleza y en rutinas simples que transforman tu piel día a día. Menos pasos, mejores fórmulas y una relación más consciente con lo que aplicas sobre tu piel.</p>
                <a className="link-arrow" href="#ingredientes">Descubre nuestra historia <ArrowRight size={15}/></a>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="beneficios" className="section" style={{paddingTop:20}}>
          <div className="container">
            <Reveal><div className="benefit-grid">
              {[
                [Droplets,"Hidratación esencial","Activos que ayudan a mantener la piel confortable, flexible y equilibrada."],
                [Sparkles,"Eficacia botánica","Concentraciones pensadas para aportar resultados sin complicar el ritual."],
                [Heart,"Resultados reales","Rutinas consistentes para una piel que se siente y se ve más saludable."],
                [ShieldCheck,"Conciencia","Ingredientes seleccionados y procesos que respetan tu piel y el entorno."]
              ].map(([Icon,title,text],i) => {
                const I = Icon as typeof Leaf;
                return <motion.div className="benefit" key={String(title)} whileHover={{y:-5}}>
                  <div className="icon-wrap"><I size={18} strokeWidth={1.4}/></div>
                  <h3>{String(title)}</h3><p>{String(text)}</p>
                </motion.div>
              })}
            </div></Reveal>
          </div>
        </section>

        <section id="rituales" className="section">
          <div className="container">
            <Reveal>
              <div className="product-intro">
                <div>
                  <span className="eyebrow">Colección Signature</span>
                  <h2>De la naturaleza<br/>a tu piel.</h2>
                </div>
                <p>Explora fórmulas botánicas creadas para rutinas reales: limpiar, tratar, hidratar y renovar sin añadir complejidad.</p>
              </div>
            </Reveal>

            <Reveal delay={.06}>
              <div className="formula-switch">
                {formulas.map((f,i) => (
                  <button key={f.label} className={i===formula ? "active" : ""} onClick={() => setFormula(i)}>{f.label}</button>
                ))}
              </div>
            </Reveal>

            <Reveal delay={.1}>
              <motion.div className="product-feature" layout>
                <div className="product-gallery">
                  <div className="large"><motion.img key={active.image} initial={{opacity:0,scale:1.03}} animate={{opacity:1,scale:1}} transition={{duration:.5}} src={active.image} alt={active.title}/></div>
                  <img src="/images/ingredient_citrus.jpg" alt="Ingredientes botánicos"/>
                  <img src="/images/ingredient_rose.jpg" alt="Botánicos para cuidado de la piel"/>
                </div>
                <div className="product-info">
                  <span className="kicker">Fórmula seleccionada</span>
                  <h3>{active.title}</h3>
                  <p>{active.text}</p>
                  <div className="chips">{active.chips.map(c => <span className="chip" key={c}>{c}</span>)}</div>
                  <div className="price-row">
                    <div className="price"><small>Presentación 30 ml</small><strong>{active.price}</strong></div>
                    <button className="btn btn-primary">Agregar al carrito <ShoppingBag size={16}/></button>
                  </div>
                </div>
              </motion.div>
            </Reveal>
          </div>
        </section>

        <section id="ingredientes" className="section">
          <div className="container">
            <Reveal>
              <div className="editorial-title">
                <span className="eyebrow">Tu ritual diario</span>
                <h2>¿Qué puede hacer por ti una fórmula fresca, botánica y pensada con propósito?</h2>
              </div>
              <div className="editorial-image"><img src="/images/ritual.jpg" alt="Ingredientes botánicos alrededor de un producto Auréa"/></div>
              <div className="editorial-features">
                {[
                  [Droplets,"Nutre de verdad","Ingredientes que la piel reconoce y absorbe."],
                  [Leaf,"Restaura el equilibrio","Fórmulas que apoyan hidratación, luminosidad y firmeza."],
                  [Sparkles,"Energía diaria","Activos que revitalizan y acompañan tu rutina."],
                  [Heart,"Belleza consciente","Sin ingredientes innecesarios. Eficacia con respeto."]
                ].map(([I,title,text]) => {
                  const Icon = I as typeof Leaf;
                  return <div className="editorial-feature" key={String(title)}><Icon size={20} strokeWidth={1.3}/><h3>{String(title)}</h3><p>{String(text)}</p></div>
                })}
              </div>
            </Reveal>
          </div>
        </section>

        <section className="section commitment">
          <div className="container">
            <Reveal>
              <div className="commitment-head">
                <span className="eyebrow">Nuestro compromiso</span>
                <h2>Belleza consciente,<br/>desde el origen.</h2>
              </div>
            </Reveal>
            <div className="commitment-grid">
              {[
                ["01","Máxima pureza","Seleccionamos ingredientes botánicos con procesos cuidadosos para preservar su calidad.","/images/ingredient_green.jpg"],
                ["02","Directo de la naturaleza","Trabajamos con extractos y activos botánicos elegidos por su función y trazabilidad.","/images/ingredient_aloe.jpg"],
                ["03","Formulación con propósito","Cada fórmula nace de una necesidad concreta de la piel, no de una tendencia pasajera.","/images/serum_orange.jpg"],
                ["04","Sin compromisos","Fórmulas transparentes, sin parabenos ni fragancias sintéticas innecesarias.","/images/ingredient_pomegranate.jpg"],
              ].map(([n,title,text,img],i) => (
                <Reveal key={n} delay={i*.05}>
                  <motion.article className="commitment-card" whileHover={{backgroundColor:"rgba(255,255,255,.52)"}}>
                    <div className="photo"><img src={img} alt={title}/></div>
                    <div className="commitment-copy"><span>{n}</span><h3>{title}</h3><p>{text}</p></div>
                  </motion.article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="section why">
          <div className="container">
            <div className="why-grid">
              <div className="why-side">
                <Reveal><div className="why-item"><div className="icon-wrap"><Leaf size={18}/></div><h3>Menos complejidad</h3><p>Rutinas simples y efectivas con lo esencial. Menos pasos, más consistencia.</p></div></Reveal>
                <Reveal delay={.1}><div className="why-item"><div className="icon-wrap"><Check size={18}/></div><h3>Más consistencia</h3><p>Fórmulas equilibradas que se complementan entre sí para potenciar el ritual.</p></div></Reveal>
              </div>
              <Reveal delay={.08}>
                <div className="why-center">
                  <span className="eyebrow">¿Por qué Auréa?</span>
                  <h2>Creado para tu<br/>bienestar diario.</h2>
                  <motion.img whileHover={{scale:1.02}} transition={{duration:.45}} src="/images/hero_products.jpg" alt="Productos Auréa para el ritual diario"/>
                  <a className="btn btn-primary" href="#coleccion">Conoce nuestra colección <ArrowRight size={16}/></a>
                </div>
              </Reveal>
              <div className="why-side">
                <Reveal delay={.1}><div className="why-item"><div className="icon-wrap"><ShoppingBag size={18}/></div><h3>Elecciones para cada día</h3><p>Opciones para cada necesidad y momento de tu piel. Tú eliges, nosotros cuidamos el resto.</p></div></Reveal>
                <Reveal delay={.16}><div className="why-item"><div className="icon-wrap"><Sun size={18}/></div><h3>Rituales que permanecen</h3><p>Diseñamos productos para que vuelvas a ellos, no para que acumules pasos.</p></div></Reveal>
              </div>
            </div>
          </div>
        </section>

        <section id="coleccion" className="section collection">
          <div className="container">
            <Reveal>
              <div className="collection-head">
                <div><span className="eyebrow">Selección Auréa</span><h2>Descubre nuestra colección</h2></div>
                <a className="btn btn-secondary" href="#contacto">Ver toda la colección <ArrowRight size={16}/></a>
              </div>
            </Reveal>
            <div className="collection-grid">
              {products.map((p,i) => (
                <Reveal key={p.name} delay={Math.min(i*.05,.2)}>
                  <motion.article className="product-card" whileHover={{y:-7}} transition={{duration:.3}}>
                    <div className="photo"><img src={p.image} alt={p.name}/></div>
                    <div className="meta">
                      <div><h3>{p.name}</h3><p>{p.subtitle} · {p.description}</p></div>
                      <span className="circle-arrow"><ArrowDownRight size={16}/></span>
                    </div>
                  </motion.article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="contacto" className="newsletter">
          <div className="container">
            <Reveal>
              <span className="eyebrow">Círculo Auréa</span>
              <h2>Cuida tu piel.<br/>Mantente conectado.</h2>
              <p>Recibe 15% de descuento en tu primera compra, novedades de temporada y consejos de cuidado sin ruido.</p>
              <form className="news-form" onSubmit={(e) => { e.preventDefault(); setSubscribed(true); }}>
                <input type="email" required placeholder="Ingresa tu correo electrónico" aria-label="Correo electrónico"/>
                <button className="btn btn-primary" type="submit">{subscribed ? "Suscrito" : "Suscribirme"}</button>
              </form>
              <div className="news-benefits">
                {[
                  ["15% OFF","en tu primera compra"],["Rituales","consejos de temporada"],["Guías","rutinas exclusivas"],["Novedades","solo para suscriptores"]
                ].map(([a,b]) => <div className="news-benefit" key={a}><strong>{a}</strong><span>{b}</span></div>)}
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-top">
          <div className="footer-brand">
            <a className="brand" href="#inicio"><span className="brand-mark"><Leaf strokeWidth={1.4}/></span><span className="brand-copy"><strong>AURÉA</strong><small>Skincare botánico</small></span></a>
            <p>Ingredientes reales, fórmulas conscientes y rituales simples para una piel saludable y luminosa.</p>
          </div>
          <div className="footer-col"><h4>Explorar</h4><a href="#coleccion">Colección</a><a href="#rituales">Rituales</a><a href="#ingredientes">Ingredientes</a><a href="#filosofia">Nuestra historia</a></div>
          <div className="footer-col"><h4>Ayuda</h4><a href="#contacto">Preguntas frecuentes</a><a href="#contacto">Envíos y entregas</a><a href="#contacto">Políticas</a><a href="#contacto">Contacto</a></div>
          <div className="footer-col"><h4>Síguenos</h4><a href="#contacto"><Instagram size={15} style={{verticalAlign:"middle",marginRight:7}}/> Instagram</a><a href="#contacto"><Facebook size={15} style={{verticalAlign:"middle",marginRight:7}}/> Facebook</a><a href="#contacto"><Sparkles size={15} style={{verticalAlign:"middle",marginRight:7}}/> Diario Auréa</a></div>
        </div>
        <div className="container footer-bottom">
          <div className="big-brand">AURÉA</div>
          <p>© 2026 Auréa Skincare Botánico. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
