'use client';

import React, { useState } from 'react';
import { Campaign, CampaignStatus } from '@/lib/types';
import { formatCurrency, formatDate, getCampaignStatusBadge, getPlatformBadge } from '@/lib/utils';

interface CampaignTableProps {
  campaigns: Campaign[];
  onUpdateStatus: (campaignId: string, newStatus: CampaignStatus) => void;
  onAddCampaign: (campaign: Omit<Campaign, 'id' | 'code' | 'tasksCount' | 'completedTasksCount' | 'leadsGenerated'>) => void;
}

export function CampaignTable({
  campaigns,
  onUpdateStatus,
  onAddCampaign
}: CampaignTableProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBudget, setNewBudget] = useState('10000');
  const [newStartDate, setNewStartDate] = useState('2026-03-15');
  const [newEndDate, setNewEndDate] = useState('2026-04-30');
  const [newChannels, setNewChannels] = useState('Instagram, LinkedIn');

  const filteredCampaigns = campaigns.filter((c) => {
    if (filterStatus === 'all') return true;
    return c.status === filterStatus;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddCampaign({
      title: newTitle,
      description: 'Nueva campaña estratégica de marketing y prospección.',
      status: 'ideation',
      leadOwner: {
        id: 'usr-1',
        name: 'Elena Rostova',
        email: 'elena@tims.studio',
        role: 'marketing',
        initials: 'ER'
      },
      budget: parseFloat(newBudget) || 5000,
      spent: 0,
      startDate: newStartDate,
      endDate: newEndDate,
      channels: newChannels.split(',').map((s) => s.trim()).filter(Boolean),
      externalLinks: [
        { id: 'lnk-' + Date.now(), title: 'Carpeta de Creativos', url: 'https://drive.google.com', platform: 'drive' }
      ]
    });

    setNewTitle('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Table Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <h2 className="font-editorial text-2xl font-medium tracking-tight text-stone-900">
            Campañas & Proyectos Estratégicos
          </h2>
          <p className="text-xs text-stone-600 mt-0.5">
            Registro unificado de producción creativa, pauta publicitaria y captación de prospectos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs bg-white hairline-all rounded-md px-2.5 py-1.5 text-stone-700 focus:outline-none focus:ring-1 focus:ring-stone-400"
          >
            <option value="all">Todas las Fases</option>
            <option value="active">Activas en Pauta</option>
            <option value="in_production">En Producción</option>
            <option value="review">En Revisión</option>
            <option value="ideation">Ideación</option>
          </select>

          <button
            onClick={() => setIsModalOpen(true)}
            className="text-xs font-medium bg-stone-900 text-stone-50 hover:bg-stone-800 transition-colors px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-xs"
          >
            <span>+ Nueva Campaña</span>
          </button>
        </div>
      </div>

      {/* Modern Editorial Table */}
      <div className="bg-white hairline-all rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50/80 hairline-b text-stone-600 font-medium tracking-wider uppercase text-[10px]">
                <th className="py-3 px-4 w-20">Código</th>
                <th className="py-3 px-4 min-w-[260px]">Campaña & Objetivo</th>
                <th className="py-3 px-4 w-40">Fase / Estado</th>
                <th className="py-3 px-4 w-36">Responsable</th>
                <th className="py-3 px-4 w-36 text-right">Presupuesto</th>
                <th className="py-3 px-4 w-44">Vigencia</th>
                <th className="py-3 px-4 min-w-[180px]">Enlaces Externos</th>
                <th className="py-3 px-4 w-28 text-center">Leads Mkt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredCampaigns.map((camp) => {
                const statusBadge = getCampaignStatusBadge(camp.status);
                const progressPct = camp.budget > 0 ? Math.round((camp.spent / camp.budget) * 100) : 0;

                return (
                  <tr key={camp.id} className="hover:bg-stone-50/50 transition-colors group">
                    {/* Code */}
                    <td className="py-3 px-4 font-mono text-stone-600 font-medium">
                      {camp.code}
                    </td>

                    {/* Title & Description */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-stone-900 text-xs hover:text-stone-700 cursor-pointer">
                        {camp.title}
                      </div>
                      <div className="text-[11px] text-stone-600 line-clamp-1 mt-0.5">
                        {camp.description}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {camp.channels.map((ch, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] font-medium bg-stone-100 text-stone-600 px-1.5 py-0.2 rounded-xs"
                          >
                            {ch}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Status inline selector */}
                    <td className="py-3 px-4">
                      <div className="relative inline-block">
                        <select
                          value={camp.status}
                          onChange={(e) => onUpdateStatus(camp.id, e.target.value as CampaignStatus)}
                          className={`text-[11px] font-medium px-2.5 py-1 rounded-full appearance-none cursor-pointer pr-6 focus:outline-none focus:ring-1 focus:ring-stone-400 ${statusBadge.bg} ${statusBadge.text}`}
                        >
                          <option value="ideation">Ideación</option>
                          <option value="in_production">En Producción</option>
                          <option value="review">En Revisión</option>
                          <option value="ready">Listo</option>
                          <option value="active">Activa en Pauta</option>
                          <option value="completed">Finalizada</option>
                        </select>
                        <span className={`w-1.5 h-1.5 rounded-full absolute left-2 top-2.5 pointer-events-none ${statusBadge.dot}`} />
                        <span className="absolute right-2 top-2 pointer-events-none text-[9px] opacity-60">▼</span>
                      </div>
                    </td>

                    {/* Owner */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-stone-200 text-stone-800 flex items-center justify-center text-[10px] font-semibold font-serif">
                          {camp.leadOwner.initials}
                        </div>
                        <span className="text-stone-800 truncate text-[11px]">
                          {camp.leadOwner.name.split(' ')[0]}
                        </span>
                      </div>
                    </td>

                    {/* Budget & Spent */}
                    <td className="py-3 px-4 text-right">
                      <div className="font-mono text-stone-900 font-medium">
                        {formatCurrency(camp.budget)}
                      </div>
                      <div className="text-[10px] text-stone-600 mt-0.5">
                        Gastado: {formatCurrency(camp.spent)} ({progressPct}%)
                      </div>
                      <div className="w-full bg-stone-100 rounded-full h-1 mt-1 overflow-hidden">
                        <div
                          className="bg-stone-700 h-1 rounded-full transition-all"
                          style={{ width: `${Math.min(progressPct, 100)}%` }}
                        />
                      </div>
                    </td>

                    {/* Dates */}
                    <td className="py-3 px-4 text-stone-600 text-[11px] whitespace-nowrap">
                      <div>{formatDate(camp.startDate)}</div>
                      <div className="text-stone-600 text-[10px]">al {formatDate(camp.endDate)}</div>
                    </td>

                    {/* External links */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {camp.externalLinks.map((link) => {
                          const badge = getPlatformBadge(link.platform);
                          return (
                            <a
                              key={link.id}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-xs border font-medium hover:bg-stone-50 transition-colors ${badge.border} ${badge.text}`}
                              title={link.title}
                            >
                              <span>{badge.label}</span>
                              <span className="text-[8px] opacity-70">↗</span>
                            </a>
                          );
                        })}
                      </div>
                    </td>

                    {/* Leads generated */}
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-stone-100 text-stone-800 font-mono text-[11px] font-semibold">
                        {camp.leadsGenerated}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for New Campaign */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl hairline-all w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between hairline-b pb-3">
              <h3 className="font-editorial text-xl font-semibold text-stone-900">
                Nueva Campaña Editorial
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">Título de la Campaña</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Campaña Otoño B2B · Executive Reach"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full hairline-all rounded-md px-3 py-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Presupuesto (USD)</label>
                  <input
                    type="number"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    className="w-full hairline-all rounded-md px-3 py-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-400"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Canales (separados por coma)</label>
                  <input
                    type="text"
                    value={newChannels}
                    onChange={(e) => setNewChannels(e.target.value)}
                    className="w-full hairline-all rounded-md px-3 py-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Fecha Inicio</label>
                  <input
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full hairline-all rounded-md px-3 py-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-400"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Fecha Término</label>
                  <input
                    type="date"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="w-full hairline-all rounded-md px-3 py-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 hairline-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-md hairline-all text-stone-600 hover:bg-stone-50 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-stone-900 text-white hover:bg-stone-800 font-medium shadow-xs"
                >
                  Crear Campaña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

