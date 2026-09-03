import React, { useState } from 'react';
import {
  ArrowRight, BedDouble, Building2, ChevronDown, Facebook, Instagram, Linkedin, Mail, Menu, MessageCircle,
  Phone, Ruler, ShieldCheck, X, BadgeCheck, CalendarDays, FileText, Handshake, House, KeyRound, MapPin, Search, Users, WalletCards
} from 'lucide-react';
import SEO from '@/components/seo/SEO';
import './vallet-inmobiliaria.css';

// Assets locales
import logo from './vallet-web/src/assets/vallet-logo.png';
import heroImage from './vallet-web/src/assets/hero-interior.jpg';
import consultationImage from './vallet-web/src/assets/consultation-interior.jpg';
import contactImage from './vallet-web/src/assets/contact-interior.jpg';
import miraflores from './vallet-web/src/assets/property-miraflores.jpg';
import sanIsidro from './vallet-web/src/assets/property-san-isidro.jpg';
import laMolina from './vallet-web/src/assets/property-la-molina.jpg';

const properties = [
  { type: 'VENTA', title: 'Departamento en Miraflores', location: 'Miraflores, Lima', bedrooms: 2, bathrooms: 2, area: '90 m²', price: 'S/ 680,000', image: miraflores },
  { type: 'ALQUILER', title: 'Departamento en San Isidro', location: 'San Isidro, Lima', bedrooms: 3, bathrooms: 2, area: '120 m²', price: 'S/ 4,500 / mes', image: sanIsidro },
  { type: 'VENTA', title: 'Casa en La Molina', location: 'La Molina, Lima', bedrooms: 4, bathrooms: 3, area: '250 m²', price: 'S/ 1,250,000', image: laMolina },
];

const benefits = [
  { icon: ShieldCheck, title: 'Compra segura', body: 'Te acompañamos en todo el proceso para que inviertas con tranquilidad.' },
  { icon: Search, title: 'Alquiler sin complicaciones', body: 'Encontramos el espacio ideal para ti con contratos claros y propietarios confiables.' },
  { icon: WalletCards, title: 'Mejor precio del mercado', body: 'Negociamos por ti para que obtengas las mejores condiciones.' },
  { icon: FileText, title: 'Transparencia total', body: 'Información clara, documentos en regla y cero sorpresas.' },
];

const process = [
  { number: '1', icon: Users, title: 'Cuéntanos qué necesitas', body: 'Entendemos tus objetivos y preferencias.' },
  { number: '2', icon: House, title: 'Te mostramos opciones', body: 'Seleccionamos propiedades que se ajustan a ti.' },
  { number: '3', icon: MapPin, title: 'Visitamos y evaluamos', body: 'Te acompañamos en las visitas y resolvemos tus dudas.' },
  { number: '4', icon: Handshake, title: 'Cerramos el trato', body: 'Negociamos y gestionamos todo hasta la firma.' },
];

const testimonials = [
  { quote: 'Gracias a Vallet encontré el departamento perfecto. Me acompañaron en todo el proceso y siempre fueron muy claros.', name: 'Andrea R.', place: 'Miraflores' },
  { quote: 'Alquilé mi propiedad rápidamente y al mejor precio. Su servicio es 100% recomendable.', name: 'Carlos M.', place: 'San Isidro' },
  { quote: 'Profesionales y muy atentos. Me ayudaron a tomar la mejor decisión para mi inversión.', name: 'Mariana L.', place: 'La Molina' },
];

const stats = [
  { icon: Users, value: '+350', label: 'Clientes satisfechos' },
  { icon: House, value: '+500', label: 'Propiedades asesoradas' },
  { icon: CalendarDays, value: '+8', label: 'Años de experiencia en el mercado' },
  { icon: BadgeCheck, value: '100%', label: 'Compromiso y transparencia' },
];

