-- ============================================================================
-- QAWAY · BÚSQUEDA DE CRITERIOS — INFRAESTRUCTURA VECTORIAL DEFINITIVA (v1)
-- Módulo: 2-Búsqueda Criterios (Qaway Lab & MINEDU)
--
-- DÓNDE EJECUTAR: Supabase Dashboard → SQL Editor → New query → pegar todo → Run.
-- IDEMPOTENTE: puede re-ejecutarse completo sin duplicar ni fallar.
-- GEOMETRÍA: vector(768) — estándar nativo del modelo Gemini text-embedding-004
--            (los embeddings se generan EN CLIENTE con la misma API key BYOK
--            del chat: Configuración → Google DeepMind).
-- SEGURIDAD: RLS habilitada con políticas explícitas para el cliente anónimo.
--            Decisión de diseño consciente: la app opera con anon key (BYOK,
--            sin login), por lo que el acceso es público pero delimitado a la
--            tabla de fragmentos del módulo (aislado del resto del schema).
-- ============================================================================

-- 1. Habilitar extensión pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Tabla de fragmentos con tipo vectorial nativo (768 dimensiones)
CREATE TABLE IF NOT EXISTS rag_document_chunks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  document_id TEXT NOT NULL,
  document_title TEXT NOT NULL,
  document_type TEXT NOT NULL,
  locator_label TEXT NOT NULL,
  page_number INTEGER,
  content TEXT NOT NULL,
  embedding vector(768),
  embedding_model TEXT NOT NULL DEFAULT 'text-embedding-004',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Índices relacionales (filtros por proyecto y purga por documento)
CREATE INDEX IF NOT EXISTS idx_rag_chunks_project ON rag_document_chunks(project_id);
CREATE INDEX IF NOT EXISTS idx_rag_chunks_doc ON rag_document_chunks(document_id);

-- 4. Índice HNSW por distancia coseno
--    Búsqueda semántica por grafos navegables (< 15 ms) sin escaneo secuencial.
CREATE INDEX IF NOT EXISTS idx_rag_chunks_hnsw_cosine
ON rag_document_chunks
USING hnsw (embedding vector_cosine_ops);

-- 5. Seguridad: RLS con políticas explícitas para el cliente anónimo
ALTER TABLE rag_document_chunks ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'rag_document_chunks' AND policyname = 'Permitir lectura publica chunks'
  ) THEN
    CREATE POLICY "Permitir lectura publica chunks"
    ON rag_document_chunks FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'rag_document_chunks' AND policyname = 'Permitir insercion chunks'
  ) THEN
    CREATE POLICY "Permitir insercion chunks"
    ON rag_document_chunks FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'rag_document_chunks' AND policyname = 'Permitir eliminacion chunks'
  ) THEN
    CREATE POLICY "Permitir eliminacion chunks"
    ON rag_document_chunks FOR DELETE USING (true);
  END IF;
END
$$;

-- 6. RPC nativa de lectura vectorial (search_path fijo + control de nulos)
CREATE OR REPLACE FUNCTION match_rag_chunks (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  filter_project_id text
)
RETURNS TABLE (
  id text,
  project_id text,
  document_id text,
  document_title text,
  document_type text,
  locator_label text,
  page_number int,
  content text,
  similarity float
)
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
BEGIN
  IF filter_project_id IS NULL OR query_embedding IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    rc.id,
    rc.project_id,
    rc.document_id,
    rc.document_title,
    rc.document_type,
    rc.locator_label,
    rc.page_number,
    rc.content,
    (1 - (rc.embedding <=> query_embedding))::float AS similarity
  FROM rag_document_chunks rc
  WHERE rc.project_id = filter_project_id
    AND rc.embedding IS NOT NULL
    AND (1 - (rc.embedding <=> query_embedding)) >= match_threshold
  ORDER BY rc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 7. Verificación posterior (opcional, en SQL Editor):
--    SELECT count(*) AS chunks FROM rag_document_chunks;
--    SELECT count(*) AS sin_embedding FROM rag_document_chunks WHERE embedding IS NULL;
