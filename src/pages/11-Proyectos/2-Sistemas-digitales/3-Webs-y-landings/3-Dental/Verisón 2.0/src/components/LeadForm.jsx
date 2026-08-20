import { useState } from "react";
import {
  CalendarBlank,
  CalendarCheck,
  CaretDown,
  ChatCircleDots,
  EnvelopeSimple,
  Phone,
  ShieldCheck,
  User,
} from "@phosphor-icons/react";

const initialForm = {
  fullName: "",
  phone: "",
  email: "",
  age: "",
  treatmentInterest: "Ortodoncia con brackets",
  message: "",
  acceptedPrivacy: false,
};

const fields = [
  { name: "fullName", label: "Nombre completo", type: "text", autoComplete: "name", icon: User },
  { name: "phone", label: "Teléfono / WhatsApp", type: "tel", autoComplete: "tel", icon: Phone },
  { name: "email", label: "Correo electrónico", type: "email", autoComplete: "email", icon: EnvelopeSimple },
  { name: "age", label: "Edad", type: "number", autoComplete: "off", icon: CalendarBlank },
];

function validateForm(data) {
  const next = {};
  if (data.fullName.trim().length < 3) next.fullName = "Ingresa tu nombre completo.";
  if (data.phone.replace(/\D/g, "").length < 7) next.phone = "Ingresa un teléfono válido.";
  if (!/^\S+@\S+\.\S+$/.test(data.email)) next.email = "Ingresa un correo válido.";
  if (data.age && (Number(data.age) < 12 || Number(data.age) > 100)) next.age = "Revisa la edad ingresada.";
  if (!data.acceptedPrivacy) next.acceptedPrivacy = "Debes aceptar la política de privacidad.";
  return next;
}

export function LeadForm() {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ kind: "idle", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const nextErrors = validateForm(formData);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setStatus({ kind: "error", message: "Revisa los campos señalados antes de continuar." });
      return;
    }

    setIsSubmitting(true);
    setStatus({ kind: "idle", message: "" });

    try {
      const { createDentalLead } = await import("../lib/dentalLeads");
      const result = await createDentalLead(formData);
      if (result.ok) {
        setFormData(initialForm);
        setErrors({});
        setStatus({ kind: "success", message: result.message });
      } else {
        setStatus({ kind: result.mode === "missing_env" ? "info" : "error", message: result.message });
      }
    } catch {
      setStatus({ kind: "error", message: "No pudimos enviar tu solicitud. Conservamos tus datos para que puedas reintentar." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusClasses = {
    idle: "hidden",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    error: "border-red-200 bg-red-50 text-red-800",
    info: "border-rose-200 bg-rose-50 text-rose-800",
  };

  return (
    <form className="mt-8 grid gap-4 sm:grid-cols-2" noValidate onSubmit={onSubmit}>
      {fields.map((field) => {
        const errorId = field.name + "-error";
        return (
          <label className="grid gap-2" key={field.name}>
            <span className="text-sm font-semibold text-ink/75">{field.label}</span>
            <span className={"field-shell " + (errors[field.name] ? "field-shell-error" : "")}>
              <field.icon className="h-5 w-5 shrink-0 text-ink/45" weight="regular" aria-hidden="true" />
              <input
                aria-describedby={errors[field.name] ? errorId : undefined}
                aria-invalid={Boolean(errors[field.name])}
                autoComplete={field.autoComplete}
                className="w-full bg-transparent text-sm text-ink outline-none"
                id={field.name}
                min={field.name === "age" ? 12 : undefined}
                name={field.name}
                onChange={onChange}
                type={field.type}
                value={formData[field.name]}
              />
            </span>
            {errors[field.name] ? <span className="text-xs font-medium text-red-700" id={errorId}>{errors[field.name]}</span> : null}
          </label>
        );
      })}

      <label className="grid gap-2 sm:col-span-2">
        <span className="text-sm font-semibold text-ink/75">¿Qué te gustaría mejorar?</span>
        <span className="field-shell">
          <CalendarCheck className="h-5 w-5 shrink-0 text-ink/45" aria-hidden="true" />
          <select className="w-full appearance-none bg-transparent text-sm text-ink outline-none" name="treatmentInterest" onChange={onChange} value={formData.treatmentInterest}>
            <option>Ortodoncia con brackets</option>
            <option>Alineadores invisibles</option>
            <option>Blanqueamiento dental</option>
            <option>Diseño de sonrisa</option>
          </select>
          <CaretDown className="h-4 w-4 text-ink/45" aria-hidden="true" />
        </span>
      </label>

      <label className="grid gap-2 sm:col-span-2">
        <span className="text-sm font-semibold text-ink/75">Cuéntanos brevemente tu caso <span className="font-normal text-ink/45">(opcional)</span></span>
        <span className="field-shell items-start py-4">
          <ChatCircleDots className="mt-1 h-5 w-5 shrink-0 text-ink/45" aria-hidden="true" />
          <textarea className="min-h-[112px] w-full resize-y bg-transparent text-sm text-ink outline-none" name="message" onChange={onChange} value={formData.message} />
        </span>
      </label>

      <label className="flex items-start gap-3 sm:col-span-2">
        <input
          aria-describedby={errors.acceptedPrivacy ? "privacy-error" : undefined}
          aria-invalid={Boolean(errors.acceptedPrivacy)}
          checked={formData.acceptedPrivacy}
          className="mt-1 h-5 w-5 shrink-0 accent-rose-500"
          name="acceptedPrivacy"
          onChange={onChange}
          type="checkbox"
        />
        <span className="text-sm leading-6 text-ink/60">
          Acepto el tratamiento de mis datos según la <a className="font-semibold text-rose-600 underline underline-offset-2" href="#privacidad">Política de Privacidad</a>.
          {errors.acceptedPrivacy ? <span className="mt-1 block font-medium text-red-700" id="privacy-error">{errors.acceptedPrivacy}</span> : null}
        </span>
      </label>

      <div aria-live="polite" className={"rounded-2xl border px-4 py-3 text-sm font-semibold sm:col-span-2 " + statusClasses[status.kind]} role="status">
        {status.message}
      </div>

      <button className="primary-button min-h-[60px] justify-center sm:col-span-2" disabled={isSubmitting} type="submit">
        <CalendarCheck className="h-5 w-5" weight="bold" aria-hidden="true" />
        {isSubmitting ? "Enviando evaluación..." : "Agendar mi evaluación gratuita"}
      </button>

      <p className="flex items-center justify-center gap-2 text-xs font-medium text-ink/50 sm:col-span-2">
        <ShieldCheck className="h-4 w-4 text-rose-500" weight="bold" aria-hidden="true" />
        Tu información está protegida y no será compartida con terceros.
      </p>
    </form>
  );
}
