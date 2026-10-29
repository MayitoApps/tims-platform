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

  // Check Google Auth session on mount
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setCurrentUser(data.user);
          // Set section based on user role
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

  const handleLogout = async () => {
    setCurrentUser(null);
    try {
      await fetch('/api/auth/logout');
    } catch {}
    window.location.href = '/';
  };

  // -----------------------------------------------------------------
  // MARKETING ACTIONS
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
    setCampaigns((prev) => [created, ...prev]);
    showToast(`Campaña ${nextCode} registrada en base de datos`);
  };

  const handleUpdateCampaignStatus = (id: string, status: MarketingCampaignStatus) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c))
    );
    showToast('Estado de campaña actualizado en tiempo real');
  };

  const handleAddPublication = (newP: Omit<ContentPublication, 'id'>) => {
    const created: ContentPublication = {
      ...newP,
      id: `pub-${Date.now()}`
    };
    setPublications((prev) => [created, ...prev]);
    showToast('Publicación programada en el calendario de PR');
  };

  const handleAddBrief = (newB: Omit<CreativeBrief, 'id' | 'date'>) => {
    const created: CreativeBrief = {
      ...newB,
      id: `brf-${Date.now()}`,
      date: new Date().toISOString().split('T')[0]
    };
    setBriefs((prev) => [created, ...prev]);
    showToast('Brief creativo archivado en la biblioteca');
  };

  const handleAddMarketingTask = (newTask: Omit<MarketingTask, 'id' | 'code' | 'createdAt'>) => {
    const nextCode = `REQ-${String(marketingTasks.length + 1).padStart(2, '0')}`;
    const created: MarketingTask = {
      ...newTask,
      id: `mtask-${Date.now()}`,
      code: nextCode,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setMarketingTasks((prev) => [created, ...prev]);
    showToast(`Requerimiento de marketing ${nextCode} registrado en el tablero`);
  };

  const handleUpdateMarketingTaskStage = (id: string, stage: MarketingTaskStage) => {
    setMarketingTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, stage } : t))
    );
    showToast('Fase de requerimiento actualizada en el tablero');
  };

  // -----------------------------------------------------------------
  // COMERCIALIZACIÓN HOTELERA ACTIONS
  // -----------------------------------------------------------------
  const handleAddDeal = (newD: Omit<HotelDeal, 'id' | 'code' | 'createdAt'>) => {
    const nextCode = `RFP-${501 + deals.length}`;
    const created: HotelDeal = {
      ...newD,
      id: `deal-${Date.now()}`,
      code: nextCode,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setDeals((prev) => [created, ...prev]);
    showToast(`Cotización ${nextCode} ingresada al pipeline de ventas`);
  };

  const handleUpdateDealStage = (id: string, stage: HotelDealStage) => {
    setDeals((prev) =>
      prev.map((d) => (d.id === id ? { ...d, stage } : d))
    );
    showToast('Etapa de negociación actualizada en tiempo real');
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
            onUpdateCampaignStatus={handleUpdateCampaignStatus}
            onAddPublication={handleAddPublication}
            onAddBrief={handleAddBrief}
            onAddMarketingTask={handleAddMarketingTask}
            onUpdateMarketingTaskStage={handleUpdateMarketingTaskStage}
          />
        ) : (
          <CommercialSection
            deals={deals}
            currentUser={currentUser}
            onAddDeal={handleAddDeal}
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
