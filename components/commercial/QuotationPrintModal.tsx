'use client';

import React, { useState } from 'react';
import { HotelDeal, DealRequirement, PaymentStatus, HotelDealStage } from '@/lib/types';
import { HOTEL_SPACES, HOTEL_ROOM_TYPES } from '@/lib/initial-data';
import { formatCurrency, formatDate } from '@/lib/utils';

interface QuotationPrintModalProps {
  deal: HotelDeal;
  onClose: () => void;
  onUpdateDeal?: (deal: HotelDeal) => void;
}

export function QuotationPrintModal({ deal, onClose, onUpdateDeal }: QuotationPrintModalProps) {
  // Deal data state (allows live editing before exporting)
  const [currentDeal, setCurrentDeal] = useState<HotelDeal>(deal);

  // Pre-export question & editing states
  const [showPreExportPrompt, setShowPreExportPrompt] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Form states for pre-export editing
  const [editCompany, setEditCompany] = useState(currentDeal.companyOrAgency);
  const [editClientName, setEditClientName] = useState(currentDeal.clientName);
  const [editContactPhone, setEditContactPhone] = useState(currentDeal.contactPhone || '');
  const [editContactEmail, setEditContactEmail] = useState(currentDeal.contactEmail || '');
  const [editCheckInDate, setEditCheckInDate] = useState(currentDeal.checkInDate);
  const [editCheckOutDate, setEditCheckOutDate] = useState(currentDeal.checkOutDate);
  const [editAttendeesCount, setEditAttendeesCount] = useState(String(currentDeal.attendeesCount || 50));
  const [editRoomNights, setEditRoomNights] = useState(String(currentDeal.roomNights || 10));
  const [editTotalValue, setEditTotalValue] = useState(String(currentDeal.totalValue || 0));
  const [editCurrency, setEditCurrency] = useState<'MXN' | 'USD'>(currentDeal.currency || 'MXN');
  const [editDepositAmount, setEditDepositAmount] = useState(String(currentDeal.depositAmount || 0));
  const [editPaymentStatus, setEditPaymentStatus] = useState<PaymentStatus>(currentDeal.paymentStatus || 'pendiente');
  const [editPaymentDueDate, setEditPaymentDueDate] = useState(currentDeal.paymentDueDate || '');
  const [editSelectedSpaces, setEditSelectedSpaces] = useState<string[]>(currentDeal.selectedSpaces || []);
  const [editNotes, setEditNotes] = useState(currentDeal.notes || '');
  const [editRequirements, setEditRequirements] = useState<DealRequirement[]>(currentDeal.requirements ? [...currentDeal.requirements] : []);
  const [newReqInput, setNewReqInput] = useState('');

  const hotelSpaces = HOTEL_SPACES[currentDeal.hotelName] || [];
  const hotelRooms = HOTEL_ROOM_TYPES[currentDeal.hotelName] || [];

  const getStayNights = (inDate: string, outDate: string) => {
    const d1 = new Date(inDate);
    const d2 = new Date(outDate);
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    // Set official filename for PDF export: ORDEN DE SERVICIO - [Nombre del hotel]
    document.title = `ORDEN DE SERVICIO - ${currentDeal.hotelName} - ${currentDeal.companyOrAgency || currentDeal.clientName}`;
    window.print();
    // Restore title after print dialog closes
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  const handleAddRequirement = () => {
    if (!newReqInput.trim()) return;
    const item: DealRequirement = {
      id: `req-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      text: newReqInput.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };
    setEditRequirements((prev) => [...prev, item]);
    setNewReqInput('');
  };

  const handleRemoveRequirement = (id: string) => {
    setEditRequirements((prev) => prev.filter((r) => r.id !== id));
  };

  const handleToggleRequirement = (id: string) => {
    setEditRequirements((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
    );
  };

  const handleToggleSpace = (spaceName: string) => {
    setEditSelectedSpaces((prev) =>
      prev.includes(spaceName) ? prev.filter((s) => s !== spaceName) : [...prev, spaceName]
    );
  };

  const handleSaveEdits = (andPrint = false) => {
    const totalValNum = parseFloat(editTotalValue) || currentDeal.totalValue;
    const depValNum = parseFloat(editDepositAmount) || 0;
    const calculatedBalance = editPaymentStatus === 'liquidado' ? 0 : Math.max(0, totalValNum - depValNum);

    const updated: HotelDeal = {
      ...currentDeal,
      companyOrAgency: editCompany.trim() || currentDeal.companyOrAgency,
      clientName: editClientName.trim() || currentDeal.clientName,
      contactPhone: editContactPhone.trim() || undefined,
      contactEmail: editContactEmail.trim() || undefined,
      checkInDate: editCheckInDate,
      checkOutDate: editCheckOutDate,
      attendeesCount: parseInt(editAttendeesCount) || 0,
      roomNights: parseInt(editRoomNights) || 0,
      totalValue: totalValNum,
      currency: editCurrency,
      depositAmount: depValNum,
      paymentStatus: editPaymentStatus,
      balanceDue: calculatedBalance,
      paymentDueDate: editPaymentDueDate || undefined,
      selectedSpaces: editSelectedSpaces,
      requirements: editRequirements,
      notes: editNotes
    };

    setCurrentDeal(updated);
    if (onUpdateDeal) {
      onUpdateDeal(updated);
    }
    setIsEditing(false);

    if (andPrint) {
      setTimeout(() => {
        handlePrint();
      }, 300);
    }
  };

  const depositValue = currentDeal.depositAmount || 0;
  const balanceValue = currentDeal.paymentStatus === 'liquidado' ? 0 : Math.max(0, (currentDeal.totalValue || 0) - depositValue);

  const getPaymentStatusBadge = (status?: string) => {
    switch (status) {
      case 'liquidado':
        return { label: 'LIQUIDADO 100%', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'anticipo_pagado':
        return { label: 'ANTICIPO PAGADO (RESERVA CONFIRMADA)', bg: 'bg-amber-100 text-amber-900 border-amber-300' };
      default:
        return { label: 'PENDIENTE DE PAGO', bg: 'bg-rose-100 text-rose-900 border-rose-300' };
    }
  };

  const statusBadge = getPaymentStatusBadge(currentDeal.paymentStatus);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm overflow-y-auto flex items-start justify-center p-2 sm:p-6 print:p-0 print:bg-white print:fixed print:inset-0">
      {/* Estilos específicos para impresión directa de la Orden de Servicio */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            @page {
              margin: 1.2cm;
              size: letter portrait;
            }
            body {
              background: white !important;
              color: black !important;
            }
            body * {
              visibility: hidden;
            }
            #printable-quotation, #printable-quotation * {
              visibility: visible;
            }
            #printable-quotation {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 0 !important;
              margin: 0 !important;
            }
          }
        `
      }} />

      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none border border-stone-200">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="bg-stone-900 text-white px-5 sm:px-7 py-3.5 flex items-center justify-between border-b border-stone-800 print:hidden">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <h3 className="text-sm font-bold tracking-wide">
                ORDEN DE SERVICIO - {currentDeal.hotelName}
              </h3>
              <span className="text-[10px] text-stone-400 font-mono">
                Folio: {currentDeal.code} · {currentDeal.companyOrAgency}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                onClick={() => {
                  setIsEditing(true);
                  setShowPreExportPrompt(false);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white text-xs font-semibold border border-stone-700 transition-all cursor-pointer"
                title="Editar información antes de exportar"
              >
                <span>✏️</span>
                <span>Editar Datos</span>
              </button>
            )}

            <button
              onClick={() => {
                if (showPreExportPrompt) {
                  setShowPreExportPrompt(false);
                }
                handlePrint();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <span>🖨️</span>
              <span>Imprimir / Exportar PDF</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-stone-300 hover:text-white transition-all cursor-pointer text-sm"
              title="Cerrar ventana"
            >
              ✕
            </button>
          </div>
        </div>

        {/* PREGUNTA PREVIA A LA EXPORTACIÓN: ¿Deseas editar alguna información? */}
        {showPreExportPrompt && !isEditing && (
          <div className="bg-amber-50/90 border-b border-amber-200 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden animate-in fade-in">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center text-xl shrink-0">
                📝
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-950">
                  ¿Deseas editar alguna información antes de generar la Orden de Servicio?
                </h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  Puedes verificar y actualizar requerimientos, observaciones, montaje, fechas, habitaciones o datos del cliente para que aparezcan exactamente como los requieres en el PDF.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                onClick={() => {
                  setIsEditing(true);
                  setShowPreExportPrompt(false);
                }}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>✏️ Sí, editar datos</span>
              </button>

              <button
                onClick={() => {
                  setShowPreExportPrompt(false);
                  handlePrint();
                }}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>🖨️ No, exportar PDF ahora</span>
              </button>
            </div>
          </div>
        )}

        {/* PANEL DE EDICIÓN PREVIA (Cuando el usuario elige editar datos) */}
        {isEditing && (
          <div className="p-6 bg-stone-50 border-b border-stone-200 space-y-5 print:hidden">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <span>✏️</span> Editor de Orden de Servicio - {currentDeal.hotelName}
                </h3>
                <p className="text-xs text-stone-500">
                  Modifica los datos del evento; al guardar se actualizarán en tiempo real en la vista previa del documento y en la base de datos.
                </p>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="text-xs font-semibold text-stone-500 hover:text-stone-800"
              >
                Descartar cambios
              </button>
            </div>

            {/* Grid 1: Datos del Cliente y Empresa */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-stone-700 font-bold mb-1">Empresa / Nombre del Evento</label>
                <input
                  type="text"
                  value={editCompany}
                  onChange={(e) => setEditCompany(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-stone-700 font-bold mb-1">Nombre del Contacto Titular</label>
                <input
                  type="text"
                  value={editClientName}
                  onChange={(e) => setEditClientName(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-stone-700 font-bold mb-1">Teléfono / WhatsApp</label>
                <input
                  type="text"
                  value={editContactPhone}
                  onChange={(e) => setEditContactPhone(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-stone-700 font-bold mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={editContactEmail}
                  onChange={(e) => setEditContactEmail(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white"
                />
              </div>
            </div>

            {/* Grid 2: Fechas y Métricas */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-stone-700 font-bold mb-1">Fecha Check-in</label>
                <input
                  type="date"
                  value={editCheckInDate}
                  onChange={(e) => setEditCheckInDate(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-stone-700 font-bold mb-1">Fecha Check-out</label>
                <input
                  type="date"
                  value={editCheckOutDate}
                  onChange={(e) => setEditCheckOutDate(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-stone-700 font-bold mb-1">Asistentes (Pax)</label>
                <input
                  type="number"
                  value={editAttendeesCount}
                  onChange={(e) => setEditAttendeesCount(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-stone-700 font-bold mb-1">Room Nights</label>
                <input
                  type="number"
                  value={editRoomNights}
                  onChange={(e) => setEditRoomNights(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white"
                />
              </div>
            </div>

            {/* Grid 3: Requerimientos del Evento 1 por 1 */}
            <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span>☑️</span> Requerimientos Oficiales para la Orden de Servicio
                  </label>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Agrega, marca o elimina requerimientos técnicos, de montaje y de banquete.
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-mono font-bold">
                  {editRequirements.length} requerimientos
                </span>
              </div>

              {/* Input y botón para agregar requerimiento */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newReqInput}
                  onChange={(e) => setNewReqInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddRequirement();
                    }
                  }}
                  placeholder="Ej. Proyector láser y pantalla gigante, Mesa de bienvenida para 100 pax..."
                  className="flex-1 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddRequirement}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-2xs shrink-0 cursor-pointer"
                >
                  + Agregar
                </button>
              </div>

              {/* Lista editable de requerimientos */}
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {editRequirements.map((req, idx) => (
                  <div
                    key={req.id}
                    className="flex items-center justify-between gap-2 p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs shadow-2xs"
                  >
                    <label className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={req.completed}
                        onChange={() => handleToggleRequirement(req.id)}
                        className="h-4 w-4 accent-emerald-600 rounded cursor-pointer shrink-0"
                      />
                      <span className="font-mono text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.2 rounded font-bold shrink-0">
                        #{idx + 1}
                      </span>
                      <span className={`break-words ${req.completed ? 'line-through text-stone-400 font-normal' : 'text-stone-900 font-medium'}`}>
                        {req.text}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveRequirement(req.id)}
                      className="text-stone-400 hover:text-rose-600 p-1 rounded-md transition-colors shrink-0 text-sm"
                      title="Eliminar requerimiento"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Grid 4: Espacios del hotel */}
            <div className="space-y-1.5 bg-white border border-stone-200 rounded-2xl p-4">
              <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider">
                Salones y Espacios del Hotel Asignados:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
                {hotelSpaces.map((space) => {
                  const isChecked = editSelectedSpaces.includes(space.name);
                  return (
                    <label
                      key={space.id}
                      className={`p-2 rounded-xl border text-xs cursor-pointer flex items-center gap-2 transition-all ${
                        isChecked ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold' : 'bg-stone-50 border-stone-200 text-stone-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleSpace(space.name)}
                        className="accent-emerald-600 rounded"
                      />
                      <span className="truncate">{space.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Grid 5: Notas y Requerimientos Generales */}
            <div>
              <label className="block text-xs font-bold text-stone-900 mb-1 uppercase tracking-wider">
                Observaciones Especiales, Banquete y Logística
              </label>
              <textarea
                rows={3}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Detalles sobre menú de alimentos, tiempos de servicio, horarios de montaje..."
                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 text-xs bg-white resize-none"
              />
            </div>

            {/* Grid 6: Datos Financieros */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white border border-stone-200 rounded-2xl p-4 text-xs">
              <div>
                <label className="block text-stone-700 font-bold mb-1">Importe Total ({editCurrency})</label>
                <input
                  type="number"
                  value={editTotalValue}
                  onChange={(e) => setEditTotalValue(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-stone-700 font-bold mb-1">Anticipo / Pago Recibido ($)</label>
                <input
                  type="number"
                  value={editDepositAmount}
                  onChange={(e) => setEditDepositAmount(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-stone-700 font-bold mb-1">Estado de Pago</label>
                <select
                  value={editPaymentStatus}
                  onChange={(e) => setEditPaymentStatus(e.target.value as PaymentStatus)}
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white font-semibold"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="anticipo_pagado">Anticipo Pagado</option>
                  <option value="liquidado">Liquidado 100%</option>
                </select>
              </div>
            </div>

            {/* Botones de acción del editor */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-bold text-xs"
              >
                Cancelar Edición
              </button>
              <button
                type="button"
                onClick={() => handleSaveEdits(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-xs"
              >
                💾 Guardar Cambios y Ver Orden de Servicio
              </button>
              <button
                type="button"
                onClick={() => handleSaveEdits(true)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>🖨️ Guardar y Exportar PDF</span>
              </button>
            </div>
          </div>
        )}

        {/* Printable Document Body: ORDEN DE SERVICIO OFICIAL */}
        <div id="printable-quotation" className="p-8 sm:p-12 text-stone-800 space-y-7 bg-white font-sans text-xs sm:text-sm">
          
          {/* Header Brand & Official Service Order Title */}
          <div className="border-b-2 border-stone-900 pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="text-[10px] tracking-[0.25em] font-extrabold text-stone-500 uppercase">
                Grupo Orgánico Hoteles Boutique · Documento Oficial de Operación
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1 font-serif tracking-tight uppercase">
                ORDEN DE SERVICIO - {currentDeal.hotelName}
              </h1>
              <p className="text-stone-500 text-xs mt-1">
                Ficha Técnica Integral de Evento, Bloqueo de Espacios, Habitaciones y Montaje Operativo
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <div className="inline-block px-3 py-1 bg-stone-100 rounded-md font-mono text-xs font-bold text-stone-900 border border-stone-300">
                FOLIO: {currentDeal.code}
              </div>
              <div className="text-stone-500 text-xs">
                Fecha de Emisión: <span className="font-semibold text-stone-800">{new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
              </div>
              <div className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider border ${statusBadge.bg}`}>
                {statusBadge.label}
              </div>
            </div>
          </div>

          {/* 1. Datos Generales del Cliente, Empresa y Evento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-stone-50/90 p-5 rounded-2xl border border-stone-200">
            <div>
              <h4 className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <span>👤</span> Datos del Cliente & Evento
              </h4>
              <div className="space-y-1 text-xs">
                <div className="text-sm font-extrabold text-stone-900">
                  {currentDeal.companyOrAgency}
                </div>
                {currentDeal.clientName && currentDeal.clientName !== currentDeal.companyOrAgency && (
                  <div className="text-stone-700 font-medium">
                    Titular / Contacto: <strong>{currentDeal.clientName}</strong>
                  </div>
                )}
                {currentDeal.contactEmail && (
                  <div className="text-stone-600">
                    ✉️ Correo: <span className="font-semibold text-stone-900">{currentDeal.contactEmail}</span>
                  </div>
                )}
                {currentDeal.contactPhone && (
                  <div className="text-stone-600">
                    📞 Teléfono / WhatsApp: <span className="font-semibold text-stone-900">{currentDeal.contactPhone}</span>
                  </div>
                )}
                <div className="text-stone-500 text-[11px] pt-1">
                  Categoría de Evento: <span className="font-bold text-stone-800 uppercase">{currentDeal.category.replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <span>🏨</span> Cronograma & Ocupación de Estancia
              </h4>
              <div className="space-y-1 text-xs text-stone-700">
                <div>
                  <span className="text-stone-500">Hotel Sede:</span>{' '}
                  <strong className="text-stone-900 font-bold">{currentDeal.hotelName}</strong>
                </div>
                <div>
                  <span className="text-stone-500">Fecha Check-in:</span>{' '}
                  <strong className="text-stone-900">{formatDate(currentDeal.checkInDate)}</strong> (Horario oficial: 15:00 hrs)
                </div>
                <div>
                  <span className="text-stone-500">Fecha Check-out:</span>{' '}
                  <strong className="text-stone-900">{formatDate(currentDeal.checkOutDate)}</strong> (Horario oficial: 12:00 hrs)
                </div>
                <div>
                  <span className="text-stone-500">Duración:</span>{' '}
                  <span className="font-semibold text-stone-900">{getStayNights(currentDeal.checkInDate, currentDeal.checkOutDate)} noches de hospedaje</span>
                  {currentDeal.roomNights > 0 && <span> · ({currentDeal.roomNights} Room Nights)</span>}
                </div>
                <div>
                  <span className="text-stone-500">Asistentes Convocados (Pax):</span>{' '}
                  <span className="font-bold text-emerald-900">{currentDeal.attendeesCount || 'Por confirmar'} personas</span>
                </div>
                <div className="pt-0.5 text-stone-500">
                  Ejecutivo Responsable:{' '}
                  <strong className="text-emerald-800 font-semibold">{currentDeal.assignedRep}</strong>
                  {currentDeal.assignedEmail && <span className="text-[10px] text-stone-400"> ({currentDeal.assignedEmail})</span>}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Salones y Espacios del Hotel Reservados con Exclusividad */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider border-b border-stone-200 pb-1 flex items-center justify-between">
              <span>🏛️ Salones y Espacios Reservados con Exclusividad</span>
              <span className="text-[10px] text-stone-500 font-mono font-normal">
                {currentDeal.selectedSpaces?.length || 0} espacio(s)
              </span>
            </h3>

            {currentDeal.selectedSpaces && currentDeal.selectedSpaces.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentDeal.selectedSpaces.map((spaceName) => {
                  const info = hotelSpaces.find((s) => s.name === spaceName);
                  return (
                    <div key={spaceName} className="p-3 bg-stone-50/80 rounded-xl border border-stone-200 flex flex-col justify-between">
                      <div>
                        <div className="font-bold text-stone-900 text-xs flex items-center justify-between">
                          <span>{spaceName}</span>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-stone-200 text-stone-700 uppercase">
                            {info?.type || 'Área'}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-600 mt-1 leading-snug">
                          {info?.description || 'Espacio reservado y bloqueado para el desarrollo del evento.'}
                        </p>
                      </div>
                      <div className="text-[10px] font-semibold text-emerald-700 mt-2 flex items-center gap-1">
                        <span>✓</span> Bloqueo exclusivo en agenda hotelera
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-stone-500 italic p-3 bg-stone-50 rounded-xl border border-dashed border-stone-200">
                No se especificaron salones independientes; aplica hospedaje y áreas generales del hotel.
              </p>
            )}
          </div>

          {/* 3. Bloque de Habitaciones Solicitadas (si existen) */}
          {currentDeal.requestedRooms && currentDeal.requestedRooms.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider border-b border-stone-200 pb-1 flex items-center justify-between">
                <span>🛏️ Bloque de Habitaciones Solicitadas</span>
                <span className="text-[10px] text-stone-500 font-mono font-normal">
                  Total: {currentDeal.requestedRooms.reduce((acc, r) => acc + r.count, 0)} habitaciones
                </span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-stone-200 rounded-xl overflow-hidden">
                  <thead className="bg-stone-100 text-stone-600 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4">Tipo de Habitación</th>
                      <th className="py-2.5 px-4 text-center">Cantidad</th>
                      <th className="py-2.5 px-4">Capacidad Oficial</th>
                      <th className="py-2.5 px-4">Descripción Oficial del Hotel</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {currentDeal.requestedRooms.map((r, i) => {
                      const roomDetail = hotelRooms.find((rm) => rm.name === r.roomTypeName);
                      return (
                        <tr key={i} className="hover:bg-stone-50">
                          <td className="py-2 px-4 font-bold text-stone-900">{r.roomTypeName}</td>
                          <td className="py-2 px-4 text-center font-extrabold text-emerald-900 font-mono">{r.count}x</td>
                          <td className="py-2 px-4 text-stone-600">{roomDetail?.capacity || 'N/A'}</td>
                          <td className="py-2 px-4 text-stone-500 text-[11px]">{roomDetail?.description || 'Habitación boutique exclusiva.'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. LISTA OFICIAL DE REQUERIMIENTOS DEL EVENTO (Checklist Operativo) */}
          <div className="space-y-2.5">
            <div className="border-b border-stone-200 pb-1 flex items-center justify-between">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <span>☑️</span> Lista Oficial de Requerimientos del Evento (Checklist Operativo)
              </h3>
              {currentDeal.requirements && currentDeal.requirements.length > 0 && (
                <span className="text-[10px] font-mono font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {currentDeal.requirements.filter((r) => r.completed).length} de {currentDeal.requirements.length} cumplidos
                </span>
              )}
            </div>

            {currentDeal.requirements && currentDeal.requirements.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentDeal.requirements.map((req, i) => (
                  <div
                    key={req.id || i}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs ${
                      req.completed
                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950 font-medium'
                        : 'bg-stone-50 border-stone-200 text-stone-800'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                      req.completed ? 'bg-emerald-700 text-white' : 'border border-stone-400 text-transparent bg-white'
                    }`}>
                      {req.completed ? '✓' : ''}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="font-mono text-[9px] text-stone-400 font-bold mr-1">#{i + 1}</span>
                      <span className={req.completed ? 'line-through text-stone-500' : 'font-medium'}>
                        {req.text}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-stone-500 italic p-3 bg-stone-50 rounded-xl border border-dashed border-stone-200">
                Montaje estándar según plano oficial del hotel. Sin requerimientos técnicos o especiales dados de alta.
              </div>
            )}
          </div>

          {/* 5. Observaciones, Banquete y Logística Especial */}
          {currentDeal.notes && (
            <div className="space-y-1.5 bg-stone-50/90 p-4 rounded-xl border border-stone-200">
              <h4 className="text-[10px] font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
                <span>📝</span> Observaciones Especiales, Banquete & Logística
              </h4>
              <p className="text-stone-800 text-xs whitespace-pre-wrap leading-relaxed">
                {currentDeal.notes}
              </p>
            </div>
          )}

          {/* 6. Resumen Financiero y Control de Anticipos */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider border-b border-stone-200 pb-1">
              💳 Resumen Financiero & Cobranza
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-stone-100 border border-stone-200">
                <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  Importe Total del Evento
                </div>
                <div className="text-lg font-extrabold text-stone-900 mt-0.5 font-mono">
                  {formatCurrency(currentDeal.totalValue, currentDeal.currency)}
                </div>
                <div className="text-[10px] text-stone-500 mt-0.5">Moneda: {currentDeal.currency || 'MXN'}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                  Anticipo / Pagos Registrados
                </div>
                <div className="text-lg font-extrabold text-amber-950 mt-0.5 font-mono">
                  {formatCurrency(depositValue, currentDeal.currency)}
                </div>
                <div className="text-[10px] text-amber-700 mt-0.5">
                  {depositValue > 0 ? '✓ Monto recibido en cuenta' : 'Pendiente de cobro'}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Saldo Pendiente por Liquidar
                </div>
                <div className="text-lg font-extrabold text-emerald-950 mt-0.5 font-mono">
                  {formatCurrency(balanceValue, currentDeal.currency)}
                </div>
                <div className="text-[10px] text-emerald-700 mt-0.5">
                  {currentDeal.paymentDueDate ? `Fecha límite: ${formatDate(currentDeal.paymentDueDate)}` : 'Por definir previo al check-in'}
                </div>
              </div>
            </div>
          </div>

          {/* 7. Términos y Normativas de Operación de Grupo Orgánico */}
          <div className="border-t border-stone-200 pt-3.5 space-y-1.5 text-[10px] text-stone-500 leading-relaxed">
            <h4 className="font-bold uppercase tracking-wider text-stone-700">Términos y Normativas de Operación</h4>
            <ol className="list-decimal pl-4 space-y-0.5">
              <li>El bloqueo oficial de fechas y salones queda formalmente garantizado con el anticipo estipulado.</li>
              <li>El saldo total debe ser liquidado en su totalidad antes de la fecha límite estipulada o previo al check-in.</li>
              <li>Cualquier ajuste de salones, equipo audiovisual o banquetes deberá notificarse con al menos 10 días de anticipación.</li>
              <li>Los horarios de montaje y desmontaje en áreas comunes y jardines respetan las normas de descanso de los huéspedes del hotel.</li>
            </ol>
          </div>

          {/* 8. Firmas de Aprobación y Conformidad */}
          <div className="pt-8 grid grid-cols-3 gap-6 text-center text-xs">
            <div>
              <div className="border-b border-stone-400 pb-7 mb-2" />
              <div className="font-bold text-stone-900">{currentDeal.assignedRep}</div>
              <div className="text-stone-500 text-[10px]">Ejecutivo Comercial & Grupos</div>
              <div className="text-stone-400 text-[9px]">Grupo Orgánico Hoteles Boutique</div>
            </div>

            <div>
              <div className="border-b border-stone-400 pb-7 mb-2" />
              <div className="font-bold text-stone-900">Operaciones & A&B</div>
              <div className="text-stone-500 text-[10px]">Gerencia Operativa del Hotel</div>
              <div className="text-stone-400 text-[9px]">{currentDeal.hotelName}</div>
            </div>

            <div>
              <div className="border-b border-stone-400 pb-7 mb-2" />
              <div className="font-bold text-stone-900">{currentDeal.clientName}</div>
              <div className="text-stone-500 text-[10px]">{currentDeal.companyOrAgency || 'Cliente Aceptante'}</div>
              <div className="text-stone-400 text-[9px]">Firma de Conformidad</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
