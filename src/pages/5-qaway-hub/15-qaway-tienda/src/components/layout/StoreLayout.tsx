import type { ReactNode } from 'react';
import type { StoreCategory, StoreTenant } from '../../types/storefront';
import StoreHeader from './StoreHeader';
import StoreFooter from './StoreFooter';
import '../../styles/storefront.css';

type Props = { tenant: StoreTenant; categories: StoreCategory[]; cartCount: number; children: ReactNode };

export default function StoreLayout({ tenant, categories, cartCount, children }: Props) {
  return (
    <div className="qwt-v1">
      <StoreHeader tenant={tenant} categories={categories} cartCount={cartCount} />
      {children}
      <StoreFooter tenant={tenant} />
    </div>
  );
}
