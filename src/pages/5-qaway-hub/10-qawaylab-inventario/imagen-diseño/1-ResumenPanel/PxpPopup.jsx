import React, { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

const PXP_DMENU_CSS = `.pxp-dmenu{position:absolute;left:0;top:calc(100% + 8px);min-width:200px;background:#fff;border:1px solid #e2e8f0;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,0.12),0 4px 12px rgba(15,23,42,0.06);padding:6px;z-index:1200;color-scheme:light}.pxp-dmenu-item{display:flex;width:100%;align-items:center;gap:8px;padding:8px 10px;border:0;background:transparent;border-radius:8px;font-size:13px;font-weight:500;color:#334155;cursor:pointer;text-align:left;transition:background .12s ease}.pxp-dmenu-item:hover{background:#f1f5f9;color:#0f172a}.pxp-dmenu-item.sel{background:#fff2eb;color:#ff4b0b;font-weight:600}.pxp-dmenu-dot{flex-shrink:0;width:6px;height:6px;border-radius:50%;background:#e2e8f0}.pxp-dmenu-item.sel .pxp-dmenu-dot{background:#ff4b0b}`;

export default function PxpPopup({ value, options, onChange, renderLabel, wrapStyle }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
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
    <>
      <style>{PXP_DMENU_CSS}</style>
      <div className="pxp-select-wrap" style={wrapStyle} ref={ref}>
        <button type="button" className="pxp-select" style={{ textAlign: "left", width: "100%" }} onClick={() => setOpen(o => !o)}>
          {label}
        </button>
        <ChevronDown size={14} className="pxp-select-chevron" />
        {open && (
          <div className="pxp-dmenu">
            {options.map(opt => (
              <button
                type="button"
                key={opt.v}
                className={`pxp-dmenu-item ${opt.v === value ? "sel" : ""}`}
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
    </>
  );
}