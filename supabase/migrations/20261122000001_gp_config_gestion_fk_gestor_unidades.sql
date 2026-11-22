-- Opción A aprobada (22-11-2026): unificar gp_config_gestion_proyectos.unidad_responsable_id
-- hacia public.gestor_unidades(id), única fuente de verdad del árbol organizacional.

ALTER TABLE public.gp_config_gestion_proyectos
  DROP CONSTRAINT IF EXISTS gp_config_gestion_proyectos_unidad_responsable_id_fkey;

ALTER TABLE public.gp_config_gestion_proyectos
  ADD CONSTRAINT gp_config_gestion_proyectos_unidad_responsable_id_fkey
  FOREIGN KEY (unidad_responsable_id)
  REFERENCES public.gestor_unidades(id)
  ON DELETE SET NULL;
