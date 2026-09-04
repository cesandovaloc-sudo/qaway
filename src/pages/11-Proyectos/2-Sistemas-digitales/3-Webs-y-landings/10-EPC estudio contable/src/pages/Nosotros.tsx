import {Reveal} from '../components/Reveal';
import {Icon} from '../components/Icons';
import {Button} from '../components/Button';
import {BASE} from '../config/site';

const values = [
  ['Claridad','Explicamos la información financiera y tributaria en un lenguaje simple para que puedas entenderla y aplicarla.','chart'],
  ['Confianza','Protegemos tu información con estricta confidencialidad y trabajamos con el más alto criterio ético y profesional.','shield'],
  ['Orden','Organizamos tus procesos, libros y obligaciones contables para reducir al mínimo cualquier riesgo de contingencia.','file'],
  ['Crecimiento','Acompañamos tus decisiones estratégicas con datos precisos que impulsan el desarrollo sostenible del negocio.','target']
];

export default function Nosotros(){
  return (
    <>
      <section className="bg-ecp-navy pb-16 sm:pb-24 pt-32 sm:pt-44 text-white">
        <div className="container-ecp grid items-end gap-8 sm:gap-12 lg:grid-cols-2">
          <div>
            <span className="eyebrow text-blue-400">Nosotros</span>
            <h1 className="mt-4 text-3xl sm:text-5xl md:text-6xl font-semibold tracking-tight">
              Una forma más clara de llevar tu contabilidad.
            </h1>
          </div>
          <p className="text-[16px] sm:text-[17.5px] leading-relaxed text-white/85">
            Trabajamos para que la información contable deje de ser un trámite complejo y se convierta en una herramienta estratégica indispensable para dirigir tu negocio.
          </p>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-ecp grid gap-12 sm:gap-16 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <span className="eyebrow">Nuestro enfoque</span>
            <h2 className="mt-3 text-2xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-ecp-ink">
              Orden, precisión y acompañamiento constante.
            </h2>
            <p className="mt-5 sm:mt-6 text-[15.5px] sm:text-[17px] leading-relaxed text-slate-600">
              Combinamos un profundo conocimiento contable y tributario con una atención cercana y personalizada, entendiendo el contexto único de cada negocio para entregar información útil y accionable.
            </p>
          </Reveal>

          <Reveal>
            <div className="grid gap-5 sm:gap-6 sm:grid-cols-2">
              {values.map(([t,d,i])=>(
                <div className="card p-6 sm:p-7 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-md" key={t}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-ecp-blue">
                    <Icon name={i} size={26}/>
                  </div>
                  <h3 className="mt-5 text-lg sm:text-xl font-bold tracking-tight text-ecp-ink">{t}</h3>
                  <p className="mt-2 text-[15px] sm:text-[15.5px] leading-relaxed text-slate-600">{d}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-pad bg-ecp-ice border-t border-slate-100">
        <div className="container-ecp text-center">
          <Reveal>
            <span className="eyebrow">Trabajemos juntos</span>
            <h2 className="mx-auto mt-3 max-w-3xl text-2xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-ecp-ink">
              Tu contabilidad puede ser mucho más simple de entender.
            </h2>
            <div className="mt-8 sm:mt-9">
              <Button to={`${BASE}/contacto`}>Solicitar evaluación</Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
