# ECP Estudio Contable Pro

Sitio web multipágina para estudio contable, construido con React + TypeScript + Vite + Tailwind CSS 4 + React Router + Motion.

## Rutas

- `/` Inicio
- `/servicios` Servicios
- `/nosotros` Nosotros
- `/recursos` Recursos
- `/contacto` Contacto / evaluación

## Objetivo de conversión

La acción principal es solicitar una evaluación y continuar la conversación por WhatsApp. El formulario de contacto construye el mensaje y abre WhatsApp; no almacena datos en un backend.

## Desarrollo

```bash
npm install
npm run dev
npm run typecheck
npm run lint
npm run build
npm run preview
```

## Alcance visual

- Navbar azul corporativo.
- Hero de fondo completo con profesional contable en tratamiento azul/duotono.
- Secciones con aire y alternancia de fondos blanco, hielo y azul.
- Tarjetas usadas estratégicamente, no como patrón repetitivo.
- Sección de proceso sobre fondo azul.
- Bloque de confianza y recursos.
- CTA final azul y footer corporativo oscuro.
- Responsive 360–430, 768–1024 y 1280–1440 px.
- Reduced motion.

## Nota de producción

El hero incluido es un asset de referencia visual con texto integrado; en producción conviene sustituirlo por una fotografía limpia de fondo, manteniendo la composición: profesional al lado derecho y espacio negativo a la izquierda para el HTML real.
