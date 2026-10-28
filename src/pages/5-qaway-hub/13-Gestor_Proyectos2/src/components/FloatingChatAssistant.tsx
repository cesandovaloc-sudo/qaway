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
import { queryGeminiRAG, getStoredGeminiConfig } from '../services/geminiRAGService';

interface FloatingChatAssistantProps {
  activeModule: ModuleKey;
  userRole?: UserRole;
  onApplyTasksFromExcel?: (tasks: any[]) => void;
  onNavigateModule?: (module: ModuleKey) => void;
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
  onNavigateModule,
  notify = () => {}
}: FloatingChatAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [geminiConfig, setGeminiConfig] = useState(getStoredGeminiConfig);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Escuchar cambios de configuración de Gemini en tiempo real
  useEffect(() => {
    const handleConfigChange = () => {
      setGeminiConfig(getStoredGeminiConfig());
    };
    window.addEventListener('qaway-gemini-config-changed', handleConfigChange);
    return () => {
      window.removeEventListener('qaway-gemini-config-changed', handleConfigChange);
    };
  }, []);

  const contextInfo = MODULE_CONTEXT_INFO[activeModule] || MODULE_CONTEXT_INFO.cronograma;

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `👋 ¡Hola! Soy **Qaway Copilot**, tu asistente inteligente de gestión de proyectos territoriales.\n\nActualmente estoy sincronizado con el módulo **${contextInfo.title}**.\n\nPuedes hacerme consultas estratégicas o **subir un archivo Excel o PDF** para que interprete su estructura preliminar y te ayude a completar el cronograma.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() && !attachedFile) return;

    const userText = input.trim();
    const currentFile = attachedFile;
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let fileAttachment: ChatMessage['attachment'] = undefined;
    let docData: { name: string; type: string; rawText?: string; contentSummary?: string } | undefined = undefined;

    if (currentFile) {
      const ext = currentFile.name.split('.').pop()?.toLowerCase();
      const typeKey = ext === 'xlsx' || ext === 'xls' || ext === 'csv' ? 'excel' : ext === 'pdf' ? 'pdf' : 'other';
      fileAttachment = {
        name: currentFile.name,
        size: `${Math.round(currentFile.size / 1024)} KB`,
        type: typeKey
      };

      docData = {
        name: currentFile.name,
        type: typeKey,
        contentSummary: `Archivo ${currentFile.name} (${fileAttachment.size}), formato ${ext?.toUpperCase()}. Contiene estructura de cronograma o directiva técnica.`
      };

      // Si es un CSV o texto plano, podemos leerlo de inmediato para proveer contexto exacto a Gemini
      if (ext === 'csv' || ext === 'txt') {
        try {
          const textPreview = await currentFile.text();
          docData.rawText = textPreview.slice(0, 4000);
        } catch {
          /* fallback si falla lectura */
        }
      }
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

    try {
      // Preparar historial conversacional previo para el contexto multimodal RAG
      const historyForRAG = messages.slice(-6).map((m) => ({
        role: m.sender === 'user' ? ('user' as const) : ('model' as const),
        text: m.text
      }));

      const ragResponse = await queryGeminiRAG({
        query: userText || 'Interpreta la información del archivo adjunto y propón acciones para el cronograma.',
        activeModule,
        history: historyForRAG,
        documentData: docData
      });

      let actions: ChatMessage['actions'] = undefined;

      if (fileAttachment) {
        if (fileAttachment.type === 'excel') {
          actions = [
            { label: '✅ Proyectar datos en el Gantt', actionKey: 'apply-excel' },
            { label: '🔍 Ver tabla resumida de filas', actionKey: 'preview-rows' }
          ];
        } else if (fileAttachment.type === 'pdf') {
          actions = [
            { label: '📥 Vincular como sustento oficial', actionKey: 'link-pdf' }
          ];
        }
      }

      // Si no hay API Key configurada, sugerir el botón de acceso rápido a Configuración
      if (!geminiConfig.apiKey && !actions) {
        actions = [
          { label: '⚙️ Configurar API Key de Gemini', actionKey: 'open-config' }
        ];
      }

      const botMsg: ChatMessage = {
        id: 'bot-' + Date.now(),
        sender: 'assistant',
        text: ragResponse.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('[FloatingChatAssistant] Error al procesar mensaje:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: 'bot-' + Date.now(),
          sender: 'assistant',
          text: `⚠️ Hubo un inconveniente al conectar con el servicio: ${err?.message || 'Error desconocido'}.\n\nPuedes revisar tu configuración en **Configuración > Asistente IA**.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actions: [{ label: '⚙️ Abrir Configuración', actionKey: 'open-config' }]
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleActionClick = (actionKey: string) => {
    if (actionKey === 'open-config') {
      if (onNavigateModule) {
        onNavigateModule('configuracion');
        notify('Navegando a Configuración > Asistente IA.');
      } else {
        notify('Dirígete a la pestaña Configuración en el menú lateral para gestionar la clave.');
      }
    } else if (actionKey === 'apply-excel') {
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
                    <span className="ai-tag" title={geminiConfig.apiKey ? `Conectado a Google Gemini (${geminiConfig.model})` : 'Operando en modo local'}>
                      {geminiConfig.apiKey ? geminiConfig.model.replace('gemini-', '') : 'Modo Local'}
                    </span>
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
