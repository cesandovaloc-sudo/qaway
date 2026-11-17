-- ==============================================================================
-- GESTOR DE PROYECTOS 2 . MIGRACION 0016 (aditiva, idempotente)
-- Fecha: 2026-11-17 | Convencion: gp_* / _c catalogos
-- Objetivo: catalogo de CATEGORIAS de entregable (tabla 7.1) + tipos (tabla 7)
--   en dos tablas normalizadas: gp_categorias_entregable_c (24) y
--   gp_tipos_entregable_c (261), con FK categoria_codigo -> categorias.codigo.
-- SIN DROP / SIN TRUNCATE / SOLO ADITIVO / idempotente.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- S0 . LIMPIEZA DE VERSION INTEGRADA (0016 previa, si se aplico)
ALTER TABLE public.gp_tipos_entregable_c
  DROP COLUMN IF EXISTS categoria;
ALTER TABLE public.gp_tipos_entregable_c
  DROP COLUMN IF EXISTS categoria_icono;

-- S1 . TABLA DE CATEGORIAS (7.1) - nueva
CREATE TABLE IF NOT EXISTS public.gp_categorias_entregable_c (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo      text NOT NULL,
  nombre      text NOT NULL,
  alias       text NOT NULL,
  descripcion text,
  icono       text,
  alcance     text,
  activo      boolean NOT NULL DEFAULT true,
  orden       integer DEFAULT 0,
  metadata    jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(codigo)
);

ALTER TABLE public.gp_categorias_entregable_c ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS gp_categorias_entregable_c_select ON public.gp_categorias_entregable_c;
CREATE POLICY gp_categorias_entregable_c_select ON public.gp_categorias_entregable_c
  FOR SELECT TO authenticated
  USING (public.user_can_use_app('gestor-proyectos'));
DROP POLICY IF EXISTS gp_categorias_entregable_c_insert ON public.gp_categorias_entregable_c;
CREATE POLICY gp_categorias_entregable_c_insert ON public.gp_categorias_entregable_c
  FOR INSERT TO authenticated WITH CHECK (public.is_platform_admin());
DROP POLICY IF EXISTS gp_categorias_entregable_c_update ON public.gp_categorias_entregable_c;
CREATE POLICY gp_categorias_entregable_c_update ON public.gp_categorias_entregable_c
  FOR UPDATE TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());
DROP POLICY IF EXISTS gp_categorias_entregable_c_delete ON public.gp_categorias_entregable_c;
CREATE POLICY gp_categorias_entregable_c_delete ON public.gp_categorias_entregable_c
  FOR DELETE TO authenticated USING (public.is_platform_admin());

COMMENT ON TABLE public.gp_categorias_entregable_c IS
'Catalogo de CATEGORIAS de entregable (agrupador de tipos). Columnas: id = identificador tecnico uuid (PK) . codigo = codigo de la categoria (ej. GEN, DIR), UNIQUE, referenciado por gp_tipos_entregable_c.categoria_codigo . nombre = nombre de la categoria en espanol . alias = nombre en ESPANOL que ve el usuario (igual a nombre) . descripcion = definicion amigable . icono = nombre de icono Lucide (kebab-case) . alcance = Transversal/Proyectos/Sectorial . activo = baja logica . orden = orden de presentacion (generales primero) . metadata = extension jsonb reservada ({}) . created_at = creacion de la fila . updated_at = ultima modificacion.';

-- S2 . AJUSTE DE TABLA DE TIPOS (7): columna categoria_codigo + icono + orden
ALTER TABLE public.gp_tipos_entregable_c
  ADD COLUMN IF NOT EXISTS categoria_codigo text;
ALTER TABLE public.gp_tipos_entregable_c
  ADD COLUMN IF NOT EXISTS icono text;
ALTER TABLE public.gp_tipos_entregable_c
  ADD COLUMN IF NOT EXISTS orden integer DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'gp_tipos_entregable_c_categoria_codigo_fkey') THEN
    ALTER TABLE public.gp_tipos_entregable_c
      ADD CONSTRAINT gp_tipos_entregable_c_categoria_codigo_fkey
      FOREIGN KEY (categoria_codigo) REFERENCES public.gp_categorias_entregable_c(codigo) ON UPDATE CASCADE;
  END IF;
END $$;

COMMENT ON TABLE public.gp_tipos_entregable_c IS
'Catalogo de TIPOS DE ENTREGABLE del proyecto (documento, hito, producto, etc.). La categoria vive en gp_categorias_entregable_c (tabla 7.1); aqui solo se referencia por categoria_codigo. Columnas: id = identificador tecnico uuid (PK) . codigo = codigo estable del tipo (ej. GEN-001), UNIQUE, clave referenciada por gp_entregables.tipo_codigo (NULL-able, ON UPDATE CASCADE) - NO es la PK . categoria_codigo = FK a gp_categorias_entregable_c.codigo . nombre = termino en espanol (no se traduce, no hay estandar ingles unico) . alias = nombre en ESPANOL que ve el usuario (igual a nombre) . descripcion = definicion amigable del tipo . icono = nombre de icono Lucide del tipo (kebab-case) . activo = baja logica (true = vigente) . orden = orden de presentacion global (generales primero) . metadata = extension jsonb reservada (incluye alcance) . created_at = creacion de la fila . updated_at = ultima modificacion. Referenciado por gp_entregables (tabla 19, tipo_codigo NULL-able).';

-- S3 . SEED CATEGORIAS (24) - idempotente
INSERT INTO public.gp_categorias_entregable_c (codigo, nombre, alias, descripcion, icono, alcance, activo, orden, metadata)
VALUES
('GEN', 'Generales y gestión cotidiana', 'Generales y gestión cotidiana', NULL, 'folder-open', 'Transversal', true, 1, jsonb_build_object('alcance', 'Transversal')),
('DIR', 'Dirección y gestión de proyectos', 'Dirección y gestión de proyectos', NULL, 'briefcase-business', 'Proyectos', true, 2, jsonb_build_object('alcance', 'Proyectos')),
('EST', 'Estudios, diagnóstico y evaluación', 'Estudios, diagnóstico y evaluación', NULL, 'search-check', 'Proyectos', true, 3, jsonb_build_object('alcance', 'Proyectos')),
('REQ', 'Requisitos y especificaciones', 'Requisitos y especificaciones', NULL, 'list-checks', 'Proyectos', true, 4, jsonb_build_object('alcance', 'Proyectos')),
('DIS', 'Diseño, ingeniería y desarrollo', 'Diseño, ingeniería y desarrollo', NULL, 'drafting-compass', 'Proyectos', true, 5, jsonb_build_object('alcance', 'Proyectos')),
('LEG', 'Legal, permisos y cumplimiento', 'Legal, permisos y cumplimiento', NULL, 'scale', 'Transversal', true, 6, jsonb_build_object('alcance', 'Transversal')),
('ADQ', 'Compras y contrataciones', 'Compras y contrataciones', NULL, 'shopping-cart', 'Transversal', true, 7, jsonb_build_object('alcance', 'Transversal')),
('OBR', 'Obras e infraestructura', 'Obras e infraestructura', NULL, 'hard-hat', 'Sectorial', true, 8, jsonb_build_object('alcance', 'Sectorial')),
('TIC', 'Tecnología y soluciones digitales', 'Tecnología y soluciones digitales', NULL, 'monitor-cog', 'Sectorial', true, 9, jsonb_build_object('alcance', 'Sectorial')),
('CAL', 'Calidad, pruebas y aceptación', 'Calidad, pruebas y aceptación', NULL, 'badge-check', 'Transversal', true, 10, jsonb_build_object('alcance', 'Transversal')),
('SAS', 'Seguridad, ambiente y gestión social', 'Seguridad, ambiente y gestión social', NULL, 'shield-check', 'Transversal', true, 11, jsonb_build_object('alcance', 'Transversal')),
('FIN', 'Finanzas y presupuesto', 'Finanzas y presupuesto', NULL, 'wallet', 'Transversal', true, 12, jsonb_build_object('alcance', 'Transversal')),
('CAP', 'Capacitación y conocimiento', 'Capacitación y conocimiento', NULL, 'graduation-cap', 'Transversal', true, 13, jsonb_build_object('alcance', 'Transversal')),
('PTO', 'Implementación y operación', 'Implementación y operación', NULL, 'workflow', 'Proyectos', true, 14, jsonb_build_object('alcance', 'Proyectos')),
('SEG', 'Seguimiento, indicadores y resultados', 'Seguimiento, indicadores y resultados', NULL, 'chart-no-axes-combined', 'Transversal', true, 15, jsonb_build_object('alcance', 'Transversal')),
('CIE', 'Cierre y liquidación', 'Cierre y liquidación', NULL, 'file-check', 'Proyectos', true, 16, jsonb_build_object('alcance', 'Proyectos')),
('COM', 'Comunicaciones y prensa', 'Comunicaciones y prensa', NULL, 'megaphone', 'Sectorial', true, 17, jsonb_build_object('alcance', 'Sectorial')),
('MKT', 'Marketing y marca', 'Marketing y marca', NULL, 'target', 'Sectorial', true, 18, jsonb_build_object('alcance', 'Sectorial')),
('VEN', 'Ventas y desarrollo comercial', 'Ventas y desarrollo comercial', NULL, 'handshake', 'Sectorial', true, 19, jsonb_build_object('alcance', 'Sectorial')),
('CLI', 'Atención al cliente y experiencia', 'Atención al cliente y experiencia', NULL, 'messages-square', 'Sectorial', true, 20, jsonb_build_object('alcance', 'Sectorial')),
('RRH', 'Personas y recursos humanos', 'Personas y recursos humanos', NULL, 'users', 'Transversal', true, 21, jsonb_build_object('alcance', 'Transversal')),
('EVE', 'Eventos y actividades', 'Eventos y actividades', NULL, 'calendar-days', 'Sectorial', true, 22, jsonb_build_object('alcance', 'Sectorial')),
('OPE', 'Operaciones y logística', 'Operaciones y logística', NULL, 'package', 'Sectorial', true, 23, jsonb_build_object('alcance', 'Sectorial')),
('DAT', 'Datos, investigación y analítica', 'Datos, investigación y analítica', NULL, 'database', 'Transversal', true, 24, jsonb_build_object('alcance', 'Transversal'))
ON CONFLICT (codigo) DO NOTHING;

