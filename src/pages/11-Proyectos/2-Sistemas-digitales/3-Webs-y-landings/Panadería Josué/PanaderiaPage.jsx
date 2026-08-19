import React, { useEffect } from 'react';
import './josue-landing.css';

export default function PanaderiaPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="josue-landing">
      <header>
        <img src="/josue-images/logo/logo-primary.svg" alt="Josué Panadería" />
        <nav>
          <span>Inicio</span> · <span>Productos</span> · <span>Pedidos</span> · <span>Nosotros</span> · <span>Ubicación</span> · <span>Contacto</span>
        </nav>
        <a href="https://wa.me/519876543210?text=Hola%2C%20quiero%20hacer%20un%20pedido" target="_blank" rel="noopener noreferrer">Escríbenos</a>
      </header>

      <section className="hero">
        <div>
          <h1>Recién salido<br />del horno.</h1>
          <h2>Pan fresco todos los días.</h2>
          <p>Horneamos cada mañana para que encuentres pan fresco, variedad y el sabor de siempre cerca de casa.</p>
          <div className="hero-buttons">
            <a href="https://wa.me/519876543210?text=Hola%2C%20quiero%20hacer%20un%20pedido" target="_blank" rel="noopener noreferrer" className="josue-cta">Haz tu pedido</a>
            <a href="#productos" className="josue-cta ghost">Ver productos</a>
          </div>
        </div>
      </section>

      <section className="benefits">
        <div>🌿<b>Fresco todos los días</b><small>Horneamos desde temprano.</small></div>
        <div>☀️<b>Variedad para todos</b><small>Clásicos y especiales.</small></div>
        <div>◷<b>Atención rápida</b><small>Agilidad y amabilidad.</small></div>
        <div>⌖<b>Hechos en tu barrio</b><small>Cerca de ti.</small></div>
      </section>

      <main>
        <h2 id="productos">Nuestros productos</h2>
        <div className="grid">
          <article><img src="/josue-images/products/product-panes-del-dia.webp" alt="Panes del día" /><b>Panes del día</b><p>Calientitos, suaves y listos.</p></article>
          <article><img src="/josue-images/products/product-panes-tradicionales.webp" alt="Panes tradicionales" /><b>Panes tradicionales</b><p>Las recetas de siempre.</p></article>
          <article><img src="/josue-images/products/product-bocaditos.webp" alt="Bocaditos" /><b>Bocaditos</b><p>Perfectos para compartir.</p></article>
          <article><img src="/josue-images/products/product-pedidos-especiales.webp" alt="Pedidos especiales" /><b>Pedidos especiales</b><p>Eventos y celebraciones.</p></article>
        </div>

        <h2>Los más pedidos</h2>
        <div className="grid">
          <article><img src="/josue-images/products/best-pan-frances.webp" alt="Pan Francés" /><b>Pan Francés</b><p>S/ 0.80</p></article>
          <article><img src="/josue-images/products/best-ciabatta.webp" alt="Ciabatta" /><b>Ciabatta</b><p>S/ 2.50</p></article>
          <article><img src="/josue-images/products/best-pan-de-leche.webp" alt="Pan de Leche" /><b>Pan de Leche</b><p>S/ 1.20</p></article>
          <article><img src="/josue-images/products/best-tortas-de-aceite.webp" alt="Tortas de Aceite" /><b>Tortas de Aceite</b><p>S/ 1.00</p></article>
        </div>

        <section className="split">
          <div>
            <h2>Pan de verdad, hecho por personas que aman lo que hacen.</h2>
            <p>Cada madrugada comenzamos a amasar con dedicación.</p>
          </div>
          <img src="/josue-images/sections/section-preparacion.webp" alt="Preparación artesanal" />
        </section>

        <section className="split">
          <img src="/josue-images/sections/section-interior-bakery.webp" alt="Interior de panadería" />
          <div>
            <h2>Tu panadería de todos los días.</h2>
            <p>Atendemos a nuestras familias vecinas con la calidad y el trato que merecen.</p>
          </div>
        </section>

        <section className="cta">
          <div>
            <h2>¿Tienes un pedido especial?</h2>
            <p>Estamos para ayudarte.</p>
            <a href="https://wa.me/519876543210?text=Hola%2C%20quiero%20hacer%20un%20pedido%20especial" target="_blank" rel="noopener noreferrer" className="josue-cta">Escríbenos por WhatsApp</a>
          </div>
          <img src="/josue-images/sections/section-cta-basket.webp" alt="Cesta de pan" />
        </section>

        <img className="map" src="/josue-images/map/map-preview.webp" alt="Ubicación en mapa" />
      </main>

      <footer>JOSUÉ Panadería · San Miguel, Lima</footer>
    </div>
  );
}