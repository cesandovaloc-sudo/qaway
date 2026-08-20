import {
  ArrowRight, Bug, Check, Clock3, Droplets, Hammer, Leaf, Menu, MoreHorizontal,
  PaintRoller, Quote, Settings, ShieldCheck, SprayCan, Users, Wrench, X, Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const icons: Record<string, LucideIcon> = {
  ArrowRight, Bug, Check, Clock3, Droplets, Hammer, Leaf, Menu, MoreHorizontal,
  PaintRoller, Quote, Settings, ShieldCheck, SprayCan, Users, Wrench, X, Zap,
};

export function Icon({ name, size = 22, strokeWidth = 1.8 }: { name: string; size?: number; strokeWidth?: number }) {
  const Component = icons[name] ?? MoreHorizontal;
  return <Component size={size} strokeWidth={strokeWidth} aria-hidden="true" />;
}
