/**
 * TablaPorConectar.tsx (Gestor de Proyectos)
 * ==========================================
 * Aviso visual reusable para tablas `gp_*` que YA EXISTEN en Supabase pero
 * todavía NO tienen consumidor en la UI.
 *
 * Propósito: no inventar datos ni formularios incompletos, pero dejar marcado en
 * la pantalla exactamente DÓNDE se insertará la tabla cuando el flujo la
 * requiera. Se retira en el mismo momento en que se conecta el selector real.
 *
 * Uso: `<TablaPorConectar campo="Tipo de avance" tabla="gp_tipos_avance_c" />`
 */

interface Props {
  /** Nombre del campo que consumirá el catálogo. */
  campo: string;
  /** Tabla física del catálogo (ej. `gp_tipos_avance_c`). */
  tabla: string;
  /** Contexto breve: cuántos valores tiene el catálogo, qué falta, etc. */
  nota?: string;
}

export default function TablaPorConectar({ campo, tabla, nota }: Props) {
  return (
    <div
      title={`Tabla ${tabla} creada en Supabase; conexión de UI pendiente`}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '7px',
        padding: '7px 10px',
        background: '#f8fafc',
        border: '1px dashed #cbd5e1',
        borderRadius: '6px',
        fontSize: '11px',
        lineHeight: 1.45,
        color: '#475569',
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: '#f59e0b',
          flexShrink: 0,
          marginTop: '4px',
        }}
      />
      <span>
        <b style={{ color: '#334155' }}>{campo}: por conectar</b> · {tabla}
        {nota ? ` — ${nota}` : null}
      </span>
    </div>
  );
}
