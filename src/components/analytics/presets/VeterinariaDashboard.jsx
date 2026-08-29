import React from 'react'
import {
  HeartPulse,
  Activity,
  CalendarCheck,
  Stethoscope,
  Scissors,
  ShieldCheck,
  Percent,
  PawPrint
} from 'lucide-react'
import KpiCard from '../ui/KpiCard'
import ChartCard from '../ui/ChartCard'
import LineChartPro from '../charts/LineChartPro'
import BarChartPro from '../charts/BarChartPro'
import DonutChartPro from '../charts/DonutChartPro'
import RadialBarChartPro from '../charts/RadialBarChartPro'
import { veterinariaData } from './veterinariaData'
import { formatters } from '../theme'

export default function VeterinariaDashboard({ theme = 'light', palette }) {
  const colors = palette?.colors || ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899']
  const { kpis, metasPreventivas, especiesData, facturacionServicios, atencionesMensuales } = veterinariaData

  return (
    <div className="space-y-6">
      {/* 1. KPIs de Salud Clínica */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Pacientes Atendidos"
          value={kpis.pacientesAtendidos}
          formattedValue={`${kpis.pacientesAtendidos} pacientes`}
          change={kpis.pacientesChange}
          icon={PawPrint}
          iconColor={colors[0]}
          sparklineData={kpis.sparkPacientes}
          sparklineColor={colors[0]}
          subtitle="Atenciones clínicas y chequeos preventivos"
          theme={theme}
        />

        <KpiCard
          title="Ticket Medio por Consulta"
          value={kpis.ticketPromedio}
          formattedValue={formatters.currency(kpis.ticketPromedio)}
          change={kpis.ticketChange}
          icon={Stethoscope}
          iconColor={colors[1]}
          sparklineData={kpis.sparkTicket}
          sparklineColor={colors[1]}
          subtitle="Incluye consultas, procedimientos y farma"
          theme={theme}
        />

        <KpiCard
          title="Tasa de Recurrencia"
          value={kpis.tasaRecurrencia}
          formattedValue={formatters.percent(kpis.tasaRecurrencia)}
          change={kpis.tasaRecurrenciaChange}
          icon={CalendarCheck}
          iconColor={colors[2] || '#f59e0b'}
          subtitle="Pacientes con retorno dentro de 90 días"
          goalProgress={kpis.tasaRecurrencia}
          theme={theme}
        />

        <KpiCard
          title="Ocupación de Quirófano"
          value={kpis.ocupacionQuirofano}
          formattedValue={formatters.percent(kpis.ocupacionQuirofano)}
          change={kpis.ocupacionChange}
          icon={HeartPulse}
          iconColor={colors[3] || '#8b5cf6'}
          subtitle="Eficiencia en bloque quirúrgico"
          theme={theme}
        />
      </div>

      {/* 2. Fila Principal: Evolución de Atenciones & Metas de Prevención */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Líneas: Consultas Programadas vs Urgencias */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Evolución de Consultas: Programadas vs Urgencias"
            subtitle="Crecimiento de atenciones planificadas vs demanda espontánea"
            badge="Consultas"
            badgeColor="bg-emerald-500/10 text-emerald-600"
            data={atencionesMensuales}
            theme={theme}
          >
            <LineChartPro
              data={atencionesMensuales}
              xAxisKey="mes"
              series={[
                { key: 'programadas', name: 'Consultas Programadas', color: colors[0] },
                { key: 'urgencias', name: 'Urgencias / Emergencias', color: '#f43f5e', strokeWidth: 2 }
              ]}
              valueFormatter={(v) => `${v} pac.`}
              theme={theme}
            />
          </ChartCard>
        </div>

        {/* Metas Preventivas (RadialBar) */}
        <div>
          <ChartCard
            title="Cumplimiento Planes Preventivos"
            subtitle="% de avance de cobertura de salud anual"
            badge="Metas Anuales"
            data={metasPreventivas}
            theme={theme}
          >
            <RadialBarChartPro
              data={metasPreventivas}
              colors={colors}
              valueFormatter={(v) => `${v}%`}
              theme={theme}
            />
          </ChartCard>
        </div>
      </div>

      {/* 3. Fila Secundaria: Facturación por Servicio & Especies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Facturación por Línea de Servicio (Bar) */}
        <ChartCard
          title="Facturación por Especialidad / Servicio"
          subtitle="Aporte de ingresos por áreas de la clínica"
          badge="Ingresos"
          data={facturacionServicios}
          theme={theme}
        >
          <BarChartPro
            data={facturacionServicios}
            xAxisKey="servicio"
            layout="vertical"
            series={[
              { key: 'ingresos', name: 'Ingresos Facturados', color: colors[1] }
            ]}
            valueFormatter={(v) => formatters.currency(v)}
            theme={theme}
          />
        </ChartCard>

        {/* Distribución por Especie (Donut) */}
        <ChartCard
          title="Pacientes Atendidos por Especie"
          subtitle="Proporción de caninos, felinos y otras especies"
          badge="Especies"
          data={especiesData}
          theme={theme}
        >
          <DonutChartPro
            data={especiesData}
            dataKey="value"
            nameKey="name"
            colors={colors}
            valueFormatter={(v) => `${v} pacientes`}
            theme={theme}
            centerLabel="Total Mascotas"
          />
        </ChartCard>
      </div>
    </div>
  )
}
