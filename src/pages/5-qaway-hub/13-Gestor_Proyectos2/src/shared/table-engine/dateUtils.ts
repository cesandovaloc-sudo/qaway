/** Utilidades de fecha ISO (YYYY-MM-DD) sin dependencias. Semana ISO: lunes–domingo. */

const toUtc = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(Date.UTC(y, (m || 1) - 1, d || 1));
};

const fromUtc = (dt: Date) => dt.toISOString().slice(0, 10);

export const addDays = (iso: string, n: number) => {
  const dt = toUtc(iso);
  dt.setUTCDate(dt.getUTCDate() + n);
  return fromUtc(dt);
};

export const isIso = (s: unknown): s is string => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}/.test(s);

/** Acepta ISO (YYYY-MM-DD…) y el formato local DD/MM/YYYY. */
export const normIso = (s: unknown): string | null => {
  if (isIso(s)) return s.slice(0, 10);
  if (typeof s === 'string') {
    const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s.trim());
    if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  }
  return null;
};

const startOfWeek = (iso: string) => {
  const dow = (toUtc(iso).getUTCDay() + 6) % 7; // lunes = 0
  return addDays(iso, -dow);
};

const monthBounds = (y: number, m: number): [string, string] => {
  const first = new Date(Date.UTC(y, m, 1));
  const last = new Date(Date.UTC(y, m + 1, 0));
  return [fromUtc(first), fromUtc(last)];
};

export type DatePreset =
  | 'today'
  | 'yesterday'
  | 'tomorrow'
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | 'this_quarter'
  | 'this_year';

export const DATE_PRESETS: DatePreset[] = [
  'today',
  'yesterday',
  'tomorrow',
  'this_week',
  'last_week',
  'this_month',
  'last_month',
  'this_quarter',
  'this_year',
];

export const presetRange = (preset: DatePreset, today: string): [string, string] => {
  const t = toUtc(today);
  const y = t.getUTCFullYear();
  const m = t.getUTCMonth();
  switch (preset) {
    case 'today':
      return [today, today];
    case 'yesterday': {
      const d = addDays(today, -1);
      return [d, d];
    }
    case 'tomorrow': {
      const d = addDays(today, 1);
      return [d, d];
    }
    case 'this_week': {
      const s = startOfWeek(today);
      return [s, addDays(s, 6)];
    }
    case 'last_week': {
      const s = addDays(startOfWeek(today), -7);
      return [s, addDays(s, 6)];
    }
    case 'this_month':
      return monthBounds(y, m);
    case 'last_month':
      return monthBounds(m === 0 ? y - 1 : y, m === 0 ? 11 : m - 1);
    case 'this_quarter': {
      const qs = Math.floor(m / 3) * 3;
      return [monthBounds(y, qs)[0], monthBounds(y, qs + 2)[1]];
    }
    case 'this_year':
      return [`${y}-01-01`, `${y}-12-31`];
  }
};
