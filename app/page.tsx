'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { ViewTabs, ActiveView } from '@/components/ViewTabs';
import { CampaignTable } from '@/components/CampaignTable';
import { PipelineKanban } from '@/components/PipelineKanban';
import { EditorialCalendar } from '@/components/EditorialCalendar';
import { BriefEditor } from '@/components/BriefEditor';
import { SalesEnablementHub } from '@/components/SalesEnablementHub';
import { ExecutiveDashboard } from '@/components/ExecutiveDashboard';

import {
  INITIAL_CAMPAIGNS,
  INITIAL_LEADS,
  INITIAL_ASSETS,
  INITIAL_BRIEF,
  TEAM_MEMBERS
} from '@/lib/initial-data';
import { Campaign, SalesLead, SalesAsset, BriefDoc, CampaignStatus, LeadStage, UserProfile } from '@/lib/types';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(TEAM_MEMBERS.elena);
  const [activeWorkspace, setActiveWorkspace] = useState<'all' | 'marketing' | 'sales'>('all');
  const [activeView, setActiveView] = useState<ActiveView>('tablas');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch real Google Auth session
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  // Domain state
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [leads, setLeads] = useState<SalesLead[]>(INITIAL_LEADS);
  const [assets, setAssets] = useState<SalesAsset[]>(INITIAL_ASSETS);
  const [brief, setBrief] = useState<BriefDoc>(INITIAL_BRIEF);

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Switch workspace behavior
  const handleWorkspaceChange = (ws: 'all' | 'marketing' | 'sales') => {
    setActiveWorkspace(ws);
    if (ws === 'marketing' && (activeView === 'pipeline' || activeView === 'enablement')) {
      setActiveView('tablas');
    } else if (ws === 'sales' && (activeView === 'tablas' || activeView === 'briefs')) {
      setActiveView('pipeline');
    }
  };

  // Campaign Handlers
  const handleUpdateCampaignStatus = (campaignId: string, newStatus: CampaignStatus) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === campaignId ? { ...c, status: newStatus } : c))
    );
    showToast('Estado de campaña actualizado en tiempo real');
  };

  const handleAddCampaign = (
    newCamp: Omit<Campaign, 'id' | 'code' | 'tasksCount' | 'completedTasksCount' | 'leadsGenerated'>
  ) => {
    const nextCode = `CMP-0${campaigns.length + 1}`;
    const created: Campaign = {
      ...newCamp,
      id: `cmp-${Date.now()}`,
      code: nextCode,
      tasksCount: 1,
      completedTasksCount: 0,
      leadsGenerated: 0
    };
    setCampaigns((prev) => [created, ...prev]);
    showToast(`Campaña ${nextCode} registrada en base de datos`);
  };

  // Lead Handlers
  const handleUpdateLeadStage = (leadId: string, newStage: LeadStage) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, stage: newStage } : l))
    );
    showToast('Etapa de prospecto actualizada en el pipeline');
  };

  const handleAddLead = (newLead: Omit<SalesLead, 'id' | 'code'>) => {
    const nextCode = `LD-${100 + leads.length + 1}`;
    const created: SalesLead = {
      ...newLead,
      id: `led-${Date.now()}`,
      code: nextCode
    };
    setLeads((prev) => [created, ...prev]);
    showToast(`Prospecto ${nextCode} asignado al pipeline de Ventas`);
  };

  // Asset Request from Sales to Marketing
  const handleRequestMaterial = (title: string, category: string, description: string) => {
    const newAsset: SalesAsset = {
      id: `ast-${Date.now()}`,
      title,
      category: category as any,
      platform: 'drive',
      url: 'https://drive.google.com/drive/folders/solicitudes-ventas',
      description: `[Solicitado por Comercial]: ${description}`,
      updatedAt: new Date().toISOString().split('T')[0],
      version: 'v0.1 Draft',
      author: 'Equipo Comercial (En Diseño por Mkt)'
    };
    setAssets((prev) => [newAsset, ...prev]);
    showToast('Solicitud enviada a Marketing: Se creó el activo en revisión');
  };

  // Save brief
  const handleSaveBrief = (updatedBrief: BriefDoc) => {
    setBrief(updatedBrief);
    showToast('Brief de estrategia sincronizado');
  };

  // Filtered lists based on search
  const filteredCampaigns = useMemo(() => {
    if (!searchQuery.trim()) return campaigns;
    const q = searchQuery.toLowerCase();
    return campaigns.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [campaigns, searchQuery]);

  const filteredLeads = useMemo(() => {
    if (!searchQuery.trim()) return leads;
    const q = searchQuery.toLowerCase();
    return leads.filter(
      (l) =>
        l.contactName.toLowerCase().includes(q) ||
        l.company.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q)
    );
  }, [leads, searchQuery]);

  const filteredAssets = useMemo(() => {
    if (!searchQuery.trim()) return assets;
    const q = searchQuery.toLowerCase();
    return assets.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q)
    );
  }, [assets, searchQuery]);

  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-900 flex flex-col selection:bg-stone-200">
      {/* Realtime Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-stone-100 text-xs px-4 py-2.5 rounded-md shadow-lg border border-stone-700 flex items-center gap-2.5 transition-all">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar */}
      <Navbar
        currentUser={currentUser}
        activeWorkspace={activeWorkspace}
        onWorkspaceChange={handleWorkspaceChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Navigation Sub-Tabs */}
      <ViewTabs
        activeView={activeView}
        onViewChange={setActiveView}
        campaignsCount={campaigns.length}
        leadsCount={leads.length}
        assetsCount={assets.length}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-6 py-6">
        {activeView === 'tablas' && (
          <CampaignTable
            campaigns={filteredCampaigns}
            onUpdateStatus={handleUpdateCampaignStatus}
            onAddCampaign={handleAddCampaign}
          />
        )}

        {activeView === 'pipeline' && (
          <PipelineKanban
            leads={filteredLeads}
            onUpdateLeadStage={handleUpdateLeadStage}
            onAddLead={handleAddLead}
          />
        )}

        {activeView === 'calendario' && (
          <EditorialCalendar campaigns={campaigns} leads={leads} />
        )}

        {activeView === 'briefs' && (
          <BriefEditor
            brief={brief}
            campaigns={campaigns}
            onSaveBrief={handleSaveBrief}
          />
        )}

        {activeView === 'enablement' && (
          <SalesEnablementHub
            assets={filteredAssets}
            onRequestMaterial={handleRequestMaterial}
          />
        )}

        {activeView === 'dashboard' && (
          <ExecutiveDashboard campaigns={campaigns} leads={leads} />
        )}
      </main>

      {/* Editorial Footer */}
      <footer className="hairline-t bg-[#faf9f6] py-5 px-6 text-stone-600 text-xs">
        <div className="max-w-[1720px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 font-sans">
          <div className="flex items-center gap-2">
            <span className="font-editorial text-stone-800 font-semibold text-sm">TIMS</span>
            <span>· Plataforma Editorial de Gestión Integrada para Marketing y Ventas</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-stone-600">
            <span>Conexión Vercel & Supabase Realtime</span>
            <span>·</span>
            <span>Google Workspace OAuth</span>
            <span>·</span>
            <span>Edición 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
