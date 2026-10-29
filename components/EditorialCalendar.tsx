'use client';

import React, { useState } from 'react';
import { Campaign, SalesLead } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface EditorialCalendarProps {
  campaigns: Campaign[];
  leads: SalesLead[];
}

interface CalendarEvent {
  day: number;
  title: string;
  type: 'launch' | 'deadline' | 'sales_call' | 'content';
  code: string;
  badge: string;
}

export function EditorialCalendar({ campaigns, leads }: EditorialCalendarProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'campaigns' | 'sales'>('all');

  // Days in March 2026
  const daysInMonth = 31;
  const startingDayOffset = 6; // March 1, 2026 was a Sunday (offset = 6 for Monday start)

  // Curated events mapped from real items
  const events: Record<number, CalendarEvent[]> = {
    1: [
      { day: 1, title: 'Inicio Campaña Primavera', type: 'launch', code: 'CMP-01', badge: 'bg-emerald-50 text-emerald-800 border-emerald-200' }
    ],
    3: [
      { day: 3, title: 'Demo: Atelier Kering', type: 'sales_call', code: 'LD-101', badge: 'bg-purple-50 text-purple-800 border-purple-200' }
    ],
    5: [
      { day: 5, title: 'Follow-up: Nórdico Studio', type: 'sales_call', code: 'LD-102', badge: 'bg-blue-50 text-blue-800 border-blue-200' },
      { day: 5, title: 'Cierre Shooting de Producto', type: 'deadline', code: 'CMP-01', badge: 'bg-amber-50 text-amber-800 border-amber-200' }
    ],
    8: [
      { day: 8, title: 'Aprobación Copys Newsletter', type: 'content', code: 'CMP-01', badge: 'bg-stone-100 text-stone-800 border-stone-200' }
    ],
    10: [
      { day: 10, title: 'Lanzamiento Pauta B2B LinkedIn', type: 'launch', code: 'CMP-02', badge: 'bg-indigo-50 text-indigo-800 border-indigo-200' }
    ],
    12: [
      { day: 12, title: 'Entrega Carruseles en Figma', type: 'deadline', code: 'CMP-01', badge: 'bg-pink-50 text-pink-800 border-pink-200' }
    ],
    15: [
      { day: 15, title: 'Revisión Ventas Q1 & MQLs', type: 'sales_call', code: 'REV', badge: 'bg-stone-900 text-white border-stone-900' }
    ],
    18: [
      { day: 18, title: 'Presentación Deck a Mendizábal', type: 'sales_call', code: 'LD-103', badge: 'bg-purple-50 text-purple-800 border-purple-200' }
    ],
    28: [
      { day: 28, title: 'Cierre Q1 & Reporte ROI', type: 'deadline', code: 'FIN', badge: 'bg-stone-200 text-stone-900 border-stone-300' }
    ]
  };

  const dayHeaders = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-editorial text-2xl font-medium tracking-tight text-stone-900">
              Calendario Editorial & Hitos Comerciales
            </h2>
            <span className="text-xs font-serif italic text-stone-600">
              Marzo 2026
            </span>
          </div>
          <p className="text-xs text-stone-600 mt-0.5">
            Sincronización de lanzamientos creativos con fechas clave de cierre comercial.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center p-0.5 rounded-md bg-stone-200/50 hairline-all text-xs">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-2.5 py-1 rounded-sm font-medium transition-all ${
              activeFilter === 'all' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            Todos los Eventos
          </button>
          <button
            onClick={() => setActiveFilter('campaigns')}
            className={`px-2.5 py-1 rounded-sm font-medium transition-all ${
              activeFilter === 'campaigns' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            Campañas Marketing
          </button>
          <button
            onClick={() => setActiveFilter('sales')}
            className={`px-2.5 py-1 rounded-sm font-medium transition-all ${
              activeFilter === 'sales' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            Reuniones de Venta
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white hairline-all rounded-lg overflow-hidden shadow-xs">
        {/* Days of week */}
        <div className="grid grid-cols-7 hairline-b bg-stone-50/80 text-[11px] font-semibold text-stone-600 uppercase tracking-wider py-2 text-center">
          {dayHeaders.map((dh) => (
            <div key={dh} className="py-1">
              {dh}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 divide-x divide-y divide-stone-100">
          {/* Empty cells before start of month */}
          {Array.from({ length: startingDayOffset }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-28 bg-stone-50/30 p-2 text-stone-300 text-xs">
              {23 + idx}
            </div>
          ))}

          {/* Actual days */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dayEvents = (events[dayNum] || []).filter((ev) => {
              if (activeFilter === 'campaigns') return ev.type === 'launch' || ev.type === 'deadline' || ev.type === 'content';
              if (activeFilter === 'sales') return ev.type === 'sales_call';
              return true;
            });

            const isToday = dayNum === 3;

            return (
              <div
                key={`day-${dayNum}`}
                className={`h-28 p-2 flex flex-col justify-between transition-colors hover:bg-stone-50/60 ${
                  isToday ? 'bg-stone-50/80 ring-1 ring-inset ring-stone-400' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-mono font-medium ${
                      isToday
                        ? 'w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px]'
                        : 'text-stone-700'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-[9px] text-stone-600 font-mono">
                      {dayEvents.length} {dayEvents.length === 1 ? 'hito' : 'hitos'}
                    </span>
                  )}
                </div>

                {/* Event Pills */}
                <div className="space-y-1 overflow-y-auto max-h-18 no-scrollbar">
                  {dayEvents.map((ev, eIdx) => (
                    <div
                      key={eIdx}
                      className={`text-[10px] leading-tight px-1.5 py-0.5 rounded-xs border font-medium truncate ${ev.badge}`}
                      title={`${ev.code}: ${ev.title}`}
                    >
                      <span className="font-mono text-[9px] mr-1 opacity-70">{ev.code}</span>
                      {ev.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
