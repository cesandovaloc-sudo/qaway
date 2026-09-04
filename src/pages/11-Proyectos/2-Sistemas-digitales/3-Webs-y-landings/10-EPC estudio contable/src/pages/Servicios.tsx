import {services} from '../data/content';
import {Reveal} from '../components/Reveal';
import {Icon} from '../components/Icons';
import {Button} from '../components/Button';
import {wa} from '../config/site';

export default function Servicios(){
  return (
    <>
      <section className="bg-ecp-navy pb-16 sm:pb-24 pt-32 sm:pt-44 text-white">
        <div className="container-ecp">
          <span className="eyebrow text-blue-400">Servicios contables</span>
          <h1 className="mt-4 max-w-3xl text-3xl sm:text-5xl md:text-6xl font-semibold tracking-tight">
            Soluciones para ordenar, cumplir y hacer crecer tu negocio.
          </h1>
          <p className="mt-5 sm:mt-6 max-w-2xl text-[16px] sm:text-[17.5px] leading-relaxed text-white/85">
            Un acompañamiento integral para empresas, emprendedores y profesionales que necesitan información confiable y decisiones más seguras.
          </p>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-ecp grid gap-6 sm:gap-8 md:grid-cols-2">
          {services.map((s,i)=>(
            <Reveal key={s.title} delay={i*.04}>
              <article className="card p-6 sm:p-10 transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-ecp-blue">
                  <Icon name={s.icon} size={28}/>
                </div>
                <h2 className="mt-7 text-2xl font-bold tracking-tight text-ecp-ink">
                  {s.title}
                </h2>
                <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-slate-600">
                  {s.text}
                </p>
                <div className="mt-8 flex flex-wrap gap-2.5 text-[13.5px] font-semibold text-ecp-blue">
                  <span className="rounded-full bg-blue-50 px-3.5 py-1.5">Análisis integral</span>
                  <span className="rounded-full bg-blue-50 px-3.5 py-1.5">Seguimiento continuo</span>
                  <span className="rounded-full bg-blue-50 px-3.5 py-1.5">Acompañamiento personalizado</span>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-ecp-ice py-20 border-t border-slate-100">
        <div className="container-ecp flex flex-col justify-between gap-8 md:flex-row md:items-center">
          <div>
            <span className="eyebrow">¿No sabes por dónde empezar?</span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ecp-ink md:text-4xl">
              Revisamos tu situación y te proponemos una ruta clara.
            </h2>
          </div>
          <Button to={wa('Hola, quiero que revisen mi situación contable y me orienten con una ruta.')} external>
            Hablar por WhatsApp
          </Button>
        </div>
      </section>
    </>
  );
}
