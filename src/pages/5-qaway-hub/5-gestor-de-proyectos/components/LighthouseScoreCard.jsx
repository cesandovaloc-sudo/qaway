import { motion } from "framer-motion";
import { Zap, ShieldCheck, Award, Search, Sparkles, CheckCircle2 } from "lucide-react";

export function LighthouseScoreCard({ scores }) {
  const data = scores || {
    performance: 98,
    accessibility: 100,
    bestPractices: 96,
    seo: 100,
    lcp: "0.8s",
    cls: "0.00",
    fid: "14ms",
    totalSize: "442 kB"
  };

  const metrics = [
    { label: "Rendimiento", score: data.performance, icon: Zap, color: "#00b090" },
    { label: "Accesibilidad", score: data.accessibility, icon: ShieldCheck, color: "#00b090" },
    { label: "Buenas Prácticas", score: data.bestPractices, icon: Award, color: "#00b090" },
    { label: "SEO Técnico", score: data.seo, icon: Search, color: "#00b090" },
  ];

  return (
    <div className="qw-gestor-audit-card">
      <div className="qw-gestor-audit-header">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div className="qw-gestor-badge-google">
            <Sparkles size={15} color="#fe6612" />
            <span>Auditoría Oficial Google Lighthouse</span>
          </div>
          <span className="qw-gestor-badge-passed">
            <CheckCircle2 size={13} />
            <span>100% Aprobado</span>
          </span>
        </div>
        <span style={{ fontSize: "12px", color: "#71717a", fontWeight: "600" }}>
          Estándar Core Web Vitals
        </span>
      </div>

      {/* 4 Velocímetros Circulares Nativos SVG */}
      <div className="qw-gestor-gauges-grid">
        {metrics.map((m, idx) => {
          const radius = 36;
          const circumference = 2 * Math.PI * radius;
          const strokeDashoffset = circumference - (m.score / 100) * circumference;

          return (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="qw-gestor-gauge-item"
            >
              <div className="qw-gestor-gauge-svg-wrap">
                <svg width="92" height="92" viewBox="0 0 92 92">
                  <circle
                    cx="46"
                    cy="46"
                    r={radius}
                    stroke="#e4e4e7"
                    strokeWidth="7"
                    fill="transparent"
                  />
                  <circle
                    cx="46"
                    cy="46"
                    r={radius}
                    stroke={m.color}
                    strokeWidth="7"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{
                      transformOrigin: "center",
                      transform: "rotate(-90deg)",
                      transition: "stroke-dashoffset 1s ease-in-out",
                    }}
                  />
                </svg>
                <div className="qw-gestor-gauge-value">
                  <span>{m.score}</span>
                </div>
              </div>
              <span className="qw-gestor-gauge-label">{m.label}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Métricas de Core Web Vitals */}
      <div className="qw-gestor-cwv-grid">
        <div className="qw-gestor-cwv-box">
          <span className="qw-gestor-cwv-name">LCP (Carga de Imagen)</span>
          <strong className="qw-gestor-cwv-val text-emerald-600">{data.lcp}</strong>
          <small className="qw-gestor-cwv-sub">Óptimo (&lt; 1.2s)</small>
        </div>
        <div className="qw-gestor-cwv-box">
          <span className="qw-gestor-cwv-name">CLS (Salto Visual)</span>
          <strong className="qw-gestor-cwv-val text-emerald-600">{data.cls}</strong>
          <small className="qw-gestor-cwv-sub">Estabilidad Total</small>
        </div>
        <div className="qw-gestor-cwv-box">
          <span className="qw-gestor-cwv-name">FID / INP (Respuesta)</span>
          <strong className="qw-gestor-cwv-val text-emerald-600">{data.fid}</strong>
          <small className="qw-gestor-cwv-sub">Instantáneo</small>
        </div>
        <div className="qw-gestor-cwv-box">
          <span className="qw-gestor-cwv-name">Peso Total Assets</span>
          <strong className="qw-gestor-cwv-val text-zinc-800">{data.totalSize}</strong>
          <small className="qw-gestor-cwv-sub">Optimizado WebP</small>
        </div>
      </div>
    </div>
  );
}
