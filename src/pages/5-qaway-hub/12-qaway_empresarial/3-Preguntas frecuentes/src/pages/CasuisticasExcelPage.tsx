import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Plus,
  Cloud,
  FileSpreadsheet,
  RotateCcw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Code2,
  X,
  Eye,
  Pencil,
  Trash2,
  Filter,
  Layers,
  BookOpen,
  MapPin,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ExternalLink,
  SlidersHorizontal
} from 'lucide-react';
import { Casuistica, DirectionData, DirectionId, ScoredCasuistica } from '../types/casuistica';

interface CasuisticasTablePageProps {
  directions: DirectionData[];
  onBack: () => void;
  onSave: (newDirections: DirectionData[]) => Promise<boolean>;
  onResetOfficial: () => void;
  supabaseUrl: string;
  supabaseKey: string;
  isSupabaseConnected: boolean;
  onSyncSupabase: () => Promise<boolean>;
  onEditCase?: (dirId: DirectionId, item: Casuistica) => void;
  onAddNewCase?: () => void;
}

const DIRECTION_BADGES: Record<
  string,
  { label: string; code: string; colorClass: string; borderClass: string }
> = {
  DEI: {
    label: 'Ed. Inicial',
    code: 'DEI',
    colorClass: 'bg-amber-50 text-amber-800',
    borderClass: 'border-amber-200'
  },
  DEP: {
    label: 'Ed. Primaria',
    code: 'DEP',
    colorClass: 'bg-blue-50 text-blue-800',
    borderClass: 'border-blue-200'
  },
  DES: {
    label: 'Ed. Secundaria',
    code: 'DES',
    colorClass: 'bg-rose-50 text-[#d81b3d]',
    borderClass: 'border-rose-200'
  },
  DISER: {
    label: 'Servicios Rurales',
    code: 'DISER',
    colorClass: 'bg-emerald-50 text-emerald-800',
    borderClass: 'border-emerald-200'
  },
  DEIB: {
    label: 'Intercultural Bilingüe',
    code: 'DEIB',
    colorClass: 'bg-violet-50 text-violet-800',
    borderClass: 'border-violet-200'
  },
  DEBE: {
    label: 'Básica Especial',
    code: 'DEBE',
    colorClass: 'bg-purple-50 text-purple-800',
    borderClass: 'border-purple-200'
  },
  DEBA: {
    label: 'Básica Alternativa',
    code: 'DEBA',
    colorClass: 'bg-indigo-50 text-indigo-800',
    borderClass: 'border-indigo-200'
  }
};

