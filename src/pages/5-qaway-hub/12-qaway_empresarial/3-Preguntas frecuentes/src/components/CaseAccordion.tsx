import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash2,
  AlertCircle,
  SlidersHorizontal,
  CheckCircle2,
  Share2,
  MessageCircle,
  Mail,
  Copy,
  Check,
  Scale,
  Lock
} from 'lucide-react';
import { ScoredCasuistica } from '../types/casuistica';

interface CaseAccordionProps {
  caseItem: ScoredCasuistica;
  isOpen: boolean;
  onToggle: () => void;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
  tokens: string[];
}

export const highlightContent = (text: string, tokens: string[]): React.ReactNode => {
  if (!text || !tokens || tokens.length === 0) return text;

  const validTokens = tokens.filter((t) => t.length > 1);
  if (validTokens.length === 0) return text;

  const regexPattern = new RegExp(
    `(${validTokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
    'gi'
  );

  const parts = text.split(regexPattern);
  return parts.map((part, index) => {
    const isMatch = validTokens.some(
      (t) => t.toLowerCase() === part.toLowerCase()
    );
    if (isMatch) {
      return (
        <mark
          key={index}
          className="bg-amber-200 text-amber-900 px-0.5 rounded font-semibold"
        >
          {part}
        </mark>
      );
    }
    return part;
  });
};

export const CaseAccordion: React.FC<CaseAccordionProps> = ({
  caseItem,
  isOpen,
  onToggle,
  isAdmin,
  onEdit,
  onDelete,
  tokens
}) => {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isNormativaOpen, setIsNormativaOpen] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setIsShareOpen(false);
      }
    };
    if (isShareOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isShareOpen]);

  const dirLabel =
    caseItem.criterioTitle && caseItem.criterioTitle.includes('–')
      ? caseItem.criterioTitle
      : `${caseItem.dirCode} – ${caseItem.dirName}`;

  const solucionText = caseItem.solucion || caseItem.accion || '';
  const ejemploText = caseItem.ejemplo || '';
  const hasNormativa = Boolean(caseItem.normativa && caseItem.normativa.trim());
  const hasCasoEspecifico = Boolean(
    caseItem.casoEspecifico && caseItem.casoEspecifico.trim()
  );

  const buildShareText = (withBold: boolean) => {
    const b = withBold ? '*' : '';
    const lines = [
      `${b}Dirección:${b} ${dirLabel}`,
      ``,
      `${b}Caso:${b} ${caseItem.title}`,
      ``,
      `${b}Desarrollo:${b} ${caseItem.desarrollo}`,
      ``,
      `${b}Solución:${b} ${solucionText}`
    ];
    if (ejemploText.trim()) {
      lines.push(``, `${ejemploText}`);
    }
    if (hasNormativa) {
      lines.push(``, `${b}Normativa:${b} ${caseItem.normativa!.trim()}`);
    }
    return lines.join('\n');
  };

  const handleShareWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = buildShareText(true);
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsShareOpen(false);
  };

  const handleShareEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    const subject = `[MINEDU • DIGERE] Caso #${caseItem.number}: ${caseItem.title}`;
    const body = buildShareText(false);
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setIsShareOpen(false);
  };

  const handleCopyText = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = buildShareText(true);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setIsShareOpen(false);
      }, 1400);
    } catch (err) {
      console.warn('Error copiando al portapapeles:', err);
    }
  };

  return (
    <article
      id={`case-card-${caseItem.id}`}
      className={`rounded-2xl transition-all duration-200 ${
        isOpen
          ? 'border border-rose-300/80 bg-white shadow-[0_1px_4px_rgba(216,27,61,0.04)]'
          : 'border border-rose-200/50 bg-white hover:border-rose-300/70 shadow-[0_1px_3px_rgba(15,23,42,0.02)]'
      }`}
    >
      <div
        className={`flex items-center justify-between transition-colors ${
          isOpen
            ? 'rounded-t-2xl bg-rose-50/65 border-b border-rose-200/60'
            : 'rounded-2xl bg-rose-50/45 hover:bg-rose-100/40'
        }`}
      >
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          className="flex-1 px-4 py-3.5 sm:px-5 sm:py-4 flex items-center justify-between gap-4 text-left focus:outline-none cursor-pointer"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <span
              className={`flex-shrink-0 w-8 h-7 rounded-md text-xs flex items-center justify-center border transition-colors ${
                isOpen
                  ? 'bg-rose-100 text-rose-800 border-rose-300/80 font-bold'
                  : 'bg-rose-50 text-rose-800 border-rose-200/60 font-bold'
              }`}
            >
              {caseItem.number}
            </span>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="inline-block text-xs uppercase tracking-wider px-2 py-0.5 rounded text-rose-800 bg-rose-100/60 border border-rose-200/70 font-semibold">
                  {caseItem.dirCode} • {caseItem.dirName}
                </span>
                {caseItem.score > 0 && (
                  <span className="inline-block text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    Relevancia: {caseItem.score}
                  </span>
                )}
              </div>
              <h3
                className={`text-sm leading-snug transition-colors ${
                  isOpen ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'
                }`}
              >
                {highlightContent(caseItem.title, tokens)}
              </h3>
            </div>
          </div>

          <span
            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
              isOpen
                ? 'rotate-180 bg-rose-100 text-rose-700 border border-rose-200'
                : 'bg-white/90 text-rose-600 border border-rose-200/60'
            }`}
          >
            <ChevronDown className="w-4 h-4" />
          </span>
        </button>

        {/* Acciones de Compartir y Administración */}
        <div className="pr-3.5 flex items-center gap-1.5 flex-shrink-0">
          {/* Botón Compartir con menú para WhatsApp, Correo y Copiar */}
          <div ref={shareRef} className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsShareOpen((prev) => !prev);
              }}
              title="Compartir por WhatsApp, correo o copiar"
              className={`p-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 text-xs font-medium ${
                isShareOpen
                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                  : 'text-slate-500 hover:text-rose-700 hover:bg-rose-100/60'
              }`}
            >
              <Share2 className="w-4 h-4" />
            </button>

            {isShareOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-[calc(100%+6px)] z-50 w-48 rounded-xl bg-white border border-slate-200/90 shadow-xl py-1.5 text-xs text-slate-700"
              >
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-emerald-50 hover:text-emerald-700 transition cursor-pointer text-left font-medium"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Enviar a WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={handleShareEmail}
                  className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer text-left font-medium"
                >
                  <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>Enviar por Correo</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer text-left font-medium border-t border-slate-100 mt-0.5 pt-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="text-emerald-700 font-semibold">¡Texto copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      <span>Copiar texto</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {isAdmin && (
            <>
              <button
                type="button"
                onClick={onEdit}
                title="Modificar esta casuística"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition cursor-pointer"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onDelete}
                title="Eliminar este caso"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Cuerpo desplegable con los 3 bloques oficiales (Fondo normal 100% blanco) */}
      {isOpen && (
        <div className="rounded-b-2xl border-t border-slate-200/60 bg-white px-4 py-5 sm:px-6 sm:py-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sección oculta para indexación y lectores de pantalla */}
            <div className="sr-only" aria-hidden="false">
              <h4>CRITERIO</h4>
              <p>{caseItem.criterioTitle}</p>
              <p>{caseItem.criterioDesc}</p>
            </div>

            {/* Columna 1: Desarrollo */}
            <div className="flex items-start gap-3.5">
              <div className="flex-shrink-0 mt-0.5 w-8 h-8 rounded-lg bg-slate-100 text-slate-500 border border-slate-200/70 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  DESARROLLO
                </p>
                <p className="text-sm leading-relaxed text-slate-700 mt-1.5 font-normal">
                  {highlightContent(caseItem.desarrollo, tokens)}
                </p>
              </div>
            </div>

            {/* Columna 2: Solución */}
            <div className="md:border-l md:border-slate-200/75 md:pl-6 flex items-start gap-3.5">
              <div className="flex-shrink-0 mt-0.5 w-8 h-8 rounded-lg bg-slate-100 text-slate-500 border border-slate-200/70 flex items-center justify-center">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  SOLUCIÓN
                </p>
                <p className="text-sm leading-relaxed text-slate-700 mt-1.5 font-normal">
                  {highlightContent(solucionText, tokens)}
                </p>
              </div>
            </div>

            {/* Columna 3: Ejemplo / Resultado esperado */}
            <div className="md:border-l md:border-slate-200/75 md:pl-6 flex items-start gap-3.5">
              <div className="flex-shrink-0 mt-0.5 w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  EJEMPLO / RESULTADO ESPERADO
                </p>
                <p className="text-sm leading-relaxed text-slate-900 mt-1.5 font-medium">
                  {ejemploText.trim()
                    ? highlightContent(ejemploText, tokens)
                    : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Bloque desplegable NORMATIVA (bajo línea horizontal, colapsado por defecto) */}
          {hasNormativa && (
            <div className="mt-4 pt-3 border-t border-slate-200/70">
              <button
                type="button"
                onClick={() => setIsNormativaOpen((prev) => !prev)}
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-rose-700 transition cursor-pointer"
              >
                <ChevronRight
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isNormativaOpen ? 'rotate-90 text-rose-700' : 'text-slate-400'
                  }`}
                />
                <Scale className="w-3.5 h-3.5" />
                <span>NORMATIVA</span>
              </button>
              {isNormativaOpen && (
                <div className="mt-2.5 rounded-xl bg-slate-50 border border-slate-200/80 px-3.5 py-2.5 text-xs leading-relaxed text-slate-700 whitespace-pre-line">
                  {highlightContent(caseItem.normativa!, tokens)}
                </div>
              )}
            </div>
          )}

          {/* Nota interna de UGEL (Caso específico — Visible exclusivamente en Modo Admin) */}
          {isAdmin && hasCasoEspecifico && (
            <div className="mt-3 pt-3 border-t border-amber-200/60">
              <div className="rounded-xl bg-amber-50/70 border border-amber-200/80 px-3.5 py-2.5 flex items-start gap-2.5">
                <Lock className="w-3.5 h-3.5 text-amber-700 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 leading-relaxed">
                  <span className="font-bold uppercase tracking-wider text-amber-800 mr-1.5">
                    Detalle interno UGEL (Solo Admin):
                  </span>
                  <span>{highlightContent(caseItem.casoEspecifico!, tokens)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
};
