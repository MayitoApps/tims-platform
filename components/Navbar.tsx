'use client';

import React from 'react';
import { UserProfile } from '@/lib/types';

interface NavbarProps {
  currentUser: UserProfile;
  activeSection: 'marketing' | 'commercial';
  onSectionChange: (section: 'marketing' | 'commercial') => void;
  onLogout: () => void;
}

export function Navbar({
  currentUser,
  activeSection,
  onSectionChange,
  onLogout
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-stone-200 px-4 sm:px-8 py-3 transition-colors shadow-2xs">
      <div className="max-w-[1720px] mx-auto flex items-center justify-between gap-4">
        
        {/* Brand & Section Switcher */}
        <div className="flex items-center gap-4 sm:gap-8">
          <div className="flex items-center gap-2">
            <span className="font-editorial text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              TIMS
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full hidden sm:inline-block">
              Hospitality Group
            </span>
          </div>

          {/* Master 2-Section Switcher (Marketing vs Comercialización) */}
          <div className="flex items-center p-1 rounded-xl bg-stone-100 border border-stone-200 text-xs font-semibold">
            <button
              onClick={() => onSectionChange('marketing')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg transition-all ${
                activeSection === 'marketing'
                  ? 'bg-linear-to-r from-rose-600 to-indigo-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>🎨 Marketing & Comunicación</span>
            </button>
            <button
              onClick={() => onSectionChange('commercial')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg transition-all ${
                activeSection === 'commercial'
                  ? 'bg-linear-to-r from-emerald-700 to-teal-800 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>🏨 Comercialización</span>
            </button>
          </div>
        </div>

        {/* Realtime DB status & User Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            <span>Neon Realtime Activo</span>
          </div>

          <div className="h-5 w-px bg-stone-200 hidden sm:block" />

          {/* Logged in User Pill */}
          <div className="flex items-center gap-2.5">
            <div className="text-right hidden md:block">
              <div className="text-xs font-bold text-stone-900">{currentUser.name}</div>
              <div className="text-[10px] text-stone-500 truncate max-w-[160px]">{currentUser.email}</div>
            </div>

            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full border border-stone-300 object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-slate-900 to-stone-700 text-white flex items-center justify-center text-xs font-bold font-serif shadow-xs">
                {currentUser.initials}
              </div>
            )}

            <button
              onClick={onLogout}
              title="Cerrar Sesión"
              className="text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-lg transition-colors"
            >
              Salir
            </button>
          </div>

        </div>

      </div>
    </header>
  );
}