export const CasuisticasExcelPage: React.FC<CasuisticasTablePageProps> = ({
  directions,
  onBack,
  onSave,
  onResetOfficial,
  supabaseUrl,
  supabaseKey,
  isSupabaseConnected,
  onSyncSupabase,
  onEditCase,
  onAddNewCase
}) => {
  // Estados de filtrado y búsqueda (estilo Inventi Pro)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDirFilter, setSelectedDirFilter] = useState<string>('ALL');
  const [normativaFilter, setNormativaFilter] = useState<'ALL' | 'WITH' | 'WITHOUT'>('ALL');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // Estados de sincronización y modales
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [showSqlModal, setShowSqlModal] = useState<boolean>(false);
  const [detailModalCase, setDetailModalCase] = useState<{
    caseItem: Casuistica;
    dirId: DirectionId;
    dirName: string;
    dirCode: string;
  } | null>(null);

  // Aplanar todos los casos con metadatos de dirección
  const allCasesFlat = useMemo(() => {
    return directions.flatMap((dir) =>
      dir.cases.map((c) => ({
        ...c,
        dirId: dir.id,
        dirCode: dir.code,
        dirName: dir.name
      }))
    );
  }, [directions]);

  // Métricas para las tarjetas KPI superiores
  const stats = useMemo(() => {
    const total = allCasesFlat.length;
    const withNormativa = allCasesFlat.filter((c) => (c.normativa || '').trim().length > 0).length;
    const withUgel = allCasesFlat.filter((c) => (c.casoEspecifico || '').trim().length > 0).length;
    const dirsWithCases = directions.filter((d) => d.cases.length > 0).length;
    return { total, withNormativa, withUgel, dirsWithCases };
  }, [allCasesFlat, directions]);

  // Filtrado de filas
  const filteredCases = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return allCasesFlat.filter((item) => {
      // Filtro por Dirección
      if (selectedDirFilter !== 'ALL' && item.dirId !== selectedDirFilter) {
        return false;
      }
      // Filtro por Normativa
      if (normativaFilter === 'WITH' && !(item.normativa || '').trim()) {
        return false;
      }
      if (normativaFilter === 'WITHOUT' && (item.normativa || '').trim()) {
        return false;
      }
      // Filtro por búsqueda de texto
      if (!q) return true;
      return (
        item.number.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.criterioTitle.toLowerCase().includes(q) ||
        item.desarrollo.toLowerCase().includes(q) ||
        item.solucion.toLowerCase().includes(q) ||
        (item.ejemplo || '').toLowerCase().includes(q) ||
        (item.normativa || '').toLowerCase().includes(q) ||
        (item.casoEspecifico || '').toLowerCase().includes(q) ||
        item.dirCode.toLowerCase().includes(q) ||
        item.dirName.toLowerCase().includes(q)
      );
    });
  }, [allCasesFlat, selectedDirFilter, normativaFilter, searchTerm]);

  // Paginación
  const totalFiltered = filteredCases.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / rowsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedCases = useMemo(() => {
    const start = (safeCurrentPage - 1) * rowsPerPage;
    return filteredCases.slice(start, start + rowsPerPage);
  }, [filteredCases, safeCurrentPage, rowsPerPage]);

  // Selección de filas
  const handleToggleSelectAll = () => {
    if (selectedRows.size === paginatedCases.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedCases.map((c) => c.id)));
    }
  };

  const handleToggleRow = (id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Sincronización a Supabase
  const handleSyncCloud = async () => {
    setIsSyncing(true);
    try {
      await onSyncSupabase();
    } finally {
      setIsSyncing(false);
    }
  };

  // Exportar a CSV
  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Direccion_Codigo',
      'Direccion_Nombre',
      'Numero',
      'Titulo_Pregunta',
      'Criterio_General',
      'Desarrollo_Situacion',
      'Solucion_Criterio_Oficial',
      'Ejemplo_Practico',
      'Normativa_Legal',
      'Caso_Especifico_UGEL'
    ];

    const rows = filteredCases.map((c) => [
      c.id,
      c.dirCode,
      c.dirName,
      c.number,
      `"${(c.title || '').replace(/"/g, '""')}"`,
      `"${(c.criterioTitle || '').replace(/"/g, '""')}"`,
      `"${(c.desarrollo || '').replace(/"/g, '""')}"`,
      `"${(c.solucion || '').replace(/"/g, '""')}"`,
      `"${(c.ejemplo || '').replace(/"/g, '""')}"`,
      `"${(c.normativa || '').replace(/"/g, '""')}"`,
      `"${(c.casoEspecifico || '').replace(/"/g, '""')}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].map((e) => e.join(';')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `banco_casuisticas_minedu_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Eliminar caso
  const handleDeleteCase = async (caseId: string, dirId: DirectionId) => {
    if (!window.confirm('¿Confirmas eliminar esta casuística del banco?')) return;
    const updated = directions.map((dir) => {
      if (dir.id !== dirId) return dir;
      return {
        ...dir,
        cases: dir.cases.filter((c) => c.id !== caseId)
      };
    });
    await onSave(updated);
  };

  const sqlSnippet = `-- TABLA EXCLUSIVA Y AISLADA PARA EL MÓDULO MINEDU
CREATE TABLE IF NOT EXISTS public.minedu_casuisticas (
  id TEXT PRIMARY KEY,
  dir_id TEXT NOT NULL,
  dir_code TEXT NOT NULL,
  dir_name TEXT NOT NULL,
  number TEXT NOT NULL,
  title TEXT NOT NULL,
  criterio_title TEXT,
  criterio_desc TEXT,
  desarrollo TEXT NOT NULL,
  solucion TEXT NOT NULL,
  ejemplo TEXT,
  normativa TEXT,
  caso_especifico TEXT,
  accion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- HABILITAR SEGURIDAD POR FILAS (RLS)
ALTER TABLE public.minedu_casuisticas ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE LECTURA Y ESCRITURA PÚBLICAS AISLADAS
CREATE POLICY "Lectura publica casuisticas minedu" 
ON public.minedu_casuisticas FOR SELECT USING (true);

CREATE POLICY "Escritura publica casuisticas minedu" 
ON public.minedu_casuisticas FOR ALL USING (true);
`;

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] text-slate-800 antialiased flex flex-col font-sans">
      {/* 1. TOP NAVBAR INSTITUCIONAL DE CONTROL */}
      <nav className="w-full bg-white border-b border-slate-200/90 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" />
              <span>Volver a Tarjetas</span>
            </button>

            <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>

            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                MC SIGA
              </span>
              <span className="text-xs font-bold text-slate-800 hidden md:inline">
                Tabla Maestra de Casuísticas
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSqlModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold text-xs transition cursor-pointer"
              title="Ver script de la tabla aislada minedu_casuisticas"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Script Supabase</span>
            </button>

            <button
              type="button"
              onClick={handleSyncCloud}
              disabled={isSyncing}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shadow-2xs ${
                isSupabaseConnected
                  ? 'bg-sky-600 hover:bg-sky-700 text-white'
                  : 'bg-slate-800 hover:bg-slate-900 text-white'
              }`}
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Supabase'}</span>
            </button>

            {onAddNewCase && (
              <button
                type="button"
                onClick={onAddNewCase}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#d81b3d] hover:bg-rose-700 text-white font-bold text-xs transition cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Nueva Casuística</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* 2. CONTENIDO PRINCIPAL CENTRADO A MÁXIMO ANCHO ERGONÓMICO */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-5 flex-1">
        {/* TITULAR Y DESCRIPCIÓN */}
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            Banco de Casuísticas y Preguntas Frecuentes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
            Registro estructurado para monitoreo, consulta rápida y resolución de casuísticas operativas ante las UGEL.
          </p>
        </div>

        {/* 3. TARJETAS KPI SUPERIORES (ESTILO INVENTI PRO) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Total Casos */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs flex items-center justify-between">
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Casuísticas
              </span>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 block">
                {stats.total}
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                En {stats.dirsWithCases} direcciones activas
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-red-50 text-[#d81b3d] flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: Con Base Normativa */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs flex items-center justify-between">
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Con Base Normativa
              </span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1 block">
                {stats.withNormativa}
              </span>
              <span className="text-[11px] font-semibold text-emerald-600">
                {Math.round((stats.withNormativa / Math.max(1, stats.total)) * 100)}% fundamentadas
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: Casos con UGEL */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs flex items-center justify-between">
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Casos Específicos UGEL
              </span>
              <span className="text-2xl sm:text-3xl font-black text-amber-700 mt-1 block">
                {stats.withUgel}
              </span>
              <span className="text-[11px] font-semibold text-amber-600">
                Incidencias territoriales
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
          </div>

          {/* Card 4: Almacenamiento Nube */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs flex items-center justify-between">
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Estado Supabase
              </span>
              <span
                className={`text-lg sm:text-xl font-black mt-1 block ${
                  isSupabaseConnected ? 'text-sky-700' : 'text-slate-700'
                }`}
              >
                {isSupabaseConnected ? 'Conectado' : 'Caché Local'}
              </span>
              <span className="text-[11px] font-semibold text-slate-500 font-mono">
                minedu_casuisticas
              </span>
            </div>
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                isSupabaseConnected ? 'bg-sky-50 text-sky-700' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Cloud className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* 4. BARRA DE FILTROS ESTILO INVENTI PRO */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-2xs space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Buscador */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute inset-y-0 left-3.5 my-auto text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Buscar por título, pregunta, UGEL, criterio o normativa..."
                className="w-full h-10 pl-10 pr-9 rounded-lg bg-slate-50/70 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#d81b3d]/20 focus:border-[#d81b3d]"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-3 my-auto w-4 h-4 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Selectores de Filtro */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Filtro Dirección */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 h-10 text-xs font-semibold text-slate-700">
                <span className="text-slate-400 text-[11px] uppercase">Dir:</span>
                <select
                  value={selectedDirFilter}
                  onChange={(e) => {
                    setSelectedDirFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent focus:outline-none cursor-pointer font-bold text-slate-800"
                >
                  <option value="ALL">Todas ({stats.total})</option>
                  {directions.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.code} ({d.cases.length})
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro Normativa */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 h-10 text-xs font-semibold text-slate-700">
                <span className="text-slate-400 text-[11px] uppercase">Normativa:</span>
                <select
                  value={normativaFilter}
                  onChange={(e) => {
                    setNormativaFilter(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent focus:outline-none cursor-pointer font-bold text-slate-800"
                >
                  <option value="ALL">Todas</option>
                  <option value="WITH">Con RM oficial</option>
                  <option value="WITHOUT">Sin normativa</option>
                </select>
              </div>

              {/* Botón Exportar */}
              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 h-10 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer shadow-2xs"
                title="Descargar en formato Excel / CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Exportar CSV</span>
              </button>

              {/* Botón Restablecer */}
              <button
                type="button"
                onClick={onResetOfficial}
                className="h-10 w-10 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition cursor-pointer shadow-2xs"
                title="Restablecer a versión oficial oficial de 54 casos"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 5. TABLA WEB PROFESIONAL (ESTILO INVENTI PRO) */}
        <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/90 text-slate-600 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="w-10 px-3 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={
                        paginatedCases.length > 0 &&
                        selectedRows.size === paginatedCases.length
                      }
                      onChange={handleToggleSelectAll}
                      className="rounded text-[#d81b3d] focus:ring-[#d81b3d] cursor-pointer"
                    />
                  </th>
                  <th className="w-14 px-2 py-3 text-center">N°</th>
                  <th className="w-24 px-3 py-3">Dirección</th>
                  <th className="min-w-[280px] px-4 py-3">Título / Pregunta Central</th>
                  <th className="w-40 min-w-[160px] px-3 py-3">UGEL / Ámbito</th>
                  <th className="min-w-[280px] px-4 py-3">Solución / Criterio Oficial</th>
                  <th className="w-36 min-w-[140px] px-3 py-3">Normativa</th>
                  <th className="w-28 px-3 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 text-slate-700">
                {paginatedCases.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-slate-400">
                      <div className="max-w-xs mx-auto space-y-2">
                        <Filter className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="text-sm font-semibold text-slate-600">
                          No se encontraron casuísticas con esos filtros.
                        </p>
                        <p className="text-xs text-slate-400">
                          Prueba ajustando el término de búsqueda o seleccionando &quot;Todas las
                          Direcciones&quot;.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedCases.map((row) => {
                    const isSelected = selectedRows.has(row.id);
                    const badgeInfo = DIRECTION_BADGES[row.dirCode] || {
                      label: row.dirName,
                      code: row.dirCode,
                      colorClass: 'bg-slate-100 text-slate-700',
                      borderClass: 'border-slate-200'
                    };

                    return (
                      <tr
                        key={row.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isSelected ? 'bg-red-50/30' : 'bg-white'
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="px-3 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleRow(row.id)}
                            className="rounded text-[#d81b3d] focus:ring-[#d81b3d] cursor-pointer"
                          />
                        </td>

                        {/* Número */}
                        <td className="px-2 py-3 text-center font-bold text-slate-600 font-mono">
                          {row.number}
                        </td>

                        {/* Dirección Badge */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-black border uppercase tracking-wider ${badgeInfo.colorClass} ${badgeInfo.borderClass}`}
                          >
                            {badgeInfo.code}
                          </span>
                        </td>

                        {/* Título de la pregunta */}
                        <td className="px-4 py-3">
                          <div className="space-y-0.5">
                            <span
                              onClick={() =>
                                setDetailModalCase({
                                  caseItem: row,
                                  dirId: row.dirId,
                                  dirName: row.dirName,
                                  dirCode: row.dirCode
                                })
                              }
                              className="font-bold text-slate-900 hover:text-[#d81b3d] transition cursor-pointer text-xs sm:text-sm line-clamp-2 leading-snug"
                              title={row.title}
                            >
                              {row.title}
                            </span>
                            <span className="block text-[11px] text-slate-500 font-medium">
                              Criterio: {row.criterioTitle}
                            </span>
                          </div>
                        </td>

                        {/* UGEL / Ámbito específico */}
                        <td className="px-3 py-3">
                          {row.casoEspecifico ? (
                            <span className="inline-block px-2 py-1 rounded bg-amber-50 text-amber-900 border border-amber-200/80 text-[11px] font-bold">
                              {row.casoEspecifico}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px] italic">General</span>
                          )}
                        </td>

                        {/* Solución Oficial */}
                        <td className="px-4 py-3 text-slate-600">
                          <p className="line-clamp-2 text-xs leading-relaxed text-slate-700">
                            {row.solucion}
                          </p>
                        </td>

                        {/* Normativa Legal */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          {row.normativa ? (
                            <span
                              className="inline-block max-w-[150px] truncate px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-semibold font-mono"
                              title={row.normativa}
                            >
                              {row.normativa.split('\n')[0]}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">—</span>
                          )}
                        </td>

                        {/* Acciones */}
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Ver detalle */}
                            <button
                              type="button"
                              onClick={() =>
                                setDetailModalCase({
                                  caseItem: row,
                                  dirId: row.dirId,
                                  dirName: row.dirName,
                                  dirCode: row.dirCode
                                })
                              }
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                              title="Ver detalle completo"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Editar en modal */}
                            {onEditCase && (
                              <button
                                type="button"
                                onClick={() => onEditCase(row.dirId, row)}
                                className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                                title="Editar casuística"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                            )}

                            {/* Eliminar */}
                            <button
                              type="button"
                              onClick={() => handleDeleteCase(row.id, row.dirId)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Eliminar casuística"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* 6. PIE DE PAGINACIÓN (IDÉNTICO A INVENTI PRO) */}
          <div className="bg-slate-50/90 px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
            <div>
              {totalFiltered === 0 ? (
                <span>Mostrando 0 de 0 casuísticas</span>
              ) : (
                <span>
                  Mostrando{' '}
                  <strong className="text-slate-800">
                    {(safeCurrentPage - 1) * rowsPerPage + 1}
                  </strong>{' '}
                  a{' '}
                  <strong className="text-slate-800">
                    {Math.min(safeCurrentPage * rowsPerPage, totalFiltered)}
                  </strong>{' '}
                  de <strong className="text-slate-800">{totalFiltered}</strong> casuísticas
                </span>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Filas por página */}
              <div className="flex items-center gap-1.5">
                <span>Filas por página:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-slate-200 rounded px-2 py-1 font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              {/* Botones de navegación */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={safeCurrentPage <= 1}
                  onClick={() => setCurrentPage(1)}
                  className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  title="Primera página"
                >
                  <ChevronsLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={safeCurrentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  title="Página anterior"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                <span className="px-2 font-bold text-slate-700">
                  {safeCurrentPage} / {totalPages}
                </span>

                <button
                  type="button"
                  disabled={safeCurrentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  title="Página siguiente"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={safeCurrentPage >= totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  title="Última página"
                >
                  <ChevronsRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL DETALLE DE CASUÍSTICA (VISTA COMPLETA) */}
      {detailModalCase && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-black bg-red-100 text-[#d81b3d]">
                    {detailModalCase.dirCode} — {detailModalCase.dirName}
                  </span>
                  <span className="text-xs font-bold text-slate-500 font-mono">
                    Caso N° {detailModalCase.caseItem.number}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {detailModalCase.caseItem.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailModalCase(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Caso Específico */}
              {detailModalCase.caseItem.casoEspecifico && (
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
                    Ámbito / UGEL Específica
                  </span>
                  <p className="text-amber-950 font-medium">
                    {detailModalCase.caseItem.casoEspecifico}
                  </p>
                </div>
              )}

              {/* Desarrollo */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Desarrollo de la Situación
                </span>
                <p className="text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {detailModalCase.caseItem.desarrollo}
                </p>
              </div>

              {/* Solución Oficial */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  Solución / Criterio Oficial
                </span>
                <p className="text-emerald-950 leading-relaxed bg-emerald-50/50 p-3 rounded-xl border border-emerald-200 font-medium">
                  {detailModalCase.caseItem.solucion}
                </p>
              </div>

              {/* Ejemplo de aplicación */}
              {detailModalCase.caseItem.ejemplo && (
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Ejemplo Práctico
                  </span>
                  <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200 italic">
                    {detailModalCase.caseItem.ejemplo}
                  </p>
                </div>
              )}

              {/* Normativa */}
              {detailModalCase.caseItem.normativa && (
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Base Normativa Vinculante
                  </span>
                  <pre className="text-slate-700 font-mono text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-200 whitespace-pre-wrap">
                    {detailModalCase.caseItem.normativa}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                ID: {detailModalCase.caseItem.id}
              </span>
              <button
                type="button"
                onClick={() => setDetailModalCase(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CON EL SCRIPT SQL AISLADO DE SUPABASE */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-indigo-700">
                <Code2 className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">
                  Script SQL para Tabla Aislada en Supabase
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Crea la tabla aislada <code>minedu_casuisticas</code> para no colisionar con ninguna
              otra tabla de tu proyecto. En <strong>Supabase &gt; SQL Editor &gt; New Query</strong>,
              pega el siguiente código y presiona <strong>Run</strong>:
            </p>

            <div className="relative">
              <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto max-h-64 leading-relaxed">
                {sqlSnippet}
              </pre>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(sqlSnippet);
                  alert('¡Script SQL copiado al portapapeles!');
                }}
                className="absolute top-3 right-3 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition shadow-xs cursor-pointer"
              >
                Copiar SQL
              </button>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500 font-mono">
                Tabla: <strong>public.minedu_casuisticas</strong>
              </span>
              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
