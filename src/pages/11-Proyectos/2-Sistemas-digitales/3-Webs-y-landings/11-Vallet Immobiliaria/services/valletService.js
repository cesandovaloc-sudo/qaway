import { valletProperties } from '../valletPropertiesData';

/**
 * Servicio de datos para Vallet Asesoría Inmobiliaria
 * Desacopla la lógica de consultas de los componentes de UI (Estándar Qaway V4)
 */

export async function getProperties({ type = 'TODOS', district = 'TODOS', search = '' } = {}) {
  let filtered = [...valletProperties];

  if (type !== 'TODOS') {
    filtered = filtered.filter((p) => p.type === type);
  }

  if (district !== 'TODOS') {
    filtered = filtered.filter((p) => p.location.toLowerCase().includes(district.toLowerCase()));
  }

  if (search.trim()) {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter((p) =>
      p.title.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.tagline.toLowerCase().includes(q)
    );
  }

  return filtered;
}

export async function getPropertyBySlug(slug) {
  const property = valletProperties.find((p) => p.slug === slug);
  return property || null;
}

export async function getAllProperties() {
  return [...valletProperties];
}
