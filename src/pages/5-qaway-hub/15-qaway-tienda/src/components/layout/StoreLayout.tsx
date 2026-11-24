import type { ReactNode } from 'react';
import type { StoreCategory, StoreTenant } from '../../types/storefront';
import StoreHeader from './StoreHeader';
import StoreFooter from './StoreFooter';
import StoreAdminBar from './StoreAdminBar';
import '../../styles/storefront.css';

type Props = { tenant: StoreTenant; categories: StoreCategory[]; cartCount: number; children: ReactNode };

export default function StoreLayout({ tenant, categories, cartCount, children }: Props) {
  if (!tenant.isPublished && !tenant.canManage) {
    return (
      <div className="qwt-v1" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f8fafc', color: '#0f172a', padding: 24 }}>
        <div style={{ maxWidth: 520, textAlign: 'center' }}>
          <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#64748b' }}>{tenant.name}</p>
          <h1 style={{ margin: 0, fontSize: 32, lineHeight: 1.1, letterSpacing: '-.03em' }}>Tienda en preparación</h1>
          <p style={{ margin: '12px 0 0', fontSize: 15, color: '#475569' }}>Esta tienda todavía no está publicada.</p>

        </div>
      </div>
    );
  }

  return (
    <div className="qwt-v1">
      <StoreAdminBar tenant={tenant} />
      <StoreHeader tenant={tenant} categories={categories} cartCount={cartCount} />
      {children}
      <StoreFooter tenant={tenant} />
    </div>
  );
}
