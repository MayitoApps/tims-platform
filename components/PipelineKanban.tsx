'use client';

import React, { useState } from 'react';
import { SalesLead, LeadStage } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';

interface PipelineKanbanProps {
  leads: SalesLead[];
  onUpdateLeadStage: (leadId: string, newStage: LeadStage) => void;
  onAddLead: (lead: Omit<SalesLead, 'id' | 'code'>) => void;
}

const STAGES: { id: LeadStage; title: string; colorDot: string }[] = [
  { id: 'prospect', title: 'Prospecto Nuevo', colorDot: 'bg-stone-400' },
  { id: 'mql_qualified', title: 'Calificado por Mkt', colorDot: 'bg-purple-500' },
  { id: 'contacted', title: 'Contactado / Demo', colorDot: 'bg-blue-500' },
  { id: 'proposal_sent', title: 'Propuesta Enviada', colorDot: 'bg-amber-500' },
  { id: 'negotiation', title: 'En Negociación', colorDot: 'bg-orange-500' },
  { id: 'won', title: 'Cerrado Ganado', colorDot: 'bg-emerald-600' }
];

export function PipelineKanban({
  leads,
  onUpdateLeadStage,
  onAddLead
}: PipelineKanbanProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contactName, setContactName] = useState('');
  const [company, setCompany] = useState('');
  const [dealValue, setDealValue] = useState('15000');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  const totalPipeline = leads.reduce((acc, lead) => acc + lead.dealValue, 0);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !company.trim()) return;

    onAddLead({
      contactName,
      company,
      email: email || `${contactName.toLowerCase().replace(/\s+/g, '.')}@${company.toLowerCase().replace(/\s+/g, '')}.com`,
      phone: '+52 55 0000 0000',
      stage: 'prospect',
      dealValue: parseFloat(dealValue) || 10000,
      sourceCampaignTitle: 'Direct Inbound / Prospección',
      assignedRep: {
        id: 'usr-2',
        name: 'Marcus Vance',
        email: 'marcus@tims.studio',
        role: 'sales',
        initials: 'MV'
      },
      qualifiedByMarketing: false,
      notes: notes || 'Prospecto ingresado manualmente al CRM.',
      lastContactDate: new Date().toISOString().split('T')[0],
      nextFollowUpDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
    });

    setContactName('');
    setCompany('');
    setEmail('');
    setNotes('');
    setIsModalOpen(false);
  };

  const getStageIndex = (stage: LeadStage) => STAGES.findIndex((s) => s.id === stage);

  const moveLeft = (lead: SalesLead) => {
    const idx = getStageIndex(lead.stage);
    if (idx > 0) {
      onUpdateLeadStage(lead.id, STAGES[idx - 1].id);
    }
  };

  const moveRight = (lead: SalesLead) => {
    const idx = getStageIndex(lead.stage);
    if (idx < STAGES.length - 1) {
      onUpdateLeadStage(lead.id, STAGES[idx + 1].id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-editorial text-2xl font-medium tracking-tight text-stone-900">
              Pipeline Comercial & Ventas
            </h2>
            <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-800">
              Total Activo: {formatCurrency(totalPipeline)}
            </span>
          </div>
          <p className="text-xs text-stone-600 mt-0.5">
            Flujo de prospectos desde la calificación de Marketing hasta el cierre del contrato.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="text-xs font-medium bg-stone-900 text-stone-50 hover:bg-stone-800 transition-colors px-3 py-1.5 rounded-md flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
        >
          <span>+ Nuevo Prospecto</span>
        </button>
      </div>

      {/* Kanban Board Container */}
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1">
        {STAGES.map((col) => {
          const columnLeads = leads.filter((l) => l.stage === col.id);
          const columnTotal = columnLeads.reduce((acc, l) => acc + l.dealValue, 0);

          return (
            <div
              key={col.id}
              className="w-72 shrink-0 bg-stone-100/60 hairline-all rounded-lg p-3 flex flex-col max-h-[75vh]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 hairline-b mb-3">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.colorDot}`} />
                  <span className="text-xs font-semibold text-stone-800 tracking-tight">
                    {col.title}
                  </span>
                  <span className="text-[10px] text-stone-600 font-mono">
                    ({columnLeads.length})
                  </span>
                </div>
                <span className="text-[11px] font-mono font-medium text-stone-700">
                  {formatCurrency(columnTotal)}
                </span>
              </div>

              {/* Column Cards */}
              <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
                {columnLeads.length === 0 ? (
                  <div className="text-center py-8 text-[11px] text-stone-600 italic">
                    Sin prospectos en esta etapa
                  </div>
                ) : (
                  columnLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="bg-white hairline-all rounded-md p-3.5 shadow-2xs hover:shadow-xs transition-shadow space-y-2.5 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-[10px] font-mono text-stone-600 font-medium">
                            {lead.code}
                          </div>
                          <h4 className="font-editorial text-sm font-semibold text-stone-900 leading-snug">
                            {lead.contactName}
                          </h4>
                          <div className="text-[11px] text-stone-600 font-medium">
                            {lead.company}
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-mono text-xs font-semibold text-stone-900">
                            {formatCurrency(lead.dealValue)}
                          </span>
                        </div>
                      </div>

                      {/* Source Campaign & Marketing Qualified Pill */}
                      {lead.sourceCampaignTitle && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] font-medium bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded-xs line-clamp-1">
                            {lead.sourceCampaignTitle}
                          </span>
                          {lead.qualifiedByMarketing && (
                            <span className="text-[9px] font-medium bg-purple-50 text-purple-700 border border-purple-100 px-1.5 py-0.5 rounded-xs">
                              MQL Verificado
                            </span>
                          )}
                        </div>
                      )}

                      {/* Notes snippet */}
                      {lead.notes && (
                        <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed bg-stone-50/70 p-2 rounded-xs hairline-all">
                          {lead.notes}
                        </p>
                      )}

                      {/* Footer: Rep & Stage Actions */}
                      <div className="flex items-center justify-between pt-2 hairline-t text-[10px] text-stone-600">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-stone-200 text-stone-800 flex items-center justify-center font-serif text-[9px] font-semibold">
                            {lead.assignedRep.initials}
                          </div>
                          <span>Próx: {formatDate(lead.nextFollowUpDate)}</span>
                        </div>

                        {/* Move Card Buttons */}
                        <div className="flex items-center gap-1">
                          {getStageIndex(lead.stage) > 0 && (
                            <button
                              onClick={() => moveLeft(lead)}
                              title="Mover a etapa anterior"
                              className="px-1.5 py-0.5 rounded-xs hairline-all hover:bg-stone-100 text-stone-600"
                            >
                              ◀
                            </button>
                          )}
                          {getStageIndex(lead.stage) < STAGES.length - 1 && (
                            <button
                              onClick={() => moveRight(lead)}
                              title="Avanzar etapa"
                              className="px-1.5 py-0.5 rounded-xs hairline-all bg-stone-900 text-white hover:bg-stone-800"
                            >
                              ▶
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for New Lead */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl hairline-all w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between hairline-b pb-3">
              <h3 className="font-editorial text-xl font-semibold text-stone-900">
                Nuevo Prospecto Comercial
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
                <label className="block text-stone-700 font-medium mb-1">Nombre del Contacto</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Mariana Treviño"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full hairline-all rounded-md px-3 py-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Empresa / Marca</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Grupo Alsea"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full hairline-all rounded-md px-3 py-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-400"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Valor Estimado ($ USD)</label>
                  <input
                    type="number"
                    value={dealValue}
                    onChange={(e) => setDealValue(e.target.value)}
                    className="w-full hairline-all rounded-md px-3 py-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="mariana@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full hairline-all rounded-md px-3 py-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-400"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Notas de Interés / Requerimientos</label>
                <textarea
                  rows={3}
                  placeholder="Detalles sobre lo que busca, presupuesto aproximado, canal de procedencia..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full hairline-all rounded-md px-3 py-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-400 resize-none"
                />
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
                  Agregar a Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
