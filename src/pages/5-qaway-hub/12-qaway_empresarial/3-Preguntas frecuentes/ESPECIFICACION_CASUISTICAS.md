# Especificación de Casuísticas — Banco de Preguntas Frecuentes

**MINEDU • DIGERE | Módulo:** `/hub/preguntas-frecuentes`
**Documento de lógica y formato de contenido**

---

## 1. Propósito

Definir la estructura, el contenido y las reglas de redacción de las casuísticas del Banco de Preguntas Frecuentes, para que:

- Se lean rápido, se entiendan de inmediato y permitan dar solución sin fricción.
- La información **específica de UGEL** (nombres de UGEL, casos particulares) quede en un plano **interno**, invisible en producción.
- El **buscador** aproveche todas las variables: las visibles y las ocultas.

---

## 2. Estructura visible en producción (Diseño Aprobado)

Cada casuística se muestra como una tarjeta acordeón limpia con este orden exacto:

```
[01]  [DEP • ED. PRIMARIA]                                    [Compartir] [▾]
      Cambio de característica de una institución educativa: ¿a qué dirección corresponde asignar los materiales?
─────────────────────────────────────────────────────────────────────────────
  DESARROLLO                  │ SOLUCIÓN                    │ EJEMPLO / RESULTADO ESPERADO
  La UGEL identifica una      │ La UGEL debe verificar la   │ Por ejemplo, un mismo código
  institución educativa que   │ característica actual que   │ modular no puede tener asignados
  ha cambiado de              │ corresponde a la            │ materiales educativos de DEP y
  característica...           │ institución educativa...    │ DISER a la vez...
─────────────────────────────────────────────────────────────────────────────
▸ NORMATIVA (desplegable opcional, solo aparece si el caso registra sustento normativo)
```

Reglas de la estructura visual:

- **Encabezado:** Número correlativo (`01`), etiqueta de dirección (`DEP • ED. PRIMARIA`), pregunta/título en negrita y botón de **Compartir** (WhatsApp, Correo, Copiar texto).
- **Cuerpo de 3 columnas limpias:** **DESARROLLO**, **SOLUCIÓN** y **EJEMPLO / RESULTADO ESPERADO**.
- **CRITERIO (`criterioTitle` y `criterioDesc`):** Permanece en el DOM como metadato semántico oculto (`sr-only`) para potenciar la búsqueda sin recargar visualmente la tarjeta.
- **Desplegable `▸ NORMATIVA`:** Ubicado debajo de los tres bloques tras una línea divisoria fina; colapsado por defecto y renderizado únicamente cuando existe normativa asociada.

---

## 3. Mapa de campos: app ↔ estructura visible

El modelo de datos real de la app (`Casuistica`) tiene los siguientes campos:

| Campo de datos | Bloque / Función | ¿Visible en vista pública? | ¿Lo busca el algoritmo? |
|---|---|---|---|
| `number` | `01` | Sí (encabezado) | Sí (peso 14) |
| `dirCode` / `dirName` | `DEP • Ed. Primaria` | Sí (encabezado) | Sí (10 / 6) |
| `title` | Pregunta / título | Sí (encabezado) | Sí (peso 24) |
| `criterioTitle` | `CRITERIO` (etiqueta) | Oculto (`sr-only`) | Sí (peso 16) |
| `criterioDesc` | `CRITERIO` (descripción) | Oculto (`sr-only`) | Sí (peso 6) |
| `desarrollo` | Columna 1: `DESARROLLO` | Sí | Sí (peso 8) |
| `solucion` | Columna 2: `SOLUCIÓN` | Sí | Sí (peso 12) |
| `ejemplo` | Columna 3: `EJEMPLO / RESULTADO ESPERADO` | Sí | Sí (peso 10) |
| `normativa` | `▸ NORMATIVA` (desplegable inferior) | Sí (colapsado, si tiene datos) | Sí (peso 6) |
| `casoEspecifico` | Detalle interno UGEL | No (Solo Modo Admin) | Sí (peso 8) |
| `accion` | Variable auxiliar de acción | No (Oculto) | Sí (peso 10) |

---

## 4. Variables ocultas (no se muestran en público, pero sí se buscan)

Estas variables alimentan el Super Filtro sin ensuciar la vista de producción:

| Campo | Uso | Visible |
|---|---|---|
| `criterioTitle` / `criterioDesc` | Etiqueta de cruce y descripción técnica | Oculto (`sr-only`) |
| `accion` | Palabras clave de acción u orientación auxiliar | No |
| `casoEspecifico` | Detalle interno con nombre de UGEL y caso particular | Solo Modo Administrador |
| `normativa` | Normas, resoluciones y oficios de respaldo | Solo desplegable inferior |

