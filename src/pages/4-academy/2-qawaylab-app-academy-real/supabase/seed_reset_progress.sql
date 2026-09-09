-- Reset Progress + Videos cortos para pruebas
-- ============================================
-- 1. Eliminar todo el progreso existente
DELETE FROM public.progress;

-- 2. Actualizar videos a cortos (~2-3 min) para pruebas en curso 1 (Desarrollo Web)
UPDATE public.lessons SET video_url = CASE id
  -- Lecciones 1-5: Videos cortos de Fireship (~2 min c/u)
  WHEN 'b0000101-0000-0000-0000-000000000001' THEN 'https://www.youtube.com/embed/DC471a9qrU4'   -- Array Map in 100s
  WHEN 'b0000102-0000-0000-0000-000000000001' THEN 'https://www.youtube.com/embed/g2o22C3CRfU'   -- Big-O in 100s
  WHEN 'b0000103-0000-0000-0000-000000000001' THEN 'https://www.youtube.com/embed/qgRUr-YUk1Q'   -- JS Modules in 100s
  WHEN 'b0000104-0000-0000-0000-000000000001' THEN 'https://www.youtube.com/embed/zQnBQ4tB3ZA'   -- TypeScript in 100s
  WHEN 'b0000105-0000-0000-0000-000000000001' THEN 'https://www.youtube.com/embed/hwP7WQkmECE'   -- Git in 100s
  WHEN 'b0000106-0000-0000-0000-000000000001' THEN 'https://www.youtube.com/embed/DC471a9qrU4'   -- Repetir para pruebas
  WHEN 'b0000107-0000-0000-0000-000000000001' THEN 'https://www.youtube.com/embed/g2o22C3CRfU'
  WHEN 'b0000108-0000-0000-0000-000000000001' THEN 'https://www.youtube.com/embed/qgRUr-YUk1Q'
  WHEN 'b0000109-0000-0000-0000-000000000001' THEN 'https://www.youtube.com/embed/zQnBQ4tB3ZA'
END
WHERE id IN (
  'b0000101-0000-0000-0000-000000000001',
  'b0000102-0000-0000-0000-000000000001',
  'b0000103-0000-0000-0000-000000000001',
  'b0000104-0000-0000-0000-000000000001',
  'b0000105-0000-0000-0000-000000000001',
  'b0000106-0000-0000-0000-000000000001',
  'b0000107-0000-0000-0000-000000000001',
  'b0000108-0000-0000-0000-000000000001',
  'b0000109-0000-0000-0000-000000000001'
);

-- 3. Actualizar duración a ~2 min para las lecciones del curso 1
UPDATE public.lessons SET duration = '2 min'
WHERE id IN (
  'b0000101-0000-0000-0000-000000000001',
  'b0000102-0000-0000-0000-000000000001',
  'b0000103-0000-0000-0000-000000000001',
  'b0000104-0000-0000-0000-000000000001',
  'b0000105-0000-0000-0000-000000000001',
  'b0000106-0000-0000-0000-000000000001',
  'b0000107-0000-0000-0000-000000000001',
  'b0000108-0000-0000-0000-000000000001',
  'b0000109-0000-0000-0000-000000000001'
);
