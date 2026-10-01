import React, { useEffect, useRef, useState, memo } from "react";
import { ChevronDown } from "lucide-react";

const PXP_DMENU_CSS = `.pxp-dmenu{position:absolute;left:0;top:calc(100% + 8px);min-width:100%;width:100%;box-sizing:border-box;background:#fff;border:1px solid #e2e8f0;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,0.12),0 4px 12px rgba(15,23,42,0.06);padding:6px;z-index:1200;color-scheme:light;background-color:#fff;color:#0f172a}.pxp-dmenu-item{display:flex;width:100%;align-items:center;gap:8px;padding:8px 10px;border:0;background:transparent;background-color:transparent;border-radius:8px;font-size:13px;font-weight:500;color:#334155;cursor:pointer;text-align:left;transition:background .12s ease}.pxp-dmenu-item:hover{background:#f1f5f9;background-color:#f1f5f9;color:#0f172a}.pxp-dmenu-item.sel{background:#f4f4f5;background-color:#f4f4f5;color:#0f172a;font-weight:600}.pxp-dmenu-dot{flex-shrink:0;width:6px;height:6px;border-radius:50%;background:#e2e8f0;background-color:#e2e8f0}.pxp-dmenu-item.sel .pxp-dmenu-dot{background:#52525b;background-color:#52525b}`;

// Inyectar 1 sola vez a nivel documento (antes se inyectaba dentro de cada popup
// y React recreaba el <style> al abrir/cerrar = flash negro por FOUC).
function ensureMenuCssOnce() {
  try {
    if (typeof document === "undefined") return;
    // v3 = menú al 100% del campo (antes min 200px fijo). Se eliminan versiones previas de la sesión con HMR.
    const old = document.getElementById("pxp-dmenu-css");
    if (old) old.remove();
    const old2 = document.getElementById("pxp-dmenu-css-v2");
    if (old2) old2.remove();
    if (document.getElementById("pxp-dmenu-css-v3")) return;
    const el = document.createElement("style");
    el.id = "pxp-dmenu-css-v3";
    el.textContent = PXP_DMENU_CSS;
    document.head.appendChild(el);
  } catch {}
}

function PxpPopupInner({ value, options, onChange, renderLabel, wrapStyle }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    ensureMenuCssOnce();
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }
    function handleEscape(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const label = renderLabel ? renderLabel(value) : value;

  return (
      <div className="pxp-select-wrap" style={{ ...wrapStyle, backgroundColor: "#fff", colorScheme: "light" }} ref={ref}>
        <button type="button" className="pxp-select" style={{ textAlign: "left", width: "100%", backgroundColor: "#fff", colorScheme: "light" }} onClick={() => setOpen(o => !o)}>
          {label}
        </button>
        <ChevronDown size={14} className="pxp-select-chevron" />
        {open && (
          <div className="pxp-dmenu" style={{ backgroundColor: "#fff", colorScheme: "light" }}>
            {options.map(opt => (
              <button
                type="button"
                key={opt.v}
                className={`pxp-dmenu-item ${opt.v === value ? "sel" : ""}`}
                style={{ backgroundColor: opt.v === value ? "#f4f4f5" : "transparent", color: opt.v === value ? "#0f172a" : undefined, colorScheme: "light" }}
                onClick={() => {
                  onChange(opt.v);
                  setOpen(false);
                }}
              >
                <span className="pxp-dmenu-dot" />
                <span>{opt.l}</span>
              </button>
            ))}
          </div>
        )}
      </div>
  );
}

const PxpPopup = memo(PxpPopupInner);
export default PxpPopup;