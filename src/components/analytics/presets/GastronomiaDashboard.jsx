import React, { useState } from 'react'
import {
  UtensilsCrossed,
  DollarSign,
  TrendingUp,
  Clock,
  Flame,
  Percent,
  Layers,
  ShoppingBag
} from 'lucide-react'
import KpiCard from '../ui/KpiCard'
import ChartCard from '../ui/ChartCard'
import AreaChartPro from '../charts/AreaChartPro'
import BarChartPro from '../charts/BarChartPro'
import DonutChartPro from '../charts/DonutChartPro'
import ComposedChartPro from '../charts/ComposedChartPro'
import { gastronomiaData } from './gastronomiaData'
import { formatters } from '../theme'

export default function GastronomiaDashboard({ theme = 'light', palette }) {
  const colors = palette?.colors || ['#ff4b0b', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']
  const { kpis, demandaHoraria, topPlatos, canalesVenta, rentabilidadDiaria } = gastronomiaData

  return (
    <div className="space-y-6">
      {/* 1. KPIs Maestros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Ventas Netas (Mes)"
          value={kpis.ventasNetas}
          formattedValue={formatters.currency(kpis.ventasNetas)}
          change={kpis.ventasNetasChange}
          icon={DollarSign}
          iconColor={colors[0]}
          sparklineData={kpis.sparkVentas}
          sparklineColor={colors[0]}
          subtitle="+14.8% vs mes previo (Meta: S/ 50k)"
          goalProgress={97}
          theme={theme}
        />

        <KpiCard
          title="Ticket Promedio"
          value={kpis.ticketPromedio}
          formattedValue={formatters.currency(kpis.ticketPromedio)}
          change={kpis.ticketChange}
          icon={ShoppingBag}
          iconColor={colors[1]}
          sparklineData={kpis.sparkTicket}
          sparklineColor={colors[1]}
          subtitle="Aumento por venta cruzada (Bebidas/Sides)"
          theme={theme}
        />

        <KpiCard
          title="Food Cost % (Insumos)"
          value={kpis.foodCostPercent}
          formattedValue={formatters.percent(kpis.foodCostPercent)}
          change={kpis.foodCostChange}
          icon={Flame}
          iconColor="#10b981"
          subtitle="Objetivo óptimo ≤ 30% (Excelente margen)"
          theme={theme}
        />

        <KpiCard
          title="Tiempo Medio Entrega"
          value={kpis.tiempoMedioEntrega}
          formattedValue={formatters.duration(kpis.tiempoMedioEntrega)}
          change={kpis.tiempoEntregaChange}
          icon={Clock}
          iconColor={colors[3] || '#f59e0b'}
          subtitle="-2.5 min de mejora en cocina y despacho"
          theme={theme}
        />
      </div>

      {/* 2. Fila Principal de Gráficos: Demanda Horaria y Canales de Venta */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Curva de Demanda Horaria (Área) */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Curva de Demanda por Horario"
            subtitle="Picos de pedidos en Almuerzo (12-3 PM) y Cena (7-10 PM)"
            badge="En Tiempo Real"
            badgeColor="bg-emerald-500/10 text-emerald-600"
            data={demandaHoraria}
            theme={theme}
            infoText="Permite prever refuerzos de personal de cocina y empaque."
          >
            <AreaChartPro
              data={demandaHoraria}
              xAxisKey="hora"
              series={[
                { key: 'salón', name: 'Salón & Mesas', color: colors[0] },
                { key: 'delivery', name: 'Delivery / Takeaway', color: colors[1] }
              ]}
              valueFormatter={(v) => `${v} ped.`}
              theme={theme}
              stacked={true}
            />
          </ChartCard>
        </div>

        {/* Canales de Venta (Donut con Centro Dinámico) */}
        <div>
          <ChartCard
            title="Distribución de Canales"
            subtitle="Facturación desglosada por origen de compra"
            badge="Canales"
            data={canalesVenta}
            theme={theme}
          >
            <DonutChartPro
              data={canalesVenta}
              dataKey="value"
              nameKey="name"
              colors={colors}
              valueFormatter={(v) => formatters.currency(v)}
              theme={theme}
              centerLabel="Ventas Totales"
            />
          </ChartCard>
        </div>
      </div>

      {/* 3. Fila Secundaria: Top Platos & Margen vs Rentabilidad Diaria */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Platos Más Vendidos (Barras Horizontales) */}
        <ChartCard
          title="Top 8 Platos & Burgers más Vendidos"
          subtitle="Ranking de volumen de unidades vendidas en el periodo"
          badge="Menú Analytics"
          data={topPlatos}
          theme={theme}
        >
          <BarChartPro
            data={topPlatos}
            xAxisKey="name"
            layout="vertical"
            series={[
              { key: 'unidades', name: 'Unidades Vendidas', color: colors[0] }
            ]}
            valueFormatter={(v) => `${v} u.`}
            theme={theme}
          />
        </ChartCard>

        {/* Ingresos vs Costo de Insumos vs Merma (Composed Chart) */}
        <ChartCard
          title="Rentabilidad Semanal (Ingresos vs Insumos)"
          subtitle="Comportamiento de costos y margen bruto por día de la semana"
          badge="Financiero"
          badgeColor="bg-blue-500/10 text-blue-600"
          data={rentabilidadDiaria}
          theme={theme}
        >
          <ComposedChartPro
            data={rentabilidadDiaria}
            xAxisKey="dia"
            series={[
              { key: 'ingresos', type: 'bar', name: 'Ingresos Totales', color: colors[1] },
              { key: 'costoInsumos', type: 'line', name: 'Costo Insumos', color: colors[0] },
              { key: 'merma', type: 'area', name: 'Merma Descarte', color: '#f43f5e' }
            ]}
            valueFormatter={(v) => formatters.currency(v)}
            theme={theme}
          />
        </ChartCard>
      </div>
    </div>
  )
}
