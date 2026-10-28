import React, { useState, useRef, useEffect } from 'react';
import type { ModuleKey, UserRole } from '../types';
import './floating-chat.css';
import {
  Bot,
  Sparkles,
  X,
  Send,
  Paperclip,
  Trash2,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Maximize2,
  Minimize2,
  HelpCircle,
  Clock,
  Layers,
  ChevronDown
} from 'lucide-react';

interface FloatingChatAssistantProps {
  activeModule: ModuleKey;
  userRole?: UserRole;
  onApplyTasksFromExcel?: (tasks: any[]) => void;
  notify?: (msg: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  timestamp: string;
  attachment?: {
    name: string;
    size: string;
    type: 'excel' | 'pdf' | 'image' | 'other';
  };
  actions?: Array<{
    label: string;
    actionKey: string;
  }>;
}

const MODULE_CONTEXT_INFO: Record<ModuleKey, { title: string; hint: string; suggestions: string[] }> = {
  cronograma: {
    title: 'Cronograma Gantt Maestro',
    hint: 'Línea de tiempo, hitos de dotación y plazos por UGEL.',
    suggestions: [
      '📊 Analizar cuellos de botella y fechas críticas',
      '📑 Interpretar Excel para proyectar tareas',
      '⚠️ Detectar hitos con retraso en el cronograma'
    ]
  },
  hitos: {
    title: 'Hitos Rectores MINEDU',
    hint: 'Control de cumplimiento normativo y entregables territoriales.',
    suggestions: [
      '🎯 Revisar hitos en riesgo de incumplimiento',
      '📑 Cruzar fechas de corte con Oficio Múltiple',
      '📋 Resumen ejecutivo de entregables'
    ]
  },
  tareas: {
    title: 'Bandeja Operativa de Tareas',
    hint: 'Seguimiento por gestor, tablero kanban y lista de pendientes.',
    suggestions: [
      '✅ Tareas pendientes con mayor prioridad',
      '👤 Distribución de carga por gestor territorial',
      '📅 Tareas que vencen esta semana'
    ]
  },
  reportes: {
    title: 'Reporteador Territorial',
    hint: 'Métricas de avance físico, financiero y distribución regional.',
    suggestions: [
      '📈 Explicar avance ponderado del 67%',
      '📊 Comparativa de cumplimiento entre UGEL',
      '📑 Generar resumen para informe mensual'
    ]
  },
  reuniones: {
    title: 'Reuniones y Traslados',
    hint: 'Agendas territoriales, traslados y mesas de trabajo UGEL.',
    suggestions: [
      '🗓️ Próximas reuniones de coordinación territorial',
      '🚗 Seguimiento de traslados a UGEL distritales',
      '📝 Puntos clave tratados en la última mesa'
    ]
  },
  resumen: {
    title: 'Resumen Ejecutivo del Proyecto',
    hint: 'Visión macro, salud del proyecto y metas MINEDU 2027.',
    suggestions: [
      '📌 Diagnóstico general del proyecto regional',
      '⚡ Principales alertas tempranas activas',
      '🎯 Estado de la dotación de materiales 2027'
    ]
  },
  usuarios: {
    title: 'Equipo y Gestores Regionales',
    hint: 'Directorio de coordinadores y gestores territoriales.',
    suggestions: [
      '👥 Gestores asignados a la región Junín',
      '📞 Datos de contacto de la UGEL Huancayo',
      '📊 Carga operativa por especialista'
    ]
  },
  actas: {
    title: 'Actas y Acuerdos',
    hint: 'Compromisos oficiales suscritos con las autoridades.',
    suggestions: [
      '🤝 Acuerdos pendientes de cumplimiento',
      '📑 Actas firmadas con DRE Junín',
      '⏱️ Acuerdos con fecha límite próxima'
    ]
  },
  configuracion: {
    title: 'Configuración del Proyecto',
    hint: 'Parámetros del sistema, zona horaria y fecha oficial.',
    suggestions: [
      '⚙️ ¿Cómo calibrar la fecha operativa del proyecto?',
      '🌐 Configuración de zona horaria Perú (UTC-5)',
      '🔐 Permisos de roles Coordinador vs Gestor'
    ]
  }
};

export default function FloatingChatAssistant({
  activeModule,
  userRole = 'gestor',
  onApplyTasksFromExcel,
  notify = () => {}
}: FloatingChatAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const contextInfo = MODULE_CONTEXT_INFO[activeModule] || MODULE_CONTEXT_INFO.cronograma;

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `👋 ¡Hola! Soy **Qaway Copilot**, tu asistente inteligente de gestión de proyectos territoriales.\n\nActualmente estoy sincronizado con el módulo **${contextInfo.title}**.\n\nPuedes hacerme consultas estratégicas o **subir un archivo Excel o PDF** para que interprete su estructura preliminar y te ayude a completar el cronograma.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);

  // Actualizar mensaje de saludo al cambiar de módulo si el chat está abierto
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = () => {
    if (!input.trim() && !attachedFile) return;

    const userText = input.trim();
    const currentFile = attachedFile;
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let fileAttachment: ChatMessage['attachment'] = undefined;
    if (currentFile) {
      const ext = currentFile.name.split('.').pop()?.toLowerCase();
      fileAttachment = {
        name: currentFile.name,
        size: `${Math.round(currentFile.size / 1024)} KB`,
        type: ext === 'xlsx' || ext === 'xls' || ext === 'csv' ? 'excel' : ext === 'pdf' ? 'pdf' : 'other'
      };
    }

    const newMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: userText || `Archivo adjunto enviado para análisis: ${currentFile?.name}`,
      timestamp: timeNow,
      attachment: fileAttachment
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput('');
    setAttachedFile(null);
    setIsTyping(true);

    // Simulación de procesamiento de IA contextual
    setTimeout(() => {
      let botResponse = '';
      let actions: ChatMessage['actions'] = undefined;

      if (fileAttachment) {
        if (fileAttachment.type === 'excel') {
          botResponse = `📑 **Análisis de Hoja de Cálculo completado con éxito:**\n\n` +
            `He leído la estructura de **${fileAttachment.name}** (${fileAttachment.size}):\n` +
            `* **Columnas detectadas:** Código, Nombre, Fechas (Inicio / Fin), Avance %, Responsable, Región.\n` +
            `* **Registros identificados:** 5 hitos rectores y 12 subprocesos vinculados a las UGEL de Junín.\n` +
            `* **Rango temporal estimado:** Sep 2026 – Abr 2027.\n` +
            `* **Cumplimiento ponderado inicial:** 58%.\n\n` +
            `💡 *El archivo no requirió OCR porque es un formato estructurado digital nativo.* ¿Deseas proyectar estos datos en el diagrama de Gantt?`;
          actions = [
            { label: '✅ Proyectar datos en el Gantt', actionKey: 'apply-excel' },
            { label: '🔍 Ver tabla resumida de filas', actionKey: 'preview-rows' }
          ];
        } else if (fileAttachment.type === 'pdf') {
          botResponse = `📄 **Análisis de Documento Normativo PDF:**\n\n` +
            `He procesado el archivo **${fileAttachment.name}**:\n` +
            `* **Naturaleza del documento:** Oficio Múltiple / Resolución Directoral de Dotación 2027.\n` +
            `* **Hitos normados extraídos:** 4 entregables obligatorios con fechas de corte en Octubre, Diciembre y Febrero.\n` +
            `* **UGEL impactadas:** Huancayo, Concepción, Chanchamayo, Tarma, Satipo, Yauli (13 UGEL en total).\n\n` +
            `ℹ️ *Nota técnica:* Como el PDF contiene texto digital embebido, la lectura se realizó directamente sin recurrir a OCR de imágenes escaneadas.`;
          actions = [
            { label: '📥 Vincular como sustento oficial', actionKey: 'link-pdf' }
          ];
        }
      } else {
        const lower = userText.toLowerCase();
        if (lower.includes('retraso') || lower.includes('riesgo') || lower.includes('cuello')) {
          botResponse = `⚠️ **Diagnóstico de Retrasos y Cuellos de Botella (Módulo: ${contextInfo.title}):**\n\n` +
            `1. **Subproceso 1.2 (Elaboración y validación del plan de distribución):** Se encuentra al **55%** de avance. Su fecha de corte es el 30 de noviembre; requiere acelerar la validación con la DRE Junín.\n` +
            `2. **Hito 2 (Gestión de Almacenes):** Avance en **42%**. Existe demora en la recepción de actas de la UGEL Satipo por accesibilidad geográfica.\n\n` +
            `🎯 **Recomendación:** Convocar una mesa de trabajo territorial con la Gestora Territorial María Salazar para priorizar las 3 UGEL rezagadas.`;
        } else if (lower.includes('excel') || lower.includes('plantilla') || lower.includes('completar')) {
          botResponse = `📊 **Guía para Carga de Datos desde Excel:**\n\n` +
            `1. Puedes descargar la **Plantilla Oficial de Cronograma** desde el botón superior *Plantilla Excel*.\n` +
            `2. Rellena las columnas requeridas (Código, Nombre, Tipo, Inicio, Fin, Avance, Estado, Responsables).\n` +
            `3. Arrastra el archivo aquí al chat o usa el botón *Importar Cronograma Oficial* para reflejarlo en vivo en las barras del Gantt.`;
        } else if (lower.includes('resumen') || lower.includes('q4') || lower.includes('2026')) {
          botResponse = `📅 **Resumen de Hitos para Q4 2026 (Octubre – Diciembre):**\n\n` +
            `* **Hito 1 (30 Nov 2026):** Planificación de la distribución territorial (Avance actual: 67%).\n` +
            `* **Hito 2 (En curso hasta Ene 2027):** Recepción y almacén territorial en MC SIGA (Avance: 42%).\n` +
            `* **Meta del trimestre:** Cerrar el año con el 85% de actas de comités UGEL debidamente suscritas.`;
        } else {
          botResponse = `Entendido. En el contexto de **${contextInfo.title}**, tu solicitud ha sido registrada.\n\n` +
            `Para el proyecto **Dotación 2027**, recuerda que los datos se sincronizan con las directrices territoriales del MINEDU. ¿Deseas que analice algún archivo específico o genere una sugerencia de optimización?`;
        }
      }

      const botMsg: ChatMessage = {
        id: 'bot-' + Date.now(),
        sender: 'assistant',
        text: botResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 900);
  };

  const handleActionClick = (actionKey: string) => {
    if (actionKey === 'apply-excel') {
      notify('Datos del archivo Excel integrados preliminarmente al cronograma.');
      setMessages((prev) => [
        ...prev,
        {
          id: 'bot-' + Date.now(),
          sender: 'assistant',
          text: '✅ Se han sincronizado las tareas del archivo en el lienzo del cronograma. Puedes revisar las barras actualizadas en el Gantt.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } else if (actionKey === 'link-pdf') {
      notify('Documento normativo vinculado como sustento rector oficial.');
      setMessages((prev) => [
        ...prev,
        {
          id: 'bot-' + Date.now(),
          sender: 'assistant',
          text: '📌 El PDF ha sido registrado como documento de referencia oficial para las 13 UGEL.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } else if (actionKey === 'preview-rows') {
      setMessages((prev) => [
        ...prev,
        {
          id: 'bot-' + Date.now(),
          sender: 'assistant',
          text: `📋 **Vista preliminar de filas leídas:**\n\n` +
            `* \`1.1\` · Conformación de comités UGEL (100% · Completado)\n` +
            `* \`1.2\` · Validación plan de distribución (55% · En proceso)\n` +
            `* \`2.1\` · Directorio de almacenes (100% · Completado)\n` +
            `* \`2.2\` · Recepción en almacén territorial (30% · En proceso)`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
      notify(`Archivo "${file.name}" seleccionado para el chat.`);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        sender: 'assistant',
        text: `Conversación reiniciada. Estoy atento a tus preguntas o archivos sobre **${contextInfo.title}**.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    notify('Historial de chat restablecido.');
  };

  return (
    <>
      {/* Botón Circular Flotante (Floating Action Button) */}
      <button
        type="button"
        className={`qaway-chat-fab ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        title="Abrir Asistente Territorial con IA (Qaway Copilot)"
        aria-label="Asistente Qaway Copilot"
      >
        <span className="fab-online-dot" />
        <div className="fab-icon-wrap">
          <Sparkles size={22} className="fab-icon sparkles" />
          <Bot size={22} className="fab-icon bot" />
        </div>
        <span className="fab-badge">IA</span>
      </button>

      {/* Drawer Lateral del Chat (Slide-Over Panel) */}
      {isOpen && (
        <div className="qaway-chat-overlay" onClick={() => setIsOpen(false)}>
          <aside
            className={`qaway-chat-drawer ${isExpanded ? 'expanded' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera del Chat */}
            <header className="chat-header">
              <div className="chat-avatar-group">
                <div className="chat-avatar">
                  <Bot size={20} />
                  <span className="avatar-pulse-dot" />
                </div>
                <div className="chat-header-info">
                  <div className="chat-title-row">
                    <strong>Qaway Copilot</strong>
                    <span className="ai-tag">IA Territorial</span>
                  </div>
                  <div className="chat-context-pill" title={`Contexto vivo: ${contextInfo.title}`}>
                    <Layers size={11} />
                    <span>{contextInfo.title}</span>
                  </div>
                </div>
              </div>

              <div className="chat-header-actions">
                <button
                  type="button"
                  className="header-action-btn"
                  onClick={() => setIsExpanded((prev) => !prev)}
                  title={isExpanded ? 'Reducir tamaño' : 'Maximizar panel'}
                >
                  {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                </button>
                <button
                  type="button"
                  className="header-action-btn"
                  onClick={clearChat}
                  title="Limpiar conversación"
                >
                  <Trash2 size={15} />
                </button>
                <button
                  type="button"
                  className="header-action-btn close"
                  onClick={() => setIsOpen(false)}
                  title="Cerrar asistente"
                >
                  <X size={17} />
                </button>
              </div>
            </header>

            {/* Banner de Contexto de Módulo Activo */}
            <div className="chat-context-banner">
              <div className="context-banner-text">
                <small>MÓDULO ACTIVO</small>
                <p>{contextInfo.hint}</p>
              </div>
            </div>

            {/* Lista de Mensajes */}
            <div className="chat-messages-container">
              {messages.map((m) => (
                <div key={m.id} className={`chat-message-row ${m.sender}`}>
                  {m.sender === 'assistant' && (
                    <div className="message-avatar">
                      <Bot size={14} />
                    </div>
                  )}

                  <div className="message-bubble">
                    <div className="message-text">
                      {m.text.split('\n\n').map((paragraph, pIdx) => (
                        <p key={pIdx}>
                          {paragraph.split('\n').map((line, lIdx) => (
                            <React.Fragment key={lIdx}>
                              {line.startsWith('* ') ? (
                                <span className="bullet-line">
                                  <span className="bullet-dot" />
                                  {formatMarkdownBold(line.slice(2))}
                                </span>
                              ) : (
                                formatMarkdownBold(line)
                              )}
                              {lIdx < paragraph.split('\n').length - 1 && <br />}
                            </React.Fragment>
                          ))}
                        </p>
                      ))}
                    </div>

                    {/* Tarjeta de Archivo Adjunto dentro del Mensaje */}
                    {m.attachment && (
                      <div className="message-attachment-card">
                        <div className="attachment-icon-box">
                          {m.attachment.type === 'excel' ? (
                            <FileSpreadsheet size={18} className="excel-color" />
                          ) : (
                            <FileText size={18} className="pdf-color" />
                          )}
                        </div>
                        <div className="attachment-meta">
                          <b title={m.attachment.name}>{m.attachment.name}</b>
                          <span>{m.attachment.size} · {m.attachment.type.toUpperCase()}</span>
                        </div>
                      </div>
                    )}

                    {/* Botones de acción rápida ofrecidos por el bot */}
                    {m.actions && m.actions.length > 0 && (
                      <div className="message-actions-bar">
                        {m.actions.map((act) => (
                          <button
                            key={act.actionKey}
                            type="button"
                            className="message-action-btn"
                            onClick={() => handleActionClick(act.actionKey)}
                          >
                            <span>{act.label}</span>
                            <ArrowRight size={12} />
                          </button>
                        ))}
                      </div>
                    )}

                    <span className="message-time">{m.timestamp}</span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="chat-message-row assistant typing">
                  <div className="message-avatar">
                    <Bot size={14} />
                  </div>
                  <div className="message-bubble typing-bubble">
                    <span className="dot" />
                    <span className="dot" />
                    <span className="dot" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Chips de sugerencias contextuales */}
            <div className="chat-suggestions-bar">
              <span className="suggestions-title">Sugerencias rápidas:</span>
              <div className="suggestions-scroll">
                {contextInfo.suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="suggestion-chip"
                    onClick={() => {
                      setInput(s.replace(/^[^\s]+\s/, ''));
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Vista previa de archivo adjunto antes de enviar */}
            {attachedFile && (
              <div className="chat-pending-attachment">
                <div className="pending-file-icon">
                  {attachedFile.name.endsWith('.xlsx') || attachedFile.name.endsWith('.csv') ? (
                    <FileSpreadsheet size={16} />
                  ) : (
                    <FileText size={16} />
                  )}
                </div>
                <div className="pending-file-copy">
                  <span className="pending-name" title={attachedFile.name}>
                    {attachedFile.name}
                  </span>
                  <small>{Math.round(attachedFile.size / 1024)} KB</small>
                </div>
                <button
                  type="button"
                  className="pending-file-remove"
                  onClick={() => setAttachedFile(null)}
                  title="Quitar archivo"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Área de Entrada (Input Bar) */}
            <footer className="chat-input-area">
              <div className="input-box-wrapper">
                <button
                  type="button"
                  className="attach-btn"
                  onClick={() => fileInputRef.current?.click()}
                  title="Adjuntar archivo Excel, PDF o CSV"
                >
                  <Paperclip size={18} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  accept=".xlsx,.xls,.csv,.pdf,.png,.jpg"
                  onChange={handleFileSelect}
                />

                <textarea
                  className="chat-textarea"
                  rows={1}
                  placeholder={`Pregunta sobre ${contextInfo.title} o sube un archivo...`}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />

                <button
                  type="button"
                  className={`send-btn ${input.trim() || attachedFile ? 'ready' : ''}`}
                  onClick={handleSend}
                  disabled={!input.trim() && !attachedFile}
                  title="Enviar mensaje"
                >
                  <Send size={16} />
                </button>
              </div>

              <div className="chat-footer-disclaimer">
                <span>Qaway Copilot · Cumplimiento Ley 31814 de Inteligencia Artificial Responsable</span>
              </div>
            </footer>
          </aside>
        </div>
      )}
    </>
  );
}

// Función auxiliar para parsear **negritas** y `código` en markdown simple
function formatMarkdownBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={index} className="inline-code">{part.slice(1, -1)}</code>;
    }
    return part;
  });
}
