import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">Mesa <span>Selecta</span></div>
            <p className="footer-intro">Café seleccionado para cada momento. Opciones molidas, en grano y presentaciones especiales para disfrutar o regalar.</p>
          </div>
          <div className="footer-col">
            <h3>Comprar</h3>
            <Link href="/catalogo">Catálogo</Link>
            <Link href="/carrito">Mi pedido</Link>
            <Link href="/entrega-y-pagos">Entrega y pagos</Link>
          </div>
          <div className="footer-col">
            <h3>Aprender</h3>
            <Link href="/como-elegir">Cómo elegir</Link>
            <Link href="/blog">Guía de café</Link>
            <Link href="/contacto">Contacto</Link>
          </div>
          <div className="footer-col">
            <h3>Redes</h3>
            <a href="https://instagram.com/mesa_selecta" target="_blank" rel="noreferrer">Instagram · @mesa_selecta</a>
            <a href="https://wa.me/51930756781" target="_blank" rel="noreferrer">WhatsApp</a>
          </div>
        </div>
        <div className="footer-bottom"><span>© 2026 Mesa Selecta</span><span>Precios, stock y condiciones se confirman antes de cerrar el pedido.</span></div>
      </div>
    </footer>
  );
}
