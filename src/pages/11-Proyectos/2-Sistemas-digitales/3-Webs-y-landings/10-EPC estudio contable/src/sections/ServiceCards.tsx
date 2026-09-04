import {services} from '../data/content';
import {Icon} from '../components/Icons';
import {Reveal} from '../components/Reveal';
import {Link} from 'react-router-dom';
import {BASE} from '../config/site';

export default function ServiceCards(){
  return (
    <section className="section-pad bg-white">
      <div className="container-ecp">
        <Reveal>
          <div className="max-w-3xl">
            <span className="eyebrow">Nuestros servicios</span>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-ecp-ink md:text-5xl">
              Soluciones contables para cada etapa de tu negocio.
            </h2>
            <p className="mt-5 text-[17px] leading-relaxed text-slate-600">
              Un servicio profesional no solo registra información: la convierte en claridad para que puedas decidir mejor.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {services.map((s,i)=>(
            <Reveal key={s.title} delay={i*.05}>
              <Link 
                to={`${BASE}/servicios`} 
                className="card group block h-full p-8 transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-lg"
              >
                <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-blue-50 text-ecp-blue transition-transform duration-300 group-hover:scale-105">
                  <Icon name={s.icon} size={26}/>
                </div>
                <h3 className="mt-6 text-xl font-bold tracking-tight text-ecp-ink">
                  {s.title}
                </h3>
                <p className="mt-3 text-[15.5px] leading-relaxed text-slate-600">
                  {s.text}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-[15px] font-semibold text-ecp-blue transition-colors group-hover:text-ecp-cobalt">
                  Conocer servicio <Icon name="arrow" size={17}/>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