---

## 5. Variable interna de detalle de UGEL (`casoEspecifico` — Solo Admin)

- **Problema:** En producción no debe aparecer el nombre de la UGEL ni el caso particular.
- **Necesidad:** Al revisar o auditar las casuísticas (por ejemplo, de las asistencias técnicas), conviene conservar la referencia exacta y permitir que el buscador la encuentre.
- **Solución:**
  - `desarrollo` → **Público / institucional**. Describe la situación sin nombres propios de UGEL.
  - `casoEspecifico` → **Interno / Admin**. Registra el caso tal como se reportó (con el nombre de la UGEL). Solo se visualiza cuando el **Modo Admin** está activo, pero el buscador lo indexa siempre.

---

## 6. Bloque NORMATIVA (desplegable)

Debajo de las tres columnas principales:

```
──────────────────────────────────────────
▸ NORMATIVA
```

- Por defecto **colapsado**.
- Si el caso no tiene normativa registrada, no se muestra la barra ni ocupa espacio.
- Al hacer clic en `▸ NORMATIVA`, se despliega suavemente mostrando las normas, resoluciones u oficios de respaldo.

---

## 7. Reglas estrictas de fidelidad de contenido y redacción

1. **Prohibido asumir, inventar o recortar contenido:**
   - **Se corrige únicamente redacción, ortografía y estilo, jamás el fondo ni el sentido técnico del caso.**
   - No se debe eliminar información relevante ni modificar el contexto estudiado y validado por el equipo especialista.
2. **No forzar la extensión de los casos:**
   - Si un caso es breve o conciso por naturaleza, queda resumido tal cual, sin agregar texto de relleno para "emparejar" columnas.
3. **Tono institucional claro y directo:**
   - Sin nombres propios de UGEL o personas en la vista pública (esos datos van en `casoEspecifico`).
   - Fidelidad literal a los términos del sistema y normativa (`MC SIGA`, `código modular`, `habilitación de códigos modulares`, `DEP`, `DISER`, etc.).

---

## 8. Ejemplo oficial en producción (Caso #01 — Texto 100% literal aprobado)

```json
{
  "id": "dep-01",
  "number": "01",
  "title": "Cambio de característica de una institución educativa: ¿a qué dirección corresponde asignar los materiales?",
  "criterioTitle": "DEP – DISER",
  "criterioDesc": "Asignación de materiales educativos por cambio de característica de la institución educativa en el MC SIGA.",
  "desarrollo": "La UGEL identifica una institución educativa que ha cambiado de característica (ya envió la solicitud de habilitación de códigos modulares) y tiene dudas sobre a qué dirección debe asignar los materiales educativos: si debe considerar la característica registrada por el MINEDU o la información actualizada que maneja la UGEL.",
  "solucion": "La UGEL debe verificar la característica actual que corresponde a la institución educativa y efectuar la asignación de materiales según corresponda. Al finalizar, en el MC SIGA, solo debe quedar asignado el material correspondiente a dicha institución educativa.",
  "ejemplo": "Por ejemplo, un mismo código modular no puede tener asignados materiales educativos de DEP y DISER a la vez. Asimismo, se debe verificar que la reasignación de los recursos no deje desabastecidas a las II. EE. que anteriormente tenían otra característica.",
  "normativa": "",
  "accion": "",
  "casoEspecifico": ""
}
```

---

## 9. Tabla final de campos del modelo (`Casuistica`)

| Campo | Tipo | Visible en Público | Visible en Admin | Indexado en Buscador | Obligatorio |
|---|---|---|---|---|---|
| `id` | string | No | No | No | Sí |
| `number` | string | Sí | Sí | Sí | Sí |
| `title` | string | Sí | Sí | Sí | Sí |
| `criterioTitle` | string | Oculto (`sr-only`) | Sí (Modal) | Sí | Sí |
| `criterioDesc` | string | Oculto (`sr-only`) | Sí (Modal) | Sí | Sí |
| `desarrollo` | string | Sí (Columna 1) | Sí | Sí | Sí |
| `solucion` | string | Sí (Columna 2) | Sí | Sí | Sí |
| `ejemplo` | string | Sí (Columna 3) | Sí | Sí | Sí |
| `normativa` | string | Sí (Desplegable si existe) | Sí | Sí | No |
| `accion` | string | No | No | Sí | No |
| `casoEspecifico` | string | No | Sí (Nota interna) | Sí | No |

