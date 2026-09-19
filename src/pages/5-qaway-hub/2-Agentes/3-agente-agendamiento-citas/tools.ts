export interface BookingSlotLink {
  serviceType: string
  bookingUrl: string
  durationMinutes: number
}

/**
 * Genera el enlace oficial de agendamiento según el servicio
 */
export function getBookingUrl(serviceType = 'diagnostico'): BookingSlotLink {
  return {
    serviceType,
    bookingUrl: '/hub/agenda',
    durationMinutes: 30
  }
}
