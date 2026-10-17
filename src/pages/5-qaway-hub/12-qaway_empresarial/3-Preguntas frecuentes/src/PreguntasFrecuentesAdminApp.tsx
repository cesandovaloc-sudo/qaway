import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Lock, Unlock, FileSpreadsheet, ShieldCheck, ArrowLeft, ExternalLink } from 'lucide-react';
import {
  Casuistica,
  DirectionData,
  DirectionId,
  ScoredCasuistica
} from './types/casuistica';
import { DEFAULT_DIRECTIONS_DATA } from './data/defaultCasuisticas';
import { HeaderBanner } from './components/HeaderBanner';
import { DirectionsGrid } from './components/DirectionsGrid';
import { SearchBar } from './components/SearchBar';
import { CasesList } from './components/CasesList';
import { ManagementModal } from './components/ManagementModal';
import { Toast } from './components/Toast';
import { CasuisticasExcelPage } from './pages/CasuisticasExcelPage';

// Almacenamiento local aislado y Supabase
const LOCAL_STORAGE_KEY = 'qaway_minedu_casuisticas_v9_multidir_deib';
const SUPABASE_STORAGE_URL_KEY = 'qaway_minedu_supabase_url_v1';
const SUPABASE_STORAGE_KEY_KEY = 'qaway_minedu_supabase_key_v1';
const ADMIN_AUTH_SESSION_KEY = 'qaway_minedu_admin_auth_v1';

// Configuración Supabase por defecto desde entorno
const DEFAULT_SUPABASE_URL =
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  'https://qrusdsqgygfolxfrafyd.supabase.co';
const DEFAULT_SUPABASE_KEY =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_k6LYbA5uAOOMBYsP-4NNLA_dKvYh8Yi';

const SUPABASE_TABLE_NAME = 'minedu_casuisticas';

// Claves maestras autorizadas para el acceso al panel
const VALID_ADMIN_PINS = ['DIGERE2026', 'MINEDU2026', 'QAWAY2026'];

