import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, BedDouble, Building2, Calendar as CalendarIcon, CheckCircle2, ChevronLeft, ChevronRight,
  Clock, Copy, ExternalLink, Heart, KeyRound, MapPin, MessageCircle, Phone, Ruler,
  Share2, ShieldCheck, Sparkles, Star, Users, Wifi, Car, Tv, Sun, Wind, Dog, Check, X, Eye
} from 'lucide-react';
import SEO from '@/components/seo/SEO';
import { valletProperties } from './valletPropertiesData';
import logo from './ChatGPT Image 3 sept 2026, 11_47_38.png';
import logoWhite from './ChatGPT Image 3 sept 2026, 12_41_06.png';
import './vallet-inmobiliaria.css';
import './vallet-property-detail.css';

export default function ValletPropertyDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  // Find property by slug, or default to first property (Miraflores)
  const property = valletProperties.find((p) => p.slug === slug) || valletProperties[0];

  const [selectedVisitType, setSelectedVisitType] = useState('presencial'); // 'presencial' | 'virtual'
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('tarde'); // 'manana' | 'tarde'
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [activeModalPhoto, setActiveModalPhoto] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Generate tomorrow's default date string
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    setSelectedDate(dateStr);
  }, []);

  const handleShare = (e) => {
    e.preventDefault();
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `Mira esta propiedad en Vallet: ${property.title}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleWhatsAppBooking = (e) => {
    e.preventDefault();
    const typeText = selectedVisitType === 'presencial' ? 'Visita Presencial' : 'Recorrido Virtual 3D';
    const timeText = selectedTime === 'manana' ? 'Turno Mañana (10:00 - 13:00)' : 'Turno Tarde (14:30 - 18:00)';
    const text = encodeURIComponent(
      `Hola Vallet, deseo coordinar una *${typeText}* para la propiedad:\n\n` +
      `🏢 *${property.title}*\n` +
      `💰 *Precio:* ${property.price}\n` +
      `📅 *Fecha solicitada:* ${selectedDate || 'A coordinar'} (${timeText})\n` +
      `📍 *Ubicación:* ${property.location}\n\n` +
      `¿Tienen disponibilidad en ese horario?`
    );
    window.open(`https://wa.me/${property.agent.whatsapp}?text=${text}`, '_blank');
  };

  return (
    <div className="vallet-landing vallet-property-detail-page site-shell">
      <SEO
        title={`${property.title} | Vallet Asesoría Inmobiliaria`}
        description={`${property.tagline} Ubicado en ${property.location}. Precio: ${property.price}.`}
        canonical={`https://qawaylab.com/proyectos/vallet/propiedad/${property.slug}`}
        image={property.images[0]}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'Apartment',
          name: property.title,
          description: property.tagline,
          image: property.images,
          numberOfRooms: property.bedrooms,
          numberOfBathroomsTotal: property.bathrooms,
          floorSize: {
            '@type': 'QuantitativeValue',
            value: property.area,
            unitText: 'm²'
          },
          address: {
            '@type': 'PostalAddress',
            addressLocality: property.location,
            addressRegion: 'Lima',
            addressCountry: 'PE'
          },
          offers: {
            '@type': 'Offer',
            price: property.priceNumeric || 3000,
            priceCurrency: 'PEN',
            availability: 'https://schema.org/InStock',
            seller: {
              '@type': 'RealEstateAgent',
              name: 'Vallet Asesoría Inmobiliaria',
              telephone: '+51930756781'
            }
          }
        }}
      />

      {/* Header específico de la ficha */}
      <header className="site-header">
        <Link className="brand" to="/proyectos/vallet" aria-label="Vallet inicio">
          <img src={logo} alt="Vallet Asesoría Inmobiliaria" />
        </Link>
        <div className="header-nav-back">
          <Link to="/proyectos/vallet" className="back-link">
            <ArrowLeft size={16} /> <span>Volver a propiedades</span>
          </Link>
        </div>
        <a className="header-cta" href={`https://wa.me/${property.agent.whatsapp}`} target="_blank" rel="noreferrer">
          <MessageCircle size={17} /> Contactar asesor
        </a>
      </header>

      <main className="property-detail-main">
        <div className="container">
          
          {/* Breadcrumbs y Acciones */}
          <div className="detail-top-bar">
            <div className="detail-breadcrumbs">
              <Link to="/proyectos/vallet">Inicio</Link>
              <span>/</span>
              <Link to="/proyectos/vallet#propiedades">Propiedades</Link>
              <span>/</span>
              <span className="current">{property.title}</span>
            </div>
            <div className="detail-actions">
              <button type="button" className="action-btn" onClick={handleShare} aria-label="Compartir propiedad">
                {copiedLink ? <Check size={16} className="text-emerald-500" /> : <Share2 size={16} />}
                <span>{copiedLink ? '¡Enlace copiado!' : 'Compartir'}</span>
              </button>
              <button
                type="button"
                className={`action-btn ${isSaved ? 'saved' : ''}`}
                onClick={() => setIsSaved(!isSaved)}
                aria-label="Guardar en favoritos"
              >
                <Heart size={16} fill={isSaved ? '#f45116' : 'none'} color={isSaved ? '#f45116' : 'currentColor'} />
                <span>{isSaved ? 'Guardado' : 'Guardar'}</span>
              </button>
            </div>
          </div>

          {/* Título y Metadata Superior */}
          <div className="detail-header-block">
            <div className="detail-badge-row">
              <span className={`tag ${property.type === 'ALQUILER' ? 'tag-rent' : ''}`}>{property.type}</span>
              <span className="verified-pill">
                <ShieldCheck size={14} /> Inmueble Verificado Vallet
              </span>
            </div>
            <h1 className="detail-title">{property.title}</h1>
            <div className="detail-meta-bar">
              <span className="meta-item"><Star size={15} className="star-icon" fill="#f59e0b" color="#f59e0b" /> <strong>{property.rating}</strong> ({property.reviewsCount} reseñas)</span>
              <span className="meta-sep">•</span>
              <span className="meta-item"><MapPin size={15} /> {property.location}</span>
            </div>
          </div>

          {/* Mosaico de Galería Fotográfica (1 grande + 4 chicas) */}
          <section className="property-mosaic-grid">
            <div className="mosaic-main-photo" onClick={() => { setActiveModalPhoto(0); setGalleryModalOpen(true); }}>
              <img src={property.images[0]} alt={`${property.title} principal`} />
              <div className="photo-overlay">
                <span><Eye size={18} /> Ver foto principal</span>
              </div>
            </div>
            <div className="mosaic-sub-grid">
              {property.images.slice(1, 5).map((img, idx) => (
                <div
                  key={idx}
                  className="mosaic-sub-photo"
                  onClick={() => { setActiveModalPhoto(idx + 1); setGalleryModalOpen(true); }}
                >
                  <img src={img} alt={`${property.title} vista ${idx + 2}`} />
                  <div className="photo-overlay" />
                </div>
              ))}
            </div>
            <button
              type="button"
              className="view-all-photos-btn"
              onClick={() => { setActiveModalPhoto(0); setGalleryModalOpen(true); }}
            >
              <Eye size={16} /> Mostrar todas las {property.images.length} fotos
            </button>
          </section>

          {/* Layout Principal de 2 Columnas */}
          <div className="property-content-layout">
            
            {/* Columna Izquierda: Información Editorial */}
            <div className="property-info-column">
              
              {/* Resumen rápido de características */}
              <div className="property-spec-chips">
                <div className="spec-chip">
                  <Ruler size={18} />
                  <div>
                    <strong>{property.area}</strong>
                    <span>Área total</span>
                  </div>
                </div>
                <div className="spec-chip">
                  <BedDouble size={18} />
                  <div>
                    <strong>{property.bedrooms} Dormitorios</strong>
                    <span>Capacidad 2-4 personas</span>
                  </div>
                </div>
                <div className="spec-chip">
                  <Building2 size={18} />
                  <div>
                    <strong>{property.bathrooms} Baños</strong>
                    <span>1 Baño en suite</span>
                  </div>
                </div>
                <div className="spec-chip">
                  <Car size={18} />
                  <div>
                    <strong>1 Cochera</strong>
                    <span>Techada en sótano</span>
                  </div>
                </div>
              </div>

              {/* Ficha del Asesor Vallet Asignado */}
              <div className="agent-card-banner">
                <div className="agent-avatar">
                  <span>{property.agent.name.charAt(0)}</span>
                </div>
                <div className="agent-info">
                  <h3>Asesor asignado: <strong>{property.agent.name}</strong></h3>
                  <p>{property.agent.role} • {property.agent.experience}</p>
                  <span className="response-badge"><Clock size={13} /> Tiempo de respuesta: {property.agent.responseRate}</span>
                </div>
                <a
                  href={`https://wa.me/${property.agent.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="agent-contact-link"
                >
                  <MessageCircle size={16} /> Chat directo
                </a>
              </div>

              <hr className="detail-divider" />

              {/* Puntos destacados del inmueble */}
              <div className="detail-highlights-section">
                {property.highlights.map((h, idx) => (
                  <div className="highlight-row" key={idx}>
                    <div className="highlight-icon">
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <h4>{h.title}</h4>
                      <p>{h.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <hr className="detail-divider" />

              {/* Memoria descriptiva */}
              <div className="detail-description-section">
                <h3>Acerca de esta propiedad</h3>
                <div className="description-paragraphs">
                  {property.description.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>
              </div>

              <hr className="detail-divider" />

              {/* Recorrido por Ambientes */}
              <div className="detail-spaces-section">
                <h3>Distribución de ambientes</h3>
                <p className="section-subtext">Espacios diseñados para confort y funcionalidad diaria.</p>
                <div className="spaces-cards-grid">
                  {property.spaces.map((s, idx) => (
                    <div className="space-card" key={idx}>
                      <div className="space-image">
                        <img src={s.image} alt={s.name} />
                      </div>
                      <div className="space-details">
                        <h4>{s.name}</h4>
                        <p>{s.specs}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <hr className="detail-divider" />

              {/* Equipamiento y Comodidades */}
              <div className="detail-amenities-section">
                <h3>Lo que este lugar ofrece</h3>
                <div className="amenities-grid">
                  {property.amenities.map((item, idx) => (
                    <div className="amenity-item" key={idx}>
                      <CheckCircle2 size={18} className="amenity-check" />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <hr className="detail-divider" />

              {/* Selector interactivo de Visitas */}
              <div className="detail-schedule-section">
                <h3>Agendar visita al inmueble</h3>
                <p className="section-subtext">Selecciona tu modalidad preferida y te confirmamos por WhatsApp en minutos.</p>
                
                <div className="visit-type-tabs">
                  <button
                    type="button"
                    className={`visit-tab ${selectedVisitType === 'presencial' ? 'active' : ''}`}
                    onClick={() => setSelectedVisitType('presencial')}
                  >
                    <Building2 size={16} /> Visita Presencial en Miraflores
                  </button>
                  <button
                    type="button"
                    className={`visit-tab ${selectedVisitType === 'virtual' ? 'active' : ''}`}
                    onClick={() => setSelectedVisitType('virtual')}
                  >
                    <Tv size={16} /> Recorrido Virtual 3D en Vivo
                  </button>
                </div>

                <div className="schedule-form-inline">
                  <div className="schedule-field">
                    <label htmlFor="visit-date"><CalendarIcon size={14} /> Fecha preferida:</label>
                    <input
                      id="visit-date"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </div>
                  <div className="schedule-field">
                    <label><Clock size={14} /> Turno de visita:</label>
                    <div className="time-pills">
                      <button
                        type="button"
                        className={`time-pill ${selectedTime === 'manana' ? 'active' : ''}`}
                        onClick={() => setSelectedTime('manana')}
                      >
                        Mañana (10:00 - 13:00)
                      </button>
                      <button
                        type="button"
                        className={`time-pill ${selectedTime === 'tarde' ? 'active' : ''}`}
                        onClick={() => setSelectedTime('tarde')}
                      >
                        Tarde (14:30 - 18:00)
                      </button>
                    </div>
                  </div>
                </div>

                <button type="button" className="schedule-cta-btn" onClick={handleWhatsAppBooking}>
                  <MessageCircle size={18} /> Confirmar horario por WhatsApp
                </button>
              </div>

            </div>

            {/* Columna Derecha: Sticky Booking / Advisory Card */}
            <aside className="property-sidebar-column">
              <div className="sticky-booking-card">
                
                <div className="booking-price-header">
                  <div>
                    <span className="price-main">{property.price}</span>
                    <span className="price-label">{property.type === 'ALQUILER' ? 'Cuota mensual fija' : 'Precio de venta'}</span>
                  </div>
                  <div className="booking-rating-pill">
                    <Star size={13} fill="#f59e0b" color="#f59e0b" />
                    <strong>{property.rating}</strong>
                    <span>({property.reviewsCount})</span>
                  </div>
                </div>

                <div className="booking-selector-box">
                  <div className="selector-row">
                    <div className="selector-half">
                      <span className="box-label">MODALIDAD</span>
                      <strong>{selectedVisitType === 'presencial' ? 'Presencial' : 'Virtual 3D'}</strong>
                    </div>
                    <div className="selector-half">
                      <span className="box-label">TURNO</span>
                      <strong>{selectedTime === 'manana' ? '10am - 1pm' : '2:30pm - 6pm'}</strong>
                    </div>
                  </div>
                  <div className="selector-full">
                    <span className="box-label">FECHA DE VISITA</span>
                    <strong>{selectedDate || 'Fecha a coordinar'}</strong>
                  </div>
                </div>

                <button type="button" className="booking-submit-btn" onClick={handleWhatsAppBooking}>
                  <MessageCircle size={19} /> Agendar Visita Inmediata
                </button>

                <p className="booking-notice">Sin cobro por asesoría ni comisiones ocultas.</p>

                <div className="booking-breakdown">
                  <div className="breakdown-row">
                    <span>Mantenimiento del edificio</span>
                    <strong>{property.maintenance}</strong>
                  </div>
                  <div className="breakdown-row">
                    <span>Condiciones de ingreso</span>
                    <strong>{property.deposit}</strong>
                  </div>
                  <div className="breakdown-row highlight">
                    <span>Asesoría legal & contratos</span>
                    <strong className="text-emerald-600">Incluido 100%</strong>
                  </div>
                </div>

                <div className="booking-guarantee-badge">
                  <ShieldCheck size={18} />
                  <div>
                    <strong>Garantía de Transparencia Vallet</strong>
                    <p>Propiedad con títulos saneados y entrega inmediata.</p>
                  </div>
                </div>

              </div>
            </aside>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <img src={logoWhite} alt="Vallet" />
            <p>Asesoría inmobiliaria de confianza en Lima. Compra, venta y alquiler con total respaldo y claridad legal.</p>
          </div>
          <div className="footer-links">
            <h4>Navegación</h4>
            <ul>
              <li><Link to="/proyectos/vallet">Inicio</Link></li>
              <li><Link to="/proyectos/vallet/propiedades">Catálogo Completo</Link></li>
              <li><Link to="/proyectos/vallet#contacto">Contacto</Link></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Contacto</h4>
            <p>Av. Jorge Chávez 184, Miraflores</p>
            <p>+51 930 756 781</p>
            <p>contacto@valletinmobiliaria.pe</p>
          </div>
        </div>
      </footer>

      {/* Modal Fullscreen de Galería */}
      {galleryModalOpen && (
        <div className="gallery-fullscreen-modal" role="dialog" aria-modal="true">
          <div className="modal-header">
            <div className="modal-counter">
              Foto <strong>{activeModalPhoto + 1}</strong> de <strong>{property.images.length}</strong>
            </div>
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setGalleryModalOpen(false)}
              aria-label="Cerrar galería"
            >
              <X size={24} />
            </button>
          </div>

          <div className="modal-body-viewer">
            <button
              type="button"
              className="modal-nav-btn prev"
              onClick={() => setActiveModalPhoto((prev) => (prev - 1 + property.images.length) % property.images.length)}
              aria-label="Foto anterior"
            >
              <ChevronLeft size={28} />
            </button>

            <div className="modal-image-stage">
              <img
                src={property.images[activeModalPhoto]}
                alt={`${property.title} foto ${activeModalPhoto + 1}`}
              />
            </div>

            <button
              type="button"
              className="modal-nav-btn next"
              onClick={() => setActiveModalPhoto((prev) => (prev + 1) % property.images.length)}
              aria-label="Foto siguiente"
            >
              <ChevronRight size={28} />
            </button>
          </div>

          <div className="modal-thumbnails-strip">
            {property.images.map((img, idx) => (
              <button
                type="button"
                key={idx}
                className={`thumb-btn ${idx === activeModalPhoto ? 'active' : ''}`}
                onClick={() => setActiveModalPhoto(idx)}
              >
                <img src={img} alt={`Miniatura ${idx + 1}`} />
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
