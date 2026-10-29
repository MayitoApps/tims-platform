'use client';

import React, { useState, useEffect } from 'react';
import { AuthGate } from '@/components/AuthGate';
import { Navbar } from '@/components/Navbar';
import { MarketingSection } from '@/components/marketing/MarketingSection';
import { CommercialSection } from '@/components/commercial/CommercialSection';

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
  MarketingCampaignStatus,
  HotelDealStage,
  MarketingTaskStage
} from '@/lib/types';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [activeSection, setActiveSection] = useState<'marketing' | 'commercial'>('marketing');

  // Real data state
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>(INITIAL_CAMPAIGNS);
  const [publications, setPublications] = useState<ContentPublication[]>(INITIAL_PUBLICATIONS);
  const [briefs, setBriefs] = useState<CreativeBrief[]>(INITIAL_BRIEFS);
  const [deals, setDeals] = useState<HotelDeal[]>(INITIAL_DEALS);
  const [marketingTasks, setMarketingTasks] = useState<MarketingTask[]>(INITIAL_MARKETING_TASKS);

  // Live Toast Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Check Google Auth session on mount & Sync with Database
  useEffect(() => {
    // 1. Initial hydration from local storage for instant render
    try {
      const cachedDeals = localStorage.getItem('tims_deals');
      if (cachedDeals) {
        const parsed = JSON.parse(cachedDeals);
        if (Array.isArray(parsed) && parsed.length > 0) setDeals(parsed);
      }
      const cachedTasks = localStorage.getItem('tims_mkt_tasks');
      if (cachedTasks) {
        const parsed = JSON.parse(cachedTasks);
        if (Array.isArray(parsed) && parsed.length > 0) setMarketingTasks(parsed);
      }
      const cachedCampaigns = localStorage.getItem('tims_campaigns');
      if (cachedCampaigns) {
        const parsed = JSON.parse(cachedCampaigns);
        if (Array.isArray(parsed) && parsed.length > 0) setCampaigns(parsed);
      }
      const cachedPubs = localStorage.getItem('tims_publications');
      if (cachedPubs) {
        const parsed = JSON.parse(cachedPubs);
        if (Array.isArray(parsed) && parsed.length > 0) setPublications(parsed);
      }
      const cachedBriefs = localStorage.getItem('tims_briefs');
      if (cachedBriefs) {
        const parsed = JSON.parse(cachedBriefs);
        if (Array.isArray(parsed) && parsed.length > 0) setBriefs(parsed);
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

    // 3. Sync Deals from Postgres Database
    fetch('/api/deals')
      .then((res) => res.json())
      .then((data) => {
        if (data?.deals && Array.isArray(data.deals) && data.deals.length > 0) {
          setDeals(data.deals);
          try {
            localStorage.setItem('tims_deals', JSON.stringify(data.deals));
          } catch {}
        }
      })
      .catch((err) => console.error('Error fetching deals from DB:', err));

    // 4. Sync Marketing Tasks from Postgres Database
    fetch('/api/marketing-tasks')
      .then((res) => res.json())
      .then((data) => {
        if (data?.tasks && Array.isArray(data.tasks) && data.tasks.length > 0) {
          setMarketingTasks(data.tasks);
          try {
            localStorage.setItem('tims_mkt_tasks', JSON.stringify(data.tasks));
          } catch {}
        }
      })
      .catch((err) => console.error('Error fetching marketing tasks from DB:', err));
  }, []);

  const handleLogout = async () => {
    setCurrentUser(null);
    try {
      await fetch('/api/auth/logout');
    } catch {}
    window.location.href = '/';
  };

  // -----------------------------------------------------------------
  // MARKETING ACTIONS (WITH DB PERSISTENCE)
  // -----------------------------------------------------------------
  const handleAddCampaign = (
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
    showToast(`Campaña ${nextCode} guardada exitosamente`);
  };

  const handleUpdateCampaign = (updated: MarketingCampaign) => {
    const nextList = campaigns.map((c) => (c.id === updated.id ? updated : c));
    setCampaigns(nextList);
    try { localStorage.setItem('tims_campaigns', JSON.stringify(nextList)); } catch {}
    showToast(`Campaña ${updated.code} actualizada`);
  };

  const handleDeleteCampaign = (id: string) => {
    const nextList = campaigns.filter((c) => c.id !== id);
    setCampaigns(nextList);
    try { localStorage.setItem('tims_campaigns', JSON.stringify(nextList)); } catch {}
    showToast('Campaña eliminada correctamente');
  };

  const handleUpdateCampaignStatus = (id: string, status: MarketingCampaignStatus) => {
    const nextList = campaigns.map((c) => (c.id === id ? { ...c, status } : c));
    setCampaigns(nextList);
    try { localStorage.setItem('tims_campaigns', JSON.stringify(nextList)); } catch {}
    showToast('Estado de campaña actualizado en tiempo real');
  };

  const handleAddPublication = (newP: Omit<ContentPublication, 'id'>) => {
    const created: ContentPublication = {
      ...newP,
      id: `pub-${Date.now()}`
    };
    const nextList = [created, ...publications];
    setPublications(nextList);
    try { localStorage.setItem('tims_publications', JSON.stringify(nextList)); } catch {}
    showToast('Publicación programada en el calendario de PR');
  };

  const handleUpdatePublication = (updated: ContentPublication) => {
    const nextList = publications.map((p) => (p.id === updated.id ? updated : p));
    setPublications(nextList);
    try { localStorage.setItem('tims_publications', JSON.stringify(nextList)); } catch {}
    showToast('Publicación actualizada correctamente');
  };

  const handleDeletePublication = (id: string) => {
    const nextList = publications.filter((p) => p.id !== id);
    setPublications(nextList);
    try { localStorage.setItem('tims_publications', JSON.stringify(nextList)); } catch {}
    showToast('Publicación eliminada correctamente');
  };

  const handleAddBrief = (newB: Omit<CreativeBrief, 'id' | 'date'>) => {
    const created: CreativeBrief = {
      ...newB,
      id: `brf-${Date.now()}`,
      date: new Date().toISOString().split('T')[0]
    };
    const nextList = [created, ...briefs];
    setBriefs(nextList);
    try { localStorage.setItem('tims_briefs', JSON.stringify(nextList)); } catch {}
    showToast('Brief creativo archivado en la biblioteca');
  };

  const handleUpdateBrief = (updated: CreativeBrief) => {
    const nextList = briefs.map((b) => (b.id === updated.id ? updated : b));
    setBriefs(nextList);
    try { localStorage.setItem('tims_briefs', JSON.stringify(nextList)); } catch {}
    showToast('Brief creativo actualizado');
  };

  const handleDeleteBrief = (id: string) => {
    const nextList = briefs.filter((b) => b.id !== id);
    setBriefs(nextList);
    try { localStorage.setItem('tims_briefs', JSON.stringify(nextList)); } catch {}
    showToast('Brief eliminado de la biblioteca');
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
      />

      {/* Section Content */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-8">
        {activeSection === 'marketing' ? (
          <MarketingSection
            campaigns={campaigns}
            publications={publications}
            briefs={briefs}
            marketingTasks={marketingTasks}
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
          />
        ) : (
          <CommercialSection
            deals={deals}
            currentUser={currentUser}
            onAddDeal={handleAddDeal}
            onUpdateDeal={handleUpdateDeal}
            onDeleteDeal={handleDeleteDeal}
            onUpdateDealStage={handleUpdateDealStage}
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
