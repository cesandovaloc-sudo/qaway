import{a as e,r as t}from"./rolldown-runtime-B0Z9INg1.js";import{t as n}from"./react-CUdNIagt.js";import{t as r}from"./jsx-runtime-B74pBk57.js";import{t as i}from"./check-D5w2BmbN.js";import{t as a}from"./chevron-down-DmkwGBf4.js";import{t as o}from"./chevron-up-CqQcLXmc.js";import{t as s}from"./crown-0w21G4dG.js";import{t as c}from"./info-wkYd9f6r.js";import{t as l}from"./sparkles-D9D61tzG.js";import{t as u}from"./x-CRl2huwV.js";var d=t({FEATURE_ROWS:()=>h,PLAN_CONFIGS:()=>m,default:()=>g}),f=e(n(),1),p=r(),m=[{id:`basico`,name:`Básico`,subtitle:`Inventario y Catálogo`,targetAudience:`Para pequeños comercios y negocios en inicio`,priceMonthly:30,priceRegular:60,tag:`Esencial`},{id:`intermedio`,name:`Intermedio`,subtitle:`Ventas Online`,targetAudience:`Para negocios con pedidos frecuentes y catálogo web`,priceMonthly:50,priceRegular:100,tag:`Más popular`,recommended:!0},{id:`premium`,name:`Premium`,subtitle:`Operación Comercial`,targetAudience:`Para marcas en expansión y operación multisede`,priceMonthly:70,priceRegular:140,tag:`Avanzado`}],h=[{name:`Límite de productos`,info:`Cantidad máxima de artículos registrados en tu catálogo activo.`,basico:`Hasta 100`,intermedio:`Hasta 500`,premium:`Ilimitados`,visibleInitially:!0},{name:`Usuarios del equipo`,info:`Accesos simultáneos con cuentas individuales para tu personal.`,basico:`1 usuario`,intermedio:`Hasta 5 usuarios`,premium:`Ilimitados`,visibleInitially:!0},{name:`Sedes y almacenes`,info:`Locales físicos, sucursales o almacenes independientes de inventario.`,basico:`1 sede / almacén`,intermedio:`Hasta 3 sedes`,premium:`Múltiples sedes`,visibleInitially:!0},{name:`Catálogo Web Público estándar`,info:`🎁 3 Meses 100% gratis incluidos de catálogo web con tu marca.`,basico:`3 Meses gratis`,intermedio:`3 Meses gratis`,premium:`3 Meses gratis`,highlightBadge:!0,visibleInitially:!0},{name:`Pedidos directos a WhatsApp`,info:`Tus clientes envían su pedido prellenado directamente a tu WhatsApp comercial.`,basico:!0,intermedio:!0,premium:!0,visibleInitially:!0},{name:`Carrito de compras web`,info:`Permite al cliente acumular varios productos antes de solicitar el pedido.`,basico:!1,intermedio:!0,premium:!0,visibleInitially:!0},{name:`Control de stock y existencias`,info:`Control de inventario en tiempo real con alertas de reposición.`,basico:`Stock básico`,intermedio:`Preciso + alertas`,premium:`Multialmacén en vivo`,visibleInitially:!0},{name:`Soporte técnico y asesoría`,info:`Canales de soporte para puesta en marcha y dudas operativas.`,basico:`Estándar WhatsApp`,intermedio:`Asistido prioritario`,premium:`Asesor 24/7`,visibleInitially:!0},{name:`Fotos por producto`,info:`Cantidad de fotografías y vistas en la galería de cada ficha.`,basico:`1 principal`,intermedio:`Hasta 5 fotos`,premium:`Múltiples por variante`,visibleInitially:!1},{name:`Variantes (talla, color, modelo)`,info:`Atributos dinámicos por producto con SKU y stock individual.`,basico:!1,intermedio:`Variantes estándar`,premium:`Avanzadas y atributos`,visibleInitially:!1},{name:`Movimientos de Kardex (entradas/salidas)`,info:`Auditoría de quién modificó stock, transferencias y mermas.`,basico:!1,intermedio:!0,premium:`Historial completo`,visibleInitially:!1},{name:`Transferencias entre sedes y almacenes`,info:`Envío y recepción de mercadería entre sucursales con confirmación.`,basico:!1,intermedio:!1,premium:!0,visibleInitially:!1},{name:`Gestión de pedidos web y estados`,info:`Panel de control para despachos: Pendiente, En preparación, Entregado.`,basico:!1,intermedio:!0,premium:`Flujo operativo completo`,visibleInitially:!1},{name:`Directorio de clientes y ventas`,info:`Registro de clientes frecuentes y vinculación a sus pedidos.`,basico:!1,intermedio:!0,premium:`Historial 360°`,visibleInitially:!1},{name:`Listas de precios`,info:`Precios diferenciados por mostrador, mayorista o distribuidor.`,basico:`1 lista estándar`,intermedio:`Múltiples listas`,premium:`Reglas por volumen`,visibleInitially:!1},{name:`Cotizaciones formales en PDF`,info:`Emisión de proformas comerciales para clientes con un clic.`,basico:!1,intermedio:`Básicas`,premium:`Avanzadas personalizadas`,visibleInitially:!1},{name:`Paquetes, combos y kits (Bundles)`,info:`Agrupa productos en combos descontando stock de cada componente.`,basico:!1,intermedio:!1,premium:!0,visibleInitially:!1},{name:`Promociones y liquidaciones`,info:`Campañas automáticas de descuento por fecha o liquidación de lotes.`,basico:!1,intermedio:`Descuentos simples`,premium:`Campañas avanzadas`,visibleInitially:!1},{name:`Módulo de compras y proveedores`,info:`Registro de costos de adquisición y órdenes de compra oficiales.`,basico:!1,intermedio:`Registro de compras`,premium:`Órdenes y proveedores`,visibleInitially:!1},{name:`Punto de Venta (POS) y Caja Chica`,info:`Interfaz rápida para mostrador físico y arqueo de caja diario.`,basico:!1,intermedio:`Registro de ventas`,premium:`POS + Caja Chica`,visibleInitially:!1},{name:`Captura Asistida con IA Qaway`,info:`Sugerencias inteligentes de categorías, descripciones y precios con IA.`,basico:!1,intermedio:!1,premium:!0,visibleInitially:!1},{name:`Importación masiva (Excel / CSV)`,info:`Sube miles de productos o listas de inventario en segundos.`,basico:!1,intermedio:!0,premium:`Avanzado con mapeo`,visibleInitially:!1},{name:`Reportes analíticos y exportación`,info:`Métricas de rentabilidad, productos más vendidos y finanzas.`,basico:`Básicos`,intermedio:`Operativos y ventas`,premium:`Analítica avanzada`,visibleInitially:!1}];function g({selectedPlan:e=`intermedio`,onSelectPlan:t,onContinue:n,loading:r=!1,isModal:i=!1,onClose:d}){let[g,v]=(0,f.useState)(e),[y,b]=(0,f.useState)(!1);function x(e){v(e),t&&t(e)}let S=m.find(e=>e.id===g)||m[1],C=(0,p.jsxs)(`div`,{className:`canva-plan-container`,children:[(0,p.jsxs)(`div`,{className:`canva-left-panel`,children:[(0,p.jsxs)(`div`,{className:`canva-badge-top`,children:[(0,p.jsx)(l,{size:14,className:`text-purple-600`}),(0,p.jsx)(`span`,{children:`Prueba gratuita de 30 días`})]}),(0,p.jsxs)(`h2`,{className:`canva-title`,children:[`Prueba `,(0,p.jsx)(`span`,{className:`canva-brand-accent`,children:`Qaway Hub`}),` gratis`]}),(0,p.jsx)(`p`,{className:`canva-subtitle`,children:`Elige tu plan. Disfruta 30 días de acceso total sin costo. Puedes cancelar tu suscripción cuando quieras.`}),(0,p.jsx)(`div`,{className:`canva-plans-list`,role:`radiogroup`,"aria-label":`Planes de suscripción`,children:m.map(e=>{let t=g===e.id;return(0,p.jsxs)(`div`,{role:`radio`,"aria-checked":t,tabIndex:0,onClick:()=>x(e.id),onKeyDown:t=>{(t.key===`Enter`||t.key===` `)&&(t.preventDefault(),x(e.id))},className:`canva-plan-card ${t?`selected`:``}`,children:[(0,p.jsx)(`div`,{className:`canva-radio-indicator`,children:(0,p.jsx)(`div`,{className:`canva-radio-circle ${t?`active`:``}`,children:t&&(0,p.jsx)(`div`,{className:`canva-radio-dot`})})}),(0,p.jsxs)(`div`,{className:`canva-plan-info`,children:[(0,p.jsxs)(`div`,{className:`canva-plan-header`,children:[(0,p.jsx)(`span`,{className:`canva-plan-name`,children:e.name}),e.recommended&&(0,p.jsx)(`span`,{className:`canva-badge-rec`,children:`Recomendado`}),(0,p.jsxs)(`div`,{className:`canva-plan-pricing`,children:[(0,p.jsxs)(`span`,{className:`canva-price`,children:[`S/`,e.priceMonthly]}),(0,p.jsx)(`span`,{className:`canva-period`,children:`/mes`}),(0,p.jsxs)(`span`,{className:`canva-reg-price`,children:[`S/`,e.priceRegular]})]})]}),(0,p.jsxs)(`p`,{className:`canva-plan-desc`,children:[e.subtitle,` · `,e.targetAudience]})]})]},e.id)})}),(0,p.jsxs)(`div`,{className:`canva-cta-block`,children:[(0,p.jsxs)(`button`,{type:`button`,className:`canva-cta-btn`,disabled:r,onClick:()=>n&&n(S),children:[(0,p.jsx)(s,{size:18}),(0,p.jsx)(`span`,{children:r?`Preparando tu prueba…`:`Probarlo gratis 30 días`})]}),(0,p.jsxs)(`p`,{className:`canva-cta-footnote`,children:[(0,p.jsx)(`strong`,{children:`S/ 0 cobrados hoy.`}),` Te enviaremos un recordatorio antes de que termine tu periodo de prueba. Puedes cancelar tu suscripción en cualquier momento con un clic.`]}),(0,p.jsxs)(`div`,{className:`canva-promo-pill`,children:[(0,p.jsx)(`span`,{className:`canva-gift-emoji`,children:`🎁`}),(0,p.jsxs)(`span`,{children:[(0,p.jsx)(`strong`,{children:`Incluye 3 Meses Gratis`}),` de Catálogo Web Público`]})]})]})]}),(0,p.jsxs)(`div`,{className:`canva-right-panel`,children:[(0,p.jsxs)(`div`,{className:`canva-table-wrapper`,children:[(0,p.jsxs)(`table`,{className:`canva-table`,children:[(0,p.jsx)(`thead`,{children:(0,p.jsxs)(`tr`,{children:[(0,p.jsx)(`th`,{className:`th-feature`,children:`Beneficios prémium`}),m.map(e=>{let t=g===e.id;return(0,p.jsxs)(`th`,{onClick:()=>x(e.id),className:`th-plan ${t?`col-highlight`:``}`,children:[(0,p.jsx)(`div`,{className:`th-plan-badge`,children:e.name}),(0,p.jsxs)(`div`,{className:`th-plan-sub`,children:[`S/`,e.priceMonthly,`/m`]})]},e.id)})]})}),(0,p.jsx)(`tbody`,{children:h.map((e,t)=>!y&&!e.visibleInitially?null:(0,p.jsxs)(`tr`,{className:`tr-row ${e.highlightBadge?`row-highlight`:``}`,children:[(0,p.jsx)(`td`,{className:`td-feature`,children:(0,p.jsxs)(`div`,{className:`td-feature-content`,children:[(0,p.jsx)(`span`,{children:e.name}),e.info&&(0,p.jsx)(`span`,{className:`td-info-tooltip`,title:e.info,children:(0,p.jsx)(c,{size:13,className:`text-slate-400 hover:text-slate-600 inline ml-1`})})]})}),(0,p.jsx)(`td`,{className:`td-value ${g===`basico`?`col-highlight`:``}`,children:(0,p.jsx)(_,{val:e.basico})}),(0,p.jsx)(`td`,{className:`td-value ${g===`intermedio`?`col-highlight`:``}`,children:(0,p.jsx)(_,{val:e.intermedio})}),(0,p.jsx)(`td`,{className:`td-value ${g===`premium`?`col-highlight`:``}`,children:(0,p.jsx)(_,{val:e.premium})})]},t))})]}),!y&&(0,p.jsx)(`div`,{className:`canva-fade-overlay`,"aria-hidden":`true`})]}),(0,p.jsx)(`div`,{className:`canva-expand-bar`,children:(0,p.jsx)(`button`,{type:`button`,className:`canva-expand-btn`,onClick:()=>b(e=>!e),"aria-expanded":y,children:y?(0,p.jsxs)(p.Fragment,{children:[(0,p.jsx)(`span`,{children:`Ver menos beneficios`}),(0,p.jsx)(o,{size:16})]}):(0,p.jsxs)(p.Fragment,{children:[(0,p.jsxs)(`span`,{children:[`Ver todos los beneficios (`,h.length,`)`]}),(0,p.jsx)(a,{size:16})]})})})]}),(0,p.jsx)(`style`,{children:`
        .canva-plan-container {
          display: grid;
          grid-template-columns: 380px 1fr;
          gap: 28px;
          background: #ffffff;
          border-radius: 20px;
          overflow: hidden;
          width: 100%;
          text-align: left;
        }

        /* Columna Izquierda */
        .canva-left-panel {
          padding: 24px 20px 24px 0;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .canva-badge-top {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #f3e8ff;
          color: #7e22ce;
          font-size: 12px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 999px;
          width: fit-content;
        }

        .canva-title {
          font-size: 26px;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.5px;
          color: #0f172a;
          margin: 0;
        }

        .canva-brand-accent {
          background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .canva-subtitle {
          font-size: 14.5px;
          line-height: 1.5;
          color: #475569;
          margin: 0;
        }

        .canva-plans-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 4px;
        }

        .canva-plan-card {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 16px;
          border: 1.5px solid #e2e8f0;
          border-radius: 14px;
          cursor: pointer;
          background: #ffffff;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .canva-plan-card:hover {
          border-color: #c084fc;
          background: #faf5ff;
          transform: translateY(-1px);
        }

        .canva-plan-card.selected {
          border-color: #8b5cf6;
          background: #fbf8ff;
          box-shadow: 0 0 0 1px #8b5cf6, 0 4px 14px rgba(139, 92, 246, 0.12);
        }

        .canva-radio-indicator {
          padding-top: 2px;
        }

        .canva-radio-circle {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid #cbd5e1;
          display: grid;
          place-items: center;
          transition: all 0.2s ease;
        }

        .canva-radio-circle.active {
          border-color: #8b5cf6;
        }

        .canva-radio-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #8b5cf6;
        }

        .canva-plan-info {
          flex: 1;
          min-width: 0;
        }

        .canva-plan-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 6px;
        }

        .canva-plan-name {
          font-size: 16px;
          font-weight: 800;
          color: #0f172a;
        }

        .canva-badge-rec {
          background: #e0e7ff;
          color: #4338ca;
          font-size: 11px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 6px;
        }

        .canva-plan-pricing {
          margin-left: auto;
          display: flex;
          align-items: baseline;
          gap: 3px;
        }

        .canva-price {
          font-size: 17px;
          font-weight: 800;
          color: #0f172a;
        }

        .canva-period {
          font-size: 12px;
          color: #64748b;
          font-weight: 600;
        }

        .canva-reg-price {
          font-size: 12px;
          color: #94a3b8;
          text-decoration: line-through;
          margin-left: 4px;
        }

        .canva-plan-desc {
          font-size: 13px;
          color: #64748b;
          margin: 4px 0 0;
          line-height: 1.4;
        }

        .canva-cta-block {
          margin-top: 8px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .canva-cta-btn {
          width: 100%;
          height: 48px;
          background: linear-gradient(135deg, #7c3aed 0%, #9333ea 100%);
          color: #ffffff;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 14px rgba(124, 58, 237, 0.3);
        }

        .canva-cta-btn:hover:not(:disabled) {
          transform: translateY(-1.5px);
          box-shadow: 0 6px 20px rgba(124, 58, 237, 0.45);
          filter: brightness(1.05);
        }

        .canva-cta-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .canva-cta-footnote {
          font-size: 12.5px;
          line-height: 1.5;
          color: #64748b;
          margin: 0;
          text-align: center;
        }

        .canva-promo-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #f8fafc;
          border: 1px dashed #cbd5e1;
          border-radius: 10px;
          padding: 8px 12px;
          font-size: 12.5px;
          color: #334155;
        }

        /* Columna Derecha: Tabla Comparativa */
        .canva-right-panel {
          position: relative;
          display: flex;
          flex-direction: column;
          border-left: 1px solid #f1f5f9;
          padding-left: 24px;
        }

        .canva-table-wrapper {
          position: relative;
          width: 100%;
          overflow: hidden;
        }

        .canva-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          font-size: 14.5px;
        }

        .canva-table thead tr th {
          padding: 12px 10px;
          font-size: 13px;
          font-weight: 700;
          color: #475569;
          border-bottom: 2px solid #f1f5f9;
          background: #ffffff;
        }

        .th-feature {
          text-align: left;
          width: 44%;
        }

        .th-plan {
          text-align: center;
          width: 18.6%;
          cursor: pointer;
          border-radius: 10px 10px 0 0;
          transition: background 0.2s ease;
        }

        .th-plan:hover {
          background: #faf5ff;
        }

        .th-plan-badge {
          font-size: 13.5px;
          font-weight: 800;
          color: #0f172a;
        }

        .th-plan-sub {
          font-size: 11px;
          color: #64748b;
          font-weight: 600;
          margin-top: 1px;
        }

        .col-highlight {
          background: #faf5ff !important;
          color: #7c3aed !important;
        }

        .tr-row {
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.15s ease;
        }

        .tr-row:hover {
          background: #f8fafc;
        }

        .row-highlight {
          background: #fffdf5;
        }

        .td-feature {
          padding: 11px 10px;
          font-size: 14px;
          font-weight: 500;
          color: #334155;
          border-bottom: 1px solid #f1f5f9;
        }

        .td-feature-content {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .td-info-tooltip {
          cursor: help;
          display: inline-flex;
          align-items: center;
        }

        .td-value {
          padding: 11px 8px;
          text-align: center;
          font-size: 13.5px;
          color: #1e293b;
          border-bottom: 1px solid #f1f5f9;
        }

        /* Capa Difuminado Blanco al pie de la tabla */
        .canva-fade-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 100px;
          background: linear-gradient(to top, #ffffff 15%, rgba(255, 255, 255, 0.9) 60%, rgba(255, 255, 255, 0) 100%);
          pointer-events: none;
        }

        /* Barra de Despliegue */
        .canva-expand-bar {
          padding: 12px 0 0;
          display: flex;
          justify-content: center;
          position: relative;
          z-index: 2;
        }

        .canva-expand-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 8px 18px;
          border-radius: 999px;
          font-size: 13.5px;
          font-weight: 700;
          color: #6366f1;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .canva-expand-btn:hover {
          background: #ede9fe;
          color: #5b21b6;
          border-color: #c4b5fd;
          transform: translateY(-1px);
        }

        /* Modal wrapper if requested */
        .canva-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(4px);
          display: grid;
          place-items: center;
          z-index: 9999;
          padding: 16px;
        }

        .canva-modal-card {
          background: #ffffff;
          border-radius: 24px;
          max-width: 1080px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          position: relative;
          padding: 32px;
        }

        .canva-modal-close {
          position: absolute;
          top: 20px;
          right: 20px;
          background: #f1f5f9;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          cursor: pointer;
          color: #475569;
          transition: all 0.2s ease;
        }

        .canva-modal-close:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        /* Responsive Mobile-First */
        @media (max-width: 900px) {
          .canva-plan-container {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .canva-left-panel {
            padding: 0;
          }

          .canva-right-panel {
            border-left: none;
            border-top: 1px solid #f1f5f9;
            padding-left: 0;
            padding-top: 20px;
          }

          .canva-table-wrapper {
            overflow-x: auto;
          }

          .canva-table {
            min-width: 520px;
          }
        }
      `})]});return i?(0,p.jsx)(`div`,{className:`canva-modal-backdrop`,role:`dialog`,"aria-modal":`true`,children:(0,p.jsxs)(`div`,{className:`canva-modal-card`,children:[d&&(0,p.jsx)(`button`,{type:`button`,className:`canva-modal-close`,onClick:d,"aria-label":`Cerrar`,children:(0,p.jsx)(u,{size:20})}),C]})}):C}function _({val:e}){return e===!0?(0,p.jsx)(`div`,{className:`inline-flex items-center justify-center w-5 h-5 rounded-full bg-purple-100 text-purple-700 mx-auto`,children:(0,p.jsx)(i,{size:13,strokeWidth:2.8})}):e===!1?(0,p.jsx)(`span`,{className:`text-slate-300 font-bold`,children:`—`}):(0,p.jsx)(`span`,{className:`font-semibold text-[13px]`,children:e})}export{d as n,g as t};