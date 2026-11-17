/**
 * organizacionJerarquia.ts
 * ========================
 * Numeración jerárquica DETERMINISTA para el bosque de `gestor_unidades`
 * (múltiples raíces; hoy: los 251 seeds DRE/UGEL con parent_unit_id NULL).
 *
 * Módulo PURO: sin Supabase, sin React, sin efectos. Reutilizable por el
 * servicio, la vista de verificación y el futuro bridge al organigrama.
 *
 * GARANTÍA DE DETERMINISMO — criterio de desempate, en cascada:
 *   1. `orden` ascendente entre hermanos. NULL va SIEMPRE al final
 *      (NULLS LAST: un hermano sin orden no puede adelantar a uno ordenado).
 *   2. Si `orden` empata (o ambos son NULL), gana el índice de inserción que el
 *      llamador provea en `fallbackInsercion`. En BD se deriva de
 *      `(created_at, id)` — ver migración 20261114_0005 (comentario de columna).
 *   3. Desempate FINAL: comparación de `id` por unidades de código UTF-16
 *      (`a < b`). Se usa `<`/`>` y NO `localeCompare`, que varía por
 *      entorno/locale y rompería el determinismo.
 *
 * El comparador resultante es un ORDEN TOTAL sobre ids distintos, por lo que el
 * resultado NO depende del orden del arreglo de entrada ni del orden en que
 * Supabase devuelva las filas: cualquier permutación de la entrada produce el
 * mismo Map (verificado en organizacionJerarquia.test.ts con entradas barajadas).
 *
 * Reglas de robustez:
 *   · Bosque: admite N raíces (parentUnitId null).
 *   · Huérfanos (parentUnitId que no existe): se tratan como raíces y
 *     `detectarHuerfanos` los lista para corrección posterior.
 *   · Ciclos (incluido auto-padre A→A): los miembros del ciclo y sus
 *     descendientes atrapados quedan EXCLUIDOS de la numeración y son listados
 *     por `detectarCiclos`; el resto del bosque se numera normalmente.
 *   · Recorrido ITERATIVO (sin recursión): profundidad libre, sin desbordar
 *     la pila. Coste O(n log n) por cálculo completo (por el sort de hermanos).
 *   · No muta la entrada.
 *
 * La numeración es caché de PRESENTACIÓN: jamás se persiste, no es identidad ni
 * FK. La verdad jerárquica es parent_unit_id; `id`, `code` y `metadata` nunca
 * cambian al mover/reordenar (solo cambia la ruta calculada).
 */

export interface NodoJerarquia {
  id: string;
  parentUnitId: string | null;
  /** Posición ENTRE hermanos decidida por el usuario. NULL = orden de inserción. */
  orden?: number | null;
}

export interface NumeracionNodo {
  /** Ruta visible: '1', '1.1', '1.1.1', '1.1.1.1'… (formato SERVIR 01/01.1 es solo presentación). */
  ruta: string;
  /** Profundidad: 1 = raíz. */
  nivel: number;
  /** Posición 1..n dentro de sus hermanos. */
  posicionHermano: number;
}

/** id → índice de inserción (0, 1, 2…). En BD: derivado de `created_at, id`. */
export type FallbackInsercion = ReadonlyMap<string, number>;

const POSITIVO_INF = Number.POSITIVE_INFINITY;

