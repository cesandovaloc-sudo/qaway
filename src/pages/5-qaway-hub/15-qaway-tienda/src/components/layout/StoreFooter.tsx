import type { StoreTenant } from '../../types/storefront';

export default function StoreFooter({ tenant }: { tenant: StoreTenant }) {
  return (
    <footer className="qwt-footer">
      <div className="qwt-container qwt-footer-grid">
        <div>
          <div className="qwt-logo" style={{ color: '#fff', marginBottom: 12 }}>{tenant.name}</div>
          <p>Tienda multi-tenant impulsada por Qaway Lab. Catálogo, carrito y checkout integrados.</p>
        </div>
        <div><h4>Ayuda</h4><p>Centro de ayuda</p><p>Cambios y devoluciones</p><p>Seguimiento</p></div>
        <div><h4>Empresa</h4><p>Sobre la tienda</p><p>Términos</p><p>Privacidad</p></div>
        <div><h4>Contacto</h4>{tenant.whatsapp && <p>WhatsApp: {tenant.whatsapp}</p>}{tenant.email && <p>{tenant.email}</p>}</div>
      </div>
      <div className="qwt-container qwt-footer-bottom">
        <span>© {new Date().getFullYear()} {tenant.name}. Powered by Qaway Lab.</span>
        <span>Pagos y checkout en /carrito</span>
      </div>
    </footer>
  );
}
