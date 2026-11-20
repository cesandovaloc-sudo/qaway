/**
 * appCatalogCache.ts — id de app_catalog compartido (dato de referencia).
 *
 * Antes, HubAccessGuard y el Gestor de Proyectos pedían por separado el id de
 * 'gestor-proyectos' para poder leer user_app_roles. El slug -> id no depende
 * del usuario: se resuelve una vez y se reutiliza en todo el flujo.
 *
 * No cambia permisos ni RLS: solo evita repetir una lectura ya verificada.
 */
type AppRow = { id: string } | null;
type Resultado = { data: AppRow; error: unknown };

const cache = new Map<string, string>();
const enVuelo = new Map<string, Promise<Resultado>>();

export function getAppIdCacheado(slug: string | null | undefined, supabase: any): Promise<Resultado> {
  if (!slug || !supabase) return Promise.resolve({ data: null, error: null });

  if (cache.has(slug)) {
    return Promise.resolve({ data: { id: cache.get(slug)! }, error: null });
  }
  const pendiente = enVuelo.get(slug);
  if (pendiente) return pendiente;

  const promesa: Promise<Resultado> = supabase
    .from('app_catalog')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()
    .then((res: any) => {
      const id = res?.error ? null : res?.data?.id != null ? String(res.data.id) : null;
      if (id) cache.set(slug, id);
      return { data: id ? { id } : null, error: res?.error ?? null };
    })
    .finally(() => {
      enVuelo.delete(slug);
    });

  enVuelo.set(slug, promesa);
  return promesa;
}

/** Solo al cambiar de identidad; el slug -> id es dato fijo. */
export function invalidarAppCatalog(): void {
  cache.clear();
  enVuelo.clear();
}
