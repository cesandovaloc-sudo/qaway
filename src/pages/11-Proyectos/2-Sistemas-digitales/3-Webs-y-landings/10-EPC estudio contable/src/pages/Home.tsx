import {Reveal} from '../components/Reveal';
import {Button} from '../components/Button';
import {Icon} from '../components/Icons';
import ServiceCards from '../sections/ServiceCards';
import Process from '../sections/Process';
import Trust from '../sections/Trust';
import Resources from '../sections/Resources';
import {wa,BASE} from '../config/site';

export default function Home(){
  return (
    <>
      <section className="relative min-h-[100dvh] sm:min-h-[760px] overflow-hidden bg-ecp-navy text-white">
        <div 
          className="absolute inset-0 bg-[url('/images/hero-contadora-mobile.png')] bg-cover bg-[center_bottom] sm:bg-[url('/images/hero-contadora-duotono.png')] sm:bg-center opacity-95 sm:opacity-100" 
          aria-hidden="true"
        />
        {/* Degradado superior protector que deja ver el retrato en móvil */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-ecp-navy via-ecp-navy/85 via-[38%] to-transparent sm:bg-gradient-to-r sm:from-ecp-navy sm:via-ecp-navy/95 sm:via-[55%] sm:to-ecp-navy/20" 
          aria-hidden="true"
        />
        <div className="absolute inset-x-0 bottom-0 h-24 sm:h-40 bg-gradient-to-t from-ecp-navy to-transparent" aria-hidden="true"/>
        
        <div className="container-ecp relative flex min-h-[100dvh] sm:min-h-[760px] flex-col justify-between pt-24 sm:pt-32 pb-6 sm:pb-20">
          <div className="w-full max-w-[660px]">
            <Reveal>
              <span className="eyebrow text-blue-400">Estudio Contable Pro</span>
              <h1 className="mt-3.5 text-[33px] leading-[1.14] font-display tracking-tight sm:text-5xl md:text-6xl lg:text-7xl sm:leading-[1.08]">
                Contabilidad clara<br className="sm:hidden"/> para decisiones <span className="text-ecp-blue">más seguras.</span>
              </h1>
              <p className="mt-3.5 max-w-[310px] xs:max-w-sm sm:max-w-xl text-[14.5px] sm:text-[17px] leading-relaxed text-white/90">
                Brindamos soluciones contables y tributarias integrales para que tu empresa cumpla y crezca con confianza.
              </p>
              
              <div className="mt-6 sm:mt-9 flex flex-wrap gap-3 sm:gap-4">
                <Button to={`${BASE}/contacto`}>Solicitar evaluación</Button>
                <Button to={wa('Hola, quiero conversar sobre los servicios de Estudio Contable Pro.')} external variant="outline">Hablar por WhatsApp</Button>
              </div>

              {/* Fila horizontal de iconos decorativos en móvil (sin texto, como elementos de confianza) */}
              <div className="flex items-center gap-3 mt-6 sm:hidden">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-ecp-blue backdrop-blur-sm border border-white/10">
                  <Icon name="shield" size={20}/>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-ecp-blue backdrop-blur-sm border border-white/10">
                  <Icon name="chart" size={20}/>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-ecp-blue backdrop-blur-sm border border-white/10">
                  <Icon name="users" size={20}/>
                </div>
              </div>

              {/* Badges de confianza completos: exclusivos para desktop */}
              <div className="hidden sm:grid mt-16 sm:grid-cols-3 sm:gap-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-ecp-blue backdrop-blur-sm">
                    <Icon name="shield" size={20}/>
                  </div>
                  <span className="text-[15.5px] font-medium leading-snug text-white/95">
                    Confidencialidad<br/> garantizada
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-ecp-blue backdrop-blur-sm">
                    <Icon name="chart" size={20}/>
                  </div>
                  <span className="text-[15.5px] font-medium leading-snug text-white/95">
                    Información clara<br/> y útil
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-ecp-blue backdrop-blur-sm">
                    <Icon name="users" size={20}/>
                  </div>
                  <span className="text-[15.5px] font-medium leading-snug text-white/95">
                    Acompañamiento<br/> personalizado
                  </span>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Sello inferior móvil (alineado a la referencia visual) */}
          <div className="sm:hidden pt-6 pb-2">
            <div className="w-9 h-0.5 bg-white/60 mb-2"/>
            <p className="text-[10.5px] font-bold uppercase tracking-[.18em] text-white/80 leading-tight max-w-[200px]">
              Tu aliado estratégico en cada etapa de tu negocio
            </p>
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-ecp grid items-center gap-10 sm:gap-14 lg:grid-cols-2">
          <Reveal>
            <span className="eyebrow">Más que números</span>
            <h2 className="mt-3 text-[23px] sm:text-4xl md:text-5xl font-semibold tracking-tight text-ecp-ink leading-[1.25]">
              Te damos información que impulsa tu negocio.
            </h2>
            <p className="mt-4 sm:mt-5 text-[15px] sm:text-[17px] leading-relaxed text-slate-600 max-w-xl">
              No solo registramos operaciones: analizamos, interpretamos y te ayudamos a tomar mejores decisiones financieras y tributarias.
            </p>
            <div className="mt-6 sm:mt-7 grid gap-3 sm:gap-4 text-[15px] sm:text-[16px] font-medium text-slate-800">
              <div className="flex items-start sm:items-center gap-3">
                <div className="text-ecp-blue shrink-0 mt-0.5 sm:mt-0"><Icon name="check" size={20}/></div>
                <span>Visión clara y oportuna de tu situación financiera</span>
              </div>
              <div className="flex items-start sm:items-center gap-3">
                <div className="text-ecp-blue shrink-0 mt-0.5 sm:mt-0"><Icon name="check" size={20}/></div>
                <span>Cumplimiento puntual y seguro de todas tus obligaciones</span>
              </div>
              <div className="flex items-start sm:items-center gap-3">
                <div className="text-ecp-blue shrink-0 mt-0.5 sm:mt-0"><Icon name="check" size={20}/></div>
                <span>Estrategias preventivas para optimizar tus resultados</span>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <div className="relative overflow-hidden rounded-[24px] sm:rounded-[30px] bg-ecp-ice p-4 sm:p-6 blue-grid">
              <div className="rounded-[18px] sm:rounded-[24px] bg-white p-5 sm:p-7 shadow-soft">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div className="h-40 sm:h-48 rounded-2xl bg-gradient-to-br from-blue-50 to-white p-5 border border-blue-50">
                    <div className="h-3.5 w-28 rounded-full bg-blue-200"/>
                    <div className="mt-6 sm:mt-8 h-20 sm:h-24 rounded-xl bg-gradient-to-t from-blue-100 to-transparent"/>
                  </div>
                  <div className="h-40 sm:h-48 rounded-2xl bg-gradient-to-br from-slate-50 to-white p-5 border border-slate-100">
                    <div className="h-3.5 w-24 rounded-full bg-blue-200"/>
                    <div className="mt-5 sm:mt-6 grid h-20 sm:h-24 grid-cols-7 items-end gap-2">
                      {[35,55,40,70,50,80,65].map((h,i)=>(
                        <div 
                          key={i} 
                          style={{height:`${h}%`}} 
                          className="rounded-t bg-ecp-blue/85 transition-all duration-300 hover:bg-ecp-cobalt"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <ServiceCards/>
      <Process/>
      <Trust/>
      <Resources/>
    </>
  );
}
