'use client';

import React, { useState, useRef, useEffect } from 'react';
import { HotelDeal } from '@/lib/types';

interface UpcomingEventsNotificationProps {
  deals: HotelDeal[];
  onSelectEvent: (deal: HotelDeal) => void;
}

export function UpcomingEventsNotification({
  deals,
  onSelectEvent
}: UpcomingEventsNotificationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayMs = new Date(todayStr).getTime();

  // Filter events within the next 15 days
  const upcomingEvents = deals
    .filter((d) => {
      if (d.stage === 'perdido') return false;
      const checkInMs = new Date(d.checkInDate).getTime();
      const diffDays = Math.ceil((checkInMs - todayMs) / (1000 * 3600 * 24));
      return diffDays >= 0 && diffDays <= 15;
    })
    .map((deal) => {
      const checkInMs = new Date(deal.checkInDate).getTime();
      const diffDays = Math.ceil((checkInMs - todayMs) / (1000 * 3600 * 24));
      const isUrgent = diffDays <= 5;
      const isPendingPayment = deal.paymentStatus !== 'liquidado';

      return {
        deal,
        diffDays,
        isUrgent,
        isPendingPayment
      };
    })
    .sort((a, b) => a.diffDays - b.diffDays);

  const count = upcomingEvents.length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Eventos próximos a suceder"
        className={`relative p-2 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
          count > 0
            ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300 ring-2 ring-amber-400/30'
            : 'bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200 border border-stone-200'
        }`}
      >
        <span className="text-base sm:text-lg">🔔</span>

        {count > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white font-extrabold text-[10px] flex items-center justify-center shadow-xs animate-bounce">
            {count}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-stone-200 z-50 overflow-hidden text-stone-800">
          {/* Header */}
          <div className="bg-stone-900 text-white px-4 py-3 flex items-center justify-between border-b border-stone-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <h4 className="text-xs font-bold uppercase tracking-wider">
                Eventos Próximos (Siguientes 15 Días)
              </h4>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 font-mono">
              {count} {count === 1 ? 'evento' : 'eventos'}
            </span>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-stone-100 p-1">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map(({ deal, diffDays, isUrgent, isPendingPayment }) => (
                <div
                  key={deal.id}
                  onClick={() => {
                    onSelectEvent(deal);
                    setIsOpen(false);
                  }}
                  className="p-3 hover:bg-stone-50 rounded-xl transition-all cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                      {deal.code}
                    </span>

                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        diffDays === 0
                          ? 'bg-rose-500 text-white animate-pulse'
                          : diffDays === 1
                          ? 'bg-amber-500 text-white'
                          : isUrgent
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {diffDays === 0
                        ? '¡HOY ES EL EVENTO!'
                        : diffDays === 1
                        ? '¡Inicia mañana!'
                        : `En ${diffDays} días (${deal.checkInDate})`}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-stone-900 line-clamp-1">
                    {deal.companyOrAgency} · {deal.clientName}
                  </div>

                  <div className="text-[11px] text-stone-500 flex items-center justify-between">
                    <span>🏨 {deal.hotelName}</span>
                    <span className="text-stone-400">
                      {deal.selectedSpaces?.length || 0} salón(es)
                    </span>
                  </div>

                  {isPendingPayment && (
                    <div className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md mt-1">
                      <span>⚠️ Saldo pendiente de liquidar</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-stone-400 space-y-1">
                <span className="text-2xl">✨</span>
                <p className="text-xs font-semibold text-stone-600">
                  No hay eventos próximos en los siguientes 15 días.
                </p>
                <p className="text-[11px] text-stone-400">
                  Las notificaciones solo se activan cuando una fecha reservada está pronta a suceder.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {upcomingEvents.length > 0 && (
            <div className="p-2.5 bg-stone-50 border-t border-stone-100 text-center text-[10px] text-stone-500">
              Haz clic en cualquier evento para abrir su ficha completa y cotización.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
