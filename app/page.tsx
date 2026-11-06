'use client';

import React, { useState, useEffect } from 'react';
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
  isAdminEmail
} from '@/lib/types';

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

  const handleSelectUpcomingDeal = (deal: HotelDeal) => {
    setActiveSection('commercial');
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
          if (data.user.role === 'sales') {
            setActiveSection('commercial');
          } else {
            setActiveSection('marketing');
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        setIsLoadingAuth(false);
      });
  }, []);

  // 3. Sincronización en Tiempo Real con Postgres (solo para usuarios autenticados)
  useEffect(() => {
    if (!currentUser) return;

    const syncDataFromCloud = () => {
      // Sync Notifications
      fetch('/api/notifications')
        .then((res) => res.json())
        .then((data) => {
          if (data && Array.isArray(data.notifications)) {
            setNotifications(data.notifications);
            try {
              localStorage.setItem('tims_notifications', JSON.stringify(data.notifications));
            } catch {}
          }
        })
        .catch(() => {});

      // Sync Deals
      fetch('/api/deals')
        .then((res) => res.json())
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
      fetch('/api/marketing-tasks')
        .then((res) => res.json())
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
      fetch('/api/commercial-tasks')
        .then((res) => res.json())
        .then((data) => {
          if (data && Array.isArray(data.tasks)) {
            setCommercialTasks(data.tasks);
            try {
              localStorage.setItem('tims_commercial_tasks', JSON.stringify(data.tasks));
            } catch {}
          }
        })
        .catch(() => {});

      // Sync Registered Users (para asignaciones y perfiles)
      fetch('/api/users')
        .then((res) => res.json())
        .then((data) => {
          if (data && Array.isArray(data.users)) {
            setRegisteredUsers(data.users);
          }
        })
        .catch(() => {});

      // Sync Campaigns
      fetch('/api/campaigns')
        .then((res) => res.json())
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
      fetch('/api/publications')
        .then((res) => res.json())
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
      fetch('/api/briefs')
        .then((res) => res.json())
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
      fetch('/api/sales-activities')
        .then((res) => res.json())
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

    // Consulta inicial inmediata al autenticarse
    syncDataFromCloud();

    // Sincronización recurrente en segundo plano (cada 8 segundos y cuando la ventana toma foco)
    const syncInterval = setInterval(syncDataFromCloud, 8000);
    const onWindowFocus = () => syncDataFromCloud();
    window.addEventListener('focus', onWindowFocus);

    return () => {
      clearInterval(syncInterval);
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
    } catch {}
    try {
      await fetch('/api/auth/logout');
    } catch {}
    window.location.href = '/';
  };

  // -----------------------------------------------------------------
  // NOTIFICATIONS ACTIONS (PERSONAL & ADMIN)
  // -----------------------------------------------------------------
  const handleAddNotification = async (notif: AppNotification) => {
    const nextList = [notif, ...notifications];
    setNotifications(nextList);
    try {
      localStorage.setItem('tims_notifications', JSON.stringify(nextList));
    } catch {}

    // Toast visible para el usuario si es el destinatario personal o si es administrador
    const isTarget = notif.targetEmail && currentUser?.email && notif.targetEmail.toLowerCase().trim() === currentUser.email.toLowerCase().trim();
    const isAdmin = isAdminEmail(currentUser?.email);
    if (isTarget || isAdmin) {
      showToast(`🔔 ${notif.title}: ${notif.message.slice(0, 55)}...`);
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

  const handleSelectNotification = (notif: AppNotification) => {
    // Marcar como leída
    const nextList = notifications.map((n) => (n.id === notif.id ? { ...n, read: true } : n));
    setNotifications(nextList);
    try {
      localStorage.setItem('tims_notifications', JSON.stringify(nextList));
    } catch {}

    // Navegar y enfocar el elemento correspondiente
    if (notif.linkSection === 'commercial') {
      setActiveSection('commercial');
      if (notif.targetId) {
        setSelectedDealId(notif.targetId);
      }
    } else if (notif.linkSection === 'marketing') {
      setActiveSection('marketing');
    }
  };

  const handleMarkAllNotificationsRead = () => {
    const nextList = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(nextList);
    try {
      localStorage.setItem('tims_notifications', JSON.stringify(nextList));
    } catch {}
    showToast('Todas las notificaciones marcadas como leídas');
  };

  // -----------------------------------------------------------------
  // MARKETING ACTIONS (WITH DB PERSISTENCE)
  // -----------------------------------------------------------------
  const handleAddCampaign = async (
    newC: Omit<MarketingCampaign, 'id' | 'code' | 'spent'>
  ) => {
    const nextCode = `MKT-${101 + campaigns.length}`;
    const created: MarketingCampaign = {
      ...newC,
      id: `cmp-${Date.now()}`,
      code: nextCode,
      spent: 0
    };
    const nextList = [created, ...campaigns];
    setCampaigns(nextList);
    try { localStorage.setItem('tims_campaigns', JSON.stringify(nextList)); } catch {}
    showToast(`Campaña ${nextCode} guardada en Postgres`);

    try {
      await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(created)
      });
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
      id: `pub-${Date.now()}`
    };
    const nextList = [created, ...publications];
    setPublications(nextList);
    try { localStorage.setItem('tims_publications', JSON.stringify(nextList)); } catch {}
    showToast('Publicación programada y guardada en Postgres');

    try {
      await fetch('/api/publications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(created)
      });
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
      id: `brf-${Date.now()}`,
      date: new Date().toISOString().split('T')[0]
    };
    const nextList = [created, ...briefs];
    setBriefs(nextList);
    try { localStorage.setItem('tims_briefs', JSON.stringify(nextList)); } catch {}
    showToast('Brief creativo archivado en Postgres');

    try {
      await fetch('/api/briefs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(created)
      });
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
      id: `mtask-${Date.now()}`,
      code: nextCode,
      createdAt: new Date().toISOString().split('T')[0]
    };
    const nextList = [created, ...marketingTasks];
    setMarketingTasks(nextList);
    try {
      localStorage.setItem('tims_mkt_tasks', JSON.stringify(nextList));
    } catch {}
    showToast(`Requerimiento ${nextCode} guardado en Postgres`);

    try {
      await fetch('/api/marketing-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(created)
      });
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
      id: `deal-${Date.now()}`,
      code: nextCode,
      createdAt: new Date().toISOString().split('T')[0]
    };
    const nextList = [created, ...deals];
    setDeals(nextList);
    try {
      localStorage.setItem('tims_deals', JSON.stringify(nextList));
    } catch {}
    showToast(`Cotización ${nextCode} guardada en Postgres`);

    try {
      await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(created)
      });
    } catch (err) {
      console.error('Error saving deal to DB:', err);
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
      id: `ctask-${Date.now()}`,
      code: nextCode,
      createdAt: new Date().toISOString().split('T')[0]
    };
    const nextList = [created, ...commercialTasks];
    setCommercialTasks(nextList);
    try {
      localStorage.setItem('tims_commercial_tasks', JSON.stringify(nextList));
    } catch {}
    showToast('Tarea comercial asignada con éxito');

    try {
      await fetch('/api/commercial-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(created)
      });
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
    try {
      const res = await fetch('/api/sales-activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activity)
      });
      const data = await res.json();
      if (data?.activity) {
        setSalesActivities((prev) => [data.activity, ...prev]);
        try {
          localStorage.setItem('tims_sales_activities', JSON.stringify([data.activity, ...salesActivities]));
        } catch {}
        showToast('Actividad registrada correctamente');
      }
    } catch (err) {
      console.error('Error adding sales activity:', err);
      showToast('Error al registrar actividad');
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
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onLogout={handleLogout}
        deals={deals}
        notifications={notifications}
        onSelectDeal={handleSelectUpcomingDeal}
        onSelectNotification={handleSelectNotification}
        onMarkAllAsRead={handleMarkAllNotificationsRead}
      />

      {/* Section Content */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-8">
        {activeSection === 'marketing' ? (
          <MarketingSection
            campaigns={campaigns}
            publications={publications}
            briefs={briefs}
            marketingTasks={marketingTasks}
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
        ) : activeSection === 'commercial' ? (
          <CommercialSection
            deals={deals}
            commercialTasks={commercialTasks}
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
            activities={salesActivities}
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
