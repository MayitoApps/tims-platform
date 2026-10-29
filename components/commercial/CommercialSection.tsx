'use client';

import React, { useState } from 'react';
import { HotelDeal, HotelDealStage, DealCategory, HotelFactsheet } from '@/lib/types';
import { HOTEL_PROPERTIES } from '@/lib/initial-data';
import { formatCurrency, formatDate, getHotelDealStageBadge, getDealCategoryLabel } from '@/lib/utils';

interface CommercialSectionProps {
  deals: HotelDeal[];
  factsheets: HotelFactsheet[];
  onAddDeal: (deal: Omit<HotelDeal, 'id' | 'code' | 'createdAt'>) => void;
  onUpdateDealStage: (id: string, stage: HotelDealStage) => void;
  onAddFactsheet: (factsheet: Omit<HotelFactsheet, 'id' | 'updatedAt'>) => void;
}

const STAGES: { id: HotelDealStage; title: string; colorDot: string }[] = [
  { id: 'rfp_recibido', title: 'RFP / Solicitud Recibida', colorDot: 'bg-purple-500' },
  { id: 'propuesta_enviada', title: 'Cotización Enviada', colorDot: 'bg-blue-500' },
  { id: 'negociacion', title: 'En Negociación', colorDot: 'bg-amber-500' },
  { id: 'contratado', title: 'Contrato Firmado (Ganado)', colorDot: 'bg-emerald-600' },
  { id: 'perdido', title: 'No Concretado', colorDot: 'bg-rose-500' }
];

