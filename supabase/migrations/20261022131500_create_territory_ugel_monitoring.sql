-- Migración: Tabla dedicada para Monitoreo Territorial de UGELs (MINEDU Hito 1.6 - Cuadro de Distribución MC SIGA)
CREATE TABLE IF NOT EXISTS public.territory_ugel_monitoring (
    id TEXT PRIMARY KEY,
    region TEXT NOT NULL DEFAULT 'Junín',
    number INTEGER NOT NULL,
    name TEXT NOT NULL,
    milestone_code TEXT NOT NULL DEFAULT 'H1.6',
    phase1_files INTEGER NOT NULL DEFAULT 3,
    phase1_total INTEGER NOT NULL DEFAULT 3,
    phase1_date TEXT NOT NULL DEFAULT '15/10/2026 12:00',
    phase2_files INTEGER NOT NULL DEFAULT 0,
    phase2_total INTEGER NOT NULL DEFAULT 3,
    phase2_date TEXT NOT NULL DEFAULT 'En plazo hasta 26/10',
    drive_status TEXT NOT NULL DEFAULT 'pendiente',
    drive_files INTEGER NOT NULL DEFAULT 0,
    drive_total INTEGER NOT NULL DEFAULT 1,
    drive_date TEXT NOT NULL DEFAULT 'En proceso',
    directions JSONB NOT NULL DEFAULT '{}'::jsonb,
    observation TEXT NOT NULL DEFAULT '',
    gestor_name TEXT NOT NULL DEFAULT 'Carlos Sandoval',
    gestor_phone TEXT NOT NULL DEFAULT '+51964112233',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_territory_ugel_region ON public.territory_ugel_monitoring(region);
CREATE INDEX IF NOT EXISTS idx_territory_ugel_number ON public.territory_ugel_monitoring(number);

-- Habilitar RLS
ALTER TABLE public.territory_ugel_monitoring ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas para el Hub (Lectura pública / autenticada, Modificación para roles del sistema)
DROP POLICY IF EXISTS "Permitir lectura general territorio" ON public.territory_ugel_monitoring;
CREATE POLICY "Permitir lectura general territorio"
    ON public.territory_ugel_monitoring
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Permitir insercion territorio" ON public.territory_ugel_monitoring;
CREATE POLICY "Permitir insercion territorio"
    ON public.territory_ugel_monitoring
    FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir actualizacion territorio" ON public.territory_ugel_monitoring;
CREATE POLICY "Permitir actualizacion territorio"
    ON public.territory_ugel_monitoring
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Seed oficial de las 13 UGELs de la Región Junín en estricto orden alfabético
INSERT INTO public.territory_ugel_monitoring (
    id, region, number, name, milestone_code,
    phase1_files, phase1_total, phase1_date,
    drive_status, drive_files, drive_total, drive_date,
    phase2_files, phase2_total, phase2_date,
    directions, observation, gestor_name, gestor_phone
)
VALUES
(
    'ugel-chanchamayo', 'Junín', 1, 'CHANCHAMAYO', 'H1.6',
    3, 3, '15/10/2026 12:00',
    'completado', 1, 1, '22/10/2026 09:45',
    3, 3, '22/10/2026 16:30',
    '{"DEI": "completado", "DEBA": "completado", "DISER": "completado", "DIGEBR": "completado", "DIGEDD": "completado", "DIFOID": "completado", "DITEN": "completado"}'::jsonb,
    'Fase 1 culminada al 100%. Reporte formal y Drive regional cerrado con visto bueno.',
    'Carlos Sandoval', '+51964112233'
),
(
    'ugel-chupaca', 'Junín', 2, 'CHUPACA', 'H1.6',
    3, 3, '15/10/2026 12:30',
    'completado', 1, 1, '22/10/2026 10:15',
    3, 3, '22/10/2026 17:00',
    '{"DEI": "completado", "DEBA": "completado", "DISER": "completado", "DIGEBR": "completado", "DIGEDD": "completado", "DIFOID": "completado", "DITEN": "completado"}'::jsonb,
    'Cuadro validado con directores de red. Registro en SIGA al 100% y RAR formalizado.',
    'Carlos Sandoval', '+51964112233'
),
(
    'ugel-concepcion', 'Junín', 3, 'CONCEPCIÓN', 'H1.6',
    3, 3, '15/10/2026 13:10',
    'completado', 1, 1, '22/10/2026 11:20',
    3, 3, '22/10/2026 18:00',
    '{"DEI": "completado", "DEBA": "completado", "DISER": "completado", "DIGEBR": "completado", "DIGEDD": "completado", "DIFOID": "completado", "DITEN": "completado"}'::jsonb,
    'Todas las IIEE rurales integradas. Archivos en Drive validados y RAR oficial entregado.',
    'Carlos Sandoval', '+51964112233'
),
(
    'ugel-huancayo', 'Junín', 4, 'HUANCAYO', 'H1.6',
    3, 3, '15/10/2026 14:00',
    'pendiente', 0, 1, 'Sin evidencia',
    0, 3, 'En plazo hasta 26/10',
    '{"DEI": "completado", "DEBA": "pendiente", "DISER": "pendiente", "DIGEBR": "completado", "DIGEDD": "pendiente", "DIFOID": "pendiente", "DITEN": "completado"}'::jsonb,
    'Fase 1 OK. Pendiente consolidación en Drive Regional; cierre formal RAR programado antes del 26/10.',
    'Carlos Sandoval', '+51964112233'
),
(
    'ugel-jauja', 'Junín', 5, 'JAUJA', 'H1.6',
    3, 3, '15/10/2026 15:40',
    'completado', 1, 1, '22/10/2026 08:30',
    3, 3, '22/10/2026 19:15',
    '{"DEI": "completado", "DEBA": "completado", "DISER": "completado", "DIGEBR": "completado", "DIGEDD": "completado", "DIFOID": "completado", "DITEN": "completado"}'::jsonb,
    'Proceso culminado satisfactoriamente. Evidencias en Drive regional y RAR verificado.',
    'Carlos Sandoval', '+51964112233'
),
(
    'ugel-junin', 'Junín', 6, 'JUNÍN', 'H1.6',
    3, 3, '15/10/2026 16:15',
    'pendiente', 0, 1, 'Sin evidencia',
    0, 3, 'En plazo hasta 26/10',
    '{"DEI": "completado", "DEBA": "pendiente", "DISER": "pendiente", "DIGEBR": "completado", "DIGEDD": "pendiente", "DIFOID": "pendiente", "DITEN": "completado"}'::jsonb,
    'Fase 1 SIGA OK. Se requiere apoyo en carga al Drive Regional; RAR oficial en plazo legal.',
    'Carlos Sandoval', '+51964112233'
),
(
    'ugel-pangoa', 'Junín', 7, 'PANGOA', 'H1.6',
    3, 3, '15/10/2026 17:00',
    'completado', 1, 1, '22/10/2026 09:10',
    0, 3, 'En plazo hasta 26/10',
    '{"DEI": "completado", "DEBA": "en_proceso", "DISER": "en_proceso", "DIGEBR": "completado", "DIGEDD": "en_proceso", "DIFOID": "en_proceso", "DITEN": "completado"}'::jsonb,
    'Evidencia Drive cargada al 100%. Tramitando visto bueno de DRE para emisión de RAR hasta el 26/10.',
    'Carlos Sandoval', '+51964112233'
),
(
    'ugel-pichanaqui', 'Junín', 8, 'PICHANAQUI', 'H1.6',
    3, 3, '15/10/2026 18:00',
    'completado', 1, 1, '22/10/2026 12:40',
    0, 3, 'En plazo hasta 26/10',
    '{"DEI": "completado", "DEBA": "en_proceso", "DISER": "en_proceso", "DIGEBR": "completado", "DIGEDD": "en_proceso", "DIFOID": "en_proceso", "DITEN": "completado"}'::jsonb,
    'Drive regional completo; elaboración de RAR oficial en curso dentro del cronograma.',
    'Carlos Sandoval', '+51964112233'
),
(
    'ugel-rio-ene-mantaro', 'Junín', 9, 'RÍO ENE MANTARO', 'H1.6',
    3, 3, '15/10/2026 18:30',
    'en_proceso', 0, 1, 'En proceso',
    0, 3, 'En plazo hasta 26/10',
    '{"DEI": "completado", "DEBA": "en_proceso", "DISER": "en_proceso", "DIGEBR": "completado", "DIGEDD": "en_proceso", "DIFOID": "en_proceso", "DITEN": "completado"}'::jsonb,
    'Dificultades de conectividad en VRAEM para subida a Drive; Fase 1 SIGA validada y RAR en plazo.',
    'Carlos Sandoval', '+51964112233'
),
(
    'ugel-rio-tambo', 'Junín', 10, 'RÍO TAMBO', 'H1.6',
    3, 3, '15/10/2026 19:10',
    'completado', 1, 1, '22/10/2026 13:00',
    3, 3, '22/10/2026 20:00',
    '{"DEI": "completado", "DEBA": "completado", "DISER": "completado", "DIGEBR": "completado", "DIGEDD": "completado", "DIFOID": "completado", "DITEN": "completado"}'::jsonb,
    'Completado al 100% en las 3 fases. Documentación integral visada por el director de UGEL.',
    'Carlos Sandoval', '+51964112233'
),
(
    'ugel-satipo', 'Junín', 11, 'SATIPO', 'H1.6',
    3, 3, '15/10/2026 13:45',
    'completado', 1, 1, '22/10/2026 11:00',
    0, 3, 'En plazo hasta 26/10',
    '{"DEI": "completado", "DEBA": "en_proceso", "DISER": "en_proceso", "DIGEBR": "completado", "DIGEDD": "en_proceso", "DIFOID": "en_proceso", "DITEN": "completado"}'::jsonb,
    'Fase 1 OK y Drive cerrado. Trámite de RAR oficial en asesoría jurídica hasta el 26/10.',
    'Carlos Sandoval', '+51964112233'
),
(
    'ugel-tarma', 'Junín', 12, 'TARMA', 'H1.6',
    3, 3, '15/10/2026 14:10',
    'completado', 1, 1, '22/10/2026 10:30',
    0, 3, 'En plazo hasta 26/10',
    '{"DEI": "completado", "DEBA": "en_proceso", "DISER": "en_proceso", "DIGEBR": "completado", "DIGEDD": "en_proceso", "DIFOID": "en_proceso", "DITEN": "completado"}'::jsonb,
    'Excel en Drive OK; procesando cierre oficial RAR en MC SIGA hasta 26/10.',
    'Carlos Sandoval', '+51964112233'
),
(
    'ugel-yauli', 'Junín', 13, 'YAULI', 'H1.6',
    3, 3, '15/10/2026 16:00',
    'en_proceso', 0, 1, 'En proceso',
    0, 3, 'En plazo hasta 26/10',
    '{"DEI": "completado", "DEBA": "en_proceso", "DISER": "en_proceso", "DIGEBR": "completado", "DIGEDD": "en_proceso", "DIFOID": "en_proceso", "DITEN": "completado"}'::jsonb,
    'Fase 1 OK. Subida a Drive en proceso; cierre oficial RAR en plazo regular.',
    'Carlos Sandoval', '+51964112233'
)
ON CONFLICT (id) DO UPDATE SET
    region = EXCLUDED.region,
    number = EXCLUDED.number,
    name = EXCLUDED.name,
    milestone_code = EXCLUDED.milestone_code,
    phase1_files = EXCLUDED.phase1_files,
    phase1_total = EXCLUDED.phase1_total,
    phase1_date = EXCLUDED.phase1_date,
    drive_status = EXCLUDED.drive_status,
    drive_files = EXCLUDED.drive_files,
    drive_total = EXCLUDED.drive_total,
    drive_date = EXCLUDED.drive_date,
    phase2_files = EXCLUDED.phase2_files,
    phase2_total = EXCLUDED.phase2_total,
    phase2_date = EXCLUDED.phase2_date,
    directions = EXCLUDED.directions,
    observation = EXCLUDED.observation,
    gestor_name = EXCLUDED.gestor_name,
    gestor_phone = EXCLUDED.gestor_phone,
    updated_at = timezone('utc'::text, now());
