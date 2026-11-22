-- Opción A aprobada (22-11-2026): unificar gp_config_gestion_proyectos.unidad_responsable_id
-- hacia public.gestor_unidades(id) (cuyo id es text, no uuid).

ALTER TABLE public.gp_config_gestion_proyectos
  DROP CONSTRAINT IF EXISTS gp_config_gestion_proyectos_unidad_responsable_id_fkey;

ALTER TABLE public.gp_config_gestion_proyectos
  ALTER COLUMN unidad_responsable_id TYPE text USING unidad_responsable_id::text;

UPDATE public.gp_config_gestion_proyectos
SET unidad_responsable_id = NULL
WHERE unidad_responsable_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.gestor_unidades gu WHERE gu.id = unidad_responsable_id
  );

ALTER TABLE public.gp_config_gestion_proyectos
  ADD CONSTRAINT gp_config_gestion_proyectos_unidad_responsable_id_fkey
  FOREIGN KEY (unidad_responsable_id)
  REFERENCES public.gestor_unidades(id)
  ON DELETE SET NULL;
