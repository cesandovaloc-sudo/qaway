import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, BedDouble, Building2, ChevronLeft, ChevronRight, Facebook, Filter,
  Home, Instagram, Linkedin, Mail, MapPin, Menu, MessageCircle, Phone, Ruler, Search, ShieldCheck, SlidersHorizontal, Sparkles, X
} from 'lucide-react';
import SEO from '@/components/seo/SEO';
import StudioFloatingDock from '@/components/studio/StudioFloatingDock';
import { valletProperties } from './valletPropertiesData';
import { useValletReveal } from './useValletReveal';
import logo from './ChatGPT Image 3 sept 2026, 11_47_38.webp';
import logoWhite from './ChatGPT Image 3 sept 2026, 12_41_06.webp';
import './vallet-inmobiliaria.css';
import './vallet-catalog.css';
import { useRecordingMode } from '@/config/recordingMode';

function PropertyCardCarousel({ images, alt, type }) {
  const imageList = Array.isArray(images) && images.length > 0 ? images : [images].filter(Boolean);
  const [currentIndex, setCurrentIndex] = useState(0);

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
          loading="lazy"
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
            <ChevronLeft size={16} strokeWidth={2.4} />
          </button>
          <button
            type="button"
            className="property-carousel-btn property-carousel-next"
            onClick={handleNext}
            aria-label="Siguiente foto"
          >
            <ChevronRight size={16} strokeWidth={2.4} />
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

const normalizeStr = (str) =>
  (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export default function ValletCatalogPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('TODOS'); // 'TODOS' | 'ALQUILER' | 'VENTA'
  const [selectedLocation, setSelectedLocation] = useState('TODOS'); // 'TODOS' | 'Miraflores' | 'Jesús María' | 'Magdalena'
  const [searchQuery, setSearchQuery] = useState('');

  const handleTypeChange = (type) => {
    setSelectedType(type);
  };

  const handleLocationChange = (loc) => {
    setSelectedLocation(loc);
    if (loc !== 'TODOS' && selectedType !== 'TODOS') {
      const normLoc = normalizeStr(loc);
      const matchesCurrentType = valletProperties.some(
        (p) => p.type === selectedType && (normalizeStr(p.location).includes(normLoc) || normalizeStr(p.title).includes(normLoc))
      );
      if (!matchesCurrentType) {
        setSelectedType('TODOS');
      }
    }
  };

  const filteredProperties = useMemo(() => {
    return valletProperties.filter((item) => {
      const normLoc = normalizeStr(selectedLocation);
      const normQuery = normalizeStr(searchQuery);
      const itemTitleNorm = normalizeStr(item.title);
      const itemLocNorm = normalizeStr(item.location);
      const itemTaglineNorm = normalizeStr(item.tagline);

      const matchType = selectedType === 'TODOS' || item.type === selectedType;
      const matchLoc =
        selectedLocation === 'TODOS' ||
        itemLocNorm.includes(normLoc) ||
        itemTitleNorm.includes(normLoc);
      const matchSearch =
        !searchQuery ||
        itemTitleNorm.includes(normQuery) ||
        itemLocNorm.includes(normQuery) ||
        itemTaglineNorm.includes(normQuery);

      return matchType && matchLoc && matchSearch;
    });
  }, [selectedType, selectedLocation, searchQuery]);

  useValletReveal();

  const { hideBackLinks } = useRecordingMode();

  return (
    <div className="vallet-landing vallet-catalog-page site-shell">
      <SEO
        title="Catálogo de Propiedades Exclusivas en Lima | Vallet Asesoría Inmobiliaria"
        description="Explora nuestra cartera de departamentos y casas en alquiler y venta en Miraflores, Jesús María y Magdalena. Propiedades 100% verificadas."
        canonical="https://qawaylab.com/proyectos/vallet/propiedades"
        image="https://qawaylab.com/assets/miraflores1.webp"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Propiedades Inmobiliarias en Lima - Vallet',
          itemListElement: valletProperties.map((p, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            name: p.title,
            url: `https://qawaylab.com/proyectos/vallet/propiedad/${p.slug}`
          }))
        }}
      />

      {/* Header Unificado Maestro Vallet */}
      <header className="site-header">
        <Link className="brand" to="/proyectos/vallet" aria-label="Vallet inicio">
          <img src={logo} alt="Vallet Asesoría Inmobiliaria" />
        </Link>
        <nav className={menuOpen ? 'nav open' : 'nav'} aria-label="Navegación principal">
          <Link to="/proyectos/vallet" onClick={() => setMenuOpen(false)}>Inicio</Link>
          <Link to="/proyectos/vallet#servicios" onClick={() => setMenuOpen(false)}>Servicios</Link>
          <Link to="/proyectos/vallet/propiedades" onClick={() => setMenuOpen(false)}>Propiedades</Link>
          <Link to="/proyectos/vallet#nosotros" onClick={() => setMenuOpen(false)}>Nosotros</Link>
          <Link to="/proyectos/vallet#contacto" onClick={() => setMenuOpen(false)}>Contacto</Link>
          <a
            className="header-cta"
            href="https://wa.me/51930756781?text=Hola%20Qaway%20Lab,%20estoy%20viendo%20el%20catálogo%20de%20Vallet%20y%20quiero%20cotizar%20un%20sistema%20inmobiliario%20similar."
            target="_blank"
            rel="noreferrer"
          >
            Quiero asesoría <ArrowRight size={17} />
          </a>
        </nav>
        <button className="menu-button" aria-label="Abrir menú" onClick={() => setMenuOpen((v) => !v)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      <main className="catalog-main">
        <div className="container">
          
          {/* Banner de Título */}
          <div className="catalog-hero-banner vallet-reveal">
            <div className="catalog-badge">
              <Sparkles size={14} /> Cartera Inmobiliaria Exclusiva
            </div>
            <h1>Encuentra tu próximo <strong>hogar o inversión</strong></h1>
            <p>Propiedades seleccionadas bajo rigurosos estándares de ubicación, seguridad y títulos saneados.</p>
          </div>

          {/* Barra de Filtros Interactiva */}
          <div className="catalog-filter-bar vallet-reveal reveal-delay-1">
            
            {/* Buscador de texto */}
            <div className="filter-search-input">
              <Search size={18} />
              <input
                type="text"
                placeholder="Buscar por distrito o características..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button type="button" className="clear-search" onClick={() => setSearchQuery('')} aria-label="Limpiar búsqueda">
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Píldoras de Modalidad */}
            <div className="filter-pills-group">
              <button
                type="button"
                className={`filter-pill ${selectedType === 'TODOS' ? 'active' : ''}`}
                onClick={() => handleTypeChange('TODOS')}
              >
                Todas las modalidades
              </button>
              <button
                type="button"
                className={`filter-pill ${selectedType === 'ALQUILER' ? 'active' : ''}`}
                onClick={() => handleTypeChange('ALQUILER')}
              >
                Alquiler
              </button>
              <button
                type="button"
                className={`filter-pill ${selectedType === 'VENTA' ? 'active' : ''}`}
                onClick={() => handleTypeChange('VENTA')}
              >
                Venta
              </button>
            </div>

            {/* Selector de Distrito */}
            <div className="filter-select-wrapper">
              <MapPin size={16} />
              <select
                value={selectedLocation}
                onChange={(e) => handleLocationChange(e.target.value)}
                aria-label="Filtrar por distrito"
              >
                <option value="TODOS">Todos los distritos</option>
                <option value="Miraflores">Miraflores</option>
                <option value="Jesús María">Jesús María</option>
                <option value="Magdalena">Magdalena</option>
              </select>
            </div>

          </div>

          {/* Contador de Resultados */}
          <div className="catalog-results-header">
            <span>Mostrando <strong>{filteredProperties.length}</strong> {filteredProperties.length === 1 ? 'propiedad disponible' : 'propiedades disponibles'}</span>
            {(selectedType !== 'TODOS' || selectedLocation !== 'TODOS' || searchQuery) && (
              <button
                type="button"
                className="reset-filters-link"
                onClick={() => {
                  handleTypeChange('TODOS');
                  handleLocationChange('TODOS');
                  setSearchQuery('');
                }}
              >
                Restablecer filtros
              </button>
            )}
          </div>

          {/* Grid de Propiedades */}
          {filteredProperties.length > 0 ? (
            <div className="property-grid catalog-grid">
              {filteredProperties.map((property) => (
                <article className="property-card" key={property.slug}>
                  <PropertyCardCarousel
                    images={property.images}
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
                      <span><BedDouble size={15} /> {property.bedrooms}</span>
                      <span><Building2 size={15} /> {property.bathrooms}</span>
                      <span><Ruler size={15} /> {property.area}</span>
                    </div>
                    <div className="property-bottom">
                      <strong>{property.price}</strong>
                      <Link to={`/proyectos/vallet/propiedad/${property.slug}`} className="property-detail-btn">
                        Ver detalles <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="catalog-empty-state">
              <Home size={44} />
              <h3>No se encontraron propiedades</h3>
              <p>Intenta ajustar tus criterios de búsqueda o contáctanos para una búsqueda personalizada.</p>
              <button
                type="button"
                className="empty-cta-btn"
                onClick={() => {
                  setSelectedType('TODOS');
                  setSelectedLocation('TODOS');
                  setSearchQuery('');
                }}
              >
                Ver todas las propiedades
              </button>
            </div>
          )}

          {/* Banner de Asesoría Personalizada */}
          <div className="catalog-advisory-banner vallet-reveal">
            <div className="banner-copy">
              <h3>¿No encuentras la propiedad que buscas?</h3>
              <p>Nuestro equipo de asesores rastrea inmuebles fuera de mercado según tus requerimientos específicos.</p>
            </div>
            <a
              href="https://wa.me/51930756781?text=Hola%20Qaway%20Lab,%20me%20interesa%20desarrollar%20un%20buscador%20inmobiliario%20como%20el%20de%20Vallet."
              target="_blank"
              rel="noreferrer"
              className="banner-cta"
            >
              <MessageCircle size={18} /> Solicitar Búsqueda a Medida
            </a>
          </div>

        </div>
      </main>

      {/* Footer Unificado Maestro Vallet */}
      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <img src={logoWhite} alt="Vallet" className="footer-logo" />
            <p>Te acompañamos en la compra, venta o alquiler de propiedades con total transparencia, seguridad y atención directa.</p>
            <div className="socials">
              <a href="#" aria-label="Facebook"><Facebook size={18} /></a>
              <a href="#" aria-label="Instagram"><Instagram size={18} /></a>
              <a href="#" aria-label="Linkedin"><Linkedin size={18} /></a>
              <a href="https://wa.me/51930756781" target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle size={18} /></a>
            </div>
          </div>
          <div>
            <h3>Navegación</h3>
            <Link className="footer-link" to="/proyectos/vallet">Inicio</Link>
            <Link className="footer-link" to="/proyectos/vallet#servicios">Servicios</Link>
            <Link className="footer-link" to="/proyectos/vallet/propiedades">Propiedades</Link>
            <Link className="footer-link" to="/proyectos/vallet#nosotros">Nosotros</Link>
            <Link className="footer-link" to="/proyectos/vallet#contacto">Contacto</Link>
          </div>
          <div>
            <h3>Servicios</h3>
            {['Compra de propiedades', 'Alquiler de propiedades', 'Asesoría personalizada', 'Acompañamiento integral', 'Gestión legal y documentación'].map((item) => (
              <span className="footer-link" key={item}>{item}</span>
            ))}
          </div>
          <div>
            <h3>Contacto</h3>
            <p className="contact-line"><Phone size={15} /> +51 974 974 9741</p>
            <p className="contact-line"><Mail size={15} /> hola@valletinmobiliaria.com</p>
            <p className="contact-line"><Building2 size={15} /> Av. Javier Prado Este 951411<br />San Isidro, Lima</p>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>© 2026 Vallet Inmobiliaria. Todos los derechos reservados.</span>
          <span>Política de privacidad &nbsp; | &nbsp; Términos y condiciones</span>
        </div>
      </footer>
      <StudioFloatingDock projectName="Vallet Inmobiliaria" />
    </div>
  );
}
