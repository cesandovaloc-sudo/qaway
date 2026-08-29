export const financieraData = {
  kpis: {
    carteraColocada: 2480000,
    carteraChange: 12.4,
    sparkCartera: [1800000, 1950000, 2100000, 2250000, 2380000, 2480000],
    tasaMoraPAR30: 2.85, // % morosidad >30 días
    tasaMoraChange: -0.45, // bajó mora
    margenFinanciero: 18.2, // % NIM
    margenChange: 1.8,
    ratioCobertura: 165.0, // % cobertura de provisiones
    ratioChange: 4.5
  },
  // Amortizaciones vs Desembolsos y Saldo de Cartera (Composed Chart)
  flujoCartera: [
    { mes: 'Ene', desembolsos: 380000, amortizaciones: 240000, saldoCartera: 1950000 },
    { mes: 'Feb', desembolsos: 420000, amortizaciones: 260000, saldoCartera: 2110000 },
    { mes: 'Mar', desembolsos: 390000, amortizaciones: 280000, saldoCartera: 2220000 },
    { mes: 'Abr', desembolsos: 460000, amortizaciones: 290000, saldoCartera: 2390000 },
    { mes: 'May', desembolsos: 510000, amortizaciones: 320000, saldoCartera: 2580000 },
    { mes: 'Jun', desembolsos: 480000, amortizaciones: 340000, saldoCartera: 2720000 }
  ],
  // Matriz de Scoring de Riesgo Crediticio por Segmento (Radar Chart)
  scoringRiesgo: [
    { subject: 'Capacidad de Pago', score: 88, benchmark: 75 },
    { subject: 'Historial Crediticio', score: 92, benchmark: 80 },
    { subject: 'Garantía / Colateral', score: 78, benchmark: 70 },
    { subject: 'Estabilidad Laboral', score: 85, benchmark: 75 },
    { subject: 'Apalancamiento DTI', score: 72, benchmark: 65 },
    { subject: 'Liquidez Inmediata', score: 80, benchmark: 70 }
  ],
  // Embudo de Colocación de Créditos (Funnel)
  embudoCreditos: [
    { name: 'Solicitudes Recibidas', value: 3840 },
    { name: 'Evaluación y Scoring', value: 2420 },
    { name: 'Créditos Pre-Aprobados', value: 1650 },
    { name: 'Aceptación de Oferta & Firma', value: 1180 },
    { name: 'Desembolsos Efectivos', value: 980 }
  ],
  // Distribución de Cartera por Tipo de Crédito (Donut)
  distribucionCartera: [
    { name: 'Crédito PYME / Comercial', value: 1120000 },
    { name: 'Préstamos Personales', value: 680000 },
    { name: 'Vehicular / Activo Fijo', value: 420000 },
    { name: 'Líneas de Capital de Trabajo', value: 260000 }
  ]
}
