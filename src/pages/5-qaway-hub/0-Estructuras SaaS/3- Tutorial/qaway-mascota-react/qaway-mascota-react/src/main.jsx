import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { motion, AnimatePresence } from "motion/react";
import "./styles.css";

function Mascot({ mood }) {
  const happy = mood === "happy";

  return (
    <motion.div
      className="mascot-shell"
      animate={happy ? { y: [0, -18, 3, 0], rotate: [0, -2, 2, 0], scale: [1, 1.04, 1.02, 1] } : { y: 0, rotate: 0, scale: 1 }}
      transition={{ duration: 0.72, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <motion.div
        className="mascot-orbit"
        animate={happy ? { rotate: [0, 7, -6, 0] } : { rotate: 0 }}
        transition={{ duration: 0.72, ease: "easeInOut" }}
      />

      <svg className="mascot" viewBox="0 0 640 640" aria-label="Mascota de Qaway Lab">
        <defs>
          <linearGradient id="fur" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset=".62" stopColor="#e9edf2" />
            <stop offset="1" stopColor="#aeb9c6" />
          </linearGradient>
          <linearGradient id="tail" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ff7a18" />
            <stop offset=".5" stopColor="#ff4b0b" />
            <stop offset="1" stopColor="#9b2c11" />
          </linearGradient>
        </defs>

        {/* Cola */}
        <motion.g
          animate={happy ? { rotate: [0, 12, -10, 8, 0] } : { rotate: 0 }}
          transition={{ duration: .72, ease: "easeInOut" }}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        >
          <path
            d="M426 430 C515 386 552 442 507 492 C478 524 442 505 425 478 C470 486 489 457 475 445 C463 435 447 439 426 452Z"
            fill="url(#tail)" stroke="#0f172a" strokeWidth="7"
          />
        </motion.g>

        {/* Cuerpo */}
        <path
          d="M250 348 C231 384 226 457 247 507 C260 538 286 550 320 550 C354 550 380 538 393 507 C414 457 409 384 390 348 C363 326 277 326 250 348Z"
          fill="url(#fur)" stroke="#0f172a" strokeWidth="8"
        />

        {/* Brazos */}
        <motion.path
          d="M250 370 C218 375 195 405 181 433"
          fill="none" stroke="#d8dee5" strokeWidth="28" strokeLinecap="round"
          animate={happy ? { rotate: -18, y: -8 } : { rotate: 0, y: 0 }}
          transition={{ duration: .7, ease: [0.2, .8, .2, 1] }}
          style={{ transformBox: "fill-box", transformOrigin: "right center" }}
        />
        <motion.path
          d="M390 370 C422 375 445 405 459 433"
          fill="none" stroke="#d8dee5" strokeWidth="28" strokeLinecap="round"
          animate={happy ? { rotate: 18, y: -8 } : { rotate: 0, y: 0 }}
          transition={{ duration: .7, ease: [0.2, .8, .2, 1] }}
          style={{ transformBox: "fill-box", transformOrigin: "left center" }}
        />

        {/* Cabeza + orejas */}
        <motion.g
          animate={happy ? { rotate: [0, -3, 3, 0], scale: [1, 1.03, 1.03, 1] } : { rotate: 0, scale: 1 }}
          transition={{ duration: .72, ease: [0.2, .8, .2, 1] }}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        >
          <path d="M225 218 L199 92 C197 78 212 73 222 83 L283 151Z" fill="url(#fur)" stroke="#0f172a" strokeWidth="8" />
          <path d="M415 218 L441 92 C443 78 428 73 418 83 L357 151Z" fill="url(#fur)" stroke="#0f172a" strokeWidth="8" />
          <path d="M218 158 L213 111 L248 150Z" fill="#ff4b0b" />
          <path d="M422 158 L427 111 L392 150Z" fill="#ff4b0b" />

          <path d="M205 145 H435 V335 H205Z" rx="82" fill="#111827" stroke="#0f172a" strokeWidth="8" />

          <AnimatePresence initial={false} mode="wait">
            {!happy ? (
              <motion.g key="normal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ellipse cx="280" cy="235" rx="13" ry="25" fill="#ff7a18" />
                <ellipse cx="360" cy="235" rx="13" ry="25" fill="#ff7a18" />
                <circle cx="280" cy="232" r="5" fill="#fff" />
                <circle cx="360" cy="232" r="5" fill="#fff" />
                <path d="M308 274 Q320 281 332 274" fill="none" stroke="#ff7a18" strokeWidth="7" strokeLinecap="round" />
              </motion.g>
            ) : (
              <motion.g key="happy" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <path d="M260 241 Q280 218 300 241" fill="none" stroke="#ff7a18" strokeWidth="10" strokeLinecap="round" />
                <path d="M340 241 Q360 218 380 241" fill="none" stroke="#ff7a18" strokeWidth="10" strokeLinecap="round" />
                <path d="M296 269 Q320 305 344 269 Q342 306 320 311 Q298 306 296 269Z" fill="#ff6f7e" stroke="#ff7a18" strokeWidth="6" />
              </motion.g>
            )}
          </AnimatePresence>
        </motion.g>

        {/* Emblema */}
        <g transform="translate(320 425)">
          <rect x="-31" y="-31" width="62" height="62" rx="15" fill="#fff" opacity=".72" />
          <path d="M-22-10 L-9-24 L4-10 L-9 4Z M9-10 L22-24 L35-10 L22 4Z M-9 8 L4-6 L17 8 L4 22Z M-35 8 L-22-6 L-9 8 L-22 22Z"
            fill="#ff4b0b" transform="translate(-4 -1) scale(.72)" />
        </g>
      </svg>

      <AnimatePresence>
        {happy && (
          <>
            <motion.span className="spark spark-a" initial={{ opacity: 0, scale: .4, y: 8 }} animate={{ opacity: [0,1,0], scale: [0.4,1.15,1], y: [8,-28,-42] }} transition={{ duration: .75 }}>*</motion.span>
            <motion.span className="spark spark-b" initial={{ opacity: 0, scale: .4, y: 8 }} animate={{ opacity: [0,1,0], scale: [0.4,1.15,1], y: [8,-18,-35] }} transition={{ duration: .75, delay: .08 }}>*</motion.span>
            <motion.span className="spark spark-c" initial={{ opacity: 0, scale: .4, y: 8 }} animate={{ opacity: [0,1,0], scale: [0.4,1.15,1], y: [8,-30,-48] }} transition={{ duration: .75, delay: .16 }}>*</motion.span>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function App() {
  const [mood, setMood] = useState("normal");

  return (
    <main className="page">
      <header className="top">
        <div className="brand"><span className="brand-dot" /> Qaway <b>Lab</b></div>
        <span className="tag">React + SVG + Motion</span>
      </header>

      <section className="content">
        <div className="copy">
          <span className="eyebrow">MASCOTA INTERACTIVA</span>
          <h1>Una mascota que <span>reacciona</span> a la interfaz.</h1>
          <p>
            Este demo convierte la ilustración en un componente React.
            Pulsa el botón y la mascota pasa de normal a feliz mediante
            animaciones reales.
          </p>

          <button className="cta" onClick={() => setMood(mood === "normal" ? "happy" : "normal")}>
            {mood === "normal" ? "Hacer feliz" : "Volver a normal"}
          </button>

          <div className="status">
            <span className={mood === "happy" ? "led active" : "led"} />
            Estado: <strong>{mood === "happy" ? "Feliz" : "Normal"}</strong>
          </div>
        </div>

        <div className="stage">
          <div className="stage-glow" />
          <Mascot mood={mood} />
          <div className="label">{mood === "happy" ? "¡Vamos!" : "Qaway Assistant"}</div>
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
