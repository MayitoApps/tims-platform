'use client';

import React from 'react';
import { UserProfile } from '@/lib/types';

interface NavbarProps {
  currentUser: UserProfile;
  activeWorkspace: 'all' | 'marketing' | 'sales';
  onWorkspaceChange: (ws: 'all' | 'marketing' | 'sales') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Navbar({
  currentUser,
  activeWorkspace,
  onWorkspaceChange,
  searchQuery,
  onSearchChange,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 bg-[#faf9f6]/90 backdrop-blur-md hairline-b px-6 py-3.5 transition-colors">
      <div className="max-w-[1720px] mx-auto flex items-center justify-between gap-6">
        
        {/* Brand & Workspace Switcher */}
        <div className="flex items-center gap-7">
          <div className="flex items-baseline gap-2.5">
            <span className="font-editorial text-2xl font-semibold tracking-tight text-stone-900">
              TIMS
            </span>
            <span className="text-[10px] tracking-widest uppercase font-semibold text-stone-600 bg-stone-200/60 px-2 py-0.5 rounded-sm">
              Work OS
            </span>
          </div>

          <div className="hidden sm:flex items-center p-0.5 rounded-full bg-stone-200/50 hairline-all text-xs">
            <button
              onClick={() => onWorkspaceChange('all')}
              className={`px-3 py-1 rounded-full font-medium transition-all ${
                activeWorkspace === 'all'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              Vista Unificada
            </button>
            <button
              onClick={() => onWorkspaceChange('marketing')}
              className={`px-3 py-1 rounded-full font-medium transition-all ${
                activeWorkspace === 'marketing'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              Marketing Studio
            </button>
            <button
              onClick={() => onWorkspaceChange('sales')}
              className={`px-3 py-1 rounded-full font-medium transition-all ${
                activeWorkspace === 'sales'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              Comercial & Ventas
            </button>
          </div>
        </div>

        {/* Global Search */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar campañas, tratos, marcas o colaterales..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full text-xs bg-white hairline-all rounded-full py-2 pl-9 pr-8 text-stone-800 placeholder-stone-600 focus:outline-none focus:ring-1 focus:ring-stone-400 transition-all"
            />
            <span className="absolute left-3 top-2.5 text-stone-400">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            {searchQuery && (
              <button 
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-2 text-stone-400 hover:text-stone-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Realtime Status & User Session */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 hairline-all border-emerald-100 text-[11px] text-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 animate-pulse"></span>
            <span>Realtime DB Activo</span>
          </div>

          <div className="h-4 w-px bg-stone-300 hidden lg:block"></div>

          {/* User profile (Google OAuth visual indicator) */}
          <div className="flex items-center gap-2.5">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-medium text-stone-900">{currentUser.name}</div>
              <div className="text-[10px] text-stone-600 capitalize">{currentUser.role} Lead · Google Auth</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-semibold tracking-wider font-serif">
              {currentUser.initials}
            </div>
          </div>

        </div>

      </div>
    </header>
  );
}
