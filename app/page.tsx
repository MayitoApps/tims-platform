'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AuthGate } from '@/components/AuthGate';
import { Navbar } from '@/components/Navbar';
import { MarketingSection } from '@/components/marketing/MarketingSection';
import { CommercialSection } from '@/components/commercial/CommercialSection';
import { SalesSection } from '@/components/sales/SalesSection';

import {
  INITIAL_CAMPAIGNS,
  INITIAL_PUBLICATIONS,
  INITIAL_BRIEFS,
  INITIAL_DEALS,
  INITIAL_MARKETING_TASKS
} from '@/lib/initial-data';

import {
  UserProfile,
  MarketingCampaign,
  ContentPublication,
  CreativeBrief,
  HotelDeal,
  MarketingTask,
  CommercialTask,
  MarketingCampaignStatus,
  HotelDealStage,
  MarketingTaskStage,
  CommercialTaskStage,
  AppNotification,
  SalesActivity,
  isUserAdmin,
  getUserAllowedModules,
  matchesUserIdentity
} from '@/lib/types';
import { getLocalDateStr, readPersistedNavValue, writePersistedNavValue, clearPersistedNavValues } from '@/lib/utils';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [activeSection, setActiveSection] = useState<'marketing' | 'commercial' | 'sales'>('marketing');

  // Real data state
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>(INITIAL_CAMPAIGNS);
  const [publications, setPublications] = useState<ContentPublication[]>(INITIAL_PUBLICATIONS);
  const [briefs, setBriefs] = useState<CreativeBrief[]>(INITIAL_BRIEFS);
  const [deals, setDeals] = useState<HotelDeal[]>(INITIAL_DEALS);
  const [marketingTasks, setMarketingTasks] = useState<MarketingTask[]>(INITIAL_MARKETING_TASKS);
  const [commercialTasks, setCommercialTasks] = useState<CommercialTask[]>([]);
  const [salesActivities, setSalesActivities] = useState<SalesActivity[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);

  const navigateToSection = (section: 'marketing' | 'commercial' | 'sales') => {
    setActiveSection(section);
    let savedSubView: string | undefined;
    try {
      if (section === 'commercial') savedSubView = localStorage.getItem('tims_commercial_subview') || undefined;
      if (section === 'marketing') savedSubView = localStorage.getItem('tims_marketing_subview') || undefined;
      if (section === 'sales') savedSubView = localStorage.getItem('tims_sales_tab') || undefined;
    } catch {}
    writePersistedNavValue('tims_active_section', section, section, savedSubView);
  };

  const handleSelectUpcomingDeal = (deal: HotelDeal) => {
    navigateToSection('commercial');
    setSelectedDealId(deal.id);
  };

  // Live Toast Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Check Google Auth session on mount & Sync with Database
  useEffect(() => {
    // 1. One-time clean of legacy mock demo data from local storage
    try {
      const isLegacyCleared = localStorage.getItem('tims_mock_data_cleared_v2');
      if (!isLegacyCleared) {
        localStorage.removeItem('tims_deals');
        localStorage.removeItem('tims_mkt_tasks');
        localStorage.removeItem('tims_campaigns');
        localStorage.removeItem('tims_publications');
        localStorage.removeItem('tims_briefs');
        localStorage.setItem('tims_mock_data_cleared_v2', 'true');
      }
    } catch {}

    // Initial hydration from local storage for instant render
    try {
      const cachedDeals = localStorage.getItem('tims_deals');
      if (cachedDeals) {
        const parsed = JSON.parse(cachedDeals);
        if (Array.isArray(parsed)) setDeals(parsed);
      }
      const cachedTasks = localStorage.getItem('tims_mkt_tasks');
      if (cachedTasks) {
        const parsed = JSON.parse(cachedTasks);
        if (Array.isArray(parsed)) setMarketingTasks(parsed);
      }
      const cachedCommTasks = localStorage.getItem('tims_commercial_tasks');
      if (cachedCommTasks) {
        const parsed = JSON.parse(cachedCommTasks);
        if (Array.isArray(parsed)) setCommercialTasks(parsed);
      }
      const cachedCampaigns = localStorage.getItem('tims_campaigns');
      if (cachedCampaigns) {
        const parsed = JSON.parse(cachedCampaigns);
        if (Array.isArray(parsed)) setCampaigns(parsed);
      }
      const cachedPubs = localStorage.getItem('tims_publications');
      if (cachedPubs) {
        const parsed = JSON.parse(cachedPubs);
        if (Array.isArray(parsed)) setPublications(parsed);
      }
      const cachedBriefs = localStorage.getItem('tims_briefs');
      if (cachedBriefs) {
        const parsed = JSON.parse(cachedBriefs);
        if (Array.isArray(parsed)) setBriefs(parsed);
      }
      const cachedNotifs = localStorage.getItem('tims_notifications');
      if (cachedNotifs) {
        const parsed = JSON.parse(cachedNotifs);
        if (Array.isArray(parsed)) setNotifications(parsed);
      }
      const cachedActivities = localStorage.getItem('tims_sales_activities');
      if (cachedActivities) {
        const parsed = JSON.parse(cachedActivities);
        if (Array.isArray(parsed)) setSalesActivities(parsed);
      }
    } catch {}

    // 2. Fetch authenticated session
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setCurrentUser(data.user);
          const allowed = getUserAllowedModules(data.user);
          const defaultSection: 'marketing' | 'commercial' | 'sales' =
            !allowed.includes('marketing') || data.user.role === 'sales'
              ? allowed.includes('commercial')
                ? 'commercial'
                : 'sales'
              : 'marketing';
          const restored = readPersistedNavValue(
            'tims_active_section',
            allowed,
            defaultSection,
            0
          );
          setActiveSection(restored);
        }
      })
      .catch(() => {})
      .finally(() => {
        setIsLoadingAuth(false);
      });
  }, []);

  // Control estricto de visibilidad:
  // - Administradores ven TODA la información de todos los compañeros.
  // - Usuarios normales ven únicamente su propia información (excepto el calendario compartido de eventos apartados).
  const isCurrentUserAdmin = isUserAdmin(currentUser);
  const allowedModules = useMemo(() => getUserAllowedModules(currentUser), [currentUser]);
  const effectiveSection: 'marketing' | 'commercial' | 'sales' = allowedModules.includes(activeSection)
    ? activeSection
    : (allowedModules[0] || 'commercial');

  const visibleDeals = useMemo(() => {
    if (!currentUser || isCurrentUserAdmin) return deals;
    return deals.filter((d) => matchesUserIdentity(currentUser, d.assignedEmail, d.assignedRep));
  }, [deals, currentUser, isCurrentUserAdmin]);

  const visibleCommercialTasks = useMemo(() => {
    if (!currentUser || isCurrentUserAdmin) return commercialTasks;
    return commercialTasks.filter(
      (t) =>
        matchesUserIdentity(currentUser, t.assignedEmail, t.assignedTo) ||
        matchesUserIdentity(currentUser, undefined, t.createdBy)
    );
  }, [commercialTasks, currentUser, isCurrentUserAdmin]);

  const visibleSalesActivities = useMemo(() => {
    if (!currentUser || isCurrentUserAdmin) return salesActivities;
    return salesActivities.filter((a) => matchesUserIdentity(currentUser, a.executiveEmail, a.executiveName));
  }, [salesActivities, currentUser, isCurrentUserAdmin]);

  const visibleMarketingTasks = useMemo(() => {
    if (!currentUser || isCurrentUserAdmin) return marketingTasks;
    return marketingTasks.filter(
      (t) =>
        matchesUserIdentity(currentUser, t.assignedEmail, t.assignedTo) ||
        matchesUserIdentity(currentUser, undefined, t.requestedBy)
    );
  }, [marketingTasks, currentUser, isCurrentUserAdmin]);

  const visibleCampaigns = useMemo(() => {
    if (!currentUser || isCurrentUserAdmin) return campaigns;
    return campaigns.filter((c) => matchesUserIdentity(currentUser, undefined, c.leadOwner));
  }, [campaigns, currentUser, isCurrentUserAdmin]);

  const visiblePublications = useMemo(() => {
    if (!currentUser || isCurrentUserAdmin) return publications;
    return publications.filter((p) => matchesUserIdentity(currentUser, undefined, p.responsible));
  }, [publications, currentUser, isCurrentUserAdmin]);

  const visibleBriefs = useMemo(() => {
    if (!currentUser || isCurrentUserAdmin) return briefs;
    return briefs.filter((b) => matchesUserIdentity(currentUser, undefined, b.author));
  }, [briefs, currentUser, isCurrentUserAdmin]);

  // 3. Sincronización en Tiempo Real con Postgres (solo para usuarios autenticados)
  useEffect(() => {
    if (!currentUser) return;

    const safeFetchJson = async (url: string) => {
      const res = await fetch(url, { cache: 'no-store' });
      if (res.status === 401) {
        setCurrentUser(null);
        return null;
      }
      if (!res.ok) return null;
      return res.json();
    };

    const SYNC_INTERVAL_MS = 25000;
    const USERS_SYNC_INTERVAL_MS = 120000;
    let lastSyncAt = 0;
    let lastUsersSyncAt = 0;
    let syncInterval: ReturnType<typeof setInterval> | null = null;

    const syncDataFromCloud = (force = false) => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        return;
      }
      const now = Date.now();
      // Evita ráfagas duplicadas cuando focus y visibilitychange se disparan juntos
      if (!force && now - lastSyncAt < 3000) {
        return;
      }
      lastSyncAt = now;

      // Sync Notifications con preservación de lectura local
      safeFetchJson('/api/notifications')
        .then((data) => {
          if (data && Array.isArray(data.notifications)) {
            setNotifications((prev) => {
              const localReadSet = new Set(prev.filter((n) => n.read).map((n) => n.id));
              const merged = data.notifications.map((n: AppNotification) => ({
                ...n,
                read: localReadSet.has(n.id) ? true : n.read
              }));
              try {
                localStorage.setItem('tims_notifications', JSON.stringify(merged));
              } catch {}
              return merged;
            });
          }
        })
        .catch(() => {});

      // Sync Deals
      safeFetchJson('/api/deals')
        .then((data) => {
          if (data && Array.isArray(data.deals)) {
            setDeals(data.deals);
            try {
              localStorage.setItem('tims_deals', JSON.stringify(data.deals));
            } catch {}
          }
        })
        .catch(() => {});

      // Sync Marketing Tasks
      safeFetchJson('/api/marketing-tasks')
        .then((data) => {
          if (data && Array.isArray(data.tasks)) {
            setMarketingTasks(data.tasks);
            try {
              localStorage.setItem('tims_mkt_tasks', JSON.stringify(data.tasks));
            } catch {}
          }
        })
        .catch(() => {});

      // Sync Commercial Tasks
      safeFetchJson('/api/commercial-tasks')
        .then((data) => {
          if (data && Array.isArray(data.tasks)) {
            setCommercialTasks(data.tasks);
            try {
              localStorage.setItem('tims_commercial_tasks', JSON.stringify(data.tasks));
            } catch {}
          }
        })
        .catch(() => {});

      // Sync Registered Users cada ~2 minutos (cambia con poca frecuencia)
      if (now - lastUsersSyncAt >= USERS_SYNC_INTERVAL_MS) {
        lastUsersSyncAt = now;
        safeFetchJson('/api/users')
          .then((data) => {
            if (data && Array.isArray(data.users)) {
              setRegisteredUsers(data.users);
            }
          })
          .catch(() => {});
      }

      // Sync Campaigns
      safeFetchJson('/api/campaigns')
        .then((data) => {
          if (data && Array.isArray(data.campaigns)) {
            setCampaigns(data.campaigns);
            try {
              localStorage.setItem('tims_campaigns', JSON.stringify(data.campaigns));
            } catch {}
          }
        })
        .catch(() => {});

      // Sync Publications
      safeFetchJson('/api/publications')
        .then((data) => {
          if (data && Array.isArray(data.publications)) {
            setPublications(data.publications);
            try {
              localStorage.setItem('tims_publications', JSON.stringify(data.publications));
            } catch {}
          }
        })
        .catch(() => {});

      // Sync Briefs
      safeFetchJson('/api/briefs')
        .then((data) => {
          if (data && Array.isArray(data.briefs)) {
            setBriefs(data.briefs);
            try {
              localStorage.setItem('tims_briefs', JSON.stringify(data.briefs));
            } catch {}
          }
        })
        .catch(() => {});

      // Sync Sales Activities
      safeFetchJson('/api/sales-activities')
        .then((data) => {
          if (data && Array.isArray(data.activities)) {
            setSalesActivities(data.activities);
            try {
              localStorage.setItem('tims_sales_activities', JSON.stringify(data.activities));
            } catch {}
          }
        })
        .catch(() => {});
    };

    const startPolling = () => {
      if (syncInterval) return;
      syncInterval = setInterval(() => syncDataFromCloud(), SYNC_INTERVAL_MS);
    };

    const stopPolling = () => {
      if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
      }
    };

    // Consulta inicial inmediata al autenticarse (si la pestaña está visible)
    syncDataFromCloud(true);
    if (typeof document === 'undefined' || document.visibilityState === 'visible') {
      startPolling();
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        stopPolling();
      } else {
        syncDataFromCloud();
        startPolling();
      }
    };

    const onWindowFocus = () => {
      syncDataFromCloud();
      startPolling();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', onWindowFocus);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', onWindowFocus);
    };
  }, [currentUser]);

  const handleLogout = async () => {
    setCurrentUser(null);
    try {
      // Limpiar datos sensibles y PII en caché local
      localStorage.removeItem('tims_deals');
      localStorage.removeItem('tims_mkt_tasks');
      localStorage.removeItem('tims_commercial_tasks');
      localStorage.removeItem('tims_campaigns');
      localStorage.removeItem('tims_publications');
      localStorage.removeItem('tims_briefs');
      localStorage.removeItem('tims_notifications');
      localStorage.removeItem('tims_sales_activities');
      clearPersistedNavValues();
    } catch {}
    try {
      await fetch('/api/auth/logout');
    } catch {}
    window.location.href = '/';
  };

  // -----------------------------------------------------------------
  // NOTIFICATIONS ACTIONS (PERSONAL & ADMIN) CON DEDUPLICACIÓN ESTRICTA
  // -----------------------------------------------------------------
  // Registro de notificaciones a las que ya se les mostró Toast para que NUNCA se repitan
  const displayedToastIdsRef = useRef<Set<string>>(new Set());

  const handleAddNotification = async (notif: AppNotification) => {
    // Si ya existe en la lista, no duplicarla jamás
    if (notifications.some((n) => n.id === notif.id)) {
      return;
    }

    const nextList = [notif, ...notifications];
    setNotifications(nextList);
    try {
      localStorage.setItem('tims_notifications', JSON.stringify(nextList));
    } catch {}

    // Toast visible únicamente si la notificación va dirigida al usuario actual
    if (!displayedToastIdsRef.current.has(notif.id)) {
      displayedToastIdsRef.current.add(notif.id);
      const isTarget = matchesUserIdentity(currentUser, notif.targetEmail, notif.targetName);
      if (isTarget) {
        showToast(`🔔 ${notif.title}: ${notif.message.slice(0, 55)}...`);
      }
    }

    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notif)
      });
    } catch (err) {
      console.error('Error saving notification:', err);
    }
  };

  const handleSelectNotification = async (notif: AppNotification) => {
    // 1. Marcar como leída de inmediato en estado y local
    const nextList = notifications.map((n) => (n.id === notif.id ? { ...n, read: true } : n));
    setNotifications(nextList);
    try {
      localStorage.setItem('tims_notifications', JSON.stringify(nextList));
    } catch {}

    // 2. Persistir permanentemente en base de datos para que no vuelva a aparecer como no leída
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: notif.id, read: true })
      });
    } catch (err) {
      console.error('Error updating notification read in DB:', err);
    }

    // 3. Navegar y enfocar el elemento correspondiente
    if (notif.linkSection === 'commercial') {
      navigateToSection('commercial');
      if (notif.targetId) {
        setSelectedDealId(notif.targetId);
      }
    } else if (notif.linkSection === 'marketing') {
      navigateToSection('marketing');
    } else if (notif.linkSection === 'sales') {
      navigateToSection('sales');
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    const nextList = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(nextList);
    try {
      localStorage.setItem('tims_notifications', JSON.stringify(nextList));
    } catch {}
    showToast('Todas las notificaciones marcadas como leídas');

    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true })
      });
    } catch (err) {
      console.error('Error marking all notifications read in DB:', err);
    }
  };

  // Notificaciones automáticas personales y únicas (eventos propios próximos + tareas importantes por vencer + seguimientos de hoy)
  const notifiedEventsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!currentUser) return;

    try {
      const saved = localStorage.getItem('tims_notified_upcoming_events');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed.forEach((id: string) => notifiedEventsRef.current.add(id));
        }
      }
    } catch {}

    const todayStr = getLocalDateStr();
    const todayMs = new Date(`${todayStr}T00:00:00`).getTime();

    const emitOnce = (notif: AppNotification) => {
      if (notifiedEventsRef.current.has(notif.id)) return;
      if (notifications.some((n) => n.id === notif.id)) {
        notifiedEventsRef.current.add(notif.id);
        return;
      }
      notifiedEventsRef.current.add(notif.id);
      try {
        localStorage.setItem(
          'tims_notified_upcoming_events',
          JSON.stringify(Array.from(notifiedEventsRef.current))
        );
      } catch {}
      handleAddNotification(notif);
    };

    // 1. Eventos propios próximos (<= 7 días)
    visibleDeals.forEach((deal) => {
      if (deal.stage === 'perdido' || !deal.checkInDate) return;
      if (!matchesUserIdentity(currentUser, deal.assignedEmail, deal.assignedRep)) return;

      const checkInMs = new Date(`${deal.checkInDate}T00:00:00`).getTime();
      const diffDays = Math.ceil((checkInMs - todayMs) / (1000 * 3600 * 24));
      if (diffDays < 0 || diffDays > 7) return;

      const daysLabel = diffDays === 0 ? '¡HOY!' : diffDays === 1 ? '¡Mañana!' : `en ${diffDays} días (${deal.checkInDate})`;
      const paymentNote = deal.paymentStatus !== 'liquidado' ? ' Tiene saldo pendiente.' : '';

      emitOnce({
        id: `upcoming-event-${deal.id}-${deal.checkInDate}`,
        title: `⏰ Evento próximo: ${deal.companyOrAgency}`,
        message: `Tu evento en ${deal.hotelName} inicia ${daysLabel}.${paymentNote}`,
        type: 'event_active',
        targetEmail: currentUser.email,
        targetName: currentUser.name,
        authorName: 'Sistema TIMS',
        linkSection: 'commercial',
        targetId: deal.id,
        createdAt: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        read: false
      });
    });

    // 2. Tareas comerciales importantes propias por vencer (<= 2 días) o vencidas
    commercialTasks.forEach((task) => {
      if (task.stage === 'terminada' || task.stage === 'cancelada' || !task.dueDate) return;
      if (task.priority !== 'alta' && task.priority !== 'urgente') return;
      if (!matchesUserIdentity(currentUser, task.assignedEmail, task.assignedTo)) return;

      const dueMs = new Date(`${task.dueDate}T00:00:00`).getTime();
      const diffDays = Math.ceil((dueMs - todayMs) / (1000 * 3600 * 24));
      if (diffDays > 2) return;

      const dueLabel = diffDays < 0 ? 'vencida' : diffDays === 0 ? 'vence HOY' : `vence en ${diffDays} día(s)`;
      emitOnce({
        id: `due-ctask-${task.id}-${task.dueDate}`,
        title: `📌 Tarea prioritaria ${dueLabel}`,
        message: `"${task.title}" (${task.hotelTarget}).`,
        type: 'task_created',
        targetEmail: currentUser.email,
        targetName: currentUser.name,
        authorName: 'Sistema TIMS',
        linkSection: 'commercial',
        targetId: task.id,
        createdAt: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        read: false
      });
    });

    // 3. Requerimientos de marketing importantes propios por vencer (<= 2 días) o vencidos
    marketingTasks.forEach((task) => {
      if (task.stage === 'aprobado' || !task.dueDate) return;
      if (task.priority !== 'alta' && task.priority !== 'urgente') return;
      if (!matchesUserIdentity(currentUser, task.assignedEmail, task.assignedTo)) return;

      const dueMs = new Date(`${task.dueDate}T00:00:00`).getTime();
      const diffDays = Math.ceil((dueMs - todayMs) / (1000 * 3600 * 24));
      if (diffDays > 2) return;

      const dueLabel = diffDays < 0 ? 'vencido' : diffDays === 0 ? 'vence HOY' : `vence en ${diffDays} día(s)`;
      emitOnce({
        id: `due-mtask-${task.id}-${task.dueDate}`,
        title: `🎨 Requerimiento prioritario ${dueLabel}`,
        message: `"${task.title}" (${task.hotelTarget}).`,
        type: 'task_created',
        targetEmail: currentUser.email,
        targetName: currentUser.name,
        authorName: 'Sistema TIMS',
        linkSection: 'marketing',
        targetId: task.id,
        createdAt: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        read: false
      });
    });

    // 4. Seguimientos de ventas programados para hoy
    salesActivities.forEach((act) => {
      if (!act.nextDate || act.nextDate !== todayStr) return;
      if (!matchesUserIdentity(currentUser, act.executiveEmail, act.executiveName)) return;

      emitOnce({
        id: `followup-sales-${act.id}-${todayStr}`,
        title: `🔄 Seguimiento programado hoy`,
        message: `${act.clientName || 'Cliente'}${act.nextAction ? `: ${act.nextAction}` : ''}`,
        type: 'task_created',
        targetEmail: currentUser.email,
        targetName: currentUser.name,
        authorName: 'Sistema TIMS',
        linkSection: 'sales',
        targetId: act.id,
        createdAt: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        read: false
      });
    });
  }, [visibleDeals, commercialTasks, marketingTasks, salesActivities, currentUser]);

  // -----------------------------------------------------------------
  // MARKETING ACTIONS (WITH DB PERSISTENCE)
  // -----------------------------------------------------------------
  const handleAddCampaign = async (
    newC: Omit<MarketingCampaign, 'id' | 'code' | 'spent'>
  ) => {
    const nextCode = `MKT-${101 + campaigns.length}`;
    const created: MarketingCampaign = {
      ...newC,
      id: `cmp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      code: nextCode,
      spent: 0
    };
    const nextList = [created, ...campaigns];
    setCampaigns(nextList);
    try { localStorage.setItem('tims_campaigns', JSON.stringify(nextList)); } catch {}
    showToast(`Campaña ${nextCode} guardada en Postgres`);

    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(created)
      });
      const data = await res.json();
      if (data?.campaign) {
        setCampaigns((prev) => {
          const updated = prev.map((c) => (c.id === created.id ? data.campaign : c));
          try { localStorage.setItem('tims_campaigns', JSON.stringify(updated)); } catch {}
          return updated;
        });
      }
    } catch (err) {
      console.error('Error persisting campaign:', err);
    }
  };

  const handleUpdateCampaign = async (updated: MarketingCampaign) => {
    const nextList = campaigns.map((c) => (c.id === updated.id ? updated : c));
    setCampaigns(nextList);
    try { localStorage.setItem('tims_campaigns', JSON.stringify(nextList)); } catch {}
    showToast(`Campaña ${updated.code} sincronizada en Postgres`);

    try {
      await fetch(`/api/campaigns/${updated.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch (err) {
      console.error('Error updating campaign in DB:', err);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    const nextList = campaigns.filter((c) => c.id !== id);
    setCampaigns(nextList);
    try { localStorage.setItem('tims_campaigns', JSON.stringify(nextList)); } catch {}
    showToast('Campaña eliminada de Postgres');

    try {
      await fetch(`/api/campaigns/${id}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error('Error deleting campaign from DB:', err);
    }
  };

  const handleUpdateCampaignStatus = async (id: string, status: MarketingCampaignStatus) => {
    const nextList = campaigns.map((c) => (c.id === id ? { ...c, status } : c));
    setCampaigns(nextList);
    try { localStorage.setItem('tims_campaigns', JSON.stringify(nextList)); } catch {}
    showToast('Estado de campaña actualizado en tiempo real');

    try {
      await fetch(`/api/campaigns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    } catch (err) {
      console.error('Error updating campaign status in DB:', err);
    }
  };

  const handleAddPublication = async (newP: Omit<ContentPublication, 'id'>) => {
    const created: ContentPublication = {
      ...newP,
      id: `pub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    };
    const nextList = [created, ...publications];
    setPublications(nextList);
    try { localStorage.setItem('tims_publications', JSON.stringify(nextList)); } catch {}
    showToast('Publicación programada y guardada en Postgres');

    try {
      const res = await fetch('/api/publications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(created)
      });
      const data = await res.json();
      if (data?.pub) {
        setPublications((prev) => {
          const updated = prev.map((p) => (p.id === created.id ? data.pub : p));
          try { localStorage.setItem('tims_publications', JSON.stringify(updated)); } catch {}
          return updated;
        });
      }
    } catch (err) {
      console.error('Error persisting publication:', err);
    }
  };

  const handleUpdatePublication = async (updated: ContentPublication) => {
    const nextList = publications.map((p) => (p.id === updated.id ? updated : p));
    setPublications(nextList);
    try { localStorage.setItem('tims_publications', JSON.stringify(nextList)); } catch {}
    showToast('Publicación actualizada en Postgres');

    try {
      await fetch(`/api/publications/${updated.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch (err) {
      console.error('Error updating publication in DB:', err);
    }
  };

  const handleDeletePublication = async (id: string) => {
    const nextList = publications.filter((p) => p.id !== id);
    setPublications(nextList);
    try { localStorage.setItem('tims_publications', JSON.stringify(nextList)); } catch {}
    showToast('Publicación eliminada correctamente');

    try {
      await fetch(`/api/publications/${id}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error('Error deleting publication from DB:', err);
    }
  };

  const handleAddBrief = async (newB: Omit<CreativeBrief, 'id' | 'date'>) => {
    const created: CreativeBrief = {
      ...newB,
      id: `brf-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      date: getLocalDateStr()
    };
    const nextList = [created, ...briefs];
    setBriefs(nextList);
    try { localStorage.setItem('tims_briefs', JSON.stringify(nextList)); } catch {}
    showToast('Brief creativo archivado en Postgres');

    try {
      const res = await fetch('/api/briefs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(created)
      });
      const data = await res.json();
      if (data?.brief) {
        setBriefs((prev) => {
          const updated = prev.map((b) => (b.id === created.id ? data.brief : b));
          try { localStorage.setItem('tims_briefs', JSON.stringify(updated)); } catch {}
          return updated;
        });
      }
    } catch (err) {
      console.error('Error persisting brief in DB:', err);
    }
  };

  const handleUpdateBrief = async (updated: CreativeBrief) => {
    const nextList = briefs.map((b) => (b.id === updated.id ? updated : b));
    setBriefs(nextList);
    try { localStorage.setItem('tims_briefs', JSON.stringify(nextList)); } catch {}
    showToast('Brief creativo actualizado en Postgres');

    try {
      await fetch(`/api/briefs/${updated.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch (err) {
      console.error('Error updating brief in DB:', err);
    }
  };

  const handleDeleteBrief = async (id: string) => {
    const nextList = briefs.filter((b) => b.id !== id);
    setBriefs(nextList);
    try { localStorage.setItem('tims_briefs', JSON.stringify(nextList)); } catch {}
    showToast('Brief eliminado de la base de datos');

    try {
      await fetch(`/api/briefs/${id}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error('Error deleting brief from DB:', err);
    }
  };

  const handleAddMarketingTask = async (newTask: Omit<MarketingTask, 'id' | 'code' | 'createdAt'>) => {
    const nextCode = `REQ-${String(marketingTasks.length + 1).padStart(2, '0')}`;
    const created: MarketingTask = {
      ...newTask,
      id: `mtask-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      code: nextCode,
      createdAt: getLocalDateStr()
    };
    const nextList = [created, ...marketingTasks];
    setMarketingTasks(nextList);
    try {
      localStorage.setItem('tims_mkt_tasks', JSON.stringify(nextList));
    } catch {}
    showToast(`Requerimiento ${nextCode} guardado en Postgres`);

    try {
      const res = await fetch('/api/marketing-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(created)
      });
      const data = await res.json();
      if (data?.task) {
        setMarketingTasks((prev) => {
          const updated = prev.map((t) => (t.id === created.id ? data.task : t));
          try { localStorage.setItem('tims_mkt_tasks', JSON.stringify(updated)); } catch {}
          return updated;
        });
      }
    } catch (err) {
      console.error('Error persisting marketing task:', err);
    }
  };

  const handleUpdateMarketingTask = async (updatedTask: MarketingTask) => {
    const nextList = marketingTasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
    setMarketingTasks(nextList);
    try {
      localStorage.setItem('tims_mkt_tasks', JSON.stringify(nextList));
    } catch {}
    showToast(`Requerimiento ${updatedTask.code} actualizado en base de datos`);

    try {
      await fetch(`/api/marketing-tasks/${updatedTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask)
      });
    } catch (err) {
      console.error('Error updating task in DB:', err);
    }
  };

  const handleDeleteMarketingTask = async (taskId: string) => {
    const nextList = marketingTasks.filter((t) => t.id !== taskId);
    setMarketingTasks(nextList);
    try {
      localStorage.setItem('tims_mkt_tasks', JSON.stringify(nextList));
    } catch {}
    showToast('Requerimiento eliminado de la base de datos');

    try {
      await fetch(`/api/marketing-tasks/${taskId}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error('Error deleting task in DB:', err);
    }
  };

  const handleUpdateMarketingTaskStage = async (id: string, stage: MarketingTaskStage) => {
    const nextList = marketingTasks.map((t) => (t.id === id ? { ...t, stage } : t));
    setMarketingTasks(nextList);
    try {
      localStorage.setItem('tims_mkt_tasks', JSON.stringify(nextList));
    } catch {}
    showToast('Fase actualizada y sincronizada en Postgres');

    try {
      await fetch(`/api/marketing-tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage })
      });
    } catch (err) {
      console.error('Error updating task stage in DB:', err);
    }
  };

  // -----------------------------------------------------------------
  // COMERCIALIZACIÓN HOTELERA ACTIONS (WITH DB PERSISTENCE)
  // -----------------------------------------------------------------
  const handleAddDeal = async (newD: Omit<HotelDeal, 'id' | 'code' | 'createdAt'>) => {
    const nextCode = `RFP-${501 + deals.length}`;
    const created: HotelDeal = {
      ...newD,
      id: `deal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      code: nextCode,
      createdAt: getLocalDateStr()
    };
    const nextList = [created, ...deals];
    setDeals(nextList);
    try {
      localStorage.setItem('tims_deals', JSON.stringify(nextList));
    } catch {}

    try {
      const res = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(created)
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        showToast(`⚠️ Error al guardar evento en BD: ${data?.error || res.statusText}`);
        return;
      }
      showToast(`Cotización / Evento ${nextCode} guardado en Postgres`);
      if (data?.deal) {
        setDeals((prev) => {
          const updated = prev.map((d) => (d.id === created.id ? data.deal : d));
          try {
            localStorage.setItem('tims_deals', JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }
    } catch (err) {
      console.error('Error saving deal to DB:', err);
      showToast('⚠️ No se pudo conectar con la base de datos al guardar el evento');
    }
  };

  const handleUpdateDeal = async (updatedDeal: HotelDeal) => {
    const nextList = deals.map((d) => (d.id === updatedDeal.id ? updatedDeal : d));
    setDeals(nextList);
    try {
      localStorage.setItem('tims_deals', JSON.stringify(nextList));
    } catch {}
    showToast(`Evento ${updatedDeal.code} actualizado en Postgres`);

    try {
      await fetch(`/api/deals/${updatedDeal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedDeal)
      });
    } catch (err) {
      console.error('Error updating deal in DB:', err);
    }
  };

  const handleDeleteDeal = async (dealId: string) => {
    const nextList = deals.filter((d) => d.id !== dealId);
    setDeals(nextList);
    try {
      localStorage.setItem('tims_deals', JSON.stringify(nextList));
    } catch {}
    showToast('Evento eliminado de la base de datos');

    try {
      await fetch(`/api/deals/${dealId}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error('Error deleting deal from DB:', err);
    }
  };

  const handleUpdateDealStage = async (id: string, stage: HotelDealStage) => {
    const nextList = deals.map((d) => (d.id === id ? { ...d, stage } : d));
    setDeals(nextList);
    try {
      localStorage.setItem('tims_deals', JSON.stringify(nextList));
    } catch {}
    showToast('Etapa de negociación guardada en Postgres');

    try {
      await fetch(`/api/deals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage })
      });
    } catch (err) {
      console.error('Error updating deal stage in DB:', err);
    }
  };

  // -----------------------------------------------------------------
  // TAREAS COMERCIALES ACTIONS (WITH POSTGRES & LOCAL PERSISTENCE)
  // -----------------------------------------------------------------
  const handleAddCommercialTask = async (newTask: Omit<CommercialTask, 'id' | 'code' | 'createdAt'>) => {
    const nextCode = `TK-${String(commercialTasks.length + 1).padStart(2, '0')}`;
    const created: CommercialTask = {
      ...newTask,
      id: `ctask-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      code: nextCode,
      createdAt: getLocalDateStr()
    };
    const nextList = [created, ...commercialTasks];
    setCommercialTasks(nextList);
    try {
      localStorage.setItem('tims_commercial_tasks', JSON.stringify(nextList));
    } catch {}
    showToast('Tarea comercial asignada con éxito');

    try {
      const res = await fetch('/api/commercial-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(created)
      });
      const data = await res.json();
      if (data?.task) {
        setCommercialTasks((prev) => {
          const updated = prev.map((t) => (t.id === created.id ? data.task : t));
          try {
            localStorage.setItem('tims_commercial_tasks', JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }
    } catch (err) {
      console.error('Error saving commercial task to DB:', err);
    }
  };

  const handleUpdateCommercialTask = async (updatedTask: CommercialTask) => {
    const nextList = commercialTasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
    setCommercialTasks(nextList);
    try {
      localStorage.setItem('tims_commercial_tasks', JSON.stringify(nextList));
    } catch {}
    showToast('Tarea comercial actualizada');

    try {
      await fetch(`/api/commercial-tasks/${updatedTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask)
      });
    } catch (err) {
      console.error('Error updating commercial task in DB:', err);
    }
  };

  const handleDeleteCommercialTask = async (taskId: string) => {
    const nextList = commercialTasks.filter((t) => t.id !== taskId);
    setCommercialTasks(nextList);
    try {
      localStorage.setItem('tims_commercial_tasks', JSON.stringify(nextList));
    } catch {}
    showToast('Tarea comercial eliminada');

    try {
      await fetch(`/api/commercial-tasks/${taskId}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error('Error deleting commercial task in DB:', err);
    }
  };

  const handleUpdateCommercialTaskStage = async (id: string, stage: CommercialTaskStage) => {
    const nextList = commercialTasks.map((t) => (t.id === id ? { ...t, stage } : t));
    setCommercialTasks(nextList);
    try {
      localStorage.setItem('tims_commercial_tasks', JSON.stringify(nextList));
    } catch {}
    showToast('Fase de tarea comercial actualizada');

    try {
      await fetch(`/api/commercial-tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage })
      });
    } catch (err) {
      console.error('Error updating commercial task stage in DB:', err);
    }
  };

  // Sales Activities Handlers (Tablero de Tareas y Cierre de Ventas)
  const handleAddSalesActivity = async (activity: Omit<SalesActivity, 'id' | 'createdAt'>) => {
    const created: SalesActivity = {
      ...activity,
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString()
    };

    setSalesActivities((prev) => {
      const nextList = [created, ...prev];
      try {
        localStorage.setItem('tims_sales_activities', JSON.stringify(nextList));
      } catch {}
      return nextList;
    });
    showToast('Actividad registrada correctamente');

    try {
      const res = await fetch('/api/sales-activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(created)
      });
      const data = await res.json();
      if (data?.activity) {
        setSalesActivities((prev) => {
          const updated = prev.map((a) => (a.id === created.id ? data.activity : a));
          try {
            localStorage.setItem('tims_sales_activities', JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }
    } catch (err) {
      console.error('Error adding sales activity to DB:', err);
    }
  };

  const handleUpdateSalesActivity = async (activity: SalesActivity) => {
    try {
      const res = await fetch('/api/sales-activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activity)
      });
      const data = await res.json();
      if (data?.activity) {
        setSalesActivities((prev) => {
          const updated = prev.map((a) => (a.id === activity.id ? data.activity : a));
          try {
            localStorage.setItem('tims_sales_activities', JSON.stringify(updated));
          } catch {}
          return updated;
        });
        showToast('Actividad actualizada');
      }
    } catch (err) {
      console.error('Error updating sales activity:', err);
    }
  };

  const handleDeleteSalesActivity = async (activityId: string) => {
    try {
      setSalesActivities((prev) => {
        const filtered = prev.filter((a) => a.id !== activityId);
        try {
          localStorage.setItem('tims_sales_activities', JSON.stringify(filtered));
        } catch {}
        return filtered;
      });
      showToast('Actividad eliminada');
      await fetch(`/api/sales-activities/${activityId}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error('Error deleting sales activity:', err);
    }
  };

  // Loading state
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-stone-400 font-mono tracking-wider uppercase">Cargando Portal TIMS...</span>
        </div>
      </div>
    );
  }

  // AUTH GATE: Si no está autenticado, solo ve la pantalla de acceso
  if (!currentUser) {
    return <AuthGate />;
  }

  // USUARIO AUTENTICADO: Acceso completo a la plataforma
  return (
    <div className="min-h-screen bg-stone-50/60 text-slate-900 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2.5 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        activeSection={effectiveSection}
        onSectionChange={navigateToSection}
        onLogout={handleLogout}
        deals={visibleDeals}
        notifications={notifications}
        onSelectDeal={handleSelectUpcomingDeal}
        onSelectNotification={handleSelectNotification}
        onMarkAllAsRead={handleMarkAllNotificationsRead}
      />

      {/* Section Content */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-8">
        {effectiveSection === 'marketing' ? (
          <MarketingSection
            campaigns={visibleCampaigns}
            publications={visiblePublications}
            briefs={visibleBriefs}
            marketingTasks={visibleMarketingTasks}
            deals={deals}
            currentUser={currentUser}
            onAddCampaign={handleAddCampaign}
            onUpdateCampaign={handleUpdateCampaign}
            onDeleteCampaign={handleDeleteCampaign}
            onUpdateCampaignStatus={handleUpdateCampaignStatus}
            onAddPublication={handleAddPublication}
            onUpdatePublication={handleUpdatePublication}
            onDeletePublication={handleDeletePublication}
            onAddBrief={handleAddBrief}
            onUpdateBrief={handleUpdateBrief}
            onDeleteBrief={handleDeleteBrief}
            onAddMarketingTask={handleAddMarketingTask}
            onUpdateMarketingTask={handleUpdateMarketingTask}
            onDeleteMarketingTask={handleDeleteMarketingTask}
            onUpdateMarketingTaskStage={handleUpdateMarketingTaskStage}
            onAddNotification={handleAddNotification}
          />
        ) : effectiveSection === 'commercial' ? (
          <CommercialSection
            deals={visibleDeals}
            allDealsForCalendar={deals}
            commercialTasks={visibleCommercialTasks}
            currentUser={currentUser}
            registeredUsers={registeredUsers}
            selectedDealId={selectedDealId}
            onClearSelectedDealId={() => setSelectedDealId(null)}
            onAddDeal={handleAddDeal}
            onUpdateDeal={handleUpdateDeal}
            onDeleteDeal={handleDeleteDeal}
            onUpdateDealStage={handleUpdateDealStage}
            onAddCommercialTask={handleAddCommercialTask}
            onUpdateCommercialTask={handleUpdateCommercialTask}
            onDeleteCommercialTask={handleDeleteCommercialTask}
            onUpdateCommercialTaskStage={handleUpdateCommercialTaskStage}
            onAddNotification={handleAddNotification}
          />
        ) : (
          <SalesSection
            activities={visibleSalesActivities}
            currentUser={currentUser}
            registeredUsers={registeredUsers}
            deals={deals}
            onAddActivity={handleAddSalesActivity}
            onUpdateActivity={handleUpdateSalesActivity}
            onDeleteActivity={handleDeleteSalesActivity}
          />
        )}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-stone-200 bg-white py-4 px-6 text-xs text-stone-500">
        <div className="max-w-[1720px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-medium">
            <span className="font-editorial text-slate-900 font-bold text-sm">TIMS</span>
            <span>· Sistema Operativo de Hospitalidad, Marketing & Comercialización</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-stone-400">
            <span>Grupo Hotelero 2026</span>
            <span>·</span>
            <span>Neon Postgres Realtime</span>
            <span>·</span>
            <span>Google Workspace Auth</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
