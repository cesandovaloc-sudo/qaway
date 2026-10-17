-- ============================================================================
-- MIGRACIÓN: MÓDULO BÚSQUEDA DE CRITERIOS (RAG ENGINE)
-- Tablas 100% aisladas e independientes. Cero impacto en tablas existentes.
-- ============================================================================

-- 1. PROYECTOS Y COLECCIONES RAG
CREATE TABLE IF NOT EXISTS public.rag_projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'auditoria',
  badge TEXT DEFAULT 'Auditoría Activa',
  sources_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. FUENTES DOCUMENTALES E INDEXACIONES
CREATE TABLE IF NOT EXISTS public.rag_sources (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES public.rag_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('legal', 'excel', 'doc')),
  badge TEXT,
  description TEXT,
  meta_pages TEXT,
  chunks_count INT DEFAULT 0,
  status_text TEXT DEFAULT 'Indexado',
  inspector_tab INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SESIONES DE CHAT / EXPEDIENTES RAG
CREATE TABLE IF NOT EXISTS public.rag_sessions (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES public.rag_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  preview TEXT,
  provider TEXT DEFAULT 'Google DeepMind',
  mode TEXT DEFAULT 'standard',
  agent_profile TEXT DEFAULT 'auditor_laboral',
  messages_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TURNOS Y MENSAJES CON CITAS Y LATENCIA
CREATE TABLE IF NOT EXISTS public.rag_turns (
  id TEXT PRIMARY KEY,
  session_id TEXT REFERENCES public.rag_sessions(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant')),
  text TEXT NOT NULL,
  latency TEXT,
  scenario_id TEXT,
  has_table BOOLEAN DEFAULT FALSE,
  table_data JSONB,
  sources JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE public.rag_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rag_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rag_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rag_turns ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS PÚBLICAS PARA PRUEBAS Y CONSULTAS CON ANON KEY
CREATE POLICY "Acceso publico lectura rag_projects" ON public.rag_projects FOR SELECT USING (true);
CREATE POLICY "Acceso publico escritura rag_projects" ON public.rag_projects FOR ALL USING (true);

CREATE POLICY "Acceso publico lectura rag_sources" ON public.rag_sources FOR SELECT USING (true);
CREATE POLICY "Acceso publico escritura rag_sources" ON public.rag_sources FOR ALL USING (true);

CREATE POLICY "Acceso publico lectura rag_sessions" ON public.rag_sessions FOR SELECT USING (true);
CREATE POLICY "Acceso publico escritura rag_sessions" ON public.rag_sessions FOR ALL USING (true);

CREATE POLICY "Acceso publico lectura rag_turns" ON public.rag_turns FOR SELECT USING (true);
CREATE POLICY "Acceso publico escritura rag_turns" ON public.rag_turns FOR ALL USING (true);

-- DATOS SEMILLA PARA EL PROYECTO INICIAL AUDITORÍA Q3
INSERT INTO public.rag_projects (id, name, description, category, badge, sources_count)
VALUES (
  'auditoria-q3',
  'Auditoría Laboral & Financiera Q3',
  'Cotejo cruzado de sobretiempos laborales, matriz de contingencias Q3 y políticas internas.',
  'auditoria',
  'Auditoría Activa',
  3
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.rag_sources (id, project_id, title, type, badge, description, meta_pages, chunks_count, status_text, inspector_tab)
VALUES
  ('src-1', 'auditoria-q3', 'D.S. N.º 007-2002-TR', 'legal', 'Norma Oficial', 'Texto Único Ordenado de la Ley de Jornada de Trabajo, Horario y Trabajo en Sobretiempo.', '86 páginas', 8320, 'Indexado', 1),
  ('src-2', 'auditoria-q3', 'Modelo Financiero Q3 2026.xlsx', 'excel', 'Matriz Excel', 'Proyecciones de ingresos, costos de nómina, provisiones contingentes y cálculo de EBITDA.', '14 hojas / 1,420 celdas', 6120, 'Indexado', 2),
  ('src-3', 'auditoria-q3', 'Manual de Políticas Laborales v2.1.pdf', 'doc', 'Manual Interno', 'Normas internas de registro biométrico, control de horas extras y autorizaciones de gerencia.', '48 páginas', 12480, 'Indexado', 3)
ON CONFLICT (id) DO NOTHING;
