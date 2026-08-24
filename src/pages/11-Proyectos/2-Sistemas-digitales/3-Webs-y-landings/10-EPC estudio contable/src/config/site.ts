export const BASE='/proyectos/epc';
export const site={name:'Estudio Contable Pro',shortName:'ECP',phone:'+51 998 888 777',whatsapp:'51930756781',email:'hola@ecpcontablepro.pe',address:'Av. Caminos del Inca 1234, Oficina 502, Santiago de Surco, Lima - Perú',url:'https://www.estudiocontablepro.pe'};
export const wa=(text:string)=>`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;
