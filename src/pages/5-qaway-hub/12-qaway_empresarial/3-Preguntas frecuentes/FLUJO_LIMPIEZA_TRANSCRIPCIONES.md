# Protocolo y Flujo de Limpieza de Transcripciones — Banco de Casuísticas

**MINEDU • DIGERE | Módulo:** `/hub/preguntas-frecuentes`  
**Objetivo:** Transformar transcripciones de audio (asistencias técnicas, grabaciones de video, Whisper/IA) en casuísticas oficiales estructuradas, eliminando errores acústicos y estandarizando el formato antes de pasar a producción.

---

## 1. El Flujo de Trabajo Estandarizado (Paso a Paso)

Este flujo es **repetible** para cualquier nuevo lote de casuísticas que provenga de videos o transcripciones automáticas:

```
[Audio / Video Asistencia Técnica]
               │
               ▼
   1. Transcripción Cruda (JSON inicial con errores acústicos)
               │
               ▼
   2. Limpieza de Glosario Técnico (Corrección de siglas, lenguas y UGEL)
               │
               ▼
   3. Separación Estructural:
      ├─ Título en 2 filas: [Asunto / Contexto] + [¿Pregunta concreta?]
      ├─ Filtrado de UGEL: Nombre de UGEL ➔ casoEspecifico (Oculto en público)
      ├─ Redacción Institucional: desarrollo, solucion y ejemplo
      └─ Normativa PMV: RM N.° 373-2026-MINEDU / Oficios DIGERE
               │
               ▼
   4. Validación de Calidad (Cero errores de formato)
               │
               ▼
   5. Publicación en el Banco Oficial (app web)
```

---

## 2. Diccionario de Correcciones Acústicas (Glosario Oficial)

Las herramientas de transcripción por audio confunden frecuentemente términos técnicos del MINEDU por similitud fonética. **Aplicar obligatoriamente este mapeo:**

### A. Sistemas y Plataformas Oficiales
| Error común de transcripción | Término Oficial MINEDU | Significado / Contexto |
|---|---|---|
| `SILLAGI` / `sillagi` / `Siyagi` | **SIAGIE** | Sistema de Información de Apoyo a la Gestión de la Institución Educativa. |
| `siga` / `mc siga` / `MC-SIGA` | **MC SIGA** | Módulo de Configuración del Sistema Integrado de Gestión Administrativa. |
| `pecosa` / `PECOSA` | **PECOSA** | Pedido Comprobante de Salida (documento de entrega formal de materiales). |
| `codigo modular` / `cod modular` | **Código modular** | Identificador único de 7 dígitos de cada servicio educativo. |

### B. Modalidades y Servicios Educativos
| Error común de transcripción | Término Oficial MINEDU | Significado / Contexto |
|---|---|---|
| `Pronois` / `pronois` / `PRONOIS` | **PRONOEI** | Programa No Escolarizado de Educación Inicial (Ciclo I: Cunas, Ciclo II: Salas de Educación Temprana). |
| `EBI` / `ebi` | **EIB** | Educación Intercultural Bilingüe. |
| `EBE` / `ebe` | **EBE** | Educación Básica Especial (CEBE, PRITE). |
| `cuna con auxiliar` | **Cuna (Ciclo I)** | Servicio escolarizado de 0 a 2 años con docente/auxiliar. |

### C. Lenguas Originarias (Fonética indígena corregida)
| Error común de transcripción | Forma Oficial (Padrón MINEDU) | Observaciones |
|---|---|---|
| `Jarabut` / `harabut` / `jarabut` | **Harakbut** | Lengua originaria de Madre de Dios y Cusco. |
| `Ahuajun` / `ahuajun` / `Aguajun` | **Awajún** | Lengua de la familia Jíbaro (Amazonas, Loreto, San Martín, Cajamarca). |
| `ashaninka` / `Ashaninca` | **Asháninka** | Lengua originaria de la selva central (con tilde oficial). |
| `quechua chanka` | **Quechua Chanka** | Variante lingüística de Ayacucho, Huancavelica y Apurímac. |
| `quechua collao` | **Quechua Collao** | Variante lingüística de Cusco y Puno. |

### D. Nombres de UGEL y Provincias
| Error común de transcripción | Nombre Oficial de UGEL | Región |
|---|---|---|
| `UGEL Mano` / `Ugel mano` | **UGEL Manu** | Madre de Dios |
| `El UGEL de Ambos` / `UGEL Ambos` | **UGEL Ambo** | Huánuco |
| `UGEL de Bilimasa` | **UGEL Bellavista** *(o Balsapuerto según contexto)* | San Martín / Loreto |
| `UGEL Víctor Fajardo` | **UGEL Fajardo** | Ayacucho |
| `UGEL La Convención` | **UGEL La Convención** | Cusco |
| `Coronel Portillo` | **UGEL Coronel Portillo** | Ucayali |

