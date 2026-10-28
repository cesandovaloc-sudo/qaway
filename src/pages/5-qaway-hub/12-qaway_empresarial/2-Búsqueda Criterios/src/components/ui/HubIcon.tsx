/* ============================================================================
 * HubIcon — Wrapper tipado canónico §13.3 (lucide-react)
 * Extraído verbatim de 'Propuesta de codigo.txt' sin alteración visual
 * ============================================================================ */
import type { LucideIcon } from "lucide-react";

/* Tamaños libres: la app ya usa 11–26 px (incl. 12.5) en producción; el union
 * original (14|16|18|20|24) solo existía en la propuesta tipográfica y excluía
 * usos reales. Ajuste puramente declarativo: cero impacto visual. */
export type AllowedIconSize = number;

export interface HubIconProps {
  icon: LucideIcon | undefined;
  size?: AllowedIconSize;
  strokeWidth?: number;
  className?: string;
  ariaLabel?: string;
}

export function HubIcon({
  icon: IconComponent,
  size = 18,
  strokeWidth = 1.75,
  className = "",
  ariaLabel,
}: HubIconProps) {
  if (!IconComponent) {
    return (
      <span
        className={`inline-block rounded-xs bg-zinc-200 ${className}`}
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
    );
  }
  return (
    <IconComponent
      size={size}
      strokeWidth={strokeWidth}
      className={`shrink-0 ${className}`}
      aria-label={ariaLabel}
      aria-hidden={!ariaLabel}
    />
  );
}

export default HubIcon;
