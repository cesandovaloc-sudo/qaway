import { Printer, Download, ShieldCheck, CheckCircle2, FileText, Lock } from "lucide-react";

export function ContractDownloadView({ project }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="qw-plane-contract-wrapper">
      
      {/* Barra de Acciones del Contrato */}
      <div className="qw-plane-contract-actions-bar">
        <div>
          <span className="qw-plane-contract-badge">
            <Lock size={13} /> Documento Oficial de Ingeniería & SOW
          </span>
          <h3 style={{ fontSize: "18px", fontWeight: "700", margin: "4px 0 0", color: "#111111" }}>
            Acuerdo de Servicio & Declaración de Trabajo (SOW)
          </h3>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="qw-plane-btn-print"
        >
          <Printer size={15} />
          <span>Imprimir / Descargar en PDF</span>
        </button>
      </div>

      {/* DOCUMENTO MEMBRETADO IMPRIMIBLE */}
      <div className="qw-plane-contract-sheet printable-contract">
        
        {/* Membrete Qaway Lab */}
        <div className="qw-plane-contract-header">
          <div>
            <span className="qw-plane-contract-logo">QAWAY LAB</span>
            <p className="qw-plane-contract-sub">Ingeniería & Soluciones Digitales de Alta Conversión</p>
          </div>
          <div className="qw-plane-contract-code-box">
            <span>CÓDIGO SOW:</span>
            <strong>SOW-{project.key}-2026</strong>
            <small>Fecha: {project.startDate || "26 Ago 2026"}</small>
          </div>
        </div>

        <div className="qw-plane-contract-line" />

        {/* Datos de las Partes */}
        <div className="qw-plane-contract-parties">
          <div className="qw-plane-party-box">
            <span className="qw-plane-party-role">PROVEEDOR:</span>
            <strong>Qaway Lab (División de Ingeniería Web)</strong>
            <span>Servicios de Desarrollo Frontend, UI/UX & Sistemas Digitales</span>
          </div>

          <div className="qw-plane-party-box">
            <span className="qw-plane-party-role">CLIENTE CONTRATANTE:</span>
            <strong>{project.name}</strong>
            <span>Representante: {project.client || "Dirección Comercial"}</span>
            <span>Dominio Oficial: {project.domain}</span>
          </div>
        </div>

        {/* Cláusulas Formales del Acuerdo */}
        <div className="qw-plane-clauses-body">
          
          <div className="qw-plane-clause-item">
            <h4>CLÁUSULA 1: OBJETO DEL SERVICIO & ALCANCE</h4>
            <p>
              El Proveedor se compromete a diseñar, programar y desplegar la solución digital correspondiente a la modalidad <strong>"{project.plan}"</strong>, asegurando una arquitectura responsive en React/Vite, animaciones aceleradas por GPU a 60 FPS y conexión con canales de conversión (WhatsApp y formularios).
            </p>
          </div>

          <div className="qw-plane-clause-item">
            <h4>CLÁUSULA 2: CONDICIONES COMERCIALES & HITOS DE PAGO</h4>
            <p>
              El presupuesto total acordado es de <strong>{project.budget}</strong>, estructurado bajo el modelo ágil 50/50:
            </p>
            <ul>
              <li><strong>Anticipo (50%):</strong> {project.paidAmount || "50% al inicio"} para dar apertura al Sprint 1 de Discovery y Prototipado.</li>
              <li><strong>Liquidación Final (50%):</strong> Contra entrega final, pase a producción y auditoría de Google Lighthouse aprobada.</li>
            </ul>
          </div>

          <div className="qw-plane-clause-item">
            <h4>CLÁUSULA 3: POLÍTICA DE REVISIONES & SIGN-OFF ÁGIL</h4>
            <p>
              El proyecto incluye <strong>2 rondas formales de revisiones</strong> sobre el prototipo visual presentado en el Hito 03. Una vez otorgado el <em>Sign-Off de Diseño</em>, se procede al desarrollo frontend. Cualquier cambio estructural posterior se evaluará como requerimiento adicional.
            </p>
          </div>

          <div className="qw-plane-clause-item">
            <h4>CLÁUSULA 4: PROPIEDAD INTELECTUAL & ENTREGABLES</h4>
            <p>
              Tras la cancelación del saldo final, el 100% de los derechos de explotación comercial, código fuente y activos gráficos pasan a ser propiedad exclusiva del Cliente.
            </p>
          </div>

          <div className="qw-plane-clause-item">
            <h4>CLÁUSULA 5: GARANTÍA TÉCNICA & AUDITORÍA DE RENDIMIENTO</h4>
            <p>
              Qaway Lab certifica que el producto final cumplirá con los estándares de <strong>Google Lighthouse (&gt; 90/100)</strong> y Core Web Vitals (LCP &lt; 1.2s), entregando el reporte técnico oficial al momento del lanzamiento.
            </p>
          </div>

        </div>

        {/* Firmas Digitales */}
        <div className="qw-plane-signatures-grid">
          <div className="qw-plane-signature-box">
            <div className="qw-plane-sig-line">
              <span className="qw-plane-sig-badge">✓ Firma Autorizada</span>
            </div>
            <strong>QAWAY LAB</strong>
            <small>Dirección de Producto & Ingeniería</small>
          </div>

          <div className="qw-plane-signature-box">
            <div className="qw-plane-sig-line">
              <span className="qw-plane-sig-badge">✓ Aceptación Digital</span>
            </div>
            <strong>{project.name}</strong>
            <small>Representante Legal / Cliente</small>
          </div>
        </div>

      </div>

    </div>
  );
}
