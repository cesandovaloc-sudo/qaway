import miraflores1 from './miraflores1.webp';
import miraflores2 from './miraflores2.webp';
import miraflores3 from './miraflores3.webp';

// Imágenes Departamento en Jesús María
import jesusMaria1 from './jesus-maria1.webp';
import jesusMaria2 from './jesus-maria2.webp';
import jesusMaria3 from './jesus-maria3.webp';

// Imágenes Departamento en Magdalena
import magdalena1 from './magdalena1.webp';
import magdalena2 from './magdalena2.webp';
import magdalena3 from './magdalena3.webp';

import sanIsidro from './vallet-web/src/assets/property-san-isidro.webp';
import heroImage from './hero.webp';

export const valletProperties = [
  {
    slug: 'departamento-miraflores',
    type: 'ALQUILER',
    title: 'Departamento en Miraflores',
    tagline: 'Alojamiento moderno con balcón privado, vista panorámica y acabados premium.',
    location: 'Miraflores, Lima (a 3 cuadras del Malecón)',
    bedrooms: 2,
    bathrooms: 2,
    area: '90 m²',
    price: 'S/ 3,000 / mes',
    priceNumeric: 3000,
    maintenance: 'S/ 280 / mes (incluye agua y vigilancia)',
    deposit: '2 meses de garantía + 1 de adelanto',
    verified: true,
    rating: '4.95',
    reviewsCount: 38,
    images: [miraflores1, miraflores3, miraflores2],
    agent: {
      name: 'Mariana Vallet',
      role: 'Asesora Inmobiliaria Senior',
      responseRate: 'Menos de 15 minutos',
      experience: '8 años de experiencia',
      phone: '+51 987 654 321',
      whatsapp: '51930756781',
    },
    highlights: [
      {
        title: 'Ingreso Autónomo',
        desc: 'Cerradura digital inteligente con clave temporal para check-in inmediato.',
      },
      {
        title: 'Balcón con Terraza',
        desc: 'Espacio al aire libre con vista a la ciudad y área de descanso.',
      },
      {
        title: 'Edificio Exclusivo New One',
        desc: 'Seguridad 24/7, 2 ascensores de alta velocidad y estacionamiento subterráneo.',
      },
      {
        title: 'Pet Friendly',
        desc: 'Acepta mascotas pequeñas y medianas previa coordinación con administración.',
      },
    ],
    description: [
      'Bienvenido a este exclusivo departamento ubicado en el corazón residencial de Miraflores. Diseñado bajo una premisa de luminosidad natural, calidez arquitectónica y distribución funcional.',
      'El departamento cuenta con sala-comedor integrada a un balcón exterior con vista despejada, cocina equipada con tablero de granito y electrodomésticos empotrados, habitación principal con clóset de piso a techo y baño privado.',
      'Excelente conectividad hacia centros financieros, restaurantes de alta cocina y parques con ciclovía.',
    ],
    spaces: [
      {
        name: 'Habitación Principal',
        specs: '1 Cama King • Baño en suite • Clóset doble',
        image: miraflores1,
      },
      {
        name: 'Habitación Secundaria / Estudio',
        specs: '1 Cama 2 Plazas o Escritorio • Clóset empotrado',
        image: miraflores3,
      },
      {
        name: 'Sala & Balcón Terraza',
        specs: 'Comedor para 4 personas • Smart TV • Iluminación cálida',
        image: miraflores2,
      },
    ],
    amenities: [
      { icon: 'wifi', label: 'Internet Fibra Óptica 300 Mbps' },
      { icon: 'car', label: '1 Cochera techada incluida' },
      { icon: 'shield', label: 'Vigilancia y conserjería 24/7' },
      { icon: 'utensils', label: 'Cocina equipada con encimera y horno' },
      { icon: 'tv', label: 'Smart TV 55" 4K en sala' },
      { icon: 'sun', label: 'Balcón exterior con vista abierta' },
      { icon: 'wind', label: 'Excelente ventilación e iluminación natural' },
      { icon: 'paw', label: 'Acepta mascotas' },
    ],
  },
  {
    slug: 'departamento-jesus-maria',
    type: 'ALQUILER',
    title: 'Departamento en Jesús María',
    tagline: 'Moderno departamento con excelente distribución, vista exterior y ubicación residencial.',
    location: 'Jesús María, Lima (frente a parque y zona céntrica)',
    bedrooms: 3,
    bathrooms: 2,
    area: '88 m²',
    price: 'S/ 2,100 / mes',
    priceNumeric: 2100,
    maintenance: 'S/ 220 / mes (incluye agua y conserjería)',
    deposit: '2 meses de garantía + 1 de adelanto',
    verified: true,
    rating: '4.92',
    reviewsCount: 29,
    images: [jesusMaria1, jesusMaria2, jesusMaria3],
    agent: {
      name: 'Carlos Mendoza',
      role: 'Asesor Comercial Vallet',
      responseRate: 'Menos de 20 minutos',
      experience: '10 años de experiencia',
      phone: '+51 987 654 321',
      whatsapp: '51930756781',
    },
    highlights: [
      { title: 'Ubicación Residencial', desc: 'Frente a parque, cerca a universidades y avenidas clave.' },
      { title: 'Excelente Iluminación', desc: 'Piso alto con vista despejada y luz natural todo el día.' },
      { title: 'Cochera & Depósito', desc: 'Estacionamiento privado techado de fácil acceso.' },
      { title: 'Pet Friendly', desc: 'Edificio amigable con mascotas.' },
    ],
    description: [
      'Cómodo y luminoso departamento ubicado en una de las zonas más tranquilas y conectadas de Jesús María.',
      'Cuenta con 3 dormitorios, sala-comedor acogedora, cocina con reposteros altos y bajos, lavandería independiente y dormitorio principal con baño incorporado.',
      'Edificio moderno con lobby de recepción, cámaras de seguridad 24 horas y ascensor de última generación.',
    ],
    spaces: [
      { name: 'Sala & Comedor', specs: 'Espacio integrado con vista exterior', image: jesusMaria1 },
      { name: 'Dormitorio Principal', specs: 'Cama Queen • Clóset empotrado', image: jesusMaria2 },
      { name: 'Cocina & Área de Servicio', specs: 'Muebles altos y bajos • Espacio funcional', image: jesusMaria3 },
    ],
    amenities: [
      { icon: 'wifi', label: 'Conexión de alta velocidad' },
      { icon: 'car', label: '1 Estacionamiento techado' },
      { icon: 'shield', label: 'Seguridad y recepción 24/7' },
      { icon: 'utensils', label: 'Cocina con reposteros completos' },
      { icon: 'paw', label: 'Pet friendly' },
    ],
  },
  {
    slug: 'departamento-magdalena',
    type: 'VENTA',
    title: 'Departamento en Magdalena',
    tagline: 'Exclusivo departamento en venta con vista exterior, balcón y finos acabados en zona residencial.',
    location: 'Magdalena del Mar, Lima (límite con San Isidro)',
    bedrooms: 2,
    bathrooms: 2,
    area: '92 m²',
    price: 'US$ 140,000',
    priceNumeric: 140000,
    maintenance: 'S/ 260 / mes (incluye agua y vigilancia)',
    deposit: 'Acepta crédito hipotecario o pago al contado',
    verified: true,
    rating: '4.96',
    reviewsCount: 32,
    images: [magdalena1, magdalena2, magdalena3],
    agent: {
      name: 'Mariana Vallet',
      role: 'Asesora Inmobiliaria Senior',
      responseRate: 'Menos de 15 minutos',
      experience: '8 años de experiencia',
      phone: '+51 987 654 321',
      whatsapp: '51930756781',
    },
    highlights: [
      { title: 'Límite con San Isidro', desc: 'Ubicación estratégica con acceso rápido a avenidas principales.' },
      { title: 'Balcón con Vista Abierta', desc: 'Excelente iluminación natural y ventilación cruzada.' },
      { title: 'Edificio de Estreno', desc: 'Recepción 24 horas, ascensor directo y estacionamiento subterráneo.' },
      { title: 'Pet Friendly', desc: 'Se aceptan mascotas.' },
    ],
    description: [
      'Moderno departamento en alquiler ubicado en una de las zonas con mayor plusvalía de Magdalena del Mar.',
      'Consta de sala-comedor con balcón, cocina tipo kitchenette con muebles de granito, dos dormitorios confortables con clóset y baño principal incorporado.',
      'Edificio residencial tranquilo, seguro y con accesibilidad a supermercados, cafés y centros comerciales.',
    ],
    spaces: [
      { name: 'Sala & Balcón', specs: 'Vista exterior • Iluminación natural', image: magdalena1 },
      { name: 'Dormitorio Principal', specs: 'Cama Queen • Baño privado', image: magdalena2 },
      { name: 'Cocina Equipada', specs: 'Reposteros altos y bajos • Tablero de granito', image: magdalena3 },
    ],
    amenities: [
      { icon: 'wifi', label: 'Internet Fibra Óptica' },
      { icon: 'car', label: '1 Cochera techada' },
      { icon: 'shield', label: 'Conserjería 24/7' },
      { icon: 'utensils', label: 'Cocina con muebles empotrados' },
      { icon: 'paw', label: 'Acepta mascotas' },
    ],
  },
];
