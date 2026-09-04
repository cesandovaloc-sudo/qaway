import {Reveal} from '../components/Reveal';
import {Icon} from '../components/Icons';

const stats=[
  ['+150','Clientes satisfechos','Empresas y profesionales que confían en nuestro trabajo.','users'],
  ['10+','Años de experiencia','Brindando soluciones contables y tributarias de alto nivel.','calendar'],
  ['100%','Compromiso ético','Con la confidencialidad, puntualidad y criterio profesional.','shield'],
  ['Diversos','Sectores clave','Acompañamos comercio, servicios, tecnología, salud y construcción.','landmark']
];

export default function Trust(){
  return (
    <section className="section-pad bg-white">
      <div className="container-ecp grid items-center gap-12 lg:grid-cols-[1.1fr_.9fr]">
        <div>
          <Reveal>
            <span className="eyebrow">Confianza que respalda</span>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-ecp-ink md:text-5xl">
              Experiencia, compromiso y resultados comprobados.
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            {stats.map(([n,t,d,ic],i)=>(
              <Reveal key={t} delay={i*.06}>
                <div>
                  <div className="flex items-center gap-3 text-ecp-blue">
                    <Icon name={ic} size={28}/>
                    <strong className="text-3xl font-bold tracking-tight text-ecp-ink">{n}</strong>
                  </div>
                  <h3 className="mt-3 text-lg font-bold text-ecp-ink">{t}</h3>
                  <p className="mt-2 text-[15.5px] leading-relaxed text-slate-600">{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal>
          <div className="relative overflow-hidden rounded-[32px] bg-ecp-ice p-4 sm:p-6">
            <img 
              src="/images/hero-contadora-duotono.png" 
              alt="Asesoría contable y tributaria profesional" 
              className="h-[360px] sm:h-[460px] w-full rounded-[24px] object-cover object-right grayscale-[.15]"
              loading="lazy"
            />
            <div className="absolute bottom-6 left-6 right-6 sm:right-auto sm:max-w-xs rounded-2xl bg-white/95 p-5 shadow-soft backdrop-blur-md border border-white/40">
              <p className="text-[15.5px] font-bold text-ecp-ink">Información clara. Decisiones seguras.</p>
              <p className="mt-2 text-[14.5px] leading-relaxed text-slate-600">
                Acompañamiento profesional cercano para ordenar y potenciar el crecimiento de tu negocio.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
