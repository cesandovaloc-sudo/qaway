// ─── Utilidades locales de exportación de calendario (Reuniones 2) ────────────────
// 100% autocontenido dentro de src/modules/reuniones-2/

export interface CalendarExportPayload {
  id?: string;
  title: string;
  description?: string;
  location?: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  startTime?: string; // HH:mm (opcional, por defecto 09:00)
  endTime?: string; // HH:mm (opcional, por defecto 10:00)
}

function formatDateForCalendar(d: Date): string {
  return d.toISOString().replace(/-|:|\.\d+/g, '');
}

function parseDateTimePE(dateStr: string, timeStr = '09:00'): Date {
  const [year, month, day] = (dateStr || '2026-10-26').slice(0, 10).split('-').map(Number);
  const [hours, minutes] = (timeStr || '09:00').split(':').map(Number);
  return new Date(Date.UTC(year || 2026, (month || 1) - 1, day || 1, (hours || 9) + 5, minutes || 0));
}

export function generateGoogleCalendarUrl(event: CalendarExportPayload): string {
  const start = parseDateTimePE(event.startDate, event.startTime || '09:00');
  const end = parseDateTimePE(event.endDate || event.startDate, event.endTime || '10:00');
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

export function downloadIcsFile(event: CalendarExportPayload, filename?: string) {
  const start = parseDateTimePE(event.startDate, event.startTime || '09:00');
  const end = parseDateTimePE(event.endDate || event.startDate, event.endTime || '10:00');
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
