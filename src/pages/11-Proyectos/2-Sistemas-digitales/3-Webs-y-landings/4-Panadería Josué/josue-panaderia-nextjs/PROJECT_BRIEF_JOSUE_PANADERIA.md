# PROJECT_BRIEF_JOSUE_PANADERIA.md

## Proyecto
**Josué Panadería**  
Sitio web comercial público, inicialmente **one-page**, preparado para crecer a multipágina.  
Objetivo: mostrar la panadería, presentar productos, transmitir confianza local y convertir visitas en mensajes por WhatsApp.

---

## 1. Tipo de producto
**Perfil:** web pública comercial con SEO local.  
**Tecnología recomendada:** **Next.js** (App Router).  
Motivo:
- es una web pública;
- necesita buena indexación;
- puede crecer a páginas de producto, blog o pedidos;
- facilita metadata, sitemap, robots y futuras rutas.

> Si por razones operativas se necesita Vite, puede implementarse ahí, pero la recomendación principal para este proyecto es Next.js.

---

## 2. Fuente visual de verdad
La captura de referencia adjunta es la base visual principal.  
**Importante:** la imagen está presentada en **dos columnas** solo como formato de exhibición.  
La implementación real debe ser **una sola página vertical continua**.

---

## 3. Estructura visual aprobada

### Header
- logo a la izquierda: “JOSUÉ Panadería”;
- menú: Inicio, Productos, Pedidos, Nosotros, Ubicación, Contacto;
- botón verde “Escríbenos”.

### Hero
- imagen completa de panadería real;
- overlay oscuro y suave;
- texto centrado:
  - **Recién salido del horno.**
  - **Pan fresco todos los días.**
  - párrafo corto de apoyo;
- CTA principal: **Haz tu pedido**;
- CTA secundario: **Ver productos**.

### Bloque de beneficios
4 beneficios con iconos lineales:
- Fresco todos los días
- Variedad para todos
- Atención rápida
- Hechos en tu barrio

### Nuestros productos
4 tarjetas:
- Panes del día
- Panes tradicionales
- Bocaditos
- Pedidos especiales

### Los más pedidos
4 productos:
- Pan Francés
- Ciabatta
- Pan de Leche
- Tortas de Aceite

### Sección editorial / promesa
- texto “Pan de verdad, hecho por personas que aman lo que hacen.”
- imagen de elaboración real.

### Sección “Así trabajamos”
- título: “Con ingredientes reales y mucho cariño.”
- 4 ítems con iconos.

### Sección “Tu panadería de todos los días”
- imagen interior;
- texto corto;
- indicadores:
  - +5 años en tu barrio
  - 10+ variedades de pan
  - 100% comprometidos contigo

### Testimonios
- 3 tarjetas con estrellas, texto corto y nombre.

### CTA especial
- título: “¿Tienes un pedido especial? Estamos para ayudarte.”
- botón WhatsApp;
- canasta de panes a la derecha.

### Contacto / datos rápidos
- horarios;
- dirección;
- WhatsApp;
- mapa simple.

### Footer
- logo;
- texto corto;
- enlaces;
- productos;
- contacto;
- botón WhatsApp.

---

## 4. Dirección visual

### Paleta
- blanco de base;
- verde natural como color primario;
- negro/gris muy oscuro para titulares;
- grises suaves para bordes y textos secundarios.

### Estilo
- limpio;
- amable;
- profesional;
- cálido sin verse artesanal descuidado;
- realista;
- sin estética de cafetería beige;
- sin look genérico de IA.

### Tipografía
Sugerencia:
- títulos: **Manrope** o similar;
- cuerpo: **Inter** o similar.

### Reglas visuales
- mucho aire;
- tarjetas limpias;
- bordes suaves;
- iconografía lineal;
- fotos reales;
- sombras muy sutiles;
- alto contraste legible;
- responsive real.

---

## 5. Assets a construir y entregar

Todos los assets deben quedar separados y exportados en:
- **PNG alta calidad**
- **WebP**
- cuando corresponda también **SVG**

### 5.1 Branding
- `logo-primary.svg`
- `logo-primary.png`
- `logo-primary.webp`
- `logo-light.svg`
- `favicon.svg`

### 5.2 Hero
- `hero-bakery-desktop.png`
- `hero-bakery-desktop.webp`
- `hero-bakery-mobile.png`
- `hero-bakery-mobile.webp`

### 5.3 Beneficios / iconos
- `icon-fresh.svg`
- `icon-variety.svg`
- `icon-fast.svg`
- `icon-nearby.svg`

