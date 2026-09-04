import {resources} from '../data/content';
import {Reveal} from '../components/Reveal';
import {Button} from '../components/Button';
import {BASE} from '../config/site';

export default function Resources(){
  return (
    <section className="section-pad blue-grid bg-ecp-ice">
      <div className="container-ecp">
        <Reveal>
          <span className="eyebrow">Recursos contables</span>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight text-ecp-ink md:text-5xl">
            Información que te ayuda a tomar mejores decisiones.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {resources.map(([title,text],i)=>(
            <Reveal key={title} delay={i*.06}>
              <article className="card flex h-full flex-col justify-between overflow-hidden">
                <div className="h-44 bg-gradient-to-br from-blue-100 to-slate-50"/>
                <div className="flex flex-1 flex-col justify-between p-7">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-ecp-blue">
                      Recurso
                    </span>
                    <h3 className="mt-3 text-xl font-bold tracking-tight text-ecp-ink">
                      {title}
                    </h3>
                    <p className="mt-2 text-[15.5px] leading-relaxed text-slate-600">
                      {text}
                    </p>
                  </div>
                  <span className="mt-6 inline-block text-[15px] font-semibold text-ecp-blue transition-colors hover:text-ecp-cobalt">
                    Ver recurso →
                  </span>
                </div>
              </article>
            </Reveal>
          ))}

          <Reveal delay={.18}>
            <article className="flex h-full flex-col justify-between rounded-[22px] border border-blue-100 bg-blue-50/80 p-8 shadow-sm">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-ecp-blue text-ecp-blue font-bold">
                  ↓
                </div>
                <h3 className="mt-8 text-xl font-bold text-ecp-ink">
                  ¿Necesitas apoyo con tu contabilidad?
                </h3>
                <p className="mt-3 text-[15.5px] leading-relaxed text-slate-600">
                  Nuestro equipo está listo para ayudarte a encontrar una ruta clara y personalizada.
                </p>
              </div>
              <div className="mt-8">
                <Button to={`${BASE}/contacto`}>Solicitar evaluación</Button>
              </div>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
