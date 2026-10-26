import { useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { Activity, ArrowDown, ArrowLeft, ArrowRight, BadgeCheck, CalendarDays, Check, ChevronDown, ClipboardList, Clock3, Download, FileCheck2, FileImage, FileText, FileUp, History, ImagePlus, ListChecks, LoaderCircle, Plus, Save, Settings2, ShieldCheck, Sparkles, Trash2, UploadCloud, Users, X } from 'lucide-react';
import mammoth from 'mammoth';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import type { ActForm, Evidence, Agreement } from './types';
import { emptyForm } from './types';

const uid = () => crypto.randomUUID();
const formatDate = (value: string) => value ? new Date(`${value}T12:00:00`).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Sin fecha';
const stages = ['Insumo', 'Revisión', 'Evidencias', 'Exportación'];

function App() {
  const [form, setForm] = useState<ActForm>(() => ({ ...emptyForm, agreements: emptyForm.agreements.map(a => ({ ...a })) }));
  const [sourceText, setSourceText] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [history, setHistory] = useState<any[]>(() => { try { return JSON.parse(localStorage.getItem('actas-history') || '[]'); } catch { return []; } });
  const [showSettings, setShowSettings] = useState(false);
  const sourceInput = useRef<HTMLInputElement>(null);
  const evidenceInput = useRef<HTMLInputElement>(null);
  const attendanceInput = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const setField = <K extends keyof ActForm>(key: K, value: ActForm[K]) => setForm(prev => ({ ...prev, [key]: value }));
  const updateAgreement = (id: string, key: 'text' | 'deadline', value: string) => setField('agreements', form.agreements.map(a => a.id === id ? { ...a, [key]: value } : a));
  const addAgreement = () => setField('agreements', [...form.agreements, { id: uid(), text: '', deadline: '' }]);
  const removeAgreement = (id: string) => setField('agreements', form.agreements.filter(a => a.id !== id));

  async function extractText(file: File): Promise<string> {
    if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt') || file.name.toLowerCase().endsWith('.md')) return await file.text();
    if (file.name.toLowerCase().endsWith('.docx')) {
      const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
      return result.value;
    }
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      const data = new Uint8Array(await file.arrayBuffer());
      const pdf = await pdfjs.getDocument({ data, disableWorker: true }).promise;
      const pages: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        pages.push(content.items.map((item: any) => item.str || '').join(' '));
      }
      return pages.join('\n\n');
    }
    throw new Error('Formato no compatible. Usa DOCX, PDF, TXT o MD.');
  }

  async function handleSourceUpload(file?: File) {
    if (!file) return;
    setBusy(true); setNotice('');
    try {
      const text = await extractText(file);
      setSourceText(text); setSourceName(file.name);
      setNotice(`Insumo cargado: ${file.name}. Revisa el texto extraído antes de generar el borrador.`);
    } catch (e) { setNotice(e instanceof Error ? e.message : 'No se pudo leer el archivo.'); }
    finally { setBusy(false); }
  }

  function quickExtract() {
    const text = sourceText.trim();
    if (!text) { setNotice('Primero pega o carga una transcripción o resumen.'); return; }
    const dateMatch = text.match(/\b(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})\b/);
    if (dateMatch) setField('date', `${dateMatch[3]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[1].padStart(2, '0')}`);
    const timeMatch = text.match(/\b(\d{1,2}:\d{2}\s?(?:a\.?m\.?|p\.?m\.?|AM|PM))\b/i);
    if (timeMatch) setField('startTime', timeMatch[1].toUpperCase());
    const ugelMatch = text.match(/\bUGEL\s*([\wÁÉÍÓÚÑáéíóúñ -]{2,35})/i);
    if (ugelMatch && !form.ugel) setField('ugel', `UGEL ${ugelMatch[1].trim().split(/[\n,.]/)[0]}`);
    const agendaCandidates = text.split(/\n+/).map(s => s.replace(/^\s*(?:[-•*]|\d+[.)])\s*/, '').trim()).filter(s => s.length > 20 && s.length < 160);
    if (agendaCandidates.length >= 1 && form.agenda.every(a => !a.trim())) setField('agenda', [agendaCandidates[0] || '', agendaCandidates[1] || '', agendaCandidates[2] || '']);
    setNotice('Se completaron algunos datos que parecían identificables. Es una extracción preliminar; verifica cada campo. La redacción asistida requiere configurar la API de IA.');
    setActiveStep(1);
  }

  async function generateWithAI() {
    if (!sourceText.trim()) { setNotice('Carga o pega primero el resumen o la transcripción.'); return; }
    setBusy(true); setNotice('');
    try {
      const response = await fetch('/api/generate-act', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sourceText, currentForm: form }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'No se pudo procesar el insumo.');
      const next = data.form;
      setForm(prev => ({ ...prev, ...next, agenda: [...(next.agenda || []), '', '', ''].slice(0, Math.max(3, (next.agenda || []).length)), agreements: (next.agreements || []).map((a: any) => ({ id: uid(), text: a.text || '', deadline: a.deadline || '' })) }));
      setNotice(`Borrador preparado. Revisa la redacción, los responsables, los plazos y los datos antes de exportar.${Array.isArray(data.warnings) && data.warnings.length ? ` Pendiente de confirmar: ${data.warnings.join('; ')}` : ''}`); setActiveStep(1);
    } catch (e) {
      setNotice(`${e instanceof Error ? e.message : 'Error de procesamiento'} Puedes completar el formulario manualmente; revisa el archivo .env para configurar la IA.`);
      quickExtract();
    } finally { setBusy(false); }
  }

  function addEvidence(files: FileList | null, kind: 'attendance' | 'photo') {
    if (!files?.length) return;
    const allowed = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (allowed.length !== files.length) setNotice('Solo se añadieron archivos de imagen. Convierte los PDF de asistencia a imagen antes de adjuntarlos.');
    const added = allowed.map(file => ({ id: uid(), file, url: URL.createObjectURL(file), kind, caption: kind === 'attendance' ? 'Registro fotográfico de asistencia' : 'Evidencia de la reunión' } as Evidence));
    setEvidence(prev => [...prev, ...added]);
    setActiveStep(2);
  }
  function updateEvidence(id: string, caption: string) { setEvidence(prev => prev.map(e => e.id === id ? { ...e, caption } : e)); }
  function deleteEvidence(id: string) { setEvidence(prev => { const item = prev.find(e => e.id === id); if (item) URL.revokeObjectURL(item.url); return prev.filter(e => e.id !== id); }); }
  function moveEvidence(id: string, direction: -1 | 1) {
    setEvidence(prev => { const idx = prev.findIndex(e => e.id === id); const target = idx + direction; if (target < 0 || target >= prev.length) return prev; const next = [...prev]; [next[idx], next[target]] = [next[target], next[idx]]; return next; });
  }

  async function exportWord() {
    setBusy(true); setNotice('');
    try {
      const evidencePayload = await Promise.all(evidence.map(async item => {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader(); reader.onload = () => resolve(String(reader.result || '')); reader.onerror = () => reject(new Error(`No se pudo leer ${item.file.name}`)); reader.readAsDataURL(item.file);
        });
        return { kind: item.kind, caption: item.caption, name: item.file.name, mimeType: item.file.type, data: dataUrl.split(',')[1] || '' };
      }));
      const response = await fetch('/api/export-docx', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ form, evidence: evidencePayload }) });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'No se pudo generar el Word desde la plantilla institucional.');
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `Acta-${form.date || 'sin-fecha'}.docx`; a.click(); URL.revokeObjectURL(url);
      const record = { id: uid(), date: form.date, ugel: form.ugel, activity: form.activity, createdAt: new Date().toISOString(), agreements: form.agreements.filter(a => a.text.trim()).length, sourceName };
      const next = [record, ...history].slice(0, 30); setHistory(next); localStorage.setItem('actas-history', JSON.stringify(next));
      setNotice('Word generado utilizando la plantilla institucional original. Revisa el contenido y la paginación antes de registrarlo oficialmente.'); setActiveStep(3);
    } catch (e) { setNotice(`No se pudo generar el documento: ${e instanceof Error ? e.message : 'error inesperado'}`); }
    finally { setBusy(false); }
  }
  function exportPrint() { window.print(); }
  function resetForm() { setForm({ ...emptyForm, agreements: emptyForm.agreements.map(a => ({ ...a, id: uid() })) }); setSourceText(''); setSourceName(''); evidence.forEach(e => URL.revokeObjectURL(e.url)); setEvidence([]); setActiveStep(0); setNotice(''); navigate('/'); }

  const filledAgreements = form.agreements.filter(a => a.text.trim()).length;
  const evidenceCount = evidence.length;
  const readiness = useMemo(() => [!!form.date, !!form.activity, !!form.modality, !!form.ugel, form.agenda.some(a => a.trim()), filledAgreements > 0].filter(Boolean).length, [form, filledAgreements]);

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><FileCheck2 size={22}/></div><div><strong>Actas</strong><span>INSTITUCIONALES</span></div></div>
      <div className="workspace-label">ESPACIO DE TRABAJO</div>
      <nav className="nav-list">
        <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><Plus size={18}/><span>Nueva acta</span><kbd>N</kbd></NavLink>
        <NavLink to="/historial" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><History size={18}/><span>Historial local</span></NavLink>
      </nav>
      <div className="sidebar-spacer"/>
      <div className="template-card"><div className="template-icon"><ShieldCheck size={18}/></div><div><strong>Plantilla institucional</strong><p>Estructura fija · Texto adaptable</p><span className="status-dot">Plantilla de referencia incluida</span></div></div>
      <button className="nav-item settings-button" onClick={() => setShowSettings(v => !v)}><Settings2 size={18}/><span>Configuración</span><ChevronDown size={15} className={showSettings ? 'rotate' : ''}/></button>
      {showSettings && <div className="settings-pop"><strong>Reglas del documento</strong><p>• Estructura estable</p><p>• Filas de texto autoajustables</p><p>• Evidencias al final</p><p>• Datos no confirmados quedan pendientes</p><a href="/ACTA-DE-REUNION-REFERENCIA.docx" download>Descargar plantilla de referencia</a></div>}
      <div className="sidebar-footer"><span className="avatar">AI</span><div><strong>Generador de actas</strong><small>Versión local · 1.0</small></div><span className="online-dot"/></div>
    </aside>

    <main className="main-area">
      <header className="topbar"><div className="breadcrumb"><span>Documentos</span><ArrowRight size={14}/><strong>{location.pathname.includes('historial') ? 'Historial local' : 'Nueva acta'}</strong></div><div className="topbar-actions"><span className="privacy-note"><ShieldCheck size={15}/> Extracción local · IA opcional por API</span><button className="icon-button" title="Crear nueva acta" onClick={resetForm}><Plus size={18}/></button></div></header>
      <Routes>
        <Route path="/historial" element={<HistoryPage history={history} onNew={resetForm}/>} />
        <Route path="*" element={<div className="page-content">
          <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line"/> DOCUMENTACIÓN INSTITUCIONAL</div><h1>Generador de actas</h1><p>De la transcripción al acta final, con un formato institucional constante.</p></div><div className="heading-status"><span className="green-pulse"/>Borrador local</div></div>
          <div className="stepper">{stages.map((s, i) => <button key={s} className={`step ${i === activeStep ? 'current' : ''} ${i < activeStep ? 'complete' : ''}`} onClick={() => setActiveStep(i)}><span className="step-num">{i < activeStep ? <Check size={14}/> : `0${i + 1}`}</span><span>{s}</span>{i < stages.length - 1 && <span className="step-line"/>}</button>)}</div>
          {notice && <div className={`notice ${notice.startsWith('No se') || notice.startsWith('Solo') || notice.startsWith('Primero') ? 'warning' : ''}`}><span><Activity size={17}/></span><div>{notice}</div><button onClick={() => setNotice('')} aria-label="Cerrar aviso"><X size={15}/></button></div>}

          <div className="content-grid">
            <div className="main-column">
              <section className="panel source-panel">
                <div className="panel-heading"><div className="panel-icon violet"><Sparkles size={19}/></div><div className="panel-title"><h2>01. Insumo de la reunión</h2><p>Admite transcripciones, notas automáticas de Google/Gemini o apuntes propios.</p></div><span className="optional-tag">Flexible</span></div>
                <div className="source-body">
                  <input ref={sourceInput} type="file" accept=".docx,.pdf,.txt,.md,application/pdf,text/plain" hidden onChange={e => handleSourceUpload(e.target.files?.[0])}/>
                  <button className="upload-zone" onClick={() => sourceInput.current?.click()} onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('dragging'); }} onDragLeave={e => e.currentTarget.classList.remove('dragging')} onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('dragging'); handleSourceUpload(e.dataTransfer.files[0]); }}>
                    <span className="upload-icon"><UploadCloud size={23}/></span><strong>{busy ? 'Procesando archivo…' : sourceName || 'Arrastra un archivo o selecciónalo'}</strong><span>DOCX, PDF, TXT o MD · También puedes pegar el texto debajo</span><span className="upload-action">{sourceName ? 'Cambiar archivo' : 'Seleccionar archivo'} <ArrowRight size={14}/></span>
                  </button>
                  <div className="or-divider"><span/>o pega el contenido directamente<span/></div>
                  <textarea className="source-textarea" value={sourceText} onChange={e => setSourceText(e.target.value)} placeholder="Pega aquí la transcripción de Google Meet, el resumen de Gemini o tus notas. No necesitas ordenarlas previamente…" rows={6}/>
                  <div className="source-bottom"><span>{sourceText.trim() ? `${sourceText.trim().split(/\s+/).length.toLocaleString('es-PE')} palabras extraídas` : 'No se ha añadido contenido'}</span><div><button className="btn-secondary" onClick={quickExtract} disabled={!sourceText.trim() || busy}><ListChecks size={16}/> Extraer datos básicos</button><button className="btn-primary" onClick={generateWithAI} disabled={!sourceText.trim() || busy}>{busy ? <LoaderCircle className="spin" size={16}/> : <Sparkles size={16}/>} Redactar con IA</button></div></div>
                  <div className="helper-note"><ShieldCheck size={15}/><span>La IA debe distinguir acuerdos confirmados de propuestas y no inventar responsables ni plazos. Todo queda editable.</span></div>
                </div>
              </section>

              <section className="panel act-panel">
                <div className="panel-heading"><div className="panel-icon blue"><FileText size={19}/></div><div className="panel-title"><h2>02. Datos del acta</h2><p>Completa o corrige los campos antes de generar el documento.</p></div><span className="locked-tag"><ShieldCheck size={13}/> Estructura fija</span></div>
                <div className="form-content">
                  <div className="section-label"><span>INFORMACIÓN GENERAL</span><div/></div>
                  <div className="form-grid four">
                    <Field label="Fecha" icon={<CalendarDays size={15}/>}><input type="date" value={form.date} onChange={e => setField('date', e.target.value)}/></Field>
                    <Field label="Hora de inicio" icon={<Clock3 size={15}/>}><input placeholder="8:30 a. m." value={form.startTime} onChange={e => setField('startTime', e.target.value)}/></Field>
                    <Field label="Hora de cierre" icon={<Clock3 size={15}/>}><input placeholder="10:00 a. m." value={form.endTime} onChange={e => setField('endTime', e.target.value)}/></Field>
                    <Field label="Participantes (total)" icon={<Users size={15}/>}><input type="number" min="0" placeholder="Ej. 12" value={form.totalParticipants} onChange={e => setField('totalParticipants', e.target.value)}/></Field>
                  </div>
                  <div className="form-grid three">
                    <Field label="Tipo de actividad"><select value={form.activity} onChange={e => setField('activity', e.target.value as ActForm['activity'])}><option>Asistencia técnica</option><option>Monitoreo y seguimiento</option><option>Balance</option></select></Field>
                    <Field label="Modalidad"><div className="segmented"><button className={form.modality === 'Presencial' ? 'selected' : ''} onClick={() => setField('modality', 'Presencial')}>Presencial</button><button className={form.modality === 'Virtual' ? 'selected' : ''} onClick={() => setField('modality', 'Virtual')}>Virtual</button></div></Field>
                    <Field label="Alcance"><div className="segmented"><button className={form.scope === 'Regional' ? 'selected' : ''} onClick={() => setField('scope', 'Regional')}>Regional</button><button className={form.scope === 'Local' ? 'selected' : ''} onClick={() => setField('scope', 'Local')}>Local</button></div></Field>
                  </div>
                  <div className="form-grid two"><Field label="DRE"><input placeholder="Nombre de la DRE" value={form.dre} onChange={e => setField('dre', e.target.value)}/></Field><Field label="UGEL"><input placeholder="Ej. UGEL Satipo" value={form.ugel} onChange={e => setField('ugel', e.target.value)}/></Field></div>
                  <Field label="Cargos de los participantes" hint="Usa cargos o áreas; no agregues nombres si no están confirmados."><textarea rows={2} placeholder="Ej. Especialistas de AGP, responsable de SIGA…" value={form.participants} onChange={e => setField('participants', e.target.value)}/></Field>
                  <div className="section-label section-spaced"><span>AGENDA</span><div/><small>Los espacios crecen según el texto</small></div>
                  <div className="agenda-list">{form.agenda.map((item, i) => <div className="agenda-row" key={i}><span className="agenda-number">{String(i + 1).padStart(2, '0')}</span><textarea rows={1} value={item} onChange={e => setField('agenda', form.agenda.map((a, idx) => idx === i ? e.target.value : a))} placeholder={`Punto de agenda ${i + 1}`}/>{form.agenda.length > 1 && <button className="tiny-icon" title="Quitar punto" onClick={() => setField('agenda', form.agenda.filter((_, idx) => idx !== i))}><X size={15}/></button>}</div>)}</div>
                  <button className="add-inline" onClick={() => setField('agenda', [...form.agenda, ''])}><Plus size={15}/> Añadir punto de agenda</button>
                  <div className="section-label section-spaced"><span>ACUERDOS Y PLAZOS</span><div/><small>{filledAgreements} con contenido</small></div>
                  <div className="agreements-head"><span>ACUERDO / COMPROMISO</span><span>PLAZO</span><span/></div>
                  <div className="agreements-list">{form.agreements.map((a, i) => <div className="agreement-row" key={a.id}><span className="agreement-index">{String(i + 1).padStart(2, '0')}</span><textarea rows={Math.min(5, Math.max(2, Math.ceil(a.text.length / 90)))} value={a.text} onChange={e => updateAgreement(a.id, 'text', e.target.value)} placeholder="Redacta el acuerdo de forma clara, natural y verificable…"/><input value={a.deadline} onChange={e => updateAgreement(a.id, 'deadline', e.target.value)} placeholder="Por definir" aria-label={`Plazo del acuerdo ${i + 1}`}/><button className="tiny-icon danger" title="Eliminar acuerdo" onClick={() => removeAgreement(a.id)}><Trash2 size={15}/></button></div>)}</div>
                  <button className="add-inline" onClick={addAgreement}><Plus size={15}/> Añadir acuerdo</button>
                  <div className="section-label section-spaced"><span>COMENTARIOS / OBSERVACIONES</span><div/></div>
                  <textarea className="observations" rows={4} value={form.observations} onChange={e => setField('observations', e.target.value)} placeholder="Incluye observaciones relevantes, precisiones o asuntos pendientes. No repitas los acuerdos…"/>
                </div>
              </section>

              <section className="panel evidence-panel">
                <div className="panel-heading"><div className="panel-icon orange"><ImagePlus size={19}/></div><div className="panel-title"><h2>03. Asistencia y evidencias</h2><p>Las imágenes se anexan al final del documento, sin alterar el acta principal.</p></div><span className="count-tag">{evidenceCount} archivo{evidenceCount === 1 ? '' : 's'}</span></div>
                <div className="evidence-content">
                  <div className="evidence-drop-grid">
                    <div className="evidence-drop"><input ref={attendanceInput} type="file" accept="image/png,image/jpeg,image/gif,image/bmp" multiple hidden onChange={e => addEvidence(e.target.files, 'attendance')}/><div className="evidence-drop-icon attendance"><Users size={21}/></div><strong>Registro de asistencia</strong><p>Foto o captura del listado, formulario o registro de participantes.</p><button className="btn-secondary" onClick={() => attendanceInput.current?.click()}><FileUp size={15}/> Añadir asistencia</button></div>
                    <div className="evidence-drop"><input ref={evidenceInput} type="file" accept="image/png,image/jpeg,image/gif,image/bmp" multiple hidden onChange={e => addEvidence(e.target.files, 'photo')}/><div className="evidence-drop-icon photos"><FileImage size={21}/></div><strong>Fotos de la reunión</strong><p>Capturas de la reunión virtual o fotografías de la actividad.</p><button className="btn-secondary" onClick={() => evidenceInput.current?.click()}><ImagePlus size={15}/> Añadir fotografías</button></div>
                  </div>
                  {evidence.length > 0 ? <div className="evidence-list">{evidence.map((item, i) => <div className="evidence-item" key={item.id}><img src={item.url} alt={item.caption}/><div className="evidence-item-info"><strong>{item.file.name}</strong><span>{item.kind === 'attendance' ? 'Registro de asistencia' : 'Fotografía de reunión'} · {(item.file.size / 1024).toFixed(0)} KB</span><input value={item.caption} onChange={e => updateEvidence(item.id, e.target.value)} aria-label="Descripción de la evidencia"/></div><div className="evidence-item-actions"><button className="tiny-icon" title="Subir" onClick={() => moveEvidence(item.id, -1)} disabled={i === 0}><ArrowLeft size={14}/></button><button className="tiny-icon" title="Bajar" onClick={() => moveEvidence(item.id, 1)} disabled={i === evidence.length - 1}><ArrowRight size={14}/></button><button className="tiny-icon danger" title="Eliminar" onClick={() => deleteEvidence(item.id)}><Trash2 size={14}/></button></div></div>)}</div> : <div className="empty-evidence"><FileImage size={22}/><span>Las evidencias que cargues aparecerán aquí para revisar el orden y los títulos.</span></div>}
                  <div className="helper-note"><ShieldCheck size={15}/><span>La aplicación no verifica la identidad de las personas de una imagen. Revisa que el registro corresponda a la reunión y evita incluir información innecesaria.</span></div>
                </div>
              </section>
            </div>

            <aside className="right-column">
              <div className="panel summary-card"><div className="summary-head"><div><span className="summary-kicker">ESTADO DEL DOCUMENTO</span><h3>Tu acta</h3></div><div className="summary-doc-icon"><FileCheck2 size={21}/></div></div><div className="progress-meta"><span>Preparación</span><strong>{Math.round(readiness / 6 * 100)}%</strong></div><div className="progress-track"><span style={{ width: `${readiness / 6 * 100}%` }}/></div><div className="checklist"><CheckLine done={!!form.date} label="Fecha registrada"/><CheckLine done={!!form.ugel.trim()} label="UGEL identificada"/><CheckLine done={form.agenda.some(a => a.trim())} label="Agenda incorporada"/><CheckLine done={filledAgreements > 0} label="Acuerdos redactados"/><CheckLine done={evidence.length > 0} label="Evidencias adjuntas"/></div><div className="summary-divider"/><div className="summary-stats"><div><span>Acuerdos</span><strong>{filledAgreements}</strong></div><div><span>Evidencias</span><strong>{evidenceCount}</strong></div><div><span>Agenda</span><strong>{form.agenda.filter(a => a.trim()).length}</strong></div></div></div>
              <div className="panel fixed-rules"><div className="rules-heading"><ShieldCheck size={17}/><strong>Formato protegido</strong></div><ul><li><Check size={14}/> Encabezados y secciones estables</li><li><Check size={14}/> Columnas y bordes constantes</li><li><Check size={14}/> Filas crecen con el contenido</li><li><Check size={14}/> Evidencias al final del Word</li><li><Check size={14}/> No se inventan datos faltantes</li></ul><a href="/ACTA-DE-REUNION-REFERENCIA.docx" download>Ver plantilla de referencia <ArrowRight size={14}/></a></div>
              <div className="panel export-card"><div className="export-icon"><Download size={19}/></div><h3>Documento listo para revisar</h3><p>Genera un Word editable. Revisa los saltos de página, las tablas y las evidencias antes de registrarlo oficialmente.</p><button className="btn-primary export-button" onClick={exportWord} disabled={busy}>{busy ? <LoaderCircle size={16} className="spin"/> : <Download size={16}/>} Descargar Word (.docx)</button><button className="btn-secondary print-button" onClick={exportPrint}><FileText size={16}/> Vista de impresión / PDF</button><button className="start-over" onClick={resetForm}>Empezar otra acta</button></div>
              <div className="mini-note"><BadgeCheck size={16}/><p><strong>Revisión final recomendada</strong><br/>Confirma nombres, fechas, acuerdos, responsables y plazos. La IA facilita la redacción, pero la validación institucional sigue siendo necesaria.</p></div>
            </aside>
          </div>
          <footer className="page-footer"><span>Actas Institucionales</span><span>Plantilla estable · Contenido adaptable · Evidencias anexadas</span></footer>
        </div>} />
      </Routes>
    </main>
  </div>;
}

