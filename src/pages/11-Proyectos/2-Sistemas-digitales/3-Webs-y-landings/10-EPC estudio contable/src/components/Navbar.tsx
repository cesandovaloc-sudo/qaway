import {Link,NavLink} from 'react-router-dom';
import {Menu,X} from 'lucide-react';
import {useState,useEffect} from 'react';
import {Button} from './Button';
import {site,wa,BASE} from '../config/site';

const links=[
  [`${BASE}/`,'Inicio'],
  [`${BASE}/servicios`,'Servicios'],
  [`${BASE}/nosotros`,'Nosotros'],
  [`${BASE}/recursos`,'Recursos'],
  [`${BASE}/contacto`,'Contacto']
];

export default function Navbar(){
  const [open,setOpen]=useState(false);

  useEffect(()=>{
    const handleKeyDown=(e:KeyboardEvent)=>{
      if(e.key==='Escape'&&open){
        setOpen(false);
      }
    };
    window.addEventListener('keydown',handleKeyDown);
    return ()=>window.removeEventListener('keydown',handleKeyDown);
  },[open]);

  return (
    <header className="absolute inset-x-0 top-0 z-50 border-b border-white/10 bg-ecp-navy/95 text-white backdrop-blur-md">
      <div className="container-ecp flex h-[80px] sm:h-[86px] items-center justify-between gap-4">
        <Link to={`${BASE}/`} className="flex shrink-0 items-center gap-2.5 sm:gap-3 transition-opacity duration-200 hover:opacity-90" aria-label="Estudio Contable Pro Inicio">
          <span className="text-3xl sm:text-4xl font-bold tracking-tight">ECP</span>
          <span className="h-8 sm:h-9 w-px bg-white/40" aria-hidden="true"/>
          <span className="text-[11px] sm:text-xs font-semibold leading-tight tracking-[.12em] sm:tracking-[.14em]">
            ESTUDIO<br/>CONTABLE PRO
          </span>
        </Link>
        
        <nav className="hidden items-center gap-9 lg:flex" aria-label="Navegación principal">
          {links.map(([to,label])=>(
            <NavLink 
              key={to} 
              to={to} 
              className={({isActive})=>
                `relative py-7 text-[15px] font-medium transition-colors duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isActive 
                    ? 'text-white after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-ecp-blue' 
                    : 'text-white/80 hover:text-white'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Button to={`${BASE}/contacto`} variant="primary">Solicitar evaluación</Button>
        </div>

        <button 
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/15 text-white lg:hidden" 
          aria-label={open ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'} 
          aria-expanded={open}
          aria-controls="mobile-nav-menu"
          onClick={()=>setOpen(!open)}
        >
          {open ? <X size={24} aria-hidden="true"/> : <Menu size={24} aria-hidden="true"/>}
        </button>
      </div>

      {open && (
        <div id="mobile-nav-menu" className="relative overflow-hidden border-t border-white/10 bg-ecp-navy shadow-2xl lg:hidden">
          <div 
            className="absolute inset-0 bg-[url('/images/hero-contadora-mobile.png')] bg-cover bg-[center_top] opacity-25 pointer-events-none" 
            aria-hidden="true"
          />
          <div 
            className="absolute inset-0 bg-gradient-to-r from-ecp-navy via-ecp-navy/95 to-ecp-navy/70 pointer-events-none" 
            aria-hidden="true"
          />
          <div className="container-ecp relative z-10 flex flex-col py-6">
            {links.map(([to,label])=>(
              <NavLink 
                onClick={()=>setOpen(false)} 
                key={to} 
                to={to} 
                className="border-b border-white/10 py-4 text-base font-medium text-white/95 transition-colors hover:text-white"
              >
                {label}
              </NavLink>
            ))}
            <a 
              href={wa('Hola, quiero solicitar una evaluación contable.')} 
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-full bg-ecp-blue px-6 py-3.5 text-center text-base font-semibold text-white shadow-lg shadow-blue-900/30 transition-transform active:scale-95"
            >
              Hablar por WhatsApp
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
