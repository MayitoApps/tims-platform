'use client';

import React from 'react';

export type ActiveView = 'tablas' | 'pipeline' | 'calendario' | 'briefs' | 'enablement' | 'dashboard';

interface ViewTabsProps {
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
  campaignsCount: number;
  leadsCount: number;
  assetsCount: number;
}

export function ViewTabs({
  activeView,
  onViewChange,
  campaignsCount,
  leadsCount,
  assetsCount
}: ViewTabsProps) {
  const tabs = [
    { id: 'tablas', label: 'Tabla Dinámica', badge: campaignsCount },
    { id: 'pipeline', label: 'Pipeline Comercial & Kanban', badge: leadsCount },
    { id: 'calendario', label: 'Calendario Editorial', badge: undefined },
    { id: 'briefs', label: 'Briefs de Estrategia', badge: undefined },
    { id: 'enablement', label: 'Sales Enablement Kit', badge: assetsCount },
    { id: 'dashboard', label: 'Dashboard Ejecutivo', badge: undefined }
  ] as const;

  return (
    <div className="bg-[#faf9f6] hairline-b px-6">
      <div className="max-w-[1720px] mx-auto flex items-center gap-1 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onViewChange(tab.id)}
              className={`group flex items-center gap-2 py-3 px-3.5 text-xs font-medium tracking-wide transition-all border-b-2 whitespace-nowrap ${
                isActive
                  ? 'border-stone-900 text-stone-950 font-semibold'
                  : 'border-transparent text-stone-600 hover:text-stone-900 hover:border-stone-300'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-sans transition-colors ${
                    isActive
                      ? 'bg-stone-900 text-stone-100'
                      : 'bg-stone-200/70 text-stone-700 group-hover:bg-stone-300'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
