'use client';

import React from 'react';
import { HotelDeal } from '@/lib/types';
import { HOTEL_SPACES, HOTEL_ROOM_TYPES } from '@/lib/initial-data';

interface QuotationPrintModalProps {
  deal: HotelDeal;
  onClose: () => void;
}

export function QuotationPrintModal({ deal, onClose }: QuotationPrintModalProps) {
  const hotelSpaces = HOTEL_SPACES[deal.hotelName] || [];
  const hotelRooms = HOTEL_ROOM_TYPES[deal.hotelName] || [];

  const handlePrint = () => {
    window.print();
  };

  const formattedTotal = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: deal.currency || 'MXN',
    maximumFractionDigits: 0
  }).format(deal.totalValue || 0);

  const depositValue = deal.depositAmount || 0;
  const balanceValue = Math.max(0, (deal.totalValue || 0) - depositValue);

  const formattedDeposit = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: deal.currency || 'MXN',
    maximumFractionDigits: 0
  }).format(depositValue);

  const formattedBalance = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: deal.currency || 'MXN',
    maximumFractionDigits: 0
  }).format(balanceValue);

  const getPaymentStatusBadge = (status?: string) => {
    switch (status) {
      case 'liquidado':
        return { label: 'LIQUIDADO 100%', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'anticipo_pagado':
        return { label: 'ANTICIPO PAGADO (RESERVA CONFIRMADA)', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
      default:
        return { label: 'PENDIENTE DE PAGO', bg: 'bg-rose-100 text-rose-800 border-rose-300' };
    }
  };

  const statusBadge = getPaymentStatusBadge(deal.paymentStatus);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm overflow-y-auto flex items-start justify-center p-2 sm:p-6 print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between border-b border-stone-800 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-sm font-semibold tracking-wide">
              Vista Previa de Cotización & Ficha Técnica Oficial
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <span>🖨️ Imprimir / Guardar en PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-stone-300 hover:text-white transition-all cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div id="printable-quotation" className="p-8 sm:p-12 text-stone-800 space-y-8 bg-white font-sans text-xs sm:text-sm">
          
          {/* Header Brand */}
          <div className="border-b-2 border-stone-800 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="text-[10px] tracking-[0.25em] font-extrabold text-stone-500 uppercase">
                Grupo Orgánico Hoteles Boutique
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1 font-serif tracking-tight">
                {deal.hotelName}
              </h1>
              <p className="text-stone-500 text-xs mt-1">
                Hospitalidad Boutique, Retiros Exclusivos, Bodas de Destino & Eventos MICE
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <div className="inline-block px-3 py-1 bg-stone-100 rounded-md font-mono text-xs font-bold text-stone-800 border border-stone-300">
                FOLIO: {deal.code}
              </div>
              <div className="text-stone-500 text-xs">
                Fecha de Emisión: <span className="font-semibold text-stone-700">{deal.createdAt || new Date().toISOString().split('T')[0]}</span>
              </div>
              <div className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider border ${statusBadge.bg}`}>
                {statusBadge.label}
              </div>
            </div>
          </div>

          {/* Client & Stay Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-stone-50 p-6 rounded-xl border border-stone-200">
            <div>
              <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">
                Datos del Cliente / Empresa
              </h4>
              <div className="space-y-1">
                <div className="text-base font-bold text-stone-900">
                  {deal.clientName}
                </div>
                {deal.companyOrAgency && deal.companyOrAgency !== deal.clientName && (
                  <div className="text-stone-600 font-medium">
                    {deal.companyOrAgency}
                  </div>
                )}
                {deal.contactEmail && (
                  <div className="text-stone-600">
                    ✉️ {deal.contactEmail}
                  </div>
                )}
                {deal.contactPhone && (
                  <div className="text-stone-600">
                    📞 {deal.contactPhone}
                  </div>
                )}
                <div className="text-stone-500 text-xs pt-1">
                  Categoría de Evento: <span className="font-semibold text-stone-800 capitalize">{deal.category.replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">
                Detalles de Estancia & Ejecutivo
              </h4>
              <div className="space-y-1 text-stone-700">
                <div>
                  <span className="text-stone-500">Check-in:</span> <span className="font-bold text-stone-900">{deal.checkInDate}</span>
                </div>
                <div>
                  <span className="text-stone-500">Check-out:</span> <span className="font-bold text-stone-900">{deal.checkOutDate}</span>
                </div>
                <div>
                  <span className="text-stone-500">Noches de Habitación:</span> <span className="font-semibold">{deal.roomNights} noches</span>
                </div>
                {deal.attendeesCount ? (
                  <div>
                    <span className="text-stone-500">Asistentes Esperados:</span> <span className="font-semibold">{deal.attendeesCount} personas</span>
                  </div>
                ) : null}
                <div className="pt-1">
                  <span className="text-stone-500">Ejecutivo Comercial:</span>{' '}
                  <span className="font-semibold text-emerald-800">{deal.assignedRep}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reserved Spaces Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider border-b border-stone-200 pb-1">
              🏛️ Salones y Espacios Reservados con Exclusividad
            </h3>

            {deal.selectedSpaces && deal.selectedSpaces.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {deal.selectedSpaces.map((spaceName) => {
                  const info = hotelSpaces.find((s) => s.name === spaceName);
                  return (
                    <div key={spaceName} className="p-3 bg-stone-50 rounded-lg border border-stone-200 flex flex-col justify-between">
                      <div>
                        <div className="font-bold text-stone-900 text-sm flex items-center justify-between">
                          <span>{spaceName}</span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-stone-200 text-stone-700 capitalize">
                            {info?.type || 'Espacio'}
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 mt-1">
                          {info?.description || 'Espacio reservado para el evento'}
                        </p>
                      </div>
                      <div className="text-[10px] font-semibold text-emerald-700 mt-2">
                        ✓ Fechas bloqueadas en agenda hotelera
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-stone-500 italic p-3 bg-stone-50 rounded-lg">
                No se especificaron salones independientes; aplica hospedaje y áreas generales del hotel.
              </p>
            )}
          </div>

          {/* Requested Rooms Breakdown */}
          {deal.requestedRooms && deal.requestedRooms.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider border-b border-stone-200 pb-1">
                🛏️ Bloque de Habitaciones Solicitadas
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-stone-200 rounded-lg overflow-hidden">
                  <thead className="bg-stone-100 text-stone-600 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4">Tipo de Habitación</th>
                      <th className="py-2.5 px-4 text-center">Cantidad</th>
                      <th className="py-2.5 px-4">Capacidad</th>
                      <th className="py-2.5 px-4">Descripción Oficial</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {deal.requestedRooms.map((r, i) => {
                      const roomDetail = hotelRooms.find((rm) => rm.name === r.roomTypeName);
                      return (
                        <tr key={i} className="hover:bg-stone-50">
                          <td className="py-2 px-4 font-bold text-stone-900">{r.roomTypeName}</td>
                          <td className="py-2 px-4 text-center font-bold text-emerald-800">{r.count}</td>
                          <td className="py-2 px-4 text-stone-600">{roomDetail?.capacity || 'N/A'}</td>
                          <td className="py-2 px-4 text-stone-500 text-[11px]">{roomDetail?.description || 'Habitación boutique'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Financial Breakdown & Payment Control */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider border-b border-stone-200 pb-1">
              💳 Resumen Financiero & Control de Anticipos
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-stone-100 border border-stone-200">
                <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  Importe Total
                </div>
                <div className="text-xl font-extrabold text-stone-900 mt-1">
                  {formattedTotal}
                </div>
                <div className="text-[10px] text-stone-500 mt-1">Moneda: {deal.currency || 'MXN'}</div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                  Anticipo Registrado
                </div>
                <div className="text-xl font-extrabold text-amber-900 mt-1">
                  {formattedDeposit}
                </div>
                <div className="text-[10px] text-amber-700 mt-1">
                  {depositValue > 0 ? '✓ Monto abonado' : 'Pendiente de cobro'}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Saldo Pendiente por Liquidar
                </div>
                <div className="text-xl font-extrabold text-emerald-950 mt-1">
                  {formattedBalance}
                </div>
                <div className="text-[10px] text-emerald-700 mt-1">
                  {deal.paymentDueDate ? `Fecha límite: ${deal.paymentDueDate}` : 'Por definir previo al check-in'}
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          {deal.notes && (
            <div className="space-y-1 bg-stone-50 p-4 rounded-lg border border-stone-200">
              <h4 className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                Observaciones & Logística Especial
              </h4>
              <p className="text-stone-700 whitespace-pre-wrap">{deal.notes}</p>
            </div>
          )}

          {/* Contract Policies & Terms */}
          <div className="border-t border-stone-200 pt-4 space-y-2 text-[10px] text-stone-500 leading-relaxed">
            <h4 className="font-bold uppercase tracking-wider text-stone-700">Términos y Condiciones de Reserva</h4>
            <ol className="list-decimal pl-4 space-y-1">
              <li>El bloqueo oficial de fechas y salones queda sujeto al depósito del anticipo convenido.</li>
              <li>El saldo total debe ser liquidado en su totalidad antes de la fecha límite estipulada o al momento del check-in.</li>
              <li>Cualquier ajuste de salones o requerimiento adicional de mobiliario/banquetes deberá notificarse con al menos 10 días de anticipación.</li>
              <li>Los horarios de montaje y desmontaje en áreas comunes y jardines respetan las normas de descanso de los huéspedes del hotel.</li>
            </ol>
          </div>

          {/* Signatures */}
          <div className="pt-10 grid grid-cols-2 gap-12 text-center text-xs">
            <div>
              <div className="border-b border-stone-400 pb-8 mb-2" />
              <div className="font-bold text-stone-900">{deal.assignedRep}</div>
              <div className="text-stone-500 text-[10px]">Ejecutivo de Comercialización & Grupos</div>
              <div className="text-stone-400 text-[9px]">Grupo Orgánico Hoteles Boutique</div>
            </div>

            <div>
              <div className="border-b border-stone-400 pb-8 mb-2" />
              <div className="font-bold text-stone-900">{deal.clientName}</div>
              <div className="text-stone-500 text-[10px]">{deal.companyOrAgency || 'Cliente Aceptante'}</div>
              <div className="text-stone-400 text-[9px]">Firma de Conformidad</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