const consultationPoints = [
  { icon: ShieldCheck, title: 'Respuesta rápida', body: 'Te respondemos en menos de 30 minutos durante nuestro horario de atención.' },
  { icon: KeyRound, title: 'Confidencialidad garantizada', body: 'Tu información está protegida y será utilizada únicamente para ayudarte.' },
  { icon: Handshake, title: 'Asesoría sin compromiso', body: 'Recibe orientación profesional sin compromiso de compra o contratación.' },
];

export default function ValletInmobiliariaPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  const handleScrollToTop = (e) => {
    if (e) e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  return (
    <div className="vallet-landing site-shell" id="inicio">
      <SEO
        title="Vallet Inmobiliaria | Asesoría Inmobiliaria Personalizada en Lima"
        description="Te acompañamos en la compra, venta o alquiler de propiedades en Lima con total transparencia, seguridad y atención directa."
        canonical="https://qawaylab.com/proyectos/vallet-inmobiliaria"
      />
      <header className="site-header">
        <a className="brand" href="#inicio" onClick={handleScrollToTop} aria-label="Vallet inicio">
          <img src={logo} alt="Vallet Asesoría Inmobiliaria" />
        </a>
        <nav className={menuOpen ? 'nav open' : 'nav'} aria-label="Navegación principal">
          {['Inicio', 'Servicios', 'Propiedades', 'Nosotros', 'Contacto'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMenuOpen(false)}>
              {item}
            </a>
          ))}
          <a className="header-cta" href="#contacto">Quiero asesoría <ArrowRight size={17}/></a>
        </nav>
        <button className="menu-button" aria-label="Abrir menú" onClick={() => setMenuOpen((v) => !v)}>
          {menuOpen ? <X size={24}/> : <Menu size={24}/>}
        </button>
      </header>

      <main>
        <section className="hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(0,40,46,.98) 0%, rgba(0,40,46,.84) 34%, rgba(0,40,46,.24) 70%), url(${heroImage})` }}>
          <div className="container hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">ASESORÍA INMOBILIARIA PERSONALIZADA</span>
              <h1>Encontramos<br/>el lugar ideal<br/><em>para ti.</em></h1>
              <p>Te acompañamos en la compra, venta o alquiler de propiedades con total transparencia, seguridad y atención directa.</p>
              <div className="hero-points">
                {[
                  ['Asesoría', 'personalizada', 'person'],
                  ['Propiedades', 'verificadas', 'building'],
                  ['Acompañamiento', 'integral', 'shield'],
                  ['Confidencialidad', 'y confianza', 'user']
                ].map(([a,b,c]) => (
                  <div className="hero-point" key={c}>
                    <span className="point-icon">
                      {c === 'building' ? <Building2/> : c === 'shield' ? <ShieldCheck/> : c === 'user' ? <ShieldCheck/> : <MessageCircle/>}
                    </span>
                    <span>{a}<br/>{b}</span>
                  </div>
                ))}
              </div>
              <div className="hero-actions">
                <a className="button button-outline" href="https://wa.me/51987654321" target="_blank" rel="noreferrer">
                  <MessageCircle size={19}/> Habla con un asesor
                </a>
                <a className="text-link" href="#servicios">Conocer más <ArrowRight size={18}/></a>
              </div>
            </div>
            <LeadForm compact submitted={submitted} onSubmit={submit} />
          </div>
        </section>

        <section id="servicios" className="benefits section-light">
          <div className="container">
            <SectionHeading title={<>Te ayudamos a tomar las <strong>mejores decisiones</strong></>} />
            <div className="benefit-grid">
              {benefits.map(({icon: Icon, title, body}) => (
                <article className="benefit" key={title}>
                  <span className="icon-disc"><Icon/></span>
                  <div>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="propiedades" className="properties section-dark">
          <div className="container">
            <div className="section-top">
              <h2>Propiedades <strong>destacadas</strong></h2>
              <a href="#contacto">Ver todas las propiedades <ArrowRight size={17}/></a>
            </div>
            <div className="property-grid">
              {properties.map((property) => (
                <article className="property-card" key={property.title}>
                  <div className="property-image">
                    <img src={property.image} alt={property.title}/>
                    <span className={`tag ${property.type === 'ALQUILER' ? 'tag-rent' : ''}`}>{property.type}</span>
                  </div>
                  <div className="property-body">
                    <h3>{property.title}</h3>
                    <p className="location">⌖ {property.location}</p>
                    <div className="property-meta">
                      <span><BedDouble size={15}/> {property.bedrooms}</span>
                      <span><Building2 size={15}/> {property.bathrooms}</span>
                      <span><Ruler size={15}/> {property.area}</span>
                    </div>
                    <div className="property-bottom">
                      <strong>{property.price}</strong>
                      <a href="#contacto">Ver detalles <ArrowRight size={16}/></a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="process section-dark process-section">
          <div className="container">
            <SectionHeading dark title={<>Nuestro proceso es <strong>simple y eficiente</strong></>} />
            <div className="process-grid">
              {process.map(({number, icon:Icon, title, body}) => (
                <article className="process-item" key={number}>
                  <div className="process-marker">
                    <b>{number}</b>
                    <span><Icon/></span>
                  </div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="stats section-light">
          <div className="container">
            <SectionHeading title={<>Resultados que nos respaldan</>} />
            <div className="stats-grid">
              {stats.map(({icon:Icon,value,label}) => (
                <article key={label} className="stat">
                  <span className="icon-disc"><Icon/></span>
                  <div>
                    <strong>{value}</strong>
                    <p>{label}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="nosotros" className="testimonials section-dark">
          <div className="container">
            <SectionHeading dark title={<>Lo que dicen <strong>nuestros clientes</strong></>} />
            <div className="testimonial-grid">
              {testimonials.map((t) => (
                <article className="testimonial" key={t.name}>
                  <span className="quote">“</span>
                  <p>{t.quote}</p>
                  <strong>— {t.name}</strong>
                  <small>{t.place}</small>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="contact-cta">
          <div className="container contact-card">
            <div className="contact-copy">
              <span className="eyebrow">¿LISTO PARA DAR EL SIGUIENTE PASO?</span>
              <h2>Hablemos de tu próxima<br/>propiedad o inversión.</h2>
              <p>Déjanos tus datos o escríbenos directamente. Estamos para ayudarte.</p>
              <div className="cta-row">
                <a className="button button-dark" href="https://wa.me/51987654321" target="_blank" rel="noreferrer">
                  <MessageCircle size={18}/> Escríbenos por WhatsApp
                </a>
                <a className="button button-outline-dark" href="tel:+51987654321">
                  <Phone size={18}/> Llámanos ahora
                </a>
              </div>
            </div>
            <img src={contactImage} alt="Interior de una propiedad al atardecer"/>
          </div>
        </section>

        <section id="contacto" className="consultation section-light">
          <div className="container consultation-grid">
            <div className="consultation-copy">
              <span className="eyebrow">ESTAMOS PARA AYUDARTE</span>
              <h2>Escríbenos y recibe<br/>asesoría personalizada</h2>
              <p>Cuéntanos qué necesitas y uno de nuestros asesores se contactará contigo en menos de 30 minutos.</p>
              <div className="consultation-layout">
                <div>
                  {consultationPoints.map(({icon:Icon,title,body}) => (
                    <div className="consultation-point" key={title}>
                      <span className="icon-disc"><Icon/></span>
                      <div>
                        <h3>{title}</h3>
                        <p>{body}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <img src={consultationImage} alt="Asesoría inmobiliaria en un espacio residencial"/>
              </div>
            </div>
            <LeadForm submitted={submitted} onSubmit={submit} />
          </div>
          <div className="container info-strip">
            <h3>Información importante</h3>
            <Info title="Horario de atención">Lunes a viernes de 9:00 a. m. a 7:00 p. m.<br/>Sábados de 9:00 a. m. a 1:00 p. m.</Info>
            <Info title="Cobertura">Atendemos en los principales distritos de Lima Metropolitana.</Info>
            <Info title="Documentación">Te orientamos sobre los documentos necesarios para cada tipo de transacción.</Info>
            <Info title="Canales de atención">WhatsApp, llamada o correo. Elige el canal que prefieras.</Info>
          </div>
          <div className="registered">
            <ShieldCheck size={18}/> Somos una empresa registrada y contamos con asesores inmobiliarios colegiados.
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <img src={logo} alt="Vallet" className="footer-logo"/>
            <p>Te acompañamos en la compra, venta o alquiler de propiedades con total transparencia, seguridad y atención directa.</p>
            <div className="socials">
              <a href="#" aria-label="Facebook"><Facebook size={18}/></a>
              <a href="#" aria-label="Instagram"><Instagram size={18}/></a>
              <a href="#" aria-label="Linkedin"><Linkedin size={18}/></a>
              <a href="#" aria-label="WhatsApp"><MessageCircle size={18}/></a>
            </div>
          </div>
          <FooterNav title="Navegación" items={['Inicio','Servicios','Propiedades','Nosotros','Contacto']}/>
          <FooterNav title="Servicios" items={['Compra de propiedades','Alquiler de propiedades','Asesoría personalizada','Acompañamiento integral','Gestión legal y documentación']}/>
          <div>
            <h3>Contacto</h3>
            <p className="contact-line"><Phone size={15}/> +51 987 654 321</p>
            <p className="contact-line"><Mail size={15}/> hola@valletinmobiliaria.com</p>
            <p className="contact-line"><Building2 size={15}/> Av. Javier Prado Este 1234, Oficina 501<br/>San Isidro, Lima</p>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>© 2026 Vallet Inmobiliaria. Todos los derechos reservados.</span>
          <span>Política de privacidad &nbsp; | &nbsp; Términos y condiciones</span>
        </div>
      </footer>
    </div>
  );
}

function SectionHeading({ title, dark=false }) {
  return (
    <div className={`section-heading ${dark ? 'dark' : ''}`}>
      <h2>{title}</h2>
      <span/>
    </div>
  );
}

function Info({ title, children }) {
  return (
    <div className="info-item">
      <h4>{title}</h4>
      <p>{children}</p>
    </div>
  );
}

function FooterNav({ title, items }) {
  return (
    <div>
      <h3>{title}</h3>
      {items.map(i => (
        <a className="footer-link" href={`#${i.toLowerCase()}`} key={i}>{i}</a>
      ))}
    </div>
  );
}

function LeadForm({ compact=false, submitted, onSubmit }) {
  return (
    <form className={`lead-form ${compact ? 'compact' : ''}`} onSubmit={onSubmit}>
      <div className="form-rule"/>
      <h2>{compact ? 'Recibe asesoría personalizada' : 'Cuéntanos tu consulta'}</h2>
      <p>{compact ? 'Cuéntanos qué necesitas y uno de nuestros asesores te contactará.' : 'Completa el formulario y te contactaremos para ayudarte a tomar la mejor decisión.'}</p>
      
      <label>
        <input required name="name" placeholder="Nombre completo" autoComplete="name"/>
      </label>
      <label>
        <input required name="phone" placeholder="Teléfono / WhatsApp" autoComplete="tel"/>
      </label>
      <label>
        <input name="email" type="email" placeholder="Correo electrónico" autoComplete="email"/>
      </label>
      
      {compact ? (
        <label className="select-like">
          <select name="need" defaultValue="">
            <option value="" disabled>¿Qué estás buscando?</option>
            <option>Comprar una propiedad</option>
            <option>Alquilar una propiedad</option>
            <option>Vender una propiedad</option>
            <option>Asesoría de inversión</option>
          </select>
          <ChevronDown size={18}/>
        </label>
      ) : (
        <label>
          <textarea name="message" rows={4} placeholder="Cuéntanos qué estás buscando o tu consulta"/>
        </label>
      )}

      <button className="form-button" type="submit">
        {submitted ? 'Solicitud recibida ✓' : compact ? 'Quiero asesoría' : 'Quiero recibir asesoría'} <ArrowRight size={18}/>
      </button>
      <small><ShieldCheck size={15}/> Tu información está 100% segura y confidencial</small>
    </form>
  );
}
