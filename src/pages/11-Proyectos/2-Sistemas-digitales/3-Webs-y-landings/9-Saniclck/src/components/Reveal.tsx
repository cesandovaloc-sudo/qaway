import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { useReveal } from "../hooks/useReveal";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
};

export function Reveal({ children, className = "", delay = 0, y = 28 }: Props) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const reduced = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : y }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: reduced ? 0 : y }}
      transition={{ duration: reduced ? 0 : 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
