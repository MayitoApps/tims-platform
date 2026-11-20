'use client';

import React, { useState } from 'react';

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  unauthorized_email:
    'Tu cuenta de Google no está dada de alta en TIMS. Solicita a un administrador que registre tu correo en el directorio.',
  csrf_validation_failed:
    'La validación de seguridad de Google expiró. Por favor intenta entrar nuevamente.',
  token_exchange_failed:
    'No se pudo validar el acceso con Google. Intenta de nuevo en unos segundos.',
  userinfo_failed:
    'No se pudo obtener tu perfil de Google. Intenta nuevamente.',
  missing_credentials:
    'Faltan las credenciales de Google OAuth en la configuración del servidor.'
};

export function AuthGate() {
  const [authError] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    const code = params.get('auth_error');
    if (!code) return null;
    return AUTH_ERROR_MESSAGES[code] || `No se pudo iniciar sesión (${code}). Intenta nuevamente.`;
  });

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-stone-950 text-white flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden font-sans">
      {/* Decorative background glow with rich hospitality colors */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[550px] h-[550px] bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[40%] right-[20%] w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Bar */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <span className="font-editorial text-3xl font-bold tracking-tight text-white">
            TIMS
          </span>
          <span className="h-4 w-px bg-white/20" />
          <span className="text-xs uppercase tracking-widest text-amber-300/90 font-medium">
            Hospitality Group OS
          </span>
        </div>
        <div className="text-[11px] text-stone-400 font-mono hidden sm:block">
          Grupo Hotelero
        </div>
      </div>

      {/* Center Auth Card */}
      <div className="max-w-md w-full mx-auto my-auto z-10 pt-8 pb-12">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 sm:p-10 shadow-2xl space-y-7">
          
          <div className="space-y-2 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-linear-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 border border-white/10 text-xs text-amber-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Acceso Colaboradores</span>
            </div>
            <h1 className="font-editorial text-3xl sm:text-4xl font-semibold text-white tracking-tight pt-2">
              Bienvenido a TIMS
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-sm mx-auto">
              <span className="text-rose-300 font-medium">Marketing</span>, <span className="text-emerald-300 font-medium">Comercialización</span> y <span className="text-blue-300 font-medium">Ventas</span>.
            </p>
          </div>

          <div className="space-y-4">
            {authError && (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-400/40 text-rose-200 text-xs leading-relaxed text-center font-medium">
                ⚠️ {authError}
              </div>
            )}

            {/* Primary Google OAuth Button */}
            <a
              href="/api/auth/google"
              className="w-full py-3.5 px-5 rounded-xl bg-white text-slate-900 font-medium text-sm flex items-center justify-center gap-3 hover:bg-stone-100 transition-all shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
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
              <span className="font-semibold">Entrar con Google</span>
            </a>
          </div>

          <div className="pt-2 text-center border-t border-white/5">
            <p className="text-[11px] text-stone-400">
              Usa tu correo autorizado de Google.
            </p>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400 z-10">
        <div>© 2026 TIMS Hospitality</div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>Neon Realtime DB</span>
          <span>·</span>
          <span>Vercel Cloud</span>
          <span>·</span>
          <span>Google OAuth 2.0</span>
        </div>
      </div>
    </div>
  );
}
