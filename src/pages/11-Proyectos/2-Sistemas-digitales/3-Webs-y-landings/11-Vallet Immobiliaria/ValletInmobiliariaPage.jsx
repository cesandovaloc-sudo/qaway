import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, BedDouble, Building2, ChevronDown, ChevronLeft, ChevronRight, Facebook, Instagram, Linkedin, Mail, Menu, MessageCircle,
  Phone, Ruler, ShieldCheck, X, BadgeCheck, CalendarDays, FileText, Handshake, House, KeyRound, MapPin, Search, Users, WalletCards
} from 'lucide-react';
import SEO from '@/components/seo/SEO';
import DemoFloatingBadge from '@/components/ui/DemoFloatingBadge';
import { valletProperties } from './valletPropertiesData';
import { useValletReveal } from './useValletReveal';
import './vallet-inmobiliaria.css';

// Assets locales
import logo from './ChatGPT Image 3 sept 2026, 11_47_38.png';
import logoWhite from './ChatGPT Image 3 sept 2026, 12_41_06.png';
import heroImage from './hero.webp';
import consultationImage from './vallet-web/src/assets/consultation-interior.webp';
import contactImage from './vallet-web/src/assets/contact-interior.webp';

function PropertyImageCarousel({ images, alt, type, slug }) {
  const imageList = Array.isArray(images) && images.length > 0 ? images : [images].filter(Boolean);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (imageList.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % imageList.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [imageList.length, currentIndex]);

  const handlePrev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + imageList.length) % imageList.length);
  };

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % imageList.length);
  };

  const handleDotClick = (e, idx) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex(idx);
  };

  return (
    <div className="property-image">
      {imageList.map((img, idx) => (
        <img
          key={idx}
          src={img}
          alt={`${alt} vista ${idx + 1}`}
          className={`property-carousel-slide ${idx === currentIndex ? 'active' : ''}`}
          loading={idx === 0 ? 'eager' : 'lazy'}
          decoding="async"
        />
      ))}
      <span className={`tag ${type === 'ALQUILER' ? 'tag-rent' : ''}`}>{type}</span>

      {imageList.length > 1 && (
        <>
          <button
            type="button"
            className="property-carousel-btn property-carousel-prev"
            onClick={handlePrev}
            aria-label="Foto anterior"
          >
            <ChevronLeft size={16} strokeWidth={2.4} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="property-carousel-btn property-carousel-next"
            onClick={handleNext}
            aria-label="Siguiente foto"
          >
            <ChevronRight size={16} strokeWidth={2.4} aria-hidden="true" />
          </button>
          <div className="property-carousel-dots" aria-label="Navegación de fotos">
            {imageList.map((_, idx) => (
              <button
                type="button"
                key={idx}
                onClick={(e) => handleDotClick(e, idx)}
                className={`property-carousel-dot ${idx === currentIndex ? 'active' : ''}`}
                aria-label={`Ir a foto ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const properties = valletProperties;

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

  useValletReveal();

  const submit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const name = formData.get('name') || '';
    const phone = formData.get('phone') || '';
    const email = formData.get('email') || '';
    const need = formData.get('need') || formData.get('message') || 'Asesoría inmobiliaria';

    const msg = `Hola Qaway Lab, vi la demo del ecosistema inmobiliario Vallet.\n\n*Datos de contacto:*\n• Nombre: ${name}\n• Teléfono: ${phone}\n• Correo: ${email}\n• Interés: ${need}\n\nMe gustaría cotizar una solución digital similar para mi negocio.`;

    setSubmitted(true);
    window.open(`https://wa.me/51930756781?text=${encodeURIComponent(msg)}`, '_blank');
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
        canonical="https://qawaylab.com/proyectos/vallet"
        image="https://qawaylab.com/assets/miraflores1.webp"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'RealEstateAgent',
          name: 'Vallet Asesoría Inmobiliaria',
          description: 'Asesoría inmobiliaria personalizada para compra, venta y alquiler de inmuebles en Lima.',
          url: 'https://qawaylab.com/proyectos/vallet',
          telephone: '+51930756781',
          areaServed: 'Lima Metropolitana, Perú',
          priceRange: 'S/ 2,000 - S/ 15,000',
        }}
      />
      <DemoFloatingBadge backTo="/proyectos" label="Volver a proyectos" threshold={140} />
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
                ].map(([a,b,c], idx) => (
                  <div className={`hero-point vallet-reveal reveal-delay-${idx + 1}`} key={c}>
                    <span className="point-icon">
                      {c === 'building' ? <Building2/> : c === 'shield' ? <ShieldCheck/> : c === 'user' ? <ShieldCheck/> : <MessageCircle/>}
                    </span>
                    <span>{a}<br/>{b}</span>
                  </div>
                ))}
              </div>
              <div className="hero-actions">
                <Link to="/proyectos/vallet/propiedades" className="button button-outline">
                  <Search size={19}/> Ver catálogo
                </Link>
                <a href="#propiedades" className="text-link">
                  Propiedades destacadas <ArrowRight size={18}/>
                </a>
              </div>
            </div>
            <LeadForm compact submitted={submitted} onSubmit={submit} />
          </div>
        </section>

        <section id="servicios" className="benefits section-light">
          <div className="container">
            <SectionHeading title={<>Te ayudamos a tomar las <strong>mejores decisiones</strong></>} />
            <div className="benefit-grid">
              {benefits.map(({icon: Icon, title, body}, idx) => (
                <article className={`benefit vallet-reveal reveal-delay-${(idx % 4) + 1}`} key={title}>
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
            <div className="section-top vallet-reveal">
              <h2>Propiedades <strong>destacadas</strong></h2>
              <Link to="/proyectos/vallet/propiedades">Ver todas las propiedades <ArrowRight size={17}/></Link>
            </div>
            <div className="property-grid">
              {properties.map((property, idx) => (
                <article className={`property-card vallet-reveal reveal-delay-${(idx % 3) + 1}`} key={property.title}>
                  <PropertyImageCarousel
                    images={property.images || property.image}
                    alt={property.title}
                    type={property.type}
                  />
                  <div className="property-body">
                    <h3>
                      <Link to={`/proyectos/vallet/propiedad/${property.slug}`}>
                        {property.title}
                      </Link>
                    </h3>
                    <p className="location">⌖ {property.location}</p>
                    <div className="property-meta">
                      <span><BedDouble size={15}/> {property.bedrooms}</span>
                      <span><Building2 size={15}/> {property.bathrooms}</span>
                      <span><Ruler size={15}/> {property.area}</span>
                    </div>
                    <div className="property-bottom">
                      <strong>{property.price}</strong>
                      <Link to={`/proyectos/vallet/propiedad/${property.slug}`} className="property-detail-btn">
                        Ver detalles <ArrowRight size={16}/>
                      </Link>
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
              {process.map(({number, icon:Icon, title, body}, idx) => (
                <article className={`process-item vallet-reveal reveal-delay-${idx + 1}`} key={number}>
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
              {stats.map(({icon:Icon,value,label}, idx) => (
                <article key={label} className={`stat vallet-reveal reveal-delay-${idx + 1}`}>
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
              {testimonials.map((t, idx) => (
                <article className={`testimonial vallet-reveal reveal-delay-${idx + 1}`} key={t.name}>
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
          <div className="container contact-card vallet-reveal">
            <div className="contact-copy">
              <span className="eyebrow">¿LISTO PARA DAR EL SIGUIENTE PASO?</span>
              <h2>Hablemos de tu próxima<br/>propiedad o inversión.</h2>
              <p>Déjanos tus datos o escríbenos directamente. Estamos para ayudarte.</p>
              <div className="cta-row">
                <a
                  className="button button-dark"
                  href="https://wa.me/51930756781?text=Hola%20Qaway%20Lab,%20quiero%20cotizar%20un%20ecosistema%20digital%20como%20el%20de%20Vallet%20Inmobiliaria."
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle size={18}/> Escríbenos por WhatsApp
                </a>
                <a className="button button-outline-dark" href="tel:+51930756781">
                  <Phone size={18}/> Llámanos ahora
                </a>
              </div>
            </div>
            <img src={contactImage} alt="Interior de una propiedad al atardecer" loading="lazy" decoding="async"/>
          </div>
        </section>

        <section id="contacto" className="consultation section-light">
          <div className="container consultation-grid vallet-reveal">
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
            <img src={logoWhite} alt="Vallet" className="footer-logo"/>
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
            <p className="contact-line"><Phone size={15}/> +51 974 974 9741</p>
            <p className="contact-line"><Mail size={15}/> hola@valletinmobiliaria.com</p>
            <p className="contact-line"><Building2 size={15}/> Av. Javier Prado Este 951411<br/>San Isidro, Lima</p>
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
