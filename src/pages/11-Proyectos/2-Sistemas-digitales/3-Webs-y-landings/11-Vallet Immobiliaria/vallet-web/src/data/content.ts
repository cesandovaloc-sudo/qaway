import type { LucideIcon } from 'lucide-react';
import { BadgeCheck, CalendarDays, FileText, Handshake, House, KeyRound, MapPin, Search, ShieldCheck, Users, WalletCards } from 'lucide-react';
import miraflores from '@/assets/property-miraflores.jpg';
import sanIsidro from '@/assets/property-san-isidro.jpg';
import laMolina from '@/assets/property-la-molina.jpg';

export type Property = {
  type: 'VENTA' | 'ALQUILER';
  title: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  price: string;
  image: string;
};

export const properties: Property[] = [
  { type: 'VENTA', title: 'Departamento en Miraflores', location: 'Miraflores, Lima', bedrooms: 2, bathrooms: 2, area: '90 m²', price: 'S/ 680,000', image: miraflores },
  { type: 'ALQUILER', title: 'Departamento en San Isidro', location: 'San Isidro, Lima', bedrooms: 3, bathrooms: 2, area: '120 m²', price: 'S/ 4,500 / mes', image: sanIsidro },
  { type: 'VENTA', title: 'Casa en La Molina', location: 'La Molina, Lima', bedrooms: 4, bathrooms: 3, area: '250 m²', price: 'S/ 1,250,000', image: laMolina },
];

export type Benefit = { icon: LucideIcon; title: string; body: string };
export const benefits: Benefit[] = [
  { icon: ShieldCheck, title: 'Compra segura', body: 'Te acompañamos en todo el proceso para que inviertas con tranquilidad.' },
  { icon: Search, title: 'Alquiler sin complicaciones', body: 'Encontramos el espacio ideal para ti con contratos claros y propietarios confiables.' },
  { icon: WalletCards, title: 'Mejor precio del mercado', body: 'Negociamos por ti para que obtengas las mejores condiciones.' },
  { icon: FileText, title: 'Transparencia total', body: 'Información clara, documentos en regla y cero sorpresas.' },
];

export const process = [
  { number: '1', icon: Users, title: 'Cuéntanos qué necesitas', body: 'Entendemos tus objetivos y preferencias.' },
  { number: '2', icon: House, title: 'Te mostramos opciones', body: 'Seleccionamos propiedades que se ajustan a ti.' },
  { number: '3', icon: MapPin, title: 'Visitamos y evaluamos', body: 'Te acompañamos en las visitas y resolvemos tus dudas.' },
  { number: '4', icon: Handshake, title: 'Cerramos el trato', body: 'Negociamos y gestionamos todo hasta la firma.' },
];

export const testimonials = [
  { quote: 'Gracias a Vallet encontré el departamento perfecto. Me acompañaron en todo el proceso y siempre fueron muy claros.', name: 'Andrea R.', place: 'Miraflores' },
  { quote: 'Alquilé mi propiedad rápidamente y al mejor precio. Su servicio es 100% recomendable.', name: 'Carlos M.', place: 'San Isidro' },
  { quote: 'Profesionales y muy atentos. Me ayudaron a tomar la mejor decisión para mi inversión.', name: 'Mariana L.', place: 'La Molina' },
];

export const stats = [
  { icon: Users, value: '+350', label: 'Clientes satisfechos' },
  { icon: House, value: '+500', label: 'Propiedades asesoradas' },
  { icon: CalendarDays, value: '+8', label: 'Años de experiencia en el mercado' },
  { icon: BadgeCheck, value: '100%', label: 'Compromiso y transparencia' },
];

export const consultationPoints = [
  { icon: ShieldCheck, title: 'Respuesta rápida', body: 'Te respondemos en menos de 30 minutos durante nuestro horario de atención.' },
  { icon: KeyRound, title: 'Confidencialidad garantizada', body: 'Tu información está protegida y será utilizada únicamente para ayudarte.' },
  { icon: Handshake, title: 'Asesoría sin compromiso', body: 'Recibe orientación profesional sin compromiso de compra o contratación.' },
];
