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

export const DirectionsGrid: React.FC<DirectionsGridProps> = ({
  directions,
  selectedDirectionId,
  isSearching,
  onSelectDirection
}) => {
  return (
    <section aria-label="Direcciones de Educación">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4.5">
        {directions.map((dir) => {
          const isSelected = dir.id === selectedDirectionId && !isSearching;
          const count = dir.cases.length;

          const cardClasses = isSelected
            ? 'bg-white border-2 border-[#b91c1c] shadow-[0_4px_16px_-4px_rgba(185,28,28,0.12)] ring-4 ring-rose-50'
            : 'bg-white border-2 border-slate-200/80 hover:border-slate-300 hover:shadow-xs';

          const iconBoxClasses = isSelected
            ? 'text-[#b91c1c] bg-rose-50 border border-rose-100'
            : 'text-slate-700 bg-slate-50 border border-slate-200/60 group-hover:text-slate-900 group-hover:bg-slate-100';

          const badgeClasses = isSelected
            ? 'bg-rose-100 text-[#b91c1c] border border-rose-200'
            : 'bg-slate-100 text-slate-700 border border-slate-200 group-hover:bg-slate-200/70';

          const arrowClasses = isSelected
            ? 'text-[#b91c1c] translate-x-1'
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