function normalizeText(str: string): string {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function matchesFuzzyWord(word: string, token: string): boolean {
  if (word === token) return true;
  if (word.startsWith(token)) return true;
  if (token.length >= 4) {
    const maxDist = token.length >= 7 ? 2 : 1;
    if (Math.abs(word.length - token.length) <= maxDist) {
      if (levenshteinDistance(word, token) <= maxDist) {
        return true;
      }
    }
  }
  return false;
}

function scoreCase(
  item: ScoredCasuistica,
  queryTokens: string[],
  rawQueryNorm: string
): number {
  const fields = [
    { key: 'title', weight: 24 },
    { key: 'criterioTitle', weight: 16 },
    { key: 'solucion', weight: 12 },
    { key: 'ejemplo', weight: 10 },
    { key: 'accion', weight: 10 },
    { key: 'desarrollo', weight: 8 },
    { key: 'casoEspecifico', weight: 8 },
    { key: 'normativa', weight: 6 },
    { key: 'criterioDesc', weight: 6 },
    { key: 'dirCode', weight: 10 },
    { key: 'dirName', weight: 6 },
    { key: 'number', weight: 14 }
  ] as const;

  let totalScore = 0;
  let matchedTokensCount = 0;

  const fullTextNormalized = normalizeText(
    `${item.number} ${item.title} ${item.criterioTitle} ${item.criterioDesc} ${item.desarrollo} ${item.solucion} ${item.ejemplo || ''} ${item.normativa || ''} ${item.accion || ''} ${item.casoEspecifico || ''} ${item.dirCode} ${item.dirName}`
  );
  if (rawQueryNorm.length > 2 && fullTextNormalized.includes(rawQueryNorm)) {
    totalScore += 50;
  }

  queryTokens.forEach((token) => {
    let tokenMatchedInItem = false;

    fields.forEach((f) => {
      const rawValue = (item as any)[f.key] || '';
      const normValue = normalizeText(rawValue);
      if (!normValue) return;

      if (normValue.includes(token)) {
        totalScore += f.weight;
        tokenMatchedInItem = true;
        if (normValue.startsWith(token) || normValue.includes(' ' + token)) {
          totalScore += Math.round(f.weight * 0.5);
        }
      } else {
        const words = normValue.split(/[\s,.;:()/-]+/);
        for (const w of words) {
          if (matchesFuzzyWord(w, token)) {
            totalScore += Math.round(f.weight * 0.7);
            tokenMatchedInItem = true;
            break;
          }
        }
      }
    });

    if (tokenMatchedInItem) {
      matchedTokensCount++;
    }
  });

  const minRequiredMatches =
    queryTokens.length <= 2 ? queryTokens.length : Math.ceil(queryTokens.length * 0.6);

  if (matchedTokensCount < minRequiredMatches) {
    return 0;
  }

  return totalScore;
}

export default function PreguntasFrecuentesAdminApp() {
  // Estado de Autenticación en sesión del Administrador
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(ADMIN_AUTH_SESSION_KEY) === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Inicialización de casuísticas
  const [directionsData, setDirectionsData] = useState<DirectionData[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((dir: DirectionData) => ({
            ...dir,
            cases: (dir.cases || []).map((c) => ({ ...c, isOpen: false }))
          }));
        }
      }
    } catch (e) {
      console.warn('Error leyendo almacenamiento local:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_DIRECTIONS_DATA));
  });

  const [selectedDirectionId, setSelectedDirectionId] = useState<DirectionId>('DEI');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'consultas' | 'excel'>('consultas');

  const [allowMultipleOpen, setAllowMultipleOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'form' | 'list' | 'cloud'>('form');
  const [editingCase, setEditingCase] = useState<{
    caseItem: Casuistica;
    dirId: DirectionId;
  } | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const [supabaseUrl, setSupabaseUrl] = useState(() => {
    return localStorage.getItem(SUPABASE_STORAGE_URL_KEY) || DEFAULT_SUPABASE_URL;
  });
  const [supabaseKey, setSupabaseKey] = useState(() => {
    return localStorage.getItem(SUPABASE_STORAGE_KEY_KEY) || DEFAULT_SUPABASE_KEY;
  });
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  const persistDirections = useCallback((newData: DirectionData[]) => {
    setDirectionsData(newData);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData));
    } catch (err) {
      console.warn('Error guardando en caché local:', err);
    }
  }, []);

  // Verificar conexión con Supabase
  useEffect(() => {
    let isMounted = true;
    const testConn = async () => {
      if (!supabaseUrl || !supabaseKey) return;
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const client = createClient(supabaseUrl, supabaseKey);
        const { error } = await client.from(SUPABASE_TABLE_NAME).select('id').limit(1);
        if (isMounted) {
          if (!error || error.code === 'PGRST205') {
            setIsSupabaseConnected(true);
          }
        }
      } catch (e) {
        console.warn('[Supabase Admin] Conexión:', e);
      }
    };
    testConn();
    return () => {
      isMounted = false;
    };
  }, [supabaseUrl, supabaseKey]);

  // Sincronizar desde Supabase al montar si existen datos
  useEffect(() => {
    let isMounted = true;
    const fetchRemoteCases = async () => {
      if (!isSupabaseConnected || !supabaseUrl || !supabaseKey) return;
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const client = createClient(supabaseUrl, supabaseKey);
        const { data, error } = await client
          .from(SUPABASE_TABLE_NAME)
          .select('*')
          .order('number', { ascending: true });

        if (!error && data && data.length > 0 && isMounted) {
          const updatedDirs: DirectionData[] = DEFAULT_DIRECTIONS_DATA.map((dir) => {
            const dirRows = data.filter((row: any) => row.dir_id === dir.id);
            if (dirRows.length === 0) return dir;
            return {
              ...dir,
              cases: dirRows.map((r: any) => ({
                id: r.id,
                number: r.number,
                title: r.title,
                criterioTitle: r.criterio_title || '',
                criterioDesc: r.criterio_desc || '',
                desarrollo: r.desarrollo,
                solucion: r.solucion,
                ejemplo: r.ejemplo || '',
                normativa: r.normativa || '',
                casoEspecifico: r.caso_especifico || '',
                accion: r.accion || '',
                isOpen: false
              }))
            };
          });
          persistDirections(updatedDirs);
        }
      } catch (err) {
        console.warn('[Supabase Admin] Carga remota:', err);
      }
    };
    fetchRemoteCases();
    return () => {
      isMounted = false;
    };
  }, [isSupabaseConnected, supabaseUrl, supabaseKey, persistDirections]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (VALID_ADMIN_PINS.includes(pinInput.trim())) {
      setIsAuthenticated(true);
      sessionStorage.setItem(ADMIN_AUTH_SESSION_KEY, 'true');
      setPinError(null);
      showToast('¡Bienvenido al Panel de Gestión DIGERE!', 'success');
    } else {
      setPinError('Clave de acceso incorrecta. Verifica tus credenciales.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(ADMIN_AUTH_SESSION_KEY);
    showToast('Sesión de administración cerrada', 'success');
  };

  const handleResetOfficialCases = () => {
    if (
      !window.confirm(
        '¿Deseas restablecer todas las casuísticas a la versión oficial (54 casos en 7 direcciones)?'
      )
    ) {
      return;
    }
    const fresh = JSON.parse(JSON.stringify(DEFAULT_DIRECTIONS_DATA));
    persistDirections(fresh);
    showToast('¡Casuísticas oficiales restablecidas (54 casos)!', 'success');
  };

  const handleSaveSupabaseConfig = async (url: string, key: string): Promise<boolean> => {
    if (!url || !key) return false;
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const client = createClient(url, key);
      const { error } = await client.from(SUPABASE_TABLE_NAME).select('id').limit(1);
      if (error && error.code !== 'PGRST205') {
        throw error;
      }
      localStorage.setItem(SUPABASE_STORAGE_URL_KEY, url);
      localStorage.setItem(SUPABASE_STORAGE_KEY_KEY, key);
      setSupabaseUrl(url);
      setSupabaseKey(key);
      setIsSupabaseConnected(true);
      showToast('Conexión con Supabase configurada exitosamente');
      return true;
    } catch (err) {
      console.error('Error conectando a Supabase:', err);
      return false;
    }
  };

  const handleBulkSaveCases = async (newDirections: DirectionData[]): Promise<boolean> => {
    persistDirections(newDirections);

    if (isSupabaseConnected && supabaseUrl && supabaseKey) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const client = createClient(supabaseUrl, supabaseKey);

        const rowsToUpsert: any[] = [];
        newDirections.forEach((dir) => {
          dir.cases.forEach((c) => {
            rowsToUpsert.push({
              id: c.id,
              dir_id: dir.id,
              dir_code: dir.code,
              dir_name: dir.name,
              number: c.number,
              title: c.title,
              criterio_title: c.criterioTitle,
              criterio_desc: c.criterioDesc,
              desarrollo: c.desarrollo,
              solucion: c.solucion,
              ejemplo: c.ejemplo || '',
              normativa: c.normativa || '',
              caso_especifico: c.casoEspecifico || '',
              accion: c.accion || '',
              updated_at: new Date().toISOString()
            });
          });
        });

        const { error } = await client.from(SUPABASE_TABLE_NAME).upsert(rowsToUpsert);
        if (error) {
          console.warn('Error sincronizando a Supabase en bloque:', error);
          showToast('Guardado localmente. Error al sincronizar con Supabase.', 'error');
          return false;
        }

        showToast(
          '¡Sincronizado exitosamente con la tabla ' + SUPABASE_TABLE_NAME + ' de Supabase!',
          'success'
        );
        return true;
      } catch (err) {
        console.error('Error sincronizando con Supabase:', err);
        showToast('Guardado localmente. Revisa la conexión de Supabase.', 'error');
        return false;
      }
    }

    showToast('¡Cambios guardados exitosamente!', 'success');
    return true;
  };

  const totalCasesCount = useMemo(() => {
    return directionsData.reduce((acc, d) => acc + d.cases.length, 0);
  }, [directionsData]);

  const currentDirection = useMemo(() => {
    return (
      directionsData.find((d) => d.id === selectedDirectionId) ||
      directionsData[0] ||
      DEFAULT_DIRECTIONS_DATA[0]
    );
  }, [directionsData, selectedDirectionId]);

  const rawQuery = searchQuery;
  const rawQueryNorm = normalizeText(rawQuery);
  const tokens = useMemo(() => {
    if (!rawQueryNorm) return [];
    return rawQueryNorm.split(/\s+/).filter(Boolean);
  }, [rawQueryNorm]);

  const isSearching = tokens.length > 0;
  const mode = isSearching ? 'search' : 'normal';

  const items = useMemo(() => {
    let baseItems: ScoredCasuistica[] = [];

    if (mode === 'normal') {
      baseItems = (currentDirection.cases || []).map((c) => ({
        ...c,
        dirId: currentDirection.id,
        dirCode: currentDirection.code,
        dirName: currentDirection.name,
        dirColor: currentDirection.colorClass,
        dirBorder: currentDirection.borderClass
      }));
    } else {
      directionsData.forEach((dir) => {
        (dir.cases || []).forEach((c) => {
          baseItems.push({
            ...c,
            dirId: dir.id,
            dirCode: dir.code,
            dirName: dir.name,
            dirColor: dir.colorClass,
            dirBorder: dir.borderClass
          });
        });
      });
    }

    if (selectedLevelFilter !== 'ALL') {
      baseItems = baseItems.filter((item) => item.nivel === selectedLevelFilter);
    }
    if (selectedCategoryFilter !== 'ALL') {
      baseItems = baseItems.filter((item) => item.categoriaComun === selectedCategoryFilter);
    }

    if (mode === 'normal') {
      return baseItems;
    }

    const scored = baseItems
      .map((item) => ({
        ...item,
        score: scoreCase(item, tokens, rawQueryNorm)
      }))
      .filter((item) => (item.score || 0) > 0);

    scored.sort((a, b) => (b.score || 0) - (a.score || 0));
    return scored;
  }, [
    mode,
    currentDirection,
    directionsData,
    tokens,
    rawQueryNorm,
    selectedLevelFilter,
    selectedCategoryFilter
  ]);

  const handleSelectDirection = (id: DirectionId) => {
    setSelectedDirectionId(id);
    if (searchQuery.trim()) {
      setSearchQuery('');
    }
  };

  const handleToggleCase = (caseId: string) => {
    setDirectionsData((prev) =>
      prev.map((dir) => {
        const hasCase = dir.cases.some((c) => c.id === caseId);
        if (!hasCase) return dir;

        return {
          ...dir,
          cases: dir.cases.map((c) => {
            if (c.id === caseId) {
              return { ...c, isOpen: !c.isOpen };
            }
            if (!allowMultipleOpen) {
              return { ...c, isOpen: false };
            }
            return c;
          })
        };
      })
    );
  };

  const handleToggleAll = () => {
    const anyOpen = items.some((item) => item.isOpen);
    const newOpenState = !anyOpen;

    setDirectionsData((prev) =>
      prev.map((dir) => ({
        ...dir,
        cases: dir.cases.map((c) => ({
          ...c,
          isOpen: newOpenState
        }))
      }))
    );
  };

  const isAnyOpen = useMemo(() => {
    return items.some((item) => item.isOpen);
  }, [items]);

  const handleOpenFirstMatch = () => {
    if (items.length === 0) return;
    const firstId = items[0].id;
    setDirectionsData((prev) =>
      prev.map((dir) => ({
        ...dir,
        cases: dir.cases.map((c) => ({
          ...c,
          isOpen: c.id === firstId
        }))
      }))
    );
  };

  const handleSelectQuickResult = (caseId: string, dirId: DirectionId) => {
    setSelectedDirectionId(dirId);
    setDirectionsData((prev) =>
      prev.map((dir) => ({
        ...dir,
        cases: dir.cases.map((c) => ({
          ...c,
          isOpen: c.id === caseId
        }))
      }))
    );
  };

  const handleOpenNewCaseModal = () => {
    setEditingCase(null);
    setModalTab('form');
    setIsModalOpen(true);
  };

  const handleEditCase = (caseItem: ScoredCasuistica) => {
    setEditingCase({
      caseItem,
      dirId: caseItem.dirId
    });
    setModalTab('form');
    setIsModalOpen(true);
  };

  const handleDeleteCase = async (caseId: string, dirId: DirectionId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta casuística?')) {
      return;
    }
    const nextDirs = directionsData.map((d) => {
      if (d.id !== dirId) return d;
      return {
        ...d,
        cases: d.cases.filter((c) => c.id !== caseId)
      };
    });
    persistDirections(nextDirs);
    showToast('Casuística eliminada');
  };

  const handleSaveCase = async (newCase: Casuistica, targetDirId: DirectionId): Promise<boolean> => {
    let nextDirs: DirectionData[] = [];
    if (editingCase) {
      nextDirs = directionsData.map((dir) => {
        if (dir.id === editingCase.dirId && editingCase.dirId !== targetDirId) {
          return {
            ...dir,
            cases: dir.cases.filter((c) => c.id !== editingCase.caseItem.id)
          };
        }
        if (dir.id === targetDirId) {
          const exists = dir.cases.some((c) => c.id === newCase.id);
          if (exists) {
            return {
              ...dir,
              cases: dir.cases.map((c) => (c.id === newCase.id ? newCase : c))
            };
          } else {
            return {
              ...dir,
              cases: [...dir.cases, newCase]
            };
          }
        }
        return dir;
      });
    } else {
      nextDirs = directionsData.map((dir) => {
        if (dir.id === targetDirId) {
          return {
            ...dir,
            cases: [...dir.cases, newCase]
          };
        }
        return dir;
      });
    }
    persistDirections(nextDirs);
    showToast('¡Casuística guardada exitosamente!', 'success');
    return true;
  };

  // PANTALLA DE ACCESO RESTRINGIDO (LOGIN POR CLAVE INSTITUCIONAL)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center p-4 selection:bg-slate-200">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-[#d81b3d] mx-auto flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Panel de Administración
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Gestión de Casuísticas y Preguntas Frecuentes MC SIGA / MINEDU
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Clave de Acceso DIGERE
              </label>
              <input
                type="password"
                required
                autoFocus
                placeholder="Ingresa clave autorizada..."
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  if (pinError) setPinError(null);
                }}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#d81b3d]/30 focus:border-[#d81b3d] transition"
              />
              {pinError && (
                <p className="text-xs font-semibold text-rose-600 pt-0.5">{pinError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-[#d81b3d] hover:bg-[#b91c1c] text-white font-bold text-sm shadow-md hover:shadow-lg transition cursor-pointer"
            >
              Ingresar al Panel de Gestión
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 text-center">
            <a
              href="/hub/casuisticas"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a la Vista Pública de Consulta</span>
            </a>
          </div>
        </div>
        <Toast message={toastMessage} type={toastType} />
      </div>
    );
  }

  // VISTA A PANTALLA COMPLETA: HOJA DE CÁLCULO EXCEL
  if (viewMode === 'excel') {
    return (
      <div className="min-h-screen antialiased bg-[#f8fafc] text-[#1e293b] flex flex-col">
        <CasuisticasExcelPage
          directions={directionsData}
          onBack={() => setViewMode('consultas')}
          onSave={handleBulkSaveCases}
          onResetOfficial={handleResetOfficialCases}
          supabaseUrl={supabaseUrl}
          supabaseKey={supabaseKey}
          isSupabaseConnected={isSupabaseConnected}
          onSyncSupabase={() => handleBulkSaveCases(directionsData)}
          onEditCase={(dirId, item) => {
            setEditingCase({ caseItem: item, dirId });
            setModalTab('form');
            setIsModalOpen(true);
          }}
          onAddNewCase={handleOpenNewCaseModal}
          isAdmin={true}
        />
        <ManagementModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          activeTab={modalTab}
          onChangeTab={setModalTab}
          directions={directionsData}
          editingCase={editingCase}
          onSaveCase={handleSaveCase}
          onDeleteCase={handleDeleteCase}
          onEditCaseFromList={(item) => {
            setEditingCase({ caseItem: item, dirId: item.dirId });
            setModalTab('form');
          }}
          supabaseUrl={supabaseUrl}
          supabaseKey={supabaseKey}
          onSaveSupabaseConfig={handleSaveSupabaseConfig}
          isSupabaseConnected={isSupabaseConnected}
          onBulkSaveCases={handleBulkSaveCases}
          onOpenFullScreenTable={() => {
            setIsModalOpen(false);
            setViewMode('excel');
          }}
        />
        <Toast message={toastMessage} type={toastType} />
      </div>
    );
  }

  // PANEL PRINCIPAL DE ADMINISTRACIÓN
  return (
    <div className="min-h-screen antialiased selection:bg-slate-200 selection:text-slate-900 bg-[#f8fafc] text-[#1e293b] flex flex-col">
      <HeaderBanner
        totalCases={totalCasesCount}
        isAdmin={true}
        onOpenNewCaseModal={handleOpenNewCaseModal}
        onOpenExcelPage={() => setViewMode('excel')}
      />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-0 space-y-6 sm:space-y-7 flex-1">
        <DirectionsGrid
          directions={directionsData}
          selectedDirectionId={selectedDirectionId}
          isSearching={!!searchQuery.trim()}
          onSelectDirection={handleSelectDirection}
        />

        <div
          id="seccion-filtro"
          className="sticky top-0 z-40 bg-[#f8fafc] pt-2 pb-2.5 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b border-slate-200/80 shadow-2xs"
        >
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onClearSearch={() => {
              setSearchQuery('');
              setSelectedLevelFilter('ALL');
              setSelectedCategoryFilter('ALL');
            }}
            onToggleAll={handleToggleAll}
            isAnyOpen={isAnyOpen}
            onOpenFirstMatch={handleOpenFirstMatch}
            selectedDirection={currentDirection}
            isSearching={mode === 'search'}
            resultsCount={items.length}
            quickResults={items}
            onSelectQuickResult={handleSelectQuickResult}
            selectedLevel={selectedLevelFilter}
            onSelectLevel={setSelectedLevelFilter}
            selectedCategory={selectedCategoryFilter}
            onSelectCategory={setSelectedCategoryFilter}
          />
        </div>

        <div className="flex-1 min-h-[calc(100vh-130px)] [overflow-anchor:none] pt-1 sm:pt-2 pb-12 space-y-6 flex flex-col justify-between">
          <CasesList
            items={items}
            mode={mode}
            direction={currentDirection}
            tokens={tokens}
            isAdmin={true}
            onToggleCase={handleToggleCase}
            onEditCase={handleEditCase}
            onDeleteCase={(item) => handleDeleteCase(item.id, item.dirId)}
            onAddNewCase={handleOpenNewCaseModal}
            onClearSearch={() => setSearchQuery('')}
            allowMultipleOpen={allowMultipleOpen}
            onToggleAllowMultiple={() => setAllowMultipleOpen((prev) => !prev)}
            onToggleDirectionAll={handleToggleAll}
            isAllOpenInDirection={isAnyOpen}
          />

          <footer className="pt-6 pb-4 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">MINEDU • DIGERE</span>
              <span className="text-slate-300">|</span>
              <span>Panel de Control Administrativo MC SIGA</span>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="/hub/casuisticas"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition cursor-pointer text-xs"
              >
                <ExternalLink className="w-3.5 h-3.5 text-sky-600" />
                <span>Vista Pública</span>
              </a>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 font-semibold transition cursor-pointer text-xs"
              >
                <Unlock className="w-3.5 h-3.5 text-rose-600" />
                <span>Cerrar Sesión Admin</span>
              </button>
            </div>
          </footer>
        </div>
      </div>

      <ManagementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        activeTab={modalTab}
        onChangeTab={setModalTab}
        directions={directionsData}
        editingCase={editingCase}
        onSaveCase={handleSaveCase}
        onDeleteCase={handleDeleteCase}
        onEditCaseFromList={(item) => {
          setEditingCase({ caseItem: item, dirId: item.dirId });
          setModalTab('form');
        }}
        supabaseUrl={supabaseUrl}
        supabaseKey={supabaseKey}
        onSaveSupabaseConfig={handleSaveSupabaseConfig}
        isSupabaseConnected={isSupabaseConnected}
        onBulkSaveCases={handleBulkSaveCases}
        onOpenFullScreenTable={() => {
          setIsModalOpen(false);
          setViewMode('excel');
        }}
      />
      <Toast message={toastMessage} type={toastType} />
    </div>
  );
}
