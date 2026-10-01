import React, { useState } from 'react';
import { 
  ArrowRight, 
  Check, 
  ChevronDown, 
  ChevronRight, 
  Menu, 
  X, 
  ShieldCheck, 
  Sparkles, 
  Bot, 
  Layers, 
  BarChart3, 
  Users, 
  Lock, 
  Clock, 
  Workflow, 
  ExternalLink, 
  Play, 
  Briefcase, 
  Megaphone, 
  Headphones, 
  Code2, 
  Camera, 
  Building2, 
  Receipt, 
  Tags, 
  QrCode, 
  ShoppingCart 
} from 'lucide-react';

/**
 * Qaway Inventario - Landing Page
 * Basada en el modelo visual de alta conversión de monday.com
 * Recreada fielmente con la skill taste-skill y copy optimizado para venta de software de inventario.
 *
 * Dials de diseño:
 * - DESIGN_VARIANCE: 7
 * - MOTION_INTENSITY: 6
 * - VISUAL_DENSITY: 4
 */

export default function MondayInventarioLandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('almacen');
  const [activeAccordion, setActiveAccordion] = useState(0);

  // Módulos especializados para "Un sistema adaptado a cada área de tu empresa"
  const useCaseTabs = [
    {
      id: 'almacen',
      label: 'Almacén & Logística',
      subtitle: 'Entradas, salidas y transferencias',
      icon: Layers,
      color: '#6161ff',
      agentName: 'Control de Stock Multisede',
      agentRole: 'Sincronización en tiempo real entre sucursales, pasillos y estantes',
      promptExample: 'Verifica las diferencias de stock entre Almacén Central Lima y Sede Arequipa para el cierre semanal.',
      responseSummary: 'Analizados 1,420 productos en 4 almacenes. 2 transferencias automáticas sugeridas para evitar quiebre de stock en tienda física.',
      stats: [
        { label: 'Exactitud de inventario', value: '99.8%' },
        { label: 'Tiempo en conteos', value: '-65%' },
        { label: 'Transferencias guiadas', value: '100%' }
      ]
    },
    {
      id: 'ia',
      label: 'Captura con IA',
      subtitle: 'Digitalización fotográfica instantánea',
      icon: Camera,
      color: '#00d2d2',
      agentName: 'Asistente de Fichas Técnicas IA',
      agentRole: 'Extracción visual de modelo, medidas, categoría y precio sugerido',
      promptExample: 'Toma la foto del lote de herramientas recién descargado y genera los borradores para el catálogo.',
      responseSummary: '18 productos nuevos identificados por imagen en 4 segundos. Descripciones comerciales generadas y atributos cargados al inventario.',
      stats: [
        { label: 'Segundos por producto', value: '3 seg' },
        { label: 'Digitación manual', value: '0 hrs' },
        { label: 'Fichas SEO listas', value: '100%' }
      ]
    },
    {
      id: 'ventas',
      label: 'Ventas & Cotizaciones',
      subtitle: 'Cotizaciones y pedidos rápidos',
      icon: BarChart3,
      color: '#00c875',
      agentName: 'Generador de Cotizaciones Pro',
      agentRole: 'Cálculo de márgenes, listas mayoristas y exportación formal en PDF',
      promptExample: 'Prepara una cotización con 15% de descuento para Distribuidora Los Andes con vigencia de 7 días.',
      responseSummary: 'Cotización #COT-2026-88 generada con cálculo automático de IGV y PDF con código QR listo para enviar por WhatsApp.',
      stats: [
        { label: 'Velocidad de cotización', value: '4x' },
        { label: 'Tasa de cierre', value: '+31%' },
        { label: 'Margen protegido', value: '100%' }
      ]
    },
    {
      id: 'liquidacion',
      label: 'Liquidación & Tienda',
      subtitle: 'Campañas de remate y carrito web',
      icon: ShoppingCart,
      color: '#ff9900',
      agentName: 'Motor de Liquidación & E-commerce',
      agentRole: 'Rotación acelerada de inventario estancado y tienda online directa',
      promptExample: 'Activa la campaña de remate para mercadería con más de 90 días en almacén con descuento escalonado.',
      responseSummary: 'Campaña "Liquidación Especial Q4" publicada en la tienda web con 54 artículos seleccionados y enlace público para clientes.',
      stats: [
        { label: 'Recuperación de capital', value: '+45%' },
        { label: 'Rotación de stock', value: '2.8x' },
        { label: 'Canal WhatsApp', value: 'Activo' }
      ]
    },
    {
      id: 'sunat',
      label: 'Facturación SUNAT',
      subtitle: 'Comprobantes electrónicos directos',
      icon: Receipt,
      color: '#fa4270',
      agentName: 'Módulo Fiscal & Facturación',
      agentRole: 'Emisión de Facturas, Boletas y Guías de Remisión sin doble trabajo',
      promptExample: 'Emite la factura electrónica de la orden despachada hoy con detracción y envía el XML a SUNAT.',
      responseSummary: 'Factura F001-000429 emitida con CDR de aceptación SUNAT exitoso. Guía de Remisión generada con datos del transportista.',
      stats: [
        { label: 'Validación SUNAT', value: '100%' },
        { label: 'Errores contables', value: '0%' },
        { label: 'Emisión inmediata', value: '< 2 seg' }
      ]
    },
    {
      id: 'finanzas',
      label: 'Finanzas & Rentabilidad',
      subtitle: 'Kárdex valorado y márgenes reales',
      icon: Briefcase,
      color: '#a25ddc',
      agentName: 'Analista de Rentabilidad & Costos',
      agentRole: 'Control de costo promedio ponderado y valor comercial de existencias',
      promptExample: 'Genera el reporte de margen bruto por línea de producto comparando el costo de compra actual vs precio de venta.',
      responseSummary: 'Kárdex valorado actualizado al último cierre. Margen bruto promedio consolidado en 38.4% con alerta de 2 productos con margen bajo.',
      stats: [
        { label: 'Margen promedio', value: '38.4%' },
        { label: 'Control de costo', value: 'Exacto' },
        { label: 'Kárdex al día', value: '100%' }
      ]
    }
  ];

  // Acordeón de Gobernanza y Control Empresarial
  const governanceItems = [
    {
      title: '28 Permisos Granulares por Rol y Usuario',
      description: 'Define con precisión matemática qué puede ver y modificar cada miembro de tu equipo. Configura permisos independientes para cajeros de sucursal, jefes de almacén, vendedores de campo y directores generales.'
    },
    {
      title: 'Kárdex Valorado e Historial Inmutable',
      description: 'Lleva la trazabilidad total de cada movimiento de entrada, salida, ajuste o transferencia con método de costo promedio ponderado. Cada cambio queda registrado con fecha, hora y usuario responsable para auditorías transparentes.'
    },
    {
      title: 'Modo Preventa y Reserva de Stock',
      description: 'Genera cotizaciones y apartados sin alterar el stock disponible para despacho inmediato. Evita vender dos veces el mismo producto y coordina entregas con fechas comprometidas reales.'
    },
    {
      title: 'Trazabilidad por Lotes y Fechas de Vencimiento',
      description: 'Controla medicamentos, insumos, alimentos o repuestos con numeración de lote y caducidad. El sistema prioriza automáticamente la rotación del lote más próximo a vencer para reducir mermas a cero.'
    },
    {
      title: 'Base de Datos Segura con Aislamiento Empresarial',
      description: 'Tus listas de clientes, costos y márgenes de ganancia están estrictamente aislados con tecnología Row Level Security (RLS) en servidores cloud de alta disponibilidad y cifrado bancario de 256 bits.'
    },
    {
      title: 'Exportación y Conexión en Tiempo Real',
      description: 'Descarga reportes ejecutivos en Excel, PDF o CSV en cualquier momento. Conecta tu inventario con tiendas online, sistemas contables o herramientas externas sin bloqueos de información.'
    }
  ];

  // Marcas y sectores comerciales que confían en Qaway
  const clientLogos = [
    { name: 'Distribución Mayorista', icon: '📦 Distribución Mayorista' },
    { name: 'Cadenas de Retail', icon: '🏪 Cadenas de Retail' },
    { name: 'Ferreterías Industriales', icon: '🔧 Ferreterías Industriales' },
    { name: 'Farmacias & Cosmética', icon: '💊 Farmacias & Cosmética' },
    { name: 'Importadoras & Envíos', icon: '🚢 Importadoras & Envíos' },
    { name: 'Tiendas de Moda & Calzado', icon: '👟 Tiendas de Moda' },
    { name: 'Alimentos & Consumo', icon: '🥖 Alimentos & Bebidas' },
    { name: 'Tecnología & Repuestos', icon: '⚡ Tecnología & Equipos' }
  ];

  const currentTab = useCaseTabs.find(t => t.id === activeTab) || useCaseTabs[0];

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-[#6161ff] selection:text-white">
      {/* 1. TOP GLOBAL NAVIGATION */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-100 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center gap-2 group">
              <div className="flex items-center gap-1">
                <span className="w-3.5 h-6 bg-[#ff3d57] rounded-full transform -rotate-12 transition-transform group-hover:scale-110"></span>
                <span className="w-3.5 h-7 bg-[#ffcc00] rounded-full transform -rotate-12 transition-transform group-hover:scale-110"></span>
                <span className="w-3.5 h-8 bg-[#00ca72] rounded-full transform -rotate-12 transition-transform group-hover:scale-110"></span>
                <span className="w-2.5 h-2.5 bg-[#0073ea] rounded-full ml-0.5 self-end mb-1"></span>
              </div>
              <span className="text-2xl font-black tracking-tight text-neutral-900 group-hover:text-[#6161ff] transition-colors">
                qaway<span className="text-[#6161ff]">.inventario</span>
              </span>
            </a>

            {/* Desktop Mega Nav Links */}
            <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-neutral-700">
              <a href="#modulos" className="flex items-center gap-1 hover:text-[#6161ff] cursor-pointer py-2 transition-colors">
                <span>Módulos</span>
                <ChevronDown className="w-4 h-4 text-neutral-400" />
              </a>
              <a href="#multisede" className="flex items-center gap-1 hover:text-[#6161ff] cursor-pointer py-2 transition-colors">
                <span>Multisede</span>
                <ChevronDown className="w-4 h-4 text-neutral-400" />
              </a>
              <a href="#sunat" className="flex items-center gap-1 hover:text-[#6161ff] cursor-pointer py-2 transition-colors">
                <span>Facturación SUNAT</span>
              </a>
              <a href="#precios" className="hover:text-[#6161ff] transition-colors py-2">
                Precios & Planes
              </a>
              <a href="#recursos" className="flex items-center gap-1 hover:text-[#6161ff] cursor-pointer py-2 transition-colors">
                <span>Recursos</span>
                <ChevronDown className="w-4 h-4 text-neutral-400" />
              </a>
            </nav>
          </div>

          {/* Right Header CTAs */}
          <div className="hidden lg:flex items-center gap-4">
            <a 
              href="#contacto" 
              className="text-sm font-medium text-neutral-700 hover:text-neutral-900 px-3 py-2 transition-colors"
            >
              Contactar a ventas
            </a>
            <a 
              href="/login" 
              className="text-sm font-medium text-neutral-700 hover:text-neutral-900 px-3 py-2 transition-colors"
            >
              Iniciar sesión
            </a>
            <a 
              href="#registro" 
              className="group inline-flex items-center gap-2 bg-[#6161ff] hover:bg-[#4b4be8] text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              <span>Prueba gratis</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-neutral-600 hover:text-neutral-900 focus:outline-none cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-neutral-200 px-6 py-6 space-y-4 shadow-xl">
            <div className="space-y-3 text-base font-medium text-neutral-800">
              <a href="#modulos" className="block py-2 border-b border-neutral-100">Módulos</a>
              <a href="#multisede" className="block py-2 border-b border-neutral-100">Multisede & Almacenes</a>
              <a href="#sunat" className="block py-2 border-b border-neutral-100">Facturación SUNAT</a>
              <a href="#precios" className="block py-2 border-b border-neutral-100">Precios & Planes</a>
              <a href="#recursos" className="block py-2 border-b border-neutral-100">Recursos</a>
            </div>
            <div className="pt-4 space-y-3">
              <a href="/login" className="block text-center py-2.5 text-sm font-medium text-neutral-800 border border-neutral-200 rounded-full">
                Iniciar sesión
              </a>
              <a href="#registro" className="block text-center py-2.5 text-sm font-medium text-white bg-[#6161ff] rounded-full shadow-sm">
                Comenzar prueba gratis
              </a>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden bg-gradient-to-b from-white via-neutral-50/50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Animated Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-100 border border-neutral-200/80 mb-8 shadow-xs">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6161ff] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6161ff]"></span>
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-700">
              SISTEMA ERP & INVENTARIO COMERCIAL
            </span>
          </div>

          {/* Main H1 */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-neutral-900 leading-[1.08] max-w-4xl mx-auto mb-6">
            Tu stock bajo control.<br />
            <span className="bg-gradient-to-r from-neutral-900 via-[#6161ff] to-[#a25ddc] bg-clip-text text-transparent">
              Tus ventas en automático.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-neutral-600 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            El sistema integral para gestionar inventarios multisede, digitalizar productos por foto con IA, emitir facturación electrónica SUNAT y liquidar stock en canales digitales.
          </p>

          {/* CTA & Microcopy */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
            <a 
              href="#registro" 
              className="group inline-flex items-center justify-center gap-3 bg-[#6161ff] hover:bg-[#4b4be8] text-white text-base font-semibold px-8 py-4 rounded-full shadow-lg shadow-[#6161ff]/20 hover:shadow-xl hover:shadow-[#6161ff]/30 transition-all transform hover:-translate-y-0.5 active:scale-95"
            >
              <span>Comenzar prueba gratis de 14 días</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a 
              href="#demo" 
              className="inline-flex items-center justify-center gap-2 text-neutral-700 hover:text-neutral-900 text-base font-medium px-6 py-4 rounded-full border border-neutral-200 hover:bg-neutral-50 transition-colors"
            >
              <Play className="w-4 h-4 fill-current text-[#6161ff]" />
              <span>Ver demostración en vivo</span>
            </a>
          </div>

          <p className="text-xs sm:text-sm text-neutral-500 font-medium">
            Sin tarjeta de crédito obligatoria ✦ Puesta en marcha en 5 minutos ✦ Soporte en español
          </p>

          {/* 3D CASCADE BOARDS SHOWCASE */}
          <div className="mt-16 lg:mt-24 relative max-w-6xl mx-auto">
            <div className="absolute -inset-4 bg-gradient-to-r from-[#6161ff]/15 via-[#00d2d2]/15 to-[#ff9900]/15 rounded-3xl blur-2xl opacity-60 -z-10"></div>

            <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl p-4 sm:p-6 lg:p-8 overflow-hidden">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-400"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                  <span className="w-3 h-3 rounded-full bg-green-400"></span>
                  <span className="ml-4 text-xs font-semibold text-neutral-500">
                    Sede Lima Central / Almacén Principal & Despacho
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Sincronizado con SUNAT
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-left">
                {/* Panel 1: Active Agent Hero Card */}
                <div className="md:col-span-4 bg-gradient-to-br from-neutral-900 to-neutral-800 text-white rounded-xl p-5 shadow-inner flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-[#6161ff] flex items-center justify-center font-bold text-white shadow-md">
                          <Bot className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">Alex • Asistente de Almacén</h4>
                          <p className="text-xs text-neutral-400">Inventario & Logística Qaway</p>
                        </div>
                      </div>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        En Línea
                      </span>
                    </div>

                    <div className="bg-white/10 rounded-lg p-3 text-xs text-neutral-200 mb-4 border border-white/5">
                      <p className="font-medium text-white mb-1">Última acción operativa:</p>
                      <p className="text-neutral-300">
                        "Auditadas 420 referencias anoche. 12 productos digitalizados por foto con IA, 3 alertas de stock crítico enviadas a compras y 2 cotizaciones aprobadas."
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <div className="flex justify-between text-xs text-neutral-300">
                      <span>Exactitud del inventario</span>
                      <span className="font-bold text-emerald-400">99.8%</span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#6161ff] h-full w-[98%] rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Panel 2: Table & Board Preview */}
                <div className="md:col-span-8 bg-neutral-50 rounded-xl p-5 border border-neutral-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[#6161ff]" />
                        Panel de Control y Movimientos de Stock
                      </h4>
                      <span className="text-xs text-neutral-500">Filtrado por: Prioridad Operativa</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-neutral-200 shadow-2xs hover:border-[#6161ff]/40 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#00c875]"></span>
                          <span className="font-semibold text-neutral-800">Reposición Insumos Lote #409 (Almacén Central)</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800">
                            Stock Óptimo (1,420 un.)
                          </span>
                          <span className="text-neutral-400 font-mono">13:40</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-neutral-200 shadow-2xs hover:border-[#6161ff]/40 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#00d2d2]"></span>
                          <span className="font-semibold text-neutral-800">Kit Promocional Q4 (Bundle Comercial)</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-sky-100 text-sky-800">
                            S/ 289.00 (Tienda Web Activa)
                          </span>
                          <span className="text-neutral-400 font-mono">13:41</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-neutral-200 shadow-2xs hover:border-[#6161ff]/40 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#fa4270]"></span>
                          <span className="font-semibold text-neutral-800">Lote de Liquidación y Remate por WhatsApp</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-purple-100 text-purple-800">
                            Catálogo PDF & QR Generado
                          </span>
                          <span className="text-neutral-400 font-mono">13:42</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-neutral-200/80 text-[11px] text-neutral-500">
                    <span>Kárdex valorado sincronizado al instante con base de datos</span>
                    <a href="#modulos" className="font-medium text-[#6161ff] hover:underline cursor-pointer">
                      Ver todas las funciones del sistema →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. SECTORES COMERCIALES QUE CONFÍAN EN QAWAY */}
      <section className="py-12 border-y border-neutral-100 bg-neutral-50/50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-8">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-neutral-500">
            Comercios, distribuidores y empresas que optimizan su stock con Qaway
          </p>
        </div>

        <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
          <div className="flex items-center gap-12 sm:gap-16 animate-marquee whitespace-nowrap py-2">
            {[...clientLogos, ...clientLogos].map((logo, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer select-none"
              >
                <span className="text-base sm:text-lg font-bold tracking-tight">{logo.icon}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PILARES OPERATIVOS ("Conoce las herramientas que impulsan tu almacén") */}
      <section id="modulos" className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 tracking-tight mb-4">
              Conoce las herramientas que impulsan tu almacén
            </h2>
            <p className="text-lg text-neutral-600">
              Módulos diseñados para erradicar las pérdidas por descontrol de inventario y acelerar el ciclo de ventas de tu negocio.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200/80 hover:border-[#6161ff]/50 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#6161ff]/10 text-[#6161ff] flex items-center justify-center font-bold mb-5 group-hover:scale-110 transition-transform">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Digitalización con IA por Foto</h3>
              <p className="text-sm text-neutral-600 leading-relaxed mb-4">
                Toma una fotografía con tu teléfono y la IA extrae modelo, categoría, dimensiones y redacta la ficha técnica en 3 segundos sin digitación manual.
              </p>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6161ff]">
                Captura inteligente en segundos <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Card 2 */}
            <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200/80 hover:border-[#00d2d2]/50 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#00d2d2]/10 text-[#00a8a8] flex items-center justify-center font-bold mb-5 group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Control Multisede y Multialmacén</h3>
              <p className="text-sm text-neutral-600 leading-relaxed mb-4">
                Administra múltiples sucursales, almacenes, zonas, pasillos y estantes. Realiza transferencias entre sedes con trazabilidad absoluta.
              </p>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00a8a8]">
                Visión consolidada y por sede <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Card 3 */}
            <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200/80 hover:border-[#ff9900]/50 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#ff9900]/10 text-[#ff9900] flex items-center justify-center font-bold mb-5 group-hover:scale-110 transition-transform">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Facturación Electrónica SUNAT</h3>
              <p className="text-sm text-neutral-600 leading-relaxed mb-4">
                Emite Boletas, Facturas y Guías de Remisión directamente desde la venta o despacho, con validación tributaria en tiempo real y descarga de XML/PDF.
              </p>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#ff9900]">
                Cumplimiento fiscal integrado <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Card 4 */}
            <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200/80 hover:border-[#00c875]/50 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#00c875]/10 text-[#00a85a] flex items-center justify-center font-bold mb-5 group-hover:scale-110 transition-transform">
                <Tags className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Listas de Precios & Bundles</h3>
              <p className="text-sm text-neutral-600 leading-relaxed mb-4">
                Crea listas diferenciadas para clientes mayoristas, público general y ofertas. Agrupa productos en combos promocionales con stock calculado al vuelo.
              </p>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00a85a]">
                Múltiples tarifas dinámicas <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Card 5 */}
            <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200/80 hover:border-[#fa4270]/50 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#fa4270]/10 text-[#fa4270] flex items-center justify-center font-bold mb-5 group-hover:scale-110 transition-transform">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Catálogos PDF & Venta por WhatsApp</h3>
              <p className="text-sm text-neutral-600 leading-relaxed mb-4">
                Genera catálogos profesionales en PDF con código QR y mensajes listos para compartir con tus clientes de WhatsApp para cerrar ventas inmediatas.
              </p>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#fa4270]">
                Cierre comercial ágil <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Card 6 */}
            <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-200/80 hover:border-[#a25ddc]/50 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#a25ddc]/10 text-[#a25ddc] flex items-center justify-center font-bold mb-5 group-hover:scale-110 transition-transform">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Tienda Pública & Pasarela de Pagos</h3>
              <p className="text-sm text-neutral-600 leading-relaxed mb-4">
                Publica tus lotes de liquidación o catálogo comercial con carrito de compras, checkout transparente y cobros en línea con MercadoPago y Taypi.
              </p>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#a25ddc]">
                Canal de venta 24/7 <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TABS INTERACTIVOS POR ÁREA OPERATIVA */}
      <section className="py-20 lg:py-32 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6161ff] bg-[#6161ff]/10 px-3 py-1 rounded-full border border-[#6161ff]/20">
              Especialización por Área
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mt-4 mb-4">
              Un sistema adaptado a cada área de tu empresa
            </h2>
            <p className="text-base sm:text-lg text-neutral-400">
              Desde el operario de almacén que recepciona insumos hasta el gerente que audita la rentabilidad fiscal.
            </p>
          </div>

          <div className="flex items-center justify-start lg:justify-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar">
            {useCaseTabs.map((tab) => {
              const isSelected = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-white text-neutral-900 shadow-md scale-105' 
                      : 'bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="bg-neutral-800/90 rounded-2xl border border-neutral-700/80 p-6 sm:p-8 lg:p-10 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <span 
                    className="inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-md mb-3"
                    style={{ backgroundColor: `${currentTab.color}20`, color: currentTab.color }}
                  >
                    {currentTab.subtitle}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    {currentTab.agentName}
                  </h3>
                  <p className="text-sm text-neutral-400 leading-relaxed">
                    {currentTab.agentRole}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-neutral-700">
                  {currentTab.stats.map((stat, i) => (
                    <div key={i} className="bg-neutral-900/60 rounded-xl p-3 border border-neutral-700/50">
                      <div className="text-lg sm:text-xl font-extrabold text-white" style={{ color: currentTab.color }}>
                        {stat.value}
                      </div>
                      <div className="text-[11px] text-neutral-400 font-medium mt-0.5">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>

                <a 
                  href="#registro" 
                  className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
                  style={{ color: currentTab.color }}
                >
                  <span>Probar flujo de {currentTab.label} gratis</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              <div className="lg:col-span-7 bg-neutral-950 rounded-xl border border-neutral-800 p-5 font-mono text-xs shadow-inner">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-800 text-neutral-400">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Consola de Operaciones en Vivo
                  </span>
                  <span className="text-[10px] bg-neutral-900 px-2 py-0.5 rounded text-neutral-500">
                    Modo Supervisado
                  </span>
                </div>

                <div className="mb-4 bg-neutral-900/80 rounded-lg p-3 border border-neutral-800">
                  <div className="text-neutral-500 text-[10px] uppercase font-bold mb-1">Instrucción del Responsable:</div>
                  <div className="text-neutral-200">"{currentTab.promptExample}"</div>
                </div>

                <div className="space-y-2 mb-4 text-neutral-400 text-[11px]">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Check className="w-3.5 h-3.5" />
                    <span>Conexión establecida con base de datos de stock y sucursales.</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Check className="w-3.5 h-3.5" />
                    <span>Aplicadas reglas comerciales, márgenes y permisos de usuario.</span>
                  </div>
                  <div className="flex items-center gap-2 text-sky-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Resultado validado y sincronizado en tiempo real.</span>
                  </div>
                </div>

                <div 
                  className="rounded-lg p-3.5 border"
                  style={{ backgroundColor: `${currentTab.color}10`, borderColor: `${currentTab.color}40` }}
                >
                  <div className="text-[10px] uppercase font-bold mb-1" style={{ color: currentTab.color }}>
                    Acción Ejecutada por el Sistema:
                  </div>
                  <div className="text-neutral-200 text-xs font-sans leading-relaxed">
                    {currentTab.responseSummary}
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 6. GOBERNANZA, AUDITORÍA Y CONTROL TOTAL */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6161ff] bg-[#6161ff]/10 px-3 py-1 rounded-full">
                Seguridad & Control Operativo
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 tracking-tight leading-tight">
                Obtenga control total sobre su operación
              </h2>
              <p className="text-base sm:text-lg text-neutral-600 leading-relaxed">
                Supervise almacenes, limite accesos y audite cada movimiento comercial. Su empresa mantiene en todo momento el orden absoluto de sus existencias.
              </p>

              <div className="pt-6">
                <a 
                  href="#contacto" 
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#6161ff] hover:underline"
                >
                  <span>Solicitar una auditoría para mi negocio</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-3">
              {governanceItems.map((item, idx) => {
                const isOpen = activeAccordion === idx;
                return (
                  <div 
                    key={idx}
                    className={`rounded-xl border transition-all overflow-hidden ${
                      isOpen ? 'border-[#6161ff] bg-neutral-50/70 shadow-sm' : 'border-neutral-200 bg-white'
                    }`}
                  >
                    <button
                      onClick={() => setActiveAccordion(isOpen ? -1 : idx)}
                      className="w-full flex items-center justify-between p-5 text-left font-semibold text-neutral-900 text-base sm:text-lg cursor-pointer"
                    >
                      <span>{item.title}</span>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform ${
                        isOpen ? 'bg-[#6161ff] text-white rotate-180' : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-sm text-neutral-600 leading-relaxed animate-in fade-in-50 duration-200">
                        {item.description}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      </section>

      {/* 7. SEGURIDAD Y CERTIFICACIONES */}
      <section className="py-16 bg-neutral-50 border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-2">
            Seguridad y cumplimiento de nivel empresarial
          </h3>
          <p className="text-sm text-neutral-600 max-w-2xl mx-auto mb-8">
            Infraestructura cloud con encriptación bancaria, cumplimiento fiscal tributario directo y protección total de tus datos comerciales.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-lg bg-white border border-neutral-200 text-xs font-bold text-neutral-700 shadow-2xs">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>SUNAT Homologado</span>
            </div>
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-lg bg-white border border-neutral-200 text-xs font-bold text-neutral-700 shadow-2xs">
              <Lock className="w-5 h-5 text-emerald-600" />
              <span>MercadoPago Certificado</span>
            </div>
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-lg bg-white border border-neutral-200 text-xs font-bold text-neutral-700 shadow-2xs">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>PostgreSQL RLS Security</span>
            </div>
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-lg bg-white border border-neutral-200 text-xs font-bold text-neutral-700 shadow-2xs">
              <Lock className="w-5 h-5 text-emerald-600" />
              <span>SSL 256-bit Encriptado</span>
            </div>
          </div>

          <div className="mt-8">
            <a 
              href="#contacto" 
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6161ff] hover:underline"
            >
              <span>Hablar con un especialista en implementación técnica</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* 8. FINAL CONVERSION BANNER */}
      <section className="py-20 lg:py-28 bg-[#181b34] text-white relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#6161ff]/20 rounded-full blur-3xl -z-0"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#00d2d2]/15 rounded-full blur-3xl -z-0"></div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Toma el control de tu stock y acelera tus ventas hoy mismo
          </h2>
          <p className="text-base sm:text-xl text-neutral-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            Deja atrás las hojas de cálculo desactualizadas y las pérdidas por descontrol en almacén. Empieza a operar con un sistema moderno, multisede y conectado a tus canales de venta.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="#registro" 
              className="group inline-flex items-center justify-center gap-3 bg-[#6161ff] hover:bg-[#4b4be8] text-white text-base font-semibold px-8 py-4 rounded-full shadow-xl shadow-[#6161ff]/30 transition-all transform hover:-translate-y-0.5 active:scale-95"
            >
              <span>Comenzar prueba gratis de 14 días</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a 
              href="#contacto" 
              className="inline-flex items-center justify-center gap-2 text-white hover:text-neutral-200 text-base font-medium px-6 py-4 rounded-full border border-white/20 hover:bg-white/10 transition-colors"
            >
              <span>Contactar a un asesor comercial</span>
            </a>
          </div>

          <p className="text-xs text-neutral-400 mt-6 font-medium">
            Configuración inicial en 5 minutos ✦ Migración de datos asistida ✦ Sin compromiso
          </p>
        </div>
      </section>

      {/* 9. GLOBAL FOOTER */}
      <footer className="bg-neutral-950 text-neutral-400 py-16 border-t border-neutral-900 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div>
              <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-wider">Qaway Inventario</h4>
              <ul className="space-y-2.5 text-xs">
                <li><a href="#modulos" className="hover:text-white transition-colors">Sistema de Stock</a></li>
                <li><a href="#multisede" className="hover:text-white transition-colors">Gestión Multisede</a></li>
                <li><a href="#sunat" className="hover:text-white transition-colors">Facturación SUNAT</a></li>
                <li><a href="#seguridad" className="hover:text-white transition-colors">Seguridad RLS</a></li>
                <li><a href="#precios" className="hover:text-white transition-colors">Planes y Precios</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-wider">Módulos</h4>
              <ul className="space-y-2.5 text-xs">
                <li><a href="#almacen" className="hover:text-white transition-colors">Almacenes y Zonas</a></li>
                <li><a href="#ia" className="hover:text-white transition-colors">Captura con IA</a></li>
                <li><a href="#bundles" className="hover:text-white transition-colors">Listas y Bundles</a></li>
                <li><a href="#liquidacion" className="hover:text-white transition-colors">Liquidación y Remates</a></li>
                <li><a href="#tienda" className="hover:text-white transition-colors">Tienda y Checkout</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-wider">Sectores</h4>
              <ul className="space-y-2.5 text-xs">
                <li><a href="#" className="hover:text-white transition-colors">Distribuidores Mayoristas</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Ferreterías y Construcción</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Retail y Supermercados</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Farmacias y Cosmética</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Comercio E-commerce</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-wider">Recursos</h4>
              <ul className="space-y-2.5 text-xs">
                <li><a href="#" className="hover:text-white transition-colors">Centro de Ayuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Guías de Migración Excel</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Manual de Facturación SUNAT</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API y Webhooks</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Casos de Éxito</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-wider">Qaway Lab</h4>
              <ul className="space-y-2.5 text-xs">
                <li><a href="/hub" className="hover:text-white transition-colors">Qaway Hub General</a></li>
                <li><a href="/estudio" className="hover:text-white transition-colors">Estudio Digital</a></li>
                <li><a href="/proyectos" className="hover:text-white transition-colors">Ecosistema SaaS</a></li>
                <li><a href="#contacto" className="hover:text-white transition-colors">Contacto Comercial</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Soporte Técnico</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-6">
              <span>Español (Perú / Latinoamérica)</span>
              <a href="#" className="hover:text-white">Privacidad de Datos</a>
              <a href="#" className="hover:text-white">Términos del Servicio</a>
              <a href="#" className="hover:text-white">Seguridad Empresarial</a>
            </div>
            <div>
              © 2026 Qaway Lab. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
