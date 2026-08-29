import React from 'react'
import { X, Sparkles, CheckCircle2 } from 'lucide-react'

export interface HubSpotTemplate {
  id: string
  title: string
  format: string
  description: string
  contentHtml: string
}

interface HubSpotTemplatesModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (template: HubSpotTemplate) => void
}

export const HUBSPOT_TEMPLATES: HubSpotTemplate[] = [
  {
    id: 'listicle',
    title: '1. Formato Lista (Listicle / Mejores Prácticas)',
    format: 'Estructura Lista (Diapositiva 1)',
    description:
      'Estructura: Introducción con gancho → Subtítulo principal de contexto → 5 Puntos clave enumerados → Conclusión sólida con CTA.',
    contentHtml: `
<p>Si sientes que dedicas demasiadas horas a tareas operativas sin ver un crecimiento proporcional en tus resultados, no estás solo. Muchas empresas cometen el error de trabajar más horas en lugar de optimizar sus flujos diarios. En este artículo, reunimos las mejores estrategias comprobadas para transformar tu operativa diaria.</p>

<h2>Las estrategias clave para transformar tu operativa diaria</h2>
<p>Antes de revisar cada punto, ten en cuenta que no necesitas implementar todo a la vez. Elige dos o tres cambios iniciales para ver resultados rápidos en tu equipo. (<em>💡 Tip: Si deseas asesoría personalizada para tu negocio, <a href="https://wa.me/51999999999" target="_blank">puedes consultar con nuestros especialistas aquí</a></em>).</p>

<hr />

<h2>1. Automatiza las respuestas iniciales en tus canales de contacto</h2>
<p>El 70% de las consultas de clientes son preguntas frecuentes sobre precios, horarios o requisitos. <strong>Configurar respuestas automáticas en WhatsApp te permite atender en segundos</strong> sin sobrecargar a tu equipo humano.</p>

<h2>2. Centraliza la información de tus prospectos en un solo lugar</h2>
<p>Tener datos dispersos en hojas de cálculo o chats individuales genera pérdidas constantes de oportunidades. Un sistema ordenado permite que cualquier asesor retome una conversación en el punto exacto.</p>

<h2>3. Califica a tus clientes potenciales antes de agendar reuniones</h2>
<p>No todos los contactos están listos para comprar de inmediato. Implementa preguntas filtro breves para priorizar el tiempo de tu equipo en los prospectos con mayor intención de compra.</p>

<h2>4. Estandariza tus propuestas y documentos comerciales</h2>
<p>Crear cada cotización desde cero es una fuga constante de tiempo. Desarrolla plantillas modulares prediseñadas que solo requieran personalizar datos clave antes de enviar.</p>

<h2>5. Mide el tiempo de respuesta y la tasa de conversión semanalmente</h2>
<p>Lo que no se mide no se puede optimizar. Monitorea cada semana cuántos contactos entraron y cuántos se convirtieron en clientes reales para ajustar tu estrategia.</p>

<hr />

<h2>Conclusión: Da el primer paso hoy mismo</h2>
<p>Optimizar la operativa de tu negocio no requiere meses de desarrollo, sino empezar con pequeños cambios consistentes que liberen tiempo para lo más importante: hacer crecer tu empresa.</p>

<div class="my-8 p-6 rounded-2xl bg-[#18181b] text-white border border-line/20 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
  <div class="space-y-1">
    <h3 class="font-bold text-lg text-white">¿Quieres optimizar estos procesos en tu empresa?</h3>
    <p class="text-xs text-zinc-300">En Qaway Lab diseñamos e integramos soluciones digitales a medida para tu negocio.</p>
  </div>
  <a href="https://wa.me/51999999999" target="_blank" class="bg-[#ff4b0b] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md no-underline">
    Hablar con un Asesor →
  </a>
</div>
    `,
  },
  {
    id: 'how-to',
    title: '2. Formato Instrucciones (How-To / Guía de Proceso)',
    format: 'Estructura Instrucciones (Diapositiva 2)',
    description:
      'Estructura: Introducción → Subtítulo sobre la importancia del contenido → Pasos de instrucciones del 1 al 5 → Conclusión y CTA.',
    contentHtml: `
<p>Configurar una automatización de prospección suele parecer una tarea técnica reservada para programadores. Sin embargo, con las herramientas actuales y un método claro, cualquier equipo puede poner en marcha un flujo eficiente en cuestión de horas.</p>

<h2>Por qué es fundamental automatizar tu proceso de captación</h2>
<p>Cuando un cliente potencial muestra interés en tu servicio, los primeros 5 minutos son decisivos. Si tardas horas en responder, la probabilidad de venta cae drásticamente. A continuación, te mostramos cómo implementar este flujo paso a paso.</p>

<hr />

<h2>1. Define el objetivo exacto del flujo</h2>
<p>Antes de conectar herramientas, define en una sola frase qué acción concreta esperas del usuario: ¿descargar una guía, agendar una llamada o solicitar una cotización directa?</p>

<h2>2. Diseña los mensajes y el tono de respuesta</h2>
<p>Redacta mensajes breves, cálidos y directos. <strong>Tutea a tu interlocutor y evita párrafos largos</strong> para que la lectura en pantallas móviles sea cómoda y natural.</p>

<h2>3. Conecta tu canal de mensajería con tu base de datos</h2>
<p>Integra tu número de WhatsApp o formulario web con tu sistema central para que cada nuevo contacto quede registrado automáticamente con su nombre y fecha.</p>

<h2>4. Realiza pruebas piloto con tu propio equipo</h2>
<p>Envía mensajes de prueba simulando diferentes respuestas de clientes para verificar que todas las ramificaciones y enlaces funcionen sin errores antes del lanzamiento.</p>

<h2>5. Publica y monitorea los primeros resultados</h2>
<p>Activa el flujo con tráfico real y revisa las primeras 50 interacciones para identificar posibles dudas comunes que puedas incorporar al mensaje de bienvenida.</p>

<hr />

<h2>Conclusión: Un sistema que trabaja por ti</h2>
<p>Una vez activo, este proceso funcionará las 24 horas del día, asegurando que ningún cliente quede desatendido mientras tú te enfocas en liderar tu negocio.</p>

<div class="my-8 p-6 rounded-2xl bg-[#18181b] text-white border border-line/20 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
  <div class="space-y-1">
    <h3 class="font-bold text-lg text-white">¿Necesitas ayuda para implementar este flujo?</h3>
    <p class="text-xs text-zinc-300">Agenda una sesión de diagnóstico gratuita con el equipo técnico de Qaway Lab.</p>
  </div>
  <a href="https://wa.me/51999999999" target="_blank" class="bg-[#ff4b0b] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md no-underline">
    Solicitar Diagnóstico →
  </a>
</div>
    `,
  },
]

