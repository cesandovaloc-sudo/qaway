import { useState } from "react";
import { whatsappUrl } from "../data/site.js";

const links = [
  ["Inicio", "#inicio"],
  ["Productos", "#productos"],
  ["Nosotros", "#nosotros"],
  ["Pedidos", "#pedidos"],
  ["Ubicación", "#ubicacion"],
  ["Contacto", "#contacto"]
];

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="siteHeader">
      <div className="container headerInner">
        <a href="#inicio" aria-label="Ir al inicio">
          <img src="/assets/logo/logo-primary.svg" alt="Josué Panadería" width={170} height={52} />
        </a>
        <button className="menuButton" aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(v => !v)}>
          <span /><span /><span /><span className="srOnly">Abrir menú</span>
        </button>
        <nav id="main-navigation" className={open ? "nav navOpen" : "nav"} aria-label="Navegación principal">
          {links.map(([label, href]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>
          ))}
        </nav>
        <a className="button buttonPrimary headerCta" href={whatsappUrl("Hola, quisiera hacer una consulta.")} target="_blank" rel="noreferrer">
          Escríbenos
        </a>
      </div>
    </header>
  );
}