export function CommercialSection({
  deals,
  factsheets,
  onAddDeal,
  onUpdateDealStage,
  onAddFactsheet
}: CommercialSectionProps) {
  const [subView, setSubView] = useState<'pipeline' | 'tabla' | 'tarifarios' | 'reporte'>('pipeline');
  const [selectedHotelFilter, setSelectedHotelFilter] = useState('all');

  // Modals
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [isFactsheetModalOpen, setIsFactsheetModalOpen] = useState(false);

  // Form states - Deal
  const [clientName, setClientName] = useState('');
  const [company, setCompany] = useState('');
  const [hotel, setHotel] = useState(HOTEL_PROPERTIES[0]);
  const [category, setCategory] = useState<DealCategory>('grupos_convenciones');
  const [totalValue, setTotalValue] = useState('35000');
  const [currency, setCurrency] = useState<'USD' | 'MXN'>('USD');
  const [roomNights, setRoomNights] = useState('60');
  const [attendees, setAttendees] = useState('120');
  const [checkIn, setCheckIn] = useState('2026-05-10');
  const [checkOut, setCheckOut] = useState('2026-05-14');
  const [rep, setRep] = useState('Gerencia de Ventas');
  const [notes, setNotes] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Form states - Factsheet
  const [fsTitle, setFsTitle] = useState('');
  const [fsHotel, setFsHotel] = useState(HOTEL_PROPERTIES[0]);
  const [fsType, setFsType] = useState<HotelFactsheet['type']>('capacidad_salones');
  const [fsUrl, setFsUrl] = useState('https://drive.google.com');

  const filteredDeals = deals.filter(
    (d) => selectedHotelFilter === 'all' || d.hotelName === selectedHotelFilter
  );

  const totalPipelineRevenue = filteredDeals
    .filter((d) => d.stage !== 'perdido')
    .reduce((acc, d) => acc + d.totalValue, 0);

  const totalWonRevenue = filteredDeals
    .filter((d) => d.stage === 'contratado')
    .reduce((acc, d) => acc + d.totalValue, 0);

  const totalRoomNights = filteredDeals
    .filter((d) => d.stage !== 'perdido')
    .reduce((acc, d) => acc + d.roomNights, 0);

  const handleCreateDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !company.trim()) return;

    onAddDeal({
      clientName,
      companyOrAgency: company,
      hotelName: hotel,
      category,
      stage: 'rfp_recibido',
      totalValue: parseFloat(totalValue) || 15000,
      currency,
      roomNights: parseInt(roomNights) || 20,
      attendeesCount: parseInt(attendees) || 50,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      assignedRep: rep,
      notes: notes || 'Solicitud de bloqueo de fechas y cotización de banquete.',
      contactEmail: email || 'contacto@empresa.com',
      contactPhone: phone || '+52 55 0000 0000'
    });

    setClientName('');
    setCompany('');
    setNotes('');
    setIsDealModalOpen(false);
  };

  const handleCreateFactsheet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fsTitle.trim()) return;

    onAddFactsheet({
      hotelName: fsHotel,
      title: fsTitle,
      type: fsType,
      fileUrl: fsUrl,
      version: 'v2026'
    });

    setFsTitle('');
    setIsFactsheetModalOpen(false);
  };

  const moveStage = (deal: HotelDeal, direction: 'prev' | 'next') => {
    const idx = STAGES.findIndex((s) => s.id === deal.stage);
    if (direction === 'prev' && idx > 0) {
      onUpdateDealStage(deal.id, STAGES[idx - 1].id);
    } else if (direction === 'next' && idx < STAGES.length - 1) {
      onUpdateDealStage(deal.id, STAGES[idx + 1].id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hospitality Header with Warm Gold & Emerald Tones */}
      <div className="bg-linear-to-r from-emerald-800 via-teal-700 to-amber-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-medium mb-2">
              <span>Dirección Comercial · Grupo Hotelero</span>
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight">
              Comercialización & Ventas de Hoteles
            </h2>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
              Gestión integral de grupos, convenciones (MICE), bodas de destino, cuentas corporativas y tarifarios oficiales para cada hotel.
            </p>
          </div>

          {/* Quick Sub-View Selector */}
          <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md p-1 rounded-xl self-start md:self-auto text-xs">
            <button
              onClick={() => setSubView('pipeline')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                subView === 'pipeline'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              Pipeline Grupos ({deals.length})
            </button>
            <button
              onClick={() => setSubView('tabla')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                subView === 'tabla'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              Tabla de Negociaciones
            </button>
            <button
              onClick={() => setSubView('tarifarios')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                subView === 'tarifarios'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              Salones & Tarifas ({factsheets.length})
            </button>
            <button
              onClick={() => setSubView('reporte')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                subView === 'reporte'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              Métricas & Ocupación
            </button>
          </div>
        </div>
      </div>

      {/* Hotel Filter & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Propiedad Hotelera:
          </span>
          <select
            value={selectedHotelFilter}
            onChange={(e) => setSelectedHotelFilter(e.target.value)}
            className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 text-stone-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="all">Todos los Hoteles del Grupo</option>
            {HOTEL_PROPERTIES.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>

        <div>
          {subView !== 'tarifarios' ? (
            <button
              onClick={() => setIsDealModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <span>+ Nuevo Grupo / Cotización RFP</span>
            </button>
          ) : (
            <button
              onClick={() => setIsFactsheetModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <span>+ Subir Factsheet / Tarifario</span>
            </button>
          )}
        </div>
      </div>

      {/* SUB-VIEW 1: KANBAN PIPELINE */}
      {subView === 'pipeline' && (
        <div className="space-y-4">
          {filteredDeals.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-stone-200 rounded-2xl p-12 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center text-2xl font-bold">
                🏨
              </div>
              <div className="space-y-1">
                <h3 className="font-editorial text-xl font-semibold text-stone-900">
                  Pipeline Comercial Hotelero Limpio
                </h3>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  No hay grupos ni eventos registrados aún. Comienza ingresando una cotización o solicitud RFP para una de las propiedades.
                </p>
              </div>
              <button
                onClick={() => setIsDealModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-emerald-700 text-white text-xs font-medium hover:bg-emerald-800 transition-colors shadow-xs"
              >
                Ingresar Primer Grupo / Evento
              </button>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4 pt-1">
              {STAGES.map((col) => {
                const columnDeals = filteredDeals.filter((d) => d.stage === col.id);
                const colSum = columnDeals.reduce((acc, d) => acc + d.totalValue, 0);

                return (
                  <div
                    key={col.id}
                    className="w-76 shrink-0 bg-stone-100/70 border border-stone-200 rounded-xl p-3 flex flex-col max-h-[75vh]"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-stone-200 mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${col.colorDot}`} />
                        <span className="text-xs font-bold text-stone-800 tracking-tight">
                          {col.title}
                        </span>
                        <span className="text-[10px] text-stone-500 font-mono">
                          ({columnDeals.length})
                        </span>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-stone-700">
                        {formatCurrency(colSum)}
                      </span>
                    </div>

                    <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
                      {columnDeals.length === 0 ? (
                        <div className="text-center py-8 text-[11px] text-stone-400 italic">
                          Sin grupos en esta etapa
                        </div>
                      ) : (
                        columnDeals.map((deal) => {
                          const catInfo = getDealCategoryLabel(deal.category);
                          const stageIdx = STAGES.findIndex((s) => s.id === deal.stage);

                          return (
                            <div
                              key={deal.id}
                              className="bg-white border border-stone-200 rounded-lg p-3.5 shadow-2xs hover:shadow-xs transition-shadow space-y-2.5"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <span className="text-[10px] font-mono font-medium text-emerald-800">
                                    {deal.code}
                                  </span>
                                  <h4 className="font-editorial text-base font-bold text-stone-900 leading-snug">
                                    {deal.companyOrAgency}
                                  </h4>
                                  <div className="text-xs text-stone-600 font-medium">
                                    Contacto: {deal.clientName}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-mono text-xs font-bold text-emerald-900">
                                    {formatCurrency(deal.totalValue, deal.currency)}
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-1 text-xs">
                                <div className="text-[11px] font-semibold text-rose-700 flex items-center gap-1">
                                  <span>📍</span> {deal.hotelName}
                                </div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-sm border ${catInfo.badge}`}>
                                    {catInfo.label}
                                  </span>
                                  <span className="text-[9px] font-mono bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded-sm">
                                    {deal.roomNights} Room Nights
                                  </span>
                                </div>
                              </div>

                              <div className="text-[10px] text-stone-500 font-mono bg-stone-50 p-1.5 rounded-sm">
                                Fechas: {formatDate(deal.checkInDate)} al {formatDate(deal.checkOutDate)}
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[10px]">
                                <span className="text-stone-500">{deal.assignedRep}</span>
                                <div className="flex items-center gap-1">
                                  {stageIdx > 0 && (
                                    <button
                                      onClick={() => moveStage(deal, 'prev')}
                                      className="px-1.5 py-0.5 rounded-sm border border-stone-300 hover:bg-stone-100"
                                    >
                                      ◀
                                    </button>
                                  )}
                                  {stageIdx < STAGES.length - 1 && (
                                    <button
                                      onClick={() => moveStage(deal, 'next')}
                                      className="px-1.5 py-0.5 rounded-sm bg-emerald-700 text-white hover:bg-emerald-800"
                                    >
                                      ▶
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 2: TABLA DE NEGOCIACIONES */}
      {subView === 'tabla' && (
        <div className="space-y-4">
          {filteredDeals.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-stone-200 rounded-2xl p-12 text-center space-y-4">
              <h3 className="font-editorial text-xl font-semibold text-stone-900">
                Sin registros en la tabla
              </h3>
              <p className="text-xs text-stone-500">Agrega cotizaciones para ver el concentrado de todas las negociaciones.</p>
            </div>
          ) : (
            <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">Código</th>
                      <th className="py-3 px-4">Empresa / Grupo</th>
                      <th className="py-3 px-4">Hotel</th>
                      <th className="py-3 px-4">Etapa</th>
                      <th className="py-3 px-4">Valor Total</th>
                      <th className="py-3 px-4">Room Nights</th>
                      <th className="py-3 px-4">Fechas</th>
                      <th className="py-3 px-4">Ejecutivo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredDeals.map((deal) => {
                      const badge = getHotelDealStageBadge(deal.stage);
                      return (
                        <tr key={deal.id} className="hover:bg-stone-50/70 transition-colors">
                          <td className="py-3 px-4 font-mono font-medium text-emerald-800">{deal.code}</td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-stone-900">{deal.companyOrAgency}</div>
                            <div className="text-[11px] text-stone-500">{deal.clientName}</div>
                          </td>
                          <td className="py-3 px-4 font-medium text-rose-700">{deal.hotelName}</td>
                          <td className="py-3 px-4">
                            <select
                              value={deal.stage}
                              onChange={(e) => onUpdateDealStage(deal.id, e.target.value as HotelDealStage)}
                              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${badge.bg} ${badge.text} ${badge.border} cursor-pointer focus:outline-none`}
                            >
                              <option value="rfp_recibido">RFP Recibido</option>
                              <option value="propuesta_enviada">Cotización Enviada</option>
                              <option value="negociacion">En Negociación</option>
                              <option value="contratado">Contrato Firmado</option>
                              <option value="perdido">No Concretado</option>
                            </select>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-stone-900">
                            {formatCurrency(deal.totalValue, deal.currency)}
                          </td>
                          <td className="py-3 px-4 font-mono text-stone-700">{deal.roomNights} RN</td>
                          <td className="py-3 px-4 text-stone-600 text-[11px] whitespace-nowrap">
                            {formatDate(deal.checkInDate)} al {formatDate(deal.checkOutDate)}
                          </td>
                          <td className="py-3 px-4 text-stone-600">{deal.assignedRep}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 3: TARIFARIOS & SALONES */}
      {subView === 'tarifarios' && (
        <div className="space-y-4">
          {factsheets.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-stone-200 rounded-2xl p-12 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-amber-50 text-amber-700 flex items-center justify-center text-2xl font-bold">
                📑
              </div>
              <div className="space-y-1">
                <h3 className="font-editorial text-xl font-semibold text-stone-900">
                  Repositorio de Salones & Tarifarios Oficiales
                </h3>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  Sube los enlaces oficiales de capacidades de salones, menús de banquetes y tarifarios corporativos para que los ejecutivos de ventas siempre tengan la última versión.
                </p>
              </div>
              <button
                onClick={() => setIsFactsheetModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-amber-700 text-white text-xs font-medium hover:bg-amber-800 transition-colors shadow-xs"
              >
                Registrar Primer Factsheet
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {factsheets.map((fs) => (
                <div key={fs.id} className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="uppercase text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-sm border border-amber-200">
                      {fs.type.replace('_', ' ')}
                    </span>
                    <span className="font-mono text-stone-400 text-[11px]">{fs.version}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-stone-900 text-base">{fs.title}</h4>
                    <p className="text-xs text-emerald-700 font-medium">{fs.hotelName}</p>
                  </div>
                  <div className="pt-2 border-t border-stone-100 flex justify-end">
                    <a
                      href={fs.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-stone-900 text-white text-xs font-medium hover:bg-stone-800 flex items-center gap-1"
                    >
                      <span>Abrir Documento</span> ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 4: REPORTE & MÉTRICAS */}
      {subView === 'reporte' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                Ingresos en Pipeline
              </span>
              <div className="font-editorial text-3xl font-bold text-emerald-800">
                {formatCurrency(totalPipelineRevenue)}
              </div>
              <p className="text-[11px] text-stone-500">Valor de todas las cotizaciones activas</p>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                Contratos Cerrados (Ganados)
              </span>
              <div className="font-editorial text-3xl font-bold text-teal-800">
                {formatCurrency(totalWonRevenue)}
              </div>
              <p className="text-[11px] text-emerald-700 font-medium">Firmados y confirmados</p>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                Noches Habitación Negociadas
              </span>
              <div className="font-editorial text-3xl font-bold text-amber-800">
                {totalRoomNights} <span className="text-sm font-sans font-normal text-stone-500">RN</span>
              </div>
              <p className="text-[11px] text-stone-500">Impacto directo en ocupación hotelera</p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NUEVA COTIZACIÓN / RFP */}
      {isDealModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-editorial text-xl font-bold text-stone-900">
                Nueva Cotización / RFP Hotelero
              </h3>
              <button onClick={() => setIsDealModalOpen(false)} className="text-stone-400 hover:text-stone-600 text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDeal} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Empresa / Cliente</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Farmacéutica Novartis"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Persona de Contacto</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Lic. Roberto Vega"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Hotel Solicitado</label>
                  <select
                    value={hotel}
                    onChange={(e) => setHotel(e.target.value)}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-900 bg-white"
                  >
                    {HOTEL_PROPERTIES.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Categoría de Evento</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-900 bg-white"
                  >
                    <option value="grupos_convenciones">Grupos & Convenciones (MICE)</option>
                    <option value="bodas_sociales">Bodas & Eventos Sociales</option>
                    <option value="cuentas_empresariales">Convenio Corporativo Anual</option>
                    <option value="agencias_viaje">Agencia de Viaje / Mayorista</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Valor Total Estimado</label>
                  <input
                    type="number"
                    value={totalValue}
                    onChange={(e) => setTotalValue(e.target.value)}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Moneda</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as any)}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-900 bg-white"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="MXN">MXN ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Room Nights</label>
                  <input
                    type="number"
                    value={roomNights}
                    onChange={(e) => setRoomNights(e.target.value)}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Check-in</label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Check-out</label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="contacto@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Teléfono</label>
                  <input
                    type="tel"
                    placeholder="+52 55 ..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Requerimientos de Salones & Alimentos</label>
                <textarea
                  rows={2}
                  placeholder="Necesitan salón para 100 personas en montaje herradura, cena de gala el viernes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-900 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsDealModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-medium"
                >
                  Registrar en Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SUBIR FACTSHEET */}
      {isFactsheetModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-editorial text-xl font-bold text-stone-900">
                Nuevo Factsheet o Tarifario
              </h3>
              <button onClick={() => setIsFactsheetModalOpen(false)} className="text-stone-400 hover:text-stone-600 text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFactsheet} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Título del Documento</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Capacidad de Salones & Planos 2026"
                  value={fsTitle}
                  onChange={(e) => setFsTitle(e.target.value)}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Hotel</label>
                  <select
                    value={fsHotel}
                    onChange={(e) => setFsHotel(e.target.value)}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-900 bg-white"
                  >
                    {HOTEL_PROPERTIES.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Tipo</label>
                  <select
                    value={fsType}
                    onChange={(e) => setFsType(e.target.value as any)}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-900 bg-white"
                  >
                    <option value="capacidad_salones">Capacidad de Salones</option>
                    <option value="tarifario_grupos">Tarifario de Grupos</option>
                    <option value="paquetes_bodas">Paquetes de Bodas</option>
                    <option value="menu_banquetes">Menús de Banquetes</option>
                    <option value="presentacion_hotel">Presentación del Hotel</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">URL Oficial (Drive, PDF, Web)</label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/..."
                  value={fsUrl}
                  onChange={(e) => setFsUrl(e.target.value)}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsFactsheetModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-medium"
                >
                  Guardar Factsheet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

