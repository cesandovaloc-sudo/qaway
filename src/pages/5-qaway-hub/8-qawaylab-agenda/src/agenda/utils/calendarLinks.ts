// ─── Utilidades para enlaces de calendario ───────────────────────────

export interface CalendarEventDetails {
  title: string
  description?: string
  location?: string
  startAt: string | Date
  endAt: string | Date
}

function formatDateForCalendar(d: Date): string {
  return d.toISOString().replace(/-|:|\.\d+/g, '')
}

export function generateGoogleCalendarUrl(event: CalendarEventDetails): string {
  const start = new Date(event.startAt)
  const end = new Date(event.endAt)
  const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE'
  const params = new URLSearchParams({
    text: event.title,
    dates: `${formatDateForCalendar(start)}/${formatDateForCalendar(end)}`,
    details: event.description || '',
    location: event.location || '',
  })
  return `${baseUrl}&${params.toString()}`
}

export function downloadIcsFile(event: CalendarEventDetails, filename = 'reserva.ics') {
  const start = new Date(event.startAt)
  const end = new Date(event.endAt)
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Qaway Lab//Agenda App//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${(event.description || '').replace(/\n/g, '\\n')}`,
    `LOCATION:${event.location || ''}`,
    `DTSTART:${formatDateForCalendar(start)}`,
    `DTEND:${formatDateForCalendar(end)}`,
    `DTSTAMP:${formatDateForCalendar(new Date())}`,
    `STATUS:CONFIRMED`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
