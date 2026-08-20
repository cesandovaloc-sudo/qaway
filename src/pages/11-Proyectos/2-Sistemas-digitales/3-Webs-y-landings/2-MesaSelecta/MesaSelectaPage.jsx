import React, { useEffect, useState } from "react";
import "./mesa-selecta.css";
import { products, posts } from "./lib/fallback-data";
import { ProductVisual } from "./components/ProductVisual";
import { formatPrice } from "./lib/format";

export default function MesaSelectaPage() {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleAddToCart = () => {
    setCartCount((c) => c + 1);
  };

  return (
    <div className="mesa-selecta-landing">
      <div className="announcement">
        Desde 3 unidades: descuento por paquete · Desde 4 unidades: beneficio de delivery según zona · No acumulables
      </div>

      <header className="site-header">
        <div className="container header-inner">
          <a href="#inicio" className="brand">Mesa <span>Selecta</span></a>
          <nav className="main-nav" aria-label="Navegación principal">
            <a href="#catalogo">Catálogo</a>
            <a href="#momentos">Cómo elegir</a>
            <a href="#guia">Guía de café</a>
            <a href="#beneficios">Entrega y pagos</a>
            <a href="#contacto">Contacto</a>
          </nav>
          <div className="header-actions">
            <a className="button button-secondary" href="https://instagram.com/mesa_selecta" target="_blank" rel="noreferrer">
              Instagram
            </a>
            <a href="#catalogo" className="cart-link">
              Mi pedido <span className="cart-count">{cartCount}</span>
            </a>
          </div>
        </div>
      </header>

      <main id="inicio">
        {/* HERO */}
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">Selección de café</span>
              <h1>Café seleccionado para cada momento.</h1>
              <p>
                Explora cafés molidos, en grano y presentaciones especiales. Elige según cómo lo preparas, el momento en que lo disfrutas o el detalle que quieres regalar.
              </p>
              <div className="hero-actions">
                <a className="button button-primary" href="#catalogo">Ver catálogo</a>
                <a className="button button-secondary" href="#momentos">Ayúdame a elegir</a>
              </div>
            </div>
            <div className="hero-visual" aria-label="Selección de empaques de café">
              <div className="hero-packs">
                <div className="pack">
                  <span className="pack-brand">El Colono</span>
                  <span className="pack-kind">Molido</span>
                </div>
                <div className="pack">
                  <span className="pack-brand">Mesa Selecta</span>
                  <span className="pack-kind">Selección</span>
                </div>
                <div className="pack">
                  <span className="pack-brand">Kiénti</span>
                  <span className="pack-kind">Variedad</span>
                </div>
              </div>
              <span className="hero-note">Catálogo actual · 5 productos</span>
            </div>
          </div>
        </section>

        {/* BENEFIT BAR */}
        <section className="benefit-bar" id="beneficios">
          <div className="container benefit-inner">
            <span className="benefit-label">Beneficios</span>
            <span className="benefit-text">Elige descuento por volumen o beneficio de delivery.</span>
            <span className="benefit-rule">No acumulables</span>
          </div>
        </section>

        {/* CATALOG / PRODUCTS */}
        <section className="section" id="catalogo">
          <div className="container">
            <div className="heading-row">
              <div>
                <span className="eyebrow">Catálogo actual</span>
                <h2 className="section-title">Una selección clara.</h2>
              </div>
              <a className="text-link" href="#catalogo">Ver todos los productos →</a>
            </div>
            <div className="product-grid">
              {products.map((product) => (
                <article className="product-card" key={product.id}>
                  <ProductVisual product={product} />
                  <div className="product-body">
                    <span className="product-brand">{product.brand}</span>
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-desc">{product.descriptionShort}</p>
                    <div className="product-meta">
                      <span className="meta-chip">{product.format}</span>
                      {product.weightG && <span className="meta-chip">{product.weightG} g</span>}
                      {product.origin && <span className="meta-chip">{product.origin}</span>}
                    </div>
                    <div className="product-footer">
                      <span className="product-price">{formatPrice(product.priceCents)}</span>
                      <button 
                        className="button button-secondary" 
                        style={{ minHeight: "36px", padding: "0 14px", fontSize: "0.74rem" }}
                        onClick={handleAddToCart}
                      >
                        + Agregar
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* MOMENTS */}
        <section className="section-compact" id="momentos">
          <div className="container">
            <span className="eyebrow">Elige según tu necesidad</span>
            <h2 className="section-title">¿Para qué momento?</h2>
            <div className="moments">
              {[
                ["01", "Todos los días", "Café práctico y equilibrado para casa u oficina."],
                ["02", "Para regalar", "Presentaciones especiales con una mejor percepción de detalle."],
                ["03", "Moler al momento", "Mayor control para ajustar la molienda a tu método."],
                ["04", "Explorar variedades", "Opciones Typica y Catimor para comparar nuevas propuestas."],
              ].map(([number, title, copy]) => (
                <a href="#catalogo" className="moment" key={title}>
                  <span className="moment-index">{number}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{copy}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* EDITORIAL / GUIDE */}
        <section className="section" id="guia">
          <div className="container">
            <div className="heading-row">
              <div>
                <span className="eyebrow">Guía de café</span>
                <h2 className="section-title">Elegir y preparar mejor.</h2>
              </div>
              <a className="text-link" href="#guia">Ver todos los artículos →</a>
            </div>
            <div className="editorial-grid">
              {posts[0] && (
                <article className="feature-story">
                  <span className="eyebrow">{posts[0].category}</span>
                  <h3>{posts[0].title}</h3>
                  <p>{posts[0].excerpt}</p>
                  <a className="button button-secondary" href="#guia" style={{ color: "white", borderColor: "white", alignSelf: "start" }}>
                    Leer guía
                  </a>
                </article>
              )}
              <div className="story-list">
                {posts.slice(1, 3).map((post) => (
                  <article className="story-card" key={post.id}>
                    <span className="eyebrow">{post.category} · {post.readingMinutes} min</span>
                    <div>
                      <h3>{post.title}</h3>
                      <p>{post.excerpt}</p>
                    </div>
                    <a className="text-link" href="#guia">Leer artículo →</a>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SOCIAL STRIP */}
        <section className="social-strip" id="contacto">
          <div className="container social-inner">
            <div className="social-copy">
              <h2>También en Instagram</h2>
              <p>Nuevos productos, formas de preparación y recomendaciones de Mesa Selecta.</p>
            </div>
            <a className="button button-red" href="https://instagram.com/mesa_selecta" target="_blank" rel="noreferrer">
              Seguir @mesa_selecta
            </a>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <h2>Mesa Selecta</h2>
              <p>Café de origen seleccionado para el consumo diario, momentos especiales y regalos con identidad.</p>
            </div>
            <div className="footer-col">
              <h3>Catálogo</h3>
              <ul>
                <li><a href="#catalogo">El Colono Molido</a></li>
                <li><a href="#catalogo">El Colono Grano</a></li>
                <li><a href="#catalogo">Mesa Selecta</a></li>
                <li><a href="#catalogo">Kiénti Typica</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h3>Guías</h3>
              <ul>
                <li><a href="#guia">Cómo elegir tu café</a></li>
                <li><a href="#guia">Molido vs en grano</a></li>
                <li><a href="#guia">Café para regalo</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h3>Atención</h3>
              <ul>
                <li><a href="#beneficios">Entrega y pagos</a></li>
                <li><a href="#contacto">Contacto WhatsApp</a></li>
                <li><a href="https://instagram.com/mesa_selecta" target="_blank" rel="noreferrer">Instagram</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} Mesa Selecta. Todos los derechos reservados.</p>
            <p>Selección y origen de café peruano.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
