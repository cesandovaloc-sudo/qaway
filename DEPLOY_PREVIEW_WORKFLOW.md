# Workflow de Deploy Preview en Hostinger

## Objetivo

Este documento deja por escrito la ruta de trabajo que ya validamos para:

- trabajar sin perder avance
- probar paginas online sin exponer todo el proyecto
- usar GitHub + Hostinger de forma controlada
- dejar un flujo claro tanto para IA/Codex como para trabajo manual

Ruta base del proyecto:

`C:\LEO\EMPRESAS\QAWAY LAB\1-Web-Qaway`

## Idea central

El proyecto puede seguir siendo un monorepo con varias carpetas:

- `1-Frontend`
- `2-Backend`
- `3-Academy-*`
- otras carpetas de apoyo

Pero el dominio publico no debe desplegar el monorepo crudo.

Para pruebas online controladas:

1. se trabaja en una rama de preview
2. se limita temporalmente que rutas son publicas
3. se hace build del frontend
4. se deja una salida servible en la raiz del repo
5. se sube esa rama a GitHub
6. Hostinger despliega esa rama

## Regla de seguridad

Antes de cualquier deploy:

- no hacer `reset --hard`
- no borrar rutas o carpetas del proyecto para "ocultar" cosas
- no empujar directo a `main` si no se comparo antes
- no asumir que Hostinger compila `1-Frontend` por si solo

Siempre preferir:

- rama nueva de preview
- commit claro
- push a GitHub
- deploy de esa rama en Hostinger

## Flujo validado hoy

### 1. Trabajar localmente

La edicion se hace en el repo local:

`C:\LEO\EMPRESAS\QAWAY LAB\1-Web-Qaway`

La web principal vive dentro de:

`C:\LEO\EMPRESAS\QAWAY LAB\1-Web-Qaway\1-Frontend`

### 2. Elegir que paginas quedaran publicas

Para una prueba controlada, se dejan visibles solo las rutas listas.

Ejemplo ya probado:

- `/`
- `/estudio`

Y el resto se redirige temporalmente a `/`.

Esto se controla desde:

`1-Frontend/src/router/AppRouter.jsx`

Tambien conviene alinear:

- `1-Frontend/src/components/layout/Navbar.jsx`
- `1-Frontend/src/components/layout/Footer.jsx`

para que la navegacion visible coincida con las paginas realmente publicas.

### 3. Validar localmente con build

Desde:

`C:\LEO\EMPRESAS\QAWAY LAB\1-Web-Qaway\1-Frontend`

ejecutar:

```bash
npm run build
```

Si el build falla, no se despliega.

Si el build pasa, seguir.

### 4. Preparar salida servible para Hostinger

Hostinger Git, en este caso, no esta tomando automaticamente `1-Frontend` como app compilable.
Por eso, para esta ruta de preview, se deja una salida servible en la raiz del repo.

Archivos/carpetas clave a dejar en la raiz de `1-Web-Qaway`:

- `index.html`
- `assets/`
- `Portfolio/`
- `recursos/`
- `.htaccess`

El `.htaccess` permite que rutas SPA como `/estudio` sigan funcionando:

```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### 5. Guardar en Git

Primero commit del recorte de rutas visibles.

Ejemplo real usado:

```bash
git add 1-Frontend/src/router/AppRouter.jsx
git add 1-Frontend/src/components/layout/Navbar.jsx
git add 1-Frontend/src/components/layout/Footer.jsx
git commit -m "Temporarily limit public routes to inicio and estudio"
```

Luego commit de la salida servible para Hostinger.

Ejemplo real usado:

```bash
git add .htaccess index.html assets Portfolio recursos
git commit -m "Add deployable root build for Hostinger preview"
```

### 6. Subir rama de preview a GitHub

Configurar remoto si hace falta:

```bash
git remote add origin https://github.com/cesandovaloc-sudo/qaway.git
```

O actualizarlo:

```bash
git remote set-url origin https://github.com/cesandovaloc-sudo/qaway.git
```

Subir rama:

```bash
git push -u origin feature-digital-systems-page
```

Si GitHub abre ventana de autenticacion:

1. elegir `Sign in with your browser`
2. iniciar sesion
3. aprobar permisos
4. volver a la terminal y esperar que termine el push

### 7. Desplegar en Hostinger

Dentro de Hostinger:

1. `Websites`
2. `qawaylab.com`
3. `Advanced`
4. `Git`
5. `Continue with GitHub`
6. elegir repo `qaway`
7. elegir rama `feature-digital-systems-page`
8. dejar `Root directory` en `public_html`
9. `Deploy`

### 8. Verificar online

Probar:

- `https://qawaylab.com/`
- `https://qawaylab.com/estudio`

