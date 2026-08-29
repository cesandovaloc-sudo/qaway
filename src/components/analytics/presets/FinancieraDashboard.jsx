import React from 'react'
import {
  Landmark,
  TrendingUp,
  ShieldAlert,
  Percent,
  Wallet,
  Scale,
  ArrowDownUp,
  Filter
} from 'lucide-react'
import KpiCard from '../ui/KpiCard'
import ChartCard from '../ui/ChartCard'
import ComposedChartPro from '../charts/ComposedChartPro'
import RadarChartPro from '../charts/RadarChartPro'
import DonutChartPro from '../charts/DonutChartPro'
import FunnelChartPro from '../charts/FunnelChartPro'
import { financieraData } from './financieraData'
import { formatters } from '../theme'

export default function FinancieraDashboard({ theme = 'light', palette }) {
  const colors = palette?.colors || ['#0284c7', '#059669', '#f59e0b', '#8b5cf6', '#ec4899']
  const { kpis, flujoCartera, scoringRiesgo, embudoCreditos, distribucionCartera } = financieraData

  return (
    <div className="space-y-6">
      {/* 1. KPIs Financieros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Cartera Colocada Activa"
          value={kpis.carteraColocada}
          formattedValue={formatters.currency(kpis.carteraColocada)}
          change={kpis.carteraChange}
          icon={Landmark}
          iconColor={colors[0]}
          sparklineData={kpis.sparkCartera}
          sparklineColor={colors[0]}
          subtitle="Saldo total de préstamos vigentes"
          theme={theme}
        />

        <KpiCard
          title="Tasa Morosidad PAR 30"
          value={kpis.tasaMoraPAR30}
          formattedValue={formatters.percent(kpis.tasaMoraPAR30)}
          change={kpis.tasaMoraChange}
          icon={ShieldAlert}
          iconColor="#10b981"
          subtitle="Excelente control de riesgo crediticio (≤3%)"
          theme={theme}
        />

        <KpiCard
          title="Margen Financiero (NIM)"
          value={kpis.margenFinanciero}
          formattedValue={formatters.percent(kpis.margenFinanciero)}
          change={kpis.margenChange}
          icon={TrendingUp}
          iconColor={colors[1] || '#059669'}
          subtitle="Spread neto entre captación y colocación"
          theme={theme}
        />

        <KpiCard
          title="Ratio de Cobertura"
          value={kpis.ratioCobertura}
          formattedValue={formatters.percent(kpis.ratioCobertura)}
          change={kpis.ratioChange}
          icon={Scale}
          iconColor={colors[2] || '#f59e0b'}
          subtitle="Provisiones sobre cartera vencida"
          goalProgress={100}
          theme={theme}
        />
      </div>

      {/* 2. Fila Principal: Flujo de Cartera (Composed) & Embudo de Colocación (Funnel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Flujo de Cartera y Amortizaciones (Composed) */}
        <div className="lg:col-span-7">
          <ChartCard
            title="Evolución de Cartera & Amortizaciones"
            subtitle="Desembolsos mensuales frente a recuperaciones y saldo acumulado"
            badge="Liquidez & Balance"
            badgeColor="bg-blue-500/10 text-blue-600"
            data={flujoCartera}
            theme={theme}
          >
            <ComposedChartPro
              data={flujoCartera}
              xAxisKey="mes"
              series={[
                { key: 'desembolsos', type: 'bar', name: 'Nuevos Desembolsos', color: colors[0] },
                { key: 'amortizaciones', type: 'bar', name: 'Amortizaciones Recibidas', color: colors[1] },
                { key: 'saldoCartera', type: 'line', name: 'Saldo Cartera Total', color: '#f59e0b' }
              ]}
              valueFormatter={(v) => formatters.currency(v)}
              theme={theme}
            />
          </ChartCard>
        </div>

        {/* Embudo de Créditos (Funnel) */}
        <div className="lg:col-span-5">
          <ChartCard
            title="Embudo de Colocación Crediticia"
            subtitle="Tasa de conversión desde solicitud hasta desembolso final"
            badge="Pipeline"
            data={embudoCreditos}
            theme={theme}
          >
            <FunnelChartPro
              data={embudoCreditos}
              colors={colors}
              valueFormatter={(v) => `${v.toLocaleString()} solic.`}
              theme={theme}
            />
          </ChartCard>
        </div>
      </div>

      {/* 3. Fila Secundaria: Matriz de Scoring de Riesgo (Radar) & Distribución (Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scoring de Riesgo Radar */}
        <ChartCard
          title="Matriz Radar de Scoring Crediticio"
          subtitle="Evaluación de salud financiera vs benchmark del mercado"
          badge="Riesgo"
          data={scoringRiesgo}
          theme={theme}
        >
          <RadarChartPro
            data={scoringRiesgo}
            subjectKey="subject"
            series={[
              { key: 'score', name: 'Puntaje Cartera', color: colors[0] },
              { key: 'benchmark', name: 'Benchmark Sectorial', color: '#94a3b8' }
            ]}
            valueFormatter={(v) => `${v} pts`}
            theme={theme}
          />
        </ChartCard>

        {/* Distribución por Tipo de Préstamo (Donut) */}
        <ChartCard
          title="Composición de Cartera por Producto"
          subtitle="Concentración de capital por líneas de crédito"
          badge="Portafolio"
          data={distribucionCartera}
          theme={theme}
        >
          <DonutChartPro
            data={distribucionCartera}
            dataKey="value"
            nameKey="name"
            colors={colors}
            valueFormatter={(v) => formatters.currency(v)}
            theme={theme}
            centerLabel="Total Colocado"
          />
        </ChartCard>
      </div>
    </div>
  )
}
