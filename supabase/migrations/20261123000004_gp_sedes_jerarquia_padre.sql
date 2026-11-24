-- =====================================================================
-- Jerarquía multi-nivel en public.gp_sedes (sede_padre_id)
-- =====================================================================
-- Permite construir árboles N-niveles en una sola tabla:
--   Sede Principal -> Sucursal / DRE / GRE -> Sub-sucursal / UGEL -> ...
-- 100% aditiva y compatible con empresas comerciales (multi-sucursal)
-- y con el tenant territorial MINEDU/DIGERE.

ALTER TABLE public.gp_sedes
  ADD COLUMN IF NOT EXISTS sede_padre_id uuid NULL
  REFERENCES public.gp_sedes(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_gp_sedes_empresa_padre
  ON public.gp_sedes (empresa_id, sede_padre_id);

-- Normalizar las 3 GRE (Arequipa, La Libertad, Lambayeque) como nivel regional ('dre')
UPDATE public.gp_sedes
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{origen_unit_type}', '"dre"'::jsonb, true)
WHERE metadata->>'origen_gestor_unidad_id' IS NOT NULL
  AND nombre LIKE 'GRE %'
  AND COALESCE(metadata->>'origen_unit_type', '') <> 'dre';

-- Enlazar cada UGEL / RED a su DRE / GRE padre por empresa y departamento
UPDATE public.gp_sedes AS hija
SET sede_padre_id = padre.id
FROM public.gp_sedes AS padre
WHERE hija.empresa_id = padre.empresa_id
  AND hija.sede_padre_id IS NULL
  AND hija.metadata->>'origen_gestor_unidad_id' IS NOT NULL
  AND hija.nombre NOT LIKE 'DRE %'
  AND hija.nombre NOT LIKE 'GRE %'
  AND (padre.nombre LIKE 'DRE %' OR padre.nombre LIKE 'GRE %')
  AND upper(trim(padre.departamento)) = upper(trim(hija.departamento));
