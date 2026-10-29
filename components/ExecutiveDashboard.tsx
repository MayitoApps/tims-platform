'use client';

import React from 'react';
import { Campaign, SalesLead } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface ExecutiveDashboardProps {
  campaigns: Campaign[];
  leads: SalesLead[];
}

export function ExecutiveDashboard({ campaigns, leads }: ExecutiveDashboardProps) {
  const totalPipeline = leads.reduce((acc, l) => acc + (l.stage !== 'lost' ? l.dealValue : 0), 0);
  const totalWon = leads.filter((l) => l.stage === 'won').reduce((acc, l) => acc + l.dealValue, 0);
  const totalBudget = campaigns.reduce((acc, c) => acc + c.budget, 0);
  const totalSpent = campaigns.reduce((acc, c) => acc + c.spent, 0);
  const totalLeads = leads.length;
  const mqls = leads.filter((l) => l.qualifiedByMarketing).length;
  const wonCount = leads.filter((l) => l.stage === 'won').length;
  const winRate = totalLeads > 0 ? Math.round((wonCount / totalLeads) * 100) : 0;

  return (
    <div className="space-y-6 pt-2 pb-12">
      {/* Title */}
      <div>
        <h2 className="font-editorial text-2xl font-medium tracking-tight text-stone-900">
          Dashboard Ejecutivo & Retorno de Inversión
        </h2>
        <p className="text-xs text-stone-600 mt-0.5">
          Visión consolidada del rendimiento conjunto de Marketing y el cierre comercial de Ventas.
        </p>
      </div>

      {/* KPI Cards (Editorial Big Serif Numbers) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white hairline-all rounded-lg p-5 shadow-2xs space-y-2">
          <div className="text-[10px] font-semibold text-stone-600 uppercase tracking-wider">
            Pipeline Comercial Activo
          </div>
          <div className="font-editorial text-3xl font-semibold text-stone-900 tracking-tight">
            {formatCurrency(totalPipeline)}
          </div>
          <div className="text-[11px] text-stone-600 flex items-center gap-1.5 pt-1">
            <span className="text-emerald-800 font-medium font-mono">+{formatCurrency(totalWon)}</span>
            <span>cerrados este trimestre</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white hairline-all rounded-lg p-5 shadow-2xs space-y-2">
          <div className="text-[10px] font-semibold text-stone-600 uppercase tracking-wider">
            Calificación MQL a SQL
          </div>
          <div className="font-editorial text-3xl font-semibold text-stone-900 tracking-tight">
            {mqls} <span className="text-sm font-sans font-normal text-stone-600">/ {totalLeads} leads</span>
          </div>
          <div className="text-[11px] text-stone-600 pt-1">
            <span className="text-purple-800 font-medium">80% de los prospectos</span> calificados por Mkt
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white hairline-all rounded-lg p-5 shadow-2xs space-y-2">
          <div className="text-[10px] font-semibold text-stone-600 uppercase tracking-wider">
            Tasa de Cierre (Win Rate)
          </div>
          <div className="font-editorial text-3xl font-semibold text-stone-900 tracking-tight">
            {winRate}%
          </div>
          <div className="text-[11px] text-stone-600 pt-1">
            <span className="text-stone-800 font-medium">{wonCount} cuentas</span> ganadas de {totalLeads} totales
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white hairline-all rounded-lg p-5 shadow-2xs space-y-2">
          <div className="text-[10px] font-semibold text-stone-600 uppercase tracking-wider">
            Eficiencia Presupuestal
          </div>
          <div className="font-editorial text-3xl font-semibold text-stone-900 tracking-tight">
            {formatCurrency(totalSpent)}
          </div>
          <div className="text-[11px] text-stone-600 pt-1">
            de {formatCurrency(totalBudget)} asignados ({Math.round((totalSpent / totalBudget) * 100)}%)
          </div>
        </div>
      </div>

      {/* Two Column Layout: Top Campaigns & Pipeline Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Campaigns by Lead Generation */}
        <div className="bg-white hairline-all rounded-lg p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between hairline-b pb-3">
            <h3 className="font-editorial text-lg font-semibold text-stone-900">
              Rendimiento por Campaña
            </h3>
            <span className="text-[11px] font-mono text-stone-600">Leads & Retorno</span>
          </div>

          <div className="space-y-4">
            {campaigns.map((camp) => {
              const leadsFromCamp = leads.filter((l) => l.sourceCampaignTitle?.includes(camp.title.slice(0, 15)));
              const campRevenue = leadsFromCamp.reduce((acc, l) => acc + l.dealValue, 0);

              return (
                <div key={camp.id} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-stone-900">{camp.title}</span>
                    <span className="font-mono font-medium text-stone-800">{formatCurrency(campRevenue)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-stone-600">
                    <span>{camp.leadsGenerated} leads atribuidos</span>
                    <span>Gastado: {formatCurrency(camp.spent)}</span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-stone-900 h-1.5 rounded-full"
                      style={{ width: `${Math.min((camp.spent / camp.budget) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Activity Feed (Simulating Realtime Audit Log) */}
        <div className="bg-white hairline-all rounded-lg p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between hairline-b pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-700 animate-pulse" />
              <h3 className="font-editorial text-lg font-semibold text-stone-900">
                Registro de Actividad en Tiempo Real
              </h3>
            </div>
            <span className="text-[11px] text-stone-600 font-mono">Sincronizado</span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-stone-200 text-stone-800 flex items-center justify-center text-[10px] font-semibold font-serif shrink-0 mt-0.5">
                MV
              </div>
              <div>
                <p className="text-stone-800 leading-snug">
                  <span className="font-medium">Marcus Vance</span> movió a <span className="font-medium text-stone-900">Atelier Kering Group</span> a la etapa <span className="font-medium text-orange-700">En Negociación</span>.
                </p>
                <span className="text-[10px] text-stone-600 font-mono">Hace 12 minutos · Vía Realtime DB</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-stone-200 text-stone-800 flex items-center justify-center text-[10px] font-semibold font-serif shrink-0 mt-0.5">
                ER
              </div>
              <div>
                <p className="text-stone-800 leading-snug">
                  <span className="font-medium">Elena Rostova</span> actualizó el enlace oficial de <span className="font-medium text-stone-900">Canva Pitch Presentation Kit</span> a versión v3.2.
                </p>
                <span className="text-[10px] text-stone-600 font-mono">Hace 45 minutos · Repositorio de Activos</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-stone-200 text-stone-800 flex items-center justify-center text-[10px] font-semibold font-serif shrink-0 mt-0.5">
                DM
              </div>
              <div>
                <p className="text-stone-800 leading-snug">
                  <span className="font-medium">Diego Morales</span> registró a <span className="font-medium text-stone-900">Ignacio Larrea (Grupo Retail Sur)</span> calificado por la campaña de Primavera.
                </p>
                <span className="text-[10px] text-stone-600 font-mono">Hace 2 horas · Pase MQL → SQL</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

