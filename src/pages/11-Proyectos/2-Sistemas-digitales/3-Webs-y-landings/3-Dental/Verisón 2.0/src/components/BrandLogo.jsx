import { Tooth } from "@phosphor-icons/react";

export function BrandLogo({ inverse = false }) {
  const textTone = inverse ? "text-white" : "text-ink";
  const subTone = inverse ? "text-white/70" : "text-ink/55";

  return (
    <a className="inline-flex items-center gap-3" href="#inicio" aria-label="Sonrisa Clínica Dental, inicio">
      <Tooth className="h-12 w-12 text-rose-500" weight="light" aria-hidden="true" />
      <span className="leading-none">
        <span className={"block text-[1.45rem] font-semibold tracking-[0.16em] " + textTone}>SONRISA</span>
        <span className={"mt-1 block text-[0.68rem] font-medium tracking-[0.22em] " + subTone}>CLÍNICA DENTAL</span>
      </span>
    </a>
  );
}
