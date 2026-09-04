import {process} from '../data/content';
import {Reveal} from '../components/Reveal';
import {Icon} from '../components/Icons';

export default function Process(){
  return (
    <section className="section-pad relative overflow-hidden bg-ecp-navy text-white">
      <div className="absolute inset-y-0 right-0 w-1/2 bg-[url('/images/hero-contadora-duotono.png')] bg-cover bg-center opacity-15" aria-hidden="true"/>
      <div className="container-ecp relative">
        <Reveal>
          <span className="eyebrow text-blue-400">Nuestro proceso</span>
          <h2 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight md:text-5xl">
            Un proceso simple, resultados que suman.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
          {process.map(([n,t,d],i)=>(
            <Reveal key={n} delay={i*.08}>
              <article className="h-full rounded-2xl border border-white/10 bg-white/[0.02] p-8 lg:rounded-none lg:border-y-0 lg:border-r-0 lg:border-l lg:border-white/15 lg:bg-transparent lg:first:border-l-0">
                <div className="mb-7 flex h-11 w-11 items-center justify-center rounded-full bg-ecp-blue text-[15px] font-bold text-white shadow-md">
                  {n}
                </div>
                <div className="text-ecp-blue">
                  <Icon name={i===0?'file':i===1?'target':i===2?'chart':'briefcase'} size={32}/>
                </div>
                <h3 className="mt-5 text-xl font-bold tracking-tight text-white">
                  {t}
                </h3>
                <p className="mt-3 text-[15.5px] leading-relaxed text-white/80">
                  {d}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
