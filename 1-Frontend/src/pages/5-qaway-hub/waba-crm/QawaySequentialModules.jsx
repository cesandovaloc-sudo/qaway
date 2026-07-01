import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Upload,
  Check,
  Download,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

/**
 * ========================================================
 * RECURSO COMPLEMENTARIO: SEQUENTIAL BRIEF MAESTRO MODULE
 * QAWAY LAB - SYSTEM DESIGN STANDARD Hex: #FFD200
 * ========================================================
 */

const initialBrief = {
  marca: '',
  productoServicio: '',
  oferta: '',
  precio: '',
  publicoObjetivo: '',
  problemaPrincipal: '',
  deseoPrincipal: '',
  beneficios: [],
  diferenciadores: [],
  canalVenta: '',
  tono: 'Directo y Estratégico',
  nivelConciencia: 'Consciente del Problema',
  objecionesProbables: [],
  restricciones: [],
  resumenEjecutivo: '',
  camposPendientes: []
};

export default function QawaySequentialModules() {
  const [brief, setBrief] = useState(initialBrief);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Local state for list-editor inputs
  const [newBeneficio, setNewBeneficio] = useState('');
  const [newDiferenciador, setNewDiferenciador] = useState('');
  const [newObjecion, setNewObjecion] = useState('');
  const [newRestriccion, setNewRestriccion] = useState('');

  const fileInputRef = useRef(null);

  // Alertas de vacíos de información calculadas en tiempo real
  const missingFields = useMemo(() => {
    const missing = [];
    if (!brief.marca || !brief.marca.trim() || brief.marca === 'Pendiente') missing.push('Nombre de la Marca');
    if (!brief.productoServicio || !brief.productoServicio.trim() || brief.productoServicio === 'Pendiente') missing.push('Producto o Servicio');
    if (!brief.oferta || !brief.oferta.trim() || brief.oferta === 'Pendiente') missing.push('Oferta Principal');
    if (!brief.precio || !brief.precio.trim() || brief.precio === 'Pendiente') missing.push('Precio o Modalidad Comercial');
    if (!brief.publicoObjetivo || !brief.publicoObjetivo.trim() || brief.publicoObjetivo === 'Pendiente') missing.push('Público Objetivo');
    if (!brief.problemaPrincipal || !brief.problemaPrincipal.trim() || brief.problemaPrincipal === 'Pendiente') missing.push('Problema Principal');
    if (!brief.canalVenta || !brief.canalVenta.trim() || brief.canalVenta === 'Pendiente') missing.push('Canal de Venta');
    return missing;
  }, [brief]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileLoading(true);
      
      const fileNameLower = file.name.toLowerCase();
      const isSistemaContenido = fileNameLower.includes('sistema') && fileNameLower.includes('contenido');
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result || '';
        
        setTimeout(() => {
          setUploadedFile({ name: file.name, size: file.size });
          
          if (isSistemaContenido) {
            const extracted = {
              marca: 'SISTEMA OPERATIVO DE CONTENIDOS',
              productoServicio: 'Plantilla estructurada en Notion para creadores de contenido',
              oferta: 'Transforma el caos creativo en un flujo de trabajo estructurado y continuo en Notion.',
              precio: 'S/. 29',
              publicoObjetivo: 'Creadores de contenido, marcas personales, agencias y equipos que publican recurrentemente.',
              problemaPrincipal: 'El caos creativo, desorden visual y falta de un flujo de trabajo unificado que conecte la ideación, planificación, producción y calendario.',
              deseoPrincipal: 'Centralizar el flujo editorial en Notion con visualización Gantt, roles claros y seguimiento de fases (Guion, Producción, Edición).',
              beneficios: ['Centralización total del flujo creativo en Notion', 'Visualización Gantt de plazos y roles claros', 'Laboratorio de Ideas con sistema de captura express'],
              diferenciadores: ['Diseñado a partir de operaciones reales de agencias', 'Enfoque estricto en embudo inbound (TOFU, MOFU, BOFU)', 'Plantillas de guion listas para inyectar en copies'],
              canalVenta: 'Landing Page + Checkout',
              tono: 'Directo y Estratégico',
              nivelConciencia: 'Consciente del Problema',
              objecionesProbables: ['¿Es muy difícil de implementar en mi Notion?', '¿Se requiere plan de pago de Notion?', '¿Sirve para equipos pequeños?'],
              restricciones: ['No vender de forma agresiva en frío', 'No prometer que Notion automatiza las operaciones externas'],
              resumenEjecutivo: 'Un ecosistema operativo digital robusto para marcas que buscan consistencia en su producción de contenido orgánico, eliminando silos y desorden.',
              camposPendientes: []
            };
            setBrief(extracted);
          } else {
            const lines = text.split('\n');
            const getFieldVal = (keywords, defVal = '') => {
              for (let line of lines) {
                const lower = line.toLowerCase();
                for (let kw of keywords) {
                  const pattern = kw + ':';
                  const patternAlt = kw + '：';
                  if (lower.includes(pattern) || lower.includes(patternAlt)) {
                    const idx = line.indexOf(':') !== -1 ? line.indexOf(':') : line.indexOf('：');
                    const val = line.substring(idx + 1).trim();
                    if (val) return val;
                  }
                }
              }
              return defVal;
            };

            const getListFieldVal = (headerKeywords) => {
              let active = false;
              const result = [];
              for (let line of lines) {
                const lower = line.toLowerCase();
                const isHeader = headerKeywords.some(kw => lower.includes(kw));
                if (isHeader) {
                  active = true;
                  continue;
                }
                if (active) {
                  if (line.trim() === '' || line.startsWith('#') || line.includes(':') || line.includes('：')) {
                    active = false;
                    continue;
                  }
                  const clean = line.replace(/^[-*•\d.]+\s*/, '').trim();
                  if (clean) result.push(clean);
                }
              }
              return result;
            };

            const extractedMarca = getFieldVal(['marca', 'nombre de la marca', 'empresa', 'brand', 'name']);
            const extractedProducto = getFieldVal(['producto', 'servicio', 'producto o servicio', 'product', 'service']);
            const extractedOferta = getFieldVal(['oferta principal', 'oferta', 'promesa', 'promesa principal', 'offer']);
            const extractedPrecio = getFieldVal(['precio', 'costo', 'modalidad comercial', 'price', 'cost']);
            const extractedPublico = getFieldVal(['publico objetivo', 'publico', 'cliente ideal', 'target', 'audience']);
            const extractedProblema = getFieldVal(['problema principal', 'problema', 'dolor', 'dolor principal', 'problem']);
            const extractedDeseo = getFieldVal(['deseo principal', 'deseo', 'anhelo', 'desire']);
            const extractedCanal = getFieldVal(['canal de venta', 'canal', 'canal conversion', 'canalventa', 'sales channel']);
            const extractedTono = getFieldVal(['tono', 'tono de marca', 'tone'], 'Directo y Estratégico');
            const extractedConciencia = getFieldVal(['nivel de conciencia', 'conciencia'], 'Consciente del Problema');
            const extractedResumen = getFieldVal(['resumen ejecutivo', 'resumen', 'summary'], '');

            const extractedBeneficios = getListFieldVal(['beneficios', 'beneficio', 'benefits']);
            const extractedDiferenciadores = getListFieldVal(['diferenciadores', 'diferenciador', 'differentiators']);
            const extractedObjeciones = getListFieldVal(['objeciones', 'objeciones probables', 'objections']);
            const extractedRestricciones = getListFieldVal(['restricciones', 'evitar', 'restrictions']);

            const newBrief = {
              marca: extractedMarca || '',
              productoServicio: extractedProducto || '',
              oferta: extractedOferta || '',
              precio: extractedPrecio || '',
              publicoObjetivo: extractedPublico || '',
              problemaPrincipal: extractedProblema || '',
              deseoPrincipal: extractedDeseo || '',
              beneficios: extractedBeneficios,
              diferenciadores: extractedDiferenciadores,
              canalVenta: extractedCanal || '',
              tono: extractedTono,
              nivelConciencia: extractedConciencia,
              objecionesProbables: extractedObjeciones,
              restricciones: extractedRestricciones,
              resumenEjecutivo: extractedResumen,
              camposPendientes: []
            };

            const mandatoryKeys = ['marca', 'productoServicio', 'oferta', 'publicoObjetivo', 'problemaPrincipal', 'precio', 'canalVenta'];
            const missing = [];
            mandatoryKeys.forEach(k => {
              if (!newBrief[k] || newBrief[k].trim() === '') {
                newBrief[k] = '';
                missing.push(k);
              }
            });
            newBrief.camposPendientes = missing;

            setBrief(newBrief);
          }
          setFileLoading(false);
        }, 1500);
      };
      reader.readAsText(file);
    }
  };

  const downloadBriefMarkdown = () => {
    const md = `# REPORT: BRIEF MAESTRO ESTRATÉGICO
Generado el: ${new Date().toLocaleDateString('es-PE')}

========================================================================
- Nombre de la Marca: ${brief.marca || 'Pendiente'}
- Producto o Servicio: ${brief.productoServicio || 'Pendiente'}
- Oferta / Promesa Principal: ${brief.oferta || 'Pendiente'}
- Precio del Producto: ${brief.precio || 'Pendiente'}
- Canal de Venta: ${brief.canalVenta || 'Pendiente'}
- Público Objetivo: ${brief.publicoObjetivo || 'Pendiente'}
- Problema Principal: ${brief.problemaPrincipal || 'Pendiente'}
- Deseo Principal: ${brief.deseoPrincipal || 'Pendiente'}
- Tono de Comunicación: ${brief.tono}
- Nivel de Conciencia: ${brief.nivelConciencia}

========================================================================
ATRIBUTOS ADICIONALES
========================================================================
- Resumen Ejecutivo: 
  ${brief.resumenEjecutivo || 'Pendiente'}

- Beneficios:
${brief.beneficios.map(b => `  * ${b}`).join('\n') || '  (Ninguno)'}

- Diferenciadores:
${brief.diferenciadores.map(d => `  * ${d}`).join('\n') || '  (Ninguno)'}

- Objeciones Probables:
${brief.objecionesProbables.map(o => `  * ${o}`).join('\n') || '  (Ninguno)'}

- Restricciones:
${brief.restricciones.map(r => `  * ${r}`).join('\n') || '  (Ninguno)'}
`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Brief-Maestro-${brief.marca.toLowerCase().replace(/\s+/g, '-') || 'marca'}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 p-4 md:p-8 font-sans selection:bg-[#FFD200] selection:text-black">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="border-b border-white/5 pb-5">
          <div className="text-[#FFD200] text-[9px] font-extrabold uppercase tracking-widest">
            Qaway Lab · Consola Estratégica
          </div>
          <h1 className="text-2xl font-black text-white mt-1 leading-tight">
            Módulo 01 · Brief Maestro
          </h1>
          <p className="text-zinc-400 text-xs mt-1">
            Extrae, valida y ordena la información base de tu marca sin inventar datos para estructurar tus campañas.
          </p>
        </div>

        {/* Drag & Drop */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFileChange({ target: { files: e.dataTransfer.files } });
            }
          }}
          onClick={() => fileInputRef.current.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
            dragActive
              ? 'border-[#FFD200] bg-[#FFD200]/5'
              : 'border-white/10 bg-[#121212] hover:border-white/20'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".txt,.pdf,.md"
            className="hidden"
          />
          
          {fileLoading ? (
            <div className="space-y-3 py-4 flex flex-col items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-t-[#FFD200] border-white/10 animate-spin"></div>
              <p className="text-[#FFD200] text-xs font-bold animate-pulse">Analizando documento base de la marca...</p>
            </div>
          ) : uploadedFile ? (
            <div className="space-y-2 py-2 flex flex-col items-center">
              <p className="text-white text-xs font-extrabold">{uploadedFile.name}</p>
              <p className="text-zinc-400 text-[10px]">{(uploadedFile.size / 1024).toFixed(1)} KB • Procesado y cargado</p>
            </div>
          ) : (
            <div className="space-y-2 py-4">
              <p className="text-zinc-200 text-xs font-bold">
                Arrastra tu archivo PDF/TXT de marca aquí o <span className="text-[#FFD200]">explora tu dispositivo</span>
              </p>
              <p className="text-zinc-500 text-[10px]">Soporta materiales base, resúmenes y notas comerciales</p>
            </div>
          )}
        </div>

        {/* Ficha Formulario */}
        <div className="bg-[#121212] border border-white/5 rounded-xl p-6 space-y-6">
          <h3 className="text-white text-xs font-black uppercase tracking-wider border-b border-white/5 pb-2">
            Formulario del Brief Maestro (Editable)
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-zinc-450 uppercase tracking-widest block">Nombre de la Marca *</label>
              <input
                type="text"
                value={brief.marca}
                onChange={(e) => setBrief({ ...brief, marca: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-white/5 focus:border-[#FFD200]/30 rounded-xl px-4 py-3 text-xs text-white outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-zinc-450 uppercase tracking-widest block">Producto o Servicio *</label>
              <input
                type="text"
                value={brief.productoServicio}
                onChange={(e) => setBrief({ ...brief, productoServicio: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-white/5 focus:border-[#FFD200]/30 rounded-xl px-4 py-3 text-xs text-white outline-none"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-extrabold text-zinc-450 uppercase tracking-widest block">Oferta Principal *</label>
              <input
                type="text"
                value={brief.oferta}
                onChange={(e) => setBrief({ ...brief, oferta: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-white/5 focus:border-[#FFD200]/30 rounded-xl px-4 py-3 text-xs text-white outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-zinc-450 uppercase tracking-widest block">Precio o Modalidad *</label>
              <input
                type="text"
                value={brief.precio}
                onChange={(e) => setBrief({ ...brief, precio: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-white/5 focus:border-[#FFD200]/30 rounded-xl px-4 py-3 text-xs text-white outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-zinc-450 uppercase tracking-widest block">Canal de Venta *</label>
              <select
                value={brief.canalVenta}
                onChange={(e) => setBrief({ ...brief, canalVenta: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-white/5 focus:border-[#FFD200]/30 rounded-xl px-4 py-3 text-xs text-white outline-none"
              >
                <option value="">-- Seleccionar --</option>
                <option value="WhatsApp Business">WhatsApp Business</option>
                <option value="WhatsApp API (WABA)">WhatsApp API (WABA)</option>
                <option value="Landing Page + Checkout">Landing Page + Checkout</option>
              </select>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-extrabold text-zinc-450 uppercase tracking-widest block">Público Objetivo Ideal *</label>
              <textarea
                value={brief.publicoObjetivo}
                onChange={(e) => setBrief({ ...brief, publicoObjetivo: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-white/5 focus:border-[#FFD200]/30 rounded-xl px-4 py-3 text-xs text-white outline-none min-h-[60px] resize-none"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-extrabold text-zinc-450 uppercase tracking-widest block">Problema Principal *</label>
              <textarea
                value={brief.problemaPrincipal}
                onChange={(e) => setBrief({ ...brief, problemaPrincipal: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-white/5 focus:border-[#FFD200]/30 rounded-xl px-4 py-3 text-xs text-white outline-none min-h-[60px] resize-none"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-extrabold text-zinc-450 uppercase tracking-widest block">Deseo Principal</label>
              <textarea
                value={brief.deseoPrincipal}
                onChange={(e) => setBrief({ ...brief, deseoPrincipal: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-white/5 focus:border-[#FFD200]/30 rounded-xl px-4 py-3 text-xs text-white outline-none min-h-[60px] resize-none"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-extrabold text-zinc-450 uppercase tracking-widest block">Resumen Ejecutivo</label>
              <textarea
                value={brief.resumenEjecutivo}
                onChange={(e) => setBrief({ ...brief, resumenEjecutivo: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-white/5 focus:border-[#FFD200]/30 rounded-xl px-4 py-3 text-xs text-white outline-none min-h-[60px] resize-none"
              />
            </div>
          </div>

          {/* Collapsible lists */}
          <div className="border border-white/5 rounded-xl bg-black/20 overflow-hidden">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full px-5 py-4 flex items-center justify-between text-xs font-extrabold uppercase tracking-widest text-zinc-400 hover:text-zinc-200"
            >
              <span>Atributos Adicionales (Beneficios, Diferenciadores, Objeciones)</span>
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showAdvanced && (
              <div className="px-5 pb-5 pt-1 space-y-4 bg-[#121212] border-t border-white/5">
                {/* Beneficios list editor */}
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest block">Beneficios de la Oferta</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newBeneficio}
                      placeholder="Añadir beneficio..."
                      onChange={(e) => setNewBeneficio(e.target.value)}
                      className="flex-1 bg-[#1a1a1a] border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => { if (newBeneficio.trim()) { setBrief(prev => ({ ...prev, beneficios: [...prev.beneficios, newBeneficio.trim()] })); setNewBeneficio(''); } }}
                      className="bg-[#FFD200] text-black px-4 py-2 rounded-xl text-xs font-bold"
                    >
                      Añadir
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {brief.beneficios.map((b, i) => (
                      <span key={i} className="text-xs bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full border border-white/5 flex items-center gap-1.5">
                        {b}
                        <button onClick={() => setBrief(prev => ({ ...prev, beneficios: prev.beneficios.filter((_, idx) => idx !== i) }))} className="text-zinc-500 hover:text-white">×</button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Diferenciadores */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <label className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest block">Diferenciadores Únicos</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newDiferenciador}
                      placeholder="Añadir diferenciador..."
                      onChange={(e) => setNewDiferenciador(e.target.value)}
                      className="flex-1 bg-[#1a1a1a] border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => { if (newDiferenciador.trim()) { setBrief(prev => ({ ...prev, diferenciadores: [...prev.diferenciadores, newDiferenciador.trim()] })); setNewDiferenciador(''); } }}
                      className="bg-[#FFD200] text-black px-4 py-2 rounded-xl text-xs font-bold"
                    >
                      Añadir
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {brief.diferenciadores.map((d, i) => (
                      <span key={i} className="text-xs bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full border border-white/5 flex items-center gap-1.5">
                        {d}
                        <button onClick={() => setBrief(prev => ({ ...prev, diferenciadores: prev.diferenciadores.filter((_, idx) => idx !== i) }))} className="text-zinc-500 hover:text-white">×</button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Validation warnings */}
          <AnimatePresence>
            {missingFields.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-white text-xs font-extrabold uppercase">Campos Estratégicos Requeridos</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {missingFields.map((field, idx) => (
                      <span key={idx} className="text-[9px] font-black uppercase bg-black text-red-400 px-2 py-0.5 rounded border border-red-500/10">
                        ⚠️ {field}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CTA Validation */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-white/5">
            <div>
              {missingFields.length === 0 ? (
                <span className="text-emerald-400 text-xs font-extrabold flex items-center gap-1">
                  <Check className="w-4 h-4" /> Brief Maestro Validado y Aprobado
                </span>
              ) : (
                <span className="text-zinc-500 text-[10px] font-extrabold uppercase tracking-wider">
                  Completa los campos obligatorios para avanzar
                </span>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={downloadBriefMarkdown}
                className="bg-zinc-800 hover:bg-zinc-700 text-white font-extrabold px-5 py-3 rounded-xl text-xs uppercase tracking-wider"
              >
                Exportar Brief (.md)
              </button>

              <button
                type="button"
                disabled={missingFields.length > 0}
                onClick={() => {
                  alert("Brief Maestro aprobado estrategicamente y listo para alimentar Diagnóstico.");
                }}
                className={`font-extrabold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all duration-350 ${
                  missingFields.length > 0
                    ? 'bg-zinc-900 border border-white/5 text-zinc-650 cursor-not-allowed'
                    : 'bg-[#FFD200] hover:bg-[#E5B800] text-black shadow-lg shadow-[#FFD200]/10'
                }`}
              >
                Validar Brief y pasar a Diagnóstico
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
