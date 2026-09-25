import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  User, Mail, Shield, Building2, CalendarDays, Camera, Upload, Trash2,
  Save, Lock, Clock3, Globe2, CircleHelp, ChevronRight, CheckCircle2,
  Info, Activity, LogIn, ImagePlus
} from "lucide-react";

/**
 * HubProfilePanel
 * Panel "Mi cuenta / Mi perfil" para acoplar al Hub de Qaway Lab.
 *
 * UI preparada siguiendo el mismo lenguaje visual de HubSuperSupportPanel:
 * fondo #f8f9fb, cards blancas, bordes suaves, layout horizontal,
 * sidebar externo del Hub y acento Qaway #ff4b0b.
 *
 * La persistencia real queda preparada mediante callbacks:
 * onSaveProfile, onUploadAvatar, onDeleteAvatar.
 * No ejecuta Supabase directamente.
 */

const DEFAULT_PROFILE = {
  fullName: "Carlos Sandoval",
  email: "carlos.sandoval@qawaylab.com",
  roleLabel: "Super Administrador",
  tenantName: "Qaway Lab (Global)",
  memberSince: "12 Ene 2026",
  avatarUrl: "",
  timezone: "(GMT-05:00) Lima - Perú",
  language: "Español",
};

const DEFAULT_ACTIVITY = [
  ["Datos de perfil actualizados", "Información personal modificada", "hace 2 horas", "blue", <User size={13} />],
  ["Inicio de sesión", "Lima, Perú · Chrome", "hace 5 horas", "green", <LogIn size={13} />],
  ["Foto de perfil actualizada", "Avatar de cuenta", "hace 2 días", "purple", <Camera size={13} />],
  ["Cambio de contraseña", "Seguridad de la cuenta", "hace 12 días", "red", <Lock size={13} />],
];

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Avatar({ src, name, large = false }) {
  const initials = useMemo(
    () => (name || "U").trim().split(/\s+/).slice(0, 2).map((x) => x[0]).join("").toUpperCase(),
    [name]
  );

  return (
    <div className={cn(
      "flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-100 font-bold text-gray-600",
      large ? "h-[118px] w-[118px] text-[28px]" : "h-10 w-10 text-[13px]"
    )}>
      {src ? <img src={src} alt={`Foto de perfil de ${name || "usuario"}`} className="h-full w-full object-cover" /> : initials}
    </div>
  );
}