-- S4 . SEED TIPOS (261) - idempotente
INSERT INTO public.gp_tipos_entregable_c (codigo, categoria_codigo, nombre, alias, descripcion, icono, activo, orden, metadata)
VALUES
('GEN-001', 'GEN', 'Informe', 'Informe', 'Documento que comunica análisis, hechos, resultados o recomendaciones.', 'file-text', true, 1, jsonb_build_object('alcance', 'Transversal')),
('GEN-002', 'GEN', 'Reporte periódico', 'Reporte periódico', 'Resumen recurrente de actividad, avance o resultados.', 'clipboard-list', true, 2, jsonb_build_object('alcance', 'Transversal')),
('GEN-003', 'GEN', 'Acta de reunión', 'Acta de reunión', 'Registro formal de asistentes, temas, acuerdos y responsables.', 'clipboard-check', true, 3, jsonb_build_object('alcance', 'Transversal')),
('GEN-004', 'GEN', 'Minuta de reunión', 'Minuta de reunión', 'Síntesis breve de conversación, decisiones y pendientes.', 'notebook-pen', true, 4, jsonb_build_object('alcance', 'Transversal')),
('GEN-005', 'GEN', 'Agenda de reunión', 'Agenda de reunión', 'Orden de temas previstos para una reunión.', 'calendar-clock', true, 5, jsonb_build_object('alcance', 'Transversal')),
('GEN-006', 'GEN', 'Convocatoria', 'Convocatoria', 'Comunicación formal para convocar a una reunión o actividad.', 'mail', true, 6, jsonb_build_object('alcance', 'Transversal')),
('GEN-007', 'GEN', 'Lista de asistencia', 'Lista de asistencia', 'Registro de participantes y asistencia.', 'list-checks', true, 7, jsonb_build_object('alcance', 'Transversal')),
('GEN-008', 'GEN', 'Memorando', 'Memorando', 'Comunicación interna formal.', 'file-text', true, 8, jsonb_build_object('alcance', 'Transversal')),
('GEN-009', 'GEN', 'Oficio', 'Oficio', 'Comunicación formal entre entidades u organizaciones.', 'file-text', true, 9, jsonb_build_object('alcance', 'Transversal')),
('GEN-010', 'GEN', 'Carta', 'Carta', 'Comunicación formal dirigida a una persona u organización.', 'mail', true, 10, jsonb_build_object('alcance', 'Transversal')),
('GEN-011', 'GEN', 'Correo de comunicación', 'Correo de comunicación', 'Mensaje formal o informativo enviado por correo.', 'mail', true, 11, jsonb_build_object('alcance', 'Transversal')),
('GEN-012', 'GEN', 'Presentación', 'Presentación', 'Material visual para exponer información o propuestas.', 'presentation', true, 12, jsonb_build_object('alcance', 'Transversal')),
('GEN-013', 'GEN', 'Registro', 'Registro', 'Conjunto estructurado de datos o hechos.', 'table', true, 13, jsonb_build_object('alcance', 'Transversal')),
('GEN-014', 'GEN', 'Listado', 'Listado', 'Relación organizada de elementos, personas o actividades.', 'list', true, 14, jsonb_build_object('alcance', 'Transversal')),
('GEN-015', 'GEN', 'Matriz', 'Matriz', 'Información organizada en filas y columnas para análisis o control.', 'grid-3x3', true, 15, jsonb_build_object('alcance', 'Transversal')),
('GEN-016', 'GEN', 'Plan', 'Plan', 'Documento que define objetivos, acciones, responsables y plazos.', 'clipboard-list', true, 16, jsonb_build_object('alcance', 'Transversal')),
('GEN-017', 'GEN', 'Procedimiento', 'Procedimiento', 'Descripción ordenada de cómo ejecutar una actividad.', 'list-ordered', true, 17, jsonb_build_object('alcance', 'Transversal')),
('GEN-018', 'GEN', 'Manual', 'Manual', 'Documento de instrucciones, reglas o uso.', 'book-open', true, 18, jsonb_build_object('alcance', 'Transversal')),
('GEN-019', 'GEN', 'Guía', 'Guía', 'Orientación práctica para realizar una actividad.', 'book-open-check', true, 19, jsonb_build_object('alcance', 'Transversal')),
('GEN-020', 'GEN', 'Formato o plantilla', 'Formato o plantilla', 'Estructura reutilizable para registrar o presentar información.', 'file-input', true, 20, jsonb_build_object('alcance', 'Transversal')),
('GEN-021', 'GEN', 'Constancia', 'Constancia', 'Documento que deja constancia de un hecho o participación.', 'file-check', true, 21, jsonb_build_object('alcance', 'Transversal')),
('GEN-022', 'GEN', 'Certificado', 'Certificado', 'Documento que acredita una condición, competencia o cumplimiento.', 'award', true, 22, jsonb_build_object('alcance', 'Transversal')),
('GEN-023', 'GEN', 'Propuesta', 'Propuesta', 'Documento que plantea una solución, servicio o iniciativa.', 'file-pen-line', true, 23, jsonb_build_object('alcance', 'Transversal')),
('GEN-024', 'GEN', 'Presupuesto', 'Presupuesto', 'Estimación organizada de ingresos, costos o gastos.', 'calculator', true, 24, jsonb_build_object('alcance', 'Transversal')),
('GEN-025', 'GEN', 'Cronograma', 'Cronograma', 'Programación temporal de actividades y fechas.', 'calendar-range', true, 25, jsonb_build_object('alcance', 'Transversal')),
('GEN-026', 'GEN', 'Expediente', 'Expediente', 'Conjunto organizado de documentos relacionados con un asunto.', 'folder', true, 26, jsonb_build_object('alcance', 'Transversal')),
('GEN-027', 'GEN', 'Solicitud', 'Solicitud', 'Pedido formal de acción, recurso, información o aprobación.', 'file-plus', true, 27, jsonb_build_object('alcance', 'Transversal')),
('GEN-028', 'GEN', 'Autorización', 'Autorización', 'Documento o registro que formaliza una aprobación o permiso.', 'badge-check', true, 28, jsonb_build_object('alcance', 'Transversal')),
('GEN-029', 'GEN', 'Comunicado interno', 'Comunicado interno', 'Mensaje dirigido al personal de la organización.', 'megaphone', true, 29, jsonb_build_object('alcance', 'Transversal')),
('GEN-030', 'GEN', 'Boletín interno', 'Boletín interno', 'Publicación periódica de novedades y anuncios.', 'newspaper', true, 30, jsonb_build_object('alcance', 'Transversal')),
('GEN-031', 'GEN', 'Resumen ejecutivo', 'Resumen ejecutivo', 'Síntesis de los puntos clave para toma de decisiones.', 'file-chart-column', true, 31, jsonb_build_object('alcance', 'Transversal')),
('GEN-032', 'GEN', 'Presentación de resultados', 'Presentación de resultados', 'Exposición de resultados, indicadores o conclusiones.', 'chart-no-axes-combined', true, 32, jsonb_build_object('alcance', 'Transversal')),
('DIR-001', 'DIR', 'Acta de constitución del proyecto', 'Acta de constitución del proyecto', 'Autoriza formalmente el proyecto y define su propósito.', 'file-check', true, 33, jsonb_build_object('alcance', 'Proyectos')),
('DIR-002', 'DIR', 'Plan para la dirección del proyecto', 'Plan para la dirección del proyecto', 'Integra los planes subsidiarios y criterios de gestión.', 'clipboard-list', true, 34, jsonb_build_object('alcance', 'Proyectos')),
('DIR-003', 'DIR', 'Plan de gobernanza', 'Plan de gobernanza', 'Define órganos, decisiones, escalamiento y responsabilidades.', 'landmark', true, 35, jsonb_build_object('alcance', 'Proyectos')),
('DIR-004', 'DIR', 'EDT / WBS', 'EDT / WBS', 'Descomposición jerárquica del alcance del proyecto.', 'network', true, 36, jsonb_build_object('alcance', 'Proyectos')),
('DIR-005', 'DIR', 'Diccionario de la EDT', 'Diccionario de la EDT', 'Describe componentes, paquetes y criterios de trabajo.', 'book-text', true, 37, jsonb_build_object('alcance', 'Proyectos')),
('DIR-006', 'DIR', 'Matriz RACI', 'Matriz RACI', 'Asigna responsabilidades por actividad o entregable.', 'table', true, 38, jsonb_build_object('alcance', 'Proyectos')),
('DIR-007', 'DIR', 'Registro de interesados', 'Registro de interesados', 'Identifica actores, intereses e influencia.', 'users', true, 39, jsonb_build_object('alcance', 'Proyectos')),
('DIR-008', 'DIR', 'Informe de estado del proyecto', 'Informe de estado del proyecto', 'Comunica situación, alertas y decisiones requeridas.', 'activity', true, 40, jsonb_build_object('alcance', 'Proyectos')),
('DIR-009', 'DIR', 'Informe ejecutivo de avance', 'Informe ejecutivo de avance', 'Síntesis para patrocinadores y dirección.', 'file-chart-line', true, 41, jsonb_build_object('alcance', 'Proyectos')),
('DIR-010', 'DIR', 'Solicitud de cambio', 'Solicitud de cambio', 'Registra una modificación propuesta al proyecto.', 'file-edit', true, 42, jsonb_build_object('alcance', 'Proyectos')),
('DIR-011', 'DIR', 'Registro de decisiones', 'Registro de decisiones', 'Documenta decisiones, responsables y fechas.', 'book-check', true, 43, jsonb_build_object('alcance', 'Proyectos')),
('DIR-012', 'DIR', 'Informe de cierre de gestión', 'Informe de cierre de gestión', 'Consolida gestión, resultados y pendientes.', 'file-check-2', true, 44, jsonb_build_object('alcance', 'Proyectos')),
('EST-001', 'EST', 'Diagnóstico situacional', 'Diagnóstico situacional', 'Describe la situación actual y brechas.', 'scan-search', true, 45, jsonb_build_object('alcance', 'Proyectos')),
('EST-002', 'EST', 'Estudio de necesidades', 'Estudio de necesidades', 'Identifica necesidades y población objetivo.', 'file-search', true, 46, jsonb_build_object('alcance', 'Proyectos')),
('EST-003', 'EST', 'Estudio de mercado', 'Estudio de mercado', 'Analiza oferta, demanda y condiciones del mercado.', 'chart-no-axes-combined', true, 47, jsonb_build_object('alcance', 'Proyectos')),
('EST-004', 'EST', 'Estudio de alternativas', 'Estudio de alternativas', 'Compara opciones de solución.', 'git-compare', true, 48, jsonb_build_object('alcance', 'Proyectos')),
('EST-005', 'EST', 'Estudio de prefactibilidad', 'Estudio de prefactibilidad', 'Evalúa preliminarmente viabilidad y conveniencia.', 'file-search', true, 49, jsonb_build_object('alcance', 'Proyectos')),
('EST-006', 'EST', 'Estudio de factibilidad', 'Estudio de factibilidad', 'Determina viabilidad técnica, económica y operativa.', 'file-check', true, 50, jsonb_build_object('alcance', 'Proyectos')),
('EST-007', 'EST', 'Estudio técnico', 'Estudio técnico', 'Desarrolla condiciones y solución técnica.', 'settings', true, 51, jsonb_build_object('alcance', 'Proyectos')),
('EST-008', 'EST', 'Evaluación económica', 'Evaluación económica', 'Analiza costos, beneficios y sostenibilidad económica.', 'calculator', true, 52, jsonb_build_object('alcance', 'Proyectos')),
('EST-009', 'EST', 'Estudio de impacto', 'Estudio de impacto', 'Evalúa efectos previstos de una intervención.', 'chart-line', true, 53, jsonb_build_object('alcance', 'Proyectos')),
('EST-010', 'EST', 'Estudio de localización', 'Estudio de localización', 'Analiza la ubicación más conveniente.', 'map-pin', true, 54, jsonb_build_object('alcance', 'Proyectos')),
('EST-011', 'EST', 'Levantamiento de información', 'Levantamiento de información', 'Recopila datos primarios y secundarios.', 'clipboard-list', true, 55, jsonb_build_object('alcance', 'Proyectos')),
('EST-012', 'EST', 'Informe de evaluación', 'Informe de evaluación', 'Presenta resultados y recomendaciones de evaluación.', 'file-chart-column', true, 56, jsonb_build_object('alcance', 'Proyectos')),
('REQ-001', 'REQ', 'Documento de requisitos', 'Documento de requisitos', 'Consolida necesidades y requisitos del producto o servicio.', 'list-checks', true, 57, jsonb_build_object('alcance', 'Proyectos')),
('REQ-002', 'REQ', 'Matriz de requisitos', 'Matriz de requisitos', 'Organiza requisitos, fuentes, prioridad y estado.', 'table', true, 58, jsonb_build_object('alcance', 'Proyectos')),
('REQ-003', 'REQ', 'Especificaciones técnicas', 'Especificaciones técnicas', 'Define características técnicas verificables.', 'ruler', true, 59, jsonb_build_object('alcance', 'Proyectos')),
('REQ-004', 'REQ', 'Especificaciones funcionales', 'Especificaciones funcionales', 'Define funciones y comportamientos esperados.', 'workflow', true, 60, jsonb_build_object('alcance', 'Proyectos')),
('REQ-005', 'REQ', 'Términos de referencia', 'Términos de referencia', 'Define objeto, alcance, condiciones y productos de un servicio.', 'file-text', true, 61, jsonb_build_object('alcance', 'Proyectos')),
('REQ-006', 'REQ', 'Criterios de aceptación', 'Criterios de aceptación', 'Establece condiciones para aceptar un resultado.', 'badge-check', true, 62, jsonb_build_object('alcance', 'Proyectos')),
('REQ-007', 'REQ', 'Matriz de trazabilidad', 'Matriz de trazabilidad', 'Relaciona requisitos con diseño, pruebas y entregables.', 'network', true, 63, jsonb_build_object('alcance', 'Proyectos')),
('REQ-008', 'REQ', 'Alcance aprobado', 'Alcance aprobado', 'Documento que delimita inclusiones y exclusiones.', 'scan', true, 64, jsonb_build_object('alcance', 'Proyectos')),
('DIS-001', 'DIS', 'Anteproyecto', 'Anteproyecto', 'Propuesta preliminar de solución o diseño.', 'drafting-compass', true, 65, jsonb_build_object('alcance', 'Proyectos')),
('DIS-002', 'DIS', 'Diseño conceptual', 'Diseño conceptual', 'Define el concepto y enfoque de solución.', 'lightbulb', true, 66, jsonb_build_object('alcance', 'Proyectos')),
('DIS-003', 'DIS', 'Diseño preliminar', 'Diseño preliminar', 'Desarrolla una solución antes del diseño definitivo.', 'pencil-ruler', true, 67, jsonb_build_object('alcance', 'Proyectos')),
('DIS-004', 'DIS', 'Diseño definitivo', 'Diseño definitivo', 'Define la solución lista para ejecución o construcción.', 'ruler', true, 68, jsonb_build_object('alcance', 'Proyectos')),
('DIS-005', 'DIS', 'Planos generales', 'Planos generales', 'Representación gráfica general de una solución.', 'layers', true, 69, jsonb_build_object('alcance', 'Proyectos')),
('DIS-006', 'DIS', 'Planos de detalle', 'Planos de detalle', 'Representación técnica detallada.', 'maximize', true, 70, jsonb_build_object('alcance', 'Proyectos')),
('DIS-007', 'DIS', 'Memoria descriptiva', 'Memoria descriptiva', 'Explica características, criterios y componentes del diseño.', 'file-text', true, 71, jsonb_build_object('alcance', 'Proyectos')),
('DIS-008', 'DIS', 'Memoria de cálculo', 'Memoria de cálculo', 'Documenta cálculos y supuestos técnicos.', 'calculator', true, 72, jsonb_build_object('alcance', 'Proyectos')),
('DIS-009', 'DIS', 'Modelo BIM', 'Modelo BIM', 'Modelo de información de construcción.', 'box', true, 73, jsonb_build_object('alcance', 'Proyectos')),
('DIS-010', 'DIS', 'Prototipo', 'Prototipo', 'Versión inicial para probar una solución.', 'blocks', true, 74, jsonb_build_object('alcance', 'Proyectos')),
('DIS-011', 'DIS', 'Expediente técnico', 'Expediente técnico', 'Conjunto de documentos técnicos para ejecución.', 'folder-check', true, 75, jsonb_build_object('alcance', 'Proyectos')),
('LEG-001', 'LEG', 'Informe legal', 'Informe legal', 'Análisis jurídico de un asunto.', 'scale', true, 76, jsonb_build_object('alcance', 'Transversal')),
('LEG-002', 'LEG', 'Contrato', 'Contrato', 'Acuerdo formal entre partes.', 'file-signature', true, 77, jsonb_build_object('alcance', 'Transversal')),
('LEG-003', 'LEG', 'Adenda contractual', 'Adenda contractual', 'Modificación formal de un contrato.', 'file-pen-line', true, 78, jsonb_build_object('alcance', 'Transversal')),
('LEG-004', 'LEG', 'Convenio interinstitucional', 'Convenio interinstitucional', 'Acuerdo de colaboración entre organizaciones.', 'handshake', true, 79, jsonb_build_object('alcance', 'Transversal')),
('LEG-005', 'LEG', 'Licencia o permiso', 'Licencia o permiso', 'Autorización emitida por autoridad competente.', 'badge-check', true, 80, jsonb_build_object('alcance', 'Transversal')),
('LEG-006', 'LEG', 'Resolución de aprobación', 'Resolución de aprobación', 'Acto formal que aprueba una decisión o expediente.', 'file-check', true, 81, jsonb_build_object('alcance', 'Transversal')),
('LEG-007', 'LEG', 'Matriz de cumplimiento normativo', 'Matriz de cumplimiento normativo', 'Relación de obligaciones y evidencias de cumplimiento.', 'list-checks', true, 82, jsonb_build_object('alcance', 'Transversal')),
('LEG-008', 'LEG', 'Expediente de autorización', 'Expediente de autorización', 'Documentación para tramitar una autorización.', 'folder', true, 83, jsonb_build_object('alcance', 'Transversal')),
('ADQ-001', 'ADQ', 'Plan de adquisiciones', 'Plan de adquisiciones', 'Programa de bienes y servicios requeridos.', 'shopping-cart', true, 84, jsonb_build_object('alcance', 'Transversal')),
('ADQ-002', 'ADQ', 'Solicitud de cotización', 'Solicitud de cotización', 'Pedido de precios y condiciones a proveedores.', 'file-text', true, 85, jsonb_build_object('alcance', 'Transversal')),
('ADQ-003', 'ADQ', 'Cuadro comparativo de cotizaciones', 'Cuadro comparativo de cotizaciones', 'Comparación de ofertas recibidas.', 'table', true, 86, jsonb_build_object('alcance', 'Transversal')),
('ADQ-004', 'ADQ', 'Evaluación de proveedores', 'Evaluación de proveedores', 'Análisis de capacidad y desempeño de proveedores.', 'users', true, 87, jsonb_build_object('alcance', 'Transversal')),
('ADQ-005', 'ADQ', 'Orden de compra', 'Orden de compra', 'Documento que formaliza una compra.', 'shopping-bag', true, 88, jsonb_build_object('alcance', 'Transversal')),
('ADQ-006', 'ADQ', 'Orden de servicio', 'Orden de servicio', 'Documento que formaliza la contratación de un servicio.', 'clipboard-check', true, 89, jsonb_build_object('alcance', 'Transversal')),
('ADQ-007', 'ADQ', 'Acta de recepción', 'Acta de recepción', 'Registra recepción de bienes o servicios.', 'package-check', true, 90, jsonb_build_object('alcance', 'Transversal')),
('ADQ-008', 'ADQ', 'Informe de conformidad', 'Informe de conformidad', 'Acredita cumplimiento de condiciones contratadas.', 'badge-check', true, 91, jsonb_build_object('alcance', 'Transversal')),
('ADQ-009', 'ADQ', 'Expediente de contratación', 'Expediente de contratación', 'Conjunto de documentos del proceso de contratación.', 'folder', true, 92, jsonb_build_object('alcance', 'Transversal')),
('OBR-001', 'OBR', 'Terreno habilitado', 'Terreno habilitado', 'Área preparada para iniciar trabajos.', 'map', true, 93, jsonb_build_object('alcance', 'Sectorial')),
('OBR-002', 'OBR', 'Movimiento de tierras ejecutado', 'Movimiento de tierras ejecutado', 'Trabajo de excavación, corte o relleno realizado.', 'shovel', true, 94, jsonb_build_object('alcance', 'Sectorial')),
('OBR-003', 'OBR', 'Cimentaciones ejecutadas', 'Cimentaciones ejecutadas', 'Cimentaciones construidas conforme al diseño.', 'construction', true, 95, jsonb_build_object('alcance', 'Sectorial')),
('OBR-004', 'OBR', 'Estructura ejecutada', 'Estructura ejecutada', 'Estructura construida y verificable.', 'building-2', true, 96, jsonb_build_object('alcance', 'Sectorial')),
('OBR-005', 'OBR', 'Instalaciones ejecutadas', 'Instalaciones ejecutadas', 'Instalaciones implementadas en obra.', 'plug', true, 97, jsonb_build_object('alcance', 'Sectorial')),
('OBR-006', 'OBR', 'Acabados ejecutados', 'Acabados ejecutados', 'Acabados instalados y terminados.', 'paint-roller', true, 98, jsonb_build_object('alcance', 'Sectorial')),
('OBR-007', 'OBR', 'Equipamiento instalado', 'Equipamiento instalado', 'Equipos colocados y conectados.', 'wrench', true, 99, jsonb_build_object('alcance', 'Sectorial')),
('OBR-008', 'OBR', 'Obra terminada', 'Obra terminada', 'Infraestructura concluida.', 'hard-hat', true, 100, jsonb_build_object('alcance', 'Sectorial')),
('OBR-009', 'OBR', 'Planos conforme a obra', 'Planos conforme a obra', 'Planos actualizados según lo ejecutado.', 'map', true, 101, jsonb_build_object('alcance', 'Sectorial')),
('OBR-010', 'OBR', 'Valorización de obra', 'Valorización de obra', 'Medición y valoración económica del avance.', 'calculator', true, 102, jsonb_build_object('alcance', 'Sectorial')),
('OBR-011', 'OBR', 'Acta de recepción de obra', 'Acta de recepción de obra', 'Formaliza la recepción de la obra.', 'file-check', true, 103, jsonb_build_object('alcance', 'Sectorial')),
('OBR-012', 'OBR', 'Expediente de liquidación', 'Expediente de liquidación', 'Documentación técnica y económica de liquidación.', 'folder-check', true, 104, jsonb_build_object('alcance', 'Sectorial')),
('TIC-001', 'TIC', 'Arquitectura tecnológica', 'Arquitectura tecnológica', 'Define componentes y relaciones de una solución TI.', 'network', true, 105, jsonb_build_object('alcance', 'Sectorial')),
('TIC-002', 'TIC', 'Diseño de solución digital', 'Diseño de solución digital', 'Diseño funcional y técnico de una solución digital.', 'monitor', true, 106, jsonb_build_object('alcance', 'Sectorial')),
('TIC-003', 'TIC', 'Aplicación desarrollada', 'Aplicación desarrollada', 'Software implementado para un propósito.', 'app-window', true, 107, jsonb_build_object('alcance', 'Sectorial')),
('TIC-004', 'TIC', 'Módulo de software', 'Módulo de software', 'Componente funcional de una aplicación.', 'blocks', true, 108, jsonb_build_object('alcance', 'Sectorial')),
('TIC-005', 'TIC', 'Base de datos implementada', 'Base de datos implementada', 'Estructura de datos configurada y operativa.', 'database', true, 109, jsonb_build_object('alcance', 'Sectorial')),
('TIC-006', 'TIC', 'Integración de sistemas', 'Integración de sistemas', 'Conexión e intercambio entre sistemas.', 'workflow', true, 110, jsonb_build_object('alcance', 'Sectorial')),
('TIC-007', 'TIC', 'API desarrollada', 'API desarrollada', 'Interfaz de integración disponible.', 'code', true, 111, jsonb_build_object('alcance', 'Sectorial')),
('TIC-008', 'TIC', 'Migración de datos', 'Migración de datos', 'Traslado y validación de datos entre plataformas.', 'database-zap', true, 112, jsonb_build_object('alcance', 'Sectorial')),
('TIC-009', 'TIC', 'Manual técnico', 'Manual técnico', 'Documentación técnica de operación y mantenimiento.', 'book-text', true, 113, jsonb_build_object('alcance', 'Sectorial')),
('TIC-010', 'TIC', 'Manual de usuario', 'Manual de usuario', 'Instrucciones para usuarios finales.', 'book-open', true, 114, jsonb_build_object('alcance', 'Sectorial')),
('TIC-011', 'TIC', 'Informe de pruebas de software', 'Informe de pruebas de software', 'Resultados de pruebas funcionales y técnicas.', 'test-tube', true, 115, jsonb_build_object('alcance', 'Sectorial')),
('TIC-012', 'TIC', 'Sistema desplegado', 'Sistema desplegado', 'Solución publicada en el entorno objetivo.', 'cloud-upload', true, 116, jsonb_build_object('alcance', 'Sectorial')),
('CAL-001', 'CAL', 'Plan de calidad', 'Plan de calidad', 'Define estándares y controles de calidad.', 'badge-check', true, 117, jsonb_build_object('alcance', 'Transversal')),
('CAL-002', 'CAL', 'Protocolo de pruebas', 'Protocolo de pruebas', 'Define método, condiciones y criterios de prueba.', 'clipboard-list', true, 118, jsonb_build_object('alcance', 'Transversal')),
('CAL-003', 'CAL', 'Informe de pruebas', 'Informe de pruebas', 'Registra resultados de pruebas realizadas.', 'file-chart-column', true, 119, jsonb_build_object('alcance', 'Transversal')),
('CAL-004', 'CAL', 'Informe de inspección', 'Informe de inspección', 'Documenta observaciones de una inspección.', 'search-check', true, 120, jsonb_build_object('alcance', 'Transversal')),
('CAL-005', 'CAL', 'Registro de no conformidades', 'Registro de no conformidades', 'Documenta incumplimientos detectados.', 'alert-circle', true, 121, jsonb_build_object('alcance', 'Transversal')),
('CAL-006', 'CAL', 'Plan de acciones correctivas', 'Plan de acciones correctivas', 'Define acciones para corregir desviaciones.', 'list-checks', true, 122, jsonb_build_object('alcance', 'Transversal')),
('CAL-007', 'CAL', 'Informe de validación', 'Informe de validación', 'Demuestra que el resultado satisface el uso previsto.', 'badge-check', true, 123, jsonb_build_object('alcance', 'Transversal')),
('CAL-008', 'CAL', 'Acta de conformidad', 'Acta de conformidad', 'Formaliza aceptación conforme a criterios establecidos.', 'file-check', true, 124, jsonb_build_object('alcance', 'Transversal')),
('SAS-001', 'SAS', 'Matriz de riesgos', 'Matriz de riesgos', 'Identifica, evalúa y prioriza riesgos.', 'shield-alert', true, 125, jsonb_build_object('alcance', 'Transversal')),
('SAS-002', 'SAS', 'Plan de seguridad y salud', 'Plan de seguridad y salud', 'Establece controles de seguridad laboral.', 'hard-hat', true, 126, jsonb_build_object('alcance', 'Transversal')),
('SAS-003', 'SAS', 'Plan de manejo ambiental', 'Plan de manejo ambiental', 'Define medidas ambientales.', 'leaf', true, 127, jsonb_build_object('alcance', 'Transversal')),
('SAS-004', 'SAS', 'Estudio de impacto ambiental', 'Estudio de impacto ambiental', 'Evalúa impactos ambientales de una intervención.', 'trees', true, 128, jsonb_build_object('alcance', 'Transversal')),
('SAS-005', 'SAS', 'Plan de gestión social', 'Plan de gestión social', 'Organiza la relación con comunidades y actores sociales.', 'users', true, 129, jsonb_build_object('alcance', 'Transversal')),
('SAS-006', 'SAS', 'Plan de contingencia', 'Plan de contingencia', 'Define respuestas ante eventos imprevistos.', 'shield-check', true, 130, jsonb_build_object('alcance', 'Transversal')),
('SAS-007', 'SAS', 'Informe de incidentes', 'Informe de incidentes', 'Registra incidentes y medidas adoptadas.', 'clipboard-x', true, 131, jsonb_build_object('alcance', 'Transversal')),
('SAS-008', 'SAS', 'Informe de cumplimiento ambiental', 'Informe de cumplimiento ambiental', 'Evidencia cumplimiento de compromisos ambientales.', 'file-check', true, 132, jsonb_build_object('alcance', 'Transversal')),
('FIN-001', 'FIN', 'Presupuesto del proyecto', 'Presupuesto del proyecto', 'Estimación aprobada de recursos económicos.', 'calculator', true, 133, jsonb_build_object('alcance', 'Transversal')),
('FIN-002', 'FIN', 'Estructura de costos', 'Estructura de costos', 'Desglose de costos por componente o actividad.', 'table', true, 134, jsonb_build_object('alcance', 'Transversal')),
('FIN-003', 'FIN', 'Flujo de caja', 'Flujo de caja', 'Proyección de entradas y salidas de efectivo.', 'chart-no-axes-combined', true, 135, jsonb_build_object('alcance', 'Transversal')),
('FIN-004', 'FIN', 'Cronograma valorizado', 'Cronograma valorizado', 'Distribución temporal del presupuesto o valorizaciones.', 'calendar-range', true, 136, jsonb_build_object('alcance', 'Transversal')),
('FIN-005', 'FIN', 'Informe de ejecución presupuestal', 'Informe de ejecución presupuestal', 'Compara presupuesto y ejecución.', 'chart-column', true, 137, jsonb_build_object('alcance', 'Transversal')),
('FIN-006', 'FIN', 'Informe de gastos', 'Informe de gastos', 'Detalla gastos incurridos.', 'receipt', true, 138, jsonb_build_object('alcance', 'Transversal')),
('FIN-007', 'FIN', 'Solicitud de pago', 'Solicitud de pago', 'Solicita autorización de pago.', 'file-text', true, 139, jsonb_build_object('alcance', 'Transversal')),
('FIN-008', 'FIN', 'Liquidación financiera', 'Liquidación financiera', 'Consolida ingresos, gastos y saldos finales.', 'file-spreadsheet', true, 140, jsonb_build_object('alcance', 'Transversal')),
('CAP-001', 'CAP', 'Plan de capacitación', 'Plan de capacitación', 'Define necesidades, objetivos y programación formativa.', 'graduation-cap', true, 141, jsonb_build_object('alcance', 'Transversal')),
('CAP-002', 'CAP', 'Programa de capacitación', 'Programa de capacitación', 'Organiza sesiones y contenidos formativos.', 'calendar-days', true, 142, jsonb_build_object('alcance', 'Transversal')),
('CAP-003', 'CAP', 'Material de capacitación', 'Material de capacitación', 'Presentaciones, guías y recursos didácticos.', 'presentation', true, 143, jsonb_build_object('alcance', 'Transversal')),
('CAP-004', 'CAP', 'Manual de procedimientos', 'Manual de procedimientos', 'Describe procesos y pasos operativos.', 'book-open', true, 144, jsonb_build_object('alcance', 'Transversal')),
('CAP-005', 'CAP', 'Registro de participantes', 'Registro de participantes', 'Relación de personas capacitadas.', 'users', true, 145, jsonb_build_object('alcance', 'Transversal')),
('CAP-006', 'CAP', 'Informe de capacitación', 'Informe de capacitación', 'Consolida ejecución y resultados formativos.', 'file-chart-column', true, 146, jsonb_build_object('alcance', 'Transversal')),
('CAP-007', 'CAP', 'Evaluación de aprendizaje', 'Evaluación de aprendizaje', 'Mide conocimientos o competencias adquiridas.', 'clipboard-check', true, 147, jsonb_build_object('alcance', 'Transversal')),
('CAP-008', 'CAP', 'Acta de transferencia', 'Acta de transferencia', 'Registra transferencia de conocimiento o tecnología.', 'handshake', true, 148, jsonb_build_object('alcance', 'Transversal')),
('PTO-001', 'PTO', 'Plan de puesta en marcha', 'Plan de puesta en marcha', 'Organiza preparación y activación de una solución.', 'workflow', true, 149, jsonb_build_object('alcance', 'Proyectos')),
('PTO-002', 'PTO', 'Protocolo de puesta en servicio', 'Protocolo de puesta en servicio', 'Define verificaciones previas a operación.', 'clipboard-check', true, 150, jsonb_build_object('alcance', 'Proyectos')),
('PTO-003', 'PTO', 'Acta de instalación', 'Acta de instalación', 'Registra instalación de equipos o componentes.', 'file-check', true, 151, jsonb_build_object('alcance', 'Proyectos')),
('PTO-004', 'PTO', 'Acta de puesta en marcha', 'Acta de puesta en marcha', 'Formaliza inicio de operación.', 'play-circle', true, 152, jsonb_build_object('alcance', 'Proyectos')),
('PTO-005', 'PTO', 'Plan de mantenimiento', 'Plan de mantenimiento', 'Define actividades y frecuencias de mantenimiento.', 'wrench', true, 153, jsonb_build_object('alcance', 'Proyectos')),
('PTO-006', 'PTO', 'Inventario de activos entregados', 'Inventario de activos entregados', 'Relación de activos transferidos a operación.', 'package', true, 154, jsonb_build_object('alcance', 'Proyectos')),
('PTO-007', 'PTO', 'Acta de transferencia operativa', 'Acta de transferencia operativa', 'Formaliza entrega al área responsable de operar.', 'handshake', true, 155, jsonb_build_object('alcance', 'Proyectos')),
('SEG-001', 'SEG', 'Línea base del proyecto', 'Línea base del proyecto', 'Referencia aprobada para medir desempeño.', 'chart-no-axes-combined', true, 156, jsonb_build_object('alcance', 'Transversal')),
('SEG-002', 'SEG', 'Informe de seguimiento', 'Informe de seguimiento', 'Actualiza situación y avance del proyecto.', 'activity', true, 157, jsonb_build_object('alcance', 'Transversal')),
('SEG-003', 'SEG', 'Tablero de indicadores', 'Tablero de indicadores', 'Visualiza métricas y resultados.', 'layout-dashboard', true, 158, jsonb_build_object('alcance', 'Transversal')),
('SEG-004', 'SEG', 'Informe de cumplimiento de metas', 'Informe de cumplimiento de metas', 'Compara metas planificadas y alcanzadas.', 'target', true, 159, jsonb_build_object('alcance', 'Transversal')),
('SEG-005', 'SEG', 'Informe de desviaciones', 'Informe de desviaciones', 'Explica diferencias respecto al plan.', 'chart-line', true, 160, jsonb_build_object('alcance', 'Transversal')),
('SEG-006', 'SEG', 'Evaluación intermedia', 'Evaluación intermedia', 'Valora desempeño durante la ejecución.', 'clipboard-check', true, 161, jsonb_build_object('alcance', 'Transversal')),
('SEG-007', 'SEG', 'Evaluación final', 'Evaluación final', 'Valora resultados al cierre.', 'file-check', true, 162, jsonb_build_object('alcance', 'Transversal')),
('SEG-008', 'SEG', 'Registro de lecciones aprendidas', 'Registro de lecciones aprendidas', 'Documenta aprendizajes reutilizables.', 'book-open-check', true, 163, jsonb_build_object('alcance', 'Transversal')),
('CIE-001', 'CIE', 'Acta de culminación', 'Acta de culminación', 'Deja constancia de culminación de trabajos.', 'file-check', true, 164, jsonb_build_object('alcance', 'Proyectos')),
('CIE-002', 'CIE', 'Acta de recepción final', 'Acta de recepción final', 'Formaliza recepción definitiva.', 'clipboard-check', true, 165, jsonb_build_object('alcance', 'Proyectos')),
('CIE-003', 'CIE', 'Informe de cierre técnico', 'Informe de cierre técnico', 'Consolida resultados técnicos y cumplimiento.', 'file-check-2', true, 166, jsonb_build_object('alcance', 'Proyectos')),
('CIE-004', 'CIE', 'Informe de cierre administrativo', 'Informe de cierre administrativo', 'Consolida documentación y obligaciones administrativas.', 'folder-check', true, 167, jsonb_build_object('alcance', 'Proyectos')),
('CIE-005', 'CIE', 'Informe de cierre financiero', 'Informe de cierre financiero', 'Consolida situación financiera final.', 'calculator', true, 168, jsonb_build_object('alcance', 'Proyectos')),
('CIE-006', 'CIE', 'Liquidación contractual', 'Liquidación contractual', 'Determina cierre económico y contractual.', 'file-spreadsheet', true, 169, jsonb_build_object('alcance', 'Proyectos')),
('CIE-007', 'CIE', 'Expediente de cierre', 'Expediente de cierre', 'Reúne documentación final del proyecto.', 'archive', true, 170, jsonb_build_object('alcance', 'Proyectos')),
('CIE-008', 'CIE', 'Informe final del proyecto', 'Informe final del proyecto', 'Resume objetivos, resultados y conclusiones.', 'file-chart-column', true, 171, jsonb_build_object('alcance', 'Proyectos')),
('COM-001', 'COM', 'Plan de comunicación', 'Plan de comunicación', 'Define públicos, mensajes, canales y calendario.', 'messages-square', true, 172, jsonb_build_object('alcance', 'Sectorial')),
('COM-002', 'COM', 'Comunicado de prensa', 'Comunicado de prensa', 'Comunicación oficial dirigida a medios.', 'newspaper', true, 173, jsonb_build_object('alcance', 'Sectorial')),
('COM-003', 'COM', 'Nota de prensa', 'Nota de prensa', 'Contenido informativo para difusión periodística.', 'file-text', true, 174, jsonb_build_object('alcance', 'Sectorial')),
('COM-004', 'COM', 'Boletín institucional', 'Boletín institucional', 'Publicación periódica de noticias institucionales.', 'newspaper', true, 175, jsonb_build_object('alcance', 'Sectorial')),
('COM-005', 'COM', 'Entrevista', 'Entrevista', 'Contenido de preguntas y respuestas con vocería o invitado.', 'mic', true, 176, jsonb_build_object('alcance', 'Sectorial')),
('COM-006', 'COM', 'Artículo institucional', 'Artículo institucional', 'Texto informativo o de opinión institucional.', 'file-pen-line', true, 177, jsonb_build_object('alcance', 'Sectorial')),
('COM-007', 'COM', 'Discurso o mensaje institucional', 'Discurso o mensaje institucional', 'Texto para intervención pública o institucional.', 'speech', true, 178, jsonb_build_object('alcance', 'Sectorial')),
('COM-008', 'COM', 'Dossier de prensa', 'Dossier de prensa', 'Paquete de información para medios.', 'folder-open', true, 179, jsonb_build_object('alcance', 'Sectorial')),
('COM-009', 'COM', 'Monitoreo de medios', 'Monitoreo de medios', 'Seguimiento de menciones y cobertura mediática.', 'radio', true, 180, jsonb_build_object('alcance', 'Sectorial')),
('COM-010', 'COM', 'Plan de comunicación de crisis', 'Plan de comunicación de crisis', 'Protocolo de comunicación ante contingencias reputacionales.', 'shield-alert', true, 181, jsonb_build_object('alcance', 'Sectorial')),
('COM-011', 'COM', 'Comunicado interno', 'Comunicado interno', 'Mensaje institucional dirigido al personal.', 'megaphone', true, 182, jsonb_build_object('alcance', 'Sectorial')),
('COM-012', 'COM', 'Memoria institucional', 'Memoria institucional', 'Documento que resume actividades y logros institucionales.', 'book-open', true, 183, jsonb_build_object('alcance', 'Sectorial')),
('COM-013', 'COM', 'Kit de prensa', 'Kit de prensa', 'Recursos gráficos y datos para periodistas.', 'package', true, 184, jsonb_build_object('alcance', 'Sectorial')),
('COM-014', 'COM', 'Cobertura fotográfica', 'Cobertura fotográfica', 'Registro fotográfico de actividades o eventos.', 'camera', true, 185, jsonb_build_object('alcance', 'Sectorial')),
('COM-015', 'COM', 'Cobertura audiovisual', 'Cobertura audiovisual', 'Registro en video de actividades o eventos.', 'video', true, 186, jsonb_build_object('alcance', 'Sectorial')),
('MKT-001', 'MKT', 'Plan de marketing', 'Plan de marketing', 'Define objetivos, segmentos, estrategia y acciones.', 'target', true, 187, jsonb_build_object('alcance', 'Sectorial')),
('MKT-002', 'MKT', 'Estrategia de marca', 'Estrategia de marca', 'Define posicionamiento, identidad y diferenciación.', 'fingerprint', true, 188, jsonb_build_object('alcance', 'Sectorial')),
('MKT-003', 'MKT', 'Manual de identidad visual', 'Manual de identidad visual', 'Normas de uso de marca y recursos visuales.', 'palette', true, 189, jsonb_build_object('alcance', 'Sectorial')),
('MKT-004', 'MKT', 'Campaña publicitaria', 'Campaña publicitaria', 'Conjunto coordinado de acciones publicitarias.', 'megaphone', true, 190, jsonb_build_object('alcance', 'Sectorial')),
('MKT-005', 'MKT', 'Brief creativo', 'Brief creativo', 'Documento de orientación para una pieza o campaña.', 'file-pen-line', true, 191, jsonb_build_object('alcance', 'Sectorial')),
('MKT-006', 'MKT', 'Calendario de contenidos', 'Calendario de contenidos', 'Programación de publicaciones y contenidos.', 'calendar-days', true, 192, jsonb_build_object('alcance', 'Sectorial')),
('MKT-007', 'MKT', 'Pieza gráfica', 'Pieza gráfica', 'Diseño visual para comunicación o publicidad.', 'image', true, 193, jsonb_build_object('alcance', 'Sectorial')),
('MKT-008', 'MKT', 'Video promocional', 'Video promocional', 'Pieza audiovisual para promocionar una oferta.', 'video', true, 194, jsonb_build_object('alcance', 'Sectorial')),
('MKT-009', 'MKT', 'Landing page', 'Landing page', 'Página enfocada en una campaña o conversión.', 'panels-top-left', true, 195, jsonb_build_object('alcance', 'Sectorial')),
('MKT-010', 'MKT', 'Publicación para redes sociales', 'Publicación para redes sociales', 'Contenido preparado para canales sociales.', 'instagram', true, 196, jsonb_build_object('alcance', 'Sectorial')),
('MKT-011', 'MKT', 'Reporte de campaña', 'Reporte de campaña', 'Resultados y métricas de una campaña.', 'chart-column', true, 197, jsonb_build_object('alcance', 'Sectorial')),
('MKT-012', 'MKT', 'Estudio de audiencia', 'Estudio de audiencia', 'Análisis de públicos y comportamiento.', 'users', true, 198, jsonb_build_object('alcance', 'Sectorial')),
('MKT-013', 'MKT', 'Plan de medios', 'Plan de medios', 'Distribución de inversión y espacios publicitarios.', 'radio', true, 199, jsonb_build_object('alcance', 'Sectorial')),
('MKT-014', 'MKT', 'Catálogo comercial', 'Catálogo comercial', 'Presentación organizada de productos o servicios.', 'book-image', true, 200, jsonb_build_object('alcance', 'Sectorial')),
('MKT-015', 'MKT', 'Material POP', 'Material POP', 'Material promocional para punto de venta.', 'store', true, 201, jsonb_build_object('alcance', 'Sectorial')),
('MKT-016', 'MKT', 'Newsletter', 'Newsletter', 'Boletín enviado por correo electrónico.', 'mail', true, 202, jsonb_build_object('alcance', 'Sectorial')),
('VEN-001', 'VEN', 'Plan comercial', 'Plan comercial', 'Objetivos, segmentos, canales y metas de ventas.', 'briefcase-business', true, 203, jsonb_build_object('alcance', 'Sectorial')),
('VEN-002', 'VEN', 'Propuesta comercial', 'Propuesta comercial', 'Oferta de productos o servicios para un cliente.', 'file-text', true, 204, jsonb_build_object('alcance', 'Sectorial')),
('VEN-003', 'VEN', 'Cotización', 'Cotización', 'Detalle de precios, condiciones y vigencia.', 'receipt', true, 205, jsonb_build_object('alcance', 'Sectorial')),
('VEN-004', 'VEN', 'Presentación comercial', 'Presentación comercial', 'Material para presentar una oferta o solución.', 'presentation', true, 206, jsonb_build_object('alcance', 'Sectorial')),
('VEN-005', 'VEN', 'Pipeline comercial', 'Pipeline comercial', 'Seguimiento de oportunidades de venta.', 'filter', true, 207, jsonb_build_object('alcance', 'Sectorial')),
('VEN-006', 'VEN', 'Ficha de cliente', 'Ficha de cliente', 'Información comercial y de contacto de un cliente.', 'contact', true, 208, jsonb_build_object('alcance', 'Sectorial')),
('VEN-007', 'VEN', 'Reporte de ventas', 'Reporte de ventas', 'Resultados de ventas por periodo o segmento.', 'chart-column', true, 209, jsonb_build_object('alcance', 'Sectorial')),
('VEN-008', 'VEN', 'Contrato comercial', 'Contrato comercial', 'Acuerdo formal con un cliente o aliado.', 'file-signature', true, 210, jsonb_build_object('alcance', 'Sectorial')),
('VEN-009', 'VEN', 'Plan de cuenta', 'Plan de cuenta', 'Estrategia de atención y desarrollo de una cuenta.', 'users', true, 211, jsonb_build_object('alcance', 'Sectorial')),
('VEN-010', 'VEN', 'Acuerdo de alianza', 'Acuerdo de alianza', 'Documento de colaboración comercial.', 'handshake', true, 212, jsonb_build_object('alcance', 'Sectorial')),
('CLI-001', 'CLI', 'Protocolo de atención', 'Protocolo de atención', 'Estándar para atender consultas y solicitudes.', 'messages-square', true, 213, jsonb_build_object('alcance', 'Sectorial')),
('CLI-002', 'CLI', 'Registro de consultas', 'Registro de consultas', 'Seguimiento de consultas recibidas.', 'message-circle', true, 214, jsonb_build_object('alcance', 'Sectorial')),
('CLI-003', 'CLI', 'Registro de reclamos', 'Registro de reclamos', 'Registro y seguimiento de inconformidades.', 'message-square-warning', true, 215, jsonb_build_object('alcance', 'Sectorial')),
('CLI-004', 'CLI', 'Respuesta a reclamo', 'Respuesta a reclamo', 'Comunicación de solución o respuesta al reclamo.', 'mail-check', true, 216, jsonb_build_object('alcance', 'Sectorial')),
('CLI-005', 'CLI', 'Encuesta de satisfacción', 'Encuesta de satisfacción', 'Medición de percepción y satisfacción.', 'clipboard-list', true, 217, jsonb_build_object('alcance', 'Sectorial')),
('CLI-006', 'CLI', 'Informe de satisfacción', 'Informe de satisfacción', 'Análisis de resultados de satisfacción.', 'chart-column', true, 218, jsonb_build_object('alcance', 'Sectorial')),
('CLI-007', 'CLI', 'Mapa de experiencia del cliente', 'Mapa de experiencia del cliente', 'Representación de interacciones y puntos de contacto.', 'route', true, 219, jsonb_build_object('alcance', 'Sectorial')),
('CLI-008', 'CLI', 'Base de preguntas frecuentes', 'Base de preguntas frecuentes', 'Respuestas estandarizadas a consultas comunes.', 'book-open', true, 220, jsonb_build_object('alcance', 'Sectorial')),
('CLI-009', 'CLI', 'Plan de mejora de atención', 'Plan de mejora de atención', 'Acciones para mejorar servicio y experiencia.', 'list-checks', true, 221, jsonb_build_object('alcance', 'Sectorial')),
('RRH-001', 'RRH', 'Perfil de puesto', 'Perfil de puesto', 'Define funciones, requisitos y competencias.', 'user-round', true, 222, jsonb_build_object('alcance', 'Transversal')),
('RRH-002', 'RRH', 'Convocatoria laboral', 'Convocatoria laboral', 'Anuncio de una vacante.', 'megaphone', true, 223, jsonb_build_object('alcance', 'Transversal')),
('RRH-003', 'RRH', 'Matriz de evaluación de candidatos', 'Matriz de evaluación de candidatos', 'Comparación de postulantes.', 'table', true, 224, jsonb_build_object('alcance', 'Transversal')),
('RRH-004', 'RRH', 'Expediente de personal', 'Expediente de personal', 'Documentación laboral de una persona.', 'folder', true, 225, jsonb_build_object('alcance', 'Transversal')),
('RRH-005', 'RRH', 'Plan de inducción', 'Plan de inducción', 'Programa de incorporación de personal.', 'users', true, 226, jsonb_build_object('alcance', 'Transversal')),
('RRH-006', 'RRH', 'Evaluación de desempeño', 'Evaluación de desempeño', 'Valoración de resultados y competencias.', 'clipboard-check', true, 227, jsonb_build_object('alcance', 'Transversal')),
('RRH-007', 'RRH', 'Plan de bienestar', 'Plan de bienestar', 'Acciones de bienestar y clima laboral.', 'heart-handshake', true, 228, jsonb_build_object('alcance', 'Transversal')),
('RRH-008', 'RRH', 'Plan de desarrollo de competencias', 'Plan de desarrollo de competencias', 'Acciones para desarrollar capacidades.', 'graduation-cap', true, 229, jsonb_build_object('alcance', 'Transversal')),
('RRH-009', 'RRH', 'Informe de clima laboral', 'Informe de clima laboral', 'Resultados de percepción del ambiente laboral.', 'chart-column', true, 230, jsonb_build_object('alcance', 'Transversal')),
('RRH-010', 'RRH', 'Registro de vacaciones y permisos', 'Registro de vacaciones y permisos', 'Control de ausencias y permisos.', 'calendar-check', true, 231, jsonb_build_object('alcance', 'Transversal')),
('EVE-001', 'EVE', 'Plan de evento', 'Plan de evento', 'Objetivos, público, formato y organización del evento.', 'calendar-days', true, 232, jsonb_build_object('alcance', 'Sectorial')),
('EVE-002', 'EVE', 'Programa del evento', 'Programa del evento', 'Secuencia de actividades y horarios.', 'list-ordered', true, 233, jsonb_build_object('alcance', 'Sectorial')),
('EVE-003', 'EVE', 'Presupuesto del evento', 'Presupuesto del evento', 'Estimación de costos del evento.', 'calculator', true, 234, jsonb_build_object('alcance', 'Sectorial')),
('EVE-004', 'EVE', 'Invitación', 'Invitación', 'Comunicación para convocar participantes.', 'mail', true, 235, jsonb_build_object('alcance', 'Sectorial')),
('EVE-005', 'EVE', 'Lista de invitados', 'Lista de invitados', 'Registro de personas convocadas.', 'users', true, 236, jsonb_build_object('alcance', 'Sectorial')),
('EVE-006', 'EVE', 'Registro de inscripción', 'Registro de inscripción', 'Control de participantes inscritos.', 'clipboard-list', true, 237, jsonb_build_object('alcance', 'Sectorial')),
('EVE-007', 'EVE', 'Guion o escaleta', 'Guion o escaleta', 'Secuencia de intervenciones y momentos del evento.', 'list-video', true, 238, jsonb_build_object('alcance', 'Sectorial')),
('EVE-008', 'EVE', 'Plano de distribución', 'Plano de distribución', 'Organización espacial de ambientes y recursos.', 'map', true, 239, jsonb_build_object('alcance', 'Sectorial')),
('EVE-009', 'EVE', 'Informe de evento', 'Informe de evento', 'Resultados, incidencias y participación.', 'file-chart-column', true, 240, jsonb_build_object('alcance', 'Sectorial')),
('EVE-010', 'EVE', 'Registro audiovisual del evento', 'Registro audiovisual del evento', 'Fotografías y videos del evento.', 'camera', true, 241, jsonb_build_object('alcance', 'Sectorial')),
('OPE-001', 'OPE', 'Mapa de procesos', 'Mapa de procesos', 'Representación de procesos organizacionales.', 'workflow', true, 242, jsonb_build_object('alcance', 'Sectorial')),
('OPE-002', 'OPE', 'Procedimiento operativo', 'Procedimiento operativo', 'Pasos estandarizados de una operación.', 'list-ordered', true, 243, jsonb_build_object('alcance', 'Sectorial')),
('OPE-003', 'OPE', 'Manual de operaciones', 'Manual de operaciones', 'Reglas y procedimientos operativos.', 'book-open', true, 244, jsonb_build_object('alcance', 'Sectorial')),
('OPE-004', 'OPE', 'Plan operativo', 'Plan operativo', 'Actividades, recursos y metas operativas.', 'clipboard-list', true, 245, jsonb_build_object('alcance', 'Sectorial')),
('OPE-005', 'OPE', 'Plan logístico', 'Plan logístico', 'Organización de transporte, almacenamiento y distribución.', 'truck', true, 246, jsonb_build_object('alcance', 'Sectorial')),
('OPE-006', 'OPE', 'Inventario', 'Inventario', 'Relación y control de existencias.', 'package', true, 247, jsonb_build_object('alcance', 'Sectorial')),
('OPE-007', 'OPE', 'Orden de despacho', 'Orden de despacho', 'Instrucción para preparar y despachar bienes.', 'package-check', true, 248, jsonb_build_object('alcance', 'Sectorial')),
('OPE-008', 'OPE', 'Guía de remisión o traslado', 'Guía de remisión o traslado', 'Documento de traslado de bienes, según corresponda.', 'truck', true, 249, jsonb_build_object('alcance', 'Sectorial')),
('OPE-009', 'OPE', 'Reporte de incidencias operativas', 'Reporte de incidencias operativas', 'Registro de problemas durante la operación.', 'alert-triangle', true, 250, jsonb_build_object('alcance', 'Sectorial')),
('OPE-010', 'OPE', 'Informe de productividad', 'Informe de productividad', 'Medición de producción y eficiencia.', 'chart-column', true, 251, jsonb_build_object('alcance', 'Sectorial')),
('DAT-001', 'DAT', 'Base de datos', 'Base de datos', 'Conjunto estructurado de datos.', 'database', true, 252, jsonb_build_object('alcance', 'Transversal')),
('DAT-002', 'DAT', 'Diccionario de datos', 'Diccionario de datos', 'Definición de campos, tipos y reglas de datos.', 'book-text', true, 253, jsonb_build_object('alcance', 'Transversal')),
('DAT-003', 'DAT', 'Ficha técnica de indicador', 'Ficha técnica de indicador', 'Definición, fórmula, fuente y periodicidad de un indicador.', 'file-chart-line', true, 254, jsonb_build_object('alcance', 'Transversal')),
('DAT-004', 'DAT', 'Dashboard', 'Dashboard', 'Panel visual de indicadores y métricas.', 'layout-dashboard', true, 255, jsonb_build_object('alcance', 'Transversal')),
('DAT-005', 'DAT', 'Reporte estadístico', 'Reporte estadístico', 'Resultados de análisis estadístico.', 'chart-no-axes-combined', true, 256, jsonb_build_object('alcance', 'Transversal')),
('DAT-006', 'DAT', 'Encuesta', 'Encuesta', 'Instrumento para recopilar información.', 'clipboard-list', true, 257, jsonb_build_object('alcance', 'Transversal')),
('DAT-007', 'DAT', 'Base de encuestas', 'Base de encuestas', 'Conjunto de respuestas recopiladas.', 'table', true, 258, jsonb_build_object('alcance', 'Transversal')),
('DAT-008', 'DAT', 'Informe de análisis de datos', 'Informe de análisis de datos', 'Hallazgos derivados del análisis de información.', 'chart-line', true, 259, jsonb_build_object('alcance', 'Transversal')),
('DAT-009', 'DAT', 'Estudio de percepción', 'Estudio de percepción', 'Análisis de opiniones y percepciones.', 'users', true, 260, jsonb_build_object('alcance', 'Transversal')),
('DAT-010', 'DAT', 'Tablero de control', 'Tablero de control', 'Seguimiento visual de variables operativas o estratégicas.', 'panels-top-left', true, 261, jsonb_build_object('alcance', 'Transversal'))
ON CONFLICT (codigo) DO NOTHING;

-- S5 . RLS ya activo en tipos (0015); no se toca.
-- S6 . POST-VERIFICACION
SELECT 'categorias' AS tabla, (SELECT count(*) FROM information_schema.columns WHERE table_schema='public' AND table_name='gp_categorias_entregable_c') AS columnas, (SELECT count(*) FROM public.gp_categorias_entregable_c) AS filas, (SELECT count(*) FROM pg_policies WHERE schemaname='public' AND tablename='gp_categorias_entregable_c') AS politicas;
SELECT 'tipos' AS tabla, (SELECT count(*) FROM information_schema.columns WHERE table_schema='public' AND table_name='gp_tipos_entregable_c') AS columnas, (SELECT count(*) FROM public.gp_tipos_entregable_c) AS filas, (SELECT count(DISTINCT categoria_codigo) FROM public.gp_tipos_entregable_c) AS categorias, (SELECT count(*) FROM pg_policies WHERE schemaname='public' AND tablename='gp_tipos_entregable_c') AS politicas;