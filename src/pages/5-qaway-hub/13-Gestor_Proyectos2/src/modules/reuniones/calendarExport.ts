// ─── Utilidades locales para exportación de reuniones ─────────────────
// Autocontenido: NO importa dependencias externas ni de otros módulos.

export interface CalendarExportEvent {
  id?: string;
  title: string;
  description?: string;
  location?: string;
  date: string; // YYYY-MM-DD
  start: string; // HH:mm
  end: string; // HH:mm
}

function formatDateForCalendar(d: Date): string {
  return d.toISOString().replace(/-|:|\.\d+/g, '');
}

function parseDateTime(dateStr: string, timeStr: string): Date {
  const [year, month, day] = (dateStr || '').split('-').map(Number);
  const [hours, minutes] = (timeStr || '00:00').split(':').map(Number);
  return new Date(Date.UTC(year || 2026, (month || 1) - 1, day || 1, (hours || 0) + 5, minutes || 0)); // Ajuste zona UTC-5 Perú
}

export function generateGoogleCalendarUrl(event: CalendarExportEvent): string {
  const start = parseDateTime(event.date, event.start);
  const end = parseDateTime(event.date, event.end);
  const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
  const params = new URLSearchParams({
    text: event.title,
    dates: `${formatDateForCalendar(start)}/${formatDateForCalendar(end)}`,
    details: event.description || '',
    location: event.location || '',
  });
  return `${baseUrl}&${params.toString()}`;
}

function icsEscape(value: string): string {
  return (value || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r/g, '')
    .replace(/\n/g, '\\n');
}

export function downloadIcsFile(event: CalendarExportEvent, filename?: string) {
  const start = parseDateTime(event.date, event.start);
  const end = parseDateTime(event.date, event.end);
  const safeFilename = filename || `reunion-${event.id || 'qaway'}.ics`;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Qaway Lab//Gestor de Proyectos//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id || Date.now()}@qawaylab.com`,
    `SUMMARY:${icsEscape(event.title)}`,
    `DESCRIPTION:${icsEscape(event.description || '')}`,
    `LOCATION:${icsEscape(event.location || '')}`,
    `DTSTART:${formatDateForCalendar(start)}`,
    `DTEND:${formatDateForCalendar(end)}`,
    `DTSTAMP:${formatDateForCalendar(new Date())}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', safeFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
