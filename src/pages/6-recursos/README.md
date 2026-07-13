# Recursos

Esta carpeta contiene la pagina publica de recursos y sus vistas internas.

## Logica de destacados

Los recursos destacados ya no se seleccionan con listas sueltas de IDs en el render. Cada recurso define su propia metadata dentro de `RecursosPage.jsx`.

Campos usados:

- `featured`: marca un recurso como destacado principal.
- `featured.order`: define el orden de aparicion en las tarjetas grandes iniciales.
- `featured.label`: texto visible de la etiqueta, por ejemplo `Mas Descargada` o `Super Destacada`.
- `featured.icon`: icono visual de la etiqueta. Valores actuales: `trending` y `star`.
- `homeSection`: define en que bloque aparece el recurso dentro de la portada. Valores actuales: `featured`, `starter` y `new`.
- `publishedAt`: fecha usada para ordenar naturalmente el bloque `Recien agregados`.

## Regla operativa

Para destacar un recurso, se edita el recurso en el arreglo `resources` y no el JSX de la vista.

Ejemplo:

```js
featured: {
  order: 1,
  label: 'Mas Descargada',
  icon: 'trending'
}
```

Para quitarlo de destacados, elimina el campo `featured`.