### 5.4 Productos
- `product-panes-del-dia.png/webp`
- `product-panes-tradicionales.png/webp`
- `product-bocaditos.png/webp`
- `product-pedidos-especiales.png/webp`

### 5.5 Más pedidos
- `best-pan-frances.png/webp`
- `best-ciabatta.png/webp`
- `best-pan-de-leche.png/webp`
- `best-tortas-de-aceite.png/webp`

### 5.6 Secciones editoriales
- `section-preparacion.png/webp`
- `section-interior-bakery.png/webp`
- `section-cta-basket.png/webp`

### 5.7 Testimonios
- avatares o mini fotos si se usan;
- si no existen, dejar sistema listo para texto + avatar simple.

### 5.8 Mapa / contacto
- `map-preview.png/webp`

---

## 6. Contenido estructurado
El contenido no debe quedar embebido en imágenes.

Crear archivos de datos, por ejemplo:
- `src/data/navigation.ts`
- `src/data/products.ts`
- `src/data/testimonials.ts`
- `src/data/site.ts`

---

## 7. Arquitectura sugerida

### Next.js
```text
app/
  layout.tsx
  page.tsx
  sitemap.ts
  robots.ts

components/
  Header.tsx
  Hero.tsx
  BenefitItem.tsx
  ProductCard.tsx
  BestsellerCard.tsx
  TestimonialCard.tsx
  Footer.tsx

sections/
  BenefitsSection.tsx
  ProductsSection.tsx
  BestSellersSection.tsx
  PromiseSection.tsx
  ProcessSection.tsx
  NeighborhoodSection.tsx
  TestimonialsSection.tsx
  SpecialOrderSection.tsx
  ContactSection.tsx

data/
  navigation.ts
  products.ts
  testimonials.ts
  site.ts

styles/
  globals.css

public/
  assets/
    logos/
    hero/
    products/
    sections/
    icons/
    map/
```

---

## 8. SEO mínimo requerido
- title y meta description;
- canonical;
- Open Graph;
- sitemap;
- robots;
- alt en imágenes;
- schema tipo `Bakery` o `LocalBusiness`;
- headings correctos;
- textos reales en HTML.

---

## 9. Responsive obligatorio
Validar mínimo:
- móvil: 360–430 px
- tablet: 768–1024 px
- escritorio: 1280–1440 px

No solo escalar: adaptar orden, tamaños y grid.

---

## 10. Accesibilidad y rendimiento
- HTML semántico;
- navegación por teclado;
- focus visible;
- contraste;
- carga optimizada de imágenes;
- lazy loading donde corresponda;
- hero prioritario;
- sin textos dentro de imágenes;
- sin iframes.

---

## 11. Integración funcional mínima
Botones:
- `Haz tu pedido` → WhatsApp
- `Escríbenos` → WhatsApp
- `Ver productos` → scroll a sección productos

Preparar el proyecto para futura conexión con:
- catálogo dinámico;
- carrito;
- CRM;
- agenda;
- blog;
- Supabase u otro backend.

**Regla:** ningún componente visual debe consultar Supabase directamente.  
Usar:
```text
Componente → servicio/repositorio → adaptador → backend
```

---

## 12. Resultado esperado
El agente debe entregar:

1. **Código completo ejecutable**  
   - listo para `npm install`
   - listo para `npm run dev`
   - y build funcional.

2. **Assets separados**  
   - PNG alta calidad
   - WebP
   - SVG cuando aplique.

3. **Documentación mínima**
   - `README.md`
   - `PRODUCT.md`
   - `DESIGN.md`
   - `ASSET_MANIFEST.md`

---

## 13. Criterios de aceptación
Se considera correcto si:
- respeta el diseño de referencia;
- mantiene estructura y jerarquía;
- la web funciona como app/sitio ejecutable;
- el código compila;
- los assets están separados;
- el proyecto es responsive;
- el contenido es editable;
- la base queda lista para crecer.

---

## 14. Instrucción corta para el agente constructor

> Construye el sitio web completo de Josué Panadería tomando la maqueta adjunta como referencia visual principal.  
> Implementa una sola página vertical, no una composición en dos columnas.  
> Usa Next.js como base recomendada.  
> Crea también todos los assets necesarios por separado y entrégalos en PNG alta calidad y WebP, y SVG cuando corresponda.  
> Respeta estructura, jerarquía, textos, tono visual, paleta y estilo general.  
> No incrustes textos en imágenes.  
> Usa componentes reutilizables, contenido separado, responsive real y una base preparada para futuras integraciones.

