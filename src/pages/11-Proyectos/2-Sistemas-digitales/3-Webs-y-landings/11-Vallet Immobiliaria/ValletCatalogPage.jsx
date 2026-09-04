import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, BedDouble, Building2, ChevronLeft, ChevronRight, Filter,
  Home, MapPin, MessageCircle, Ruler, Search, ShieldCheck, SlidersHorizontal, Sparkles, X
} from 'lucide-react';
import SEO from '@/components/seo/SEO';
import DemoFloatingBadge from '@/components/ui/DemoFloatingBadge';
import { valletProperties } from './valletPropertiesData';
import { useValletReveal } from './useValletReveal';
import logo from './ChatGPT Image 3 sept 2026, 11_47_38.png';
import logoWhite from './ChatGPT Image 3 sept 2026, 12_41_06.png';
import './vallet-inmobiliaria.css';
import './vallet-catalog.css';

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

export default function ValletCatalogPage() {
  const [selectedType, setSelectedType] = useState('TODOS'); // 'TODOS' | 'ALQUILER' | 'VENTA'
  const [selectedLocation, setSelectedLocation] = useState('TODOS'); // 'TODOS' | 'Miraflores' | 'Jesús María' | 'Magdalena'
  const [searchQuery, setSearchQuery] = useState('');

  const handleTypeChange = (type) => {
    setSelectedType(type);
  };

  const handleLocationChange = (loc) => {
    setSelectedLocation(loc);
  };

  const filteredProperties = useMemo(() => {
    return valletProperties.filter((item) => {
      const matchType = selectedType === 'TODOS' || item.type === selectedType;
      const matchLoc =
        selectedLocation === 'TODOS' ||
        item.location.toLowerCase().includes(selectedLocation.toLowerCase()) ||
        item.title.toLowerCase().includes(selectedLocation.toLowerCase());
      const matchSearch =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchType && matchLoc && matchSearch;
    });
  }, [selectedType, selectedLocation, searchQuery]);

  useValletReveal();

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
      <DemoFloatingBadge backTo="/proyectos" label="Volver a proyectos" threshold={0} />

      {/* Header */}
      <header className="site-header">
        <Link className="brand" to="/proyectos/vallet" aria-label="Vallet inicio">
          <img src={logo} alt="Vallet Asesoría Inmobiliaria" />
        </Link>
        <div className="header-nav-back">
          <Link to="/proyectos/vallet" className="back-link">
            <ArrowLeft size={16} /> <span>Volver a la portada</span>
          </Link>
        </div>
        <a
          className="header-cta"
          href="https://wa.me/51930756781?text=Hola%20Qaway%20Lab,%20estoy%20viendo%20el%20catálogo%20de%20Vallet%20y%20quiero%20cotizar%20un%20sistema%20inmobiliario%20similar."
          target="_blank"
          rel="noreferrer"
        >
          <MessageCircle size={17} /> Asesoría personalizada
        </a>
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

      {/* Footer */}
      <footer className="site-footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <img src={logo} alt="Vallet" />
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
            <p>Av. Javier Prado Este 951411, San Isidro</p>
            <p>+51 974 974 9741</p>
            <p>hola@valletinmobiliaria.com</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
