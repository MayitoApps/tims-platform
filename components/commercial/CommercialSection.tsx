'use client';

import React, { useState } from 'react';
import { HotelDeal, HotelDealStage, DealCategory, UserProfile, RequestedRoomType } from '@/lib/types';
import { HOTEL_PROPERTIES, HOTEL_SPACES, HOTEL_ROOM_TYPES } from '@/lib/initial-data';
import { formatCurrency, formatDate, getHotelDealStageBadge, getDealCategoryLabel } from '@/lib/utils';
import { SharedCalendar } from '@/components/SharedCalendar';

interface CommercialSectionProps {
  deals: HotelDeal[];
  currentUser?: UserProfile | null;
  onAddDeal: (deal: Omit<HotelDeal, 'id' | 'code' | 'createdAt'>) => void;
  onUpdateDeal: (deal: HotelDeal) => void;
  onDeleteDeal: (dealId: string) => void;
  onUpdateDealStage: (id: string, stage: HotelDealStage) => void;
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
  currentUser,
  onAddDeal,
  onUpdateDeal,
  onDeleteDeal,
  onUpdateDealStage
}: CommercialSectionProps) {
  const [subView, setSubView] = useState<'pipeline' | 'calendario' | 'tabla' | 'reporte'>('pipeline');
  const [selectedHotelFilter, setSelectedHotelFilter] = useState('all');
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<HotelDealStage | null>(null);
  const [boardLayout, setBoardLayout] = useState<'fit' | 'scroll'>('fit');

  // Modal - Create
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);

  // Modal - Edit & Delete
  const [editingDeal, setEditingDeal] = useState<HotelDeal | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editConflictError, setEditConflictError] = useState<string | null>(null);
  const [dealToDelete, setDealToDelete] = useState<HotelDeal | null>(null);

  // Modal - Ver Detalle Completo en Grande
  const [viewingDeal, setViewingDeal] = useState<HotelDeal | null>(null);

  // Edit form states
  const [editClientName, setEditClientName] = useState('');
  const [editCompany, setEditCompany] = useState('');
  const [editHotel, setEditHotel] = useState(HOTEL_PROPERTIES[0]);
  const [editSelectedSpaces, setEditSelectedSpaces] = useState<string[]>([]);
  const [editRoomQuantities, setEditRoomQuantities] = useState<Record<string, number>>({});
  const [editCategory, setEditCategory] = useState<DealCategory>('bodas_sociales');
  const [editStage, setEditStage] = useState<HotelDealStage>('rfp_recibido');
  const [editTotalValue, setEditTotalValue] = useState('350000');
  const [editCurrency, setEditCurrency] = useState<'MXN' | 'USD'>('MXN');
  const [editRoomNights, setEditRoomNights] = useState('24');
  const [editAttendees, setEditAttendees] = useState('120');
  const [editCheckIn, setEditCheckIn] = useState('2026-05-15');
  const [editCheckOut, setEditCheckOut] = useState('2026-05-17');
  const [editNotes, setEditNotes] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');

  // Form states - Deal
  const [clientName, setClientName] = useState('');
  const [company, setCompany] = useState('');
  const [hotel, setHotel] = useState(HOTEL_PROPERTIES[0]);
  const [selectedSpaces, setSelectedSpaces] = useState<string[]>([]);
  const [roomQuantities, setRoomQuantities] = useState<Record<string, number>>({});
  const [category, setCategory] = useState<DealCategory>('bodas_sociales');
  const [totalValue, setTotalValue] = useState('350000');
  const [currency, setCurrency] = useState<'MXN' | 'USD'>('MXN');
  const [roomNights, setRoomNights] = useState('24');
  const [attendees, setAttendees] = useState('120');
  const [checkIn, setCheckIn] = useState('2026-05-15');
  const [checkOut, setCheckOut] = useState('2026-05-17');
  const [notes, setNotes] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const availableSpaces = HOTEL_SPACES[hotel] || [];
  const availableRoomTypes = HOTEL_ROOM_TYPES[hotel] || [];

  const getStayNights = (inDate: string, outDate: string) => {
    const d1 = new Date(inDate);
    const d2 = new Date(outDate);
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const handleToggleSpace = (spaceName: string) => {
    setConflictError(null);
    setSelectedSpaces((prev) =>
      prev.includes(spaceName) ? prev.filter((s) => s !== spaceName) : [...prev, spaceName]
    );
  };

  const handleRoomQtyChange = (roomName: string, deltaOrVal: number | string) => {
    setRoomQuantities((prev) => {
      const current = prev[roomName] || 0;
      let nextVal = 0;
      if (typeof deltaOrVal === 'number') {
        nextVal = Math.max(0, current + deltaOrVal);
      } else {
        nextVal = Math.max(0, parseInt(deltaOrVal) || 0);
      }
      const updated = { ...prev, [roomName]: nextVal };
      const totalRooms = Object.values(updated).reduce((acc, count) => acc + count, 0);
      const nights = getStayNights(checkIn, checkOut);
      if (totalRooms > 0) {
        setRoomNights(String(totalRooms * nights));
      }
      return updated;
    });
  };

  const handleHotelChangeInForm = (newHotel: string) => {
    setHotel(newHotel);
    setSelectedSpaces([]);
    setRoomQuantities({});
    setConflictError(null);
  };

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

  // EDIT MODAL HANDLERS
  const openEditModal = (deal: HotelDeal) => {
    setEditingDeal(deal);
    setEditClientName(deal.clientName);
    setEditCompany(deal.companyOrAgency);
    setEditHotel(deal.hotelName);
    setEditSelectedSpaces(deal.selectedSpaces || []);
    setEditCategory(deal.category);
    setEditStage(deal.stage);
    setEditTotalValue(String(deal.totalValue));
    setEditCurrency(deal.currency);
    setEditRoomNights(String(deal.roomNights));
    setEditAttendees(String(deal.attendeesCount || 0));
    setEditCheckIn(deal.checkInDate);
    setEditCheckOut(deal.checkOutDate);
    setEditNotes(deal.notes || '');
    setEditEmail(deal.contactEmail || '');
    setEditPhone(deal.contactPhone || '');
    setEditConflictError(null);

    const roomMap: Record<string, number> = {};
    if (deal.requestedRooms) {
      deal.requestedRooms.forEach((r) => {
        roomMap[r.roomTypeName] = r.count;
      });
    }
    setEditRoomQuantities(roomMap);
    setIsEditModalOpen(true);
  };

  const handleToggleEditSpace = (spaceName: string) => {
    setEditConflictError(null);
    setEditSelectedSpaces((prev) =>
      prev.includes(spaceName) ? prev.filter((s) => s !== spaceName) : [...prev, spaceName]
    );
  };

  const handleEditRoomQtyChange = (roomName: string, deltaOrVal: number | string) => {
    setEditRoomQuantities((prev) => {
      const current = prev[roomName] || 0;
      let nextVal = 0;
      if (typeof deltaOrVal === 'number') {
        nextVal = Math.max(0, current + deltaOrVal);
      } else {
        nextVal = Math.max(0, parseInt(deltaOrVal) || 0);
      }
      const updated = { ...prev, [roomName]: nextVal };
      const totalRooms = Object.values(updated).reduce((acc, count) => acc + count, 0);
      const nights = getStayNights(editCheckIn, editCheckOut);
      if (totalRooms > 0) {
        setEditRoomNights(String(totalRooms * nights));
      }
      return updated;
    });
  };

  const handleEditHotelChange = (newHotel: string) => {
    setEditHotel(newHotel);
    setEditSelectedSpaces([]);
    setEditRoomQuantities({});
    setEditConflictError(null);
  };

  const handleSaveEditDeal = (e: React.FormEvent) => {
    e.preventDefault();
    setEditConflictError(null);

    if (!editingDeal) return;
    if (!editClientName.trim()) return;

    // Strict overlap check against OTHER deals (exclude current editing deal)
    if (editStage === 'contratado' || editStage === 'negociacion') {
      const targetSpaces = editSelectedSpaces.length > 0
        ? editSelectedSpaces
        : (HOTEL_SPACES[editHotel] || []).map((s) => s.name);

      const newIn = new Date(editCheckIn).getTime();
      const newOut = new Date(editCheckOut).getTime();

      for (const d of deals) {
        if (d.id === editingDeal.id) continue; // Exclude self
        if (d.hotelName !== editHotel) continue;
        if (d.stage === 'perdido') continue;

        const dIn = new Date(d.checkInDate).getTime();
        const dOut = new Date(d.checkOutDate).getTime();

        const datesOverlap = newIn <= dOut && newOut >= dIn;

        if (datesOverlap) {
          const conflictingSpaces = (d.selectedSpaces || []).filter((sp) =>
            targetSpaces.includes(sp)
          );

          if (conflictingSpaces.length > 0) {
            setEditConflictError(
              'Conflicto de Fechas: El espacio ' + conflictingSpaces.join(', ') + ' ya está reservado por ' + d.companyOrAgency + ' (' + d.code + ') del ' + d.checkInDate + ' al ' + d.checkOutDate + '. Elige otras fechas o espacios para continuar.'
            );
            return;
          }
        }
      }
    }

    const requestedRoomsBreakdown = Object.entries(editRoomQuantities)
      .filter(([_, count]) => count > 0)
      .map(([roomTypeName, count]) => ({ roomTypeName, count }));

    const updated: HotelDeal = {
      ...editingDeal,
      clientName: editClientName,
      companyOrAgency: editCompany || editClientName,
      hotelName: editHotel,
      selectedSpaces: editSelectedSpaces,
      requestedRooms: requestedRoomsBreakdown,
      category: editCategory,
      stage: editStage,
      totalValue: parseFloat(editTotalValue) || editingDeal.totalValue,
      currency: editCurrency,
      roomNights: parseInt(editRoomNights) || 0,
      attendeesCount: parseInt(editAttendees) || 0,
      checkInDate: editCheckIn,
      checkOutDate: editCheckOut,
      notes: editNotes,
      contactEmail: editEmail,
      contactPhone: editPhone
    };

    onUpdateDeal(updated);
    setIsEditModalOpen(false);
    setEditingDeal(null);
  };

  const handleConfirmDelete = () => {
    if (!dealToDelete) return;
    onDeleteDeal(dealToDelete.id);
    setDealToDelete(null);
  };

  // VALIDACIÓN ESTRICTA DE CONFLICTO DE FECHAS Y ESPACIOS
  const handleCreateDeal = (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError(null);

    if (!clientName.trim() || !company.trim()) return;

    const spacesToBook = selectedSpaces.length > 0 ? selectedSpaces : [availableSpaces[0]?.name || 'Área Principal'];

    // Validar si existe alguna reserva activa en el mismo hotel con solapamiento de fechas y espacios
    for (const deal of deals) {
      if (deal.hotelName === hotel && deal.stage !== 'perdido') {
        const isDateOverlap = checkIn <= deal.checkOutDate && checkOut >= deal.checkInDate;
        if (isDateOverlap) {
          const conflictingSpaces = spacesToBook.filter((sp) => deal.selectedSpaces.includes(sp));
          if (conflictingSpaces.length > 0) {
            setConflictError(
              `⚠️ Conflicto de disponibilidad: El espacio "${conflictingSpaces.join(', ')}" en ${hotel} ya se encuentra reservado del ${formatDate(deal.checkInDate)} al ${formatDate(deal.checkOutDate)} para "${deal.companyOrAgency}". No es posible reservar el mismo espacio en estas fechas.`
            );
            return; // DETIENE EL GUARDADO
          }
        }
      }
    }

    const requestedRoomsList: RequestedRoomType[] = Object.entries(roomQuantities)
      .filter(([_, count]) => count > 0)
      .map(([roomTypeName, count]) => ({ roomTypeName, count }));

    const assignedExecutive = currentUser?.name 
      ? `${currentUser.name}${currentUser.email ? ` (${currentUser.email})` : ''}`
      : 'Gerencia Comercial';

    onAddDeal({
      clientName,
      companyOrAgency: company,
      hotelName: hotel,
      selectedSpaces: spacesToBook,
      requestedRooms: requestedRoomsList.length > 0 ? requestedRoomsList : undefined,
      category,
      stage: 'rfp_recibido',
      totalValue: parseFloat(totalValue) || 150000,
      currency,
      roomNights: parseInt(roomNights) || (requestedRoomsList.reduce((acc, r) => acc + r.count, 0) * getStayNights(checkIn, checkOut)) || 10,
      attendeesCount: parseInt(attendees) || 50,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      assignedRep: assignedExecutive,
      notes: notes || 'Solicitud de bloqueo de espacios y cotización oficial.',
      contactEmail: email || 'contacto@empresa.com',
      contactPhone: phone || '+52 55 0000 0000'
    });

    setClientName('');
    setCompany('');
    setNotes('');
    setSelectedSpaces([]);
    setRoomQuantities({});
    setIsDealModalOpen(false);
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
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-2">
              <span>Grupo Orgánico Hoteles Boutique</span>
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl font-extrabold tracking-tight">
              Comercialización & Ventas de Hoteles
            </h2>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
              Gestión de grupos, bodas, eventos MICE, cuentas corporativas y bloqueo de espacios con control de solapamiento de fechas.
            </p>
          </div>

          {/* Quick Sub-View Selector (Salones y Tarifas retirado) */}
          <div className="flex flex-wrap items-center gap-1.5 bg-black/25 backdrop-blur-md p-1.5 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setSubView('pipeline')}
              className={`px-3.5 py-2 rounded-lg transition-all ${
                subView === 'pipeline'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              Pipeline Grupos ({deals.length})
            </button>
            <button
              onClick={() => setSubView('calendario')}
              className={`px-3.5 py-2 rounded-lg transition-all ${
                subView === 'calendario'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              📅 Calendario de Eventos & Bloqueos
            </button>
            <button
              onClick={() => setSubView('tabla')}
              className={`px-3.5 py-2 rounded-lg transition-all ${
                subView === 'tabla'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              Tabla de Negociaciones
            </button>
            <button
              onClick={() => setSubView('reporte')}
              className={`px-3.5 py-2 rounded-lg transition-all ${
                subView === 'reporte'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              Métricas
            </button>
          </div>
        </div>
      </div>

      {/* Hotel Filter & Action Bar */}
      {subView !== 'calendario' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Hotel:
            </span>
            <select
              value={selectedHotelFilter}
              onChange={(e) => setSelectedHotelFilter(e.target.value)}
              className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 text-stone-800 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="all">Todas las 6 Propiedades</option>
              {HOTEL_PROPERTIES.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              onClick={() => {
                setConflictError(null);
                setIsDealModalOpen(true);
              }}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <span>+ Nuevo Grupo / Cotización con Espacios</span>
            </button>
          </div>
        </div>
      )}

      {/* SUB-VIEW: CALENDARIO EXCLUSIVO DE COMERCIALIZACIÓN (SEPARADO) */}
      {subView === 'calendario' && (
        <SharedCalendar
          mode="commercial"
          deals={deals}
          onAddDealClick={() => {
            setConflictError(null);
            setIsDealModalOpen(true);
          }}
          onEditDealClick={openEditModal}
          onDeleteDealClick={(d) => setDealToDelete(d)}
        />
      )}

      {/* SUB-VIEW 1: KANBAN PIPELINE */}
      {subView === 'pipeline' && (
        <div className="space-y-3">
          {/* Board View Bar & D&D Helper */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2 text-xs text-stone-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-stone-800">Pipeline Comercial:</span>
              <span className="text-stone-500 hidden md:inline">
                Arrastra las tarjetas libremente entre fases para cambiar su estatus en tiempo real.
              </span>
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs">
              <button
                onClick={() => setBoardLayout('fit')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  boardLayout === 'fit'
                    ? 'bg-white text-emerald-950 shadow-xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Ajustar a Pantalla (Sin Scroll)
              </button>
              <button
                onClick={() => setBoardLayout('scroll')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  boardLayout === 'scroll'
                    ? 'bg-white text-emerald-950 shadow-xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Columnas Anchas
              </button>
            </div>
          </div>

          <div
            className={
              boardLayout === 'fit'
                ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3.5 pb-4 pt-1'
                : 'flex gap-3.5 overflow-x-auto pb-4 pt-1'
            }
          >
            {STAGES.map((col) => {
              const columnDeals = filteredDeals.filter((d) => d.stage === col.id);
              const colSum = columnDeals.reduce((acc, d) => acc + d.totalValue, 0);
              const isOver = dragOverStage === col.id;

              return (
                <div
                  key={col.id}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    if (dragOverStage !== col.id) setDragOverStage(col.id);
                  }}
                  onDragLeave={(e) => {
                    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                    setDragOverStage(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const dealId = e.dataTransfer.getData('text/plain') || draggedDealId;
                    if (dealId) {
                      onUpdateDealStage(dealId, col.id);
                    }
                    setDraggedDealId(null);
                    setDragOverStage(null);
                  }}
                  className={`transition-all duration-200 rounded-2xl p-3 flex flex-col min-h-[500px] max-h-[82vh] border ${
                    boardLayout === 'scroll' ? 'w-80 shrink-0' : 'w-full'
                  } ${
                    isOver
                      ? 'bg-emerald-50/90 border-emerald-400 ring-2 ring-emerald-400/60 shadow-md'
                      : 'bg-stone-100/70 border-stone-200'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-stone-200/90 mb-2.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${col.colorDot}`} />
                      <span className="text-xs font-bold text-stone-800 tracking-tight truncate">
                        {col.title}
                      </span>
                      <span className="text-[10px] text-stone-500 font-mono shrink-0">
                        ({columnDeals.length})
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-stone-800 shrink-0 ml-1">
                      {formatCurrency(colSum)}
                    </span>
                  </div>

                  <div className="space-y-2.5 overflow-y-auto flex-1 pr-0.5">
                    {columnDeals.map((deal) => {
                      const catInfo = getDealCategoryLabel(deal.category);
                      const stageIdx = STAGES.findIndex((s) => s.id === deal.stage);
                      const isBeingDragged = draggedDealId === deal.id;

                      return (
                        <div
                          key={deal.id}
                          draggable
                          onClick={() => setViewingDeal(deal)}
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', deal.id);
                            setDraggedDealId(deal.id);
                          }}
                          onDragEnd={() => {
                            setDraggedDealId(null);
                            setDragOverStage(null);
                          }}
                          className={`bg-white border rounded-xl p-3 shadow-2xs hover:shadow-md transition-all space-y-2 cursor-pointer ${
                            isBeingDragged
                              ? 'opacity-35 border-dashed border-emerald-500 scale-98 cursor-grabbing'
                              : 'border-stone-200 hover:border-emerald-300 hover:ring-2 hover:ring-emerald-200/50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <div className="min-w-0">
                              <span className="text-[9px] font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded-xs">
                                {deal.code}
                              </span>
                              <h4 className="font-editorial text-sm font-bold text-stone-900 leading-snug mt-0.5 truncate" title={deal.companyOrAgency}>
                                {deal.companyOrAgency}
                              </h4>
                              <div className="text-[11px] text-stone-500 font-medium truncate">
                                {deal.clientName}
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="font-mono text-xs font-bold text-emerald-900">
                                {formatCurrency(deal.totalValue, deal.currency)}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1 text-xs">
                            <div className="text-[11px] font-bold text-rose-700 flex items-center gap-1 truncate">
                              <span>🏨</span> {deal.hotelName}
                            </div>

                            {/* Espacios Seleccionados del Hotel */}
                            {deal.selectedSpaces && deal.selectedSpaces.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-0.5">
                                {deal.selectedSpaces.map((sp, idx) => (
                                  <span
                                    key={idx}
                                    className="text-[9px] font-semibold bg-emerald-50/80 text-emerald-900 border border-emerald-200 px-1.5 py-0.2 rounded-sm"
                                  >
                                    ✓ {sp}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                              <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-sm border ${catInfo.badge}`}>
                                {catInfo.label}
                              </span>
                              {deal.roomNights > 0 && (
                                <span className="text-[9px] font-mono bg-stone-100 text-stone-700 px-1.5 py-0.2 rounded-sm font-semibold">
                                  {deal.roomNights} RN
                                </span>
                              )}
                            </div>

                            {/* Desglose de Habitaciones Requeridas */}
                            {deal.requestedRooms && deal.requestedRooms.length > 0 && (
                              <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-1.5 space-y-0.5">
                                <div className="text-[9px] font-bold text-amber-900 flex items-center justify-between">
                                  <span className="flex items-center gap-1">🛏️ Habitaciones ({deal.requestedRooms.reduce((acc, r) => acc + r.count, 0)} total):</span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {deal.requestedRooms.map((rm, idx) => (
                                    <span key={idx} className="text-[9px] bg-white border border-amber-200/80 text-amber-900 px-1 py-0.2 rounded font-medium shadow-2xs">
                                      <strong className="font-bold">{rm.count}x</strong> {rm.roomTypeName}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="text-[10px] text-stone-600 font-mono bg-stone-50 p-1.5 rounded-lg border border-stone-100 flex items-center justify-between">
                            <span>📅 {formatDate(deal.checkInDate)}</span>
                            <span>→ {formatDate(deal.checkOutDate)}</span>
                          </div>

                          {/* Botón de apertura en grande */}
                          <div className="flex items-center justify-between pt-1 text-[10px] text-stone-500">
                            <span className="font-bold text-emerald-800 flex items-center gap-1 hover:underline">
                              👁️ Ver ficha completa
                            </span>
                            <span className="text-[9px] text-stone-400">Clic para ampliar</span>
                          </div>

                          <div className="flex items-center justify-between pt-1.5 border-t border-stone-100 text-[10px]">
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="text-stone-500 font-medium truncate" title={deal.assignedRep}>
                                👤 {deal.assignedRep.split(' ')[0]}
                              </span>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditModal(deal);
                                  }}
                                  title="Editar Evento"
                                  className="px-1.5 py-0.5 rounded-md bg-stone-100 hover:bg-emerald-100 text-stone-700 hover:text-emerald-900 border border-stone-200 font-semibold"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDealToDelete(deal);
                                  }}
                                  title="Eliminar Evento"
                                  className="px-1.5 py-0.5 rounded-md bg-stone-100 hover:bg-rose-100 text-stone-700 hover:text-rose-800 border border-stone-200"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              {stageIdx > 0 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveStage(deal, 'prev');
                                  }}
                                  title="Mover a etapa anterior"
                                  className="px-1.5 py-0.5 rounded-md border border-stone-300 hover:bg-stone-100 font-bold"
                                >
                                  ◀
                                </button>
                              )}
                              {stageIdx < STAGES.length - 1 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveStage(deal, 'next');
                                  }}
                                  title="Mover a etapa siguiente"
                                  className="px-1.5 py-0.5 rounded-md bg-emerald-700 text-white hover:bg-emerald-800 font-bold"
                                >
                                  ▶
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: TABLA DE NEGOCIACIONES */}
      {subView === 'tabla' && (
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Empresa / Cliente</th>
                  <th className="py-3 px-4">Hotel & Espacios Elegidos</th>
                  <th className="py-3 px-4">Etapa</th>
                  <th className="py-3 px-4">Valor Total</th>
                  <th className="py-3 px-4">Room Nights</th>
                  <th className="py-3 px-4">Fechas</th>
                  <th className="py-3 px-4">Ejecutivo</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredDeals.map((deal) => {
                  const badge = getHotelDealStageBadge(deal.stage);
                  return (
                    <tr
                      key={deal.id}
                      onClick={() => setViewingDeal(deal)}
                      className="hover:bg-emerald-50/60 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-emerald-800">{deal.code}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-stone-900">{deal.companyOrAgency}</div>
                        <div className="text-[11px] text-stone-500">{deal.clientName}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-rose-700">{deal.hotelName}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {deal.selectedSpaces.map((sp, idx) => (
                            <span key={idx} className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1 py-0.2 rounded-xs font-semibold">
                              {sp}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={deal.stage}
                          onClick={(e) => e.stopPropagation()}
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
                      <td className="py-3 px-4 font-mono text-stone-700 font-semibold">
                        <div>{deal.roomNights} RN</div>
                        {deal.requestedRooms && deal.requestedRooms.length > 0 && (
                          <div className="text-[10px] font-sans text-amber-800 font-normal mt-0.5">
                            {deal.requestedRooms.reduce((acc, r) => acc + r.count, 0)} habs solicitadas
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-stone-600 text-[11px] whitespace-nowrap">
                        {formatDate(deal.checkInDate)} al {formatDate(deal.checkOutDate)}
                      </td>
                      <td className="py-3 px-4 text-stone-600">{deal.assignedRep}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingDeal(deal);
                            }}
                            className="px-2 py-1 rounded-lg bg-stone-100 text-stone-800 border border-stone-200 text-xs font-semibold hover:bg-emerald-50 hover:text-emerald-900 transition-colors flex items-center gap-1 shadow-2xs"
                            title="Ver ficha completa en grande"
                          >
                            <span>👁️</span> Ver
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(deal);
                            }}
                            className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition-colors flex items-center gap-1"
                          >
                            <span>✏️</span> Editar
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDealToDelete(deal);
                            }}
                            className="p-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors text-xs"
                            title="Eliminar Evento"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: REPORTE & MÉTRICAS */}
      {subView === 'reporte' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
              Ingresos Totales en Negociación
            </span>
            <div className="font-editorial text-3xl font-extrabold text-emerald-800">
              {formatCurrency(totalPipelineRevenue)}
            </div>
            <p className="text-[11px] text-stone-500">Suma de todas las cotizaciones activas</p>
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
              Contratos Firmados (Confirmados)
            </span>
            <div className="font-editorial text-3xl font-extrabold text-teal-800">
              {formatCurrency(totalWonRevenue)}
            </div>
            <p className="text-[11px] text-emerald-700 font-bold">Cierres exitosos confirmados</p>
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
              Total Room Nights Vendidas
            </span>
            <div className="font-editorial text-3xl font-extrabold text-amber-800">
              {totalRoomNights} <span className="text-sm font-sans font-normal text-stone-500">RN</span>
            </div>
            <p className="text-[11px] text-stone-500">Noches habitación de grupos</p>
          </div>
        </div>
      )}

      {/* MODAL: NUEVA COTIZACIÓN / RFP CON PREVENCIÓN DE CONFLICTO DE FECHAS */}
      {isDealModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-xl p-6 sm:p-8 space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="font-editorial text-2xl font-bold text-stone-900">
                  Alta de Cliente & Reserva de Espacios
                </h3>
                <p className="text-xs text-stone-500">
                  Selecciona la propiedad de Grupo Orgánico y marca los espacios requeridos.
                </p>
              </div>
              <button onClick={() => setIsDealModalOpen(false)} className="text-stone-400 hover:text-stone-600 text-lg">
                ✕
              </button>
            </div>

            {/* ALERTA DE CONFLICTO DE FECHAS / ESPACIOS BLOQUEADOS */}
            {conflictError && (
              <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-400 text-rose-950 text-xs font-semibold leading-relaxed animate-shake">
                {conflictError}
              </div>
            )}

            <form onSubmit={handleCreateDeal} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Empresa / Nombre del Grupo</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Boda García-Suárez / Retiro Deloitte"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Persona de Contacto</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Lic. Andrea Suárez"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Selector de Hotel */}
              <div>
                <label className="block text-stone-700 font-bold mb-1">Hotel de Grupo Orgánico</label>
                <select
                  value={hotel}
                  onChange={(e) => handleHotelChangeInForm(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white font-semibold text-xs focus:ring-2 focus:ring-emerald-500"
                >
                  {HOTEL_PROPERTIES.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              {/* ESPACIOS DISPONIBLES DE ESTE HOTEL (Checkboxes dinámicos de gohb.com.mx) */}
              <div className="space-y-2 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-stone-800 uppercase tracking-wider">
                    Espacios Oficiales en {hotel}:
                  </label>
                  <span className="text-[10px] font-bold text-emerald-800">
                    {selectedSpaces.length} seleccionados
                  </span>
                </div>
                <p className="text-[11px] text-stone-500">
                  Elige uno o varios espacios para verificar disponibilidad en las fechas elegidas:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 max-h-48 overflow-y-auto pr-1">
                  {availableSpaces.map((space) => {
                    const isSelected = selectedSpaces.includes(space.name);
                    return (
                      <div
                        key={space.id}
                        onClick={() => handleToggleSpace(space.name)}
                        className={`p-2 rounded-xl border cursor-pointer transition-all flex items-start gap-2 ${
                          isSelected
                            ? 'bg-emerald-100/90 border-emerald-500 text-emerald-950 font-bold shadow-2xs'
                            : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="mt-0.5 rounded-sm accent-emerald-600"
                        />
                        <div className="leading-tight">
                          <div className="text-xs">{space.name}</div>
                          <div className="text-[9px] text-stone-500">{space.description}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* HABITACIONES Y CABAÑAS REQUERIDAS DE ESTE HOTEL (Tipos oficiales de sus páginas web) */}
              <div className="space-y-2 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🛏️</span> Habitaciones Requeridas en {hotel}:
                  </label>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    {Object.values(roomQuantities).reduce((a, b) => a + b, 0)} habitaciones solicitadas
                  </span>
                </div>
                <p className="text-[11px] text-stone-500">
                  Especifica cuántas habitaciones o cabañas de cada tipo necesitará el evento:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 max-h-52 overflow-y-auto pr-1">
                  {availableRoomTypes.map((rt) => {
                    const qty = roomQuantities[rt.name] || 0;
                    return (
                      <div
                        key={rt.id}
                        className={`p-2.5 rounded-xl border transition-all flex flex-col justify-between ${
                          qty > 0
                            ? 'bg-emerald-50/90 border-emerald-500 text-stone-900 shadow-2xs'
                            : 'bg-white border-stone-200 text-stone-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-xs text-stone-900">{rt.name}</span>
                            <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 rounded px-1.5 py-0.2 shrink-0">
                              {rt.capacity}
                            </span>
                          </div>
                          <p className="text-[10px] text-stone-500 mt-1 leading-tight">{rt.description}</p>
                        </div>

                        <div className="flex items-center justify-between pt-2 mt-2 border-t border-stone-200/60">
                          <span className="text-[10px] text-stone-600 font-medium">Cantidad:</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleRoomQtyChange(rt.name, -1)}
                              className="w-6 h-6 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center text-xs transition-colors"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={qty}
                              onChange={(e) => handleRoomQtyChange(rt.name, e.target.value)}
                              className="w-12 text-center border border-stone-300 rounded-md py-0.5 text-xs font-mono font-bold bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleRoomQtyChange(rt.name, 1)}
                              className="w-6 h-6 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center justify-center text-xs transition-colors shadow-2xs"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {Object.values(roomQuantities).reduce((a, b) => a + b, 0) > 0 && (
                  <div className="bg-emerald-100/70 border border-emerald-300/80 rounded-xl p-2.5 flex items-center justify-between text-xs text-emerald-950 font-medium">
                    <span className="font-bold">
                      {Object.values(roomQuantities).reduce((a, b) => a + b, 0)} habitaciones x {getStayNights(checkIn, checkOut)} {getStayNights(checkIn, checkOut) === 1 ? 'noche' : 'noches'}
                    </span>
                    <span className="font-mono font-bold text-emerald-900">
                      = {Object.values(roomQuantities).reduce((a, b) => a + b, 0) * getStayNights(checkIn, checkOut)} Room Nights estimadas
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Categoría</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white"
                  >
                    <option value="bodas_sociales">Bodas & Eventos Sociales</option>
                    <option value="grupos_convenciones">Grupos & Convenciones (MICE)</option>
                    <option value="cuentas_empresariales">Convenio Corporativo Anual</option>
                    <option value="agencias_viaje">Agencia de Viaje / Mayorista</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Ejecutivo Asignado</label>
                  <div className="border border-stone-200 bg-stone-100 rounded-xl px-3 py-2 text-stone-800 flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="truncate">{currentUser?.name || 'Ejecutivo Comercial'}</span>
                    </div>
                    <span className="text-[9px] uppercase font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded shrink-0">
                      Perfil Activo
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Valor Total Estimado</label>
                  <input
                    type="number"
                    value={totalValue}
                    onChange={(e) => setTotalValue(e.target.value)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Moneda</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as any)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white"
                  >
                    <option value="MXN">MXN ($)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Room Nights</label>
                  <input
                    type="number"
                    value={roomNights}
                    onChange={(e) => setRoomNights(e.target.value)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Fecha Check-in</label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => {
                      const newCheckIn = e.target.value;
                      setCheckIn(newCheckIn);
                      setConflictError(null);
                      const totalRooms = Object.values(roomQuantities).reduce((acc, count) => acc + count, 0);
                      if (totalRooms > 0) {
                        const nights = getStayNights(newCheckIn, checkOut);
                        setRoomNights(String(totalRooms * nights));
                      }
                    }}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Fecha Check-out</label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => {
                      const newCheckOut = e.target.value;
                      setCheckOut(newCheckOut);
                      setConflictError(null);
                      const totalRooms = Object.values(roomQuantities).reduce((acc, count) => acc + count, 0);
                      if (totalRooms > 0) {
                        const nights = getStayNights(checkIn, newCheckOut);
                        setRoomNights(String(totalRooms * nights));
                      }
                    }}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">Detalles de Montaje / Requerimientos</label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre banquete, montaje de salón, requerimientos técnicos..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsDealModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-xs"
                >
                  Guardar y Bloquear en Calendario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL: EDITAR EVENTO / COTIZACIÓN */}
      {isEditModalOpen && editingDeal && (
        <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-2xl p-6 sm:p-8 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {editingDeal.code}
                  </span>
                  <h3 className="font-editorial text-2xl font-bold text-stone-900">
                    Editar Evento / Cotización
                  </h3>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Modifica fechas, espacios, habitaciones o condiciones comerciales. Se sincronizará en la base de datos.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingDeal(null);
                }}
                className="text-stone-400 hover:text-stone-600 text-lg"
              >
                ✕
              </button>
            </div>

            {/* Error por Traslape de Espacio */}
            {editConflictError && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-800 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-rose-900">
                  <span>🚫</span> Conflicto de Calendario Detectado
                </div>
                <p className="leading-relaxed">{editConflictError}</p>
              </div>
            )}

            <form onSubmit={handleSaveEditDeal} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Empresa / Nombre del Evento</label>
                  <input
                    type="text"
                    required
                    value={editCompany}
                    onChange={(e) => setEditCompany(e.target.value)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Nombre del Contacto Principal</label>
                  <input
                    type="text"
                    required
                    value={editClientName}
                    onChange={(e) => setEditClientName(e.target.value)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Hotel Destino</label>
                  <select
                    value={editHotel}
                    onChange={(e) => handleEditHotelChange(e.target.value)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white"
                  >
                    {HOTEL_PROPERTIES.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Etapa Comercial</label>
                  <select
                    value={editStage}
                    onChange={(e) => setEditStage(e.target.value as HotelDealStage)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white font-semibold"
                  >
                    {STAGES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Tipo de Evento</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as DealCategory)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white"
                  >
                    <option value="bodas_sociales">Bodas & Sociales</option>
                    <option value="grupos_convenciones">Grupos & MICE</option>
                    <option value="cuentas_empresariales">Convenios Empresariales</option>
                    <option value="agencias_viaje">Agencias & Mayoristas</option>
                  </select>
                </div>
              </div>

              {/* SELECCIÓN DE ESPACIOS */}
              <div className="space-y-2 bg-stone-50 p-3 rounded-xl border border-stone-200">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-stone-800 uppercase tracking-wider">
                    Espacios del Hotel a Reservar:
                  </label>
                  <span className="text-[10px] text-stone-500">
                    {editSelectedSpaces.length} seleccionados
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto">
                  {(HOTEL_SPACES[editHotel] || []).map((space) => {
                    const isSelected = editSelectedSpaces.includes(space.name);
                    return (
                      <div
                        key={space.id}
                        onClick={() => handleToggleEditSpace(space.name)}
                        className={'p-1.5 rounded-lg border text-[11px] cursor-pointer flex items-center gap-1.5 transition-colors ' + (
                          isSelected
                            ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold'
                            : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="accent-emerald-600 rounded"
                        />
                        <span className="truncate" title={space.description}>
                          {space.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* HABITACIONES REQUERIDAS */}
              <div className="space-y-2 bg-amber-50/50 p-3 rounded-xl border border-amber-200/80">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🛏️</span> Habitaciones por Tipo ({editHotel}):
                  </label>
                  <span className="text-[11px] font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md">
                    Total: {Object.values(editRoomQuantities).reduce((a, b) => a + b, 0)} habitaciones
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pt-1">
                  {(HOTEL_ROOM_TYPES[editHotel] || []).map((room) => {
                    const count = editRoomQuantities[room.name] || 0;
                    return (
                      <div
                        key={room.id}
                        className="bg-white p-2 rounded-xl border border-amber-200/70 flex items-center justify-between gap-2 shadow-2xs"
                      >
                        <div className="min-w-0">
                          <p className="font-bold text-stone-900 text-[11px] truncate">{room.name}</p>
                          <p className="text-[9px] text-stone-500 truncate">{room.capacity}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleEditRoomQtyChange(room.name, -1)}
                            className="w-6 h-6 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold flex items-center justify-center text-xs"
                          >
                            -
                          </button>
                          <span className="w-6 text-center font-mono font-bold text-xs text-stone-900">
                            {count}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleEditRoomQtyChange(room.name, 1)}
                            className="w-6 h-6 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center justify-center text-xs"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Fechas de Check-In y Check-Out */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Fecha Check-In (Llegada)</label>
                  <input
                    type="date"
                    required
                    value={editCheckIn}
                    onChange={(e) => {
                      const newIn = e.target.value;
                      setEditCheckIn(newIn);
                      setEditConflictError(null);
                      const totalRooms = Object.values(editRoomQuantities).reduce((acc, c) => acc + c, 0);
                      if (totalRooms > 0) {
                        const nights = getStayNights(newIn, editCheckOut);
                        setEditRoomNights(String(totalRooms * nights));
                      }
                    }}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Fecha Check-Out (Salida)</label>
                  <input
                    type="date"
                    required
                    value={editCheckOut}
                    onChange={(e) => {
                      const newOut = e.target.value;
                      setEditCheckOut(newOut);
                      setEditConflictError(null);
                      const totalRooms = Object.values(editRoomQuantities).reduce((acc, c) => acc + c, 0);
                      if (totalRooms > 0) {
                        const nights = getStayNights(editCheckIn, newOut);
                        setEditRoomNights(String(totalRooms * nights));
                      }
                    }}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white"
                  />
                </div>
              </div>

              {/* Valores Comerciales */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Valor Total</label>
                  <input
                    type="number"
                    value={editTotalValue}
                    onChange={(e) => setEditTotalValue(e.target.value)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Moneda</label>
                  <select
                    value={editCurrency}
                    onChange={(e) => setEditCurrency(e.target.value as any)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white"
                  >
                    <option value="MXN">MXN ($)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Room Nights</label>
                  <input
                    type="number"
                    value={editRoomNights}
                    onChange={(e) => setEditRoomNights(e.target.value)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Asistentes</label>
                  <input
                    type="number"
                    value={editAttendees}
                    onChange={(e) => setEditAttendees(e.target.value)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
              </div>

              {/* Contacto */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Email del Cliente</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">Notas / Requerimientos</label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 resize-none"
                />
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => {
                    const toDel = editingDeal;
                    setIsEditModalOpen(false);
                    setEditingDeal(null);
                    if (toDel) setDealToDelete(toDel);
                  }}
                  className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <span>🗑️ Eliminar este Evento</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditingDeal(null);
                    }}
                    className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-xs"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMACIÓN DE ELIMINACIÓN */}
      {dealToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-xl shrink-0">
                ⚠️
              </div>
              <div>
                <h3 className="font-editorial text-xl font-bold text-stone-900">
                  ¿Eliminar este Evento?
                </h3>
                <p className="text-xs text-stone-500">
                  Esta acción liberará las fechas en el calendario y se sincronizará con la base de datos.
                </p>
              </div>
            </div>

            <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-xs space-y-1">
              <div className="font-bold text-stone-900">
                {dealToDelete.code} · {dealToDelete.companyOrAgency}
              </div>
              <div className="text-stone-600">
                🏨 <strong>{dealToDelete.hotelName}</strong> ({dealToDelete.checkInDate} al {dealToDelete.checkOutDate})
              </div>
              {dealToDelete.selectedSpaces && dealToDelete.selectedSpaces.length > 0 && (
                <div className="text-[11px] text-stone-500 pt-0.5">
                  Espacios: {dealToDelete.selectedSpaces.join(', ')}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setDealToDelete(null)}
                className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 font-semibold text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs"
              >
                Eliminar Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VER DETALLE COMPLETO DEL EVENTO EN GRANDE */}
      {viewingDeal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-3xl p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto">
            {/* Encabezado */}
            <div className="flex items-start justify-between border-b border-stone-200 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                    {viewingDeal.code}
                  </span>
                  {(() => {
                    const badge = getHotelDealStageBadge(viewingDeal.stage);
                    const catInfo = getDealCategoryLabel(viewingDeal.category);
                    return (
                      <>
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                          {badge.label}
                        </span>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${catInfo.badge}`}>
                          {catInfo.label}
                        </span>
                      </>
                    );
                  })()}
                </div>
                <h3 className="font-editorial text-2xl sm:text-3xl font-extrabold text-stone-900 leading-tight">
                  {viewingDeal.companyOrAgency}
                </h3>
                <div className="flex items-center gap-3 text-xs text-stone-600 flex-wrap">
                  <span>👤 Cliente: <strong className="text-stone-900 font-bold">{viewingDeal.clientName}</strong></span>
                  <span>•</span>
                  <span className="text-rose-700 font-bold flex items-center gap-1">
                    🏨 {viewingDeal.hotelName}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setViewingDeal(null)}
                className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-lg font-bold transition-colors shrink-0"
                title="Cerrar (Esc)"
              >
                ✕
              </button>
            </div>

            {/* Tarjetas Métricas Principales */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
                  Valor Total
                </span>
                <div className="font-mono text-lg sm:text-xl font-extrabold text-emerald-950">
                  {formatCurrency(viewingDeal.totalValue, viewingDeal.currency)}
                </div>
                <span className="text-[10px] text-emerald-700 font-medium">Cotizado</span>
              </div>

              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3.5 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider block">
                  Room Nights
                </span>
                <div className="font-mono text-lg sm:text-xl font-extrabold text-amber-950">
                  {viewingDeal.roomNights} <span className="text-xs font-sans text-amber-800 font-normal">RN</span>
                </div>
                <span className="text-[10px] text-amber-700 font-medium">Hospedaje Grupal</span>
              </div>

              <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-3.5 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-blue-800 tracking-wider block">
                  Asistentes
                </span>
                <div className="font-mono text-lg sm:text-xl font-extrabold text-blue-950">
                  {viewingDeal.attendeesCount || 'N/A'} <span className="text-xs font-sans text-blue-800 font-normal">pax</span>
                </div>
                <span className="text-[10px] text-blue-700 font-medium">Banquete / Evento</span>
              </div>

              <div className="bg-purple-50/80 border border-purple-200 rounded-2xl p-3.5 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-purple-800 tracking-wider block">
                  Estancia
                </span>
                <div className="font-mono text-lg sm:text-xl font-extrabold text-purple-950">
                  {getStayNights(viewingDeal.checkInDate, viewingDeal.checkOutDate)} <span className="text-xs font-sans text-purple-800 font-normal">noches</span>
                </div>
                <span className="text-[10px] text-purple-700 font-medium">{formatDate(viewingDeal.checkInDate)}</span>
              </div>
            </div>

            {/* Fechas de Evento */}
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-lg shrink-0">
                  📅
                </span>
                <div>
                  <span className="font-bold text-stone-900 block text-sm">
                    {formatDate(viewingDeal.checkInDate)} → {formatDate(viewingDeal.checkOutDate)}
                  </span>
                  <span className="text-stone-500 text-[11px]">
                    Bloqueo de calendario en {viewingDeal.hotelName} ({getStayNights(viewingDeal.checkInDate, viewingDeal.checkOutDate)} noches de ocupación)
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-stone-200/80 text-stone-800 font-bold self-start sm:self-auto">
                Check-in: 15:00 hrs · Check-out: 12:00 hrs
              </span>
            </div>

            {/* Espacios Reservados Oficiales */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span>🏛️</span> Espacios Reservados del Hotel:
                </h4>
                <span className="text-[11px] font-bold text-emerald-800">
                  {viewingDeal.selectedSpaces?.length || 0} área(s) bloqueada(s)
                </span>
              </div>
              {viewingDeal.selectedSpaces && viewingDeal.selectedSpaces.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {viewingDeal.selectedSpaces.map((sp, idx) => {
                    const spaceInfo = (HOTEL_SPACES[viewingDeal.hotelName] || []).find((s) => s.name === sp);
                    return (
                      <div key={idx} className="bg-emerald-50/70 border border-emerald-200/90 rounded-xl p-3 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-emerald-800 font-bold">✓</span>
                          <span className="font-bold text-emerald-950 text-xs">{sp}</span>
                        </div>
                        {spaceInfo && (
                          <p className="text-[11px] text-stone-600 leading-snug">
                            {spaceInfo.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-stone-400 text-xs italic bg-stone-50 p-3 rounded-xl border border-dashed border-stone-200">
                  Sin espacios específicos asignados (Aplica a toda la propiedad o por definir).
                </p>
              )}
            </div>

            {/* Desglose de Habitaciones Solicitadas */}
            {viewingDeal.requestedRooms && viewingDeal.requestedRooms.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span>🛏️</span> Habitaciones Solicitadas por Tipo:
                  </h4>
                  <span className="text-[11px] font-bold text-amber-800">
                    {viewingDeal.requestedRooms.reduce((acc, r) => acc + r.count, 0)} habitaciones totales
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {viewingDeal.requestedRooms.map((rm, idx) => {
                    const roomInfo = (HOTEL_ROOM_TYPES[viewingDeal.hotelName] || []).find((r) => r.name === rm.roomTypeName);
                    return (
                      <div key={idx} className="bg-amber-50/70 border border-amber-200/90 rounded-xl p-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-950 text-xs">{rm.roomTypeName}</span>
                          <span className="font-mono font-extrabold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-md text-xs">
                            {rm.count}x
                          </span>
                        </div>
                        {roomInfo && (
                          <div className="text-[10px] text-stone-600">
                            Capacidad: <strong>{roomInfo.capacity}</strong>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Datos de Contacto y Ejecutivo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-stone-50 border border-stone-200 rounded-2xl p-4 text-xs">
              <div>
                <span className="text-stone-500 font-medium block">Ejecutivo Comercial:</span>
                <span className="font-bold text-stone-900 text-sm">{viewingDeal.assignedRep}</span>
              </div>
              <div>
                <span className="text-stone-500 font-medium block">Correo de Contacto:</span>
                {viewingDeal.contactEmail ? (
                  <a
                    href={`mailto:${viewingDeal.contactEmail}`}
                    className="font-bold text-emerald-700 hover:text-emerald-900 underline block truncate"
                  >
                    ✉️ {viewingDeal.contactEmail}
                  </a>
                ) : (
                  <span className="text-stone-400">No especificado</span>
                )}
              </div>
              <div>
                <span className="text-stone-500 font-medium block">Teléfono / WhatsApp:</span>
                {viewingDeal.contactPhone ? (
                  <a
                    href={`tel:${viewingDeal.contactPhone}`}
                    className="font-bold text-emerald-700 hover:text-emerald-900 underline block"
                  >
                    📞 {viewingDeal.contactPhone}
                  </a>
                ) : (
                  <span className="text-stone-400">No especificado</span>
                )}
              </div>
            </div>

            {/* Notas y Requerimientos Especiales */}
            <div className="space-y-1.5">
              <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <span>📝</span> Requerimientos Especiales, Banquete y Notas:
              </h4>
              <div className="bg-white p-4 rounded-2xl border border-stone-200 text-stone-700 text-xs leading-relaxed whitespace-pre-wrap">
                {viewingDeal.notes || 'Sin especificaciones ni notas adicionales registradas en este evento.'}
              </div>
            </div>

            {/* Fase y Control de Pipeline */}
            <div className="space-y-2 pt-2 border-t border-stone-200">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-stone-800 uppercase tracking-wider">
                  Etapa en el Pipeline Comercial:
                </span>
                <span className="text-stone-500">Cambia la fase directamente:</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                {STAGES.map((s) => {
                  const isCurrent = viewingDeal.stage === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        onUpdateDealStage(viewingDeal.id, s.id);
                        setViewingDeal({ ...viewingDeal, stage: s.id });
                      }}
                      className={`px-2 py-1.5 rounded-xl text-[11px] font-bold border transition-all text-center flex items-center justify-center gap-1 ${
                        isCurrent
                          ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                          : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${s.colorDot}`} />
                      <span className="truncate">{s.title.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Acciones del Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-stone-200">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    const d = viewingDeal;
                    setViewingDeal(null);
                    openEditModal(d);
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <span>✏️</span> Editar Información Completa
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = viewingDeal;
                    setViewingDeal(null);
                    setDealToDelete(d);
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-all flex items-center justify-center gap-1"
                  title="Eliminar este evento"
                >
                  <span>🗑️</span> Eliminar
                </button>
              </div>

              <button
                type="button"
                onClick={() => setViewingDeal(null)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-xs"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
