import { describe, it, expect } from 'vitest';
import { filterRows, sortRows } from './engine';
import { registerColumnType, getColumnType } from './columnTypes';
import type { ColumnDef, FilterState, Hierarchy, SortCriterion } from './types';

interface TestItem {
  id: string;
  name: string;
  priority: 'Crítica' | 'Alta' | 'Media' | 'Baja';
  status: 'Pendiente' | 'En proceso' | 'Completado';
  progress: number;
  startDate: string;
  endDate: string;
  responsible: string[];
  parentId?: string;
}

const COLUMNS: ColumnDef<TestItem>[] = [
  { id: 'name', label: 'Nombre', type: 'text', accessor: (r) => r.name },
  {
    id: 'priority',
    label: 'Prioridad',
    type: 'select',
    accessor: (r) => r.priority,
    sortOrder: ['Crítica', 'Alta', 'Media', 'Baja'],
  },
  {
    id: 'status',
    label: 'Estado',
    type: 'processState',
    accessor: (r) => r.status,
    options: [
      { value: 'Pendiente', label: 'Pendiente' },
      { value: 'En proceso', label: 'En proceso' },
      { value: 'Completado', label: 'Completado' },
    ],
  },
  { id: 'progress', label: 'Avance', type: 'percent', accessor: (r) => r.progress },
  { id: 'startDate', label: 'Inicio', type: 'date', accessor: (r) => r.startDate },
  { id: 'responsible', label: 'Responsable', type: 'person', accessor: (r) => r.responsible },
];

const ITEMS: TestItem[] = [
  { id: '1', name: 'Plan de distribución', priority: 'Media', status: 'En proceso', progress: 60, startDate: '2026-09-04', endDate: '2026-11-30', responsible: ['Carlos Mendoza'] },
  { id: '1.1', name: 'Comité provincial', priority: 'Alta', status: 'Completado', progress: 100, startDate: '2026-09-10', endDate: '2026-09-20', responsible: ['María Salazar'], parentId: '1' },
  { id: '1.2', name: 'Validación de rutas', priority: 'Crítica', status: 'Pendiente', progress: 0, startDate: '2026-09-21', endDate: '2026-10-15', responsible: ['Carlos Mendoza', 'Jorge Ramos'], parentId: '1' },
  { id: '2', name: 'Capacitación territorial', priority: 'Baja', status: 'Pendiente', progress: 0, startDate: '2026-10-01', endDate: '2026-12-15', responsible: ['Lucía Torres'] },
];

const HIERARCHY: Hierarchy<TestItem> = {
  getId: (r) => r.id,
  getParentId: (r) => r.parentId,
};

describe('Table Engine - Filtrado y Ordenamiento Universal', () => {
  const ctx = { today: '2026-10-25' };

  it('filtra por texto (contains / not_contains)', () => {
    const filters: FilterState = { name: { op: 'contains', value: 'comité' } };
    const res = filterRows(ITEMS, COLUMNS, filters, ctx);
    expect(res.map((r) => r.id)).toEqual(['1.1']);
  });

  it('combina valores OR dentro de una misma columna (selección múltiple)', () => {
    const filters: FilterState = {
      status: { op: 'in', values: ['Pendiente', 'Completado'] },
    };
    const res = filterRows(ITEMS, COLUMNS, filters, ctx);
    expect(res.map((r) => r.id)).toEqual(['1.1', '1.2', '2']);
  });

  it('combina condiciones AND entre diferentes columnas', () => {
    const filters: FilterState = {
      status: { op: 'in', values: ['Pendiente', 'En proceso'] },
      priority: { op: 'in', values: ['Crítica', 'Alta'] },
    };
    const res = filterRows(ITEMS, COLUMNS, filters, ctx);
    // Solo 1.2 cumple status Pendiente AND priority Crítica
    expect(res.map((r) => r.id)).toEqual(['1.2']);
  });

  it('filtra por porcentajes y avance', () => {
    const f1: FilterState = { progress: { op: 'with_progress' } };
    expect(filterRows(ITEMS, COLUMNS, f1, ctx).map((r) => r.id)).toEqual(['1', '1.1']);

    const f2: FilterState = { progress: { op: 'zero' } };
    expect(filterRows(ITEMS, COLUMNS, f2, ctx).map((r) => r.id)).toEqual(['1.2', '2']);

    const f3: FilterState = { progress: { op: 'between', value: '50', value2: '100' } };
    expect(filterRows(ITEMS, COLUMNS, f3, ctx).map((r) => r.id)).toEqual(['1', '1.1']);
  });

  it('conserva ancestros en la jerarquía cuando coincide un hijo', () => {
    const filters: FilterState = { name: { op: 'contains', value: 'Validación' } };
    const res = filterRows(ITEMS, COLUMNS, filters, ctx, HIERARCHY);
    // Coincide 1.2, pero su padre '1' se conserva como contexto
    expect(res.map((r) => r.id)).toEqual(['1', '1.2']);
  });

  it('ordena respetando jerarquía semántica (Prioridad: Crítica > Alta > Media > Baja)', () => {
    const criteria: SortCriterion[] = [{ columnId: 'priority', dir: 'asc', mode: 'custom' }];
    const res = sortRows(ITEMS, COLUMNS, criteria);
    expect(res.map((r) => r.priority)).toEqual(['Crítica', 'Alta', 'Media', 'Baja']);
  });

  it('ordena por estado según el flujo del proceso (Pendiente > En proceso > Completado)', () => {
    const criteria: SortCriterion[] = [{ columnId: 'status', dir: 'asc', mode: 'custom' }];
    const res = sortRows(ITEMS, COLUMNS, criteria);
    expect(res.map((r) => r.status)).toEqual(['Pendiente', 'Pendiente', 'En proceso', 'Completado']);
  });

  it('ordena manteniendo la estructura de árbol cuando hay jerarquía', () => {
    // Si ordenamos por prioridad ascendente dentro del árbol:
    // Raíces: '1' (Media), '2' (Baja) -> '1' va primero que '2'
    // Hijos de '1': '1.1' (Alta), '1.2' (Crítica) -> '1.2' (Crítica) va primero que '1.1' (Alta)
    const criteria: SortCriterion[] = [{ columnId: 'priority', dir: 'asc', mode: 'custom' }];
    const res = sortRows(ITEMS, COLUMNS, criteria, HIERARCHY);
    expect(res.map((r) => r.id)).toEqual(['1', '1.2', '1.1', '2']);
  });

  it('soporta multi-ordenamiento con prioridad de criterios', () => {
    const criteria: SortCriterion[] = [
      { columnId: 'status', dir: 'asc', mode: 'custom' },
      { columnId: 'progress', dir: 'desc', mode: 'natural' },
    ];
    const res = sortRows(ITEMS, COLUMNS, criteria);
    // Pendientes primero (1.2 y 2), luego En proceso (1), luego Completado (1.1)
    expect(res[0]?.status).toBe('Pendiente');
    expect(res[res.length - 1]?.status).toBe('Completado');
  });
});
