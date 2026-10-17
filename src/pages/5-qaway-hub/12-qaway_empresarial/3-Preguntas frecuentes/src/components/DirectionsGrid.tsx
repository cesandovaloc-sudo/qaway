import React from 'react';
import {
  Sparkles,
  BookOpen,
  Compass,
  Building2,
  Layers,
  GraduationCap,
  ChevronRight
} from 'lucide-react';
import { DirectionData, DirectionId } from '../types/casuistica';

interface DirectionsGridProps {
  directions: DirectionData[];
  selectedDirectionId: DirectionId;
  isSearching: boolean;
  onSelectDirection: (id: DirectionId) => void;
}

const renderDirectionIcon = (id: DirectionId) => {
  switch (id) {
    case 'DEI':
      return <Sparkles className="w-4 h-4" />;
    case 'DEP':
      return <BookOpen className="w-4 h-4" />;
    case 'DISER':
      return <Compass className="w-4 h-4" />;
    case 'DEBA':
      return <Building2 className="w-4 h-4" />;
    case 'DEBE':
      return <Layers className="w-4 h-4" />;
    case 'DES':
      return <GraduationCap className="w-4 h-4" />;
    default:
      return <BookOpen className="w-4 h-4" />;
  }
};

const DIRECTION_STYLES: Record<
  DirectionId,
  {
    iconBoxIdle: string;
    iconBoxSelected: string;
    badge: string;
  }
> = {
  DEI: {
    iconBoxIdle: 'text-amber-600 bg-amber-100/80 border border-amber-200/90 group-hover:bg-amber-200/70',
    iconBoxSelected: 'bg-amber-500 text-white border border-amber-600 shadow-xs',
    badge: 'bg-amber-50 text-amber-700 border border-amber-200 group-hover:bg-amber-100'
  },
  DEP: {
    iconBoxIdle: 'text-blue-600 bg-blue-100/80 border border-blue-200/90 group-hover:bg-blue-200/70',
    iconBoxSelected: 'bg-blue-600 text-white border border-blue-700 shadow-xs',
    badge: 'bg-blue-50 text-blue-700 border border-blue-200 group-hover:bg-blue-100'
  },
  DISER: {
    iconBoxIdle: 'text-emerald-600 bg-emerald-100/80 border border-emerald-200/90 group-hover:bg-emerald-200/70',
    iconBoxSelected: 'bg-emerald-600 text-white border border-emerald-700 shadow-xs',
    badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200 group-hover:bg-emerald-100'
  },
  DEBA: {
    iconBoxIdle: 'text-indigo-600 bg-indigo-100/80 border border-indigo-200/90 group-hover:bg-indigo-200/70',
    iconBoxSelected: 'bg-indigo-600 text-white border border-indigo-700 shadow-xs',
    badge: 'bg-indigo-50 text-indigo-700 border border-indigo-200 group-hover:bg-indigo-100'
  },
  DEBE: {
    iconBoxIdle: 'text-purple-600 bg-purple-100/80 border border-purple-200/90 group-hover:bg-purple-200/70',
    iconBoxSelected: 'bg-purple-600 text-white border border-purple-700 shadow-xs',
    badge: 'bg-purple-50 text-purple-700 border border-purple-200 group-hover:bg-purple-100'
  },
  DES: {
    iconBoxIdle: 'text-[#d81b3d] bg-rose-100/80 border border-rose-200/90 group-hover:bg-rose-200/70',
    iconBoxSelected: 'bg-[#d81b3d] text-white border border-rose-700 shadow-xs',
    badge: 'bg-rose-50 text-[#d81b3d] border border-rose-200 group-hover:bg-rose-100'
  }
};

export const DirectionsGrid: React.FC<DirectionsGridProps> = ({
  directions,
  selectedDirectionId,
  isSearching,
  onSelectDirection
}) => {
  return (
    <section aria-label="Direcciones de Educación" id="seccion-direcciones">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4.5">
        {directions.map((dir) => {
          const isSelected = dir.id === selectedDirectionId && !isSearching;
          const count = dir.cases.length;
          const style = DIRECTION_STYLES[dir.id];

          const cardClasses = isSelected
            ? 'bg-white border-2 border-[#d81b3d] shadow-[0_4px_16px_-4px_rgba(216,27,61,0.14)] ring-4 ring-rose-50'
            : 'bg-white border-2 border-slate-200/80 hover:border-slate-300 hover:shadow-xs';

          const iconBoxClasses = isSelected
            ? style.iconBoxSelected
            : style.iconBoxIdle;

          const badgeClasses = isSelected
            ? 'bg-rose-100 text-[#d81b3d] border border-rose-200'
            : style.badge;

          const arrowClasses = isSelected
            ? 'text-[#d81b3d] translate-x-1'
            : 'text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5';

          return (
            <button
              key={dir.id}
              type="button"
              onClick={() => onSelectDirection(dir.id)}
              aria-pressed={isSelected}
              className={`group w-full text-left rounded-xl h-[68px] sm:h-[72px] px-4 sm:px-4.5 py-2.5 sm:py-3 transition-colors duration-150 flex items-center justify-between gap-3.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b91c1c] cursor-pointer ${cardClasses}`}
            >
              <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                <div
                  className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${iconBoxClasses}`}
                >
                  {renderDirectionIcon(dir.id)}
                </div>

                <span
                  className={`flex-shrink-0 inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-black tracking-wide ${badgeClasses}`}
                >
                  {dir.code}
                </span>

                <div className="min-w-0">
                  <span className="block truncate text-sm font-bold text-slate-800 tracking-tight leading-tight">
                    {dir.name}
                  </span>
                  <span className="block text-[11px] font-medium text-slate-400 mt-0.5">
                    {count} {count === 1 ? 'casuística' : 'casuísticas'}
                  </span>
                </div>
              </div>

              <span className={`flex-shrink-0 transition-transform duration-150 ${arrowClasses}`}>
                <ChevronRight className="w-4 h-4" />
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
