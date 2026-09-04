import {Link} from 'react-router-dom';import {ArrowRight,CalendarDays,MessageCircle} from 'lucide-react';import type {ReactNode} from 'react';
export function Button({to,children,variant='primary',external=false,className=''}:{to:string;children:ReactNode;variant?:'primary'|'outline'|'light';external?:boolean;className?:string}){
  const baseCls="inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-full px-6 py-3 text-[15px] font-semibold tracking-wide transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98]";
  const variantCls=variant==='primary'
    ? 'bg-ecp-blue text-white shadow-lg shadow-blue-900/20 hover:-translate-y-0.5 hover:bg-ecp-cobalt hover:shadow-xl hover:shadow-blue-900/30'
    : variant==='outline'
    ? 'border border-white/30 text-white hover:-translate-y-0.5 hover:border-white hover:bg-white/10'
    : 'bg-white text-ecp-navy shadow-md hover:-translate-y-0.5 hover:bg-slate-100 hover:shadow-lg';
  const cls=`${baseCls} ${variantCls} ${className}`;
  const icon=children?.toString().toLowerCase().includes('whatsapp')
    ? <MessageCircle size={19} aria-hidden="true"/>
    : children?.toString().toLowerCase().includes('evaluación')
    ? <CalendarDays size={19} aria-hidden="true"/>
    : <ArrowRight size={19} aria-hidden="true"/>;
  return external
    ? <a className={cls} href={to} target="_blank" rel="noopener noreferrer">{icon}{children}</a>
    : <Link className={cls} to={to}>{icon}{children}</Link>;
}
