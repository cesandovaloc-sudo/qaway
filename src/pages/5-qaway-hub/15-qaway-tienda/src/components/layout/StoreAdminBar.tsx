import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/config/supabase';
import type { StoreTenant } from '../../types/storefront';

type Props = { tenant: StoreTenant };

export default function StoreAdminBar({ tenant }: Props) {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const isPreview = searchParams.get('preview') === '1';
  const show = !!tenant.canManage && (!tenant.isPublished || isPreview);
  const [published, setPublished] = useState(!!tenant.isPublished);

  if (!show) return null;

  const togglePublish = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const next = !published;
      const { data } = await supabase.from('tenants').select('features').eq('id', tenant.id).maybeSingle();
      const features = (data?.features && typeof data.features === 'object') ? { ...data.features } : {};
      features.storefront_published = next;
      const { error } = await supabase.from('tenants').update({ features }).eq('id', tenant.id);
      if (error) throw error;
      setPublished(next);
      const url = new URL(window.location.href);
      if (next) url.searchParams.delete('preview');
      else url.searchParams.set('preview', '1');
      window.location.href = url.toString();
    } catch {
      alert('No se pudo cambiar el estado de la tienda. Verifica tus permisos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 12, padding: '8px 16px', background: '#111827', color: '#fff', fontSize: 13, lineHeight: 1.2,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 999,
          background: published ? '#16a34a' : '#f59e0b', color: '#fff', fontSize: 11, fontWeight: 700,
        }}>
          {published ? 'Publicada' : 'Borrador'}
        </span>
        <span style={{ opacity: 0.85 }}>
          {published ? 'Esta tienda es visible para todos.' : 'Solo tú puedes ver esta tienda mientras esté en borrador.'}
        </span>
      </div>
      <button
        type="button"
        onClick={togglePublish}
        disabled={loading}
        style={{
          border: 0, borderRadius: 8, padding: '7px 12px', fontSize: 12, fontWeight: 700, cursor: loading ? 'wait' : 'pointer',
          background: published ? '#374151' : '#16a34a', color: '#fff',
        }}
      >
        {loading ? 'Guardando...' : published ? 'Pasar a borrador' : 'Publicar tienda'}
      </button>
    </div>
  );
}
