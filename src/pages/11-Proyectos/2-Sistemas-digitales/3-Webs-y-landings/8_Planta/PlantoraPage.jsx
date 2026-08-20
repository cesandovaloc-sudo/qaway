import React, { useState, useEffect } from "react";
import {
  Search, Heart, ShoppingBag, ArrowRight, Truck, ShieldCheck, Sprout,
  Headphones, Star, ChevronDown, Instagram, Facebook, Menu, X, Plus
} from "lucide-react";
import "./plantora-landing.css";

const IMG = {
  hero: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=85",
  interior: "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=700&q=85",
  hanging: "https://images.unsplash.com/photo-1525498128493-380d1990a112?auto=format&fit=crop&w=700&q=85",
  succulent: "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=700&q=85",
  pot: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=700&q=85",
  calathea: "https://images.unsplash.com/photo-1593691509543-c55fb32e5cee?auto=format&fit=crop&w=900&q=85",
  fern: "https://images.unsplash.com/photo-1614594576337-3f1b3f8c5f88?auto=format&fit=crop&w=700&q=85",
  sansevieria: "https://images.unsplash.com/photo-1593482892290-f54927ae1bb6?auto=format&fit=crop&w=700&q=85",
  monstera: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=700&q=85",
  story: "https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=1200&q=85",
  care: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1000&q=85"
};

const categories = [
  ["Plantas de interior", "32 opciones", IMG.interior],
  ["Plantas colgantes", "18 opciones", IMG.hanging],
  ["Suculentas", "25 opciones", IMG.succulent],
  ["Macetas", "14 opciones", IMG.pot],
  ["Accesorios", "11 opciones", IMG.care]
];

const products = [
  ["Potos", "Epipremnum aureum", "S/ 39.90", IMG.interior],
  ["Calathea Orbifolia", "Calathea orbifolia", "S/ 56.90", IMG.calathea],
  ["Sansevieria Laurentii", "Sansevieria trifasciata", "S/ 49.90", IMG.sansevieria],
  ["Helecho Boston", "Nephrolepis exaltata", "S/ 44.90", IMG.fern],
  ["Zamioculca", "Zamioculcas zamiifolia", "S/ 54.90", IMG.monstera]
];

function SectionTitle({title,link}){return <div className="section-title"><h2>{title}</h2><a href="#plantas">{link} <ArrowRight size={16}/></a></div>}
function Review({text,name}){return <article className="review"><div className="stars">{[1,2,3,4,5].map(x=><Star key={x} size={15} fill="currentColor"/>)}</div><p>"{text}"</p><b>{name}</b><small>Cliente verificado</small></article>}

