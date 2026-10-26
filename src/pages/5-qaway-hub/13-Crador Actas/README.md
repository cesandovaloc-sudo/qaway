# Actas Institucionales — React + TypeScript

Aplicación web para convertir transcripciones, resúmenes de Google/Gemini o apuntes propios en un borrador de acta institucional, editar los campos, adjuntar imágenes de asistencia y evidencias, y exportar un Word editable.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS 4 (con CSS de interfaz propio)
- React Router 7
- Lucide React
- `mammoth` para leer texto de DOCX y `pdfjs-dist` para extraer texto de PDF
- `python-docx` en el servidor para rellenar la plantilla Word original, añadir filas de acuerdos y anexar imágenes
- Express + OpenAI SDK para la ruta opcional de redacción con IA

## Requisitos

- Node.js 20 o superior (recomendado 22)
- npm

## Instalar y ejecutar

```bash
npm install
cp .env.example .env
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:8787/api/health

La aplicación requiere Python 3 y `python-docx` para exportar usando la plantilla original. Instala la dependencia con `pip install -r requirements.txt`. Funciona sin clave de IA para edición manual, extracción básica, adjuntar imágenes y exportación Word. Para habilitar redacción asistida, añade una clave válida a `OPENAI_API_KEY` en `.env`. La clave solo se usa en el servidor; no la escribas en el código del navegador.

Para compilar:

```bash
npm run build
npm start
```

## Funciones implementadas

- Cargar DOCX, PDF, TXT o MD y extraer el texto disponible; o pegar el texto directamente.
- Extraer algunos datos básicos como ayuda preliminar (siempre deben revisarse).
- Endpoint de IA con instrucciones para lenguaje institucional natural y no inventar acuerdos, responsables o plazos.
- Formulario editable con información general, agenda, acuerdos ampliables y observaciones.
- Adjuntar varias imágenes de asistencia y de reunión, editar sus leyendas y cambiar el orden.
- Generar Word con tabla de acuerdos que crece según el texto y anexos en páginas posteriores.
- Vista de impresión del navegador para guardar como PDF.
- Historial básico en localStorage del navegador.
- Plantilla Word original incluida en `public/ACTA-DE-REUNION-REFERENCIA.docx` como referencia.

## Fidelidad de la plantilla

La exportación de Word utiliza directamente `public/ACTA-DE-REUNION-REFERENCIA.docx`, rellena las celdas de las tablas existentes y conserva la estructura, los anchos y los bordes del documento maestro. Si se agregan más puntos de agenda o acuerdos de los previstos, clona filas con el formato de la plantilla; el contenido puede aumentar de altura y continuar en páginas siguientes. Las imágenes de asistencia se anexan primero y las demás evidencias después, en páginas adicionales.

Como Word puede recalcular la paginación según la versión, las fuentes instaladas y la longitud del contenido, revisa siempre el archivo final. Los estilos de texto dentro de celdas editadas pueden heredar ajustes básicos de Arial; si el formato institucional cambia en el futuro, reemplaza el DOCX de referencia y revisa el mapeo de campos en `server/generate_docx.py`.

## Privacidad y alcance

- La extracción de archivos se ejecuta en el navegador.
- El historial guarda solo metadatos básicos en el navegador; no conserva archivos ni imágenes.
- Si se usa la redacción con IA, el texto del insumo se envía al proveedor configurado por el servidor. No habilites esa función con información restringida sin la autorización correspondiente.
- La aplicación es un prototipo local; no incluye inicio de sesión, almacenamiento centralizado, auditoría institucional ni gestión multiusuario.
- La generación Word de imágenes está preparada para PNG/JPG/GIF/BMP. Convierte HEIC/WebP a PNG o JPG antes de cargarlas si el generador no las admite.
