# Plan de Implementación Futuro: Módulo Reuniones Territorial y Virtual

> **Estado**: Planificado para ejecución posterior (siguiente iteración tras estabilización de Cronograma).  
> **Referencia de Diseño Estricto**: Módulo Cronograma Maestro (`/hub/gestor_proyecto/cronograma`).  
> **Fecha de formulación**: 28 de octubre de 2026.

---

## 1. Contexto y Objetivos
El módulo **Reuniones** (`/hub/gestor_proyecto/reuniones`) debe asistir en la coordinación integral territorial y digital del proyecto (MINEDU · Dotación 2027), alineado a la paleta, tokens, ergonomía visual y patrones del Cronograma.

Se distinguen dos ejes operativos centrales:
1. **Modalidad Presencial**: Planificación y programación en territorio con apoyo de mapas y logística de traslados.
2. **Modalidad Virtual**: Agendamiento vía calendario interactivo con Google Meet y control de asistencia digital.

---

## 2. Especificación Funcional

### A. Reuniones Presenciales (Coordinación Territorial)
* **Matriz de 9 UGELs de Junín**:
  * Huancayo, Concepción, Chupaca, Jauja, Tarma, Yauli (La Oroya), Junín, Satipo, Pichanaqui.
  * Tiempos de desplazamiento y distancias estimadas por tramo vial.
* **Asistente de Programación y Alerta Logística**:
  * Cálculo del tiempo acumulado de traslado y margen previo.
  * Advertencia automática si dos visitas presenciales se solapan con el tiempo de viaje interprovincial.
* **Visualizador Territorial y Selección de Sedes**:
  * Fichas de sedes con dirección, contacto en UGEL y accesibilidad.
  * Botón para trazar ruta estimada.

### B. Reuniones Virtuales (Google Meet + Calendario)
* **Generación de Sala**:
  * Creación y copia de enlaces de Google Meet.
  * Enlace directo para abrir la sala en pestaña externa.
* **Control Digital de Asistencia**:
  * Registro por participante con estados: `Presente`, `Ausente`, `Justificado`.
  * Cálculo de quórum en tiempo real.
* **Trazabilidad hacia Actas y Acuerdos**:
  * Exportación de lista de asistencia y compromisos hacia el módulo de Actas.

---

## 3. Criterios de Calidad Visual
* Sin elementos huérfanos ni selects nativos planos; usar popovers redondeados estilo tarjeta de filtro.
* Drawer lateral con backdrop desenfocado, cierre con `Escape` y alerta centrada de cambios sin guardar.