export default function HubSpotTemplatesModal({
  isOpen,
  onClose,
  onSelectTemplate,
}: HubSpotTemplatesModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div className="bg-white border border-line rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto [scrollbar-width:none]">
        <div className="flex items-center justify-between pb-3 border-b border-line mb-4">
          <h3 className="font-display font-bold text-base text-primary flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            Plantillas de Estructura Oficiales (HubSpot Academy)
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted hover:text-primary hover:bg-surface-muted transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-muted leading-relaxed mb-4">
          Selecciona una plantilla pre-diseñada basada en los 2 esquemas oficiales de HubSpot Academy. Incluye gancho inicial, subtítulos H2 estructurados, CTA de texto y bloque final de conversión.
        </p>

        <div className="space-y-3.5">
          {HUBSPOT_TEMPLATES.map(tmpl => (
            <div
              key={tmpl.id}
              className="p-4 rounded-xl border border-line hover:border-accent/50 bg-[#fafafc] hover:bg-white transition-all space-y-2.5 group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                    {tmpl.format}
                  </span>
                  <h4 className="font-bold text-sm text-primary">{tmpl.title}</h4>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSelectTemplate(tmpl)
                    onClose()
                  }}
                  className="inline-flex items-center gap-1.5 bg-accent hover:bg-accent-dark text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Usar Plantilla</span>
                </button>
              </div>

              <p className="text-xs text-muted leading-relaxed">{tmpl.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
