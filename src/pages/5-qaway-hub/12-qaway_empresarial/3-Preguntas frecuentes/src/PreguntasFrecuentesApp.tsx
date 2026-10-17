import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Lock, Unlock, FileSpreadsheet } from 'lucide-react';
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

// Claves aisladas de almacenamiento local (versión 9 multidir con DEIB)
const LOCAL_STORAGE_KEY = 'qaway_minedu_casuisticas_v9_multidir_deib';
const SUPABASE_STORAGE_URL_KEY = 'qaway_minedu_supabase_url_v1';
const SUPABASE_STORAGE_KEY_KEY = 'qaway_minedu_supabase_key_v1';

// Configuración Supabase por defecto desde entorno
const DEFAULT_SUPABASE_URL =
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  'https://qrusdsqgygfolxfrafyd.supabase.co';
const DEFAULT_SUPABASE_KEY =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_k6LYbA5uAOOMBYsP-4NNLA_dKvYh8Yi';

// Nombre de la tabla aislada y dedicada en Supabase (sin mezclar con otras tablas)
const SUPABASE_TABLE_NAME = 'minedu_casuisticas';

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

// Claves autorizadas de acceso administrativo DIGERE / MINEDU (cero bypass por URL o sesiones filtradas)
const ADMIN_ACCESS_PINS = ['DIGERE2026', 'MINEDU2026', 'QAWAY2026'];

