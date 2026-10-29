'use client';

import React, { useState } from 'react';
import { HotelDeal, MarketingCampaign, ContentPublication } from '@/lib/types';
import { HOTEL_PROPERTIES } from '@/lib/initial-data';
import { formatCurrency, formatDate } from '@/lib/utils';

interface SharedCalendarProps {
  mode: 'commercial' | 'marketing';
  deals?: HotelDeal[];
  campaigns?: MarketingCampaign[];
  publications?: ContentPublication[];
  onAddDealClick?: () => void;
  onAddCampaignClick?: () => void;
}

interface CalendarItem {
  id: string;
  type: 'deal' | 'campaign' | 'publication';
  title: string;
  hotel: string;
  startDate: string;
  endDate: string;
  status: string;
  value?: number;
  currency?: 'MXN' | 'USD';
  spaces?: string[];
  clientOrLead?: string;
  attendees?: number;
  roomNights?: number;
  notes?: string;
}

export function SharedCalendar({
  mode,
  deals = [],
  campaigns = [],
  publications = [],
  onAddDealClick,
  onAddCampaignClick
}: SharedCalendarProps) {
  // Navigation State (Default to April 2026 where samples are concentrated)
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1));
  const [selectedHotel, setSelectedHotel] = useState<string>('all');
  const [activeItemModal, setActiveItemModal] = useState<CalendarItem | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleJumpToToday = () => {
    setCurrentDate(new Date(2026, 3, 1));
  };

  // STRICT SEPARATION: Commercial ONLY sees deals; Marketing ONLY sees campaigns + PR
  const items: CalendarItem[] = mode === 'commercial'
    ? deals.map((d) => ({
        id: d.id,
        type: 'deal' as const,
        title: d.companyOrAgency,
        hotel: d.hotelName,
        startDate: d.checkInDate,
        endDate: d.checkOutDate,
        status: d.stage,
        value: d.totalValue,
        currency: d.currency,
        spaces: d.selectedSpaces,
        clientOrLead: d.clientName,
        attendees: d.attendeesCount,
        roomNights: d.roomNights,
        notes: d.notes
      }))
    : [
        ...campaigns.map((c) => ({
          id: c.id,
          type: 'campaign' as const,
          title: c.title,
          hotel: c.hotelTarget,
          startDate: c.startDate,
          endDate: c.endDate,
          status: c.status,
          value: c.budget,
          currency: 'MXN' as const,
          spaces: c.selectedSpaces,
          clientOrLead: c.leadOwner,
          notes: c.description
        })),
        ...publications.map((p) => ({
          id: p.id,
          type: 'publication' as const,
          title: `[${p.channel.toUpperCase()}] ${p.title}`,
          hotel: p.hotel,
          startDate: p.publishDate,
          endDate: p.publishDate,
          status: p.status,
          clientOrLead: p.responsible
        }))
      ];

  // Hotel filtering
  const filteredItems = items.filter((item) => {
    if (selectedHotel !== 'all' && item.hotel !== selectedHotel) return false;
    return true;
  });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const startOffset = (firstDayIndex + 6) % 7; // Monday start

  const getItemsForDay = (dayNum: number) => {
    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    return filteredItems.filter((item) => dayStr >= item.startDate && dayStr <= item.endDate);
  };

  const dayHeaders = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  return (
    <div className="space-y-4 font-sans">
      {/* Time Navigation & Filter Header */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200">
              <button
                onClick={handlePrevMonth}
                title="Mes Anterior"
                className="w-9 h-9 rounded-lg flex items-center justify-center text-stone-700 hover:bg-white hover:shadow-xs transition-all font-bold"
              >
                ◀
              </button>
              <button
                onClick={handleJumpToToday}
                className="px-3 py-1.5 text-xs font-semibold text-stone-800 hover:bg-white rounded-lg transition-all"
              >
                Mes Actual
              </button>
              <button
                onClick={handleNextMonth}
                title="Mes Siguiente"
                className="w-9 h-9 rounded-lg flex items-center justify-center text-stone-700 hover:bg-white hover:shadow-xs transition-all font-bold"
              >
                ▶
              </button>
            </div>

            <div>
              <h2 className="font-editorial text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight flex items-baseline gap-2">
                <span>{monthNames[month]}</span>
                <span className="text-stone-400 font-sans text-xl font-normal">{year}</span>
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                {mode === 'commercial'
                  ? 'Calendario Exclusivo de Comercialización: Eventos, Bodas & Bloqueo de Espacios'
                  : 'Calendario Exclusivo de Marketing: Campañas, Pauta Digital & Publicaciones PR'}
              </p>
            </div>
          </div>

          {/* Quick Action Button */}
          <div>
            {mode === 'commercial' && onAddDealClick && (
              <button
                onClick={onAddDealClick}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-2"
              >
                <span>🏨 + Reservar Espacios / Evento</span>
              </button>
            )}
            {mode === 'marketing' && onAddCampaignClick && (
              <button
                onClick={onAddCampaignClick}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-2"
              >
                <span>🎨 + Agendar Campaña</span>
              </button>
            )}
          </div>
        </div>

        {/* Hotel Filter */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-stone-100">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Filtrar por Hotel:
            </span>
            <select
              value={selectedHotel}
              onChange={(e) => setSelectedHotel(e.target.value)}
              className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <option value="all">Todas las Propiedades ({filteredItems.length} registros)</option>
              {HOTEL_PROPERTIES.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-stone-400 font-mono hidden sm:block">
            {mode === 'commercial' ? 'Protección contra doble reserva activa' : 'Vista de lanzamientos'}
          </div>
        </div>
      </div>

      {/* Main Calendar Grid */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
        {/* Days of week */}
        <div className="grid grid-cols-7 border-b border-stone-200 bg-stone-50/80 text-[11px] font-bold text-stone-500 uppercase tracking-wider py-2.5 text-center">
          {dayHeaders.map((dh) => (
            <div key={dh} className="py-0.5">
              <span className="hidden md:inline">{dh}</span>
              <span className="md:hidden">{dh.slice(0, 3)}</span>
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-stone-100">
          {Array.from({ length: startOffset }).map((_, idx) => (
            <div key={`offset-${idx}`} className="min-h-32 bg-stone-50/30 p-2 text-stone-300 text-xs font-mono" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dayItems = getItemsForDay(dayNum);
            const isToday = dayNum === 18 && month === 3;

            return (
              <div
                key={`day-${dayNum}`}
                className={`min-h-32 p-2 flex flex-col justify-between transition-colors hover:bg-stone-50/80 group ${
                  isToday ? 'bg-amber-50/40 ring-1 ring-amber-400 inset-0' : ''
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-1">
                  <span
                    className={`text-xs font-mono font-bold ${
                      isToday
                        ? 'w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px] shadow-xs'
                        : 'text-stone-800'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {dayItems.length > 0 && (
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-stone-100 text-stone-600">
                      {dayItems.length}
                    </span>
                  )}
                </div>

                {/* Items in Cell */}
                <div className="space-y-1.5 overflow-y-auto max-h-26 pr-0.5 no-scrollbar flex-1">
                  {dayItems.map((item) => {
                    const isDeal = item.type === 'deal';
                    const isCamp = item.type === 'campaign';

                    return (
                      <div
                        key={item.id}
                        onClick={() => setActiveItemModal(item)}
                        className={`p-1.5 rounded-lg border text-left cursor-pointer transition-all hover:scale-[1.02] shadow-2xs leading-tight ${
                          isDeal
                            ? 'bg-emerald-50/95 border-emerald-300 text-emerald-950 hover:bg-emerald-100'
                            : isCamp
                            ? 'bg-rose-50/95 border-rose-300 text-rose-950 hover:bg-rose-100'
                            : 'bg-indigo-50/95 border-indigo-300 text-indigo-950 hover:bg-indigo-100'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[9px] font-bold truncate text-slate-800">
                            {item.hotel.replace('Orgánico ', '').replace('Centro Cultural ', '')}
                          </span>
                          {item.value && (
                            <span className="text-[9px] font-mono font-bold shrink-0">
                              {formatCurrency(item.value, item.currency)}
                            </span>
                          )}
                        </div>

                        <div className="font-bold text-[10px] text-stone-900 truncate mt-0.5">
                          {item.title}
                        </div>

                        {/* Espacios bloqueados */}
                        {item.spaces && item.spaces.length > 0 && (
                          <div className="text-[8px] font-semibold text-emerald-900 truncate mt-0.5">
                            📍 {item.spaces[0]} {item.spaces.length > 1 ? `(+${item.spaces.length - 1})` : ''}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Modal */}
      {activeItemModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-lg p-6 sm:p-7 space-y-5">
            <div className="flex items-start justify-between border-b border-stone-200 pb-3">
              <div>
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm border ${
                    activeItemModal.type === 'deal'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : activeItemModal.type === 'campaign'
                      ? 'bg-rose-50 text-rose-800 border-rose-300'
                      : 'bg-indigo-50 text-indigo-800 border-indigo-300'
                  }`}
                >
                  {activeItemModal.type === 'deal'
                    ? 'Evento / Reservación Hotelera'
                    : activeItemModal.type === 'campaign'
                    ? 'Campaña de Marketing'
                    : 'Publicación de Medios / PR'}
                </span>
                <h3 className="font-editorial text-2xl font-bold text-stone-900 mt-1">
                  {activeItemModal.title}
                </h3>
                <p className="text-xs font-bold text-rose-700">
                  {activeItemModal.hotel}
                </p>
              </div>

              <button
                onClick={() => setActiveItemModal(null)}
                className="text-stone-400 hover:text-stone-600 text-lg"
              >
                ✕
              </button>
            </div>

            {/* Espacios bloqueados */}
            {activeItemModal.spaces && activeItemModal.spaces.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block">
                  Espacios Reservados:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeItemModal.spaces.map((sp, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold"
                    >
                      ✓ {sp}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs bg-stone-50 p-4 rounded-xl border border-stone-200">
              <div>
                <span className="text-stone-500 font-medium">Fechas de Reserva:</span>
                <p className="font-bold text-stone-900">
                  {formatDate(activeItemModal.startDate)} al {formatDate(activeItemModal.endDate)}
                </p>
              </div>
              <div>
                <span className="text-stone-500 font-medium">Monto del Contrato:</span>
                <p className="font-mono font-bold text-emerald-800 text-sm">
                  {activeItemModal.value ? formatCurrency(activeItemModal.value, activeItemModal.currency) : 'N/A'}
                </p>
              </div>
              {activeItemModal.clientOrLead && (
                <div>
                  <span className="text-stone-500 font-medium">Cliente / Contacto:</span>
                  <p className="font-bold text-stone-900">{activeItemModal.clientOrLead}</p>
                </div>
              )}
              {activeItemModal.roomNights !== undefined && activeItemModal.roomNights > 0 && (
                <div>
                  <span className="text-stone-500 font-medium">Room Nights:</span>
                  <p className="font-bold text-stone-900">{activeItemModal.roomNights} Noches Habitación</p>
                </div>
              )}
            </div>

            {activeItemModal.notes && (
              <div className="space-y-1 text-xs">
                <span className="text-stone-500 font-medium">Requerimientos & Notas:</span>
                <p className="text-stone-800 bg-white p-3 rounded-xl border border-stone-200 leading-relaxed">
                  {activeItemModal.notes}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveItemModal(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
