'use client';

import React, { useState } from 'react';
import { HotelDeal } from '@/lib/types';
import { HOTEL_PROPERTIES, HOTEL_SPACES, HOTEL_ROOM_TYPES } from '@/lib/initial-data';

interface AvailabilityCheckerModalProps {
  deals: HotelDeal[];
  onClose: () => void;
  onBookAvailable: (hotel: string, checkIn: string, checkOut: string, selectedSpaces: string[]) => void;
}

export function AvailabilityCheckerModal({
  deals,
  onClose,
  onBookAvailable
}: AvailabilityCheckerModalProps) {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [selectedHotel, setSelectedHotel] = useState(HOTEL_PROPERTIES[0]);
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [checkedSpaces, setCheckedSpaces] = useState<string[]>([]);

  const hotelSpaces = HOTEL_SPACES[selectedHotel] || [];
  const hotelRooms = HOTEL_ROOM_TYPES[selectedHotel] || [];

  // Check overlap for each space
  const spacesStatus = hotelSpaces.map((space) => {
    // Find if any active deal occupies this space in this hotel between checkIn and checkOut
    const conflictingDeal = deals.find((d) => {
      if (d.hotelName !== selectedHotel) return false;
      if (d.stage === 'perdido') return false;
      const isDateOverlap = checkIn <= d.checkOutDate && checkOut >= d.checkInDate;
      if (!isDateOverlap) return false;

      const spaces = d.selectedSpaces || [];
      return spaces.includes(space.name);
    });

    return {
      space,
      isAvailable: !conflictingDeal,
      conflictingDeal
    };
  });

  // Calculate room occupancy summary during those dates
  const overlappingDeals = deals.filter((d) => {
    if (d.hotelName !== selectedHotel) return false;
    if (d.stage === 'perdido') return false;
    return checkIn <= d.checkOutDate && checkOut >= d.checkInDate;
  });

  const bookedRoomsCount: Record<string, number> = {};
  overlappingDeals.forEach((d) => {
    (d.requestedRooms || []).forEach((r) => {
      bookedRoomsCount[r.roomTypeName] = (bookedRoomsCount[r.roomTypeName] || 0) + r.count;
    });
  });

  const availableCount = spacesStatus.filter((s) => s.isAvailable).length;
  const occupiedCount = spacesStatus.filter((s) => !s.isAvailable).length;

  const toggleCheckSpace = (spaceName: string) => {
    if (checkedSpaces.includes(spaceName)) {
      setCheckedSpaces(checkedSpaces.filter((s) => s !== spaceName));
    } else {
      setCheckedSpaces([...checkedSpaces, spaceName]);
    }
  };

  const handleProceedBooking = () => {
    onBookAvailable(selectedHotel, checkIn, checkOut, checkedSpaces);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200">
        
        {/* Header */}
        <div className="bg-linear-to-r from-emerald-900 via-teal-800 to-stone-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl">
              🔍
            </span>
            <div>
              <h3 className="font-editorial text-lg sm:text-xl font-bold tracking-tight">
                Consultar Disponibilidad en Tiempo Real
              </h3>
              <p className="text-emerald-200 text-xs mt-0.5">
                Verifica salones libres, bloqueos y ocupación de habitaciones por hotel y fecha
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-sm transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Filters Form */}
        <div className="p-6 bg-stone-50 border-b border-stone-200 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                Hotel Propiedad
              </label>
              <select
                value={selectedHotel}
                onChange={(e) => {
                  setSelectedHotel(e.target.value);
                  setCheckedSpaces([]);
                }}
                className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                {HOTEL_PROPERTIES.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                Fecha Llegada (Check-in)
              </label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                Fecha Salida (Check-out)
              </label>
              <input
                type="date"
                value={checkOut}
                min={checkIn}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-4 text-xs font-semibold pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {availableCount} Salones Disponibles
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              {occupiedCount} Salones Ocupados / Bloqueados
            </span>
          </div>
        </div>

        {/* Results Body */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Spaces Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                Estado de Salones y Jardines ({hotelSpaces.length} en total)
              </h4>
              <span className="text-[11px] text-stone-500">
                Selecciona los salones libres para cotizar de inmediato
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {spacesStatus.map(({ space, isAvailable, conflictingDeal }) => {
                const isChecked = checkedSpaces.includes(space.name);

                return (
                  <div
                    key={space.id}
                    onClick={() => isAvailable && toggleCheckSpace(space.name)}
                    className={`p-3.5 rounded-xl border transition-all text-xs ${
                      isAvailable
                        ? isChecked
                          ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400 cursor-pointer'
                          : 'bg-white border-stone-200 hover:border-emerald-300 hover:bg-stone-50/80 cursor-pointer'
                        : 'bg-rose-50/60 border-rose-200 opacity-90 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-stone-900 flex items-center gap-2">
                        {isAvailable ? (
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                        ) : (
                          <span className="text-rose-600 font-bold">✕</span>
                        )}
                        <span>{space.name}</span>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isAvailable
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-200 text-rose-900 border border-rose-300'
                        }`}
                      >
                        {isAvailable ? 'DISPONIBLE' : 'BLOQUEADO'}
                      </span>
                    </div>

                    <p className="text-stone-500 text-[11px] mt-1 ml-5">
                      {space.description}
                    </p>

                    {!isAvailable && conflictingDeal && (
                      <div className="mt-2 ml-5 p-2 rounded-lg bg-rose-100/70 border border-rose-200 text-[10px] text-rose-900">
                        <span className="font-bold">Ocupado por:</span> {conflictingDeal.companyOrAgency} ({conflictingDeal.code})
                        <div className="text-rose-700 font-mono mt-0.5">
                          {conflictingDeal.checkInDate} al {conflictingDeal.checkOutDate}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rooms Occupancy Status */}
          {hotelRooms.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-stone-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                Ocupación de Habitaciones en estas fechas
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {hotelRooms.map((room) => {
                  const booked = bookedRoomsCount[room.name] || 0;
                  return (
                    <div
                      key={room.id}
                      className="p-3 bg-white border border-stone-200 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-xs text-stone-900">{room.name}</div>
                        <div className="text-[10px] text-stone-500">{room.capacity}</div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-xs font-extrabold px-2 py-0.5 rounded ${
                            booked > 0
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {booked > 0 ? `${booked} reservadas` : 'Libre'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-stone-600">
            {checkedSpaces.length > 0 ? (
              <span>
                <strong className="text-emerald-700">{checkedSpaces.length} espacio(s)</strong> seleccionados para cotizar.
              </span>
            ) : (
              <span>Selecciona uno o más espacios disponibles para abrir el formulario.</span>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-stone-600 hover:text-stone-900 text-xs font-bold transition-all cursor-pointer"
            >
              Cerrar
            </button>
            <button
              onClick={handleProceedBooking}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              + Crear Cotización con estos Espacios
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

