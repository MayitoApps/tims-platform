'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  SalesActivity,
  SalesActivityType,
  SalesExecutive,
  DEFAULT_SALES_EXECUTIVES,
  SALES_TASK_CATEGORIES,
  UserProfile,
  HotelDeal,
  isUserAdmin,
  matchesUserIdentity
} from '@/lib/types';
import { HOTEL_PROPERTIES } from '@/lib/initial-data';
import { formatCurrency, formatDate, safeExternalUrl, calculateProgressPercent, readPersistedNavValue, writePersistedNavValue } from '@/lib/utils';

interface SalesSectionProps {
  activities: SalesActivity[];
  currentUser?: UserProfile | null;
  registeredUsers?: UserProfile[];
  deals?: HotelDeal[];
  onAddActivity: (activity: Omit<SalesActivity, 'id' | 'createdAt'>) => void;
  onUpdateActivity?: (activity: SalesActivity) => void;
  onDeleteActivity: (activityId: string) => void;
}

function getLocalDateStr(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDaysAgoStr(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return getLocalDateStr(d);
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
  const isCurrentUserAdmin = isUserAdmin(currentUser);

  // Main tabs within VENTAS
  const [activeTab, setActiveTab] = useState<'tablero' | 'reporte'>(() =>
    readPersistedNavValue(
      'tims_sales_tab',
      ['tablero', 'reporte'] as const,
      'tablero',
      1,
      'sales'
    )
  );

  useEffect(() => {
    writePersistedNavValue('tims_sales_tab', activeTab, 'sales', activeTab);
  }, [activeTab]);

  // Sub-filter inside Tablero: 'all' (Kanban panorámico) or specific task category
  const [selectedCategory, setSelectedCategory] = useState<'all' | SalesActivityType>('all');

  // Filter by executive (solo disponible para administradores)
  const [selectedExecutiveFilter, setSelectedExecutiveFilter] = useState<string>('all');

  // Executives list: 6 ejecutivos oficiales de Ventas (enriquecidos con avatar de Google si ya ingresaron).
  // Si el usuario NO es administrador, únicamente ve su propia tarjeta.
  const executivesList = useMemo<SalesExecutive[]>(() => {
    const baseList: SalesExecutive[] = DEFAULT_SALES_EXECUTIVES.map((exec) => {
      const matchedDb = registeredUsers?.find(
        (u) =>
          (exec.email && u.email.toLowerCase().trim() === exec.email.toLowerCase().trim()) ||
          u.name.toLowerCase().trim() === exec.name.toLowerCase().trim()
      );
      return {
        ...exec,
        avatar: matchedDb?.avatar || exec.avatar,
        initials: matchedDb?.initials || exec.initials
      };
    });

    if (!isCurrentUserAdmin && currentUser) {
      const own = baseList.filter((e) => matchesUserIdentity(currentUser, e.email, e.name));
      if (own.length > 0) return own;
      return [
        {
          id: `exec-${currentUser.id}`,
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.department || 'Comercialización y Ventas',
          initials: currentUser.initials || currentUser.name.slice(0, 2).toUpperCase(),
          avatar: currentUser.avatar
        }
      ];
    }

    return baseList;
  }, [registeredUsers, isCurrentUserAdmin, currentUser]);

  // Actividades visibles: admins ven todo; usuarios normales solo ven sus propias actividades
  const visibleActivities = useMemo(() => {
    if (isCurrentUserAdmin) return activities;
    return activities.filter((a) => matchesUserIdentity(currentUser, a.executiveEmail, a.executiveName));
  }, [activities, isCurrentUserAdmin, currentUser]);

  const matchesExecutiveActivity = (act: SalesActivity, exec: SalesExecutive) => {
    if (act.executiveEmail && exec.email && act.executiveEmail.toLowerCase().trim() === exec.email.toLowerCase().trim()) {
      return true;
    }
    return act.executiveName.toLowerCase().trim() === exec.name.toLowerCase().trim();
  };

  // Modal state when clicking an executive's card
  const [activeModal, setActiveModal] = useState<{
    executive: SalesExecutive;
    categoryType: SalesActivityType;
  } | null>(null);

  // Form states inside activeModal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);

  // Shared form inputs
  const todayStr = getLocalDateStr();
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
  const [visitStatus, setVisitStatus] = useState<'realizada' | 'cancelada'>('realizada');
  const [visitEvidenceType, setVisitEvidenceType] = useState<'foto' | 'pin_ubicacion' | 'correo_confirmacion' | 'evidencia_cancelacion'>('foto');
  const [cancellationProofUrl, setCancellationProofUrl] = useState('');
  const [meetingType, setMeetingType] = useState<'Zoom' | 'Meet' | 'Scouting' | string>('Zoom');
  const [invitationProofUrl, setInvitationProofUrl] = useState('');
  const [attendees, setAttendees] = useState('');
  const [topic, setTopic] = useState('Presentación de Portafolio Grupo Orgánico');
  const [agreements, setAgreements] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [assignedRep, setAssignedRep] = useState<string>(DEFAULT_SALES_EXECUTIVES[0]?.name || 'Alejandra Ocaña');
  const [agreementStatus, setAgreementStatus] = useState<'cerrado' | 'sin_cierre'>('cerrado');
  const [closingDocType, setClosingDocType] = useState<string>('Orden de servicio');
  const [isUploadingEvidence, setIsUploadingEvidence] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleUploadEvidenceFile = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingEvidence(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok && data?.url) {
        onSuccess(data.url);
      } else {
        setUploadError(data?.error || 'No se pudo subir el archivo. Puedes pegar un enlace directo.');
      }
    } catch {
      setUploadError('Error de conexión al subir el archivo.');
    } finally {
      setIsUploadingEvidence(false);
      e.target.value = '';
    }
  };

  // Filter activities by current executive filter if selected
  const filteredActivities = useMemo(() => {
    if (!isCurrentUserAdmin || selectedExecutiveFilter === 'all') return visibleActivities;
    return visibleActivities.filter((a) => a.executiveName.toLowerCase() === selectedExecutiveFilter.toLowerCase());
  }, [visibleActivities, selectedExecutiveFilter, isCurrentUserAdmin]);

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
      mondayStr: getLocalDateStr(monday),
      fridayStr: getLocalDateStr(friday),
      sundayStr: getLocalDateStr(sunday),
      isFriday: day === 5
    };
  }, []);

  // Helper to get count of activities for an executive in a category for current cycle
  const getExecutiveProgress = (exec: SalesExecutive, catType: SalesActivityType) => {
    const execActs = visibleActivities.filter(
      (a) => matchesExecutiveActivity(a, exec) && a.type === catType
    );

    const today = getLocalDateStr();
    const fifteenDaysAgoStr = getDaysAgoStr(14);
    const twentyOneDaysAgoStr = getDaysAgoStr(20);
    const currentMonth = today.slice(0, 7);
    const categoryDef = SALES_TASK_CATEGORIES.find((c) => c.type === catType);
    const target = categoryDef?.targetCount || 1;

    let currentCount = 0;
    let periodLabel = 'Semana actual';
    let secondaryNote: string | undefined;

    if (catType === 'llamada' || catType === 'correo' || catType === 'seguimiento') {
      // Meta diaria: hoy
      currentCount = execActs.filter((a) => a.date === today).length;
      periodLabel = 'Hoy';
    } else if (catType === 'cotizacion' || catType === 'prospecto') {
      // Meta semanal: semana actual
      currentCount = execActs.filter(
        (a) => a.date >= currentWeekInfo.mondayStr && a.date <= currentWeekInfo.sundayStr
      ).length;
      periodLabel = 'Semana actual';
    } else if (catType === 'visita') {
      // Meta: 1 cada 15 días (o cada 3 semanas) -> ventana de 21 días
      const inWindow = execActs.filter(
        (a) => a.date >= twentyOneDaysAgoStr && a.date <= currentWeekInfo.sundayStr
      );
      currentCount = inWindow.filter((a) => a.visitStatus !== 'cancelada').length;
      const cancelledCount = inWindow.filter((a) => a.visitStatus === 'cancelada').length;
      if (cancelledCount > 0) {
        secondaryNote = `${cancelledCount} cancelada${cancelledCount > 1 ? 's' : ''} c/evidencia`;
      }
      periodLabel = 'Últimos 15–21 días (3 sem)';
    } else if (catType === 'reunion') {
      // Meta: 1 cada 15 días (Zoom, Meet o scouting)
      currentCount = execActs.filter(
        (a) => a.date >= fifteenDaysAgoStr && a.date <= currentWeekInfo.sundayStr
      ).length;
      periodLabel = 'Últimos 15 días';
    } else if (catType === 'acuerdo') {
      // Meta: 1 cierre al mes (solo cuentan los cerrados; sin cierre se rastrean en seguimiento)
      const inMonth = execActs.filter((a) => a.date.startsWith(currentMonth));
      currentCount = inMonth.filter((a) => a.agreementStatus !== 'sin_cierre').length;
      const followUpCount = inMonth.filter((a) => a.agreementStatus === 'sin_cierre').length;
      if (followUpCount > 0) {
        secondaryNote = `${followUpCount} en seguimiento`;
      }
      periodLabel = 'Mes actual';
    }

    const prog = calculateProgressPercent(currentCount, target);
    return {
      currentCount,
      target,
      percentage: prog.rounded,
      cappedPercentage: prog.capped,
      totalHistoric: execActs.length,
      isCompleted: currentCount >= target,
      periodLabel,
      secondaryNote
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
    setFormDate(getLocalDateStr());
    setFormTime(new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false }));
    setClientName('');
    setPhone('');
    setAnswered(true);
    setNotes('');
    setCompany('');
    setEmail('');
    setAcquisitionDate(getLocalDateStr());
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
    setScheduledDate(getLocalDateStr());
    setReceiverName('');
    setReceiverRole('Gerente / Director');
    setMinutes('');
    setAttendanceProofUrl('');
    setVisitStatus('realizada');
    setVisitEvidenceType('foto');
    setCancellationProofUrl('');
    setMeetingType('Zoom');
    setInvitationProofUrl('');
    setAttendees('');
    setTopic('Presentación de Portafolio Grupo Orgánico');
    setAgreements('');
    setNextAction('');
    setAssignedRep(execName || currentUser?.name || executivesList[0]?.name || 'Alejandra Ocaña');
    setAgreementStatus('cerrado');
    setClosingDocType('Orden de servicio');
    setUploadError(null);
  };

  // Submit activity form
  const handleSubmitActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModal) return;

    const { executive, categoryType } = activeModal;
    setUploadError(null);

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
    } else if (categoryType === 'correo') {
      if (!evidenceUrl.trim() && !notes.trim()) {
        setUploadError('Debes agregar el vínculo o una copia del mensaje enviado.');
        return;
      }
      baseActivity.email = email.trim();
      baseActivity.clientName = email.trim();
      baseActivity.subject = subject.trim();
      baseActivity.evidenceUrl = evidenceUrl.trim() || undefined;
      baseActivity.notes = notes.trim() || undefined;
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
      if (visitStatus === 'realizada' && !attendanceProofUrl.trim()) {
        setUploadError('Debes adjuntar o pegar la evidencia de la visita (foto, pin de ubicación o correo de confirmación).');
        return;
      }
      if (visitStatus === 'cancelada' && !cancellationProofUrl.trim()) {
        setUploadError('En caso de cancelación, es obligatorio subir o pegar la evidencia correspondiente.');
        return;
      }
      baseActivity.clientName = clientName.trim() || receiverName.trim();
      baseActivity.company = company.trim();
      baseActivity.scheduledDate = scheduledDate;
      baseActivity.receiverName = receiverName.trim();
      baseActivity.receiverRole = receiverRole.trim();
      baseActivity.minutes = minutes.trim();
      baseActivity.visitStatus = visitStatus;
      baseActivity.visitEvidenceType = visitStatus === 'cancelada' ? 'evidencia_cancelacion' : visitEvidenceType;
      baseActivity.attendanceProofUrl = visitStatus === 'realizada' ? attendanceProofUrl.trim() : '';
      baseActivity.cancellationProofUrl = visitStatus === 'cancelada' ? cancellationProofUrl.trim() : '';
      baseActivity.nextDate = visitStatus === 'cancelada' ? nextDate : undefined;
      baseActivity.hotel = hotel;
    } else if (categoryType === 'reunion') {
      if (!invitationProofUrl.trim()) {
        setUploadError('Debes subir o pegar la evidencia del correo de acuerdo o confirmación de la reunión.');
        return;
      }
      baseActivity.meetingType = meetingType;
      baseActivity.clientName = clientName.trim();
      baseActivity.invitationProofUrl = invitationProofUrl.trim();
      baseActivity.attendees = attendees.trim();
      baseActivity.topic = topic.trim();
      baseActivity.agreements = agreements.trim();
      baseActivity.nextAction = nextAction.trim();
      baseActivity.assignedRep = assignedRep;
      baseActivity.time = formTime;
    } else if (categoryType === 'acuerdo') {
      if (agreementStatus === 'cerrado' && !evidenceUrl.trim()) {
        setUploadError('Debes subir o pegar la evidencia del cierre (orden de servicio, reservación o documento equivalente).');
        return;
      }
      if (agreementStatus === 'sin_cierre' && (!nextAction.trim() || !nextDate)) {
        setUploadError('Si aún no hay cierre, debes registrar el siguiente paso y la fecha de seguimiento.');
        return;
      }
      baseActivity.clientName = clientName.trim();
      baseActivity.company = company.trim();
      baseActivity.hotel = hotel;
      baseActivity.agreementStatus = agreementStatus;
      if (agreementStatus === 'cerrado') {
        baseActivity.closingDocType = closingDocType;
        baseActivity.folio = folio.trim();
        baseActivity.amount = parseFloat(amount) || 0;
        baseActivity.evidenceUrl = evidenceUrl.trim();
        baseActivity.agreements = agreements.trim();
        baseActivity.notes = notes.trim();
      } else {
        baseActivity.nextAction = nextAction.trim();
        baseActivity.nextDate = nextDate;
        baseActivity.notes = notes.trim();
      }
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
    setVisitStatus(act.visitStatus || 'realizada');
    setVisitEvidenceType(act.visitEvidenceType || 'foto');
    setCancellationProofUrl(act.cancellationProofUrl || '');
    setMeetingType(act.meetingType || 'Zoom');
    setInvitationProofUrl(act.invitationProofUrl || '');
    setAttendees(act.attendees || '');
    setTopic(act.topic || '');
    setAgreements(act.agreements || '');
    setNextAction(act.nextAction || '');
    setAssignedRep(act.assignedRep || currentUser?.name || executivesList[0]?.name || 'Alejandra Ocaña');
    setAgreementStatus(act.agreementStatus || 'cerrado');
    setClosingDocType(act.closingDocType || 'Orden de servicio');
    setUploadError(null);
    setIsFormOpen(true);
  };

  // Weekly / Period closure automatic statistics (filtrado por visibleActivities)
  const weeklyStats = useMemo(() => {
    const today = getLocalDateStr();
    const fifteenDaysAgoStr = getDaysAgoStr(14);
    const twentyOneDaysAgoStr = getDaysAgoStr(20);
    const currentMonth = today.slice(0, 7);

    // Current week activities
    const weekActs = visibleActivities.filter(
      (a) => a.date >= currentWeekInfo.mondayStr && a.date <= currentWeekInfo.sundayStr
    );

    const totalCalls = weekActs.filter((a) => a.type === 'llamada');
    const answeredCalls = totalCalls.filter((a) => a.answered);
    const totalEmails = weekActs.filter((a) => a.type === 'correo');
    const totalProspects = weekActs.filter((a) => a.type === 'prospecto');
    const totalFollowups = weekActs.filter((a) => a.type === 'seguimiento');
    const totalQuotes = weekActs.filter((a) => a.type === 'cotizacion');
    const totalQuoteAmount = totalQuotes.reduce((acc, q) => acc + (q.amount || 0), 0);

    // Visitas (15-21 días), Reuniones (15 días) y Acuerdos (mes)
    const periodVisits = visibleActivities.filter(
      (a) => a.type === 'visita' && a.date >= twentyOneDaysAgoStr && a.date <= currentWeekInfo.sundayStr
    );
    const completedVisits = periodVisits.filter((a) => a.visitStatus !== 'cancelada');
    const cancelledVisits = periodVisits.filter((a) => a.visitStatus === 'cancelada');

    const periodMeetings = visibleActivities.filter(
      (a) => a.type === 'reunion' && a.date >= fifteenDaysAgoStr && a.date <= currentWeekInfo.sundayStr
    );

    const monthAgreements = visibleActivities.filter(
      (a) => a.type === 'acuerdo' && a.date.startsWith(currentMonth)
    );
    const closedAgreements = monthAgreements.filter((a) => a.agreementStatus !== 'sin_cierre');
    const openAgreementFollowups = monthAgreements.filter((a) => a.agreementStatus === 'sin_cierre');

    // Stats by executive
    const execBreakdown = executivesList.map((exec) => {
      const eWeekActs = weekActs.filter((a) => matchesExecutiveActivity(a, exec));
      const eAllActs = visibleActivities.filter((a) => matchesExecutiveActivity(a, exec));
      const eCalls = eWeekActs.filter((a) => a.type === 'llamada');
      const eAnswered = eCalls.filter((a) => a.answered);
      const eEmails = eWeekActs.filter((a) => a.type === 'correo');
      const eProspects = eWeekActs.filter((a) => a.type === 'prospecto');
      const eFollowups = eWeekActs.filter((a) => a.type === 'seguimiento');
      const eQuotes = eWeekActs.filter((a) => a.type === 'cotizacion');
      const eQuoteAmount = eQuotes.reduce((acc, q) => acc + (q.amount || 0), 0);

      const eVisitsWindow = periodVisits.filter((a) => matchesExecutiveActivity(a, exec));
      const eVisitsDone = eVisitsWindow.filter((a) => a.visitStatus !== 'cancelada');
      const eVisitsCancelled = eVisitsWindow.filter((a) => a.visitStatus === 'cancelada');

      const eMeetingsWindow = periodMeetings.filter((a) => matchesExecutiveActivity(a, exec));

      const eAgreementsMonth = monthAgreements.filter((a) => matchesExecutiveActivity(a, exec));
      const eAgreementsClosed = eAgreementsMonth.filter((a) => a.agreementStatus !== 'sin_cierre');
      const eAgreementsFollowup = eAgreementsMonth.filter((a) => a.agreementStatus === 'sin_cierre');

      // Goals
      const callsGoal = 25; // 5 diarios * 5 días
      const emailsGoal = 25; // 5 diarios * 5 días
      const prospectsGoal = 2; // 2 every week and a half
      const followupsGoal = 10; // 2 diarios * 5 días
      const quotesGoal = 3; // 3 weekly
      const visitsGoal = 1; // 1 cada 15-21 días
      const meetingsGoal = 1; // 1 cada 15 días
      const agreementsGoal = 1; // 1 cierre al mes

      const callsProg = calculateProgressPercent(eCalls.length, callsGoal);
      const emailsProg = calculateProgressPercent(eEmails.length, emailsGoal);
      const prospectsProg = calculateProgressPercent(eProspects.length, prospectsGoal);
      const followupsProg = calculateProgressPercent(eFollowups.length, followupsGoal);
      const quotesProg = calculateProgressPercent(eQuotes.length, quotesGoal);
      const visitsProg = calculateProgressPercent(eVisitsDone.length, visitsGoal);
      const meetingsProg = calculateProgressPercent(eMeetingsWindow.length, meetingsGoal);
      const agreementsProg = calculateProgressPercent(eAgreementsClosed.length, agreementsGoal);

      const callsPercent = callsProg.rounded;
      const emailsPercent = emailsProg.rounded;
      const prospectsPercent = prospectsProg.rounded;
      const followupsPercent = followupsProg.rounded;
      const quotesPercent = quotesProg.rounded;
      const visitsPercent = visitsProg.rounded;
      const meetingsPercent = meetingsProg.rounded;
      const agreementsPercent = agreementsProg.rounded;

      const overallScore = Math.round(
        (callsProg.capped +
          emailsProg.capped +
          prospectsProg.capped +
          followupsProg.capped +
          quotesProg.capped +
          visitsProg.capped +
          meetingsProg.capped +
          agreementsProg.capped) /
          8
      );

      return {
        executive: exec,
        totalActivities: eWeekActs.length,
        calls: eCalls.length,
        callsAnswered: eAnswered.length,
        callsPercent,
        emails: eEmails.length,
        emailsPercent,
        prospects: eProspects.length,
        prospectsPercent,
        followups: eFollowups.length,
        followupsPercent,
        quotes: eQuotes.length,
        quoteAmount: eQuoteAmount,
        quotesPercent,
        visits: eVisitsDone.length,
        visitsCancelled: eVisitsCancelled.length,
        visitsPercent,
        meetings: eMeetingsWindow.length,
        meetingsPercent,
        agreementsClosed: eAgreementsClosed.length,
        agreementsFollowup: eAgreementsFollowup.length,
        agreementsPercent,
        overallScore,
        recentActivities: eAllActs.slice(0, 5)
      };
    });

    const teamSize = Math.max(1, executivesList.length);
    return {
      weekActsCount: weekActs.length,
      totalCalls: totalCalls.length,
      callsGoalPercent: calculateProgressPercent(totalCalls.length, teamSize * 25).rounded,
      answeredCallsRate: totalCalls.length > 0 ? Math.round((answeredCalls.length / totalCalls.length) * 100) : 0,
      totalEmails: totalEmails.length,
      emailsGoalPercent: calculateProgressPercent(totalEmails.length, teamSize * 25).rounded,
      totalProspects: totalProspects.length,
      prospectsGoalPercent: calculateProgressPercent(totalProspects.length, teamSize * 2).rounded,
      totalFollowups: totalFollowups.length,
      followupsGoalPercent: calculateProgressPercent(totalFollowups.length, teamSize * 10).rounded,
      totalQuotes: totalQuotes.length,
      quotesGoalPercent: calculateProgressPercent(totalQuotes.length, teamSize * 3).rounded,
      totalQuoteAmount,
      totalVisits: completedVisits.length,
      visitsGoalPercent: calculateProgressPercent(completedVisits.length, teamSize).rounded,
      totalVisitsCancelled: cancelledVisits.length,
      totalMeetings: periodMeetings.length,
      meetingsGoalPercent: calculateProgressPercent(periodMeetings.length, teamSize).rounded,
      totalAgreementsClosed: closedAgreements.length,
      agreementsGoalPercent: calculateProgressPercent(closedAgreements.length, teamSize).rounded,
      totalAgreementsFollowup: openAgreementFollowups.length,
      execBreakdown
    };
  }, [visibleActivities, currentWeekInfo, executivesList]);

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation Switcher */}
      <div className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-wider text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 uppercase">
                Fuerza de Ventas
              </span>
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
              Tablero de Ventas
            </h2>
            <p className="text-xs text-stone-500 mt-0.5 max-w-2xl">
              Metas diarias, quincenales y cierres.
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

            {/* Filtro por Ejecutivo (solo administradores) o insignia de perfil personal */}
            {isCurrentUserAdmin ? (
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  Ejecutivo:
                </span>
                <select
                  value={selectedExecutiveFilter}
                  onChange={(e) => setSelectedExecutiveFilter(e.target.value)}
                  className="bg-stone-50 border border-stone-300 rounded-xl px-3 py-1.5 text-xs font-bold text-stone-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="all">Todos los Ejecutivos ({executivesList.length})</option>
                  {executivesList.map((exec) => (
                    <option key={exec.id} value={exec.name}>
                      {exec.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-[11px] font-bold shrink-0">
                <span>👤</span>
                <span>Mi Perfil: {currentUser?.name}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* VIEW 1: TABLERO KANBAN DE TAREAS Y ACTIVIDADES */}
      {activeTab === 'tablero' && (
        <div className="space-y-6">
          {/* Columnas Kanban por Categoría de Tarea */}
          <div
            className={
              selectedCategory === 'all'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'grid grid-cols-1 max-w-2xl gap-4'
            }
          >
            {SALES_TASK_CATEGORIES.filter((cat) => selectedCategory === 'all' || selectedCategory === cat.type).map(
              (category) => {
                return (
                  <div
                    key={category.type}
                    className="bg-white border border-stone-200 rounded-3xl p-4 flex flex-col shadow-xs space-y-3"
                  >
                    {/* Header de la Columna / Tarea */}
                    <div className="border-b border-stone-100 pb-2.5 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xl shrink-0">{category.icon}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border text-right ${category.accentBg} ${category.color} ${category.borderColor}`}>
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
                            !isCurrentUserAdmin ||
                            selectedExecutiveFilter === 'all' ||
                            exec.name.toLowerCase() === selectedExecutiveFilter.toLowerCase()
                        )
                        .map((exec) => {
                          const progress = getExecutiveProgress(exec, category.type);
                          const lastActivity = visibleActivities
                            .filter(
                              (a) =>
                                matchesExecutiveActivity(a, exec) &&
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
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  {exec.avatar ? (
                                    <img
                                      src={exec.avatar}
                                      alt={exec.name}
                                      className="w-6 h-6 rounded-full object-cover border border-stone-300 shrink-0"
                                    />
                                  ) : (
                                    <div className="w-6 h-6 rounded-full bg-linear-to-br from-blue-700 to-indigo-800 text-white font-bold text-[10px] flex items-center justify-center shadow-xs shrink-0">
                                      {exec.initials || exec.name.slice(0, 2).toUpperCase()}
                                    </div>
                                  )}
                                  <span className="font-bold text-xs text-stone-900 group-hover:text-blue-800 transition-colors truncate">
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
                                  {progress.currentCount}/{progress.target} · {progress.percentage}%
                                </span>
                              </div>

                              {/* Barra de Progreso de la Meta */}
                              <div className="space-y-1">
                                <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full transition-all duration-500 ${
                                      progress.isCompleted ? 'bg-emerald-600' : 'bg-blue-600'
                                    }`}
                                    style={{ width: `${progress.cappedPercentage}%` }}
                                  />
                                </div>
                                <div className="flex items-center justify-between text-[9px] text-stone-500 font-mono">
                                  <span>{progress.periodLabel}: {progress.percentage}%</span>
                                  <span>{progress.totalHistoric} hist.</span>
                                </div>
                                {progress.secondaryNote && (
                                  <div className="text-[9px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 rounded-md px-1.5 py-0.5 inline-block">
                                    {progress.secondaryNote}
                                  </div>
                                )}
                              </div>

                              {/* Mini Vista Previa de la Última Actividad */}
                              <div className="text-[10px] text-stone-600 bg-white/80 p-2 rounded-xl border border-stone-200/80 truncate">
                                {lastActivity ? (
                                  <div>
                                    <div className="flex items-center justify-between gap-1">
                                      <span className="font-bold text-stone-800 truncate">
                                        {lastActivity.clientName || lastActivity.company || lastActivity.receiverName || lastActivity.topic || 'Actividad registrada'}
                                      </span>
                                      {lastActivity.type === 'visita' && lastActivity.visitStatus === 'cancelada' && (
                                        <span className="text-[8px] font-bold px-1 py-0.2 bg-rose-100 text-rose-700 rounded shrink-0">
                                          Cancelada
                                        </span>
                                      )}
                                      {lastActivity.type === 'acuerdo' && (
                                        <span
                                          className={`text-[8px] font-bold px-1 py-0.2 rounded shrink-0 ${
                                            lastActivity.agreementStatus === 'sin_cierre'
                                              ? 'bg-amber-100 text-amber-800'
                                              : 'bg-teal-100 text-teal-800'
                                          }`}
                                        >
                                          {lastActivity.agreementStatus === 'sin_cierre' ? 'Seguimiento' : 'Cerrado'}
                                        </span>
                                      )}
                                      {lastActivity.type === 'reunion' && lastActivity.meetingType && (
                                        <span className="text-[8px] font-bold px-1 py-0.2 bg-indigo-100 text-indigo-700 rounded shrink-0">
                                          {lastActivity.meetingType}
                                        </span>
                                      )}
                                    </div>
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
                  Corte Semanal · Viernes
                </span>
                <h3 className="font-editorial text-2xl sm:text-3xl font-extrabold text-white mt-1">
                  {isCurrentUserAdmin ? 'Reporte de Ventas' : 'Mi Reporte de Ventas'}
                </h3>
                <p className="text-xs text-stone-300 mt-0.5">
                  Semana del {formatDate(currentWeekInfo.mondayStr)} al {formatDate(currentWeekInfo.fridayStr)}
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

            {/* KPIs Globales */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 pt-2">
              <div className="bg-white/5 border border-white/10 p-3 rounded-2xl space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">📞 Llamadas</span>
                <span className="font-mono text-xl font-extrabold text-white">{weeklyStats.totalCalls}</span>
                <span className="text-[10px] text-emerald-400 font-semibold block">
                  {weeklyStats.callsGoalPercent}% meta · {weeklyStats.answeredCallsRate}% resp.
                </span>
              </div>

              <div className="bg-white/5 border border-white/10 p-3 rounded-2xl space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">✉️ Correos</span>
                <span className="font-mono text-xl font-extrabold text-white">{weeklyStats.totalEmails}</span>
                <span className="text-[10px] text-emerald-400 font-semibold block">
                  {weeklyStats.emailsGoalPercent}% meta
                </span>
              </div>

              <div className="bg-white/5 border border-white/10 p-3 rounded-2xl space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">🎯 Prospectos</span>
                <span className="font-mono text-xl font-extrabold text-white">{weeklyStats.totalProspects}</span>
                <span className="text-[10px] text-emerald-400 font-semibold block">
                  {weeklyStats.prospectsGoalPercent}% meta
                </span>
              </div>

              <div className="bg-white/5 border border-white/10 p-3 rounded-2xl space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">🔄 Seguimientos</span>
                <span className="font-mono text-xl font-extrabold text-white">{weeklyStats.totalFollowups}</span>
                <span className="text-[10px] text-emerald-400 font-semibold block">
                  {weeklyStats.followupsGoalPercent}% meta
                </span>
              </div>

              <div className="bg-white/5 border border-white/10 p-3 rounded-2xl space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">📑 Cotizaciones</span>
                <span className="font-mono text-xl font-extrabold text-white">{weeklyStats.totalQuotes}</span>
                <span className="text-[10px] text-emerald-400 font-mono block truncate">
                  {weeklyStats.quotesGoalPercent}% meta · {formatCurrency(weeklyStats.totalQuoteAmount, 'MXN')}
                </span>
              </div>

              <div className="bg-white/5 border border-white/10 p-3 rounded-2xl space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">📍 Visitas (15–21d)</span>
                <span className="font-mono text-xl font-extrabold text-white">{weeklyStats.totalVisits}</span>
                <span className="text-[10px] text-emerald-400 font-semibold block">
                  {weeklyStats.visitsGoalPercent}% meta
                  {weeklyStats.totalVisitsCancelled > 0 ? ` · ${weeklyStats.totalVisitsCancelled} cancel.` : ''}
                </span>
              </div>

              <div className="bg-white/5 border border-white/10 p-3 rounded-2xl space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">🤝 Reuniones (15d)</span>
                <span className="font-mono text-xl font-extrabold text-white">{weeklyStats.totalMeetings}</span>
                <span className="text-[10px] text-emerald-400 font-semibold block">
                  {weeklyStats.meetingsGoalPercent}% meta
                </span>
              </div>

              <div className="bg-white/5 border border-teal-400/30 p-3 rounded-2xl space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-teal-300 block">🏆 Cierres (Mes)</span>
                <span className="font-mono text-xl font-extrabold text-white">{weeklyStats.totalAgreementsClosed}</span>
                <span className="text-[10px] text-amber-300 font-semibold block">
                  {weeklyStats.agreementsGoalPercent}% meta
                  {weeklyStats.totalAgreementsFollowup > 0 ? ` · ${weeklyStats.totalAgreementsFollowup} seg.` : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Tarjetas de Desglose y Progreso por Ejecutivo */}
          <div className={weeklyStats.execBreakdown.length === 1 ? 'grid grid-cols-1 max-w-3xl gap-6' : 'grid grid-cols-1 md:grid-cols-2 gap-6'}>
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
                        {item.executive.role} · {item.totalActivities} actividades esta semana
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
                        {item.calls}/25 · {item.callsPercent}% ({item.callsAnswered} contestadas)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                      <div
                        className={`h-full transition-all duration-500 ${
                          item.callsPercent >= 100 ? 'bg-emerald-600' : 'bg-blue-600'
                        }`}
                        style={{ width: `${Math.min(100, item.callsPercent)}%` }}
                      />
                    </div>
                  </div>

                  {/* Correos Comerciales */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-stone-700">
                      <span className="font-bold flex items-center gap-1.5">
                        <span>✉️</span> Correos Comerciales (Meta semanal: 25)
                      </span>
                      <span className="font-mono font-bold text-stone-900">
                        {item.emails}/25 · {item.emailsPercent}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                      <div
                        className={`h-full transition-all duration-500 ${
                          item.emailsPercent >= 100 ? 'bg-emerald-600' : 'bg-sky-600'
                        }`}
                        style={{ width: `${Math.min(100, item.emailsPercent)}%` }}
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
                        {item.prospects}/2 · {item.prospectsPercent}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                      <div
                        className={`h-full transition-all duration-500 ${
                          item.prospectsPercent >= 100 ? 'bg-emerald-600' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, item.prospectsPercent)}%` }}
                      />
                    </div>
                  </div>

                  {/* Seguimientos */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-stone-700">
                      <span className="font-bold flex items-center gap-1.5">
                        <span>🔄</span> Seguimiento de Clientes (Meta semanal: 10)
                      </span>
                      <span className="font-mono font-bold text-stone-900">
                        {item.followups}/10 · {item.followupsPercent}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                      <div
                        className={`h-full transition-all duration-500 ${
                          item.followupsPercent >= 100 ? 'bg-emerald-600' : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(100, item.followupsPercent)}%` }}
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
                        {item.quotes}/3 · {item.quotesPercent}% · {formatCurrency(item.quoteAmount, 'MXN')}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                      <div
                        className={`h-full transition-all duration-500 ${
                          item.quotesPercent >= 100 ? 'bg-emerald-600' : 'bg-purple-600'
                        }`}
                        style={{ width: `${Math.min(100, item.quotesPercent)}%` }}
                      />
                    </div>
                  </div>

                  {/* Visitas Presenciales (1 cada 15-21 días) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-stone-700">
                      <span className="font-bold flex items-center gap-1.5">
                        <span>📍</span> Visitas Presenciales (1 c/15–21 días)
                      </span>
                      <span className="font-mono font-bold text-stone-900">
                        {item.visits}/1 · {item.visitsPercent}%{item.visitsCancelled > 0 ? ` · ${item.visitsCancelled} cancel.` : ''}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                      <div
                        className={`h-full transition-all duration-500 ${
                          item.visitsPercent >= 100 ? 'bg-emerald-600' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, item.visitsPercent)}%` }}
                      />
                    </div>
                  </div>

                  {/* Reuniones Comerciales (1 cada 15 días) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-stone-700">
                      <span className="font-bold flex items-center gap-1.5">
                        <span>🤝</span> Reuniones Comerciales (1 c/15 días)
                      </span>
                      <span className="font-mono font-bold text-stone-900">
                        {item.meetings}/1 · {item.meetingsPercent}% (Zoom/Meet/Scouting)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                      <div
                        className={`h-full transition-all duration-500 ${
                          item.meetingsPercent >= 100 ? 'bg-emerald-600' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${Math.min(100, item.meetingsPercent)}%` }}
                      />
                    </div>
                  </div>

                  {/* Acuerdos Comerciales (1 cierre al mes) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-stone-700">
                      <span className="font-bold flex items-center gap-1.5">
                        <span>🏆</span> Acuerdos Comerciales (1 cierre/mes)
                      </span>
                      <span className="font-mono font-bold text-stone-900">
                        {item.agreementsClosed}/1 · {item.agreementsPercent}%{item.agreementsFollowup > 0 ? ` · ${item.agreementsFollowup} seg.` : ''}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                      <div
                        className={`h-full transition-all duration-500 ${
                          item.agreementsPercent >= 100 ? 'bg-emerald-600' : 'bg-teal-600'
                        }`}
                        style={{ width: `${Math.min(100, item.agreementsPercent)}%` }}
                      />
                    </div>
                  </div>

                  {/* Resumen rápido de Seguimientos */}
                  <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[11px]">
                    <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                      <span className="text-[10px] text-stone-400 block font-bold">🔄 Seguimientos</span>
                      <span className="font-mono font-extrabold text-stone-900 text-sm">{item.followups}</span>
                    </div>
                    <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                      <span className="text-[10px] text-stone-400 block font-bold">📍 Visitas (21d)</span>
                      <span className="font-mono font-extrabold text-stone-900 text-sm">{item.visits}</span>
                    </div>
                    <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                      <span className="text-[10px] text-stone-400 block font-bold">🏆 Cierres (Mes)</span>
                      <span className="font-mono font-extrabold text-stone-900 text-sm">{item.agreementsClosed}</span>
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
              const progress = getExecutiveProgress(activeModal.executive, activeModal.categoryType);
              const modalActivities = visibleActivities.filter(
                (a) =>
                  matchesExecutiveActivity(a, activeModal.executive) &&
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
                    <div className="flex items-center justify-between text-xs gap-2 flex-wrap">
                      <span className="font-bold text-stone-800">
                        Cumplimiento de Meta ({progress.periodLabel}):
                      </span>
                      <div className="flex items-center gap-2">
                        {progress.secondaryNote && (
                          <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                            {progress.secondaryNote}
                          </span>
                        )}
                        <span className="font-mono font-bold text-stone-900">
                          {progress.currentCount} de {progress.target} ({progress.percentage}%)
                        </span>
                      </div>
                    </div>
                    <div className="h-2.5 w-full bg-stone-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          progress.isCompleted ? 'bg-emerald-600' : 'bg-blue-600'
                        }`}
                        style={{ width: `${progress.cappedPercentage}%` }}
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

                      {uploadError && (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between gap-2">
                          <span>⚠️ {uploadError}</span>
                          <button
                            type="button"
                            onClick={() => setUploadError(null)}
                            className="text-rose-500 hover:text-rose-800 font-bold cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      )}

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

                      {/* FORM: CORREOS COMERCIALES (5 diarios / 25 semanales) */}
                      {activeModal.categoryType === 'correo' && (
                        <div className="space-y-3 text-xs">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-stone-700 font-bold mb-1">Destinatario</label>
                              <input
                                type="text"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Ej. compras@empresa.com o Nombre"
                                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                              />
                            </div>
                            <div>
                              <label className="block text-stone-700 font-bold mb-1">Asunto</label>
                              <input
                                type="text"
                                required
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Ej. Propuesta eventos corporativos 2027"
                                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-stone-700 font-bold mb-1">
                              Vínculo del correo / Drive / Captura (opcional si pegas copia)
                            </label>
                            <input
                              type="url"
                              value={evidenceUrl}
                              onChange={(e) => setEvidenceUrl(e.target.value)}
                              placeholder="https://..."
                              className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                            />
                          </div>

                          <div>
                            <label className="block text-stone-700 font-bold mb-1">
                              Copia del mensaje (opcional si pegas vínculo)
                            </label>
                            <textarea
                              rows={3}
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              placeholder="Pega aquí el texto o resumen del correo enviado..."
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

                      {/* FORM: VISITAS PRESENCIALES (1 cada 15 días o cada 3 semanas) */}
                      {activeModal.categoryType === 'visita' && (
                        <div className="space-y-3.5 text-xs">
                          {/* Estado de la Visita: Realizada vs Cancelada */}
                          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3 space-y-2">
                            <label className="block text-stone-700 font-bold">Estado de la Visita Presencial</label>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setVisitStatus('realizada');
                                  if (visitEvidenceType === 'evidencia_cancelacion') setVisitEvidenceType('foto');
                                  setUploadError(null);
                                }}
                                className={`py-2 px-3 rounded-xl font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                  visitStatus === 'realizada'
                                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                                    : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-100'
                                }`}
                              >
                                <span>✓</span> Visita Realizada
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setVisitStatus('cancelada');
                                  setVisitEvidenceType('evidencia_cancelacion');
                                  setUploadError(null);
                                }}
                                className={`py-2 px-3 rounded-xl font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                  visitStatus === 'cancelada'
                                    ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                                    : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-100'
                                }`}
                              >
                                <span>✗</span> Visita Cancelada
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-stone-700 font-bold mb-1">Cliente / Empresa Visitada</label>
                              <input
                                type="text"
                                required
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                placeholder="Ej. Corporativo Banorte / Agencia Viajes"
                                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                              />
                            </div>
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
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-stone-700 font-bold mb-1">Hotel / Propiedad Relacionada</label>
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
                                <option value="Oficinas del Cliente / Externo">Oficinas del Cliente / Externo</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-stone-700 font-bold mb-1">
                                Nombre de Quien Recibió {visitStatus === 'cancelada' ? '(Opcional)' : ''}
                              </label>
                              <input
                                type="text"
                                required={visitStatus === 'realizada'}
                                value={receiverName}
                                onChange={(e) => setReceiverName(e.target.value)}
                                placeholder="Ej. Lic. Carlos Treviño"
                                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                              />
                            </div>
                            <div>
                              <label className="block text-stone-700 font-bold mb-1">
                                Cargo {visitStatus === 'cancelada' ? '(Opcional)' : ''}
                              </label>
                              <input
                                type="text"
                                required={visitStatus === 'realizada'}
                                value={receiverRole}
                                onChange={(e) => setReceiverRole(e.target.value)}
                                placeholder="Ej. Director de RRHH"
                                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                              />
                            </div>
                          </div>

                          {visitStatus === 'realizada' ? (
                            <>
                              <div>
                                <label className="block text-stone-700 font-bold mb-1">Minuta de la Visita</label>
                                <textarea
                                  rows={3}
                                  required
                                  value={minutes}
                                  onChange={(e) => setMinutes(e.target.value)}
                                  placeholder="Recorrido o reunión realizada, temas tratados, dudas del cliente y próximos pasos..."
                                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 resize-none"
                                />
                              </div>

                              <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-3.5 space-y-2.5">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <label className="font-bold text-rose-900">
                                    📎 Evidencia Obligatoria de Visita
                                  </label>
                                  <select
                                    value={visitEvidenceType}
                                    onChange={(e) =>
                                      setVisitEvidenceType(
                                        e.target.value as 'foto' | 'pin_ubicacion' | 'correo_confirmacion'
                                      )
                                    }
                                    className="bg-white border border-rose-300 rounded-lg px-2.5 py-1 text-[11px] font-bold text-rose-900"
                                  >
                                    <option value="foto">📸 Foto del lugar</option>
                                    <option value="pin_ubicacion">📍 Pin de ubicación (Google Maps)</option>
                                    <option value="correo_confirmacion">📧 Correo de confirmación de la reunión</option>
                                  </select>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-2">
                                  <input
                                    type="text"
                                    required
                                    value={attendanceProofUrl}
                                    onChange={(e) => setAttendanceProofUrl(e.target.value)}
                                    placeholder={
                                      visitEvidenceType === 'pin_ubicacion'
                                        ? 'Pega el enlace del pin de Google Maps o sube captura...'
                                        : visitEvidenceType === 'correo_confirmacion'
                                        ? 'Sube captura/PDF del correo de confirmación o pega el enlace...'
                                        : 'Sube la foto del lugar o pega el enlace...'
                                    }
                                    className="flex-1 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white"
                                  />
                                  <label className="px-3.5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-colors">
                                    <span>{isUploadingEvidence ? '⏳ Subiendo...' : '📤 Subir Foto / PDF'}</span>
                                    <input
                                      type="file"
                                      accept=".jpg,.jpeg,.png,.webp,.pdf"
                                      disabled={isUploadingEvidence}
                                      onChange={(e) => handleUploadEvidenceFile(e, setAttendanceProofUrl)}
                                      className="hidden"
                                    />
                                  </label>
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-[11px] font-medium">
                                ⚠️ <strong>Cancelación:</strong> sube la evidencia (correo, WhatsApp o aviso).
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-stone-700 font-bold mb-1">Motivo de Cancelación</label>
                                  <textarea
                                    rows={2}
                                    required
                                    value={minutes}
                                    onChange={(e) => setMinutes(e.target.value)}
                                    placeholder="Indica quién canceló, el motivo y si se acordó reagendar..."
                                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 resize-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-stone-700 font-bold mb-1">Nueva Fecha Tentativa (Opcional)</label>
                                  <input
                                    type="date"
                                    value={nextDate}
                                    onChange={(e) => setNextDate(e.target.value)}
                                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                                  />
                                </div>
                              </div>

                              <div className="bg-rose-50/80 border border-rose-300 rounded-2xl p-3.5 space-y-2">
                                <label className="block font-bold text-rose-900">
                                  🚫 Evidencia de Cancelación (Obligatoria)
                                </label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                  <input
                                    type="text"
                                    required
                                    value={cancellationProofUrl}
                                    onChange={(e) => setCancellationProofUrl(e.target.value)}
                                    placeholder="Sube captura/PDF del correo o mensaje de cancelación, o pega enlace..."
                                    className="flex-1 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white"
                                  />
                                  <label className="px-3.5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-colors">
                                    <span>{isUploadingEvidence ? '⏳ Subiendo...' : '📤 Subir Evidencia'}</span>
                                    <input
                                      type="file"
                                      accept=".jpg,.jpeg,.png,.webp,.pdf"
                                      disabled={isUploadingEvidence}
                                      onChange={(e) => handleUploadEvidenceFile(e, setCancellationProofUrl)}
                                      className="hidden"
                                    />
                                  </label>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {/* FORM: REUNIONES COMERCIALES (Zoom, Meet o scouting — 1 cada 15 días) */}
                      {activeModal.categoryType === 'reunion' && (
                        <div className="space-y-3.5 text-xs">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-stone-700 font-bold mb-1">Modalidad de Reunión</label>
                              <select
                                value={meetingType}
                                onChange={(e) => setMeetingType(e.target.value)}
                                className="w-full border border-indigo-300 rounded-xl px-3 py-2 text-indigo-950 bg-indigo-50/40 font-bold"
                              >
                                <option value="Zoom">💻 Zoom</option>
                                <option value="Meet">📹 Google Meet</option>
                                <option value="Scouting">🏨 Scouting</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-stone-700 font-bold mb-1">¿Quién asiste?</label>
                              <select
                                value={assignedRep}
                                onChange={(e) => setAssignedRep(e.target.value)}
                                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white font-bold"
                              >
                                {executivesList.map((exec) => (
                                  <option key={exec.id} value={exec.name}>
                                    {exec.name}
                                  </option>
                                ))}
                                {isCurrentUserAdmin && (
                                  <option value="Equipo Comercial (Varios)">Equipo Comercial (Varios)</option>
                                )}
                              </select>
                            </div>
                            <div>
                              <label className="block text-stone-700 font-bold mb-1">Cliente / Empresa</label>
                              <input
                                type="text"
                                required
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                placeholder="Ej. Agencia Eventos MX"
                                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-stone-700 font-bold mb-1">Tema de la Reunión</label>
                              <input
                                type="text"
                                required
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="Ej. Presentación de sedes y convenio corporativo"
                                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                              />
                            </div>
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
                          </div>

                          <div className="bg-indigo-50/60 border border-indigo-200 rounded-2xl p-3.5 space-y-2">
                            <label className="block font-bold text-indigo-950">
                              📧 Evidencia Obligatoria: Correo de acuerdo o confirmación
                            </label>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <input
                                type="text"
                                required
                                value={invitationProofUrl}
                                onChange={(e) => setInvitationProofUrl(e.target.value)}
                                placeholder="Sube captura/PDF del correo de acuerdo o confirmación, o pega el enlace..."
                                className="flex-1 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white"
                              />
                              <label className="px-3.5 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-colors">
                                <span>{isUploadingEvidence ? '⏳ Subiendo...' : '📤 Subir Correo / PDF'}</span>
                                <input
                                  type="file"
                                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                                  disabled={isUploadingEvidence}
                                  onChange={(e) => handleUploadEvidenceFile(e, setInvitationProofUrl)}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          </div>

                          <div>
                            <label className="block text-stone-700 font-bold mb-1">Acuerdos Tomados</label>
                            <textarea
                              rows={2}
                              required
                              value={agreements}
                              onChange={(e) => setAgreements(e.target.value)}
                              placeholder="Términos comerciales pre-acordados, tarifas, fechas o requerimientos..."
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
                              placeholder="Ej. Envío de propuesta formal o contrato el próximo martes"
                              className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                            />
                          </div>
                        </div>
                      )}

                      {/* FORM: ACUERDOS COMERCIALES (1 cierre al mes) */}
                      {activeModal.categoryType === 'acuerdo' && (
                        <div className="space-y-3.5 text-xs">
                          {/* Resultado del Acuerdo: Cierre Logrado vs Sin Cierre */}
                          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3 space-y-2">
                            <label className="block text-stone-700 font-bold">Estatus del Acuerdo Comercial</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setAgreementStatus('cerrado');
                                  setUploadError(null);
                                }}
                                className={`py-2 px-3 rounded-xl font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                  agreementStatus === 'cerrado'
                                    ? 'bg-teal-600 text-white border-teal-700 shadow-xs'
                                    : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-100'
                                }`}
                              >
                                <span>🏆</span> Cierre Logrado (Cuenta para meta mensual)
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setAgreementStatus('sin_cierre');
                                  setUploadError(null);
                                }}
                                className={`py-2 px-3 rounded-xl font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                  agreementStatus === 'sin_cierre'
                                    ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                                    : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-100'
                                }`}
                              >
                                <span>⏳</span> Sin Cierre (Registrar siguiente paso)
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-stone-700 font-bold mb-1">Cliente / Empresa</label>
                              <input
                                type="text"
                                required
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                placeholder="Ej. Corporativo FEMSA / Boda Martínez"
                                className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                              />
                            </div>
                            <div>
                              <label className="block text-stone-700 font-bold mb-1">Hotel / Propiedad</label>
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

                          {agreementStatus === 'cerrado' ? (
                            <>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                  <label className="block text-stone-700 font-bold mb-1">Tipo de Documento de Cierre</label>
                                  <select
                                    value={closingDocType}
                                    onChange={(e) => setClosingDocType(e.target.value)}
                                    className="w-full border border-teal-300 rounded-xl px-3 py-2 text-teal-950 bg-teal-50/40 font-bold"
                                  >
                                    <option value="Orden de servicio">Orden de servicio</option>
                                    <option value="Reservación">Reservación</option>
                                    <option value="Documento de cierre equivalente">Documento de cierre equivalente</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-stone-700 font-bold mb-1">Folio / No. de Referencia</label>
                                  <input
                                    type="text"
                                    value={folio}
                                    onChange={(e) => setFolio(e.target.value)}
                                    placeholder="Ej. OS-2026-045 / RES-991"
                                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 font-mono"
                                  />
                                </div>
                                <div>
                                  <label className="block text-stone-700 font-bold mb-1">Importe del Cierre ($ MXN)</label>
                                  <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Ej. 120000"
                                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 font-mono font-bold"
                                  />
                                </div>
                              </div>

                              <div className="bg-teal-50/70 border border-teal-200 rounded-2xl p-3.5 space-y-2">
                                <label className="block font-bold text-teal-950">
                                  📄 Evidencia Obligatoria de Cierre ({closingDocType})
                                </label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                  <input
                                    type="text"
                                    required
                                    value={evidenceUrl}
                                    onChange={(e) => setEvidenceUrl(e.target.value)}
                                    placeholder="Sube el PDF/foto de la orden de servicio, reservación o documento de cierre..."
                                    className="flex-1 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 bg-white"
                                  />
                                  <label className="px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-colors">
                                    <span>{isUploadingEvidence ? '⏳ Subiendo...' : '📤 Subir Documento / PDF'}</span>
                                    <input
                                      type="file"
                                      accept=".jpg,.jpeg,.png,.webp,.pdf"
                                      disabled={isUploadingEvidence}
                                      onChange={(e) => handleUploadEvidenceFile(e, setEvidenceUrl)}
                                      className="hidden"
                                    />
                                  </label>
                                </div>
                              </div>

                              <div>
                                <label className="block text-stone-700 font-bold mb-1">Detalles / Resumen del Acuerdo</label>
                                <textarea
                                  rows={2}
                                  value={agreements}
                                  onChange={(e) => setAgreements(e.target.value)}
                                  placeholder="Servicios contratados, condiciones de pago o fechas confirmadas..."
                                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 resize-none"
                                />
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-medium">
                                ⏳ <strong>Sin cierre:</strong> registra siguiente paso y fecha de seguimiento.
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-stone-700 font-bold mb-1">Siguiente Paso (Obligatorio)</label>
                                  <input
                                    type="text"
                                    required
                                    value={nextAction}
                                    onChange={(e) => setNextAction(e.target.value)}
                                    placeholder="Ej. Enviar ajuste de cotización y llamar para autorización"
                                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                                  />
                                </div>
                                <div>
                                  <label className="block text-stone-700 font-bold mb-1">Fecha de Seguimiento (Obligatoria)</label>
                                  <input
                                    type="date"
                                    required
                                    value={nextDate}
                                    onChange={(e) => setNextDate(e.target.value)}
                                    className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-stone-700 font-bold mb-1">Observaciones / Motivo Pendiente</label>
                                <textarea
                                  rows={2}
                                  value={notes}
                                  onChange={(e) => setNotes(e.target.value)}
                                  placeholder="Qué falta para cerrar (ej. aprobación de dirección, ajuste de fechas o presupuesto)..."
                                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-stone-900 resize-none"
                                />
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {/* Botones de acción del formulario */}
                      <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                        <button
                          type="button"
                          onClick={() => {
                            setIsFormOpen(false);
                            setEditingActivityId(null);
                            setUploadError(null);
                          }}
                          className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={isUploadingEvidence}
                          className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-xs font-bold shadow-xs"
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
                          {modalActivities.map((act) => {
                            const proofLink =
                              act.cancellationProofUrl ||
                              act.attendanceProofUrl ||
                              act.invitationProofUrl ||
                              act.evidenceUrl ||
                              act.proofUrl;

                            const visitEvidenceLabel =
                              act.visitEvidenceType === 'pin_ubicacion'
                                ? '📍 Pin de ubicación'
                                : act.visitEvidenceType === 'correo_confirmacion'
                                ? '📧 Correo de confirmación'
                                : act.visitEvidenceType === 'evidencia_cancelacion'
                                ? '🚫 Evidencia de cancelación'
                                : '📸 Foto del lugar';

                            return (
                              <div
                                key={act.id}
                                className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-2 hover:border-blue-300 transition-all shadow-2xs"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <div className="font-bold text-stone-900 text-sm">
                                      {act.type === 'correo'
                                        ? (act.subject || act.email || act.clientName || 'Correo enviado')
                                        : (act.clientName || act.company || act.receiverName || act.topic || 'Registro sin título')}
                                    </div>
                                    <div className="flex items-center flex-wrap gap-2 text-[10px] text-stone-500 font-mono mt-0.5">
                                      <span>📅 {formatDate(act.date)}</span>
                                      {act.time && <span>· ⏰ {act.time}h</span>}
                                      {act.type === 'correo' && act.email && <span>· ✉️ {act.email}</span>}
                                      {act.phone && <span>· 📞 {act.phone}</span>}
                                      {act.hotel && <span>· 🏨 {act.hotel}</span>}
                                      {act.folio && <span>· #{act.folio}</span>}
                                    </div>
                                  </div>

                                  <div className="flex items-center flex-wrap justify-end gap-1.5 shrink-0">
                                    {act.type === 'llamada' && act.answered !== undefined && (
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

                                    {act.type === 'visita' && (
                                      <span
                                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                          act.visitStatus === 'cancelada'
                                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                        }`}
                                      >
                                        {act.visitStatus === 'cancelada' ? '✗ Cancelada' : '✓ Realizada'}
                                      </span>
                                    )}

                                    {act.type === 'reunion' && act.meetingType && (
                                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                                        {act.meetingType === 'Zoom'
                                          ? '💻 Zoom'
                                          : act.meetingType === 'Meet'
                                          ? '📹 Meet'
                                          : `🏨 ${act.meetingType}`}
                                      </span>
                                    )}

                                    {act.type === 'acuerdo' && (
                                      <span
                                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                          act.agreementStatus === 'sin_cierre'
                                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                                            : 'bg-teal-100 text-teal-800 border-teal-300'
                                        }`}
                                      >
                                        {act.agreementStatus === 'sin_cierre'
                                          ? '⏳ Sin cierre · Seguimiento'
                                          : `🏆 Cierre · ${act.closingDocType || 'Confirmado'}`}
                                      </span>
                                    )}

                                    {act.amount ? (
                                      <span className="font-mono font-extrabold text-xs text-purple-900 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                                        {formatCurrency(act.amount, 'MXN')}
                                      </span>
                                    ) : null}

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
                                {act.receiverName && (
                                  <div className="text-[11px] text-stone-600">
                                    <strong className="text-stone-800">Recibió:</strong> {act.receiverName}
                                    {act.receiverRole ? ` (${act.receiverRole})` : ''}
                                  </div>
                                )}

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
                                    <strong className="text-stone-900">
                                      {act.visitStatus === 'cancelada' ? 'Motivo de cancelación:' : 'Minuta:'}
                                    </strong>{' '}
                                    {act.minutes}
                                  </p>
                                )}

                                {act.agreements && (
                                  <p className="text-stone-700 bg-white p-2 rounded-xl border border-stone-200/80 leading-relaxed">
                                    <strong className="text-stone-900">Acuerdos:</strong> {act.agreements}
                                    {act.nextAction && (
                                      <span>
                                        {' '}
                                        · <strong className="text-stone-900">Siguiente Acción:</strong> {act.nextAction}
                                      </span>
                                    )}
                                  </p>
                                )}

                                {/* Siguiente paso y fecha de seguimiento cuando NO hubo cierre o hay reprogramación */}
                                {(!act.agreements && act.nextAction) || act.nextDate ? (
                                  <div className="text-[11px] text-amber-900 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200 flex flex-wrap items-center justify-between gap-2">
                                    {act.nextAction && (
                                      <span>
                                        <strong>➡️ Siguiente paso:</strong> {act.nextAction}
                                      </span>
                                    )}
                                    {act.nextDate && (
                                      <span className="font-mono font-bold text-amber-950 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                                        📅 Seguimiento: {formatDate(act.nextDate)}
                                      </span>
                                    )}
                                  </div>
                                ) : null}

                                {/* Evidencias / Comprobantes links */}
                                {proofLink && (
                                  <div className="text-[10px] text-blue-700 pt-1 font-semibold flex items-center flex-wrap gap-1.5">
                                    <span>
                                      {act.type === 'visita'
                                        ? `${visitEvidenceLabel}:`
                                        : act.type === 'reunion'
                                        ? '📧 Correo de acuerdo / confirmación:'
                                        : act.type === 'acuerdo'
                                        ? `📄 ${act.closingDocType || 'Documento de cierre'}:`
                                        : '📎 Evidencia / Comprobante:'}
                                    </span>
                                    <a
                                      href={safeExternalUrl(proofLink)}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="underline truncate max-w-md hover:text-blue-900"
                                    >
                                      {proofLink}
                                    </a>
                                  </div>
                                )}
                              </div>
                            );
                          })}
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