Resultado esperado en esta ruta de preview:

- `inicio` visible
- `estudio` visible
- otras rutas redirigen a inicio

## Flujo manual resumido

Si se hace sin IA, el orden recomendado es:

1. editar localmente
2. controlar visibilidad publica si hace falta
3. correr `npm run build`
4. copiar salida compilada a raiz del repo para Hostinger
5. crear `.htaccess`
6. hacer commit
7. hacer push de rama preview
8. desplegar esa rama en Hostinger
9. revisar online

## Workflow actual de publicacion controlada

Este es el workflow practico que vamos a usar:

1. Editar normal en `1-Frontend`
2. Controlar visibilidad publica
3. Probar local
4. Hacer `npm run build`
5. Actualizar la salida deployable completa
6. `git add`
7. `git commit`
8. `git push`
9. `Redeploy`

### Donde entra AppRouter, Navbar y Footer

El paso `Controlar visibilidad publica` significa esto:

- en [AppRouter.jsx](/abs/path/C:/LEO/EMPRESAS/QAWAY%20LAB/1-Web-Qaway/1-Frontend/src/router/AppRouter.jsx) dejamos publicas solo las rutas listas
- las rutas no listas se redirigen temporalmente a `/`
- en [Navbar.jsx](/abs/path/C:/LEO/EMPRESAS/QAWAY%20LAB/1-Web-Qaway/1-Frontend/src/components/layout/Navbar.jsx) mostramos solo enlaces de paginas listas
- en [Footer.jsx](/abs/path/C:/LEO/EMPRESAS/QAWAY%20LAB/1-Web-Qaway/1-Frontend/src/components/layout/Footer.jsx) hacemos lo mismo

Ejemplo real ya validado:

- visibles: `/` y `/estudio`
- ocultas temporalmente: las demas rutas publicas

Esto permite avanzar paginas nuevas sin borrarlas del proyecto y sin exponerlas antes de tiempo.

## Flujo para IA / Codex

Si Codex lo hace:

1. revisar rama actual
2. revisar router real del frontend
3. limitar rutas visibles sin borrar el resto del proyecto
4. correr build
5. preparar salida servible para Hostinger en la raiz del repo
6. hacer commit no destructivo
7. subir rama preview a GitHub
8. indicar al usuario que rama elegir en Hostinger
9. verificar resultado final

## CuÃ¡ndo NO usar `main`

No empujar directo a `main` cuando:

- el remoto tiene historia distinta
- no se comparo contra GitHub
- el deploy es de prueba
- aun no estan listas todas las paginas

En esos casos, usar una rama de preview.

## CuÃ¡ndo una pagina puede ir online

Una pagina puede ir a deploy cuando:

- ya se reviso visualmente
- ya paso build
- no rompe las rutas activas
- la navegacion visible coincide con lo realmente publico

## Recordatorio importante

Ocultar no significa borrar.

La forma correcta de ocultar temporalmente es:

- redireccionar rutas no listas
- quitar enlaces visibles del navbar/footer
- mantener el codigo dentro del repo

Eso conserva todo el avance y evita perdida de trabajo.

## Estado que ya quedo probado

Se valido correctamente esta estrategia:

- repo completo conservado
- deploy por rama preview
- Hostinger leyendo GitHub
- preview online estable con solo `inicio` y `estudio`

## Siguiente uso recomendado

Cada vez que una nueva area quede lista:

1. se habilita su ruta en el router
2. se ajusta navbar/footer si corresponde
3. se hace build
4. se actualiza salida servible
5. se hace commit
6. se hace push
7. se redeploya la rama preview o una nueva rama controlada
