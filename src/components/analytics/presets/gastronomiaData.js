export const gastronomiaData = {
  kpis: {
    ventasNetas: 48560,
    ventasNetasChange: 14.8,
    sparkVentas: [32000, 34500, 39000, 42000, 46000, 48560],
    ticketPromedio: 42.50,
    ticketChange: 6.2,
    sparkTicket: [38.2, 39.0, 40.5, 41.0, 42.5],
    foodCostPercent: 28.4,
    foodCostChange: -2.1, // bajó el costo (positivo)
    tiempoMedioEntrega: 18.5, // minutos
    tiempoEntregaChange: -12.4, // más rápido
    tasaMerma: 1.8, // % de merma
  },
  // Demanda por franjas horarias (Picos Almuerzo 12-3 PM y Cena 7-11 PM)
  demandaHoraria: [
    { hora: '11:00', pedidos: 12, ventas: 480, salón: 8, delivery: 4 },
    { hora: '12:00', pedidos: 48, ventas: 2150, salón: 32, delivery: 16 },
    { hora: '13:00', pedidos: 96, ventas: 4420, salón: 68, delivery: 28 },
    { hora: '14:00', pedidos: 74, ventas: 3380, salón: 46, delivery: 28 },
    { hora: '15:00', pedidos: 28, ventas: 1240, salón: 18, delivery: 10 },
    { hora: '16:00', pedidos: 15, ventas: 620, salón: 9, delivery: 6 },
    { hora: '17:00', pedidos: 22, ventas: 940, salón: 12, delivery: 10 },
    { hora: '18:00', pedidos: 45, ventas: 1980, salón: 20, delivery: 25 },
    { hora: '19:00', pedidos: 88, ventas: 3960, salón: 38, delivery: 50 },
    { hora: '20:00', pedidos: 124, ventas: 5850, salón: 54, delivery: 70 },
    { hora: '21:00', pedidos: 142, ventas: 6720, salón: 62, delivery: 80 },
    { hora: '22:00', pedidos: 85, ventas: 3940, salón: 30, delivery: 55 },
    { hora: '23:00', pedidos: 24, ventas: 980, salón: 6, delivery: 18 }
  ],
  // Top 8 Burgers & Platos más vendidos
  topPlatos: [
    { name: 'Smash Doble Bacon BBQ', unidades: 485, ingresos: 16975, margen: 68 },
    { name: 'Classic Cheeseburger', unidades: 412, ingresos: 11536, margen: 72 },
    { name: 'Truffle & Mushroom Melt', unidades: 320, ingresos: 13440, margen: 64 },
    { name: 'Crispy Chicken Nashville', unidades: 298, ingresos: 10132, margen: 70 },
    { name: 'Smash Cuádruple Monster', unidades: 215, ingresos: 9675, margen: 61 },
    { name: 'Papas Rústicas Cheddar-Bacon', unidades: 540, ingresos: 9720, margen: 82 },
    { name: 'Tequeños Artesanales (8u)', unidades: 380, ingresos: 7600, margen: 78 },
    { name: 'Milkshake Salty Caramel', unidades: 260, ingresos: 4420, margen: 75 }
  ],
  // Distribución de canales de venta
  canalesVenta: [
    { name: 'Salón & Terraza', value: 21450, pedidos: 460 },
    { name: 'Delivery Propio (WhatsApp/Web)', value: 16890, pedidos: 380 },
    { name: 'Apps Delivery (Rappi/PedidosYa)', value: 7420, pedidos: 195 },
    { name: 'Para Llevar / Takeaway', value: 2800, pedidos: 78 }
  ],
  // Evolución Diaria: Ingresos vs Costo de Insumos vs Merma
  rentabilidadDiaria: [
    { dia: 'Lun', ingresos: 4200, costoInsumos: 1180, merma: 75 },
    { dia: 'Mar', ingresos: 4850, costoInsumos: 1360, merma: 82 },
    { dia: 'Mie', ingresos: 5400, costoInsumos: 1510, merma: 90 },
    { dia: 'Jue', ingresos: 6800, costoInsumos: 1890, merma: 110 },
    { dia: 'Vie', ingresos: 9400, costoInsumos: 2650, merma: 145 },
    { dia: 'Sab', ingresos: 11200, costoInsumos: 3180, merma: 190 },
    { dia: 'Dom', ingresos: 8900, costoInsumos: 2510, merma: 130 }
  ]
}
