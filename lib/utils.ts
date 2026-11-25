import { MarketingCampaignStatus, HotelDealStage, DealCategory } from './types';

export function formatCurrency(amount: number, currency: 'MXN' | 'USD' = 'MXN'): string {
  const formatted = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0
  }).format(amount);
  return `${formatted} MXN`;
}

/** Formatea un valor numérico o cadena como cifra legible con comas y decimales (ej. "350,000.00"). */
export function formatMoneyInput(value: string | number, forceDecimals = false): string {
  const str = typeof value === 'number' ? (Number.isFinite(value) ? String(value) : '') : String(value ?? '');
  const cleaned = str.replace(/[^0-9.]/g, '');
  if (!cleaned) return forceDecimals ? '0.00' : '';
  const dotIndex = cleaned.indexOf('.');
  const rawInt = dotIndex >= 0 ? cleaned.slice(0, dotIndex) : cleaned;
  const rawDec = dotIndex >= 0 ? cleaned.slice(dotIndex + 1).replace(/\./g, '').slice(0, 2) : '';
  const intNormalized = rawInt.replace(/^0+(?=\d)/, '') || (dotIndex >= 0 ? '0' : '');
  const formattedInt = intNormalized.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (forceDecimals) {
    const num = parseFloat(`${intNormalized || '0'}.${rawDec || '0'}`) || 0;
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return dotIndex >= 0 ? `${formattedInt}.${rawDec}` : formattedInt;
}

/** Convierte una cifra con comas (ej. "350,000.50") a número. */
export function parseMoneyInput(value: string | number): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const cleaned = String(value ?? '').replace(/,/g, '').trim();
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? num : 0;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '—';
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

/**
 * Retorna la fecha local en formato estándar YYYY-MM-DD
 * evitando el salto de fecha a mañana provocado por UTC después de las 6:00 PM (hora centro México).
 */
export function getLocalDateStr(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// -------------------------------------------------------------
// COLORES PARA MARKETING & COMUNICACIÓN (Vibrantes & Profesionales)
// -------------------------------------------------------------
export function getMarketingStatusBadge(status: MarketingCampaignStatus): {
  label: string;
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (status) {
    case 'planificacion':
      return {
        label: 'Planificación',
        bg: 'bg-indigo-50/80',
        text: 'text-indigo-700',
        border: 'border-indigo-200',
        dot: 'bg-indigo-500'
      };
    case 'en_produccion':
      return {
        label: 'En Producción',
        bg: 'bg-blue-50/80',
        text: 'text-blue-700',
        border: 'border-blue-200',
        dot: 'bg-blue-500'
      };
    case 'revision':
      return {
        label: 'En Revisión',
        bg: 'bg-amber-50/80',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-500'
      };
    case 'activa':
      return {
        label: 'Activa en Pauta',
        bg: 'bg-emerald-50/80',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500'
      };
    case 'finalizada':
      return {
        label: 'Finalizada',
        bg: 'bg-slate-100',
        text: 'text-slate-600',
        border: 'border-slate-200',
        dot: 'bg-slate-400'
      };
    default:
      return {
        label: status,
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-200',
        dot: 'bg-gray-400'
      };
  }
}

// -------------------------------------------------------------
// COLORES PARA COMERCIALIZACIÓN HOTELERA (Lujo & Ventas)
// -------------------------------------------------------------
export function getHotelDealStageBadge(stage: HotelDealStage): {
  label: string;
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (stage) {
    case 'rfp_recibido':
      return {
        label: 'RFP / Solicitud Recibida',
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        dot: 'bg-purple-600'
      };
    case 'propuesta_enviada':
      return {
        label: 'Cotización Enviada',
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        dot: 'bg-blue-600'
      };
    case 'negociacion':
      return {
        label: 'En Negociación',
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-300',
        dot: 'bg-amber-500'
      };
    case 'contratado':
      return {
        label: 'Contrato Firmado (Ganado)',
        bg: 'bg-emerald-50',
        text: 'text-emerald-800',
        border: 'border-emerald-300',
        dot: 'bg-emerald-600'
      };
    case 'perdido':
      return {
        label: 'No Concretado',
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        dot: 'bg-rose-500'
      };
    default:
      return {
        label: stage,
        bg: 'bg-stone-100',
        text: 'text-stone-700',
        border: 'border-stone-200',
        dot: 'bg-stone-400'
      };
  }
}

export function getDealCategoryLabel(category: DealCategory | string): { label: string; badge: string } {
  switch (category) {
    case 'empresarial':
    case 'grupos_convenciones':
    case 'cuentas_empresariales':
      return { label: 'Empresarial', badge: 'bg-indigo-50 text-indigo-800 border-indigo-200' };
    case 'otam':
      return { label: 'OTAM', badge: 'bg-cyan-50 text-cyan-800 border-cyan-200' };
    case 'social':
    case 'bodas_sociales':
      return { label: 'Social', badge: 'bg-rose-50 text-rose-800 border-rose-200' };
    case 'individual':
    case 'agencias_viaje':
      return { label: 'Individual', badge: 'bg-amber-50 text-amber-800 border-amber-200' };
    default:
      return { label: category || 'Social', badge: 'bg-stone-100 text-stone-700 border-stone-200' };
  }
}

/**
 * Calcula el porcentaje de avance respecto a una meta (tanto valor exacto como acotado para barras).
 */
export function calculateProgressPercent(
  actual: number,
  target: number
): { raw: number; capped: number; rounded: number; formatted: string } {
  if (!target || target <= 0) {
    return { raw: 0, capped: 0, rounded: 0, formatted: '0.0%' };
  }
  const safeActual = Math.max(0, Number(actual) || 0);
  const raw = (safeActual / target) * 100;
  const capped = Math.min(100, raw);
  const rounded = Math.round(raw);
  const formatted = `${raw.toFixed(1)}%`;
  return { raw, capped, rounded, formatted };
}

/**
 * Lee una pestaña o sección persistida desde el hash de la URL (#seccion/subtab)
 * o localStorage para conservar la ubicación actual al actualizar el navegador.
 */
export function readPersistedNavValue<T extends string>(
  storageKey: string,
  validValues: readonly T[],
  fallback: T,
  hashPartIndex?: 0 | 1,
  expectedHashSection?: 'marketing' | 'commercial' | 'sales'
): T {
  if (typeof window === 'undefined') return fallback;
  try {
    if (hashPartIndex !== undefined && window.location.hash) {
      const cleanHash = window.location.hash.replace(/^#/, '');
      const parts = cleanHash.split('/');
      const hashSectionMatches = !expectedHashSection || parts[0] === expectedHashSection;
      if (hashSectionMatches) {
        const candidate = parts[hashPartIndex] as T | undefined;
        if (candidate && validValues.includes(candidate)) {
          return candidate;
        }
      }
    }
    const stored = window.localStorage.getItem(storageKey) as T | null;
    if (stored && validValues.includes(stored)) {
      return stored;
    }
  } catch {}
  return fallback;
}

/**
 * Persiste la sección/subpestaña activa en localStorage y actualiza el hash de la URL sin recargar.
 */
export function writePersistedNavValue(
  storageKey: string,
  value: string,
  hashSection: 'marketing' | 'commercial' | 'sales',
  hashSubView?: string
): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey, value);
    const nextHash = hashSubView ? `#${hashSection}/${hashSubView}` : `#${hashSection}`;
    if (window.location.hash !== nextHash) {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${nextHash}`);
    }
  } catch {}
}

/**
 * Limpia las pestañas persistidas al cerrar sesión.
 */
export function clearPersistedNavValues(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem('tims_active_section');
    window.localStorage.removeItem('tims_commercial_subview');
    window.localStorage.removeItem('tims_marketing_subview');
    window.localStorage.removeItem('tims_sales_tab');
  } catch {}
}

/**
 * Sanitiza URLs externas provistas por usuarios para prevenir ejecución de código malicioso
 * (p. ej. pseudo-protocolos javascript: o data:). Solo permite https://, http://, mailto:, tel: o rutas relativas /.
 */
export function safeExternalUrl(url?: string | null): string {
  if (!url) return '#';
  const trimmed = url.trim();
  if (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('tel:')
  ) {
    return trimmed;
  }
  // Si no tiene protocolo pero parece un dominio web (ej. drive.google.com/...)
  if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return '#';
}