export default function PlantoraPage(){
  const [menu, setMenu] = useState(false);
  const [cart, setCart] = useState(0);
  const [faq, setFaq] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const add = () => setCart(c => c + 1);

  return <div className="plantora-landing"><div className="site">
    <header className="header">
      <a className="brand" href="#inicio"><span className="brand-mark">⌁</span> plantora</a>
      <nav className={menu ? "nav open" : "nav"}>
        <a href="#inicio" onClick={()=>setMenu(false)}>Inicio</a>
        <a href="#categorias" onClick={()=>setMenu(false)}>Tienda</a>
        <a href="#plantas" onClick={()=>setMenu(false)}>Plantas</a>
        <a href="#cuidados" onClick={()=>setMenu(false)}>Cuidado</a>
        <a href="#nosotros" onClick={()=>setMenu(false)}>Nosotros</a>
      </nav>
      <div className="header-actions">
        <div className="search"><Search size={17}/><input placeholder="Buscar plantas, macetas..." /></div>
        <button aria-label="Favoritos"><Heart size={20}/></button>
        <button className="cart" aria-label="Carrito"><ShoppingBag size={20}/>{cart>0 && <b>{cart}</b>}</button>
        <button className="menu-btn" onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button>
      </div>
    </header>

    <main id="inicio">
      <section className="hero">
        <div className="shape shape-a"></div><div className="shape shape-b"></div><div className="dot-grid"></div>
        <div className="hero-copy">
          <span className="eyebrow">Buenos días · 🌿</span>
          <h1>Convierte tu espacio<br/>en un <em>lugar más vivo.</em></h1>
          <p>Plantas de interior seleccionadas para aportar bienestar, naturalidad y personalidad a tu hogar.</p>
          <a className="primary" href="#plantas">Explorar plantas <ArrowRight size={18}/></a>
        </div>
        <div className="hero-media">
          <div className="hero-blob"></div>
          <img src={IMG.hero} alt="Planta de interior en maceta" />
          <div className="shipping-badge"><small>Envíos</small><strong>24h</strong><span>a todo el país</span></div>
        </div>
      </section>

      <section className="trust">
        <div><Truck/><span><b>Envíos rápidos</b><small>24–48h a todo el país</small></span></div>
        <div><Sprout/><span><b>Plantas sanas</b><small>Seleccionadas a mano</small></span></div>
        <div><ShieldCheck/><span><b>Pago seguro</b><small>100% protegido</small></span></div>
        <div><Headphones/><span><b>Atención personalizada</b><small>Te ayudamos a elegir</small></span></div>
      </section>

      <section className="section" id="categorias">
        <SectionTitle title="Explora por categoría" link="Ver todas"/>
        <div className="category-grid">
          {categories.map(([name,count,img])=><a className="category" href="#plantas" key={name}>
            <img src={img} alt={name}/><div><b>{name}</b><span>{count}</span></div>
          </a>)}
        </div>
      </section>

      <section className="section" id="plantas">
        <SectionTitle title="Recomendadas para ti" link="Ver todas"/>
        <div className="products">
          {products.map(([name,latin,price,img])=><article className="product" key={name}>
            <button className="heart"><Heart size={19}/></button>
            <img src={img} alt={name}/>
            <div className="product-info"><b>{name}</b><small>{latin}</small><strong>{price}</strong></div>
            <button className="add" onClick={add}><Plus size={17}/></button>
          </article>)}
        </div>
      </section>

      <section className="feature">
        <div className="feature-shape"></div>
        <div className="feature-img"><img src={IMG.calathea} alt="Calathea Orbifolia"/></div>
        <div className="feature-copy">
          <span className="eyebrow">Planta destacada</span>
          <h2>Calathea Orbifolia</h2>
          <p>Hojas grandes, gráficas y llenas de personalidad. Una elección ideal para interiores con luz indirecta.</p>
          <div className="care-mini"><span>☼<b>Luz indirecta</b><small>Ideal</small></span><span>♨<b>Riego</b><small>1 vez/semana</small></span><span>◌<b>Humedad</b><small>Media</small></span></div>
          <div className="price-row"><strong>S/ 56.90</strong><button className="primary" onClick={add}>Agregar al carrito <ShoppingBag size={17}/></button></div>
        </div>
      </section>

      <section className="section guide" id="cuidados">
        <SectionTitle title="Encuentra la planta ideal para ti" link="Ver guía"/>
        <div className="guide-grid">
          <div className="guide-card"><span>01</span><h3>¿Cuánta luz tienes?</h3><p>Te ayudamos a encontrar especies que se adapten realmente a tu espacio.</p><a href="#plantas">Ver plantas <ArrowRight size={16}/></a></div>
          <div className="guide-card"><span>02</span><h3>¿Cuánto tiempo tienes?</h3><p>Desde plantas muy fáciles de cuidar hasta opciones para amantes de la jardinería.</p><a href="#plantas">Encontrar la mía <ArrowRight size={16}/></a></div>
          <div className="guide-photo"><img src={IMG.care} alt="Cuidado de plantas"/><div><b>Aprende a cuidar tus plantas</b><span>Consejos simples para que crezcan mejor.</span></div></div>
        </div>
      </section>

      <section className="story" id="nosotros">
        <div className="story-img"><img src={IMG.story} alt="Espacio con plantas"/></div>
        <div className="story-copy"><span className="eyebrow">Nuestra forma de hacer las cosas</span><h2>No vendemos solo plantas.<br/><em>Elegimos vida para tus espacios.</em></h2><p>Seleccionamos especies, macetas y accesorios pensando en cómo van a vivir juntos en tu hogar. Menos catálogo. Más criterio.</p><a className="text-link" href="#contacto">Conoce Plantora <ArrowRight size={17}/></a></div>
      </section>

      <section className="reviews">
        <div className="reviews-head"><span className="eyebrow">Lo que dicen nuestros clientes</span><h2>Espacios más vivos,<br/><em>experiencias más naturales.</em></h2></div>
        <div className="review-grid">
          <Review text="La planta llegó impecable y la guía de cuidados me ayudó muchísimo." name="Mariana R."/>
          <Review text="Me gustó poder elegir según la luz de mi departamento. Muy fácil." name="Diego M."/>
          <Review text="La presentación y el servicio se sienten mucho más cuidados que una tienda tradicional." name="Lucía P."/>
        </div>
      </section>

      <section className="faq section">
        <SectionTitle title="Preguntas frecuentes" link="Ver todas"/>
        <div className="faq-list">
          {[
            ["¿Cuánto tarda mi pedido?","Los pedidos se entregan normalmente entre 24 y 48 horas, según destino y disponibilidad."],
            ["¿Cómo sé qué planta elegir?","Puedes usar nuestra guía de luz y tiempo de cuidado o escribirnos para recibir una recomendación."],
            ["¿Las plantas llegan protegidas?","Sí. Cada planta se prepara para minimizar movimientos y daños durante el transporte."],
            ["¿Qué pasa si mi planta llega dañada?","Contáctanos con fotografías del pedido y revisaremos el caso contigo."]
          ].map(([q,a],i)=><div className="faq-item" key={q}><button onClick={()=>setFaq(faq===i?null:i)}><b>{q}</b><ChevronDown className={faq===i?"rot":""}/></button>{faq===i&&<p>{a}</p>}</div>)}
        </div>
      </section>

      <section className="newsletter">
        <div><span className="eyebrow">El club Plantora</span><h2>Ideas para hacer tu espacio<br/><em>más vivo.</em></h2><p>Consejos de cuidado, novedades y selecciones de plantas directamente en tu correo.</p></div>
        <form onSubmit={e=>e.preventDefault()}><input type="email" placeholder="Tu correo electrónico"/><button className="primary">Suscribirme <ArrowRight size={17}/></button><small>No enviamos spam. Puedes cancelar cuando quieras.</small></form>
      </section>
    </main>

    <footer id="contacto">
      <div className="footer-main">
        <div><a className="brand" href="#inicio"><span className="brand-mark">⌁</span> plantora</a><p>Plantas seleccionadas para hacer tus espacios más vivos.</p><div className="social"><Instagram/><Facebook/></div></div>
        <div><b>Tienda</b><a href="#plantas">Plantas</a><a href="#categorias">Categorías</a><a href="#plantas">Más vendidas</a><a href="#plantas">Novedades</a></div>
        <div><b>Ayuda</b><a href="#cuidados">Guía de plantas</a><a href="#contacto">Envíos y entregas</a><a href="#contacto">Cambios y devoluciones</a><a href="#contacto">Contacto</a></div>
        <div><b>Información</b><a href="#nosotros">Nosotros</a><a href="#faq">Preguntas frecuentes</a><a href="#contacto">Privacidad</a><a href="#contacto">Términos</a></div>
      </div>
      <div className="footer-bottom"><span>© 2026 Plantora</span><span>Pago seguro · Compra protegida</span></div>
    </footer>
  </div></div>
}
