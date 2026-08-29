import React, { useState } from 'react'
import {
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Target,
  FileText,
  MousePointerClick,
  Link2,
  Type,
  TrendingUp,
  Search,
  ExternalLink,
} from 'lucide-react'

export default function HubSpotGuideSection() {
  const [activeTab, setActiveTab] = useState<'estructura' | 'titulos' | 'keywords' | 'ctas' | 'seo' | 'reglas'>('keywords')

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 font-sans animate-in fade-in duration-150">
      {/* 1. Cabecera de la Sección */}
      <div className="bg-linear-to-r from-[#18181b] to-[#24262e] text-white p-6 sm:p-8 rounded-2xl shadow-lg border border-line/10 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 border border-accent/40 text-accent-light text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" /> Metodología Oficial HubSpot Academy
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight">
            Manual Editorial: Contenido que Atrapa, Posiciona y Convierte
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            Guía práctica y estándares obligatorios para redactar artículos de alta retención, optimización SEO y máxima tasa de conversión en el blog de Qaway Lab.
          </p>
        </div>
      </div>

      {/* 2. Selector de Módulos */}
      <div className="flex bg-surface-muted p-1.5 rounded-xl border border-line overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('estructura')}
          className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'estructura'
              ? 'bg-white text-primary shadow-xs'
              : 'text-muted hover:text-primary'
          }`}
        >
          <FileText className="w-4 h-4 text-accent" />
          <span>1. Estructura</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('titulos')}
          className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'titulos'
              ? 'bg-white text-primary shadow-xs'
              : 'text-muted hover:text-primary'
          }`}
        >
          <Target className="w-4 h-4 text-accent" />
          <span>2. Títulos & CTR</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('keywords')}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'keywords'
              ? 'bg-white text-accent shadow-xs'
              : 'text-muted hover:text-primary'
          }`}
        >
          <Search className="w-4 h-4 text-accent" />
          <span>3. Keywords & Saturación</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ctas')}
          className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'ctas'
              ? 'bg-white text-primary shadow-xs'
              : 'text-muted hover:text-primary'
          }`}
        >
          <MousePointerClick className="w-4 h-4 text-accent" />
          <span>4. Estrategia de CTAs</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('seo')}
          className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'seo'
              ? 'bg-white text-primary shadow-xs'
              : 'text-muted hover:text-primary'
          }`}
        >
          <Link2 className="w-4 h-4 text-accent" />
          <span>5. SEO On-Page</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reglas')}
          className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'reglas'
              ? 'bg-white text-primary shadow-xs'
              : 'text-muted hover:text-primary'
          }`}
        >
          <Type className="w-4 h-4 text-accent" />
          <span>6. 11 Normas de Estilo</span>
        </button>
      </div>

      {/* 3. Contenido de las Pestañas */}

      {/* Módulo 3: Keywords & Saturación (Keyword Stuffing) */}
      {activeTab === 'keywords' && (
        <div className="space-y-6">
          <div className="bg-white border border-line rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <h4 className="font-display font-bold text-lg text-primary flex items-center gap-2">
                <Search className="w-5 h-5 text-accent" />
                Estrategia de Palabras Clave y Prevención de Saturación (HubSpot)
              </h4>
              <span className="text-xs font-mono font-bold bg-accent/10 text-accent px-2.5 py-1 rounded">
                1 Long-Tail Keyword / Post
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-surface-muted border border-line space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-muted">Regla de Oro</span>
                <p className="text-lg font-display font-bold text-primary">1 Palabra Clave de Cola Larga</p>
                <p className="text-xs text-muted leading-relaxed">
                  Céntrate en una frase específica de 3 o más palabras. Resolver una intención de búsqueda concreta posiciona mejor que intentar abarcar varios temas.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-success/5 border border-success/20 space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-success">Densidad Óptima</span>
                <p className="text-lg font-display font-bold text-success">1.0% a 2.5% del texto</p>
                <p className="text-xs text-muted leading-relaxed">
                  En un post de 600 palabras, menciónala entre <strong>4 y 8 veces</strong> de forma natural (Título, introducción, un H2 y conclusión).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-danger/5 border border-danger/20 space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-danger">Peligro: Keyword Stuffing</span>
                <p className="text-lg font-display font-bold text-danger">&gt; 3.0% (Penalización)</p>
                <p className="text-xs text-muted leading-relaxed">
                  Repetir la palabra forzadamente en cada párrafo arruina la lectura y Google penaliza el post enviándolo al final de los resultados.
                </p>
              </div>
            </div>

            {/* Solución de HubSpot: Uso de Sinónimos */}
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
              <h5 className="font-bold text-xs text-amber-700 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Consejo de HubSpot: Usa Sinónimos y Variaciones Semánticas
              </h5>
              <p className="text-xs text-muted leading-relaxed">
                Si tu palabra clave es <em>"nómada digital"</em>, alternarla con <em>"trabajador a distancia"</em>, <em>"teletrabajo"</em> o <em>"empleo remoto"</em>. Así evitas la saturación y amplías tu alcance semántico en Google.
              </p>
            </div>
          </div>

          {/* Herramientas Recomendadas para Investigar Palabras Clave */}
          <div className="bg-white border border-line rounded-xl p-6 shadow-xs space-y-4">
            <h4 className="font-display font-bold text-base text-primary flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              Herramientas Gratuitas de Investigación para el Equipo:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <a
                href="https://trends.google.com/trends/"
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-xl border border-line hover:border-accent bg-[#fafafc] hover:bg-white transition-all space-y-1.5 group block no-underline"
              >
                <div className="flex items-center justify-between text-primary font-bold group-hover:text-accent">
                  <span className="flex items-center gap-1.5">📈 Google Trends</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
                <p className="text-muted leading-relaxed">
                  Compara qué términos busca más tu audiencia en Perú y Latinoamérica en tiempo real.
                </p>
              </a>

              <a
                href="https://answerthepublic.com/"
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-xl border border-line hover:border-accent bg-[#fafafc] hover:bg-white transition-all space-y-1.5 group block no-underline"
              >
                <div className="flex items-center justify-between text-primary font-bold group-hover:text-accent">
                  <span className="flex items-center gap-1.5">💡 AnswerThePublic</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
                <p className="text-muted leading-relaxed">
                  Descubre las preguntas exactas que las personas hacen en Google sobre cualquier tema.
                </p>
              </a>

              <a
                href="https://neilpatel.com/es/ubersuggest/"
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-xl border border-line hover:border-accent bg-[#fafafc] hover:bg-white transition-all space-y-1.5 group block no-underline"
              >
                <div className="flex items-center justify-between text-primary font-bold group-hover:text-accent">
                  <span className="flex items-center gap-1.5">🔍 Ubersuggest</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
                <p className="text-muted leading-relaxed">
                  Obtén volumen de búsquedas mensuales y sugerencias de palabras clave de cola larga.
                </p>
              </a>

              <a
                href="https://ads.google.com/intl/es_419/home/tools/keyword-planner/"
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-xl border border-line hover:border-accent bg-[#fafafc] hover:bg-white transition-all space-y-1.5 group block no-underline"
              >
                <div className="flex items-center justify-between text-primary font-bold group-hover:text-accent">
                  <span className="flex items-center gap-1.5">🎯 Google Keyword Planner</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
                <p className="text-muted leading-relaxed">
                  Datos oficiales del motor de búsqueda de Google con estimaciones de interés comercial.
                </p>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Pestaña 1: Estructura & Esquema */}
      {activeTab === 'estructura' && (
        <div className="space-y-6">
          {/* 1. Las 3 Fases de la Estructura */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-line rounded-xl p-5 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent font-bold flex items-center justify-center text-sm">
                1
              </div>
              <h4 className="font-display font-bold text-base text-primary">Introducción con Gancho</h4>
              <p className="text-xs text-muted leading-relaxed">
                Captura la atención en las primeras 2-3 oraciones usando empatía, humor o una estadística reveladora. Explica cómo el post resolverá un problema real del buyer persona.
              </p>
            </div>

            <div className="bg-white border border-line rounded-xl p-5 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent font-bold flex items-center justify-center text-sm">
                2
              </div>
              <h4 className="font-display font-bold text-base text-primary">Cuerpo con Subtítulos H2/H3</h4>
              <p className="text-xs text-muted leading-relaxed">
                Divide el texto en secciones claras con <strong>H2</strong> y <strong>H3</strong> (nunca uses H1 en el cuerpo). Aprovecha el espacio en blanco con párrafos cortos (2-3 líneas).
              </p>
            </div>

            <div className="bg-white border border-line rounded-xl p-5 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent font-bold flex items-center justify-center text-sm">
                3
              </div>
              <h4 className="font-display font-bold text-base text-primary">Conclusión & Próximo Paso</h4>
              <p className="text-xs text-muted leading-relaxed">
                Resume el aprendizaje clave y ofrece una llamada a la acción clara (CTA final hacia WhatsApp, un recurso descargable o un formulario de contacto).
              </p>
            </div>
          </div>

          {/* 2. Metodología de la Introducción (Los 4 Ganchos & Workflow) */}
          <div className="bg-white border border-line rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-line">
              <h4 className="font-display font-bold text-base text-primary flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                Los 4 Tipos de Gancho para la Introducción (HubSpot Academy)
              </h4>
              <span className="text-xs font-bold text-accent bg-accent/10 px-2.5 py-1 rounded">
                Primeras 2-3 Frases
              </span>
            </div>

            <p className="text-xs text-muted leading-relaxed">
              Si no logras captar la atención del lector en las primeras frases, abandonará la lectura. HubSpot recomienda iniciar siempre con uno de estos 4 disparadores:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-surface-muted border border-line space-y-1.5">
                <strong className="text-primary font-bold block">🤝 1. Empatía con su dolor</strong>
                <p className="text-muted leading-relaxed">
                  Conecta con una frustración real. <em>"Si sientes que pasas el día respondiendo los mismos mensajes..."</em>
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-muted border border-line space-y-1.5">
                <strong className="text-primary font-bold block">📊 2. Estadística / Dato</strong>
                <p className="text-muted leading-relaxed">
                  Un número contundente. <em>"El 70% de las oportunidades digitales se pierden por responder tarde..."</em>
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-muted border border-line space-y-1.5">
                <strong className="text-primary font-bold block">😄 3. Humor o Anécdota</strong>
                <p className="text-muted leading-relaxed">
                  Una situación cotidiana y cercana con la que el lector se identifique de inmediato.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-muted border border-line space-y-1.5">
                <strong className="text-primary font-bold block">❓ 4. Pregunta Retadora</strong>
                <p className="text-muted leading-relaxed">
                  Desafía una creencia. <em>"¿Realmente necesitas contratar más personal o automatizar tu proceso?"</em>
                </p>
              </div>
            </div>

            {/* Consejo de Flujo de Trabajo (Workflow Secret) */}
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-3">
              <span className="text-lg">💡</span>
              <div className="space-y-0.5 text-xs">
                <strong className="text-amber-800 font-bold block">
                  Regla de Productividad HubSpot: Redacta la Introducción y Conclusión al final
                </strong>
                <p className="text-muted leading-relaxed">
                  Puede ser abrumador escribir la introducción sin saber qué dirección exacta tomará el contenido. Empieza redactando los puntos principales del cuerpo (Paso 1 al 5) y deja la introducción y la conclusión para cuando la estructura ya esté terminada.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-line rounded-xl p-6 shadow-xs space-y-4">
            <h4 className="font-display font-bold text-base text-primary flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              Los 2 Formatos Oficiales Recomendados por HubSpot:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-surface-muted p-4 rounded-xl border border-line space-y-2">
                <span className="font-bold text-primary text-sm block">📋 Formato 1: Lista Estratégica (Listicle)</span>
                <p className="text-muted leading-relaxed">
                  Ideal para presentar herramientas, errores frecuentes o mejores prácticas. Estructura: Introducción → Puntos numerados con negrita selectiva → Recursos visuales → Conclusión.
                </p>
              </div>
              <div className="bg-surface-muted p-4 rounded-xl border border-line space-y-2">
                <span className="font-bold text-primary text-sm block">🛠️ Formato 2: Guía Paso a Paso (How-To)</span>
                <p className="text-muted leading-relaxed">
                  Ideal para tutoriales técnicos, automatizaciones y procesos. Estructura: Contexto del problema → Paso 1 al Paso N con capturas/videos → Resumen de resultados → CTA.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pestaña 2: Títulos & Long-Tail */}
      {activeTab === 'titulos' && (
        <div className="space-y-6">
          <div className="bg-white border border-line rounded-xl p-6 shadow-xs space-y-4">
            <h4 className="font-display font-bold text-lg text-primary flex items-center gap-2">
              <Target className="w-5 h-5 text-accent" />
              Reglas de Oro de HubSpot para Títulos de Alto Rendimiento
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-surface-muted border border-line space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-muted">Longitud Ideal</span>
                <p className="text-xl font-display font-bold text-primary">≤ 60 caracteres</p>
                <p className="text-[11px] text-muted leading-tight">
                  Google muestra los primeros 50-60 caracteres. Mantenerlo debajo de 60 asegura que el 90% se lea completo.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-accent/5 border border-accent/20 space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-accent">Poder de los Corchetes</span>
                <p className="text-xl font-display font-bold text-accent">+38% Clickthrough</p>
                <p className="text-[11px] text-muted leading-tight">
                  Usar corchetes como <code>[Plantilla Gratis]</code> o <code>[Guía 2026]</code> incrementa drásticamente las visitas.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-muted border border-line space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-muted">Palabra Clave Long-Tail</span>
                <p className="text-xl font-display font-bold text-primary">Al inicio del título</p>
                <p className="text-[11px] text-muted leading-tight">
                  Ubica el término de búsqueda al principio para que los lectores y Google identifiquen el tema de inmediato.
                </p>
              </div>
            </div>
          </div>

          {/* Principio HubSpot: Fijar Expectativas en el Título */}
          <div className="bg-white border border-line rounded-xl p-6 shadow-xs space-y-4">
            <div className="space-y-1">
              <h4 className="font-display font-bold text-base text-primary flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                El Principio de Fijar Expectativas Concretas (HubSpot Academy)
              </h4>
              <p className="text-xs text-muted leading-relaxed">
                El lector y los motores de búsqueda deben entender con total claridad qué van a ganar antes de hacer clic. Todo título de alto rendimiento debe responder estas 3 preguntas:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-surface-muted border border-line space-y-1">
                <span className="font-bold text-accent text-sm block">1. Beneficio Claro</span>
                <p className="text-muted leading-relaxed">
                  ¿Qué problema específico le resolverás al lector? (Ej: Aprender a automatizar WhatsApp o prospección B2B).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-muted border border-line space-y-1">
                <span className="font-bold text-accent text-sm block">2. Tiempo o Esfuerzo</span>
                <p className="text-muted leading-relaxed">
                  ¿Cuánto le tomará aplicarlo? Delimita el esfuerzo (Ej: <em>"en 15 minutos"</em>, <em>"en 1 hora"</em> o <em>"Paso a Paso"</em>).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-muted border border-line space-y-1">
                <span className="font-bold text-accent text-sm block">3. Formato / Recurso</span>
                <p className="text-muted leading-relaxed">
                  ¿Qué recurso o descargable se lleva? Agrégalo entre corchetes <code>[Plantilla Gratis]</code>, <code>[Guía 2026]</code> o <code>[Checklist]</code> (+38% CTR).
                </p>
              </div>
            </div>
          </div>

          {/* Ejemplos Prácticos */}
          <div className="bg-white border border-line rounded-xl p-6 shadow-xs space-y-3">
            <h4 className="font-bold text-sm text-primary">Ejemplos Reales del Manual de HubSpot:</h4>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-lg bg-danger/5 border border-danger/20 flex items-start gap-2">
                <span className="text-danger font-bold text-sm">✕</span>
                <div>
                  <strong className="text-danger">Título Débil / Vago:</strong> "Diseño de infografías"
                  <p className="text-muted text-[11px]">No fija expectativas ni explica qué aprenderá ni qué se llevará el lector.</p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-success/5 border border-success/20 flex items-start gap-2">
                <span className="text-success font-bold text-sm">✓</span>
                <div>
                  <strong className="text-success">Título que Fija Expectativas (HubSpot):</strong> "Cómo crear una infografía en 1 hora [15 Plantillas Gratis]"
                  <p className="text-muted text-[11px]">El lector ya sabe el tema (infografía), el tiempo (1 hora) y el recurso que se lleva ([15 Plantillas Gratis]).</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pestaña 4: Estrategia de CTAs */}
      {activeTab === 'ctas' && (
        <div className="space-y-6">
          <div className="bg-white border border-line rounded-xl p-6 shadow-xs space-y-4">
            <h4 className="font-display font-bold text-lg text-primary flex items-center gap-2">
              <MousePointerClick className="w-5 h-5 text-accent" />
              Los 4 Puntos Estratégicos para Llamados a la Acción (CTAs)
            </h4>
            <p className="text-xs text-muted leading-relaxed">
              HubSpot descubrió que <strong>los CTAs de texto ubicados en la parte superior tienen la tasa de clics más alta</strong> porque muchos usuarios no leen el 100% del post.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-surface-muted border border-line space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-accent text-white font-bold text-xs flex items-center justify-center">1</span>
                  <h5 className="font-bold text-xs sm:text-sm text-primary">CTA Pasivo (Tras primeros párrafos)</h5>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  Hipervínculo sutil en el texto para enlazar a una página pilar o servicio sin interrumpir la lectura.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-muted border border-line space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-accent text-white font-bold text-xs flex items-center justify-center">2</span>
                  <h5 className="font-bold text-xs sm:text-sm text-primary">CTA de Contenido Clave</h5>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  Ubicado justo después de haber entregado el mayor valor educativo del artículo.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-muted border border-line space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-accent text-white font-bold text-xs flex items-center justify-center">3</span>
                  <h5 className="font-bold text-xs sm:text-sm text-primary">CTA Visual al Cierre del Post</h5>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  Caja destacada con botón de acción (ej: Cotizar proyecto, Hablar con un Asesor).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-muted border border-line space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-accent text-white font-bold text-xs flex items-center justify-center">4</span>
                  <h5 className="font-bold text-xs sm:text-sm text-primary">Slide-in / Chatbot</h5>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  Widget de contacto o asistente interactivo cuando el lector llega a la mitad del artículo.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pestaña 5: SEO On-Page */}
      {activeTab === 'seo' && (
        <div className="space-y-6">
          <div className="bg-white border border-line rounded-xl p-6 shadow-xs space-y-4">
            <h4 className="font-display font-bold text-lg text-primary flex items-center gap-2">
              <Link2 className="w-5 h-5 text-accent" />
              Checklist Técnico de Optimización On-Page
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                <strong className="text-amber-600 font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Regla Crítica: URLs Sin Números
                </strong>
                <p className="text-muted leading-relaxed">
                  Si tu post se titula <em>"15 Estrategias de Ventas"</em>, la URL debe ser <code>/blog/estrategias-de-ventas</code>. Si en el futuro agregas 2 puntos más a la lista, no tendrás que cambiar la URL ni crear redireccionamientos 301 que afecten tu SEO.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-muted border border-line space-y-2">
                <strong className="text-primary font-bold flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-accent" /> Metadescripción (150-160 caracteres)
                </strong>
                <p className="text-muted leading-relaxed">
                  Debe responder a la intención de búsqueda, incluir la palabra clave principal y tener un gancho atractivo para maximizar el porcentaje de clics en Google.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-muted border border-line space-y-2">
                <strong className="text-primary font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-success" /> Texto Alt en Imágenes
                </strong>
                <p className="text-muted leading-relaxed">
                  Los buscadores leen el atributo Alt para clasificar imágenes en Google Images. Describe la foto usando variaciones naturales de tu palabra clave.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-muted border border-line space-y-2">
                <strong className="text-primary font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-success" /> Enlaces Externos en Nueva Ventana
                </strong>
                <p className="text-muted leading-relaxed">
                  Todo enlace a fuentes o herramientas externas debe abrirse con <code>target="_blank"</code> para no sacar al usuario de la web de Qaway Lab.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pestaña 6: Las 11 Normas de Redacción */}
      {activeTab === 'reglas' && (
        <div className="bg-white border border-line rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-line">
            <h4 className="font-display font-bold text-lg text-primary flex items-center gap-2">
              <Type className="w-5 h-5 text-accent" />
              Las 11 Normas Gramaticales y de Estilo (HubSpot Academy)
            </h4>
            <span className="text-xs font-mono font-bold bg-surface-muted text-muted px-2.5 py-1 rounded border border-line">
              Guía de Estilo Oficial
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
            <div className="p-3.5 rounded-xl bg-surface-muted border border-line space-y-1">
              <span className="font-bold text-accent">1. Tutea al lector</span>
              <p className="text-muted">Usa "tú" en lugar de "usted". Da cercanía y empatía sin perder profesionalismo.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-muted border border-line space-y-1">
              <span className="font-bold text-accent">2. Lenguaje sencillo</span>
              <p className="text-muted">Evita palabras rimbombantes. El texto simple genera mayor credibilidad.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-muted border border-line space-y-1">
              <span className="font-bold text-accent">3. Utiliza la voz activa</span>
              <p className="text-muted"><em>"El bot responde mensajes"</em> en lugar de <em>"Los mensajes son respondidos por..."</em>.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-muted border border-line space-y-1">
              <span className="font-bold text-accent">4. Sé claro y conciso</span>
              <p className="text-muted">Elimina palabras innecesarias y detalles redundantes. Menos es más.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-muted border border-line space-y-1">
              <span className="font-bold text-accent">5. Párrafos cortos</span>
              <p className="text-muted">Párrafos de máximo 2 a 3 oraciones para crear espacio en blanco y ritmo.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-muted border border-line space-y-1">
              <span className="font-bold text-accent">6. Evita oraciones cargadas</span>
              <p className="text-muted">Evita adverbios vacíos como "muy", "realmente", "absolutamente", "totalmente".</p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-muted border border-line space-y-1">
              <span className="font-bold text-accent">7. Sigue la guía de estilo</span>
              <p className="text-muted">Mantén coherencia en mayúsculas, términos de la industria y tono de marca.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-muted border border-line space-y-1">
              <span className="font-bold text-accent">8. Háblale directo al lector</span>
              <p className="text-muted">Escribe como si le hablaras a tu cliente favorito en una conversación personal.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-muted border border-line space-y-1">
              <span className="font-bold text-accent">9. Evita tecnicismos sin explicar</span>
              <p className="text-muted">Define los acrónimos la primera vez que los uses (ej: CRM, API, SEO).</p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-muted border border-line space-y-1">
              <span className="font-bold text-accent">10. No uses sarcasmo</span>
              <p className="text-muted">Demuestra empatía, seguridad y directriz constructiva en todo momento.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-muted border border-line space-y-1">
              <span className="font-bold text-accent">11. Revisa ortografía y estilo</span>
              <p className="text-muted">Revisa dos veces antes de publicar para proteger la credibilidad de Qaway Lab.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-accent/5 border border-accent/20 space-y-1">
              <span className="font-bold text-accent">💡 Regla de Negritas</span>
              <p className="text-muted">Destaca solo 1 oración en negrita por párrafo o cada 2-3 párrafos.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
