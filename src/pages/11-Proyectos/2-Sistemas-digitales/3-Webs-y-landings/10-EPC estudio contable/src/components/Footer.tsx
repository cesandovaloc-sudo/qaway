import {Link} from 'react-router-dom';
import {site,wa,BASE} from '../config/site';
import {Icon} from './Icons';
import {Button} from './Button';

export default function Footer(){
  return (
    <>
      <section className="bg-gradient-to-r from-ecp-cobalt to-ecp-blue py-16 text-white">
        <div className="container-ecp flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <p className="text-2xl font-bold tracking-tight md:text-3xl">¿Listo para llevar tu empresa al siguiente nivel?</p>
            <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-white/90">Hablemos de cómo podemos ayudarte a tener una contabilidad clara y tomar mejores decisiones.</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button to={wa('Hola, quiero conversar sobre los servicios contables.')} external variant="light">Hablar por WhatsApp</Button>
            <Button to={`${BASE}/contacto`} variant="outline">Solicitar evaluación</Button>
          </div>
        </div>
      </section>

      <footer className="bg-ecp-navy text-white">
        <div className="container-ecp grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.3fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold tracking-tight">ECP</span>
              <span className="h-9 w-px bg-white/40" aria-hidden="true"/>
              <span className="text-xs font-semibold leading-tight tracking-[.14em]">
                ESTUDIO<br/>CONTABLE PRO
              </span>
            </div>
            <p className="mt-5 max-w-xs text-[15px] leading-relaxed text-white/75">
              Contabilidad clara para decisiones más seguras.
            </p>
          </div>

          <div>
            <h3 className="text-[13px] font-bold uppercase tracking-widest text-white/60">Navegación</h3>
            <div className="mt-5 grid gap-3.5 text-[15px] text-white/80">
              {[
                [`${BASE}/`,'Inicio'],
                [`${BASE}/servicios`,'Servicios'],
                [`${BASE}/nosotros`,'Nosotros'],
                [`${BASE}/recursos`,'Recursos'],
                [`${BASE}/contacto`,'Contacto']
              ].map(([to,label])=>(
                <Link 
                  key={to} 
                  to={to} 
                  className="transition-colors duration-200 hover:text-white"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[13px] font-bold uppercase tracking-widest text-white/60">Servicios</h3>
            <div className="mt-5 grid gap-3.5 text-[15px] text-white/80">
              <span className="hover:text-white transition-colors duration-200">Contabilidad General</span>
              <span className="hover:text-white transition-colors duration-200">Declaraciones Tributarias</span>
              <span className="hover:text-white transition-colors duration-200">Asesoría Tributaria</span>
              <span className="hover:text-white transition-colors duration-200">Gestión de Planillas</span>
              <span className="hover:text-white transition-colors duration-200">Estados Financieros</span>
              <span className="hover:text-white transition-colors duration-200">Asesoría Empresarial</span>
            </div>
          </div>

          <div>
            <h3 className="text-[13px] font-bold uppercase tracking-widest text-white/60">Contáctanos</h3>
            <div className="mt-5 grid gap-4 text-[15px] text-white/80">
              <a 
                href={wa('Hola, quiero información sobre sus servicios.')} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-3 transition-colors duration-200 hover:text-white"
              >
                <Icon name="whatsapp" size={19}/>
                <span>{site.phone}</span>
              </a>
              <a 
                href={`mailto:${site.email}`} 
                className="flex items-center gap-3 transition-colors duration-200 hover:text-white"
              >
                <Icon name="mail" size={19}/>
                <span>{site.email}</span>
              </a>
              <div className="flex items-start gap-3">
                <Icon name="map" size={19} className="mt-1 shrink-0"/>
                <span className="leading-relaxed">{site.address}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="container-ecp flex flex-col justify-between gap-3 py-6 text-[14.5px] text-white/60 md:flex-row">
            <span>© 2026 ECP Estudio Contable Pro. Todos los derechos reservados.</span>
            <span>Política de Privacidad · Términos y Condiciones</span>
          </div>
        </div>
      </footer>
    </>
  );
}
