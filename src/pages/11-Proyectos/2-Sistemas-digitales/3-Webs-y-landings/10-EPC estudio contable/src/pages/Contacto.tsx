import {FormEvent,useState} from 'react';
import {Reveal} from '../components/Reveal';
import {Icon} from '../components/Icons';
import {site,wa} from '../config/site';

export default function Contacto(){
  const [sent,setSent]=useState(false);

  const submit=(e:FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    const fd=new FormData(e.currentTarget);
    const msg=`Hola, quiero solicitar una evaluación contable. Mi nombre es ${fd.get('name')}, mi negocio/proyecto es ${fd.get('business')}, y necesito orientación sobre: ${fd.get('need')}.`;
    window.open(wa(msg),'_blank','noopener,noreferrer');
    setSent(true);
  };

  return (
    <>
      <section className="bg-ecp-navy pb-16 sm:pb-24 pt-32 sm:pt-44 text-white">
        <div className="container-ecp">
          <span className="eyebrow text-blue-400">Contacto Directo</span>
          <h1 className="mt-4 max-w-3xl text-3xl sm:text-5xl md:text-6xl font-semibold tracking-tight">
            Cuéntanos qué necesita tu negocio.
          </h1>
          <p className="mt-5 sm:mt-6 max-w-2xl text-[16px] sm:text-[17.5px] leading-relaxed text-white/85">
            Te orientamos con una primera revisión integral y definimos la mejor ruta contable y tributaria para tu situación.
          </p>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-ecp grid gap-10 sm:gap-14 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
          <Reveal>
            <div>
              <span className="eyebrow">Hablemos</span>
              <h2 className="mt-3 text-2xl sm:text-4xl font-semibold tracking-tight text-ecp-ink">
                Solicita una evaluación.
              </h2>
              <p className="mt-4 sm:mt-5 text-[15.5px] sm:text-[16.5px] leading-relaxed text-slate-600">
                Déjanos algunos datos y continuemos la conversación personalizada por WhatsApp o correo.
              </p>

              <div className="mt-10 grid gap-6 text-[16px] text-slate-700">
                <a 
                  className="flex items-center gap-3.5 font-medium transition-colors hover:text-ecp-blue" 
                  href={wa('Hola, quiero información sobre sus servicios.')}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-ecp-blue">
                    <Icon name="whatsapp" size={22}/>
                  </div>
                  <span>{site.phone}</span>
                </a>

                <a 
                  className="flex items-center gap-3.5 font-medium transition-colors hover:text-ecp-blue" 
                  href={`mailto:${site.email}`}
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-ecp-blue">
                    <Icon name="mail" size={22}/>
                  </div>
                  <span>{site.email}</span>
                </a>

                <div className="flex items-start gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-ecp-blue mt-0.5">
                    <Icon name="map" size={22}/>
                  </div>
                  <span className="leading-relaxed">{site.address}</span>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <form onSubmit={submit} className="card p-8 md:p-11 shadow-sm border border-slate-200">
              <div className="grid gap-6 md:grid-cols-2">
                <label className="grid gap-2.5 text-[15px] font-semibold text-slate-800">
                  <span>Tu nombre completo <span className="text-red-500">*</span></span>
                  <input 
                    required 
                    name="name" 
                    placeholder="Ej. Juan Pérez"
                    className="rounded-xl border border-slate-200 px-4 py-3.5 text-[15.5px] font-normal text-slate-800 outline-none transition-all duration-200 focus:border-ecp-blue focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="grid gap-2.5 text-[15px] font-semibold text-slate-800">
                  <span>Negocio o proyecto <span className="text-red-500">*</span></span>
                  <input 
                    required 
                    name="business" 
                    placeholder="Ej. Empresa SAC / Profesional"
                    className="rounded-xl border border-slate-200 px-4 py-3.5 text-[15.5px] font-normal text-slate-800 outline-none transition-all duration-200 focus:border-ecp-blue focus:ring-2 focus:ring-blue-100"
                  />
                </label>
              </div>

              <label className="mt-6 grid gap-2.5 text-[15px] font-semibold text-slate-800">
                <span>¿En qué necesitas orientación? <span className="text-red-500">*</span></span>
                <textarea 
                  required 
                  name="need" 
                  rows={5} 
                  placeholder="Cuéntanos brevemente sobre tus declaraciones, contabilidad mensual o consulta tributaria..."
                  className="resize-none rounded-xl border border-slate-200 px-4 py-3.5 text-[15.5px] font-normal text-slate-800 outline-none transition-all duration-200 focus:border-ecp-blue focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button 
                  type="submit" 
                  className="inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-full bg-ecp-blue px-7 py-3.5 text-[15.5px] font-semibold text-white shadow-lg shadow-blue-900/20 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:bg-ecp-cobalt active:scale-98"
                >
                  <Icon name="whatsapp" size={20}/>
                  <span>Enviar por WhatsApp</span>
                </button>
                {sent && (
                  <span className="text-[15px] font-semibold text-emerald-600 flex items-center gap-2">
                    <Icon name="check" size={18}/>
                    <span>Se abrió WhatsApp con tu consulta.</span>
                  </span>
                )}
              </div>
            </form>
          </Reveal>
        </div>
      </section>
    </>
  );
}
