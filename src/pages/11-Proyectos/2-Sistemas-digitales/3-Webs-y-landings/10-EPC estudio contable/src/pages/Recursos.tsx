import {resources} from '../data/content';
import {Reveal} from '../components/Reveal';
import {Icon} from '../components/Icons';

export default function Recursos(){
  return (
    <>
      <section className="bg-ecp-navy pb-16 sm:pb-24 pt-32 sm:pt-44 text-white">
        <div className="container-ecp">
          <span className="eyebrow text-blue-400">Recursos y Guías</span>
          <h1 className="mt-4 max-w-3xl text-3xl sm:text-5xl md:text-6xl font-semibold tracking-tight">
            Información práctica para tomar mejores decisiones.
          </h1>
          <p className="mt-5 sm:mt-6 max-w-2xl text-[16px] sm:text-[17.5px] leading-relaxed text-white/85">
            Contenido y herramientas prácticas para ayudarte a entender tus obligaciones, monitorear indicadores clave y mantener el control financiero.
          </p>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-ecp grid gap-6 sm:gap-8 md:grid-cols-3">
          {resources.map(([title,text],i)=>(
            <Reveal key={title} delay={i*.06}>
              <article className="card flex h-full flex-col justify-between overflow-hidden transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-lg">
                <div className="flex h-52 items-center justify-center bg-ecp-ice text-ecp-blue border-b border-slate-100">
                  <Icon name={i===0?'calendar':i===1?'chart':'document'} size={56}/>
                </div>
                <div className="flex flex-1 flex-col justify-between p-8">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-ecp-blue">
                      Recurso Clave
                    </span>
                    <h2 className="mt-3 text-2xl font-bold tracking-tight text-ecp-ink">
                      {title}
                    </h2>
                    <p className="mt-3 text-[15.5px] leading-relaxed text-slate-600">
                      {text}
                    </p>
                  </div>
                  <button className="mt-7 inline-flex items-center gap-2 text-[15px] font-bold text-ecp-blue transition-colors hover:text-ecp-cobalt">
                    Leer recurso práctico →
                  </button>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
