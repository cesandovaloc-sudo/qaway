import React from 'react';
import { Sparkles, MessageCircle, ArrowUpRight, CheckCircle2, Layout, Smartphone, Zap } from 'lucide-react';

export default function JosueStudioSignature() {
  const whatsappMessage = encodeURIComponent(
    "Hola Qaway Lab, vi la plataforma de Josué Panadería y deseo cotizar una web con catálogo de productos y pedidos para mi negocio."
  );
  const whatsappUrl = `https://wa.me/51953282216?text=${whatsappMessage}`;

  return (
    <section className="josue-signature-section" aria-label="Créditos de diseño y desarrollo Qaway Lab">
      <div className="josue-signature-container">
        <div className="josue-signature-card">
          <div className="josue-sig-header">
            <div className="josue-sig-badge">
              <Sparkles size={14} className="sig-sparkle" />
              <span>DISEÑO & INGENIERÍA DIGITAL · QAWAY LAB</span>
            </div>
            <h3 className="josue-sig-title">
              Elevamos marcas gastronómicas y comerciales con experiencias digitales memorables.
            </h3>
            <p className="josue-sig-desc">
              Esta plataforma fue conceptualizada y desarrollada por <strong>Qaway Lab</strong> para brindar una experiencia de compra artesanal, rápida y visualmente irresistible desde cualquier dispositivo móvil.
            </p>
          </div>

          <div className="josue-sig-grid">
            <div className="josue-sig-item">
              <div className="sig-icon-wrap">
                <Smartphone size={18} />
              </div>
              <h4>Mobile-First Gastronómico</h4>
              <p>Optimizada para pedidos directos vía WhatsApp sin fricciones ni esperas.</p>
            </div>

            <div className="josue-sig-item">
              <div className="sig-icon-wrap">
                <Layout size={18} />
              </div>
              <h4>Catálogo Visual Interactivo</h4>
              <p>Fichas de producto apetecibles con navegación por categorías artesanales.</p>
            </div>

            <div className="josue-sig-item">
              <div className="sig-icon-wrap">
                <Zap size={18} />
              </div>
              <h4>Velocidad Ultrarrápida</h4>
              <p>Tiempos de carga casi instantáneos que aumentan la conversión de comensales.</p>
            </div>
          </div>

          <div className="josue-sig-footer">
            <div className="josue-sig-cta-wrap">
              <span className="sig-cta-hint">¿Tienes un negocio gastronómico o comercial?</span>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="josue-sig-button"
                aria-label="Cotizar proyecto gastronómico con Qaway Lab por WhatsApp"
              >
                <MessageCircle size={16} />
                <span>Cotizar web para mi negocio</span>
                <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
