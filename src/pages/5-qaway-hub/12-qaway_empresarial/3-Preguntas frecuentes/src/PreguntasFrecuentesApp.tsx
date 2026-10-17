import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Lock, Unlock } from 'lucide-react';
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

// Claves aisladas de almacenamiento local
const LOCAL_STORAGE_KEY = 'qaway_minedu_casuisticas_v1';
const SUPABASE_STORAGE_URL_KEY = 'qaway_minedu_supabase_url_v1';
const SUPABASE_STORAGE_KEY_KEY = 'qaway_minedu_supabase_key_v1';
const ADMIN_MODE_KEY = 'qaway_minedu_admin_mode_v1';

// Normalizador de texto (ignora mayúsculas y acentos)
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
    { key: 'accion', weight: 10 },
    { key: 'desarrollo', weight: 8 },
    { key: 'criterioDesc', weight: 6 },
    { key: 'dirCode', weight: 10 },
    { key: 'dirName', weight: 6 },
    { key: 'number', weight: 14 }
  ] as const;

  let totalScore = 0;
  let matchedTokensCount = 0;

  const fullTextNormalized = normalizeText(
    `${item.number} ${item.title} ${item.criterioTitle} ${item.criterioDesc} ${item.desarrollo} ${item.accion} ${item.solucion} ${item.dirCode} ${item.dirName}`
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

export default function PreguntasFrecuentesApp() {
  // Comportamiento de Scroll Inteligente para el Hero (desaparece al bajar, aparece al subir)
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  const lastScrollY = React.useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY <= 80) {
        setIsHeroVisible(true);
      } else if (currentScrollY > lastScrollY.current + 12) {
        // Desplazamiento hacia abajo: ocultar hero suavemente
        setIsHeroVisible(false);
      } else if (currentScrollY < lastScrollY.current - 12) {
        // Desplazamiento hacia arriba (regresa): mostrar hero
        setIsHeroVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Inicialización de datos
  const [directionsData, setDirectionsData] = useState<DirectionData[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const nameMap: Record<string, string> = {
            DEI: 'Ed. Inicial',
            DEP: 'Ed. Primaria',
            DISER: 'Servicios Rurales',
            DEBA: 'Básica Alternativa',
            DEBE: 'Básica Especial',
            DES: 'Ed. Secundaria'
          };
          return parsed.map((dir: DirectionData) => ({
            ...dir,
            name: nameMap[dir.id] || dir.name,
            cases: dir.cases.map((c) => ({ ...c, isOpen: false }))
          }));
        }
      }
    } catch (e) {
      console.warn('Error leyendo LocalStorage:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_DIRECTIONS_DATA));
  });

  const [selectedDirectionId, setSelectedDirectionId] = useState<DirectionId>('DEI');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('admin') === 'true') return true;
      return localStorage.getItem(ADMIN_MODE_KEY) === 'true';
    }
    return false;
  });

  // Estado para permitir múltiples preguntas abiertas simultáneamente sin colapsarse
  const [allowMultipleOpen, setAllowMultipleOpen] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'form' | 'list' | 'cloud'>('form');
  const [editingCase, setEditingCase] = useState<{
    caseItem: Casuistica;
    dirId: DirectionId;
  } | null>(null);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Supabase State
  const [supabaseUrl, setSupabaseUrl] = useState(() => {
    return localStorage.getItem(SUPABASE_STORAGE_URL_KEY) || '';
  });
  const [supabaseKey, setSupabaseKey] = useState(() => {
    return localStorage.getItem(SUPABASE_STORAGE_KEY_KEY) || '';
  });
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  // Guardar en LocalStorage cada vez que cambian las direcciones
  const persistDirections = useCallback((newData: DirectionData[]) => {
    setDirectionsData(newData);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData));
    } catch (err) {
      console.warn('Error guardando en caché local:', err);
    }
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const toggleAdminMode = () => {
    setIsAdmin((prev) => {
      const next = !prev;
      localStorage.setItem(ADMIN_MODE_KEY, String(next));
      showToast(
        next ? 'Modo Administrador activado' : 'Modo Consulta (Público) activado',
        'success'
      );
      return next;
    });
  };

  // Manejo de Supabase opcional
  const handleSaveSupabaseConfig = async (url: string, key: string): Promise<boolean> => {
    if (!url || !key) return false;
    try {
      // Dynamic import to avoid breaking if supabase fails
      const { createClient } = await import('@supabase/supabase-js');
      const client = createClient(url, key);
      const { error } = await client.from('casuisticas').select('id').limit(1);
      if (error) {
        console.warn('Supabase test query error:', error);
        return false;
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

  const totalCasesCount = useMemo(() => {
    return directionsData.reduce((acc, d) => acc + d.cases.length, 0);
  }, [directionsData]);

  const currentDirection = useMemo(() => {
    return (
      directionsData.find((d) => d.id === selectedDirectionId) || directionsData[0]
    );
  }, [directionsData, selectedDirectionId]);

  // Cálculo de casos filtrados o clasificados por búsqueda
  const { mode, tokens, items } = useMemo(() => {
    const rawQuery = searchQuery.trim();
    const rawQueryNorm = normalizeText(rawQuery);

    if (!rawQueryNorm) {
      return {
        mode: 'direction' as const,
        tokens: [],
        items: currentDirection.cases.map((c) => ({
          ...c,
          dirCode: currentDirection.code,
          dirName: currentDirection.name,
          dirId: currentDirection.id,
          score: 0
        }))
      };
    }

    const queryTokens = rawQueryNorm.split(/\s+/).filter((t) => t.length > 0);
    const scored: ScoredCasuistica[] = [];

    directionsData.forEach((dir) => {
      dir.cases.forEach((c) => {
        const item: ScoredCasuistica = {
          ...c,
          dirCode: dir.code,
          dirName: dir.name,
          dirId: dir.id,
          score: 0
        };
        const score = scoreCase(item, queryTokens, rawQueryNorm);
        if (score > 0) {
          scored.push({
            ...item,
            score
          });
        }
      });
    });

    scored.sort((a, b) => b.score - a.score);

    return {
      mode: 'search' as const,
      tokens: queryTokens,
      items: scored
    };
  }, [directionsData, selectedDirectionId, searchQuery, currentDirection]);

  // Acciones sobre acordeones
  const handleToggleCase = (caseId: string) => {
    const updated = directionsData.map((dir) => ({
      ...dir,
      cases: dir.cases.map((c) => {
        if (c.id === caseId) {
          return { ...c, isOpen: !c.isOpen };
        }
        return allowMultipleOpen ? c : { ...c, isOpen: false };
      })
    }));
    setDirectionsData(updated);
  };

  const isAnyOpen = useMemo(() => {
    return items.some((item) => item.isOpen);
  }, [items]);

  const isAllOpenInDirection = useMemo(() => {
    if (items.length === 0) return false;
    return items.every((item) => item.isOpen);
  }, [items]);

  const handleToggleDirectionAll = () => {
    const shouldOpen = !isAllOpenInDirection;
    const targetIds = new Set(items.map((i) => i.id));
    const updated = directionsData.map((dir) => ({
      ...dir,
      cases: dir.cases.map((c) =>
        targetIds.has(c.id) ? { ...c, isOpen: shouldOpen } : c
      )
    }));
    if (shouldOpen) {
      setAllowMultipleOpen(true);
    }
    setDirectionsData(updated);
  };

  const handleToggleAll = () => {
    const shouldOpen = !isAnyOpen;
    const targetIds = new Set(items.map((i) => i.id));
    const updated = directionsData.map((dir) => ({
      ...dir,
      cases: dir.cases.map((c) =>
        targetIds.has(c.id) ? { ...c, isOpen: shouldOpen } : c
      )
    }));
    if (shouldOpen) {
      setAllowMultipleOpen(true);
    }
    setDirectionsData(updated);
  };

  // Scroll asistido calibrado exclusivamente hasta donde están los botones de las direcciones
  const scrollToDirectionsSection = () => {
    setTimeout(() => {
      const el = document.getElementById('seccion-direcciones');
      if (el) {
        const yOffset = -60; // margen seguro para la barra blanca fija
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 40);
  };

  const handleSelectDirection = (id: DirectionId) => {
    setSelectedDirectionId(id);
    setSearchQuery('');
    scrollToDirectionsSection();
  };

  const handleOpenFirstMatch = () => {
    if (items.length === 0) return;
    const first = items[0];
    const updated = directionsData.map((dir) => ({
      ...dir,
      cases: dir.cases.map((c) => (c.id === first.id ? { ...c, isOpen: true } : c))
    }));
    setDirectionsData(updated);

    // Scroll calibrado justo hasta donde están los botones de las direcciones
    scrollToDirectionsSection();
  };

  // Creación y edición
  const handleOpenNewCaseModal = () => {
    setEditingCase(null);
    setModalTab('form');
    setIsModalOpen(true);
  };

  const handleEditCase = (item: ScoredCasuistica) => {
    setEditingCase({
      caseItem: item,
      dirId: item.dirId
    });
    setModalTab('form');
    setIsModalOpen(true);
  };

  const handleDeleteCase = (caseId: string, dirId: DirectionId) => {
    if (!window.confirm('¿Confirmas que deseas eliminar esta casuística del banco?')) {
      return;
    }
    const updated = directionsData.map((dir) => {
      if (dir.id === dirId) {
        return {
          ...dir,
          cases: dir.cases.filter((c) => c.id !== caseId)
        };
      }
      return dir;
    });
    persistDirections(updated);
    showToast('Casuística eliminada correctamente');
  };

  const handleSaveCase = (dirId: DirectionId, caseItem: Casuistica) => {
    let updated: DirectionData[];
    const isEditing = !!editingCase;

    if (isEditing) {
      // Si cambió de dirección, remover de la anterior y agregar a la nueva
      const oldDirId = editingCase.dirId;
      if (oldDirId === dirId) {
        updated = directionsData.map((dir) => {
          if (dir.id === dirId) {
            return {
              ...dir,
              cases: dir.cases.map((c) => (c.id === caseItem.id ? caseItem : c))
            };
          }
          return dir;
        });
      } else {
        updated = directionsData.map((dir) => {
          if (dir.id === oldDirId) {
            return {
              ...dir,
              cases: dir.cases.filter((c) => c.id !== caseItem.id)
            };
          }
          if (dir.id === dirId) {
            return {
              ...dir,
              cases: [...dir.cases, caseItem]
            };
          }
          return dir;
        });
      }
      showToast('Casuística actualizada exitosamente');
    } else {
      updated = directionsData.map((dir) => {
        if (dir.id === dirId) {
          return {
            ...dir,
            cases: [...dir.cases, caseItem]
          };
        }
        return dir;
      });
      showToast('Nueva casuística registrada en el banco');
    }

    persistDirections(updated);
    setSelectedDirectionId(dirId);
    setSearchQuery('');
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen antialiased selection:bg-slate-200 selection:text-slate-900 bg-[#f8fafc] text-[#1e293b] flex flex-col">
      {/* 1. ENCABEZADO INSTITUCIONAL A ANCHO COMPLETO (100% FULL-WIDTH CON SCROLL REVEAL) */}
      <HeaderBanner
        totalCases={totalCasesCount}
        isAdmin={isAdmin}
        onOpenNewCaseModal={handleOpenNewCaseModal}
        isVisible={isHeroVisible}
      />

      {/* CONTENEDOR PRINCIPAL ERGONÓMICO */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-5 flex-1">
        {/* 2. CUADRÍCULA DE DIRECCIONES PEDAGÓGICAS */}
        <DirectionsGrid
          directions={directionsData}
          selectedDirectionId={selectedDirectionId}
          isSearching={!!searchQuery.trim()}
          onSelectDirection={handleSelectDirection}
        />

        {/* 3. BARRA DE BÚSQUEDA Y FILTRO */}
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClearSearch={() => setSearchQuery('')}
          onToggleAll={handleToggleAll}
          isAnyOpen={isAnyOpen}
          onOpenFirstMatch={handleOpenFirstMatch}
          selectedDirection={currentDirection}
          isSearching={mode === 'search'}
          resultsCount={items.length}
        />

        {/* 4. LISTA DE CASUÍSTICAS Y ACORDEONES */}
        <CasesList
          items={items}
          mode={mode}
          direction={currentDirection}
          tokens={tokens}
          isAdmin={isAdmin}
          onToggleCase={handleToggleCase}
          onEditCase={handleEditCase}
          onDeleteCase={(item) => handleDeleteCase(item.id, item.dirId)}
          onAddNewCase={handleOpenNewCaseModal}
          onClearSearch={() => setSearchQuery('')}
          allowMultipleOpen={allowMultipleOpen}
          onToggleAllowMultiple={() => setAllowMultipleOpen((prev) => !prev)}
          onToggleDirectionAll={handleToggleDirectionAll}
          isAllOpenInDirection={isAllOpenInDirection}
        />

        {/* 5. FOOTER INSTITUCIONAL Y SWITCH DE MODO ADMINISTRADOR */}
        <footer className="pt-6 pb-8 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">MINEDU • DIGERE</span>
            <span className="text-slate-300">|</span>
            <span>Monitoreo Cuadro de Distribución MC SIGA</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-slate-400">
              {isSupabaseConnected
                ? 'Almacenamiento: Supabase Cloud (Tiempo Real)'
                : 'Almacenamiento: Caché Local'}
            </span>
            <button
              type="button"
              onClick={toggleAdminMode}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-600 font-medium transition cursor-pointer text-[11px] shadow-2xs"
              title="Alternar entre vista pública de consulta y modo administrador"
            >
              {isAdmin ? (
                <Unlock className="w-3.5 h-3.5 text-amber-600" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>{isAdmin ? 'Modo Admin Activo' : 'Acceso Administrador'}</span>
            </button>
          </div>
        </footer>
      </div>

      {/* MODAL DE GESTIÓN Y ADMINISTRACIÓN */}
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
      />

      {/* TOAST DE NOTIFICACIÓN */}
      <Toast message={toastMessage} type={toastType} />
    </div>
  );
}
