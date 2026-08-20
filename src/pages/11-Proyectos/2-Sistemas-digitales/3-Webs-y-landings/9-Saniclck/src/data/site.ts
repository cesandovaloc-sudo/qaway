export const serviceCategories = [
  { label: "Limpieza de tanques", icon: "Droplets" },
  { label: "Gasfitería", icon: "Wrench" },
  { label: "Control de plagas", icon: "Bug" },
  { label: "Desinfección", icon: "SprayCan" },
  { label: "Pintura", icon: "PaintRoller" },
  { label: "Carpintería", icon: "Hammer" },
  { label: "Electricidad", icon: "Zap" },
  { label: "Mantenimiento general", icon: "Settings" },
  { label: "¿Necesitas otro servicio?", icon: "MoreHorizontal" },
] as const;

export const services = [
  {
    title: "Sanidad ambiental",
    description: ["Limpieza y desinfección de tanques", "Control de plagas", "Desinfección", "Saneamiento ambiental"],
    image: "/images/service-sanidad.webp",
    accent: "teal",
    icon: "Leaf",
  },
  {
    title: "Mantenimiento",
    description: ["Gasfitería", "Electricidad", "Reparaciones", "Mantenimiento preventivo"],
    image: "/images/service-mantenimiento.webp",
    accent: "green",
    icon: "Wrench",
  },
  {
    title: "Acabados y renovación",
    description: ["Pintura", "Carpintería", "Reparación de superficies"],
    image: "/images/service-acabados.webp",
    accent: "lime",
    icon: "PaintRoller",
  },
  {
    title: "Servicios generales",
    description: ["Instalaciones", "Reparaciones menores", "Soluciones personalizadas"],
    image: "/images/service-generales.webp",
    accent: "blue",
    icon: "Users",
  },
] as const;

export const projects = [
  { title: "Desinfección de ambientes", meta: "Vivienda · San Borja", image: "/images/project-1.webp", category: "Sanidad ambiental", icon: "Leaf" },
  { title: "Reparación de tuberías", meta: "Departamento · Miraflores", image: "/images/project-2.webp", category: "Mantenimiento", icon: "Wrench" },
  { title: "Pintura de interiores", meta: "Casa · Surco", image: "/images/project-3.webp", category: "Pintura", icon: "PaintRoller" },
  { title: "Mantenimiento de mobiliario", meta: "Oficina · San Isidro", image: "/images/project-4.webp", category: "Carpintería", icon: "Hammer" },
  { title: "Instalación eléctrica", meta: "Local comercial · La Molina", image: "/images/project-5.webp", category: "Servicios generales", icon: "Zap" },
] as const;

export const testimonials = [
  {
    quote: "Excelente servicio y atención. Resolví con ellos el control de plagas y también hacen el mantenimiento general de nuestra oficina. Muy recomendados.",
    name: "María López",
    role: "Administradora · Empresa Retail",
    stars: 5,
  },
  {
    quote: "Profesionales, puntuales y detallistas. Realizaron la limpieza de nuestros tanques y quedaron impecables. Sin duda seguiremos trabajando con Saniclick.",
    name: "Carlos Ramírez",
    role: "Gerente · Condominio Los Parques",
    stars: 5,
  },
  {
    quote: "Nos ayudaron con la pintura y reparaciones de nuestro local. Cumplieron lo acordado y el acabado fue excelente.",
    name: "Lucía Fernández",
    role: "Dueña · Café & Deco",
    stars: 5,
  },
] as const;

export const faqs = [
  "¿Qué zonas atienden?",
  "¿Realizan mantenimiento periódico?",
  "¿Trabajan con hogares y empresas?",
  "¿Atienden emergencias?",
  "¿Realizan presupuestos?",
  "¿Cómo puedo solicitar un servicio?",
  "¿Puedo solicitar más de un servicio?",
  "¿Qué métodos y productos utilizan?",
] as const;
