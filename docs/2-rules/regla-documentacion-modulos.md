# Regla Oficial: Estandarización de Documentación de Módulos y Blindaje de Producción

## 1. Principio de Co-localización Protegida
Para evitar la dispersión de documentación técnica y garantizar que cualquier agente o desarrollador encuentre de inmediato la bitácora, README o especificación de un módulo, la documentación contextual vive dentro de la carpeta del módulo, pero bajo una subcarpeta protegida llamada _docs/.

## 2. Estructura Obligatoria por Módulo o Página
Toda página, aplicación o módulo en src/pages/ o src/components/ debe seguir esta convención:

`
src/pages/<modulo>/
  ├── _docs/
  │    ├── .gitignore              # Obligatorio: bloquea secretos, keys y credenciales
  │    ├── README.md               # Propósito general y guía del módulo
  │    ├── APP_IMPLEMENTACION.md   # Arquitectura técnica, endpoints y dependencias
  │    └── bitacora.md             # Historial de decisiones, fixes y cambios
  ├── ComponentePrincipal.jsx
  └── estilos.css
`

## 3. Reglas Inquebrantables para Agentes de IA
1. **Prohibido dejar .md sueltos en la raíz de los módulos:** Cualquier archivo .md, .doc, .txt de notas debe alojarse dentro de _docs/.
2. **.gitignore en cada _docs/:** Cada subcarpeta _docs/ debe contener su archivo .gitignore con los filtros de protección de credenciales (*.secret*, *.key, *.env*, *token*, *password*).
3. **Cero impacto en producción:** Vite jamás compila archivos .md de src/ a dist/. La carpeta _docs/ es de consumo exclusivo para desarrollo y agentes.
4. **Prohibido colocar documentación interna en public/:** Ningún archivo de notas o arquitectura interna puede situarse dentro de public/.
