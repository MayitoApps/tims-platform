'use client';

import React, { useState, useMemo } from 'react';
import {
  SalesActivity,
  SalesActivityType,
  SalesExecutive,
  DEFAULT_SALES_EXECUTIVES,
  SALES_TASK_CATEGORIES,
  UserProfile,
  HotelDeal
} from '@/lib/types';
import { HOTEL_PROPERTIES } from '@/lib/initial-data';
import { formatCurrency, formatDate } from '@/lib/utils';

interface SalesSectionProps {
  activities: SalesActivity[];
  currentUser?: UserProfile | null;
  registeredUsers?: UserProfile[];
  deals?: HotelDeal[];
  onAddActivity: (activity: Omit<SalesActivity, 'id' | 'createdAt'>) => void;
  onUpdateActivity?: (activity: SalesActivity) => void;
  onDeleteActivity: (activityId: string) => void;
}

export function SalesSection({
  activities = [],
  currentUser,
  registeredUsers = [],
  deals = [],
  onAddActivity,
  onUpdateActivity,
  onDeleteActivity
}: SalesSectionProps) {
  // Main tabs within VENTAS
  const [activeTab, setActiveTab] = useState<'tablero' | 'reporte'>('tablero');

  // Sub-filter inside Tablero: 'all' (Kanban panorámico) or specific task category
  const [selectedCategory, setSelectedCategory] = useState<'all' | SalesActivityType>('all');

  // Filter by executive
  const [selectedExecutiveFilter, setSelectedExecutiveFilter] = useState<string>('all');

  // Executives list (combining defaults Ale & Fer with any dynamically registered sales users)
  const executivesList = useMemo<SalesExecutive[]>(() => {
    const list: SalesExecutive[] = [...DEFAULT_SALES_EXECUTIVES];
    if (registeredUsers && registeredUsers.length > 0) {
      registeredUsers.forEach((u) => {
        const already = list.some((e) => e.name.toLowerCase() === u.name.toLowerCase() || (e.email && e.email.toLowerCase() === u.email.toLowerCase()));
        if (!already && u.role === 'sales') {
          list.push({
            id: `exec-${u.id}`,
            name: u.name,
            email: u.email,
            role: 'Ejecutivo Comercial',
            initials: u.initials || u.name.slice(0, 2).toUpperCase(),
            avatar: u.avatar
          });
        }
      });
    }
    return list;
  }, [registeredUsers]);

  // Modal state when clicking an executive's card
  const [activeModal, setActiveModal] = useState<{
    executive: SalesExecutive;
    categoryType: SalesActivityType;
  } | null>(null);

  // Form states inside activeModal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);

  // Shared form inputs
  const todayStr = new Date().toISOString().split('T')[0];
  const nowTimeStr = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
  const [formDate, setFormDate] = useState(todayStr);
  const [formTime, setFormTime] = useState(nowTimeStr);

  // Specific form inputs
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [answered, setAnswered] = useState(true);
  const [notes, setNotes] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [acquisitionDate, setAcquisitionDate] = useState(todayStr);
  const [subject, setSubject] = useState('');
  const [contactMethod, setContactMethod] = useState('Llamada');
  const [clientFeedback, setClientFeedback] = useState('');
  const [nextDate, setNextDate] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [folio, setFolio] = useState('');
  const [hotel, setHotel] = useState(HOTEL_PROPERTIES[0]);
  const [eventDates, setEventDates] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [service, setService] = useState('Hospedaje y Banquete');
  const [amount, setAmount] = useState('50000');
  const [validUntil, setValidUntil] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [scheduledDate, setScheduledDate] = useState(todayStr);
  const [receiverName, setReceiverName] = useState('');
  const [receiverRole, setReceiverRole] = useState('Gerente / Director');
  const [minutes, setMinutes] = useState('');
  const [attendanceProofUrl, setAttendanceProofUrl] = useState('');
  const [invitationProofUrl, setInvitationProofUrl] = useState('');
  const [attendees, setAttendees] = useState('');
  const [topic, setTopic] = useState('Presentación de Portafolio Grupo Orgánico');
  const [agreements, setAgreements] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [assignedRep, setAssignedRep] = useState<'Ale' | 'Fer' | string>('Ale');

  // Filter activities by current executive filter if selected
  const filteredActivities = useMemo(() => {
    if (selectedExecutiveFilter === 'all') return activities;
    return activities.filter((a) => a.executiveName.toLowerCase() === selectedExecutiveFilter.toLowerCase());
  }, [activities, selectedExecutiveFilter]);

  // Current week boundaries for weekly Friday closure
  const currentWeekInfo = useMemo(() => {
    const now = new Date();
    const day = now.getDay(); // 0 is Sunday, 1 is Monday...
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    friday.setHours(23, 59, 59, 999);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return {
      mondayStr: monday.toISOString().split('T')[0],
      fridayStr: friday.toISOString().split('T')[0],
      sundayStr: sunday.toISOString().split('T')[0],
      isFriday: day === 5
    };
  }, []);

  // Helper to get count of activities for an executive in a category for current cycle
  const getExecutiveProgress = (execName: string, catType: SalesActivityType) => {
    const execActs = activities.filter(
      (a) => a.executiveName.toLowerCase() === execName.toLowerCase() && a.type === catType
    );

    const today = new Date().toISOString().split('T')[0];
    const categoryDef = SALES_TASK_CATEGORIES.find((c) => c.type === catType);
    const target = categoryDef?.targetCount || 1;

    let currentCount = 0;
    if (catType === 'llamada') {
      // Daily target: count for today
      currentCount = execActs.filter((a) => a.date === today).length;
    } else if (catType === 'cotizacion' || catType === 'prospecto' || catType === 'seguimiento' || catType === 'visita') {
      // Weekly target: count for current week
      currentCount = execActs.filter(
        (a) => a.date >= currentWeekInfo.mondayStr && a.date <= currentWeekInfo.sundayStr
      ).length;
    } else if (catType === 'reunion') {
      // Monthly target: count for current month
      const currentMonth = today.slice(0, 7);
      currentCount = execActs.filter((a) => a.date.startsWith(currentMonth)).length;
    }

    const percentage = Math.min(100, Math.round((currentCount / target) * 100));
    return {
      currentCount,
      target,
      percentage,
      totalHistoric: execActs.length,
      isCompleted: currentCount >= target
    };
  };

  // Helper to open the modal for an executive & category
  const handleOpenExecutiveCard = (exec: SalesExecutive, catType: SalesActivityType) => {
    setActiveModal({ executive: exec, categoryType: catType });
    setIsFormOpen(false);
    setEditingActivityId(null);
    resetFormFields(exec.name);
  };

  const resetFormFields = (execName?: string) => {
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormTime(new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false }));
    setClientName('');
    setPhone('');
    setAnswered(true);
    setNotes('');
    setCompany('');
    setEmail('');
    setAcquisitionDate(new Date().toISOString().split('T')[0]);
    setSubject('');
    setContactMethod('Llamada');
    setClientFeedback('');
    setNextDate('');
    setEvidenceUrl('');
    setFolio(`COT-${Date.now().toString().slice(-4)}`);
    setHotel(HOTEL_PROPERTIES[0]);
    setEventDates('');
    setQuantity('1');
    setService('Hospedaje y Banquete');
    setAmount('50000');
    setValidUntil('');
    setProofUrl('');
    setScheduledDate(new Date().toISOString().split('T')[0]);
    setReceiverName('');
    setReceiverRole('Gerente / Director');
    setMinutes('');
    setAttendanceProofUrl('');
    setInvitationProofUrl('');
    setAttendees('');
    setTopic('Presentación de Portafolio Grupo Orgánico');
    setAgreements('');
    setNextAction('');
    setAssignedRep(execName === 'Fer' ? 'Fer' : 'Ale');
  };

  // Submit activity form
  const handleSubmitActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModal) return;

    const { executive, categoryType } = activeModal;

    const baseActivity: Omit<SalesActivity, 'id' | 'createdAt'> = {
      type: categoryType,
      executiveName: executive.name,
      executiveEmail: executive.email,
      date: formDate || todayStr,
      time: formTime || nowTimeStr
    };

    if (categoryType === 'llamada') {
      baseActivity.phone = phone.trim();
      baseActivity.clientName = clientName.trim();
      baseActivity.answered = answered;
      baseActivity.notes = notes.trim();
    } else if (categoryType === 'prospecto') {
      baseActivity.clientName = clientName.trim();
      baseActivity.phone = phone.trim();
      baseActivity.company = company.trim();
      baseActivity.email = email.trim();
      baseActivity.acquisitionDate = acquisitionDate || formDate;
      baseActivity.notes = notes.trim();
    } else if (categoryType === 'seguimiento') {
      baseActivity.clientName = clientName.trim();
      baseActivity.subject = subject.trim();
      baseActivity.contactMethod = contactMethod;
      baseActivity.clientFeedback = clientFeedback.trim();
      baseActivity.nextDate = nextDate;
      baseActivity.evidenceUrl = evidenceUrl.trim();
    } else if (categoryType === 'cotizacion') {
      baseActivity.folio = folio.trim();
      baseActivity.clientName = clientName.trim();
      baseActivity.hotel = hotel;
      baseActivity.eventDates = eventDates.trim();
      baseActivity.quantity = parseInt(quantity) || 1;
      baseActivity.service = service.trim();
      baseActivity.amount = parseFloat(amount) || 0;
      baseActivity.validUntil = validUntil;
      baseActivity.proofUrl = proofUrl.trim();
    } else if (categoryType === 'visita') {
      baseActivity.scheduledDate = scheduledDate;
      baseActivity.receiverName = receiverName.trim();
      baseActivity.receiverRole = receiverRole.trim();
      baseActivity.minutes = minutes.trim();
      baseActivity.attendanceProofUrl = attendanceProofUrl.trim();
      baseActivity.hotel = hotel;
    } else if (categoryType === 'reunion') {
      baseActivity.invitationProofUrl = invitationProofUrl.trim();
      baseActivity.attendees = attendees.trim();
      baseActivity.topic = topic.trim();
      baseActivity.agreements = agreements.trim();
      baseActivity.nextAction = nextAction.trim();
      baseActivity.assignedRep = assignedRep;
      baseActivity.time = formTime;
    }

    if (editingActivityId && onUpdateActivity) {
      const existing = activities.find((a) => a.id === editingActivityId);
      if (existing) {
        onUpdateActivity({
          ...existing,
          ...baseActivity
        });
      }
    } else {
      onAddActivity(baseActivity);
    }

    setIsFormOpen(false);
    setEditingActivityId(null);
    resetFormFields(executive.name);
  };

  // Open edit for an activity item
  const handleEditItem = (act: SalesActivity) => {
    setEditingActivityId(act.id);
    setFormDate(act.date);
    setFormTime(act.time || nowTimeStr);
    setClientName(act.clientName || '');
    setPhone(act.phone || '');
    setAnswered(act.answered ?? true);
    setNotes(act.notes || '');
    setCompany(act.company || '');
    setEmail(act.email || '');
    setAcquisitionDate(act.acquisitionDate || act.date);
    setSubject(act.subject || '');
    setContactMethod(act.contactMethod || 'Llamada');
    setClientFeedback(act.clientFeedback || '');
    setNextDate(act.nextDate || '');
    setEvidenceUrl(act.evidenceUrl || '');
    setFolio(act.folio || '');
    setHotel(act.hotel || HOTEL_PROPERTIES[0]);
    setEventDates(act.eventDates || '');
    setQuantity(String(act.quantity || 1));
    setService(act.service || 'Hospedaje y Banquete');
    setAmount(String(act.amount || 50000));
    setValidUntil(act.validUntil || '');
    setProofUrl(act.proofUrl || '');
    setScheduledDate(act.scheduledDate || act.date);
    setReceiverName(act.receiverName || '');
    setReceiverRole(act.receiverRole || '');
    setMinutes(act.minutes || '');
    setAttendanceProofUrl(act.attendanceProofUrl || '');
    setInvitationProofUrl(act.invitationProofUrl || '');
    setAttendees(act.attendees || '');
    setTopic(act.topic || '');
    setAgreements(act.agreements || '');
    setNextAction(act.nextAction || '');
    setAssignedRep(act.assignedRep || 'Ale');
    setIsFormOpen(true);
  };

  // Weekly closure automatic statistics
  const weeklyStats = useMemo(() => {
    // Current week activities
    const weekActs = activities.filter(
      (a) => a.date >= currentWeekInfo.mondayStr && a.date <= currentWeekInfo.sundayStr
    );

    const totalCalls = weekActs.filter((a) => a.type === 'llamada');
    const answeredCalls = totalCalls.filter((a) => a.answered);
    const totalProspects = weekActs.filter((a) => a.type === 'prospecto');
    const totalFollowups = weekActs.filter((a) => a.type === 'seguimiento');
    const totalQuotes = weekActs.filter((a) => a.type === 'cotizacion');
    const totalQuoteAmount = totalQuotes.reduce((acc, q) => acc + (q.amount || 0), 0);
    const totalVisits = weekActs.filter((a) => a.type === 'visita');
    const totalMeetings = weekActs.filter((a) => a.type === 'reunion');

    // Stats by executive
    const execBreakdown = executivesList.map((exec) => {
      const eActs = weekActs.filter((a) => a.executiveName.toLowerCase() === exec.name.toLowerCase());
      const eCalls = eActs.filter((a) => a.type === 'llamada');
      const eAnswered = eCalls.filter((a) => a.answered);
      const eProspects = eActs.filter((a) => a.type === 'prospecto');
      const eFollowups = eActs.filter((a) => a.type === 'seguimiento');
      const eQuotes = eActs.filter((a) => a.type === 'cotizacion');
      const eQuoteAmount = eQuotes.reduce((acc, q) => acc + (q.amount || 0), 0);
      const eVisits = eActs.filter((a) => a.type === 'visita');
      const eMeetings = eActs.filter((a) => a.type === 'reunion');

      // Weekly goals
      const callsGoal = 25; // 5 daily * 5 days
      const prospectsGoal = 2; // 2 every week and a half (~1-2 weekly)
      const quotesGoal = 3; // 3 weekly

      const callsPercent = Math.min(100, Math.round((eCalls.length / callsGoal) * 100));
      const prospectsPercent = Math.min(100, Math.round((eProspects.length / prospectsGoal) * 100));
      const quotesPercent = Math.min(100, Math.round((eQuotes.length / quotesGoal) * 100));

      const overallScore = Math.round((callsPercent + prospectsPercent + quotesPercent) / 3);

      return {
        executive: exec,
        totalActivities: eActs.length,
        calls: eCalls.length,
        callsAnswered: eAnswered.length,
        callsPercent,
        prospects: eProspects.length,
        prospectsPercent,
        followups: eFollowups.length,
        quotes: eQuotes.length,
        quoteAmount: eQuoteAmount,
        quotesPercent,
        visits: eVisits.length,
        meetings: eMeetings.length,
        overallScore,
        recentActivities: eActs.slice(0, 5)
      };
    });

    return {
      weekActsCount: weekActs.length,
      totalCalls: totalCalls.length,
      answeredCallsRate: totalCalls.length > 0 ? Math.round((answeredCalls.length / totalCalls.length) * 100) : 0,
      totalProspects: totalProspects.length,
      totalFollowups: totalFollowups.length,
      totalQuotes: totalQuotes.length,
      totalQuoteAmount,
      totalVisits: totalVisits.length,
      totalMeetings: totalMeetings.length,
      execBreakdown
    };
  }, [activities, currentWeekInfo, executivesList]);

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation Switcher */}
      <div className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-wider text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 uppercase">
                Módulo Comercial & Fuerza de Ventas
              </span>
              <span className="text-xs font-medium text-stone-500">
                · Ejecutivos: {executivesList.map((e) => e.name).join(', ')}
              </span>
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
              Tablero de Ventas & Tareas Diarias
            </h2>
            <p className="text-xs text-stone-500 mt-0.5 max-w-2xl">
              Control integral de actividades comerciales: llamadas diarias, prospección activa, seguimiento, cotizaciones, visitas presenciales y reuniones comerciales de Ale y Fer.
            </p>
          </div>

          {/* Master Tabs: Tablero de Tareas vs Cierre y Reporte */}
          <div className="flex items-center p-1 rounded-2xl bg-stone-100 border border-stone-200 text-xs font-bold shrink-0 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('tablero')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'tablero'
                  ? 'bg-linear-to-r from-blue-700 to-indigo-800 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>📋 Tablero de Tareas</span>
            </button>
            <button
              onClick={() => setActiveTab('reporte')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'reporte'
                  ? 'bg-linear-to-r from-emerald-700 to-teal-800 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>📊 Cierre y Reporte (Viernes)</span>
              {currentWeekInfo.isFriday && (
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
              )}
            </button>
          </div>
        </div>

        {/* Sub-bar inside Tablero: Filtros de Categorías & Ejecutivos */}
        {activeTab === 'tablero' && (
          <div className="pt-3 border-t border-stone-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Categorías (Pestañas de tareas) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                Todas las Tareas
              </button>

              {SALES_TASK_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.type;
                return (
                  <button
                    key={cat.type}
                    onClick={() => setSelectedCategory(cat.type)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-blue-800 text-white border-blue-900 shadow-xs'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.shortTitle}</span>
                  </button>
                );
              })}
            </div>

            {/* Filtro por Ejecutivo */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                Ejecutivo:
              </span>
              <select
                value={selectedExecutiveFilter}
                onChange={(e) => setSelectedExecutiveFilter(e.target.value)}
                className="bg-stone-50 border border-stone-300 rounded-xl px-3 py-1.5 text-xs font-bold text-stone-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">Todos los Ejecutivos ({executivesList.map((e) => e.name).join(', ')})</option>
                {executivesList.map((exec) => (
                  <option key={exec.id} value={exec.name}>
                    {exec.name} ({exec.role})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* VIEW 1: TABLERO KANBAN DE TAREAS Y ACTIVIDADES */}
      {activeTab === 'tablero' && (
        <div className="space-y-6">
          {/* Columnas Kanban por Categoría de Tarea */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {SALES_TASK_CATEGORIES.filter((cat) => selectedCategory === 'all' || selectedCategory === cat.type).map(
              (category) => {
                return (
                  <div
                    key={category.type}
                    className="bg-white border border-stone-200 rounded-3xl p-4 flex flex-col shadow-xs space-y-3"
                  >
                    {/* Header de la Columna / Tarea */}
                    <div className="border-b border-stone-100 pb-2.5 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xl">{category.icon}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${category.accentBg} ${category.color} ${category.borderColor}`}>
                          {category.targetLabel}
                        </span>
                      </div>
                      <h3 className="font-bold text-xs text-stone-900 leading-tight">
                        {category.title}
                      </h3>
                      <p className="text-[10px] text-stone-400 line-clamp-2">
                        {category.description}
                      </p>
                    </div>

                    {/* Tarjetas Precargadas por Cada Ejecutivo */}
                    <div className="space-y-2.5 flex-1">
                      {executivesList
                        .filter(
                          (exec) =>
                            selectedExecutiveFilter === 'all' ||
                            exec.name.toLowerCase() === selectedExecutiveFilter.toLowerCase()
                        )
                        .map((exec) => {
                          const progress = getExecutiveProgress(exec.name, category.type);
                          const lastActivity = activities
                            .filter(
                              (a) =>
                                a.executiveName.toLowerCase() === exec.name.toLowerCase() &&
                                a.type === category.type
                            )
                            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

                          return (
                            <div
                              key={exec.id}
                              onClick={() => handleOpenExecutiveCard(exec, category.type)}
                              className="group p-3 rounded-2xl border border-stone-200/90 bg-stone-50 hover:bg-white hover:border-blue-400 hover:shadow-md transition-all cursor-pointer space-y-2 select-none"
                            >
                              {/* Header de la tarjeta del ejecutivo */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-linear-to-br from-blue-700 to-indigo-800 text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
                                    {exec.initials || exec.name.slice(0, 2).toUpperCase()}
                                  </div>
                                  <span className="font-bold text-xs text-stone-900 group-hover:text-blue-800 transition-colors">
                                    {exec.name}
                                  </span>
                                </div>

                                <span
                                  className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md border ${
                                    progress.isCompleted
                                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                      : 'bg-amber-100 text-amber-800 border-amber-300'
                                  }`}
                                >
                                  {progress.currentCount}/{progress.target}
                                </span>
                              </div>

                              {/* Barra de Progreso de la Meta */}
                              <div className="space-y-1">
                                <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full transition-all duration-500 ${
                                      progress.isCompleted ? 'bg-emerald-600' : 'bg-blue-600'
                                    }`}
                                    style={{ width: `${progress.percentage}%` }}
                                  />
                                </div>
                                <div className="flex items-center justify-between text-[9px] text-stone-500 font-mono">
                                  <span>Avance: {progress.percentage}%</span>
                                  <span>{progress.totalHistoric} registradas</span>
                                </div>
                              </div>

                              {/* Mini Vista Previa de la Última Actividad */}
                              <div className="text-[10px] text-stone-600 bg-white/80 p-2 rounded-xl border border-stone-200/80 truncate">
                                {lastActivity ? (
                                  <div>
                                    <span className="font-bold text-stone-800">
                                      {lastActivity.clientName || lastActivity.company || lastActivity.topic || 'Actividad registrada'}
                                    </span>
                                    <span className="text-[9px] text-stone-400 block truncate font-mono">
                                      {formatDate(lastActivity.date)} {lastActivity.time ? `· ${lastActivity.time}h` : ''}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-stone-400 italic">
                                    + Haz clic para registrar {category.shortTitle.toLowerCase()}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: CIERRE Y REPORTE SEMANAL AUTOMÁTICO (VIERNES) */}
      {activeTab === 'reporte' && (
        <div className="space-y-6">
          {/* Header del Reporte */}
          <div className="bg-linear-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-md space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-0.5 rounded-full inline-block">
                  Corte Semanal Automático · Viernes
                </span>
                <h3 className="font-editorial text-2xl sm:text-3xl font-extrabold text-white mt-1">
                  Reporte y Rendimiento de Fuerza de Ventas
                </h3>
                <p className="text-xs text-stone-300 mt-0.5">
                  Semana del {formatDate(currentWeekInfo.mondayStr)} al {formatDate(currentWeekInfo.fridayStr)} · Generado en tiempo real desde el tablero
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>🖨️ Imprimir Reporte de Corte</span>
                </button>
              </div>
            </div>

            {/* KPIs Globales de la Semana */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
              <div className="bg-white/5 border border-white/10 p-3 rounded-2xl space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">📞 Llamadas Totales</span>
                <span className="font-mono text-xl font-extrabold text-white">{weeklyStats.totalCalls}</span>
                <span className="text-[10px] text-emerald-400 font-semibold block">{weeklyStats.answeredCallsRate}% contestadas</span>
              </div>

              <div className="bg-white/5 border border-white/10 p-3 rounded-2xl space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">🎯 Prospectos Nuevos</span>
                <span className="font-mono text-xl font-extrabold text-white">{weeklyStats.totalProspects}</span>
                <span className="text-[10px] text-stone-400 block">Captados esta semana</span>
              </div>

              <div className="bg-white/5 border border-white/10 p-3 rounded-2xl space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">🔄 Seguimientos</span>
                <span className="font-mono text-xl font-extrabold text-white">{weeklyStats.totalFollowups}</span>
                <span className="text-[10px] text-stone-400 block">Con evidencia</span>
              </div>

              <div className="bg-white/5 border border-white/10 p-3 rounded-2xl space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">📑 Cotizaciones</span>
                <span className="font-mono text-xl font-extrabold text-white">{weeklyStats.totalQuotes}</span>
                <span className="text-[10px] text-emerald-400 font-mono block">{formatCurrency(weeklyStats.totalQuoteAmount, 'MXN')}</span>
              </div>

              <div className="bg-white/5 border border-white/10 p-3 rounded-2xl space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">📍 Visitas Presenciales</span>
                <span className="font-mono text-xl font-extrabold text-white">{weeklyStats.totalVisits}</span>
                <span className="text-[10px] text-stone-400 block">En sedes hoteleras</span>
              </div>

              <div className="bg-white/5 border border-white/10 p-3 rounded-2xl space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">🤝 Reuniones Comerciales</span>
                <span className="font-mono text-xl font-extrabold text-white">{weeklyStats.totalMeetings}</span>
                <span className="text-[10px] text-stone-400 block">Ale y Fer</span>
              </div>
            </div>
          </div>

          {/* Tarjetas de Desglose y Progreso por Ejecutivo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {weeklyStats.execBreakdown.map((item) => (
              <div
                key={item.executive.id}
                className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs space-y-5"
              >
                <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-blue-700 to-indigo-800 text-white font-extrabold text-base flex items-center justify-center shadow-xs">
                      {item.executive.initials || item.executive.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-editorial text-2xl font-bold text-stone-900 leading-tight">
                        {item.executive.name}
                      </h4>
                      <span className="text-xs text-stone-500 font-medium">
                        {item.executive.role} · {item.totalActivities} actividades registradas
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">
                      Cumplimiento Global
                    </span>
                    <span className="font-mono text-2xl font-extrabold text-stone-900">
                      {item.overallScore}%
                    </span>
                  </div>
                </div>

                {/* Barras de Progreso de Tareas Clave */}
                <div className="space-y-3 text-xs">
                  {/* Llamadas */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-stone-700">
                      <span className="font-bold flex items-center gap-1.5">
                        <span>📞</span> Llamadas (Meta semanal: 25)
                      </span>
                      <span className="font-mono font-bold text-stone-900">
                        {item.calls}/25 ({item.callsAnswered} contestadas)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                      <div
                        className={`h-full transition-all duration-500 ${
                          item.callsPercent >= 100 ? 'bg-emerald-600' : 'bg-blue-600'
                        }`}
                        style={{ width: `${item.callsPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Prospectos */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-stone-700">
                      <span className="font-bold flex items-center gap-1.5">
                        <span>🎯</span> Prospectos Nuevos (Meta: 2)
                      </span>
                      <span className="font-mono font-bold text-stone-900">
                        {item.prospects}/2 prospectos
                      </span>
                    </div>
                    <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                      <div
                        className={`h-full transition-all duration-500 ${
                          item.prospectsPercent >= 100 ? 'bg-emerald-600' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${item.prospectsPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Cotizaciones */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-stone-700">
                      <span className="font-bold flex items-center gap-1.5">
                        <span>📑</span> Cotizaciones (Meta semanal: 3)
                      </span>
                      <span className="font-mono font-bold text-stone-900">
                        {item.quotes}/3 · {formatCurrency(item.quoteAmount, 'MXN')}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                      <div
                        className={`h-full transition-all duration-500 ${
                          item.quotesPercent >= 100 ? 'bg-emerald-600' : 'bg-purple-600'
                        }`}
                        style={{ width: `${item.quotesPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Seguimientos, Visitas y Reuniones */}
                  <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[11px]">
                    <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                      <span className="text-[10px] text-stone-400 block font-bold">🔄 Seguimientos</span>
                      <span className="font-mono font-extrabold text-stone-900 text-sm">{item.followups}</span>
                    </div>
                    <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                      <span className="text-[10px] text-stone-400 block font-bold">📍 Visitas</span>
                      <span className="font-mono font-extrabold text-stone-900 text-sm">{item.visits}</span>
                    </div>
                    <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                      <span className="text-[10px] text-stone-400 block font-bold">🤝 Reuniones</span>
                      <span className="font-mono font-extrabold text-stone-900 text-sm">{item.meetings}</span>
                    </div>
                  </div>
                </div>

                {/* Actividades Recientes del Ejecutivo */}
                <div className="pt-2 border-t border-stone-100 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                    Últimas Actividades Registradas
                  </span>
                  {item.recentActivities.length > 0 ? (
                    <div className="space-y-1">
                      {item.recentActivities.map((act) => (
                        <div
                          key={act.id}
                          className="flex items-center justify-between text-xs p-2 bg-stone-50/70 rounded-xl border border-stone-200"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-xs">
                              {SALES_TASK_CATEGORIES.find((c) => c.type === act.type)?.icon}
                            </span>
                            <span className="font-semibold text-stone-800 truncate">
                              {act.clientName || act.company || act.topic || 'Actividad'}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-stone-400 shrink-0">
                            {formatDate(act.date)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-stone-400 italic">
                      Sin registros en la semana actual.
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL DETALLADO DE EJECUTIVO & TAREA (AL HACER CLIC EN SU TARJETA) */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-3xl p-6 sm:p-8 space-y-5 max-h-[92vh] overflow-y-auto">
            {/* Encabezado del modal */}
            {(() => {
              const categoryDef = SALES_TASK_CATEGORIES.find((c) => c.type === activeModal.categoryType)!;
              const progress = getExecutiveProgress(activeModal.executive.name, activeModal.categoryType);
              const modalActivities = activities.filter(
                (a) =>
                  a.executiveName.toLowerCase() === activeModal.executive.name.toLowerCase() &&
                  a.type === activeModal.categoryType
              );

              return (
                <>
                  <div className="flex items-start justify-between border-b border-stone-200 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{categoryDef.icon}</span>
                        <span className="text-xs font-mono font-bold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                          {categoryDef.targetLabel}
                        </span>
                        <span className="text-xs text-stone-500 font-medium">
                          · {activeModal.executive.role}
                        </span>
                      </div>
                      <h3 className="font-editorial text-2xl sm:text-3xl font-extrabold text-stone-900 leading-tight">
                        {categoryDef.title} - {activeModal.executive.name}
                      </h3>
                      <p className="text-xs text-stone-500">
                        {categoryDef.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setIsFormOpen(!isFormOpen);
                          setEditingActivityId(null);
                          resetFormFields(activeModal.executive.name);
                        }}
                        className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>{isFormOpen ? 'Ver Registros' : `+ Registrar ${categoryDef.shortTitle}`}</span>
                      </button>
                      <button
                        onClick={() => setActiveModal(null)}
                        className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center font-bold text-base transition-colors cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Barra de Progreso de la Meta para este Ejecutivo */}
                  <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-stone-800">
                        Cumplimiento de Meta ({categoryDef.cadence}):
                      </span>
                      <span className="font-mono font-bold text-stone-900">
                        {progress.currentCount} de {progress.target} ({progress.percentage}%)
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-stone-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          progress.isCompleted ? 'bg-emerald-600' : 'bg-blue-600'
                        }`}
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* FORMULARIO DINÁMICO SEGÚN LA TAREA */}
                  {isFormOpen ? (
                    <form onSubmit={handleSubmitActivity} className="space-y-4 pt-2">
                      <div className="border-b border-stone-200 pb-2 flex items-center justify-between">
                        <h4 className="font-bold text-stone-900 text-sm">
                          {editingActivityId ? 'Editar Registro' : `Nuevo Registro de ${categoryDef.shortTitle}`}
                        </h4>
                        <span className="text-[11px] text-stone-500">
                          Ejecutivo: <strong>{activeModal.executive.name}</strong>
                        </span>
                      </div>

                      {/* Campos Comunes: Fecha y Hora */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-stone-700 font-bold mb-1">Fecha</label>
                          <input
                            type="date"
                            required
                            value={formDate}
                            onChange={(e) => setFormDate(e.target.value)}
                            className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-stone-700 font-bold mb-1">Hora</label>
                          <input
                            type="time"
                            value={formTime}
                            onChange={(e) => setFormTime(e.target.value)}
                            className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white"
                          />
                        </div>
                      </div>

                      {/* FORM: LLAMADAS (5 Diarias) */}
                      {activeModal.categoryType === 'llamada' && (
                        <div className="space-y-3 text-xs">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-stone-700 font-bold mb-1">Número al que se marcó</label>
                              <input
                                type="tel"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Ej. 55 1234 5678"
                                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                              />
                            </div>
                            <div>
                              <label className="block text-stone-700 font-bold mb-1">Nombre del Cliente</label>
                              <input
                                type="text"
                                required
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                placeholder="Ej. Lic. Fernando Gómez"
                                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-stone-700 font-bold mb-1">¿Contestó la llamada?</label>
                            <div className="flex items-center gap-4">
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="radio"
                                  name="answered"
                                  checked={answered === true}
                                  onChange={() => setAnswered(true)}
                                  className="accent-emerald-600"
                                />
                                <span className="font-semibold text-emerald-800">✓ Sí contestó</span>
                              </label>
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="radio"
                                  name="answered"
                                  checked={answered === false}
                                  onChange={() => setAnswered(false)}
                                  className="accent-rose-600"
                                />
                                <span className="font-semibold text-rose-800">✗ No contestó / Buzón</span>
                              </label>
                            </div>
                          </div>

                          <div>
                            <label className="block text-stone-700 font-bold mb-1">Comentarios de la llamada</label>
                            <textarea
                              rows={2}
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              placeholder="Acuerdos, motivo de la llamada, fecha tentativa o interés del cliente..."
                              className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 resize-none"
                            />
                          </div>
                        </div>
                      )}

                      {/* FORM: PROSPECTOS NUEVOS (2 cada semana y media) */}
                      {activeModal.categoryType === 'prospecto' && (
                        <div className="space-y-3 text-xs">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-stone-700 font-bold mb-1">Nombre del Prospecto</label>
                              <input
                                type="text"
                                required
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                placeholder="Ej. Ana Paula Martínez"
                                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                              />
                            </div>
                            <div>
                              <label className="block text-stone-700 font-bold mb-1">Empresa</label>
                              <input
                                type="text"
                                required
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                placeholder="Ej. Corporativo Santander / Particular"
                                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-stone-700 font-bold mb-1">Teléfono</label>
                              <input
                                type="tel"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Ej. 55 9876 5432"
                                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                              />
                            </div>
                            <div>
                              <label className="block text-stone-700 font-bold mb-1">Correo Electrónico</label>
                              <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="ejemplo@empresa.com"
                                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-stone-700 font-bold mb-1">Fecha en la que lo consiguió</label>
                            <input
                              type="date"
                              value={acquisitionDate}
                              onChange={(e) => setAcquisitionDate(e.target.value)}
                              className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                            />
                          </div>

                          <div>
                            <label className="block text-stone-700 font-bold mb-1">Notas o perfil del prospecto</label>
                            <textarea
                              rows={2}
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              placeholder="Origen del contacto, evento proyectado, presupuesto aproximado..."
                              className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 resize-none"
                            />
                          </div>
                        </div>
                      )}

                      {/* FORM: SEGUIMIENTO */}
                      {activeModal.categoryType === 'seguimiento' && (
                        <div className="space-y-3 text-xs">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-stone-700 font-bold mb-1">Nombre del Cliente</label>
                              <input
                                type="text"
                                required
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                placeholder="Ej. Ing. Roberto Mendoza"
                                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                              />
                            </div>
                            <div>
                              <label className="block text-stone-700 font-bold mb-1">Asunto Previo</label>
                              <input
                                type="text"
                                required
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Ej. Envío de cotización de boda Ajusco"
                                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-stone-700 font-bold mb-1">Medio de Contacto</label>
                              <select
                                value={contactMethod}
                                onChange={(e) => setContactMethod(e.target.value)}
                                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white"
                              >
                                <option value="Llamada">Llamada telefónica</option>
                                <option value="WhatsApp">WhatsApp</option>
                                <option value="Correo">Correo Electrónico</option>
                                <option value="Videollamada">Videollamada (Meet / Zoom)</option>
                                <option value="Presencial">Reunión Presencial</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-stone-700 font-bold mb-1">Siguiente Fecha de Contacto</label>
                              <input
                                type="date"
                                value={nextDate}
                                onChange={(e) => setNextDate(e.target.value)}
                                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-stone-700 font-bold mb-1">Información de la llamada / ¿Qué dijo el cliente?</label>
                            <textarea
                              rows={2}
                              required
                              value={clientFeedback}
                              onChange={(e) => setClientFeedback(e.target.value)}
                              placeholder="Respuesta y comentarios exactos del cliente..."
                              className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 resize-none"
                            />
                          </div>

                          <div>
                            <label className="block text-stone-700 font-bold mb-1">Evidencia del Contacto (Enlace o fotografía)</label>
                            <input
                              type="text"
                              value={evidenceUrl}
                              onChange={(e) => setEvidenceUrl(e.target.value)}
                              placeholder="https://drive.google.com/... o captura de pantalla"
                              className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                            />
                          </div>
                        </div>
                      )}

                      {/* FORM: COTIZACIONES (3 por semana) */}
                      {activeModal.categoryType === 'cotizacion' && (
                        <div className="space-y-3 text-xs">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-stone-700 font-bold mb-1">Documento con Folio</label>
                              <input
                                type="text"
                                required
                                value={folio}
                                onChange={(e) => setFolio(e.target.value)}
                                placeholder="Ej. COT-2026-089"
                                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 font-mono font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-stone-700 font-bold mb-1">Cliente</label>
                              <input
                                type="text"
                                required
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                placeholder="Nombre de la empresa o cliente"
                                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                              />
                            </div>
                            <div>
                              <label className="block text-stone-700 font-bold mb-1">Hotel</label>
                              <select
                                value={hotel}
                                onChange={(e) => setHotel(e.target.value)}
                                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white"
                              >
                                {HOTEL_PROPERTIES.map((h) => (
                                  <option key={h} value={h}>
                                    {h}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-stone-700 font-bold mb-1">Fechas del Evento</label>
                              <input
                                type="text"
                                value={eventDates}
                                onChange={(e) => setEventDates(e.target.value)}
                                placeholder="Ej. 14 al 16 Mayo 2026"
                                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                              />
                            </div>
                            <div>
                              <label className="block text-stone-700 font-bold mb-1">Cantidad (Pax o RN)</label>
                              <input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                              />
                            </div>
                            <div>
                              <label className="block text-stone-700 font-bold mb-1">Servicio Cotizado</label>
                              <input
                                type="text"
                                value={service}
                                onChange={(e) => setService(e.target.value)}
                                placeholder="Ej. Hospedaje, Salón y Banquete"
                                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-stone-700 font-bold mb-1">Importe ($ MXN)</label>
                              <input
                                type="number"
                                required
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Ej. 180000"
                                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 font-mono font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-stone-700 font-bold mb-1">Vigencia de la Cotización</label>
                              <input
                                type="date"
                                value={validUntil}
                                onChange={(e) => setValidUntil(e.target.value)}
                                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-stone-700 font-bold mb-1">Comprobante de Envío (Enlace / PDF / Foto)</label>
                            <input
                              type="text"
                              value={proofUrl}
                              onChange={(e) => setProofUrl(e.target.value)}
                              placeholder="Enlace al correo enviado, WhatsApp o documento"
                              className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                            />
                          </div>
                        </div>
                      )}

                      {/* FORM: VISITAS PRESENCIALES */}
                      {activeModal.categoryType === 'visita' && (
                        <div className="space-y-3 text-xs">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-stone-700 font-bold mb-1">Cita Previa (Fecha)</label>
                              <input
                                type="date"
                                required
                                value={scheduledDate}
                                onChange={(e) => setScheduledDate(e.target.value)}
                                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                              />
                            </div>
                            <div>
                              <label className="block text-stone-700 font-bold mb-1">Hotel Sede Visitado</label>
                              <select
                                value={hotel}
                                onChange={(e) => setHotel(e.target.value)}
                                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white"
                              >
                                {HOTEL_PROPERTIES.map((h) => (
                                  <option key={h} value={h}>
                                    {h}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-stone-700 font-bold mb-1">Nombre de Quien Recibió</label>
                              <input
                                type="text"
                                required
                                value={receiverName}
                                onChange={(e) => setReceiverName(e.target.value)}
                                placeholder="Ej. Lic. Carlos Treviño"
                                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                              />
                            </div>
                            <div>
                              <label className="block text-stone-700 font-bold mb-1">Cargo de Quien Recibió</label>
                              <input
                                type="text"
                                required
                                value={receiverRole}
                                onChange={(e) => setReceiverRole(e.target.value)}
                                placeholder="Ej. Director de Recursos Humanos / Novia"
                                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-stone-700 font-bold mb-1">Minuta de la Visita</label>
                            <textarea
                              rows={3}
                              required
                              value={minutes}
                              onChange={(e) => setMinutes(e.target.value)}
                              placeholder="Recorrido realizado, salones mostrados, dudas del cliente y próximos pasos..."
                              className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 resize-none"
                            />
                          </div>

                          <div>
                            <label className="block text-stone-700 font-bold mb-1">Constancia de Asistencia (Enlace / Foto)</label>
                            <input
                              type="text"
                              value={attendanceProofUrl}
                              onChange={(e) => setAttendanceProofUrl(e.target.value)}
                              placeholder="Foto de la visita o acuse de recibido"
                              className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                            />
                          </div>
                        </div>
                      )}

                      {/* FORM: REUNIÓN COMERCIAL (2 por mes, Ale o Fer) */}
                      {activeModal.categoryType === 'reunion' && (
                        <div className="space-y-3 text-xs">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-stone-700 font-bold mb-1">¿Quién va a ir?</label>
                              <select
                                value={assignedRep}
                                onChange={(e) => setAssignedRep(e.target.value)}
                                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white font-bold"
                              >
                                <option value="Ale">Ale</option>
                                <option value="Fer">Fer</option>
                                <option value="Ambos (Ale y Fer)">Ambos (Ale y Fer)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-stone-700 font-bold mb-1">Tema de la Reunión</label>
                              <input
                                type="text"
                                required
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="Ej. Cierre de convenio corporativo anual"
                                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-stone-700 font-bold mb-1">Asistentes</label>
                              <input
                                type="text"
                                required
                                value={attendees}
                                onChange={(e) => setAttendees(e.target.value)}
                                placeholder="Ej. Directores de compras y finanzas del cliente"
                                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                              />
                            </div>
                            <div>
                              <label className="block text-stone-700 font-bold mb-1">Invitación o Confirmación (Enlace)</label>
                              <input
                                type="text"
                                value={invitationProofUrl}
                                onChange={(e) => setInvitationProofUrl(e.target.value)}
                                placeholder="Enlace de invitación en Google Calendar / captura"
                                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-stone-700 font-bold mb-1">Acuerdos Tomados</label>
                            <textarea
                              rows={2}
                              required
                              value={agreements}
                              onChange={(e) => setAgreements(e.target.value)}
                              placeholder="Términos comerciales pre-acordados, precios pactados..."
                              className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 resize-none"
                            />
                          </div>

                          <div>
                            <label className="block text-stone-700 font-bold mb-1">Siguiente Acción</label>
                            <input
                              type="text"
                              required
                              value={nextAction}
                              onChange={(e) => setNextAction(e.target.value)}
                              placeholder="Ej. Envío de contrato final para firma el próximo martes"
                              className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                            />
                          </div>
                        </div>
                      )}

                      {/* Botones de acción del formulario */}
                      <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                        <button
                          type="button"
                          onClick={() => {
                            setIsFormOpen(false);
                            setEditingActivityId(null);
                          }}
                          className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs"
                        >
                          {editingActivityId ? 'Guardar Cambios' : 'Guardar y Registrar Tarea'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* LISTA DE REGISTROS DE ESTE EJECUTIVO EN ESTA TAREA */
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                          Historial de Registros ({modalActivities.length})
                        </h4>
                        <span className="text-[11px] text-stone-400">
                          Ordenados por fecha más reciente
                        </span>
                      </div>

                      {modalActivities.length > 0 ? (
                        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                          {modalActivities.map((act) => (
                            <div
                              key={act.id}
                              className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-2 hover:border-blue-300 transition-all shadow-2xs"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="font-bold text-stone-900 text-sm">
                                    {act.clientName || act.company || act.topic || 'Registro sin título'}
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px] text-stone-500 font-mono mt-0.5">
                                    <span>📅 {formatDate(act.date)}</span>
                                    {act.time && <span>· ⏰ {act.time}h</span>}
                                    {act.phone && <span>· 📞 {act.phone}</span>}
                                    {act.hotel && <span>· 🏨 {act.hotel}</span>}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  {act.answered !== undefined && (
                                    <span
                                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                        act.answered
                                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                          : 'bg-rose-100 text-rose-800 border-rose-300'
                                      }`}
                                    >
                                      {act.answered ? 'Contestó' : 'No contestó'}
                                    </span>
                                  )}

                                  {act.amount && (
                                    <span className="font-mono font-extrabold text-xs text-purple-900 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                                      {formatCurrency(act.amount, 'MXN')}
                                    </span>
                                  )}

                                  {act.assignedRep && (
                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200">
                                      Asiste: {act.assignedRep}
                                    </span>
                                  )}

                                  <button
                                    onClick={() => handleEditItem(act)}
                                    className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-200"
                                    title="Editar"
                                  >
                                    ✏️
                                  </button>

                                  <button
                                    onClick={() => onDeleteActivity(act.id)}
                                    className="p-1 rounded text-stone-400 hover:text-rose-600 hover:bg-rose-50"
                                    title="Eliminar"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>

                              {/* Detalles según categoría */}
                              {act.notes && (
                                <p className="text-stone-600 bg-white p-2 rounded-xl border border-stone-200/80 leading-relaxed">
                                  {act.notes}
                                </p>
                              )}

                              {act.clientFeedback && (
                                <p className="text-stone-700 bg-white p-2 rounded-xl border border-stone-200/80 leading-relaxed">
                                  <strong className="text-stone-900">¿Qué dijo el cliente?:</strong> {act.clientFeedback}
                                </p>
                              )}

                              {act.minutes && (
                                <p className="text-stone-700 bg-white p-2 rounded-xl border border-stone-200/80 leading-relaxed">
                                  <strong className="text-stone-900">Minuta:</strong> {act.minutes}
                                </p>
                              )}

                              {act.agreements && (
                                <p className="text-stone-700 bg-white p-2 rounded-xl border border-stone-200/80 leading-relaxed">
                                  <strong className="text-stone-900">Acuerdos:</strong> {act.agreements}
                                  {act.nextAction && <span> · <strong className="text-stone-900">Siguiente Acción:</strong> {act.nextAction}</span>}
                                </p>
                              )}

                              {/* Evidencias / Comprobantes links */}
                              {(act.evidenceUrl || act.proofUrl || act.attendanceProofUrl || act.invitationProofUrl) && (
                                <div className="text-[10px] text-blue-700 pt-1 font-semibold flex items-center gap-1.5">
                                  <span>📎 Evidencia / Comprobante:</span>
                                  <a
                                    href={act.evidenceUrl || act.proofUrl || act.attendanceProofUrl || act.invitationProofUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="underline truncate max-w-md hover:text-blue-900"
                                  >
                                    {act.evidenceUrl || act.proofUrl || act.attendanceProofUrl || act.invitationProofUrl}
                                  </a>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-stone-50 rounded-2xl border border-dashed border-stone-200 text-stone-400 space-y-2">
                          <span className="text-2xl">{categoryDef.icon}</span>
                          <p className="text-xs font-semibold text-stone-600">
                            {activeModal.executive.name} aún no tiene registros en {categoryDef.title}.
                          </p>
                          <button
                            onClick={() => {
                              setIsFormOpen(true);
                              resetFormFields(activeModal.executive.name);
                            }}
                            className="px-4 py-1.5 bg-blue-700 text-white rounded-xl text-xs font-bold hover:bg-blue-800 transition-all"
                          >
                            + Agregar primer registro
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