function Field({ label, hint, icon, children }: { label: string; hint?: string; icon?: ReactNode; children: ReactNode }) { return <label className="field"><span className="field-label">{icon}{label}</span>{children}{hint && <small>{hint}</small>}</label>; }
function CheckLine({ done, label }: { done: boolean; label: string }) { return <div className={`checkline ${done ? 'done' : ''}`}><span className="check-circle">{done ? <Check size={11}/> : null}</span><span>{label}</span><span className="check-state">{done ? 'Listo' : 'Pendiente'}</span></div>; }
function HistoryPage({ history, onNew }: { history: any[]; onNew: () => void }) { return <div className="page-content history-page"><div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line"/> ARCHIVO LOCAL</div><h1>Historial de actas</h1><p>Registros guardados en este navegador. No se sincronizan entre dispositivos.</p></div><button className="btn-primary" onClick={onNew}><Plus size={16}/> Nueva acta</button></div>{history.length ? <div className="panel history-table"><div className="history-table-head"><span>FECHA</span><span>UGEL</span><span>ACTIVIDAD</span><span>ACUERDOS</span><span>REGISTRO</span></div>{history.map(item => <div className="history-row" key={item.id}><div><CalendarDays size={15}/>{formatDate(item.date)}</div><strong>{item.ugel || 'Sin UGEL'}</strong><span>{item.activity}</span><span>{item.agreements}</span><span className="saved-tag"><Check size={13}/> Word generado</span></div>)}</div> : <div className="panel history-empty"><div className="history-empty-icon"><History size={25}/></div><h2>Aún no hay actas registradas</h2><p>Cuando descargues un acta, aparecerá aquí un registro básico de su generación.</p><button className="btn-primary" onClick={onNew}><Plus size={16}/> Crear primera acta</button></div>}</div>; }

export default App;
