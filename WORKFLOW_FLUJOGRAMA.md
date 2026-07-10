# Flujograma de Trabajo Qaway Web

## Objetivo

Este flujograma resume como trabajaremos desde ahora en:

- desarrollo local completo
- visibilidad publica controlada
- build
- GitHub
- Hostinger

## Flujo principal

```mermaid
flowchart TD
    A[Iniciar trabajo] --> B[Entrar a 1-Frontend]
    B --> C[Levantar local con npm run dev]
    C --> D[Ver todas las paginas en desarrollo]
    D --> E[Editar pagina o seccion]
    E --> F{Es pagina ya publicada?}

    F -->|Si| G[Corregir o mejorar]
    F -->|No| H[Trabajar pagina nueva o aun oculta]

    G --> I[Validar localmente]
    H --> I

    I --> J{La pagina ya esta lista para publico?}

    J -->|No| K[Mantenerla fuera de visibilidad publica]
    J -->|Si| L[Agregar ruta publica en siteVisibility]

    K --> M[npm run build]
    L --> M

    M --> N[Actualizar salida deployable completa]
    N --> O[git add]
    O --> P[git commit]
    P --> Q[git push]
    Q --> R[Redeploy en Hostinger]
    R --> S[Validar online]
```

## Bifurcacion real de trabajo

```mermaid
flowchart TD
    A[Quiero seguir trabajando] --> B{Que voy a hacer?}
    B -->|Modificar pagina ya subida| C[Editar local]
    B -->|Trabajar pagina nueva| D[Editar local]
    B -->|Abrir nueva pagina al publico| E[Editar local y luego habilitar visibilidad]

    C --> F[No cambiar visibilidad publica si no hace falta]
    D --> G[La pagina puede seguir visible solo en desarrollo]
    E --> H[Agregar routeKey y navPath en siteVisibility]

    F --> I[Build]
    G --> I
    H --> I

    I --> J[Push]
    J --> K[Redeploy]
```

## Punto clave

```mermaid
flowchart LR
    A[Modo desarrollo] --> B[Se ve todo]
    C[Modo publico] --> D[Se ve solo lo aprobado]
```

## Donde se controla cada cosa

- Desarrollo completo local:
  - `npm run dev`
- Publicacion controlada:
  - `npm run build`
- Visibilidad publica:
  - `1-Frontend/src/config/siteVisibility.js`
- Router:
  - `1-Frontend/src/router/AppRouter.jsx`
- Navegacion:
  - `1-Frontend/src/components/layout/Navbar.jsx`
  - `1-Frontend/src/components/layout/Footer.jsx`
- Salida para Hostinger:
  - raiz de `1-Web-Qaway`

## Regla simple

1. En local vemos todo.
2. En publico solo sale lo aprobado.
3. Cuando una pagina este lista, la habilitamos.
4. Luego build, push y redeploy.

## Ejemplo practico

Caso:

- hoy trabajas `/sistemas-digitales`
- aun no esta lista

Entonces:

1. la ves en local sin problema
2. la editas
3. la pruebas
4. no la agregas todavia a visibilidad publica
5. haces build
6. push
7. si redeployas, seguira oculta al publico

Caso:

- `/sistemas-digitales` ya quedo lista

Entonces:

1. la agregas en `siteVisibility.js`
2. build
3. push
4. redeploy
5. ya queda visible online