---

## 3. Reglas de Transformación del Contenido

### Regla 1: Título en 2 Filas (Para buscador y tarjeta)
El título no debe ser una sola frase larga. Se estructura en dos partes separadas por dos puntos y espacio (`: `):
- **Fila 1 (Asunto / Contexto):** Entre 4 y 9 palabras que identifiquen el tema específico.
- **Fila 2 (Pregunta directa):** La interrogante concreta que resuelve la casuística.

> **Ejemplo:**  
> `title: "Asignación en lengua originaria (Asháninka) – 4 y 5 años: ¿Cómo proceder ante una dotación insuficiente?"`

### Regla 2: Aislamiento del Nombre de UGEL (Privacidad y Búsqueda)
- **Prohibido en `desarrollo`:** Ningún nombre de UGEL o DRE puede quedar en la vista pública.
- **Destino obligatorio:** El texto original que nombra la UGEL se guarda en **`casoEspecifico`**.
- **Beneficio:** En producción se lee genérico e institucional, pero si alguien escribe en el Super Filtro *"Coronel Portillo"* o *"UGEL Manu"*, el algoritmo encuentra la casuística de inmediato.

### Regla 3: Tono Oral vs. Tono Institucional
Las transcripciones traen muletillas orales que deben pulirse sin recortar el sentido técnico:
- ❌ *"Esta es una información que el equipo tendría que atender, se toma nota..."*
- ✅ *"La consulta debe ser canalizada con el equipo de Educación Básica Especial para la validación del padrón..."*
- ❌ *"La cantidad se ve con un año anterior, por eso llenen el SILLAGI..."*
- ✅ *"La proyección se determina anualmente según la estadística registrada en el SIAGIE..."*

### Regla 4: Normativa para el PMV
Para esta etapa (PMV), no se colocan generalidades vacías ni párrafos extensos de leyes. Se asigna la referencia técnica puntual aplicable:
- Materiales en general: `RM N.° 373-2026-MINEDU — Norma técnica sobre dotación y distribución de materiales educativos.`
- Distribución y SIGA: `Oficio Múltiple N.° 032-2026-MINEDU/VMGP/DIGERE — Pautas de monitoreo y distribución en MC SIGA.`
- Lenguas originarias: `RM N.° 373-2026-MINEDU / Padrón Nacional de Instituciones Educativas EIB.`

---

## 4. Estructura JSON Final de Cada Casuística

Cada caso del archivo limpio debe tener exactamente esta forma:

```json
{
  "id": "dei-001",
  "number": "01",
  "title": "Atención de cunas con auxiliar no focalizadas: ¿Qué materiales educativos les corresponde asignar?",
  "criterioTitle": "Cobertura y Focalización de Cunas",
  "criterioDesc": "Las cunas con auxiliar registradas en el padrón nacional tienen derecho a dotación educativa.",
  "desarrollo": "Se identifica una institución educativa del nivel inicial que brinda atención como cuna mediante auxiliar, pero no figura en el listado preliminar de focalizadas. Se consulta si corresponde asignarle materiales educativos.",
  "solucion": "La UGEL debe verificar si el servicio se encuentra formalmente registrado como cuna en el registro nacional de instituciones educativas. Si está registrada, le corresponde la dotación y se coordina con la DRE su priorización.",
  "ejemplo": "En una cuna no focalizada pero con registro activo, la UGEL solicita la ampliación de cobertura para la siguiente dotación y gestiona material excedente para el periodo actual.",
  "normativa": "RM N.° 373-2026-MINEDU — Norma técnica sobre dotación y distribución de materiales educativos para el año lectivo.",
  "casoEspecifico": "Consulta reportada desde UGEL Huamanga sobre cuna con atención auxiliar no focalizada.",
  "accion": "",
  "isOpen": false
}
```

---

## 5. Script Automatizado para Procesar Nuevos Archivos

Para no hacer esto a mano en los siguientes archivos de video, se cuenta con el script automatizado:
`scripts/clean_transcriptions.js`

**Ejecución:**
```bash
node scripts/clean_transcriptions.js "ruta/al/nuevo_archivo_transcripcion.json"
```

El script aplica automáticamente:
1. Reemplazo del diccionario fonético (`SILLAGI` ➔ `SIAGIE`, `Pronois` ➔ `PRONOEI`, `Jarabut` ➔ `Harakbut`, etc.).
2. Detección automática de nombres de UGEL y migración a `casoEspecifico`.
3. Normalización de `desarrollo` en tono institucional.
4. Asignación de `normativa` de referencia oficial.
