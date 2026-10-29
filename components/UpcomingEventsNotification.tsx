'use client';

import React, { useState, useRef, useEffect } from 'react';
import { HotelDeal, AppNotification, UserProfile, isAdminEmail } from '@/lib/types';

interface UpcomingEventsNotificationProps {
  deals: HotelDeal[];
  currentUser?: UserProfile | null;
  notifications?: AppNotification[];
  onSelectEvent: (deal: HotelDeal) => void;
  onSelectNotification?: (notif: AppNotification) => void;
  onMarkAllAsRead?: () => void;
}

export function UpcomingEventsNotification({
  deals,
  currentUser,
  notifications = [],
  onSelectEvent,
  onSelectNotification,
  onMarkAllAsRead
}: UpcomingEventsNotificationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'notifs' | 'events'>('notifs');
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

  const isUserAdmin = isAdminEmail(currentUser?.email);

  // Filtrado de notificaciones:
  // Si es ADMIN -> Ve todos los movimientos importantes de la empresa.
  // Si es USUARIO NORMAL -> Solo ve las notificaciones dirigidas estrictamente a él/ella.
  const visibleNotifications = notifications.filter((n) => {
    if (isUserAdmin) return true;
    if (!currentUser) return false;
    const userEmail = (currentUser.email || '').toLowerCase().trim();
    const userName = (currentUser.name || '').toLowerCase().trim();

    const matchesEmail = n.targetEmail && n.targetEmail.toLowerCase().trim() === userEmail;
    const matchesName = n.targetName && userName && (n.targetName.toLowerCase().includes(userName) || userName.includes(n.targetName.toLowerCase()));

    return matchesEmail || matchesName;
  });

  const unreadCount = visibleNotifications.filter((n) => !n.read).length;

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

  const eventCount = upcomingEvents.length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Centro de Notificaciones & Eventos"
        className={`relative p-2 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
          unreadCount > 0 || eventCount > 0
            ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300 ring-2 ring-amber-400/30'
            : 'bg-stone-100 text-stone-600 hover:text-stone-900 hover:bg-stone-200 border border-stone-200'
        }`}
      >
        <span className="text-base sm:text-lg">🔔</span>

        {unreadCount > 0 ? (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white font-extrabold text-[10px] flex items-center justify-center shadow-xs animate-bounce">
            {unreadCount}
          </span>
        ) : eventCount > 0 ? (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-600 text-white font-extrabold text-[10px] flex items-center justify-center shadow-xs">
            {eventCount}
          </span>
        ) : null}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-84 sm:w-[420px] bg-white rounded-2xl shadow-2xl border border-stone-200 z-50 overflow-hidden text-stone-800 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header con Tabs */}
          <div className="bg-stone-900 text-white p-3 border-b border-stone-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Centro de Notificaciones
                </h4>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 font-mono text-stone-300">
                {isUserAdmin ? '🛡️ Modo Administrador' : '👤 Notificaciones Personales'}
              </span>
            </div>

            {/* Tab Switcher */}
            <div className="grid grid-cols-2 gap-1 p-0.5 bg-stone-800 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('notifs')}
                className={`py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'notifs'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <span>🔔 Personales</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[9px] font-mono">
                    {unreadCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('events')}
                className={`py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'events'
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <span>📅 Eventos ({eventCount})</span>
              </button>
            </div>
          </div>

          {/* TAB 1: NOTIFICACIONES PERSONALES / ADMIN */}
          {activeTab === 'notifs' && (
            <div className="max-h-96 overflow-y-auto divide-y divide-stone-100 p-1">
              <div className="flex items-center justify-between px-3 py-1.5 text-[11px] text-stone-500 bg-stone-50/80">
                <span>
                  {isUserAdmin
                    ? 'Todos los movimientos de la plataforma'
                    : `Para: ${currentUser?.name || 'Usuario'}`}
                </span>
                {unreadCount > 0 && onMarkAllAsRead && (
                  <button
                    type="button"
                    onClick={onMarkAllAsRead}
                    className="text-amber-800 hover:text-amber-950 font-bold hover:underline cursor-pointer"
                  >
                    Marcar leídas
                  </button>
                )}
              </div>

              {visibleNotifications.length > 0 ? (
                visibleNotifications.map((notif) => {
                  const getIcon = () => {
                    switch (notif.type) {
                      case 'comment': return '💬';
                      case 'task_created': return '📋';
                      case 'deal_created': return '🏨';
                      case 'stage_changed': return '🔄';
                      case 'payment_alert': return '💳';
                      case 'event_active': return '⛔';
                      default: return '🔔';
                    }
                  };

                  return (
                    <div
                      key={notif.id}
                      onClick={() => {
                        if (onSelectNotification) onSelectNotification(notif);
                        setIsOpen(false);
                      }}
                      className={`p-3 hover:bg-stone-50 rounded-xl transition-all cursor-pointer space-y-1 ${
                        !notif.read ? 'bg-amber-50/40 border-l-3 border-amber-500' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-sm shrink-0">{getIcon()}</span>
                          <span className="text-xs font-bold text-stone-900 truncate">
                            {notif.title}
                          </span>
                        </div>
                        <span className="text-[10px] text-stone-400 font-mono shrink-0">
                          {notif.createdAt}
                        </span>
                      </div>

                      <p className="text-[11px] text-stone-600 line-clamp-2 leading-snug">
                        {notif.message}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-stone-400 pt-0.5">
                        <span className="truncate">
                          {notif.authorName ? `Por ${notif.authorName}` : ''}
                        </span>
                        <span className="font-semibold text-amber-800 uppercase tracking-wider text-[9px] bg-stone-100 px-1.5 py-0.5 rounded">
                          {notif.linkSection === 'commercial' ? 'Comercial' : 'Marketing'}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-stone-400 space-y-2">
                  <span className="text-3xl">📭</span>
                  <p className="text-xs font-semibold text-stone-600">
                    No tienes notificaciones pendientes.
                  </p>
                  <p className="text-[11px] text-stone-400 max-w-[280px] mx-auto">
                    {isUserAdmin
                      ? 'Aquí verás todos los comentarios, nuevos eventos y cambios en tiempo real.'
                      : 'Solo recibirás notificaciones personales cuando alguien comente o te asigne un requerimiento.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EVENTOS PRÓXIMOS (15 DÍAS) */}
          {activeTab === 'events' && (
            <div className="max-h-96 overflow-y-auto divide-y divide-stone-100 p-1">
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
                <div className="p-8 text-center text-stone-400 space-y-2">
                  <span className="text-3xl">✨</span>
                  <p className="text-xs font-semibold text-stone-600">
                    No hay eventos próximos en los siguientes 15 días.
                  </p>
                  <p className="text-[11px] text-stone-400">
                    Las alertas de eventos se activan automáticamente conforme se acercan las fechas de check-in.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Footer Informativo */}
          <div className="p-2.5 bg-stone-50 border-t border-stone-100 text-center text-[10px] text-stone-500 flex items-center justify-between">
            <span>TIMS Notifications</span>
            <span className="font-mono text-stone-400">Grupo Orgánico 2026</span>
          </div>
        </div>
      )}
    </div>
  );
}
