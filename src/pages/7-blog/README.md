# Blog

Esta carpeta contiene la pagina publica del blog y el render de articulos individuales.

## Logica de destacados

Los articulos destacados de la portada no deben depender de la posicion dentro del arreglo `articles`. Cada articulo define su propia metadata dentro de `BlogPage.jsx`.

Campos usados:

- `featured`: marca un articulo como destacado principal.
- `featured.order`: define el orden de aparicion en el bloque `Pilares destacados`.
- `featured.label`: etiqueta editorial para uso visual o futuro.
- `featured.icon`: icono editorial para uso visual o futuro. Valores actuales: `trending`, `book` y `target`.
- `homeSection`: define en que bloque aparece el articulo dentro de la portada. Valores actuales: `featured` y `more`.
- `publishedAt`: fecha ISO usada para ordenar naturalmente el bloque `Mas publicaciones`.

## Regla operativa

Para destacar un articulo, se edita el articulo dentro del arreglo `articles` y no el JSX de la vista.

Ejemplo:

```js
featured: {
  order: 1,
  label: 'Destacado',
  icon: 'trending'
}
```

Para quitarlo de destacados, elimina el campo `featured` y deja `homeSection: 'more'`.
