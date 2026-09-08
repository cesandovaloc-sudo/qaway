import { useState } from "react";
import {
  X,
  Sparkles,
  Kanban,
  Layers,
  Compass,
  CheckCircle2,
  ArrowRight,
  Palette,
  Building2,
  Briefcase,
  Check
} from "lucide-react";
import {
  MANAGEMENT_FRAMEWORKS,
  NICHE_PRESETS,
  DESIGN_ARCHETYPES
} from "../../data/frameworks-templates-data";

export function CreateProjectWizardModal({ isOpen, onClose, onProjectCreated }) {
  const [step, setStep] = useState(1); // 1: Datos & Nicho, 2: Metodología, 3: Arquetipo Visual
  const [projectName, setProjectName] = useState("");
  const [clientName, setClientName] = useState("");
  const [selectedFrameworkId, setSelectedFrameworkId] = useState("agile-scrum");
  const [selectedArchetypeId, setSelectedArchetypeId] = useState("executive-contrast");
  const [selectedNicheId, setSelectedNicheId] = useState("");
  const [budget, setBudget] = useState("S/ 3,500");

  if (!isOpen) return null;

  const handleSelectNiche = (niche) => {
    setSelectedNicheId(niche.id);
    setSelectedFrameworkId(niche.frameworkId);
    setSelectedArchetypeId(niche.designArchetype);
    if (!projectName) setProjectName(`${niche.name} - Demo`);
    if (!clientName) setClientName("Cliente Piloto");
  };

  const handleFinish = (e) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    const framework = MANAGEMENT_FRAMEWORKS.find(f => f.id === selectedFrameworkId) || MANAGEMENT_FRAMEWORKS[0];
    const archetype = DESIGN_ARCHETYPES.find(a => a.id === selectedArchetypeId) || DESIGN_ARCHETYPES[0];
    const niche = NICHE_PRESETS.find(n => n.id === selectedNicheId);

    const newProject = {
      id: `proj-${Date.now()}`,
      key: `QW-${(projectName.substring(0, 3)).toUpperCase()}`,
      name: projectName.trim(),
      slug: projectName.toLowerCase().replace(/\s+/g, "-"),
      client: clientName.trim() || "Cliente Qaway",
      frameworkId: framework.id,
      frameworkName: framework.name,
      frameworkColor: framework.color,
      archetypeId: archetype.id,
      archetypeName: archetype.name,
      budget: budget,
      kpis: niche?.kpis || [
        { label: "Tareas Totales", value: `${framework.defaultItems.length}`, sub: "En curso", change: "Activo" },
        { label: "Progreso Sprint", value: "35%", sub: "Semana 1", change: "+15%" },
        { label: "Equipo Asignado", value: "3 pers.", sub: "Full-time", change: "Óptimo" },
        { label: "Salud del Proyecto", value: "100%", sub: "Sin bloqueos", change: "Verde" }
      ],
      workItems: framework.defaultItems.map(item => ({
        ...item,
        id: `${(projectName.substring(0, 3)).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
        projectId: `proj-${Date.now()}`
      }))
    };

    onProjectCreated(newProject);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm select-none animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Cabecera con Stepper */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-zinc-900">
                Generador Maestro de Proyectos
              </h2>
              <p className="text-[11px] text-zinc-500">
                Paso {step} de 3: {step === 1 ? "Identidad & Nicho" : step === 2 ? "Framework de Gestión" : "Arquetipo de Diseño"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de progreso */}
        <div className="h-1 w-full bg-zinc-100">
          <div
            className="h-full bg-orange-500 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Contenido según el paso */}
        <div className="p-6 space-y-5">
          {step === 1 && (
            <div className="space-y-4">
              {/* Presets de Nicho Rápido */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                  Plantillas Rápidas por Nicho (Opcional)
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {NICHE_PRESETS.map((niche) => (
                    <button
                      key={niche.id}
                      type="button"
                      onClick={() => handleSelectNiche(niche)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedNicheId === niche.id
                          ? "border-orange-500 bg-orange-50/50 ring-2 ring-orange-500/20"
                          : "border-zinc-200 hover:border-zinc-300 bg-zinc-50/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Building2 className={`w-4 h-4 ${selectedNicheId === niche.id ? "text-orange-600" : "text-zinc-500"}`} />
                        {selectedNicheId === niche.id && <Check className="w-3.5 h-3.5 text-orange-600" />}
                      </div>
                      <span className="text-xs font-bold text-zinc-800 block truncate">{niche.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Formulario de nombre y cliente */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider block mb-1">
                    Nombre del Proyecto *
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Ej. Barbería Elite SAC / Clínica Dental San Lucas"
                    required
                    className="w-full text-xs p-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-zinc-500 focus:outline-none transition-all font-medium placeholder:text-zinc-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider block mb-1">
                      Cliente / Organización
                    </label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Ej. Juan Pérez"
                      className="w-full text-xs p-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-zinc-500 focus:outline-none transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider block mb-1">
                      Presupuesto / Fee Estimado
                    </label>
                    <input
                      type="text"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-zinc-500 focus:outline-none transition-all font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                Selecciona la Metodología / Framework de Gestión
              </label>
              <div className="grid grid-cols-2 gap-3">
                {MANAGEMENT_FRAMEWORKS.map((fw) => (
                  <button
                    key={fw.id}
                    type="button"
                    onClick={() => setSelectedFrameworkId(fw.id)}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      selectedFrameworkId === fw.id
                        ? "border-orange-500 bg-orange-50/40 ring-2 ring-orange-500/20"
                        : "border-zinc-200 hover:border-zinc-300 bg-white"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${fw.bgTone}`}>
                          {fw.badge}
                        </span>
                        {selectedFrameworkId === fw.id && <Check className="w-4 h-4 text-orange-600" />}
                      </div>
                      <h3 className="text-xs font-bold text-zinc-900 mb-1">{fw.name}</h3>
                      <p className="text-[11px] text-zinc-500 leading-relaxed">{fw.description}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-zinc-100 flex items-center gap-1.5 flex-wrap">
                      {fw.columns.slice(0, 3).map(c => (
                        <span key={c.id} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600">
                          {c.label}
                        </span>
                      ))}
                      {fw.columns.length > 3 && <span className="text-[9px] text-zinc-400">+{fw.columns.length - 3}</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                Selecciona el Arquetipo de Diseño (Skin & Layout)
              </label>
              <div className="space-y-2">
                {DESIGN_ARCHETYPES.map((arch) => (
                  <button
                    key={arch.id}
                    type="button"
                    onClick={() => setSelectedArchetypeId(arch.id)}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      selectedArchetypeId === arch.id
                        ? "border-orange-500 bg-orange-50/40 ring-2 ring-orange-500/20"
                        : "border-zinc-200 hover:border-zinc-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${arch.sidebarBg}`}>
                        <Palette className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-bold text-zinc-900">{arch.name}</h3>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 bg-zinc-100 text-zinc-700 rounded">
                            {arch.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-0.5">{arch.description}</p>
                      </div>
                    </div>

                    {selectedArchetypeId === arch.id && (
                      <Check className="w-4 h-4 text-orange-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer con controles */}
        <div className="px-6 py-4 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 rounded-xl hover:bg-zinc-200 transition-colors cursor-pointer"
            >
              ← Anterior
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              disabled={!projectName.trim()}
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              Siguiente →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Generar Proyecto y Estructura
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