/** Comparación por unidades de código UTF-16: idéntica en todos los entornos. */
function compararTexto(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/** `orden` finito o +∞ (NULL/NaN → NULLS LAST). */
function ordenEfectivo(nodo: NodoJerarquia | undefined): number {
  if (!nodo) return POSITIVO_INF;
  const o = nodo.orden;
  return typeof o === 'number' && Number.isFinite(o) ? o : POSITIVO_INF;
}

/**
 * Ids de nodos cuyo parentUnitId apunta a una unidad inexistente.
 * Ordenados por id (salida determinista).
 */
export function detectarHuerfanos(nodos: NodoJerarquia[]): string[] {
  const ids = new Set<string>();
  for (const n of nodos) ids.add(n.id);
  const huerfanos: string[] = [];
  for (const n of nodos) {
    if (n.parentUnitId != null && !ids.has(n.parentUnitId)) huerfanos.push(n.id);
  }
  return huerfanos.sort(compararTexto);
}

/**
 * Ids excluidos por ciclos: los nodos que integran un ciclo (incluido el
 * auto-padre A→A) MÁS sus descendientes atrapados (los que cuelgan debajo y
 * nunca alcanzan una raíz). Detección iterativa de 3 colores, O(n).
 * La salida se ordena por id (determinista).
 */
export function detectarCiclos(nodos: NodoJerarquia[]): string[] {
  // Registro de padres: si hubiera ids duplicados, la primera aparición gana.
  const padre = new Map<string, string | null>();
  for (const n of nodos) if (!padre.has(n.id)) padre.set(n.id, n.parentUnitId ?? null);

  const SIN_VISITAR = 0;
  const RESUELTO = 2;
  const color = new Map<string, number>();
  for (const id of padre.keys()) color.set(id, SIN_VISITAR);

  const excluidos = new Set<string>();

  for (const inicio of padre.keys()) {
    if (color.get(inicio) !== SIN_VISITAR) continue;

    // Sube por la cadena de padres hasta: raíz (null), ciclo, huérfano o nodo
    // ya resuelto. `cadena` queda en orden ascendente: [inicio, padre, abuelo…].
    const cadena: string[] = [];
    const enCadena = new Set<string>();
    let actual: string | null = inicio;
    let corteCiclo: string | null = null;

    while (actual !== null && color.get(actual) === SIN_VISITAR) {
      if (enCadena.has(actual)) { corteCiclo = actual; break; }
      enCadena.add(actual);
      cadena.push(actual);
      const sig = padre.get(actual);
      // Padre inexistente (huérfano) → la cadena termina limpia aquí.
      actual = sig === undefined ? null : sig;
    }

    if (corteCiclo !== null) {
      // TODO `cadena` queda excluido: el sufijo desde `corteCiclo` SON miembros
      // del ciclo y el prefijo (más profundo) son descendientes atrapados.
      for (const id of cadena) { excluidos.add(id); color.set(id, RESUELTO); }
    } else {
      // Cadena terminada sin ciclo; solo hereda exclusión si terminó en un nodo
      // ya marcado como excluido (descendiente de un ciclo previo).
      const hereda = actual !== null && excluidos.has(actual);
      for (const id of cadena) {
        color.set(id, RESUELTO);
        if (hereda) excluidos.add(id);
      }
    }
  }

  return [...excluidos].sort(compararTexto);
}

/**
 * Calcula la numeración jerárquica del bosque completo.
 *
 * @param nodos Todas las unidades (una fila por unidad; ids duplicados: gana el
 *              primero). El arreglo NO se muta y su orden es irrelevante.
 * @param fallbackInsercion Mapa opcional id → índice de inserción (0,1,2…) para
 *              desempatar `orden` iguales / NULL. En BD: `(created_at, id)`.
 * @returns Map id → { ruta, nivel, posicionHermano }. Los nodos excluidos por
 *              ciclo (y atrapados) NO aparecen en el resultado.
 */
export function calcularNumeracion(
  nodos: NodoJerarquia[],
  fallbackInsercion?: FallbackInsercion,
): Map<string, NumeracionNodo> {
  const resultado = new Map<string, NumeracionNodo>();
  if (nodos.length === 0) return resultado;

  // 1 · Registro único (primera aparición gana ante ids duplicados).
  const porId = new Map<string, NodoJerarquia>();
  for (const n of nodos) if (!porId.has(n.id)) porId.set(n.id, n);

  // 2 · Excluidos por ciclo (miembros + descendientes atrapados).
  const excluidos = new Set(detectarCiclos([...porId.values()]));

  // 3 · Agrupación: hijos por padre; raíces = parent null O huérfanos.
  const ids = new Set(porId.keys());
  const hijos = new Map<string, string[]>();
  const raices: string[] = [];

  for (const n of porId.values()) {
    if (excluidos.has(n.id)) continue;
    let clave: string | null;
    if (n.parentUnitId == null) clave = null;
    else if (!ids.has(n.parentUnitId)) clave = null; // huérfano → se trata como raíz
    else if (excluidos.has(n.parentUnitId)) continue; // inalcanzable: los atrapados ya están excluidos
    else clave = n.parentUnitId;

    if (clave === null) raices.push(n.id);
    else {
      const lista = hijos.get(clave);
      if (lista) lista.push(n.id);
      else hijos.set(clave, [n.id]);
    }
  }

  // 4 · Orden total de hermanos (criterio documentado en la cabecera).
  const ordenarHermanos = (lista: string[]): string[] =>
    lista.sort((a, b) => {
      const oa = ordenEfectivo(porId.get(a));
      const ob = ordenEfectivo(porId.get(b));
      if (oa !== ob) return oa < ob ? -1 : 1;
      const ia = fallbackInsercion?.get(a) ?? POSITIVO_INF;
      const ib = fallbackInsercion?.get(b) ?? POSITIVO_INF;
      if (ia !== ib) return ia < ib ? -1 : 1;
      return compararTexto(a, b);
    });

  // 5 · Recorrido iterativo (cola con cursor). El valor de cada nodo depende
  //     solo de su padre y de su posición entre hermanos, por lo que el orden de
  //     visita no afecta el resultado.
  const marco: Array<{ id: string; ruta: string; nivel: number; pos: number }> = [];
  const raicesOrdenadas = ordenarHermanos(raices);
  raicesOrdenadas.forEach((id, i) => {
    marco.push({ id, ruta: String(i + 1), nivel: 1, pos: i + 1 });
  });

  let cursor = 0;
  while (cursor < marco.length) {
    const m = marco[cursor];
    cursor += 1;
    if (!m) break; // inalcanzable bajo el límite del bucle (defensivo, noUncheckedIndexedAccess)
    resultado.set(m.id, { ruta: m.ruta, nivel: m.nivel, posicionHermano: m.pos });
    const listaHijos = hijos.get(m.id);
    if (!listaHijos) continue;
    ordenarHermanos(listaHijos).forEach((hijo, i) => {
      marco.push({ id: hijo, ruta: `${m.ruta}.${i + 1}`, nivel: m.nivel + 1, pos: i + 1 });
    });
  }

  return resultado;
}
