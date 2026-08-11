/**
 * ProjectTemplate.jsx
 * 
 * Plantilla reutilizable para páginas de portafolio estilo Behance.
 * Diseñada para mostrar casos de proyecto con video, identidad visual,
 * mockups y resultados.
 * 
 * Uso:
 * <ProjectTemplate
 *   kicker="PROYECTO WEB"
 *   title="Nombre del Proyecto"
 *   description="Descripción breve del proyecto"
 *   client="Nombre del Cliente"
 *   service="Servicio realizado"
 *   year="2024"
 *   technologies={["React", "Vite", "Tailwind"]}
 *   videoSrc="/assets/video.mp4"
 *   liveUrl="https://example.com"
 * />
 */

import './project-template.css'

export default function ProjectTemplate({
  // Hero
  kicker = 'PROYECTO WEB',
  title = 'Nombre del Proyecto',
  description = 'Descripción breve del proyecto.',
  client = 'Cliente',
  service = 'Servicio',
  year = '2024',
  technologies = [],
  videoSrc = null,
  videoPoster = null,
  liveUrl = '#',
  
  // Presentación
  presentationText = 'Un párrafo explicando qué se desarrolló y para qué.',
  objectives = [],
  
  // Video recorrido
  walkthroughVideo = null,
  
  // Identidad visual
  identity = {
    colors: [],
    typography: [],
    logo: null,
  },
  
  // Mockups devices
  devices = [],
  
  // Páginas principales
  pages = [],
  
  // Detalles
  details = [],
  
  // Video opcional
  optionalVideo = null,
  
  // Resultados
  results = [],
  
  // Navegación
  prevProject = null,
  nextProject = null,
}) {
  return (
    <article className="project-template">
      {/* ========== 01. HERO ========== */}
      <section className="pt-hero">
        <div className="pt-container">
          <div className="pt-hero__content">
            <div className="pt-hero__info">
              <span className="pt-kicker">{kicker}</span>
              <h1 className="pt-title pt-title--hero">{title}</h1>
              <p className="pt-subtitle">{description}</p>
              
              <div className="pt-hero__meta">
                <div className="pt-hero__meta-item">
                  <span className="pt-hero__meta-label">Cliente</span>
                  <span className="pt-hero__meta-value">{client}</span>
                </div>
                <div className="pt-hero__meta-item">
                  <span className="pt-hero__meta-label">Servicio</span>
                  <span className="pt-hero__meta-value">{service}</span>
                </div>
                <div className="pt-hero__meta-item">
                  <span className="pt-hero__meta-label">Año</span>
                  <span className="pt-hero__meta-value">{year}</span>
                </div>
                <div className="pt-hero__meta-item">
                  <span className="pt-hero__meta-label">Tecnologías</span>
                  <span className="pt-hero__meta-value">{technologies.join(', ')}</span>
                </div>
              </div>
              
              {liveUrl && (
                <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="pt-btn pt-btn--primary">
                  Ver sitio en vivo
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 17L17 7M17 7H7M17 7V17" />
                  </svg>
                </a>
              )}
            </div>
            
            <div className="pt-hero__video">
              {videoSrc ? (
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  poster={videoPoster}
                >
                  <source src={videoSrc} type="video/mp4" />
                </video>
              ) : (
                <div style={{ 
                  width: '100%', 
                  height: '100%', 
                  background: 'linear-gradient(135deg, #1a1a1f 0%, #0a0a0a 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--pt-text-muted)',
                  fontSize: '0.875rem'
                }}>
                  Video del proyecto
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========== 02. PRESENTACIÓN ========== */}
      <section className="pt-section">
        <div className="pt-container">
          <div className="pt-presentation">
            <div className="pt-presentation__header">
              <span className="pt-presentation__number">01</span>
              <div className="pt-presentation__text">
                <span className="pt-kicker">El Proyecto</span>
                <h2 className="pt-title">Qué se desarrolló</h2>
                <p className="pt-body">{presentationText}</p>
              </div>
            </div>
            
            {objectives.length > 0 && (
              <div className="pt-objectives">
                {objectives.map((obj, i) => (
                  <div key={i} className="pt-objective">
                    <span className="pt-number">{String(i + 1).padStart(2, '0')}</span>
                    <h3 className="pt-objective__title">{obj.title}</h3>
                    <p className="pt-objective__desc">{obj.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========== 03. VIDEO RECORRIDO ========== */}
      {walkthroughVideo && (
        <section className="pt-section pt-video-section">
          <div className="pt-container pt-container--wide">
            <div>
              <span className="pt-kicker">Recorrido del Proyecto</span>
              <h2 className="pt-title">Así funciona la experiencia</h2>
            </div>
            
            <div className="pt-video-section__wrapper">
              <video 
                controls 
                playsInline
                poster={videoPoster}
              >
                <source src={walkthroughVideo} type="video/mp4" />
              </video>
            </div>
          </div>
        </section>
      )}

      {/* ========== 04. IDENTIDAD VISUAL ========== */}
      {(identity.colors.length > 0 || identity.typography.length > 0) && (
        <section className="pt-section pt-identity">
          <div className="pt-container">
            <div>
              <span className="pt-kicker">Identidad Visual</span>
              <h2 className="pt-title">Una identidad diseñada para el proyecto</h2>
            </div>
            
            <div className="pt-identity__grid">
              {identity.colors.length > 0 && (
                <div className="pt-identity__card">
                  <span className="pt-identity__card-title">Paleta de colores</span>
                  <div className="pt-identity__colors">
                    {identity.colors.map((color, i) => (
                      <div 
                        key={i} 
                        className="pt-color-swatch"
                        style={{ background: color.value }}
                      >
                        <span>{color.hex}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {identity.typography.length > 0 && (
                <div className="pt-identity__card">
                  <span className="pt-identity__card-title">Tipografía</span>
                  <div className="pt-identity__typography">
                    {identity.typography.map((type, i) => (
                      <div key={i} className="pt-type-sample">
                        <span className="pt-type-sample__label">{type.name}</span>
                        <span 
                          className="pt-type-sample__preview"
                          style={{ fontFamily: type.fontFamily }}
                        >
                          {type.sample || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ========== 05. DISEÑO Y EXPERIENCIA ========== */}
      {devices.length > 0 && (
        <section className="pt-section pt-devices">
          <div className="pt-container pt-container--wide">
            <div>
              <span className="pt-kicker">Diseño Web</span>
              <h2 className="pt-title">Una experiencia diseñada para guiar al visitante</h2>
            </div>
            
            <div className="pt-devices__grid">
              {devices.map((device, i) => (
                <div 
                  key={i} 
                  className={`pt-device ${device.wide ? 'pt-device--wide' : ''}`}
                >
                  <img src={device.image} alt={device.alt || `Mockup ${i + 1}`} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========== 06. PÁGINAS PRINCIPALES ========== */}
      {pages.length > 0 && (
        <section className="pt-section pt-pages">
          <div className="pt-container pt-container--wide">
            <div>
              <span className="pt-kicker">Estructura del Sitio</span>
              <h2 className="pt-title">Cada página tiene una función</h2>
            </div>
            
            <div className="pt-pages__grid">
              {pages.map((page, i) => (
                <div key={i} className="pt-page-card">
                  <div className="pt-page-card__image">
                    <img src={page.image} alt={page.title} />
                  </div>
                  <div className="pt-page-card__content">
                    <span className="pt-page-card__number">{String(i + 1).padStart(2, '0')}</span>
                    <h3 className="pt-page-card__title">{page.title}</h3>
                    <p className="pt-page-card__desc">{page.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========== 07. DETALLES ========== */}
      {details.length > 0 && (
        <section className="pt-section pt-details">
          <div className="pt-container pt-container--wide">
            <div>
              <span className="pt-kicker">Detalles que marcan la diferencia</span>
              <h2 className="pt-title">Elementos que elevaron el proyecto</h2>
            </div>
            
            <div className="pt-details__grid">
              {details.map((detail, i) => (
                <div key={i} className="pt-detail-card">
                  {detail.image && (
                    <div className="pt-detail-card__image">
                      <img src={detail.image} alt={detail.title} />
                    </div>
                  )}
                  <h3 className="pt-detail-card__title">{detail.title}</h3>
                  <p className="pt-detail-card__desc">{detail.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========== 08. VIDEO OPCIONAL ========== */}
      {optionalVideo && (
        <section className="pt-section pt-video-optional">
          <div className="pt-container pt-container--wide">
            <div className="pt-video-section">
              <span className="pt-kicker">En Movimiento</span>
              <h2 className="pt-title">El diseño también se comporta</h2>
              
              <div className="pt-video-section__wrapper">
                <video controls playsInline>
                  <source src={optionalVideo} type="video/mp4" />
                </video>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========== 09. RESULTADOS ========== */}
      {results.length > 0 && (
        <section className="pt-section pt-results">
          <div className="pt-container">
            <div style={{ textAlign: 'center' }}>
              <span className="pt-kicker">Resultados</span>
              <h2 className="pt-title">El impacto del proyecto</h2>
            </div>
            
            <div className="pt-results__grid">
              {results.map((result, i) => (
                <div key={i} className="pt-result">
                  <div className="pt-result__value">{result.value}</div>
                  <div className="pt-result__label">{result.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========== 10. CTA ========== */}
      <section className="pt-section pt-cta">
        <div className="pt-container">
          <div className="pt-cta__content">
            <h2 className="pt-cta__title">¿Tienes un proyecto similar en mente?</h2>
            <p className="pt-cta__text">
              Creamos sitios web, identidades y sistemas digitales adaptados a las necesidades de cada proyecto.
            </p>
            <a href="/#formulario" className="pt-btn pt-btn--primary">
              Hablemos de tu proyecto
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ========== 11. NAVEGACIÓN ========== */}
      <div className="pt-container">
        <nav className="pt-navigation">
          {prevProject ? (
            <a href={prevProject.url} className="pt-nav-link pt-nav-link--prev">
              <span className="pt-nav-link__label">← Proyecto anterior</span>
              <span className="pt-nav-link__title">{prevProject.title}</span>
            </a>
          ) : (
            <div />
          )}
          
          <a href="/proyectos" className="pt-nav-center">
            <span className="pt-nav-link__label">Centro de proyectos</span>
          </a>
          
          {nextProject ? (
            <a href={nextProject.url} className="pt-nav-link pt-nav-link--next">
              <span className="pt-nav-link__label">Siguiente proyecto →</span>
              <span className="pt-nav-link__title">{nextProject.title}</span>
            </a>
          ) : (
            <div />
          )}
        </nav>
      </div>
    </article>
  )
}
