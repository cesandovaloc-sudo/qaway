import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User } from 'lucide-react';
import { useState } from 'react';
import type { StoreCategory, StoreTenant } from '../../types/storefront';

type Props = { tenant: StoreTenant; categories: StoreCategory[]; cartCount: number };

export default function StoreHeader({ tenant, categories, cartCount }: Props) {
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  const submit = (e: React.FormEvent) => { e.preventDefault(); if (q.trim()) navigate(`/tienda/${tenant.slug}/buscar?q=${encodeURIComponent(q.trim())}`); };
  return (
    <header className="qwt-header">
      <div className="qwt-topbar">
        <div className="qwt-container">
          <span>Envíos a todo el Perú</span>
          <span>{tenant.whatsapp ? `WhatsApp: ${tenant.whatsapp}` : 'Atención al cliente'}</span>
        </div>
      </div>
      <div className="qwt-container qwt-header-main">
        <Link to={`/tienda/${tenant.slug}`} className="qwt-logo">{tenant.name}</Link>
        <form className="qwt-search" onSubmit={submit}>
          <Search size={18} color="#717171" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar productos, marcas y más" aria-label="Buscar" />
        </form>
        <div className="qwt-actions">
          <Link to="/login" className="qwt-action"><User size={20} /><span>Cuenta</span></Link>
          <button className="qwt-action" onClick={() => navigate('/carrito')} aria-label="Carrito">
            <ShoppingCart size={20} />
            {cartCount > 0 && <span className="qwt-cart-count">{cartCount}</span>}
            <span>Carrito</span>
          </button>
        </div>
      </div>
      <nav className="qwt-nav">
        <div className="qwt-container">
          <Link to={`/tienda/${tenant.slug}`}>Inicio</Link>
          {categories.map(c => <Link key={c.id} to={`/tienda/${tenant.slug}/c/${c.slug}`}>{c.name}</Link>)}
        </div>
      </nav>
    </header>
  );
}