export default function PreguntasFrecuentesApp() {
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
            DES: 'Ed. Secundaria',
            DISER: 'Servicios Rurales',
            DEIB: 'Intercultural Bilingüe',
            DEBA: 'Básica Alternativa',
            DEBE: 'Básica Especial'
          };
          const hasDeib = parsed.some((d: DirectionData) => d.id === 'DEIB');
          if (!hasDeib || parsed.length < DEFAULT_DIRECTIONS_DATA.length) {
            return JSON.parse(JSON.stringify(DEFAULT_DIRECTIONS_DATA));
          }
          return parsed.map((dir: DirectionData) => ({
            ...dir,
            name: nameMap[dir.id] || dir.name,
            cases: (dir.cases || []).map((c) => ({ ...c, isOpen: false }))
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
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'consultas' | 'excel'>('consultas');

  // Modo Administrador blindado: SIEMPRE FALSO por defecto en producción pública
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Estado para permitir múltiples preguntas abiertas simultáneamente sin colapsarse
  const [allowMultipleOpen, setAllowMultipleOpen] = useState(false);

  // Modal State (Formulario, Inventario y Conexión Supabase Cloud)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'form' | 'list' | 'cloud'>('form');
  const [editingCase, setEditingCase] = useState<{
    caseItem: Casuistica;
    dirId: DirectionId;
  } | null>(null);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Supabase State (con credenciales preconfiguradas del entorno)
  const [supabaseUrl, setSupabaseUrl] = useState(() => {
    return localStorage.getItem(SUPABASE_STORAGE_URL_KEY) || DEFAULT_SUPABASE_URL;
  });
  const [supabaseKey, setSupabaseKey] = useState(() => {
    return localStorage.getItem(SUPABASE_STORAGE_KEY_KEY) || DEFAULT_SUPABASE_KEY;
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

  // Verificación reactiva: asegurar que existan las 7 direcciones oficiales con sus casos
  useEffect(() => {
    const hasDeib = directionsData.some((d) => d.id === 'DEIB');
    if (!hasDeib || directionsData.length < DEFAULT_DIRECTIONS_DATA.length) {
      persistDirections(JSON.parse(JSON.stringify(DEFAULT_DIRECTIONS_DATA)));
    }
  }, [directionsData, persistDirections]);

  // Verificación de conectividad inicial a Supabase
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
        console.warn('[Supabase] Verificación no crítica:', e);
      }
    };
    testConn();
    return () => {
      isMounted = false;
    };
  }, [supabaseUrl, supabaseKey]);

  // Cargar datos remotos desde Supabase si la tabla minedu_casuisticas ya contiene registros
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
        console.warn('[Supabase] Carga remota:', err);
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
    showToast('¡Casuísticas oficiales restablecidas (54 casos multidir)!', 'success');
  };

  const handleToggleAdminMode = () => {
    if (isAdmin) {
      setIsAdmin(false);
      showToast('Modo Consulta Pública restablecido', 'success');
      return;
    }

    const pin = window.prompt('Ingrese clave de acceso administrativo (DIGERE / MINEDU):');
    if (pin === null) return;

    if (ADMIN_ACCESS_PINS.includes(pin.trim())) {
      setIsAdmin(true);
      showToast('Modo Gestión Administrativa activado', 'success');
    } else {
      showToast('Clave incorrecta. Acceso restringido.', 'error');
    }
  };

  // Manejo de Supabase opcional
  const handleSaveSupabaseConfig = async (url: string, key: string): Promise<boolean> => {
    if (!url || !key) return false;
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const client = createClient(url, key);
      const { error } = await client.from(SUPABASE_TABLE_NAME).select('id').limit(1);
      if (error && error.code !== 'PGRST205') {
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

  // Guardar en bloque y sincronizar a Supabase en tabla aislada minedu_casuisticas
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
          if (error.code === 'PGRST205') {
            showToast(
              'Guardado localmente. Falta crear la tabla "' + SUPABASE_TABLE_NAME + '" en Supabase (usa el botón Script Supabase)',
              'error'
            );
          } else {
            showToast('Guardado localmente. Error al sincronizar con Supabase.', 'error');
          }
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

    showToast('¡Cambios guardados exitosamente en la aplicación!', 'success');
    return true;
  };

  const totalCasesCount = useMemo(() => {
    return directionsData.reduce((acc, d) => acc + d.cases.length, 0);
  }, [directionsData]);

  const currentDirection = useMemo(() => {
    return (
      directionsData.find((d) => d.id === selectedDirectionId) || directionsData[0]
    );
  }, [directionsData, selectedDirectionId]);

  // Cálculo de casos filtrados o clasificados por búsqueda y filtros de nivel/asociados
  const { mode, tokens, items } = useMemo(() => {
    const rawQuery = searchQuery.trim();
    const rawQueryNorm = normalizeText(rawQuery);
    const isFilterActive = selectedLevelFilter !== 'ALL' || selectedCategoryFilter !== 'ALL';

    const matchesFilter = (c: Casuistica) => {
      if (selectedLevelFilter !== 'ALL' && c.nivel !== selectedLevelFilter) {
        return false;
      }
      if (selectedCategoryFilter !== 'ALL' && c.categoriaComun !== selectedCategoryFilter) {
        return false;
      }
      return true;
    };

    if (!rawQueryNorm) {
      if (!isFilterActive) {
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

      // Si hay filtro activo de categoría común (ej. "DEP – DISER"), buscamos transversalmente en todas las direcciones
      const searchAcrossAll = selectedCategoryFilter !== 'ALL';
      let candidateList: ScoredCasuistica[] = [];

      if (searchAcrossAll) {
        directionsData.forEach((dir) => {
          dir.cases.forEach((c) => {
            if (matchesFilter(c)) {
              candidateList.push({
                ...c,
                dirCode: dir.code,
                dirName: dir.name,
                dirId: dir.id,
                score: 10
              });
            }
          });
        });
      } else {
        // Si solo se filtró por nivel (ej. "Secundaria" en DISER), filtramos primero en la dirección actual
        const inDirMatches = currentDirection.cases.filter(matchesFilter);
        if (inDirMatches.length > 0) {
          candidateList = inDirMatches.map((c) => ({
            ...c,
            dirCode: currentDirection.code,
            dirName: currentDirection.name,
            dirId: currentDirection.id,
            score: 0
          }));
        } else {
          // Si la dirección actual no tiene casos de ese nivel, buscamos en todas las direcciones
          directionsData.forEach((dir) => {
            dir.cases.forEach((c) => {
              if (matchesFilter(c)) {
                candidateList.push({
                  ...c,
                  dirCode: dir.code,
                  dirName: dir.name,
                  dirId: dir.id,
                  score: 5
                });
              }
            });
          });
        }
      }

      return {
        mode: 'search' as const,
        tokens: [],
        items: candidateList
      };
    }

    const queryTokens = rawQueryNorm.split(/\s+/).filter((t) => t.length > 0);
    const scored: ScoredCasuistica[] = [];

    directionsData.forEach((dir) => {
      dir.cases.forEach((c) => {
        if (!matchesFilter(c)) return;

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
  }, [
    directionsData,
    selectedDirectionId,
    searchQuery,
    currentDirection,
    selectedLevelFilter,
    selectedCategoryFilter
  ]);

  const preserveScrollPosition = (action: () => void) => {
    const savedScrollY = window.scrollY;
    action();
    requestAnimationFrame(() => {
      window.scrollTo({ top: savedScrollY, behavior: 'instant' });
    });
  };

  // Acciones sobre acordeones manteniendo la posición exacta en pantalla (cero saltos)
  const handleToggleCase = (caseId: string) => {
    preserveScrollPosition(() => {
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
    });
  };

  const isAnyOpen = useMemo(() => {
    return items.some((item) => item.isOpen);
  }, [items]);

  const isAllOpenInDirection = useMemo(() => {
    if (items.length === 0) return false;
    return items.every((item) => item.isOpen);
  }, [items]);

  const handleToggleAllowMultiple = () => {
    preserveScrollPosition(() => {
      setAllowMultipleOpen((prev) => !prev);
    });
  };

  const handleToggleDirectionAll = () => {
    preserveScrollPosition(() => {
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
    });
  };

  const handleToggleAll = () => {
    preserveScrollPosition(() => {
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
    });
  };

  // Scroll asistido calibrado exclusivamente hasta donde están los botones de las direcciones
  const scrollToDirectionsSection = () => {
    setTimeout(() => {
      const el = document.getElementById('seccion-direcciones');
      if (el) {
        const yOffset = -72; // margen seguro para la barra blanca fija superior
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 40);
  };

  // Salto directo desde el Super Filtro estilo CRM a una casuística específica
  const handleSelectQuickResult = (item: ScoredCasuistica) => {
    // 1. Fijar dirección
    setSelectedDirectionId(item.dirId);

    // 2. Desplegar la casuística seleccionada
    const updated = directionsData.map((dir) => ({
      ...dir,
      cases: dir.cases.map((c) => (c.id === item.id ? { ...c, isOpen: true } : c))
    }));
    setDirectionsData(updated);

    // 3. Scroll suave directo a la tarjeta de la pregunta
    setTimeout(() => {
      const targetCard = document.getElementById(`case-card-${item.id}`);
      if (targetCard) {
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        scrollToDirectionsSection();
      }
    }, 60);
  };

  const handleSelectDirection = (id: DirectionId) => {
    setSelectedDirectionId(id);
    if (searchQuery) setSearchQuery('');
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

  if (viewMode === 'excel') {
    return (
      <div className="w-full min-h-screen bg-[#f8fafc] flex flex-col">
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
          isAdmin={isAdmin}
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

  return (
    <div className="min-h-screen antialiased selection:bg-slate-200 selection:text-slate-900 bg-[#f8fafc] text-[#1e293b] flex flex-col">
      {/* 1. ENCABEZADO INSTITUCIONAL A ANCHO COMPLETO (100% FULL-WIDTH) */}
      <HeaderBanner
        totalCases={totalCasesCount}
        isAdmin={isAdmin}
        onOpenNewCaseModal={handleOpenNewCaseModal}
        onOpenExcelPage={() => setViewMode('excel')}
      />

      {/* ESTILOS AISLADOS DE SCROLLBAR GRIS CLARO MINIMALISTA Y CERO REBOTE */}
      <style>{`
        .casuisticas-scroll-area {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
          overscroll-behavior-y: contain;
        }
        .casuisticas-scroll-area::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .casuisticas-scroll-area::-webkit-scrollbar-track {
          background: transparent;
        }
        .casuisticas-scroll-area::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 9999px;
        }
        .casuisticas-scroll-area::-webkit-scrollbar-thumb:hover {
          background-color: #94a3b8;
        }
      `}</style>

      {/* CONTENEDOR PRINCIPAL ERGONÓMICO CON ESPACIADO Y AIRE EQUILIBRADO */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-0 space-y-6 sm:space-y-7 flex-1">
        {/* 2. CUADRÍCULA DE DIRECCIONES PEDAGÓGICAS (CON AIRE Y VISIBILIDAD INSTITUCIONAL) */}
        <DirectionsGrid
          directions={directionsData}
          selectedDirectionId={selectedDirectionId}
          isSearching={!!searchQuery.trim()}
          onSelectDirection={handleSelectDirection}
        />

        {/* 3. BARRA DE BÚSQUEDA Y FILTRO STICKY (FONDO SÓLIDO Y ANCLADO LIMPIO) */}
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

        {/* 4. LISTA DE CASUÍSTICAS Y FOOTER INTEGRADOS AL SCROLL NATURAL CON AIRE SUPERIOR */}
        <div className="flex-1 min-h-[calc(100vh-130px)] [overflow-anchor:none] pt-1 sm:pt-2 pb-12 space-y-6 flex flex-col justify-between">
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
            onToggleAllowMultiple={handleToggleAllowMultiple}
            onToggleDirectionAll={handleToggleDirectionAll}
            isAllOpenInDirection={isAllOpenInDirection}
          />

          {/* 5. FOOTER INSTITUCIONAL Y SWITCH DE MODO ADMINISTRADOR */}
          <footer className="pt-6 pb-4 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
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
                onClick={handleToggleAdminMode}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition cursor-pointer shadow-2xs ${
                  isAdmin
                    ? 'border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold'
                    : 'border-slate-200/80 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700'
                }`}
                title={
                  isAdmin
                    ? 'Salir del Modo Administrador y volver a la vista pública'
                    : 'Acceso reservado para administradores DIGERE / MINEDU'
                }
              >
                {isAdmin ? (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Modo Admin Activo (Salir)</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Acceso Gestión</span>
                  </>
                )}
              </button>
            </div>
          </footer>
        </div>
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
        onBulkSaveCases={handleBulkSaveCases}
        onOpenFullScreenTable={() => {
          setIsModalOpen(false);
          setViewMode('excel');
        }}
      />

      {/* TOAST DE NOTIFICACIÓN */}
      <Toast message={toastMessage} type={toastType} />
    </div>
  );
}
