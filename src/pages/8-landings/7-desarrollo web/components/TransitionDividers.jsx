import { motion } from 'framer-motion'

/**
 * ESTILO 1: MOSAICO DE PÍXELES / GRID DISSOLVE
 * Transición geométrica con matriz de cuadraditos naranjas (#ff4b0b) de densidad progresiva.
 */
export function PixelGridDivider() {
  return (
    <div style={{ position: 'relative', width: '100%', background: '#0a1017', overflow: 'hidden', padding: '24px 0 0' }}>
      {/* Badge identificador para demo */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
        <span style={{
          background: 'rgba(255, 75, 11, 0.15)',
          border: '1px solid rgba(255, 75, 11, 0.4)',
          color: '#ff4b0b',
          fontSize: '11px',
          fontWeight: '700',
          padding: '4px 12px',
          borderRadius: '999px',
          letterSpacing: '0.05em',
          textTransform: 'uppercase'
        }}>
          ESTILO 1 · Mosaico de Píxeles / Grid Dissolve
        </span>
      </div>

      {/* Matriz de Píxeles Escalonados */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(28px, 1fr))',
        gap: '3px',
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 16px'
      }}>
        {/* Fila 1 (Baja densidad - 20%) */}
        {Array.from({ length: 36 }).map((_, i) => (
          <motion.div
            key={`r1-${i}`}
            initial={{ opacity: 0.3 }}
            whileHover={{ scale: 1.2, backgroundColor: '#ff4b0b', opacity: 1 }}
            style={{
              height: '24px',
              backgroundColor: i % 4 === 0 || i % 7 === 0 ? 'rgba(255, 75, 11, 0.35)' : 'transparent',
              borderRadius: '3px',
              transition: 'all 0.2s ease'
            }}
          />
        ))}

        {/* Fila 2 (Media densidad - 55%) */}
        {Array.from({ length: 36 }).map((_, i) => (
          <motion.div
            key={`r2-${i}`}
            initial={{ opacity: 0.7 }}
            whileHover={{ scale: 1.2, backgroundColor: '#ff4b0b', opacity: 1 }}
            style={{
              height: '26px',
              backgroundColor: i % 2 === 0 || i % 5 === 0 ? 'rgba(255, 75, 11, 0.7)' : 'rgba(255, 75, 11, 0.15)',
              borderRadius: '3px',
              transition: 'all 0.2s ease'
            }}
          />
        ))}

        {/* Fila 3 (Alta densidad - 90%) */}
        {Array.from({ length: 36 }).map((_, i) => (
          <motion.div
            key={`r3-${i}`}
            initial={{ opacity: 1 }}
            whileHover={{ scale: 1.15, backgroundColor: '#ffffff' }}
            style={{
              height: '28px',
              backgroundColor: i % 9 === 0 ? 'rgba(255, 75, 11, 0.6)' : '#ff4b0b',
              borderRadius: '3px',
              transition: 'all 0.2s ease'
            }}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * ESTILO 2: CARD OVERLAP / TARJETA FLOTANTE SUPERPUESTA
 * Elevación física montada sobre la sección anterior con bordes redondeados y sombra.
 */
export function CardOverlapDivider() {
  return (
    <div style={{ position: 'relative', width: '100%', marginTop: '-36px', zIndex: 20 }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: '#ffffff',
        borderTopLeftRadius: '32px',
        borderTopRightRadius: '32px',
        padding: '24px 32px 16px',
        boxShadow: '0 -20px 40px -15px rgba(0,0,0,0.18)',
        border: '1px solid rgba(0,0,0,0.06)',
        borderBottom: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <span style={{
          background: '#111111',
          color: '#ffffff',
          fontSize: '11px',
          fontWeight: '700',
          padding: '4px 12px',
          borderRadius: '999px',
          letterSpacing: '0.05em',
          textTransform: 'uppercase'
        }}>
          ESTILO 2 · Card Overlap / Tarjeta Flotante
        </span>
        <span style={{ fontSize: '12px', color: '#71717a', fontWeight: '600' }}>
          Elevación física montada sobre la sección previa ↑
        </span>
      </div>
    </div>
  )
}

/**
 * ESTILO 3: TECH BLUEPRINT (Malla de ingeniería con cruces +)
 * Cuadrícula de arquitectura de software con coordenadas y líneas de precisión.
 */
export function TechBlueprintDivider() {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      background: '#090d12',
      borderTop: '1px solid rgba(255, 75, 11, 0.25)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '28px 24px',
      backgroundImage: 'radial-gradient(rgba(255, 75, 11, 0.15) 1px, transparent 1px)',
      backgroundSize: '24px 24px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            background: 'rgba(255, 75, 11, 0.12)',
            border: '1px solid #ff4b0b',
            color: '#ff4b0b',
            fontSize: '11px',
            fontWeight: '700',
            padding: '4px 12px',
            borderRadius: '4px',
            fontFamily: 'monospace',
            textTransform: 'uppercase'
          }}>
            ESTILO 3 · Tech Blueprint [Grid Matrix]
          </span>
          <span style={{ color: '#52525b', fontSize: '11px', fontFamily: 'monospace' }}>
            + + + COORD [X:104.2 / Y:88.0]
          </span>
        </div>
        <div style={{ display: 'flex', gap: '16px', color: '#a1a1aa', fontSize: '11px', fontFamily: 'monospace' }}>
          <span>LATENCY: &lt;12ms</span>
          <span>•</span>
          <span>GRID 24x24</span>
        </div>
      </div>
    </div>
  )
}

/**
 * ESTILO 4: HAZ DE LUZ / RADIAL GLOW (Linear / Apple Spotlight)
 * Resplandor cinemático difuso en el centro que ilumina el cambio de sección.
 */
export function RadialGlowDivider() {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '90px',
      background: '#060a0e',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Spotlight Radial Difuso */}
      <div style={{
        position: 'absolute',
        top: '0',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '100%',
        background: 'radial-gradient(ellipse at top, rgba(255, 75, 11, 0.45) 0%, rgba(255, 75, 11, 0) 70%)',
        pointerEvents: 'none'
      }} />

      {/* Línea central brillante */}
      <div style={{
        position: 'absolute',
        top: '0',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '320px',
        height: '1.5px',
        background: 'linear-gradient(90deg, transparent, #ff4b0b, transparent)',
        boxShadow: '0 0 15px #ff4b0b'
      }} />

      <span style={{
        position: 'relative',
        zIndex: 2,
        background: 'rgba(10, 14, 18, 0.9)',
        border: '1px solid rgba(255, 75, 11, 0.3)',
        color: '#ffffff',
        fontSize: '11px',
        fontWeight: '700',
        padding: '5px 14px',
        borderRadius: '999px',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        boxShadow: '0 4px 14px rgba(0,0,0,0.5)'
      }}>
        ESTILO 4 · Haz de Luz / Radial Glow
      </span>
    </div>
  )
}

