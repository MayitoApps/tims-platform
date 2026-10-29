'use client';

import React from 'react';
import { UserProfile } from '@/lib/types';

interface NavbarProps {
  currentUser: UserProfile | null;
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
    <header className="sticky top-0 z-30 bg-[#faf9f6]/95 backdrop-blur-md hairline-b px-6 py-3.5 transition-colors">
      <div className="max-w-[1720px] mx-auto flex items-center justify-between gap-6">
        
        {/* Brand & Workspace Switcher */}
        <div className="flex items-center gap-7">
          <div className="flex items-baseline gap-2.5">
            <span className="font-editorial text-2xl font-semibold tracking-tight text-stone-900">
              TIMS
            </span>
            <span className="text-[10px] tracking-widest uppercase font-semibold text-stone-600 bg-stone-200/60 px-2 py-0.5 rounded-xs">
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

        {/* Realtime Status & User Session / Google Login */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 hairline-all border-emerald-100 text-[11px] text-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 animate-pulse"></span>
            <span>Realtime DB Activo</span>
          </div>

          <div className="h-4 w-px bg-stone-300 hidden lg:block"></div>

          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-medium text-stone-900">{currentUser.name}</div>
                <div className="text-[10px] text-stone-600">{currentUser.email}</div>
              </div>

              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full border border-stone-200 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-semibold tracking-wider font-serif">
                  {currentUser.initials}
                </div>
              )}

              <a
                href="/api/auth/logout"
                title="Cerrar sesión"
                className="text-[11px] text-stone-600 hover:text-stone-900 font-medium hairline-all px-2 py-1 rounded-md hover:bg-stone-100 transition-colors"
              >
                Salir
              </a>
            </div>
          ) : (
            <a
              href="/api/auth/google"
              className="flex items-center gap-2 bg-white hairline-all hover:bg-stone-50 text-stone-800 text-xs font-medium px-3.5 py-1.5 rounded-full transition-all shadow-2xs hover:shadow-xs"
            >
              <svg width="14" height="14" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Acceder con Google</span>
            </a>
          )}

        </div>

      </div>
    </header>
  );
}
