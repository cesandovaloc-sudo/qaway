# Estructura de Recursos

## Regla base

La familia `Recursos` ya no usa estas rutas antiguas:

- `recursos-v2`
- `recursos-v2/visor`
- `recursos/visor/...`

Esas rutas quedan reemplazadas por una estructura por tipo de producto.

## Ruta madre

- `/recursos`

## Categorias oficiales

- `/recursos/ebooks`
- `/recursos/plantillas`
- `/recursos/prompts`
- `/recursos/checklists`
- `/recursos/scripts`

## Productos actuales

- `/recursos/ebooks/google-calendar-dominado`
- `/recursos/plantillas/notion-manual-sops`
- `/recursos/plantillas/sheets-calculadora-leads`
- `/recursos/prompts/prompt-generador-copys`
- `/recursos/prompts/prompt-calibracion-soporte`
- `/recursos/checklists/checklist-campana-ads`
- `/recursos/checklists/checklist-auditoria-seguridad`
- `/recursos/scripts/script-whatsapp-notion`
- `/recursos/scripts/script-sheets-backup`

## Criterio

- `ebooks` = experiencias editoriales digitales, interactivas, descargables y enlazables desde Blog y Recursos.
- `plantillas` = recursos operativos reutilizables.
- `prompts` = instrucciones especializadas para IA.
- `checklists` = listas de verificacion accionables.
- `scripts` = piezas tecnicas listas para implementar.

## Regla tecnica

- El router debe mantener esta logica publica:
  - `/recursos`
  - `/recursos/:category`
  - `/recursos/ebooks/google-calendar-dominado`
  - `/recursos/:resourceType/:id`

## Nota importante

`google-calendar-dominado` no se trata como un simple visor.
Se define como un `ebook digital interactivo` dentro de `Recursos`.