/**
 * ESTILO 5: LÍNEA DE PRECISIÓN NEÓN (1px Gradient Line)
 * Línea ultrafina y minimalista de transparente a naranja de marca.
 */
export function PrecisionLineDivider() {
  return (
    <div style={{ position: 'relative', width: '100%', padding: '24px 0', background: '#0a1017' }}>
      <div style={{
        width: '100%',
        height: '1px',
        background: 'linear-gradient(90deg, transparent 5%, #ff4b0b 50%, transparent 95%)'
      }} />
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '-12px' }}>
        <span style={{
          background: '#0a1017',
          border: '1px solid #ff4b0b',
          color: '#ff4b0b',
          fontSize: '10.5px',
          fontWeight: '700',
          padding: '2px 12px',
          borderRadius: '999px',
          textTransform: 'uppercase',
          letterSpacing: '0.08em'
        }}>
          ESTILO 5 · Línea de Precisión Neón (1px)
        </span>
      </div>
    </div>
  )
}

/**
 * ESTILO 6: CORTE DIAGONAL ANGULADO (Slanted Angle)
 * Bisel geométrico de 2.5° con acento naranja y dinamismo visual.
 */
export function SlantedAngleDivider() {
  return (
    <div style={{ position: 'relative', width: '100%', background: '#060a0e', overflow: 'hidden' }}>
      <div style={{
        height: '40px',
        background: '#ff4b0b',
        clipPath: 'polygon(0 0, 100% 100%, 100% 0)',
        opacity: 0.85
      }} />
      <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
        <span style={{
          background: '#ffffff',
          color: '#111111',
          fontSize: '11px',
          fontWeight: '800',
          padding: '4px 14px',
          borderRadius: '4px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          ESTILO 6 · Corte Diagonal Angulado (2.5°)
        </span>
      </div>
    </div>
  )
}
