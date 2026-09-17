// Configuración de rutas y metadatos de CoraVet (Compatible con Standalone y Monorepo Qaway)
export const BASE_PATH = import.meta.env.VITE_CORAVET_BASE ?? '/proyectos/coravet';

export const coraLink = (path: string): string => {
  if (!path || path.startsWith('http') || path.startsWith('mailto:') || path.startsWith('tel:')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (cleanPath === '/') {
    return BASE_PATH || '/';
  }
  return `${BASE_PATH}${cleanPath}`;
};
