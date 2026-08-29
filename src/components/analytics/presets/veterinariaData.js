export const veterinariaData = {
  kpis: {
    pacientesAtendidos: 542,
    pacientesChange: 18.2,
    sparkPacientes: [380, 410, 450, 490, 520, 542],
    ticketPromedio: 165.80,
    ticketChange: 8.5,
    sparkTicket: [142, 148, 155, 160, 165.8],
    tasaRecurrencia: 74.5, // % de pacientes que vuelven en menos de 90 días
    tasaRecurrenciaChange: 5.1,
    ocupacionQuirofano: 82.0, // %
    ocupacionChange: 4.2
  },
  // Metas preventivas anuales (RadialBar)
  metasPreventivas: [
    { name: 'Vacunación Séxtuple/Triple', value: 88, fill: '#10b981' },
    { name: 'Desparasitación Periódica', value: 92, fill: '#3b82f6' },
    { name: 'Profilaxis Dental Preventiva', value: 68, fill: '#f59e0b' },
    { name: 'Chequeo Geriátrico (+7 años)', value: 54, fill: '#8b5cf6' }
  ],
  // Distribución de pacientes por especie (Donut)
  especiesData: [
    { name: 'Caninos (Perros)', value: 340, ingresos: 58200 },
    { name: 'Felinos (Gatos)', value: 165, ingresos: 26400 },
    { name: 'Aves & Psitácidos', value: 22, ingresos: 3200 },
    { name: 'Pequeños Mamíferos (Conejos/Cobayos)', value: 15, ingresos: 2100 }
  ],
  // Facturación desglosada por línea de servicio (Bar Chart)
  facturacionServicios: [
    { servicio: 'Cirugías & Quirófano', ingresos: 34800, margen: 72 },
    { servicio: 'Consultas Médicas & Urgencias', ingresos: 24500, margen: 85 },
    { servicio: 'Farmacia & Vacunas', ingresos: 18900, margen: 48 },
    { servicio: 'Diagnóstico por Imágenes / Lab', ingresos: 15400, margen: 65 },
    { servicio: 'Grooming & Estética Spa', ingresos: 11200, margen: 60 },
    { servicio: 'Pet Shop & Alimento Premium', ingresos: 9800, margen: 35 }
  ],
  // Evolución de Consultas Programadas vs Urgencias (Line Chart)
  atencionesMensuales: [
    { mes: 'Ene', programadas: 240, urgencias: 65 },
    { mes: 'Feb', programadas: 270, urgencias: 72 },
    { mes: 'Mar', programadas: 310, urgencias: 80 },
    { mes: 'Abr', programadas: 330, urgencias: 75 },
    { mes: 'May', programadas: 380, urgencias: 88 },
    { mes: 'Jun', programadas: 420, urgencias: 94 }
  ]
}
