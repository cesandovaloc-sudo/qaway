import { site, whatsappUrl } from "../data/site.js";
import { Reveal } from "./Reveal.jsx";

export function Footer() {
  return (
    <footer className="footer">
      <Reveal className="container footerGrid">
        <div>
          <img className="footerLogo" src="/assets/logo/logo-primary.svg" alt="Josué Panadería" width={160} height={52} />
          <p className="footerText">Pan fresco todos los días, hecho con calidad y cariño para tu familia.</p>
        </div>
        <div>
          <strong>Enlaces</strong>
          <a href="#inicio">Inicio</a>
          <a href="#productos">Productos</a>
          <a href="#nosotros">Nosotros</a>
          <a href="#pedidos">Pedidos</a>
        </div>
        <div>
          <strong>Productos</strong>
          <a href="#productos">Panes del día</a>
          <a href="#productos">Panes tradicionales</a>
          <a href="#productos">Bocaditos</a>
          <a href="#productos">Pedidos especiales</a>
        </div>
        <div>
          <strong>Contacto</strong>
          <span>{site.phone}</span>
          <span>{site.email}</span>
          <a href={site.mapsUrl} target="_blank" rel="noreferrer">
            {site.address}
          </a>
          <a className="button buttonPrimary footerButton" href={whatsappUrl("Hola, quisiera información.")} target="_blank" rel="noreferrer">
            Escríbenos
          </a>
        </div>
      </Reveal>
      <div className="container footerBottom">
        <span>© 2026 Josué Panadería.</span>
        <span>Hecho en Lima, Perú.</span>
      </div>
    </footer>
  );
}