function SectionCard({ title, description, children, className = "" }) {
  return (
    <section className={cn("rounded-xl border border-gray-200 bg-white p-5", className)}>
      <div className="mb-4">
        <h2 className="text-sm font-bold text-zinc-950">{title}</h2>
        {description && <p className="mt-1 text-[11px] leading-4 text-gray-500">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function ActivityIcon({ tone, children }) {
  return (
    <div className={cn(
      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
      tone === "blue" && "bg-blue-50 text-blue-500",
      tone === "green" && "bg-emerald-50 text-emerald-500",
      tone === "purple" && "bg-purple-50 text-purple-500",
      tone === "red" && "bg-red-50 text-red-500"
    )}>
      {children}
    </div>
  );
}

function ActionRow({ icon, label, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-gray-50">
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-50 text-gray-500">{icon}</span>
      <span className="flex-1 text-[11px] font-semibold text-gray-700">{label}</span>
      <ChevronRight size={14} className="text-gray-300 group-hover:translate-x-0.5" />
    </button>
  );
}

function SeguridadSection({ onOpenSecurity }) {
  return (
    <SectionCard
      title="Seguridad"
      description="Mantén tu cuenta protegida. Estas opciones se conectarán al sistema de autenticación de la plataforma."
    >
      <div className="space-y-3">
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500"><Lock size={16} /></span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-gray-800">Contraseña</p>
            <p className="mt-0.5 text-[10px] text-gray-500">Cambiar la contraseña de acceso a tu cuenta.</p>
          </div>
          <button type="button" onClick={onOpenSecurity}
            className="flex h-8 shrink-0 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-[10px] font-semibold text-gray-700 transition-colors hover:bg-gray-50">
            Administrar <ChevronRight size={13} className="text-gray-300" />
          </button>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500"><Shield size={16} /></span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-gray-800">Verificación en dos pasos (2FA)</p>
            <p className="mt-0.5 text-[10px] text-gray-500">Añade una capa extra de seguridad al iniciar sesión.</p>
          </div>
          <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-[9px] font-semibold text-gray-500">Próximamente</span>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500"><LogIn size={16} /></span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-gray-800">Sesiones activas</p>
            <p className="mt-0.5 text-[10px] text-gray-500">Dispositivos y sesiones donde tu cuenta está iniciada.</p>
          </div>
          <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-[9px] font-semibold text-gray-500">Próximamente</span>
        </div>

        <div className="flex gap-3 rounded-lg border border-blue-100 bg-blue-50/60 p-3">
          <Info size={15} className="mt-0.5 shrink-0 text-blue-500" />
          <p className="text-[10px] leading-4 text-gray-600">
            La contraseña, la verificación y las sesiones se gestionan desde el sistema de autenticación (Supabase Auth), coordinado
            con el backend de Qaway. Estas secciones se habilitarán al conectar ese flujo.
          </p>
        </div>
      </div>
    </SectionCard>
  );
}

export default function HubProfilePanel({
  profile = DEFAULT_PROFILE,
  activity = DEFAULT_ACTIVITY,
  onSaveProfile,
  onUploadAvatar,
  onDeleteAvatar,
  onOpenSecurity,
  onOpenActivity,
  onOpenHelp,
}) {
  const fileInputRef = useRef(null);
  const data = { ...DEFAULT_PROFILE, ...profile };

  const [fullName, setFullName] = useState(data.fullName);
  const [roleLabel, setRoleLabel] = useState(data.roleLabel);
  const [timezone, setTimezone] = useState(data.timezone);
  const [language, setLanguage] = useState(data.language);
  const [avatarUrl, setAvatarUrl] = useState(data.avatarUrl || "");
  const [section, setSection] = useState("cuenta");
  const [selectedFile, setSelectedFile] = useState(null);
  const [savingAll, setSavingAll] = useState(false);
  const [savedAll, setSavedAll] = useState(false);

  useEffect(() => {
    setFullName(data.fullName);
    setRoleLabel(data.roleLabel);
    setTimezone(data.timezone);
    setLanguage(data.language);
    setAvatarUrl(data.avatarUrl || "");
    // Sin data.avatarUrl en deps a propósito: la subida de foto actualiza el prop avatarUrl
    // y NO debe resetear el nombre/cargo que el usuario esté editando.
  }, [data.fullName, data.roleLabel, data.timezone, data.language]);

  // Sincronización exclusiva de la foto: refleja el avatar real (Storage) sin resetear
  // el formulario de identidad. Al terminar la subida reemplaza el preview dataURL
  // por la URL canónica; al eliminar, limpia el estado.
  useEffect(() => {
    setAvatarUrl(data.avatarUrl || "");
  }, [data.avatarUrl]);

  // La foto SOLO previsualiza al seleccionarla (dataURL local). Se persiste al pulsar
  // "Guardar cambios" junto con el resto de la página — nunca se sube por su cuenta.
  const selectAvatar = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      window.alert("Selecciona una imagen JPG, PNG o WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      window.alert("La imagen no debe superar los 5 MB.");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  // Guardado unificado: identidad + preferencias + foto pendiente en UNA sola acción.
  // Modelo Gmail/Notion: la página se configura y se guarda completa, sin botones por bloque.
  const saveAll = async () => {
    setSavingAll(true);
    try {
      if (selectedFile && onUploadAvatar) await onUploadAvatar(selectedFile);
      if (onSaveProfile) await onSaveProfile({ fullName: fullName.trim(), roleLabel, timezone, language });
      setSelectedFile(null);
      setSavedAll(true);
      setTimeout(() => setSavedAll(false), 2500);
    } finally {
      setSavingAll(false);
    }
  };

  const deleteAvatar = async () => {
    setAvatarUrl("");
    if (onDeleteAvatar) await onDeleteAvatar();
  };

  return (
    <div className="min-h-full bg-transparent text-zinc-950">
      <main>

        <div className="mb-3 flex items-start justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[12px] text-gray-500">
              <span>Inicio</span><span>›</span><span>Mi cuenta</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950 md:text-3xl">Mi cuenta</h1>
            <p className="mt-1 text-[14px] text-gray-500">
              Administra tu información personal, seguridad y preferencias de cuenta.
            </p>
          </div>

          <div className="mt-1 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600"><User size={15} /></div>
            <div>
              <p className="text-[11px] font-bold text-gray-800">Tu información personal</p>
              <p className="mt-0.5 text-[10px] text-gray-500">Mantén tus datos actualizados para una mejor experiencia.</p>
            </div>
          </div>
        </div>

        <div className="mb-4 flex border-b border-gray-200">
          <button type="button" onClick={() => setSection("cuenta")}
            className={cn("relative px-5 pb-3 pt-2 text-[12px] font-semibold transition-colors", section === "cuenta" ? "text-[#ff4b0b]" : "text-gray-500 hover:text-gray-800")}>
            Mi cuenta
            {section === "cuenta" && <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] rounded-full bg-[#ff4b0b]" />}
          </button>
          <button type="button" onClick={() => setSection("seguridad")}
            className={cn("relative px-5 pb-3 pt-2 text-[12px] font-semibold transition-colors", section === "seguridad" ? "text-[#ff4b0b]" : "text-gray-500 hover:text-gray-800")}>
            Seguridad
            {section === "seguridad" && <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] rounded-full bg-[#ff4b0b]" />}
          </button>
        </div>

        {section === "seguridad" ? (
          <SeguridadSection onOpenSecurity={onOpenSecurity} />
        ) : (
        <div className="grid grid-cols-[minmax(0,1fr)_380px] gap-3">
          <div className="min-w-0 space-y-3">

            <div className="grid grid-cols-2 gap-3">
              <SectionCard title="Foto de perfil" description="Personaliza tu foto de perfil. Se recomienda una imagen cuadrada.">
                <div className="flex items-center gap-5">
                  <div className="relative shrink-0">
                    <Avatar src={avatarUrl} name={fullName} large />
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50">
                      <Camera size={14} />
                    </button>
                  </div>

                  <div className="min-w-0 flex-1">
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="flex h-[102px] w-full flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50/60 text-center hover:border-[#ff4b0b] hover:bg-orange-50/30">
                      <Upload size={19} className="mb-2 text-gray-500" />
                      <span className="text-[11px] font-semibold text-gray-700">Arrastra una imagen aquí</span>
                      <span className="mt-1 text-[10px] text-gray-400">o haz clic para seleccionar</span>
                      <span className="mt-0.5 text-[9px] text-gray-400">JPG, PNG o WebP</span>
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={selectAvatar} className="hidden" />

                    <div className="mt-3 flex gap-2">
                      <button type="button" onClick={() => fileInputRef.current?.click()}
                        className="flex h-11 items-center gap-2 rounded-xl bg-[#ff4b0b] px-5 text-sm font-bold text-white shadow-sm hover:bg-[#e94408]">
                        <ImagePlus size={13} /> Cambiar foto
                      </button>
                      <button type="button" onClick={deleteAvatar} disabled={!avatarUrl}
                        className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-[10px] font-semibold text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40">
                        <Trash2 size={13} /> Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Información personal" description="Esta es la información que se mostrará en la plataforma.">
                <div className="space-y-3">
                  <label className="block">
                    <span className="mb-1.5 block text-[10px] font-semibold text-gray-700">Nombre completo</span>
                    <input value={fullName} onChange={(e) => setFullName(e.target.value)}
                      className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-[11px] text-gray-800 outline-none focus:border-[#ff4b0b] focus:ring-2 focus:ring-orange-100" />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-[10px] font-semibold text-gray-700">Cargo (opcional)</span>
                    <input value={roleLabel} onChange={(e) => setRoleLabel(e.target.value)}
                      className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-[11px] text-gray-800 outline-none focus:border-[#ff4b0b] focus:ring-2 focus:ring-orange-100" />
                  </label>


                </div>
              </SectionCard>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <SectionCard title="Correo electrónico" description="Este correo se utiliza para iniciar sesión en tu cuenta.">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={data.email} readOnly className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-10 text-[11px] text-gray-600 outline-none" />
                    <Lock size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[9px] font-semibold text-gray-500">Solo lectura</span>
                </div>

                <div className="mt-3 flex gap-3 rounded-lg border border-blue-100 bg-blue-50/60 p-3">
                  <Info size={15} className="mt-0.5 shrink-0 text-blue-500" />
                  <div>
                    <p className="text-[10px] font-bold text-gray-700">¿Necesitas cambiar tu correo?</p>
                    <p className="mt-1 text-[9px] leading-4 text-gray-500">
                      El cambio de correo se gestiona desde el sistema de autenticación. Contacta con soporte si lo necesitas.
                    </p>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Preferencias" description="Personaliza tu experiencia en la plataforma.">
                <div className="grid grid-cols-2 gap-3">
                  <label>
                    <span className="mb-1.5 block text-[10px] font-semibold text-gray-700">Zona horaria</span>
                    <div className="relative">
                      <Clock3 size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <select value={timezone} onChange={(e) => setTimezone(e.target.value)}
                        className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-[10px] text-gray-700 outline-none focus:border-[#ff4b0b]">
                        <option>(GMT-05:00) Lima - Perú</option>
                      </select>
                    </div>
                  </label>

                  <label>
                    <span className="mb-1.5 block text-[10px] font-semibold text-gray-700">Idioma</span>
                    <div className="relative">
                      <Globe2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <select value={language} onChange={(e) => setLanguage(e.target.value)}
                        className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-[10px] text-gray-700 outline-none focus:border-[#ff4b0b]">
                        <option>Español</option><option>English</option>
                      </select>
                    </div>
                  </label>
                </div>


              </SectionCard>
            </div>

            <section className="rounded-xl border border-orange-100 bg-orange-50/70 px-5 py-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-500"><Shield size={18} /></div>
                <div>
                  <h2 className="text-sm font-bold text-zinc-950">Cuenta de {data.roleLabel}</h2>
                  <p className="mt-1 text-[10px] text-gray-600">
                    Tu cuenta mantiene los permisos definidos por tu rol y organización dentro del ecosistema Qaway Lab.
                  </p>
                </div>
              </div>
            </section>

            {/* Guardado unificado (una sola acción para toda la página): identidad, preferencias
                y foto pendiente. Barra fija inferior para que siempre esté a la vista. */}
            <div className="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white/95 px-5 py-3 shadow-lg shadow-zinc-900/5 backdrop-blur">
              <p className="min-w-0 truncate text-[10px] text-gray-500">
                {selectedFile ? "Tu nueva foto de perfil se incluirá al guardar." : "Los cambios de esta página se guardan juntos."}
              </p>
              <div className="flex shrink-0 items-center gap-2">
                {savedAll && <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600"><CheckCircle2 size={13} /> Guardado</span>}
                <button type="button" onClick={saveAll} disabled={savingAll}
                  className="flex h-10 items-center gap-2 rounded-xl bg-[#ff4b0b] px-5 text-sm font-bold text-white shadow-sm hover:bg-[#e94408] disabled:opacity-60">
                  <Save size={14} /> {savingAll ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </div>
          </div>

          <aside className="space-y-3">
            <SectionCard title="Tu perfil">
              <div className="mb-4 flex items-start justify-between">
                <Avatar src={avatarUrl} name={fullName} />
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-[10px] font-semibold text-gray-600 hover:bg-gray-50">
                  <User size={12} /> Editar
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3"><User size={14} className="text-gray-400" /><span className="truncate text-[11px] font-semibold text-gray-800">{fullName || "Sin nombre"}</span></div>
                <div className="flex items-center gap-3"><Mail size={14} className="text-gray-400" /><span className="truncate text-[10px] text-gray-600">{data.email}</span></div>
                <div className="flex items-center gap-3"><Shield size={14} className="text-gray-400" /><span className="text-[10px] text-gray-600">{data.roleLabel}</span></div>
                <div className="flex items-center gap-3"><Building2 size={14} className="text-gray-400" /><span className="text-[10px] text-gray-600">{data.tenantName}</span></div>
                <div className="flex items-start gap-3"><CalendarDays size={14} className="mt-0.5 text-gray-400" /><div><p className="text-[10px] text-gray-600">Miembro desde</p><p className="mt-0.5 text-[10px] font-semibold text-gray-700">{data.memberSince}</p></div></div>
              </div>
            </SectionCard>

            <SectionCard title="Acciones rápidas" className="p-3">
              <ActionRow icon={<Activity size={14} />} label="Ver actividad de la cuenta" onClick={onOpenActivity} />
              <ActionRow icon={<Shield size={14} />} label="Administrar seguridad" onClick={onOpenSecurity} />
              <ActionRow icon={<CircleHelp size={14} />} label="Centro de ayuda" onClick={onOpenHelp} />
            </SectionCard>

            <SectionCard title="Actividad reciente">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[11px] text-gray-400">Últimos movimientos</span>
                <button type="button" onClick={onOpenActivity} className="text-[11px] font-medium text-gray-500 hover:text-gray-900">Ver todas →</button>
              </div>

              <div className="space-y-4">
                {activity.map((item, index) => (
                  <div key={`${item[0]}-${index}`} className="flex gap-3">
                    <ActivityIcon tone={item[3]}>{item[4]}</ActivityIcon>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold text-gray-800">{item[0]}</p>
                      <p className="truncate text-[10px] text-gray-500">{item[1]}</p>
                    </div>
                    <span className="whitespace-nowrap text-[10px] text-gray-400">{item[2]}</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          </aside>
        </div>
        )}
      </main>
    </div>
  );
}
